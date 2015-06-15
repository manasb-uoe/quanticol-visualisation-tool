/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "bootstrap",
    "collections/services",
    "collections/vehicles",
    "views/select_services_modal",
    "views/select_vehicles_modal",
    "swig",
    "text!../../templates/control_panel.html"
], function($, _, Backbone, bootstrap, serviceCollection, vehicleCollection, selectServicesModal, selectVehiclesModal, swig, controlPanelTemplate){
    "use strict";

    var ControlPanelView = Backbone.View.extend({
        initialize: function () {
            serviceCollection.on("change:isSelected", this.refreshControlPanel, this);
            vehicleCollection.on("change:isSelected", this.refreshControlPanel, this);
            vehicleCollection.on("reset", this.refreshControlPanel, this);
        },
        events: {
            "click .control-panel-trigger": "toggleControlPanel",
            "click #select-services-modal-trigger": "showSelectServicesModal",
            "click #select-vehicles-modal-trigger": "showSelectVehiclesModal"
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
            var selectedVehicleIDs = vehicleCollection.getSelectedIDs();
            $("#currently-selected-vehicles").text(selectedVehicleIDs.length != 0 ? selectedVehicleIDs : "None");

            // enable or disable 'select vehicles' and 'select time span' buttons depending on whether user has
            // selected services/vehicles or not
            var selectVehiclesButton = $("#select-vehicles-modal-trigger");
            var selectTimeSpanButton = $("#select-time-span-modal-trigger");

            if (selectedServiceNames.length == 0) {
                selectVehiclesButton.attr("disabled", "disabled");
            } else {
                selectVehiclesButton.removeAttr("disabled");
            }
            if (selectedVehicleIDs.length == 0) {
                selectTimeSpanButton.attr("disabled", "disabled");
            } else {
                selectTimeSpanButton.removeAttr("disabled");
            }
        }
    });

    return new ControlPanelView();
});