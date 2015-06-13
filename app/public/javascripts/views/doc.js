/**
 * Created by ManasB on 6/13/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/documentation.html"
], function($, _, Backbone, swig, docTemplate) {
    "use strict";

    var DocView = Backbone.View.extend({
        el: "#content",
        initialize: function() {

        },
        render: function () {
            var compiledTemplate = swig.render(docTemplate);
            this.$el.html(compiledTemplate);
        }
    });

    return new DocView();
});