/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "views/map_controls",
    "async!http://maps.google.com/maps/api/js?sensor=false"
], function($, _, Backbone, allVehicleCollection, mapControlsView) {
    "use strict";

    var MapView = Backbone.View.extend({
        initialize: function () {

        },
        render: function() {
            var options = {
                zoom: 13,
                center: new google.maps.LatLng(55.9531, -3.1889),
                mapTypeControl: false
            };

            this.googleMap = new google.maps.Map($("#map-container")[0], options);
        }
    });

    return new MapView();
});