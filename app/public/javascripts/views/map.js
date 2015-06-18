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
            this.polylines = [];
            this.markerColors = {
                purple: ["#800080", "http://maps.google.com/intl/en_us/mapfiles/ms/micons/purple-dot.png"],
                yellow: ["#FFD300", "http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png"],
                blue: ["#0000e5", "http://maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png"],
                green: ["#008000", "http://maps.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png"],
                red: ["#FF0000", "http://maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png"],
                orange: ["#FFA500", "http://maps.google.com/intl/en_us/mapfiles/ms/micons/orange-dot.png"],
                lightBlue: ["#00FFFF", "http://maps.google.com/mapfiles/ms/micons/ltblue-dot.png"],
                pink: ["#ff748c", "http://maps.google.com/mapfiles/ms/micons/pink-dot.png"]
            };
            this.markerColorAssignment = {};
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

            // TODO probably remove it?
            // remove existing markers for each new vehicle so that we only have one marker for every vehicle
            //var requiredVehicleIDs = [];
            //requiredVehicles.forEach(function (vehicle) {
            //    requiredVehicleIDs.push(vehicle.get("vehicle_id"));
            //});
            //var requiredMarkers = [];
            //this.markers.forEach(function (marker) {
            //    if (requiredVehicleIDs.indexOf(marker.vehicleID) > -1) {
            //        marker.setMap(null);
            //        marker = undefined;
            //    } else {
            //        requiredMarkers.push(marker);
            //    }
            //});
            //this.markers = requiredMarkers;

            //console.log(this.markers.length);

            //console.log("current time: " + moment.unix(currentTime).locale("en").format("hh:mm:ss a"));
            //requiredVehicles.forEach(function (vehicle) {
            //    console.log(moment.unix(vehicle.get("last_gps_fix")).locale("en").format("hh:mm:ss a"));
            //});

            requiredVehicles.forEach(function (vehicle) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(vehicle.get("location")[1], vehicle.get("location")[0]),
                    map: self.googleMap,
                    icon: new google.maps.MarkerImage(self.markerColors[self.markerColorAssignment[vehicle.get("vehicle_id")]][1])
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

                // add polyline from current marker to previous marker with same vehicle id
                for (var i=self.markers.length-1; i>=0; i--) {
                    if (self.markers[i].vehicleID == marker.vehicleID) {
                        var previousMarker = self.markers[i];

                        var polyline = new google.maps.Polyline({
                            path: [previousMarker.getPosition(), marker.getPosition()],
                            strokeColor: self.markerColors[self.markerColorAssignment[marker.vehicleID]][0],
                            geodesic: true,
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });

                        polyline.setMap(self.googleMap);
                        self.polylines.push(polyline);

                        previousMarker.setMap(null);
                        break;
                    }
                }

                self.markers.push(marker);
            });
        },
        removeMarkers: function () {
            this.markers.forEach(function (marker) {
                marker.setMap(null);
            });
            this.markers = [];
        },
        assignMarkerColors: function () {
            var self = this;

            var uniqueVehicleIDs = _.uniq(allVehicleCollection.pluck("vehicle_id"));
            var colors = Object.keys(this.markerColors);
            uniqueVehicleIDs.forEach(function (id, pos) {
                self.markerColorAssignment[id] = colors[pos];
            });
        },
        removePolylines: function () {
            this.polylines.forEach(function (polyline) {
                polyline.setMap(null);
            });
            this.polylines = [];
        },
        reset: function () {
            this.removeMarkers();
            this.removePolylines();
        }
    });

    return new MapView();
});