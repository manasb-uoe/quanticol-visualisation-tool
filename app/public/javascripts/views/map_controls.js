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
    "text!../../templates/map_controls.html"
], function($, _, Backbone, allVehicleCollection, moment, SnackbarView, mapView, mapControlsTemplate) {
    "use strict";

    var MapControlsView = Backbone.View.extend({
        initialize: function () {
            this.isVisible = false;
            this.stepSize = 40; // seconds
            this.isSimulating = false;
            this.refreshIntervalID = null;

            allVehicleCollection.on("reset", this.reset, this);
        },
        render: function () {
            this.$mapControls = $("#map-controls-container");
            this.$el.html(mapControlsTemplate);
            this.$mapControls.html(this.el);

            this.$currentTimeInput = $("#map-controls-current-time");
            this.$playButton = $("#play-pause-button");
        },
        events: {
            "click #play-pause-button": "toggleSimulation"
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
                marginBottom: "-200px"
            }, 300);
            this.isVisible = false;
        },
        reset: function () {
            // update current time with start time of simulation
            this.timeSpan = allVehicleCollection.getTimeSpan();
            this.currentTime = this.timeSpan.startTime;
            this.updateTimer();

            mapView.reset();
            mapView.assignMarkerColors();
            mapView.updateMarkers(this.currentTime, this.stepSize);
        },
        updateTimer: function () {
            this.$currentTimeInput.val(moment.unix(this.currentTime).locale("en").format("MMMM Do YYYY, h:mm:ss a"));
        },
        toggleSimulation: function () {
            if (this.isSimulating) {
                this.isSimulating = false;

                //console.log("stopped");

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
        }
    });

    return new MapControlsView();
});