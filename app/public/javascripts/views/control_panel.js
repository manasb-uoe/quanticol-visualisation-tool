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
    "views/legend_disabled_confirmation_modal",
    "swig",
    "text!../../templates/control_panel.html"
], function($, _, Backbone, bootstrap, serviceCollection, uniqueVehicleCollection, allVehicleCollection, selectServicesModal, selectVehiclesModal, selectTimeSpanModal, SnackbarView, mapView, mapControlsView, legendDisabledConfirmationModal, swig, controlPanelTemplate){
    "use strict";

    var ControlPanelView = Backbone.View.extend({
        initialize: function () {
            this.visualizationTypeEnum = {
                REAL: 0,
                SIMULATED: 1
            };

            this.visualizationType = this.visualizationTypeEnum.REAL;

            var self = this;

            this.resetSnackbar = new SnackbarView({
                content: "All selections have been successfully reset!",
                duration: 3000
            });

            selectServicesModal.on("modal.closed", this.refreshControlPanel, this);
            selectVehiclesModal.on("modal.closed", this.refreshControlPanel, this);
            selectTimeSpanModal.on("modal.closed", this.refreshControlPanel, this);
            uniqueVehicleCollection.on("reset", this.refreshControlPanel, this);
            allVehicleCollection.on("reset", this.onSubmitResults, this);
            legendDisabledConfirmationModal.on("modal.continued", function () {
                $("#button-control-panel-submit").button("loading");

                self.fetchAllVehicles({});
            });

        },
        events: {
            "click .control-panel-trigger": "toggleControlPanel",
            "click #select-services-modal-trigger": "showSelectServicesModal",
            "click #select-vehicles-modal-trigger": "showSelectVehiclesModal",
            "click #select-time-span-modal-trigger": "showSelectTimeSpanModal",
            "click #button-control-panel-reset": function () {
                this.reset(true);
            },
            "click #button-control-panel-submit": "submit",
            "change #toggle-live-mode-checkbox": "refreshControlPanel",
            "click #visualize-real-data-pill": function (event) {
                this.selectVisualizationType(event, this.visualizationTypeEnum.REAL)
            },
            "click #visualize-simulated-data-pill": function (event) {
                this.selectVisualizationType(event, this.visualizationTypeEnum.SIMULATED)
            }
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
            setTimeout(function () {
                self.$el.find("#select-services-modal-trigger").tooltip({
                    title: "Start here!",
                    placement: "left",
                    trigger: "manual"
                }).tooltip("show");
            }, 1500);
        },
        toggleControlPanel: function () {
            var $controlPanel = $(".control-panel");
            var $controlPanelTriggerWrapper = $(".control-panel-trigger-wrapper");

            var controlPanelHeight = $controlPanel.height();
            if (this.isControlPanelVisible) {
                $controlPanel.animate(
                    {marginTop: -controlPanelHeight},
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

                $controlPanelTriggerWrapper.find(".glyphicon")
                    .removeClass()
                    .addClass("glyphicon glyphicon-chevron-up");

                this.isControlPanelVisible = true;
            }
        },
        showSelectServicesModal: function() {
            $("#select-services-modal-trigger").tooltip("destroy");

            selectServicesModal.setVisible(true);

            if (serviceCollection.length == 0) {
                serviceCollection.fetch({reset: true});
            } else {
                serviceCollection.trigger("reset");
            }
        },
        showSelectVehiclesModal: function() {
            selectVehiclesModal.setVisible(true);
        },
        refreshControlPanel: function() {
            // update selected service names
            var selectedServices = serviceCollection.filter(function (service) {
                return service.get("isSelected");
            });
            var $servicesSelect = $("#currently-selected-services-select");
            $servicesSelect.empty();
            if (selectedServices.length == 0) {
                $servicesSelect.append("<option disabled>None</option>")
            } else {
                selectedServices.forEach(function (service) {
                    $servicesSelect.append("<option disabled>" + service.get("name") + " (" + service.get("service_type") + ")</option>");
                });
            }

            // update selected vehicle names
            var selectedVehicleIDs = uniqueVehicleCollection.filter(function (vehicle) {
                return vehicle.get("isSelected");
            });
            var $vehiclesSelect = $("#currently-selected-vehicles-select");
            $vehiclesSelect.empty();
            if (selectedVehicleIDs.length == 0) {
                $vehiclesSelect.append("<option disabled>None</option>")
            } else {
                selectedVehicleIDs.forEach(function (vehicle) {
                    $vehiclesSelect.append("<option disabled>" + vehicle.get("vehicle_id") + " (Services: " + vehicle.get("services") + ")</option>");
                });
            }

            // enable or disable 'select vehicles' and 'select time span' buttons depending on whether user has
            // selected services/vehicles or not
            var selectVehiclesButton = $("#select-vehicles-modal-trigger");

            if (selectedServices.length == 0) {
                selectVehiclesButton.attr("disabled", "disabled");
            } else {
                selectVehiclesButton.removeAttr("disabled");
            }

            // update selected time span if live mode is not enabled
            if ($("#toggle-live-mode-checkbox").prop("checked")) {
                $("#select-time-span-modal-trigger").prop("disabled", true);
                $("#start-time").text("(Disabled)");
                $("#end-time").text("(Disabled)");
            } else {
                var timeSpan = selectTimeSpanModal.getSelectedTimeSpan();
                $("#start-time").text(timeSpan.startTime.format('MMMM Do YYYY, h:mm a'));
                $("#end-time").text(timeSpan.endTime.format('MMMM Do YYYY, h:mm a'));
                $("#select-time-span-modal-trigger").prop("disabled", false);
            }
        },
        showSelectTimeSpanModal: function () {
            selectTimeSpanModal.setVisible(true);
        },
        reset: function (shouldShowSnackbar) {
            selectServicesModal.reset();
            selectVehiclesModal.reset();
            selectTimeSpanModal.reset();
            mapControlsView.reset();
            mapControlsView.hide();

            if (shouldShowSnackbar) this.resetSnackbar.toggle();
        },
        submit: function (event) {
            switch (this.visualizationType) {
                case this.visualizationTypeEnum.REAL:
                    var selectedServices = serviceCollection.getAllSelectedNames();
                    var selectedVehicles = uniqueVehicleCollection.getAllSelectedIDs();
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
                    } else if (selectedServices.length > Object.keys(mapView.markerColors).length) {
                        legendDisabledConfirmationModal.setVisible(true);
                    } else {
                        $(event.target).button("loading");

                        this.fetchAllVehicles({
                            selectedServices: selectedServices,
                            selectedVehicles: selectedVehicles,
                            timeSpan: timeSpan
                        });
                    }
                    break;

                case this.visualizationTypeEnum.SIMULATED:
                    var $input = $("#simulated-file-input");

                    if ($input[0].files.length == 0) {
                        new SnackbarView({
                            content: "Error: You must select a file to be uploaded!",
                            duration: 4000
                        }).toggle();
                    } else {
                        var file = $input[0].files[0];

                        if (file.type != "text/plain") {
                            new SnackbarView({
                                content: "Error: Only plain text files can be upload!",
                                duration: 4000
                            }).toggle();
                            return;
                        }
                        $(event.target).button("loading");

                        // need to fetch services first since they'll be used for marker color assignment
                        var self = this;
                        serviceCollection.fetch({reset: false, success: function () {
                            self.fetchAllVehicles({file: file});
                        }});
                    }
                    break;

                default:
                    throw new Error("Visualization type can only be: " + Object.keys(this.visualizationTypeEnum));
                    break;
            }
        },
        fetchAllVehicles: function (options) {
            switch (this.visualizationType) {
                case this.visualizationTypeEnum.REAL:
                    var selectedServices = options.selectedServices || serviceCollection.getAllSelectedNames();
                    var selectedVehicles = options.selectedVehicles || uniqueVehicleCollection.getAllSelectedIDs();
                    var timeSpan = options.timeSpan || selectTimeSpanModal.getSelectedTimeSpan();

                    allVehicleCollection.reset(undefined, {silent: true});

                    allVehicleCollection.fetch($("#toggle-live-mode-checkbox").prop("checked") ? "live" : "nonlive", {
                        selectedServices: selectedServices,
                        selectedVehicles: selectedVehicles,
                        startTime: timeSpan.startTime.unix(),
                        endTime: timeSpan.endTime.unix(),
                        reset: true
                    });
                    break;

                case this.visualizationTypeEnum.SIMULATED:
                    allVehicleCollection.reset(undefined, {silent: true});

                    allVehicleCollection.fetch("simulated", {file: options.file, reset: true});
                    break;

                default:
                    throw new Error("Visualization type can only be: " + Object.keys(this.visualizationTypeEnum));
                    break;
            }
        },
        onSubmitResults: function () {
            $("#button-control-panel-submit").button("reset");

            if (this.visualizationType == this.visualizationTypeEnum.SIMULATED) {
                // IMPORTANT: Need to select those services that were included in the file uploaded by the
                // user. These selections are then used for marker color assignment.
                var servicesToSelect = _.uniq(allVehicleCollection.pluck("service_name"));
                serviceCollection.forEach(function (service) {
                    if (servicesToSelect.indexOf(service.name) > -1) {
                        service.set("isSelected", true);
                    }
                });

                // display warning if number of selected services is greater than the number of marker icons
                // available
                if (serviceCollection.getAllSelectedNames().length > Object.keys(mapView.markerColors).length) {
                    legendDisabledConfirmationModal.setVisible(true);
                    return;
                }
            }

            if (allVehicleCollection.length > 0) {
                this.toggleControlPanel();

                mapControlsView.reset();
                mapControlsView.setupSimulation($("#toggle-live-mode-checkbox").prop("checked") ? "live" : "nonlive");
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
        },
        selectVisualizationType: function (event, visualizationType) {
            var $target = $(event.target);
            $target.parent().siblings().removeClass("active");
            $target.parent().addClass("active");

            $target.parent().siblings().each(function (index, el) {
                $($(el).find("a").attr("data-container")).hide();
            });

            $($target.attr("data-container")).show();

            this.visualizationType = visualizationType;

            this.reset(false);
        }
    });

    return new ControlPanelView();
});