/**
 * Created by ManasB on 6/10/2015.
 */

var modalServiceModule = angular.module("bootstrap.services.modal", []);

modalServiceModule.factory("$modal", [
    "$http",
    "$compile",
    "$rootScope",
    "$timeout",
    function ($http, $compile, $rootScope, $timeout) {
        var defaults = {
            templateUrl: undefined,
            template: undefined,
            size: undefined,
            controller: undefined,
            scope: $rootScope.$new()
        };

        var globalId = 0;

        var privateMethods = {
            getDialog: function(cb) {
                if (defaults.templateUrl) {
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
                // generate size class
                var sizeClass = undefined;
                if (defaults.size == "lg") {
                    sizeClass = " modal-lg";
                } else if (defaults.size == "sm") {
                    sizeClass = " modal-sm";
                } else {
                    sizeClass = '';
                }

                // add controller name within ng-controller to provided template
                var templateHtml = defaults.controller
                    ? "<div ng-controller='" + defaults.controller + "'>" + template + "</div>"
                    : "<div>" + template + "</div>";

                var html = [
                    '<div class="modal fade" id="modal-' + globalId +  '"tabindex="-1" role="dialog" aria-hidden="true">',
                    '<div class="modal-dialog' + sizeClass + '">',
                    '<div class="modal-content">',
                    templateHtml,
                    '</div>',
                    '</div>',
                    '</div>'
                ].join("");

                // compile html and add to body of the page
                var compiledHtml = $compile(html)(defaults.scope);
                var $dialog = $(compiledHtml);
                $dialog.appendTo($("body"));

                globalId++;

                return $dialog;
            }
        };

        var publicMethods = {
            create: function(options, cb) {
                angular.extend(defaults, options);
                privateMethods.getDialog(function ($dialog, err) {
                    if (err) cb(null, err);

                    // create modal instance and add helper methods

                    var modalInstance = {
                        show: function() {
                            $dialog.modal("show");
                        },
                        hide: function () {
                            $dialog.modal("hide");
                        }
                    };

                    // broadcast shown and hidden events

                    $dialog.on("shown.bs.modal", function () {
                        $timeout(function () {
                            $rootScope.$broadcast("modal.shown", modalInstance);
                        })
                    });

                    $dialog.on("hidden.bs.modal", function () {
                        $timeout(function () {
                            $rootScope.$broadcast("modal.hidden", modalInstance);
                        });
                    });

                    // attach modal instance to specified scope
                    defaults.scope.modalInstance = modalInstance;

                    cb(modalInstance);
                });
            }
        };

        return publicMethods;
    }
]);