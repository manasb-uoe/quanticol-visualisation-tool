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

        $stateProvider.state("about", {
            url: "/about",
            templateUrl: "/angular/views/about.html"
        });

        // redirect to tool state for undefined routes
        $urlRouterProvider.otherwise("tool");
    }
]);


/**
 * Controllers
 */

app.controller("ToolController", [
    "$scope",
    function ($scope) {
        $scope.title = "Tool";
    }
]);

app.controller("AboutController", [
    "$scope",
    function ($scope) {
        $scope.title = "About";
    }
]);