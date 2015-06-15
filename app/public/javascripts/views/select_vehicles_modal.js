/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/select_vehicles_modal.html"
], function($, _, Backbone, swig, selectVehiclesModalTemplate) {
    "use strict";

    var SelectVehiclesView = Backbone.View.extend({
        el: "#select-vehicles-modal-container",
        events: {

        },
        render: function() {
            var compiledTemplate = swig.render(selectVehiclesModalTemplate);
            this.$el.html(compiledTemplate);

            this.delegateEvents(this.events);
        }
    });

    return new SelectVehiclesView();
});