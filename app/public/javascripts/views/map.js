/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "collections/services",
    "async!http://maps.google.com/maps/api/js?sensor=false"
], function($, _, Backbone, allVehicleCollection, serviceCollection) {
    "use strict";

    var MapView = Backbone.View.extend({
        initialize: function () {
            this.markers = [];
            this.pathPolylines = [];
            this.routePolylines = [];
            this.markerColors = {
                brown: ["#9d7050", "/images/bus_brown.png"],
                purple: ["#8300c4", "/images/bus_purple.png"],
                orange: ["#e35d04", "/images/bus_orange.png"],
                blue: ["#0071d4", "/images/bus_blue.png"],
                cyan: ["#00c8ff", "/images/bus_cyan.png"],
                green: ["#16a600", "/images/bus_green.png"],
                red: ["#de0000", "/images/bus_red.png"],
                pink: ["#d90990", "/images/bus_pink.png"]
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
        updateMarkers: function (currentTime, stepSize, arePathPolylinesVisible) {
            var self = this;

            var requiredVehicles = allVehicleCollection.filter(function (vehicle) {
                return vehicle.get("last_gps_fix") >= currentTime - stepSize
                    && vehicle.get("last_gps_fix") <= currentTime;
            });

            requiredVehicles.forEach(function (vehicle) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(vehicle.get("location")[1], vehicle.get("location")[0]),
                    map: self.googleMap,
                    icon: new google.maps.MarkerImage(self.markerColors[self.markerColorAssignment[vehicle.get("service_name")]][1])
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
                marker.serviceName = vehicle.get("service_name");

                // add polyline from current marker to previous marker with same vehicle id
                for (var i=self.markers.length-1; i>=0; i--) {
                    if (self.markers[i].vehicleID == marker.vehicleID) {
                        var previousMarker = self.markers[i];

                        var polyline = new google.maps.Polyline({
                            path: [previousMarker.getPosition(), marker.getPosition()],
                            strokeColor: self.markerColors[self.markerColorAssignment[marker.serviceName]][0],
                            geodesic: true,
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });

                        if (arePathPolylinesVisible) {
                            polyline.setMap(self.googleMap);
                        }
                        self.pathPolylines.push(polyline);

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

            this.markerColorAssignment = {};

            var uniqueServiceNames = _.uniq(allVehicleCollection.pluck("service_name"));
            var colors = Object.keys(this.markerColors);
            uniqueServiceNames.forEach(function (name, pos) {
                self.markerColorAssignment[name] = colors[pos];
            });
        },
        removePolylines: function () {
            // remove path traces
            this.pathPolylines.forEach(function (polyline) {
                polyline.setMap(null);
            });
            this.pathPolylines = [];

            // remove routes
            this.routePolylines.forEach(function (polyline) {
                polyline.setMap(null);
            });
            this.routePolylines = [];
        },
        togglePathPolylines: function (action) {
            var self = this;

            if (action == "hide") {
                this.pathPolylines.forEach(function (polyline) {
                    polyline.setMap(null);
                });
            } else if (action == "show") {
                this.pathPolylines.forEach(function (polyline) {
                    polyline.setMap(self.googleMap);
                });
            } else {
                throw new Error("Action can only be 'show' or 'hide'");
            }
        },
        toggleRoutePolylines: function (action) {
            var self = this;

            if (action == "hide") {
                this.routePolylines.forEach(function (polyline) {
                    polyline.setMap(null);
                });
            } else if (action == "show") {
                // if routes already exist, simply show them, else create and then show them
                if (self.routePolylines.length == 0) {
                    var uniqueServiceNames = _.uniq(allVehicleCollection.pluck("service_name"));
                    uniqueServiceNames.forEach(function (name) {
                        var service = serviceCollection.getByName(name);
                        var inboundRoute = _.filter(service.get("routes"), function (route) {
                            return route.direction == "inbound";
                        });

                        var pathCoordinates = [];
                        inboundRoute[0].points.forEach(function (point) {
                            pathCoordinates.push(new google.maps.LatLng(point.latitude, point.longitude));
                        });

                        var polyline = new google.maps.Polyline({
                            path: pathCoordinates,
                            strokeColor: self.markerColors[self.markerColorAssignment[name]][0],
                            geodesic: true,
                            strokeOpacity: 0.3,
                            strokeWeight: 6
                        });

                        polyline.setMap(self.googleMap);

                        self.routePolylines.push(polyline);
                    });
                } else {
                    this.routePolylines.forEach(function (polyline) {
                        polyline.setMap(self.googleMap);
                    });
                }
            } else {
                throw new Error("Action can only be 'show' or 'hide'");
            }
        },
        reset: function () {
            this.removeMarkers();
            this.removePolylines();
        }
    });

    return new MapView();
});