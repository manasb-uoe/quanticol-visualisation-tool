/**
 * Created by ManasB on 6/13/2015.
 */

/**
 * With define you register a module in require.js that you than can depend on in other module definitions
 * or require statements. With require you "just" load/use a module or javascript file that can be loaded
 * by require.js. For examples have a look at the documentation.
 *
 * Rule of thumb:
 * Define: If you want to declare a module other parts of your application will depend on.
 * Require: If you just want to load and use stuff.
 */

define([
    "jquery",
    "underscore",
    "backbone"
], function($, _, Backbone){

    return {};
});