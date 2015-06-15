/**
 * Created by ManasB on 6/13/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "collections/services",
    "views/select_services_modal",
    "views/control_panel",
    "text!../../templates/tool.html"
], function($, _, Backbone, swig, serviceCollection, selectServicesModalView, controlPanelView, toolTemplate) {
    "use strict";

    var ToolView = Backbone.View.extend({
        el: "#content",
        render: function () {
            var compiledTemplate = swig.render(toolTemplate);
            this.$el.html(compiledTemplate);

            // render all sub views
            selectServicesModalView.render();
            controlPanelView.render();
        }
    });

    return new ToolView();
});