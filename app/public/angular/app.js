/**
 * Created by ManasB on 6/6/2015.
 */

/**
 * Main app module initialization
 */

var app = angular.module("bus-simulator", ["ui.router"]);


/**
 * Routes configuration
 */

app.config([
    "$stateProvider",
    "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state("tool", {
            url: "/tool",
            templateUrl: "/angular/views/tool.html"
        });

        $stateProvider.state("documentation", {
            url: "/documentation",
            templateUrl: "/angular/views/documentation.html"
        });

        // redirect to tool state for undefined routes
        $urlRouterProvider.otherwise("tool");
    }
]);


/**
 * Controllers
 */

app.controller("NavigationController", [
    "$scope",
    function ($scope) {
        $scope.tabs = [
            {name: "Tool", active: true, state: "tool", iconClass: "glyphicon-wrench"},
            {name: "Docmentation", active: false, state: "documentation", iconClass: "glyphicon-question-sign"}
        ];

        $scope.selectTab = function (selectedTab) {
            for (var i=0; i<$scope.tabs.length; i++) {
                if (!$scope.tabs[i] != selectedTab) {
                    $scope.tabs[i].active = false;
                }
            }
            selectedTab.active = true;
        };

        $scope.$on("$locationChangeSuccess", function (event, newState) {
            newState = newState.substring(newState.indexOf("#/")+2, newState.length);
            for (var i=0; i<$scope.tabs.length; i++) {
                if ($scope.tabs[i].state == newState) {
                    $scope.selectTab($scope.tabs[i]);
                }
            }
        });
    }
]);


/**
 * Directives
 */

app.directive("map", function () {
    return {
        restrict: "E",
        template: "<div class='{{className}}' style='height: 100%;'></div>",
        transclude: false,
        scope: {
            className: "@"
        },
        link: function postLink(scope, element, attrs) {
            var googleMap = new GoogleMapsApiWrapper(
                {lat: 55.953825, lng: -3.188646},
                12,
                $(element).children()[0]
            );
        }
    }
});

app.directive("controlPanel", function () {
    return {
        restrict: "E",
        templateUrl: "/angular/views/control_panel.html",
        transclude: false,
        scope: {

        },
        link: function postLink(scope, element, attrs) {
            scope.isVisible = false;
            var animationDuration = 500;

            var controlPanel = $(element).find(".control-panel");
            var controlPanelTriggerWrapper = $(element).find(".control-panel-trigger-wrapper");

            scope.toggle = function () {
                if (scope.isVisible) {
                    $(function () {
                        controlPanelTriggerWrapper.animate({
                            marginTop: "0px"
                        }, {duration: animationDuration, queue: false});
                        controlPanel.animate({
                            marginTop: "-150px"
                        }, {duration: animationDuration, queue: false});
                    });

                    scope.isVisible = false;
                } else {
                    $(function () {
                        controlPanelTriggerWrapper.animate({
                            marginTop: "150px"
                        }, {duration: animationDuration, queue: false});
                        controlPanel.animate({
                            marginTop: "0px"
                        }, {duration: animationDuration, queue: false});
                    });

                    scope.isVisible = true;
                }
            };
        }
    }
});
