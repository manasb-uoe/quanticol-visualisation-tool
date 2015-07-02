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
        getAllSelectedIDs: function () {
            var selectedIDs = [];
            var selected = this.filter(function (vehicle) {
                return vehicle.get("isSelected");
            });

            for (var i=0; i<selected.length; i++) {
                selectedIDs.push(selected[i].get("vehicle_id"));
            }

            return selectedIDs;
        },
        getSelectedSearchResultsCount: function () {
            return this.filter(function (vehicle) {
                return vehicle.get("isSelected") && vehicle.get("isMatchingSearchTerm");
            }).length;
        },
        search: function (term) {
            term = term.trim().toLowerCase();

            var doServicesMatch = function (vehicle, term) {
                var output = false;
                vehicle.get("services").forEach(function (serviceName) {
                    console.log(output);
                    output = output || (serviceName.toLowerCase().indexOf(term) == 0);
                });

                return output;
            };

            this.each(function (vehicle) {
                if (term.length == 0) {
                    vehicle.set("isMatchingSearchTerm", true);
                } else {
                    if (vehicle.get("vehicle_id").toLowerCase().indexOf(term) == 0 || doServicesMatch(vehicle, term)) {
                        vehicle.set("isMatchingSearchTerm", true);
                    } else {
                        vehicle.set("isMatchingSearchTerm", false);
                    }
                }
            });

            this.trigger("reset");
        },
        getSearchResultsCount: function () {
            return this.countBy(function (vehicle) {
                return vehicle.get("isMatchingSearchTerm");
            }).true;
        }
    });

    return new VehicleCollection();
});