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
        url: "/api/vehicles/all",
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
        }
    });

    return new MapVehicleCollection();
});