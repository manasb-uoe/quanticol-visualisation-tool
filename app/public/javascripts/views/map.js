/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "moment",
    "async!http://maps.google.com/maps/api/js?sensor=false"
], function($, _, Backbone, allVehicleCollection, moment) {
    "use strict";

    var MapView = Backbone.View.extend({
        initialize: function () {
            this.markers = [];
        },
        render: function() {
            var options = {
                zoom: 13,
                center: new google.maps.LatLng(55.9531, -3.1889),
                mapTypeControl: false
            };

            this.googleMap = new google.maps.Map($("#map-container")[0], options);
        },
        updateMarkers: function (currentTime, stepSize) {
            var self = this;

            var requiredVehicles = allVehicleCollection.filter(function (vehicle) {
                return vehicle.get("last_gps_fix") >= currentTime - stepSize
                    && vehicle.get("last_gps_fix") <= currentTime;
            });

            // remove existing markers for each new vehicle so that we only have one marker for every vehicle
            var requiredVehicleIDs = [];
            requiredVehicles.forEach(function (vehicle) {
                requiredVehicleIDs.push(vehicle.get("vehicle_id"));
            });
            var requiredMarkers = [];
            this.markers.forEach(function (marker) {
                if (requiredVehicleIDs.indexOf(marker.vehicleID) > -1) {
                    marker.setMap(null);
                    marker = undefined;
                } else {
                    requiredMarkers.push(marker);
                }
            });
            this.markers = requiredMarkers;

            console.log(this.markers.length);

            console.log("current time: " + moment.unix(currentTime).locale("en").format("hh:mm:ss a"));
            requiredVehicles.forEach(function (vehicle) {
                console.log(moment.unix(vehicle.get("last_gps_fix")).locale("en").format("hh:mm:ss a"));
            });

            requiredVehicles.forEach(function (vehicle) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(vehicle.get("location")[1], vehicle.get("location")[0]),
                    map: self.googleMap,
                    icon: new google.maps.MarkerImage("http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png")
                });

                marker.infoWindow = new google.maps.InfoWindow({
                    content: "Vehicle ID: " + vehicle.get("vehicle_id")
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

                marker.vehicleID = vehicle.get("vehicle_id");

                self.markers.push(marker);
            });
        },
        removeMarkers: function () {
            this.markers.forEach(function (marker) {
                marker.setMap(null);
            });
            this.markers = [];
        },
        reset: function () {
            this.removeMarkers();
        }
    });

    return new MapView();
});