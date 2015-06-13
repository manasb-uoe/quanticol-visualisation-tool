/**
 * Created by ManasB on 6/13/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/tool.html"
], function($, _, Backbone, swig, toolTemplate) {
    "use strict";

    var ToolView = Backbone.View.extend({
        el: "#content",
        initialize: function() {
        },
        render: function () {
            var compiledTemplate = swig.render(toolTemplate);
            this.$el.html(compiledTemplate);
        }
    });

    return new ToolView();
});