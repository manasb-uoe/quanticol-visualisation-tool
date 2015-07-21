/**
 * Created by ManasB on 6/23/2015.
 */


define([
    "jquery",
    "underscore",
    "backbone",
    "views/map",
    "swig",
    "text!../../templates/legend_disabled_confirmation_modal.html"
], function($, _, Backbone, mapView, swig, legendDisabledConfirmationModalTemplate) {
    "use strict";

    var LegendDisabledConfirmationView = Backbone.View.extend({
        el: "#legend-disabled-confirmation-modal-container",
        events: {
            "click #legend-disabled-confirmation-modal-continue-button": function () {
                this.trigger("modal.continued");
            }
        },
        render: function () {
            var compiledTemplate = swig.render(legendDisabledConfirmationModalTemplate, {locals: {colorsLength: Object.keys(mapView.markerColors).length}});
            this.$el.html(compiledTemplate);

            this.$modal = $("#legend-disabled-confirmation-modal");

            this.delegateEvents(this.events);
        },
        setVisible: function (shouldSetVisible) {
            if (shouldSetVisible) {
                this.$modal.modal("show");
            } else {
                this.$modal.modal("hide");
            }
        }
    });

    return new LegendDisabledConfirmationView();
});