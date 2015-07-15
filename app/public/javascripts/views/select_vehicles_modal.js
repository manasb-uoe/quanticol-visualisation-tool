/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "collections/unique_vehicles",
    "collections/services",
    "views/vehicle_item",
    "views/select_services_modal",
    "swig",
    "text!../../templates/select_vehicles_modal.html",
    "text!../../templates/vehicle_item.html"
], function($, _, Backbone, uniqueVehicleCollection, serviceCollection, VehicleItemView, selectServicesModal, swig, selectVehiclesModalTemplate, vehicleItemTemplate) {
    "use strict";

    var SelectVehiclesView = Backbone.View.extend({
        el: "#select-vehicles-modal-container",
        initialize: function () {
            this.areAllSelected = false;

            uniqueVehicleCollection.on("reset", this.addAllVehicles, this);
            uniqueVehicleCollection.on("reset", this.updateSelectAllButton, this);
            selectServicesModal.on("modal.closed", this.refreshVehicles, this);
            uniqueVehicleCollection.on("change:isSelected", this.updateSelectAllButton, this);
        },
        events: {
            "click #select-all-vehicles-button": "toggleSelectAll",
            "input #search-vehicles-input": "search"
        },
        render: function() {
            var compiledTemplate = swig.render(selectVehiclesModalTemplate);
            this.$el.html(compiledTemplate);

            this.delegateEvents(this.events);

            this.$selectAllButton = $("#select-all-vehicles-button");
            this.$searchVehiclesInput = $("#search-vehicles-input");
            this.$vehiclesContainer = $("#vehicles-container");
            this.$noVehiclesFound = $("#no-vehicles-found");
            this.$progress = $("#select-vehicles-modal-progress");

            // trigger modal.closed event when modal is closed
            // this event will be used as a cue to update selected vehicles in control panel
            var self = this;
            $("#select-vehicles-modal").on("hidden.bs.modal", function () {
                self.trigger("modal.closed");
            });
        },
        addAllVehicles: function() {
            if (uniqueVehicleCollection.length == 0) return;

            this.$progress.hide();

            if (uniqueVehicleCollection.getSearchResultsCount() == 0) {
                this.$vehiclesContainer.hide();
                this.$noVehiclesFound.show();
            } else {
                this.$noVehiclesFound.hide();
                this.$vehiclesContainer.empty();
                this.$vehiclesContainer.show();

                // sort vehicles by id and then add them to modal body
                var sortedByVehicleID = uniqueVehicleCollection.sortBy(function (vehicle) {
                    return parseInt(vehicle.get("vehicle_id"));
                });
                var self = this;
                sortedByVehicleID.forEach(function (vehicle) {
                    self.addVehicle(vehicle);
                });
            }
        },
        addVehicle: function(vehicle) {
            if (vehicle.get("isMatchingSearchTerm")) {
                var vehicleItemView = new VehicleItemView({model: vehicle});
                $("#vehicles-container").append(vehicleItemView.render().el);
            }
        },
        refreshVehicles: function () {
            this.$searchVehiclesInput.val("");
            $("#select-vehicles-modal-progress").show();

            var selectedServiceNames = serviceCollection.getAllSelectedNames();

            uniqueVehicleCollection.fetch({
                data: $.param({service: selectedServiceNames}),
                reset: true
            });

            $("#selected-vehicles-modal-services").text(selectedServiceNames);
        },
        updateSelectAllButton: function () {
            if (uniqueVehicleCollection.getSelectedSearchResultsCount() == uniqueVehicleCollection.getSearchResultsCount()) {
                this.$selectAllButton.addClass("btn-success");
                this.$selectAllButton.removeClass("btn-default");

                this.areAllSelected = true;
            } else {
                this.$selectAllButton.removeClass("btn-success");
                this.$selectAllButton.addClass("btn-default");

                this.areAllSelected = false;
            }
        },
        toggleSelectAll: function () {
            if (this.areAllSelected) {
                uniqueVehicleCollection.each(function (vehicle) {
                    if (vehicle.get("isMatchingSearchTerm")) {
                        vehicle.set("isSelected", false);
                    }
                });
            } else {
                uniqueVehicleCollection.each(function (vehicle) {
                    if (vehicle.get("isMatchingSearchTerm")) {
                        vehicle.set("isSelected", true);
                    }
                });
            }

            this.updateSelectAllButton();
        },
        search: function () {
            uniqueVehicleCollection.search(this.$searchVehiclesInput.val());
        },
        reset: function () {
            uniqueVehicleCollection.reset();
            this.$searchVehiclesInput.val("");
        }
    });

    return new SelectVehiclesView();
});