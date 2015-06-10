/**
 * Created by ManasB on 6/10/2015.
 */

var modalServiceModule = angular.module("bootstrap.services.modal", []);

modalServiceModule.factory("$modal", [
    "$http",
    function ($http) {
        var defaults = {
            modalId: undefined,
            templateUrl: undefined,
            template: undefined,
            size: undefined
        };

        var globalId = 0;

        var privateMethods = {
            getDialog: function(cb) {
                if (defaults.modalId) {
                    var $dialog = $("body").find("#" + defaults.modalId);
                    if ($dialog.length == 1) {
                        cb($dialog);
                    } else {
                        cb(null, new Error("No modal found with id: " + defaults.modalId));
                    }
                } else if (defaults.templateUrl) {
                    privateMethods.getTemplateFromUrl(defaults.templateUrl, function (template, err) {
                        if (err) cb(null, err);

                        cb(privateMethods.createDialog(template));
                    });
                } else {
                    cb(privateMethods.createDialog(defaults.template));
                }
            },
            getTemplateFromUrl: function (url, cb) {
                $http.get(url)
                    .success(function (data) {
                        cb(data);
                    })
                    .error(function () {
                        cb(null, new Error("Failed to load template from: " + url));
                    });
            },
            createDialog: function (template) {
                var sizeClass = undefined;
                if (defaults.size == "lg") {
                    sizeClass = " modal-lg";
                } else if (defaults.size == "sm") {
                    sizeClass = " modal-sm";
                } else {
                    sizeClass = '';
                }

                var html = [
                    '<div class="modal fade" id="modal-' + globalId +  '"tabindex="-1" role="dialog" aria-hidden="true">',
                    '<div class="modal-dialog' + sizeClass + '">',
                    '<div class="modal-content">',
                    template,
                    '</div>',
                    '</div>',
                    '</div>'
                ].join("");

                var $dialog = $(html);
                $dialog.appendTo($("body"));

                globalId++;

                return $dialog;
            }
        };

        var publicMethods = {
            create: function(options, cb) {
                angular.copy(options, defaults);
                privateMethods.getDialog(function ($dialog, err) {
                    if (err) cb(null, err);

                    cb({
                        show: function() {
                            $dialog.modal("show");
                        },
                        hide: function() {
                            $dialog.modal("show");
                        },
                        onShown: function (cb) {
                            $dialog.on("show.bs.modal", cb);
                        },
                        onHidden: function (cb) {
                            $dialog.on("hidden.bs.modal", cb);
                        }
                    });
                });
            }
        };

        return publicMethods;
    }
]);