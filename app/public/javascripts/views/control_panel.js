/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "bootstrap",
    "collections/services",
    "collections/unique_vehicles",
    "collections/all_vehicles",
    "views/select_services_modal",
    "views/select_vehicles_modal",
    "views/select_time_span_modal",
    "views/snackbar",
    "views/map",
    "views/map_controls",
    "swig",
    "text!../../templates/control_panel.html"
], function($, _, Backbone, bootstrap, serviceCollection, uniqueVehicleCollection, allVehicleCollection, selectServicesModal, selectVehiclesModal, selectTimeSpanModal, SnackbarView, mapView, mapControlsView, swig, controlPanelTemplate){
    "use strict";

    var ControlPanelView = Backbone.View.extend({
        initialize: function () {
            this.resetSnackbar = new SnackbarView({
                content: "All selections have been successfully reset!",
                duration: 5000
            });

            serviceCollection.on("change:isSelected", this.refreshControlPanel, this);
            uniqueVehicleCollection.on("change:isSelected", this.refreshControlPanel, this);
            uniqueVehicleCollection.on("reset", this.refreshControlPanel, this);
            selectTimeSpanModal.on("modal.time.span.changed", this.refreshControlPanel, this);
            allVehicleCollection.on("reset", this.onSubmitResults, this);
        },
        events: {
            "click .control-panel-trigger": "toggleControlPanel",
            "click #select-services-modal-trigger": "showSelectServicesModal",
            "click #select-vehicles-modal-trigger": "showSelectVehiclesModal",
            "click #select-time-span-modal-trigger": "showSelectTimeSpanModal",
            "click #button-control-panel-reset": "reset",
            "click #button-control-panel-submit": "submit"
        },
        render: function () {
            var compiledTemplate = swig.render(controlPanelTemplate);
            this.$el.html(compiledTemplate);
            $("#control-panel-container").html(this.el);

            this.delegateEvents(this.events);

            this.isControlPanelVisible = false;

            var self = this;
            setTimeout(function () {
                self.toggleControlPanel();
            }, 1000);
        },
        toggleControlPanel: function () {
            var $controlPanel = $(".control-panel");
            var $controlPanelTriggerWrapper = $(".control-panel-trigger-wrapper");

            if (this.isControlPanelVisible) {
                $controlPanel.animate(
                    {marginTop: "-250px"},
                    {duration: 300, queue: false}
                );
                $controlPanelTriggerWrapper.animate(
                    {marginTop: "0"},
                    {duration: 300, queue: false}
                );

                $controlPanelTriggerWrapper.find(".glyphicon")
                    .removeClass()
                    .addClass("glyphicon glyphicon-chevron-down");

                this.isControlPanelVisible = false;
            } else {
                $controlPanel.animate(
                    {marginTop: "0"},
                    {duration: 300, queue: false}
                );
                $controlPanelTriggerWrapper.animate(
                    {marginTop: "250px"},
                    {duration: 300, queue: false}
                );

                $controlPanelTriggerWrapper.find(".glyphicon")
                    .removeClass()
                    .addClass("glyphicon glyphicon-chevron-up");

                this.isControlPanelVisible = true;
            }
        },
        showSelectServicesModal: function() {
            $("#select-services-modal").modal("show");

            if (serviceCollection.length == 0) {
                serviceCollection.fetch({reset: true});
            } else {
                serviceCollection.trigger("reset");
            }
        },
        showSelectVehiclesModal: function() {
            $("#select-vehicles-modal").modal("show");
        },
        refreshControlPanel: function() {
            // update selected service names
            var selectedServiceNames = serviceCollection.getSelectedNames();
            $("#currently-selected-services").text(selectedServiceNames.length != 0 ? selectedServiceNames : "None");

            // update selected vehicle names
            var selectedVehicleIDs = uniqueVehicleCollection.getSelectedIDs();
            $("#currently-selected-vehicles").text(selectedVehicleIDs.length != 0 ? selectedVehicleIDs : "None");

            // enable or disable 'select vehicles' and 'select time span' buttons depending on whether user has
            // selected services/vehicles or not
            var selectVehiclesButton = $("#select-vehicles-modal-trigger");

            if (selectedServiceNames.length == 0) {
                selectVehiclesButton.attr("disabled", "disabled");
            } else {
                selectVehiclesButton.removeAttr("disabled");
            }

            // update selected time span
            var timeSpan = selectTimeSpanModal.getSelectedTimeSpan();
            $("#start-time").text(timeSpan.startTime.format('MMMM Do YYYY, h:mm a'));
            $("#end-time").text(timeSpan.endTime.format('MMMM Do YYYY, h:mm a'));
        },
        showSelectTimeSpanModal: function () {
            $("#select-time-span-modal").modal("show");
        },
        reset: function () {
            selectServicesModal.reset();
            selectVehiclesModal.reset();
            selectTimeSpanModal.reset();
            mapView.reset();
            mapControlsView.hide();

            this.resetSnackbar.toggle();
        },
        submit: function (event) {
            var selectedServices = serviceCollection.getSelectedNames();
            var selectedVehicles = uniqueVehicleCollection.getSelectedIDs();
            var timeSpan = selectTimeSpanModal.getSelectedTimeSpan();

            if (selectedServices.length == 0) {
                new SnackbarView({
                    content: "Error: You need to select at least 1 service!",
                    duration: 5000
                }).toggle();
            } else if (selectedVehicles.length == 0) {
                new SnackbarView({
                    content: "Error: You need to select at least 1 vehicle!",
                    duration: 5000
                }).toggle();
            } else {
                $(event.target).button("loading");

                allVehicleCollection.fetch({
                    data: $.param({
                        service: selectedServices,
                        vehicle: selectedVehicles,
                        startTime: timeSpan.startTime.unix(),
                        endTime: timeSpan.endTime.unix()}),
                    reset: true
                });
            }
        },
        onSubmitResults: function () {
            $("#button-control-panel-submit").button("reset");

            if (allVehicleCollection.length > 0) {
                this.toggleControlPanel();

                mapControlsView.show();

                new SnackbarView({
                    content: "Hint: Use 'play' button in map controls to start the simulation!",
                    duration: 5000
                }).toggle();
            } else {
                new SnackbarView({
                    content: "Error: No vehicles found for your selection!",
                    duration: 6000
                }).toggle();
            }
        }
    });

    return new ControlPanelView();
});