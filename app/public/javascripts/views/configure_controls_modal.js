/**
 * Created by ManasB on 7/8/2015.
 */


define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/configure_controls_modal.html"
], function($, _, Backbone, swig, configureControlsTemplate) {
    "use strict";

    var ConfigureControlsView = Backbone.View.extend({
        el: "#configure-controls-modal-container",
        events: {
            "click #configure-controls-modal-save-changes-button": "saveChanges"
        },
        render: function (stepSizes) {
            var compiledTemplate = swig.render(configureControlsTemplate, {locals: {stepSizes: stepSizes}});
            this.$el.html(compiledTemplate);

            this.delegateEvents(this.events);

            this.$errorContainer = $("#configure-controls-modal-error-container");

            this.$errorContainer.hide();
        },
        saveChanges: function () {
            var p = $("#play-step-size-input").val().trim();
            var f = $("#forward-step-size-input").val().trim();
            var ff = $("#fast-forward-step-size-input").val().trim();
            var b = $("#backward-step-size-input").val().trim();
            var fb = $("#fast-backward-step-size-input").val().trim();

            if (p.length == 0 || f.length == 0 || ff.length == 0 || b.length == 0 || fb.length == 0) {
                this.$errorContainer.html("<strong>Error! </strong> All fields are required.");
                this.$errorContainer.show();
            } else if (isNaN(parseInt(p)) || isNaN(parseInt(f)) || isNaN(parseInt(ff)) || isNaN(parseInt(b)) || isNaN(parseInt(fb))) {
                this.$errorContainer.html("<strong>Error! </strong> Only integer values are allowed.");
                this.$errorContainer.show();
            } else if (parseInt(p) <= 0) {
                this.$errorContainer.html("<strong>Error! </strong> Play step size must be greater than 0.");
                this.$errorContainer.show();
            } else {
                var stepSizes = {
                    p: parseInt(p),
                    f: parseInt(f),
                    ff: parseInt(ff),
                    b: parseInt(b),
                    fb: parseInt(fb)
                };
                this.trigger("modal.saved.changes", stepSizes);
                $("#configure-controls-modal").modal("hide");
            }
        }
    });

    return new ConfigureControlsView();
});