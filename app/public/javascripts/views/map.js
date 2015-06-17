/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "swig",
    "text!../../templates/map_controls.html",
    "async!http://maps.google.com/maps/api/js?sensor=false"
], function($, _, Backbone, allVehicleCollection, swig, mapControlsTemplate) {
    "use strict";

    var MapView = Backbone.View.extend({
        initialize: function () {
            this.markers = [];
        },
        render: function() {
            this.renderMap();
            this.renderMapControls();
        },
        renderMap: function () {
            var options = {
                zoom: 13,
                center: new google.maps.LatLng(55.9531, -3.1889),
                mapTypeControl: false
            };

            this.googleMap = new google.maps.Map($("#map-container")[0], options);
        },
        addInitialMarkers: function () {
            var self = this;

            var vehiclesGrouped = allVehicleCollection.groupBy(function (vehicle) {
                return vehicle.get("vehicle_id");
            });

            Object.keys(vehiclesGrouped).forEach(function (key) {
                var firstVehicle = vehiclesGrouped[key][0];

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(firstVehicle.get("location")[1], firstVehicle.get("location")[0]),
                    map: self.googleMap,
                    icon: new google.maps.MarkerImage("http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png")
                });

                marker.infoWindow = new google.maps.InfoWindow({
                    content: "Vehicle ID: " + firstVehicle.get("vehicle_id")
                });

                marker.infoWindow.isOpen = false;

                marker.infoWindow.toggle = function () {
                    if (marker.infoWindow.isOpen) {
                        marker.infoWindow.close(self.googleMap, marker);
                        marker.infoWindow.isOpen = false;
                    } else {
                        marker.infoWindow.open(self.googleMap, marker);
                        marker.infoWindow.isOpen = true;
                    }
                };

                google.maps.event.addListener(marker, "click", function () {
                    marker.infoWindow.toggle();
                });

                marker.setMap(self.googleMap);

                self.markers.push(marker);
            });
        },
        clearMarkers: function () {
            this.markers.forEach(function (marker) {
                marker.setMap(null);
            });

            this.markers = [];
        },
        renderMapControls: function () {
            this.$mapControls = $("#map-controls-container");
            this.areControlsVisible = false;

            var compiletedTemplate = swig.render(mapControlsTemplate);
            this.$mapControls.html(compiletedTemplate);
        },
        showMapControls: function() {
            if (this.areControlsVisible) return;

            this.$mapControls.animate({
                marginBottom: "0"
            }, 300);
            this.areControlsVisible = true;
        },
        hideMapControls: function () {
            if (!this.areControlsVisible) return;

            this.$mapControls.animate({
                marginBottom: "-200px"
            }, 300);
            this.areControlsVisible = false;
        },
        setup: function () {
            this.clearMarkers();
            this.addInitialMarkers();
            this.showMapControls();
        },
        reset: function () {
            this.clearMarkers();
            this.hideMapControls();
        }
    });

    return new MapView();
});