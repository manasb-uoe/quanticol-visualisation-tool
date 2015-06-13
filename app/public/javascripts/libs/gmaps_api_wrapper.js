/**
 * Created by Manas on 23-03-2015.
 */

function GoogleMapsApiWrapper(centerLocation, zoomLevel, mapContainer) {
    var config = {
        map: null,
        directionsRenderer: null,
        directionsService: null,
        markers: [],
        polylines: [],
        markerIcons: {
            purple: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/purple-dot.png",
            yellow: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png",
            blue: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png",
            green: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png",
            red: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png",
            orange: "http://maps.google.com/intl/en_us/mapfiles/ms/micons/orange-dot.png",
            bus: "https://maps.gstatic.com/mapfiles/ms2/micons/bus.png"
        },
        travelModes: {
            walking: google.maps.TravelMode.WALKING,
            driving: google.maps.TravelMode.DRIVING,
            bicycling: google.maps.TravelMode.BICYCLING
        }
    };

    // self invoking initialization method
    (function init() {
        // setup map
        var options = {
            zoom: zoomLevel,
            center: new google.maps.LatLng(centerLocation["lat"], centerLocation["lng"]),
            mapTypeControl: false
        };
        config.map = new google.maps.Map(mapContainer, options);

        // setup directions renderer which will draw routes on map
        config.directionsRenderer = new google.maps.DirectionsRenderer();
        config.directionsRenderer.setOptions({suppressMarkers: true, preserveViewport: true});
        config.directionsRenderer.setMap(config.map);

        // setup directions service which will retrieve the required route
        config.directionsService = new google.maps.DirectionsService();
    })();

    this.addMarker = function (id, position, options) {
        var markerOptions = {
            icon: options.icon || config.markerIcons.red,
            singleClickCallback: options.singleClickCallback,
            doubleClickCallback: options.doubleClickCallback,
            infoWindowContent: options.infoWindowContent,
            shouldOpenInfoWindowInitially: options.shouldOpenInfoWindowInitially || false
        };

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position["lat"], position["lng"]),
            map: config.map,
            icon: new google.maps.MarkerImage(config.markerIcons[markerOptions.icon])
        });

        var infoWindow;
        if (markerOptions.infoWindowContent) {
            infoWindow = new google.maps.InfoWindow({
                content: markerOptions.infoWindowContent
            });
        }

        marker.setMap(config.map);

        // add id property to each marker so that it can easily be recognized later
        marker.id = id;

        // add method to open info window
        marker.infoWindow = function (state) {
            if (infoWindow) {
                if (state == "show") {
                    infoWindow.open(config.map, marker);
                } else if (state == "hide") {
                    infoWindow.close(config.map, marker);
                }
            } else {
                throw new Error("Info window content was not provided when marker was created");
            }
        };

        if (markerOptions.shouldOpenInfoWindowInitially) {
            if (infoWindow) {
                infoWindow.open(config.map, marker);
            }
        }

        // handle single click using the callback provided
        google.maps.event.addListener(marker, 'click', function () {
            marker.infoWindow("show");
            if (markerOptions.singleClickCallback) {
                markerOptions.singleClickCallback();
            }
        });

        // handle double click using the callback provided
        if (markerOptions.doubleClickCallback) {
            google.maps.event.addListener(marker, 'dblclick', markerOptions.doubleClickCallback);
        }

        // keep marker reference for later use
        config.markers.push(marker);
    };

    this.addRoute = function (origin, destination, travelMode) {
        var request = {
            origin: new google.maps.LatLng(origin["lat"], origin["lng"]),
            destination: new google.maps.LatLng(destination["lat"], destination["lng"]),
            travelMode: config.travelModes[travelMode] || config.travelModes.walking
        };

        config.directionsService.route(request, function (res, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                config.directionsRenderer.setDirections(res);
            } else {
                console.log("Error occurred while adding route: " + status);
            }
        });
    };

    this.addPolyline = function (pathCoordinates, options) {
        for (var i=0; i<pathCoordinates.length; i++) {
            pathCoordinates[i] = new google.maps.LatLng(pathCoordinates[i]["lat"], pathCoordinates[i]["lng"]);
        }
        var path = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: options.geodesic || true,
            strokeColor: options.strokeColor || '#FF0000',
            strokeOpacity: options.strokeOpacity || 1.0,
            strokeWeight: options.strokeWeight || 2
        });
        path.setMap(config.map);

        // keep polyline reference for later use
        config.polylines.push(path);
    };

    this.clearRoutes = function () {
        config.directionsRenderer.setDirections({routes: []});
    };

    this.clearMarkers = function () {
        for (var i=0; i<config.markers.length; i++) {
            config.markers[i].setMap(null);
        }
        config.markers = [];
    };

    this.clearPolylines = function () {
        for (var i=0; i<config.polylines.length; i++) {
            config.polylines[i].setMap(null);
        }
        config.polylines = [];
    };

    this.getMarkers = function (markerId) {
        if (markerId) {
            var filteredMarkers = [];
            for (var i=0; i<config.markers.length; i++) {
                if (config.markers[i].id == markerId) {
                    filteredMarkers.push(config.markers[i]);
                }
            }
            return filteredMarkers;
        } else {
            return config.markers;
        }
    };

    this.triggerResize = function () {
        google.maps.event.trigger(config.map, 'resize');
    };

    this.setZoom = function (zoomLevel) {
        config.map.setZoom(zoomLevel);
    };

    this.setCenter = function (centerLocation) {
        config.map.setCenter(new google.maps.LatLng(centerLocation["lat"], centerLocation["lng"]));
    }
}