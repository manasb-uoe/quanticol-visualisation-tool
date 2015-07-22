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
        initialize: function () {
            this.modesEnum = {
                LIVE: "live",
                NONLIVE: "nonlive",
                SIMULATED: "simulated"
            };
        },
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
            var self = this;

            switch (mode) {
                case this.modesEnum.NONLIVE:
                    $.get(
                        "/api/vehicles/all",
                        {
                            service: options.selectedServices,
                            vehicle: options.selectedVehicles,
                            startTime: options.startTime,
                            endTime: options.endTime
                        },
                        function (response) {
                            if (response.status == 200) {
                                self.reset(response.vehicles, {silent: !(options.reset)});
                            } else {
                                self.trigger("error", response.error);
                            }
                        }
                    );

                    break;

                case this.modesEnum.LIVE:
                    $.get(
                        "/api/vehicles/live",
                        {
                            service: options.selectedServices,
                            vehicle: options.selectedVehicles
                        },
                        function (response) {
                            if (response.status == 200) {
                                // append newly fetched live vehicles to existing ones
                                self.add(response.vehicles);

                                if (options.reset) {
                                    self.trigger("reset");
                                }
                            } else {
                                self.trigger("error", response.error);
                            }
                        }
                    );

                    break;

                case this.modesEnum.SIMULATED:
                    var formData = new FormData();
                    formData.append("simulated_data_file", options.file);

                    $.ajax({
                        url: "/api/vehicles/simulated",
                        method: "POST",
                        data: formData,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: function (response) {
                            if (response.status == 200) {
                                self.reset(response.vehicles, {silent: !(options.reset)});
                            } else {
                                self.trigger("error", response.error);
                            }
                        }
                    });
                    break;

                default:
                    throw new Error("mode can only be: " + Object.keys(this.modesEnum));
                    break;
            }
        }
    });

    return new MapVehicleCollection();
});