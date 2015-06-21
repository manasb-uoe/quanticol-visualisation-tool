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
            this.arePathPolylinesVisible = true;
            this.areRoutePolylinesVisible = false;
        },
        render: function () {
            this.$mapControls = $("#map-controls-container");
            var compiledTempalte = swig.render(mapControlsTemplate, {locals: {stepSize: this.stepSize}});
            this.$el.html(compiledTempalte);
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
            "change #show-path-trace-checkbox": "delegateTogglePathPolylines",
            "change #show-routes-checkbox": "delegateToggleRoutePolylines",
            "input #step-size-input": "updateStepSize"
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
            // close previously running simulation
            if (this.isSimulating) {
                this.toggleSimulation();
            }

            mapView.reset();
        },
        setupSimulation: function () {
            // update current time with start time of simulation
            this.timeSpan = allVehicleCollection.getTimeSpan();
            this.currentTime = this.timeSpan.startTime;
            this.updateTimer();

            mapView.assignMarkerColors();
            this.updateLegend();
            mapView.updateMarkers(this.currentTime, this.stepSize, this.arePathPolylinesVisible);

            if (this.areRoutePolylinesVisible) {
                mapView.toggleRoutePolylines("show");
            } else {
                mapView.toggleRoutePolylines("hide");
            }
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
                    mapView.updateMarkers(self.currentTime, self.stepSize, self.arePathPolylinesVisible);
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
        delegateTogglePathPolylines: function () {
            if (this.arePathPolylinesVisible) {
                mapView.togglePathPolylines("hide");
                this.arePathPolylinesVisible = false;
            } else {
                mapView.togglePathPolylines("show");
                this.arePathPolylinesVisible = true;
            }
        },
        delegateToggleRoutePolylines: function () {
            if (this.areRoutePolylinesVisible) {
                mapView.toggleRoutePolylines("hide");
                this.areRoutePolylinesVisible = false;
            } else {
                mapView.toggleRoutePolylines("show");
                this.areRoutePolylinesVisible = true;
            }
        },
        updateStepSize: function(event) {
            var newStepSize = $(event.target).val().trim();
            if (newStepSize.length > 0) {
                if (newStepSize > 0) {
                    this.stepSize = parseInt(newStepSize);
                }
            }
        }
    });

    return new MapControlsView();
});