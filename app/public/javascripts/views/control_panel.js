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
            selectServicesModal.on("modal.saved", this.updateSelectedServices);
            selectVehiclesModal.on("modal.saved", this.updateSelectedVehicles);
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
        updateSelectedServices: function () {
            var selectedServiceNames = "";
            var selected = serviceCollection.getSelected();

            if (selected.length == 0) {
                selectedServiceNames = "None";
            } else {
                for (var i=0; i<selected.length; i++) {
                    if (i != 0 && i != selected.length) {
                        selectedServiceNames = selectedServiceNames + ", ";
                    }

                    selectedServiceNames = selectedServiceNames + selected[i].get("name");
                }
            }
            $("#currently-selected-services").text(selectedServiceNames);
            $("#currently-selected-vehicles").text("None");
        },
        showSelectVehiclesModal: function() {
            $("#select-vehicles-modal").modal("show");
        },
        updateSelectedVehicles: function () {
            var selectedVehicleNames = "";
            var selected = vehicleCollection.getSelected();

            if (selected.length == 0) {
                selectedVehicleNames = "None";
            } else {
                for (var i=0; i<selected.length; i++) {
                    if (i != 0 && i != selected.length) {
                        selectedVehicleNames = selectedVehicleNames + ", ";
                    }

                    selectedVehicleNames = selectedVehicleNames + selected[i].get("vehicle_id");
                }
            }
            $("#currently-selected-vehicles").text(selectedVehicleNames);
        }
    });

    return new ControlPanelView();
});