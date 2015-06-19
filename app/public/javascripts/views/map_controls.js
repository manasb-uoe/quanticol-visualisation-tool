/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "moment",
    "views/snackbar",
    "views/map",
    "swig",
    "text!../../templates/map_controls.html",
    "text!../../templates/map_controls_legend.html"
], function($, _, Backbone, allVehicleCollection, moment, SnackbarView, mapView, swig, mapControlsTemplate, mapControlsLegendTemplate) {
    "use strict";

    var MapControlsView = Backbone.View.extend({
        initialize: function () {
            this.refreshIntervalID = null;
            this.stepSize = 40; // seconds
            this.isSimulating = false;
            this.isVisible = false;
        },
        render: function () {
            this.$mapControls = $("#map-controls-container");
            this.$el.html(mapControlsTemplate);
            this.$mapControls.html(this.el);

            this.delegateEvents(this.events);

            if (this.isVisible) {
                this.hide();
            }

            // close previously running simulation
            if (this.isSimulating) {
                this.toggleSimulation();
            }

            this.$currentTimeInput = $("#map-controls-current-time");
            this.$playButton = $("#play-pause-button");
            this.$legend = $("#legend");
        },
        events: {
            "click #play-pause-button": "toggleSimulation",
            "change #show-path-trace-checkbox": "delegateTogglePolylines"
        },
        show: function() {
            if (this.isVisible) return;

            this.$mapControls.animate({
                marginBottom: "0"
            }, 300);
            this.isVisible = true;
        },
        hide: function () {
            if (!this.isVisible) return;

            this.$mapControls.animate({
                marginBottom: "-400px"
            }, 300);
            this.isVisible = false;
        },
        reset: function () {
            // update current time with start time of simulation
            this.timeSpan = allVehicleCollection.getTimeSpan();
            this.currentTime = this.timeSpan.startTime;
            this.updateTimer();

            // close previously running simulation
            if (this.isSimulating) {
                this.toggleSimulation();
            }

            mapView.reset();
            mapView.assignMarkerColors();
            this.updateLegend();
            mapView.updateMarkers(this.currentTime, this.stepSize);
        },
        updateTimer: function () {
            this.$currentTimeInput.val(moment.unix(this.currentTime).locale("en").format("MMMM Do YYYY, h:mm:ss a"));
        },
        toggleSimulation: function () {
            if (this.isSimulating) {
                this.isSimulating = false;

                this.$playButton.children().removeClass().addClass("glyphicon glyphicon-play");
                this.$playButton.siblings().removeAttr("disabled");

                clearInterval(this.refreshIntervalID);
            } else {
                this.isSimulating = true;

                this.$playButton.children().removeClass().addClass("glyphicon glyphicon-pause");
                this.$playButton.siblings().attr("disabled", "disabled");

                var self = this;
                self.refreshIntervalID = setInterval(function() {
                    self.currentTime += self.stepSize;

                    if (self.currentTime > self.timeSpan.endTime) {
                        self.currentTime = self.timeSpan.endTime;
                        self.toggleSimulation();

                        new SnackbarView({
                            content: "Simulation has ended!",
                            duration: 3000
                        }).toggle();
                    }

                    self.updateTimer();
                    mapView.updateMarkers(self.currentTime, self.stepSize);
                }, 500);
            }
        },
        /**
         * Updates the legend with all service names mapped to their colors. This method can only be called
         * AFTER the color assignment has been done, i.e. mapView's assignMarkerColors() must be called first.
         */
        updateLegend: function () {
            var compiledTempalte = swig.render(mapControlsLegendTemplate, {locals: {services: mapView.markerColorAssignment}});
            this.$legend.html(compiledTempalte);
        },
        delegateTogglePolylines: function () {
            mapView.togglePolylines();
        }
    });

    return new MapControlsView();
});