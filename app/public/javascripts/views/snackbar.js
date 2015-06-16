/**
 * Created by ManasB on 6/16/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig"
], function($, _, Backbone, swig) {
    "use strict";

    var SnackbarView = Backbone.View.extend({
        tagName: "span",
        className: "snackbar",
        initialize: function() {
            this.options.duration = this.options.duration ? this.options.duration : 3000;

            this.render();
        },
        render: function () {
            var context = {content: this.options.content};
            var compiledTemplate = swig.render("{{ content }}", {locals: context});
            this.$el.append(compiledTemplate);
            $("#snackbar-container").append(this.el);

            this.isVisible = false;

            var self = this;
            this.$el.click(function () {
                self.toggle();
            });
        },
        toggle: function () {
            var self = this;

            if (this.isVisible) {
                this.$el.animate({
                    marginBottom: "-200px"
                }, {
                    duration: 300,
                    complete: function () {
                        self.isVisible = false;
                    }
                });
            } else {
                this.$el.animate({
                    marginBottom: "0px"
                }, {
                    duration: 300,
                    complete: function () {
                        self.isVisible = true;
                        setTimeout(function () {
                            if (!self.isVisible) return;

                            self.toggle();
                        }, self.options.duration);
                    }
                });
            }
        }
    });

    return SnackbarView;
});