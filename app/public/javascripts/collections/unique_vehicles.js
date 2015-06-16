/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "models/vehicle"
], function($, _, Backbone, VehicleModel){
    "use strict";

    var VehicleCollection = Backbone.Collection.extend({
        model: VehicleModel,
        url: "/api/vehicles/unique",
        getSelectedIDs: function () {
            var selectedIDs = [];
            var selected = this.filter(function (vehicle) {
                return vehicle.get("isSelected");
            });

            for (var i=0; i<selected.length; i++) {
                selectedIDs.push(selected[i].get("vehicle_id"));
            }

            return selectedIDs;
        }
    });

    return new VehicleCollection();
});