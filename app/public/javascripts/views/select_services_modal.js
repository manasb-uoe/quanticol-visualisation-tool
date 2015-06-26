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

            serviceCollection.on("reset", this.addAllServices, this);
            serviceCollection.on("change:isSelected", this.updateSelectAllButton, this);
        },
        events: {
            "click #select-all-services-button": "toggleSelectAll"
        },
        render: function() {
            var context = {};
            var compiledTemplate = swig.render(selectServicesModalTemplate, {locals: context});
            this.$el.html(compiledTemplate);

            this.delegateEvents(this.events);

            this.$selectAllButton = $("#select-all-services-button");

            var self = this;
            var $selectServicesModal = $("#select-services-modal");

            // trigger modal.closed event when modal is closed
            // this event will be used as a cue by select-vehicles modal to refresh vehicles
            $selectServicesModal.on("hidden.bs.modal", function () {
                self.trigger("modal.closed");
            });

            // update select all button state whenever this modal is shown
            $selectServicesModal.on("shown.bs.modal", function () {
                self.updateSelectAllButton();
            });
        },
        addAllServices: function () {
            if (serviceCollection.length == 0) return;

            $("#select-services-modal-progress").hide();
            $("#services-container").empty();

            // sort services by id and then add them to modal body
            var self = this;
            var sortedByName = serviceCollection.sortBy(function (service) {
                return parseInt(service.get("name")) ? parseInt(service.get("name")) : service.get("name");
            });
            sortedByName.forEach(function (service) {
                self.addService(service);
            });
        },
        addService: function (service) {
            var serviceItemView = new ServiceItemView({model: service});
            $("#services-container").append(serviceItemView.render().el);
        },
        updateSelectAllButton: function () {
            if (serviceCollection.getSelectedNames().length == serviceCollection.length) {
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
                    service.set("isSelected", false);
                });
            } else {
                serviceCollection.each(function (service) {
                    service.set("isSelected", true);
                });
            }

            this.updateSelectAllButton();
        },
        reset: function () {
            serviceCollection.reset();
        }
    });

    return new SelectServicesModalView();
});