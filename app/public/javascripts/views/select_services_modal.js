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
], function($, _, Backbone, swig, serviceCollection, ServiceItemView, selectServicesModalTemplate){
    "use strict";

    var SelectServicesModalView = Backbone.View.extend({
        el: "#select-services-modal-container",
        initialize: function () {
            serviceCollection.on("reset", this.addAllServices, this);
        },
        events: {
            "click #select-all-services-button": "selectAll"
        },
        render: function() {
            var context = {};
            var compiledTemplate = swig.render(selectServicesModalTemplate, {locals: context});
            this.$el.html(compiledTemplate);

            this.delegateEvents(this.events);

            // trigger modal.closed event when modal is closed
            // this event will be used as a cue by select-vehicles modal to refresh vehicles
            var self = this;
            $("#select-services-modal").on("hidden.bs.modal", function () {
                self.trigger("modal.closed");
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
        selectAll: function () {
            serviceCollection.each(function (service) {
                service.set("isSelected", true);
            });
        },
        reset: function () {
            serviceCollection.reset();
        }
    });

    return new SelectServicesModalView();
});