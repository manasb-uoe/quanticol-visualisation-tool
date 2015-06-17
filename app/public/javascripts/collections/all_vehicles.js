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
        getGrouped: function () {
            var uniqueIDs = [];
            this.each(function (vehicle) {
                var id = vehicle.get("vehicle_id");
                if (uniqueIDs.indexOf(id) == -1) {
                    uniqueIDs.push(id);
                }
            });

            var grouped = {};
            var self = this;
            uniqueIDs.forEach(function (id) {
                grouped[id] = self.filter(function (vehicle) {
                    return id == vehicle.get("vehicle_id");
                });
            });

            return grouped;
        }
    });

    return new MapVehicleCollection();
});