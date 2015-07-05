/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "collections/services",
    "slidingmarker",
    "moment"
], function($, _, Backbone, allVehicleCollection, serviceCollection, SlidingMarker, moment) {
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

            SlidingMarker.initializeGlobally();
        },
        render: function() {
            var options = {
                zoom: 13,
                center: new google.maps.LatLng(55.9531, -3.1889),
                mapTypeControl: false
            };

            this.googleMap = new google.maps.Map($("#map-container")[0], options);
        },
        updateMarkers: function (currentTime, arePathPolylinesVisible) {
            var self = this;

            // remove all markers and polylines before adding any new ones
            //this.removeMarkers();
            this.removePathPolylines();

            var requiredVehicles = allVehicleCollection.filter(function (vehicle) {
                return vehicle.get("last_gps_fix") <= currentTime;
            });

            var requiredVehiclesGrouped = _.groupBy(requiredVehicles, function (vehicle) {
                return vehicle.get("vehicle_id");
            });

            Object.keys(requiredVehiclesGrouped).forEach(function (vehicleID) {
                // get list of vehicles for current vehicle id and sort it in ascending oder of last gps fix
                var vehiclesList = requiredVehiclesGrouped[vehicleID];
                vehiclesList = _.sortBy(vehiclesList, function (vehicle) {
                    return vehicle.get("last_gps_fix");
                });


                /**
                 * Create marker for last vehicle in list
                 */

                var marker = null;

                self.markers.forEach(function (oldMarker) {
                    if (oldMarker.vehicleID == vehicleID) {
                        marker = oldMarker;
                    }
                });

                var markerVehicle = vehiclesList[vehiclesList.length-1];
                var newPosition = new google.maps.LatLng(markerVehicle.get("location")[1], markerVehicle.get("location")[0]);

                if (marker == null) {
                    marker = new google.maps.Marker({
                        position: newPosition,
                        map: self.googleMap,
                        icon: new google.maps.MarkerImage(self.markerColors[self.markerColorAssignment[markerVehicle.get("service_name")]][1])
                    });

                    marker.setDuration(500);
                    marker.setEasing("linear");

                    marker.vehicleID = markerVehicle.get("vehicle_id");
                    marker.serviceName = markerVehicle.get("service_name");

                    self.markers.push(marker);
                }

                if (marker.getPosition() != newPosition) {
                    var infoWindowContent = [
                        "<strong>Vehicle ID: </strong>" + markerVehicle.get("vehicle_id"),
                        "<br>",
                        "<strong>Service name: </strong>" + markerVehicle.get("service_name"),
                        "<br>",
                        "<strong>Destination: </strong>" + markerVehicle.get("destination"),
                        "<br>",
                        "<strong>Current position: </strong>(" + markerVehicle.get("location")[1] + ", " + markerVehicle.get("location")[0] + ")",
                        "<br>",
                        "<strong>Last GPS fix: </strong>" + moment.unix(markerVehicle.get("last_gps_fix")).locale("en").format("MMMM Do YYYY, h:mm:ss a")
                    ].join("");

                    if (marker.infoWindow) {
                        marker.infoWindow.setContent(infoWindowContent);
                    } else {
                        marker.infoWindow = new google.maps.InfoWindow({
                            content: infoWindowContent
                        });

                        marker.infoWindow.isOpen = false;

                        google.maps.event.addListener(marker, "click", function () {
                            marker.infoWindow.open(self.googleMap, marker);
                        });
                    }

                    // check if vehicle's service is still the same, if not, update its marker image and its serviceName
                    var newServiceName = markerVehicle.get("service_name");
                    if (marker.serviceName != newServiceName) {
                        marker.setIcon(new google.maps.MarkerImage(self.markerColors[self.markerColorAssignment[newServiceName]][1]));
                        marker.serviceName = newServiceName;
                    }

                    ///**
                    // * interpolation attempt without using any library
                    // */
                    //var frames = [];
                    //var fromLat = marker.getPosition().lat();
                    //var fromLng = marker.getPosition().lng();
                    //var toLat = newPosition.lat();
                    //var toLng = newPosition.lng();
                    //
                    //for (var offset=0; offset<1; offset+=0.01) {
                    //    var curLat = fromLat + offset * (toLat - fromLat);
                    //    var curLng = fromLng + offset * (toLng - fromLng);
                    //
                    //    frames.push(new google.maps.LatLng(curLat, curLng));
                    //}
                    //
                    //var animate = function (index, wait) {
                    //    marker.setPosition(frames[index]);
                    //
                    //    if (index != frames.length-1) {
                    //        setTimeout(function () {
                    //            animate(index+1, wait);
                    //        }, wait);
                    //    }
                    //};

                    //animate(0, 5);

                    marker.setPosition(newPosition);

                    /**
                     * Create polyline between all adjacent markers in vehiclesList. If user has disabled full path trace,
                     * then only create polylines between the last few vehicles in the list.
                     */

                    var pathCoordinates = [];
                    vehiclesList.forEach(function (vehicle, pos) {
                        if (arePathPolylinesVisible) {
                            pathCoordinates.push(new google.maps.LatLng(vehicle.get("location")[1], vehicle.get("location")[0]));
                        } else {
                            if (pos > vehiclesList.length-4) {
                                pathCoordinates.push(new google.maps.LatLng(vehicle.get("location")[1], vehicle.get("location")[0]));
                            }
                        }
                    });

                    var polyline = new google.maps.Polyline({
                        path: pathCoordinates,
                        strokeColor: self.markerColors[self.markerColorAssignment[marker.serviceName]][0],
                        geodesic: true,
                        strokeOpacity: 1.0,
                        strokeWeight: 2,
                        icons: [{
                            icon: {
                                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                fillOpacity: 1,
                                strokeColor:'#0000ff',
                                fillColor:'#0000ff'
                            },
                            repeat: arePathPolylinesVisible ? "100px" : "0px",
                            offset: "0%"
                        }]
                    });

                    polyline.setMap(self.googleMap);

                    self.pathPolylines.push(polyline);
                }
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

            // if the number of selected services is greater than the available colors, then assign the same color
            // to each service
            if (serviceCollection.getAllSelectedNames().length > colors.length) {
                uniqueServiceNames.forEach(function (name) {
                    self.markerColorAssignment[name] = colors[0];
                });
            } else {
                uniqueServiceNames.forEach(function (name, pos) {
                    self.markerColorAssignment[name] = colors[pos];
                });
            }
        },
        removePathPolylines: function () {
            this.pathPolylines.forEach(function (polyline) {
                polyline.setMap(null);
            });
            this.pathPolylines = [];
        },
        removeRoutePolylines: function () {
            this.routePolylines.forEach(function (polyline) {
                polyline.setMap(null);
            });
            this.routePolylines = [];
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
                            strokeWeight: 8
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
            this.removePathPolylines();
            this.removeRoutePolylines();
        }
    });

    return new MapView();
});