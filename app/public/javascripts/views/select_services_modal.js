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
        render: function() {
            var context = {};
            var compiledTemplate = swig.render(selectServicesModalTemplate, {locals: context});
            this.$el.html(compiledTemplate);

            this.delegateEvents(this.events);
        },
        events: {
            "click #select-services-modal-save-button": "saveChanges"
        },
        addAllServices: function () {
            if (serviceCollection.length == 0) return;

            // hide progress bar
            $("#select-services-modal-progress").hide();

            $("#services-container").empty();
            serviceCollection.each(this.addService, this);
        },
        addService: function (service) {
            var serviceItemView = new ServiceItemView({model: service});
            $("#services-container").append(serviceItemView.render().el);
        },
        saveChanges: function () {
            this.trigger("modal.saved");
        }
    });

    return new SelectServicesModalView();
});