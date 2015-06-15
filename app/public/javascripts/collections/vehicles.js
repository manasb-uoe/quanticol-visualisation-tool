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
        url: "/api/vehicles",
        getSelected: function () {
            return this.filter(function (vehicle) {
                return vehicle.get("isSelected");
            });
        }
    });

    return new VehicleCollection();
});