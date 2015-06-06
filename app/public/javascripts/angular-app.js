/**
 * Created by ManasB on 6/6/2015.
 */

/**
 * Angular app initialization
 */

var app = angular.module("bus-simulator", ["ui.router"]);


/**
 * Routes configuration
 */

app.config([
    "$stateProvider",
    "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
        // tool state
        $stateProvider.state("tool", {
            url: "/tool",
            templateUrl: "./angular-views/tool.html",
            controller: "ToolController"
        });

        // about state
        $stateProvider.state("about", {
            url: "/about",
            templateUrl: "./angular-views/about.html",
            controller: "AboutController"
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