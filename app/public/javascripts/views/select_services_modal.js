/**
 * Created by ManasB on 6/14/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "collections/services",
    "views/service_item",
    "text!../../templates/select_services_modal.html"
], function($, _, Backbone, swig, serviceCollection, ServiceItemView, selectServicesModalTemplate) {
    "use strict";

    var SelectServicesModalView = Backbone.View.extend({
        el: "#select-services-modal-container",
        initialize: function () {
            this.areAllSelected = false;

            var self = this;

            serviceCollection.on("reset", function () {
                self.addAllServices.call(self);
                self.updateSelectAllButton.call(self);
            });
            serviceCollection.on("change:isSelected", this.updateSelectAllButton, this);
        },
        events: {
            "click #select-all-services-button": "toggleSelectAll",
            "input #search-services-input": "search"
        },
        render: function() {
            var context = {};
            var compiledTemplate = swig.render(selectServicesModalTemplate, {locals: context});
            this.$el.html(compiledTemplate);

            this.$modal = $("#select-services-modal");

            this.delegateEvents(this.events);

            this.$selectAllButton = $("#select-all-services-button");
            this.$searchServicesInput = $("#search-services-input");
            this.$servicesContainer = $("#services-container");
            this.$noServicesFound = $("#no-services-found");
            this.$progress = $("#select-services-modal-progress");

            // trigger modal.closed event when modal is closed
            // this event will be used as a cue by select-vehicles modal to refresh vehicles
            // AND to update selected services in control panel
            var self = this;
            this.$modal.on("hidden.bs.modal", function () {
                self.trigger("modal.closed");
            });
        },
        setVisible: function (shouldSetVisible) {
            if (shouldSetVisible) {
                this.$modal.modal("show");

                if (serviceCollection.length == 0) {
                    serviceCollection.fetch({reset: true});
                } else {
                    serviceCollection.trigger("reset");
                }
            } else {
                this.$modal.modal("hide");
            }
        },
        addAllServices: function () {
            if (serviceCollection.length == 0) return;

            this.$progress.hide();

            if (serviceCollection.getSearchResultsCount() == 0) {
                this.$servicesContainer.hide();
                this.$noServicesFound.show();
            } else {
                this.$noServicesFound.hide();
                this.$servicesContainer.empty();
                this.$servicesContainer.show();

                // sort services by id and then add them to modal body
                var self = this;
                var sortedByName = serviceCollection.sortBy(function (service) {
                    return parseInt(service.get("name")) ? parseInt(service.get("name")) : service.get("name");
                });
                sortedByName.forEach(function (service) {
                    self.addService(service);
                });
            }
        },
        addService: function (service) {
            if (service.get("isMatchingSearchTerm")) {
                var serviceItemView = new ServiceItemView({model: service});
                $("#services-container").append(serviceItemView.render().el);
            }
        },
        updateSelectAllButton: function () {
            if (serviceCollection.getSelectedSearchResultsCount() == serviceCollection.getSearchResultsCount()) {
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
                serviceCollection.each(function (service) {
                    if (service.get("isMatchingSearchTerm")) {
                        service.set("isSelected", false);
                    }
                });
            } else {
                serviceCollection.each(function (service) {
                    if (service.get("isMatchingSearchTerm")) {
                        service.set("isSelected", true);
                    }
                });
            }

            this.updateSelectAllButton();
        },
        search: function () {
            serviceCollection.search(this.$searchServicesInput.val());
        },
        reset: function () {
            serviceCollection.reset();
            this.$searchServicesInput.val("");
        }
    });

    return new SelectServicesModalView();
});