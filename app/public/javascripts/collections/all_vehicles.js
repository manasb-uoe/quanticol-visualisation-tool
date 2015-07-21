/**
 * Created by ManasB on 6/16/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "models/vehicle"
], function($, _, Backbone, VehicleModel){
    "use strict";

    var MapVehicleCollection = Backbone.Collection.extend({
        model: VehicleModel,
        getTimeSpan: function () {
            var minObject = this.min(function (vehicle) {
                return vehicle.get("last_gps_fix");
            });
            var maxObject = this.max(function (vehicle) {
                return vehicle.get("last_gps_fix");
            });

            return {
                startTime: minObject.get("last_gps_fix"),
                endTime: maxObject.get("last_gps_fix")
            };
        },
        fetch: function (mode, options) {
            switch (mode) {
                case "nonlive":
                    this.url = "/api/vehicles/all";

                    options.data = $.param({
                        service: options.selectedServices,
                        vehicle: options.selectedVehicles,
                        startTime: options.startTime,
                        endTime: options.endTime
                    });

                    Backbone.Collection.prototype.fetch.call(this, options);

                    break;

                case "live":
                    this.url = "/api/vehicles/live";

                    var self = this;
                    $.get(
                        this.url,
                        {service: options.selectedServices, vehicle: options.selectedVehicles},
                        function (vehicles) {
                            // append newly fetched live vehicles to existing ones
                            self.add(vehicles);
                            console.log("got new data");

                            if (options.reset) {
                                self.trigger("reset");
                            }
                        }
                    );
                    break;

                case "simulated":
                    this.url = "/api/vehicles/simulated";

                    var formData = new FormData();
                    formData.append("simulated_data_file", options.file);

                    $.ajax({
                        url: this.url,
                        method: "POST",
                        data: formData,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: function (vehicles) {
                            self.reset(vehicles, {silent: !options.reset});
                        }
                    });
                    break;

                default:
                    throw new Error("mode can only be 'nonlive' or 'live'");
                    break;
            }
        }
    });

    return new MapVehicleCollection();
});