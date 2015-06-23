/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/all_vehicles",
    "collections/services",
    "moment",
    "views/snackbar",
    "views/map",
    "swig",
    "text!../../templates/map_controls.html",
    "text!../../templates/map_controls_legend.html"
], function($, _, Backbone, allVehicleCollection, serviceCollection, moment, SnackbarView, mapView, swig, mapControlsTemplate, mapControlsLegendTemplate) {
    "use strict";

    var MapControlsView = Backbone.View.extend({
        initialize: function () {
            this.refreshIntervalID = null;
            this.stepSize = 30; // seconds
            this.isSimulating = false;
            this.isVisible = false;
            this.arePathPolylinesVisible = true;
            this.areRoutePolylinesVisible = false;
            this.stepSizes = {
                f: 60,
                ff: 60*5,
                b: -60,
                fb: -60*5
            }
        },
        render: function () {
            this.$mapControls = $("#map-controls-container");
            var compiledTempalte = swig.render(mapControlsTemplate,
                {locals: {
                    stepSize: this.stepSize,
                    arePathPolylinesVisible: this.arePathPolylinesVisible,
                    areRoutePolylinesVisible: this.areRoutePolylinesVisible
                }});
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
            this.$forwardButton = $("#forward-button");
            this.$fastForwardButton = $("#fast-forward-button");
            this.$backwardButton = $("#backward-button");
            this.$fastBackwardButton = $("#fast-backward-button");
            this.$legend = $("#legend");
        },
        events: {
            "click #play-pause-button": "toggleSimulation",
            "change #show-path-trace-checkbox": "delegateTogglePathPolylines",
            "change #show-routes-checkbox": "delegateToggleRoutePolylines",
            "input #step-size-input": "updateStepSize",
            "click #forward-button": function() {this.skipSimulation("f")},
            "click #fast-forward-button": function() {this.skipSimulation("ff")},
            "click #backward-button": function() {this.skipSimulation("b")},
            "click #fast-backward-button": function() {this.skipSimulation("fb")}
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
            mapView.updateMarkers(this.currentTime, this.arePathPolylinesVisible);
            this.updateControlsVisiblity();

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


                clearInterval(this.refreshIntervalID);
            } else {
                this.isSimulating = true;

                this.$playButton.children().removeClass().addClass("glyphicon glyphicon-pause");

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
                    mapView.updateMarkers(self.currentTime, self.arePathPolylinesVisible);
                }, 500);
            }

            this.updateControlsVisiblity();
        },
        /**
         * Updates the legend with all service names mapped to their colors. This method can only be called
         * AFTER the color assignment has been done, i.e. mapView's assignMarkerColors() must be called first.
         * If the number of selected services is greater than the number of available colors, then the legend
         * is not shown/updated.
         */
        updateLegend: function () {
            var compiledTemplate = null;

            var colorsLength = Object.keys(mapView.markerColors).length;
            if (serviceCollection.getSelectedNames().length > colorsLength) {
                compiledTemplate = swig.render(
                    "(Disabled because more than {{ colorsLength }} services were selected)",
                    {locals: {colorsLength: colorsLength}}
                );
            } else {
                compiledTemplate = swig.render(mapControlsLegendTemplate, {locals: {services: mapView.markerColorAssignment}});
            }

            this.$legend.html(compiledTemplate);
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
        },
        skipSimulation: function(action) {
            if (Object.keys(this.stepSizes).indexOf(action) == -1) {
                throw new Error("Action can only be 'f', 'ff', 'b' or 'fb'");
            }

            this.currentTime += this.stepSizes[action];

            if (this.currentTime > this.timeSpan.endTime) {
                this.currentTime = this.timeSpan.endTime;
            } else if (this.currentTime < this.timeSpan.startTime) {
                this.currentTime = this.timeSpan.startTime;
            }

            this.updateTimer();
            this.updateControlsVisiblity();
            mapView.updateMarkers(this.currentTime, this.arePathPolylinesVisible);
        },
        updateControlsVisiblity: function () {
            if (this.isSimulating) {
                this.$playButton.siblings().attr("disabled", "disabled");
            } else {
                if (this.currentTime == this.timeSpan.endTime) {
                    this.$forwardButton.attr("disabled", "disabled");
                    this.$fastForwardButton.attr("disabled", "disabled");
                } else {
                    this.$forwardButton.removeAttr("disabled");
                    this.$fastForwardButton.removeAttr("disabled");
                }

                if (this.currentTime == this.timeSpan.startTime) {
                    this.$backwardButton.attr("disabled", "disabled");
                    this.$fastBackwardButton.attr("disabled", "disabled");
                } else {
                    this.$backwardButton.removeAttr("disabled");
                    this.$fastBackwardButton.removeAttr("disabled");
                }
            }
        }
    });

    return new MapControlsView();
});