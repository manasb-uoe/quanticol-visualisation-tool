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
        render: function() {
            this.initMap();
            this.initMapControls();
        },
        initMap: function () {
            var options = {
                zoom: 13,
                center: new google.maps.LatLng(55.9531, -3.1889),
                mapTypeControl: false
            };

            this.googleMap = new google.maps.Map($("#map-container")[0], options);
        },
        initMapControls: function () {
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
        reset: function () {
            this.hideMapControls();
        }
    });

    return new MapView();
});