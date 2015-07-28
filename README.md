# quanticol-visualisation-tool


### Getting Started

Tools you need to get started:

1.  [Node.js](https://nodejs.org/) - Server-side JavaScript environment
2.  [MongoDB](https://www.mongodb.org/) - A NoSQL database

> **Note:** After installing MongoDB, do not forget to add `../MongoDB/Server/<version>/bin` to your PATH variable. This will be needed in order to run `mongod` command from the command line (while running `npm run start:db`).

Once you have installed the above tools, you need to clone the repository, and execute the following command from the `app` directory to install all the server-side dependencies (listed in `app/package.json`) in one go:

<pre>$ npm install</pre>

Now, the client-side JavaScript code (which has been divided into separate Require.js modules) needs to be combined together into a single file (minified and uglified) `app/public/javascripts/build/main.min.js`. This can be done using the provided Require.js optimizer (`app/public/javascripts/libs/r.js`), by executing the following command:

<pre>$ npm run build</pre>

Now create an empty `data` directory within the `app` directory. This is where all the database content will be stored. You can start a MongoDB server by executing the following command:

<pre>$ npm run start:db</pre>

And finally, the application can be started with the following command:

<pre>$ npm run start:app</pre>

> **Note**: All the above commands must be executed from the `app` directory.

After executing the above commands, you can start exploring the tool by visiting the following URL in your preferred browser:

<pre>localhost:3000</pre>

> **Note**: If you wish to change the above port number, simply modify the `port` variable found in `app/bin/www`, according to your liking.

### Dependencies

All server-side dependencies are included in `app/package.json`, while all client-side dependencies are included in `app/public/javascripts/libs` as JavaScript files. The usage of each of these dependencies is briefly described below:

**Server-side dependencies:**

*   [async](https://www.npmjs.com/package/async) - Eases asynchronous control flow
*   [body-parser](https://www.npmjs.com/package/body-parser) - POST data parsing middleware
*   [cookie-parser](https://www.npmjs.com/package/cookie-parser) - Cookie header parsing middleware
*   [express](https://www.npmjs.com/package/express) - Server-side web application framework
*   [mongoose](https://www.npmjs.com/package/mongoose) - Object Document Model (ODM) for MongoDB
*   [morgan](https://www.npmjs.com/package/morgan) - HTTP request logger middleware
*   [multer](https://www.npmjs.com/package/multer) - File upload handling middleware
*   [nodemon](https://www.npmjs.com/package/nodemon) - A monitor script that restarts a node.js application whenever changes are detected
*   [serve-favicon](https://www.npmjs.com/package/serve-favicon) - Favicon serving middleware
*   [swig](https://www.npmjs.com/package/swig) - Template engine

**Client-side dependencies:**

*   [backbone-min.js](http://backbonejs.org) - Library for developing single-page applications
*   [bootstrap.min.js](http://getbootstrap.com) - Javascript component of Bootstrap framework
*   [bootstrap-datetimepicker.min.js](https://eonasdan.github.io/bootstrap-datetimepicker/)Date/Time picker for Bootstrap
*   [jquery.easing.1.3.min](https://github.com/terikon/marker-animate-unobtrusive/tree/master/vendor) - Dependency for SlidingMarker.js
*   [jquery-2.1.4.min.js](https://jquery.com/) - Simplifies client-side scripting of HTML
*   [markerAnimate.js](https://github.com/terikon/marker-animate-unobtrusive/tree/master/vendor) - Dependency for SlidingMarker.js
*   [moment-with-locales.min.js](http://momentjs.com/) - Date library for parsing, manipulating and displaying dates
*   [moment-timezone-with-data.js](http://momentjs.com/timezone/) - Date library for parsing, manipulating and displaying dates (includes time zones)
*   [r.js](http://requirejs.org/docs/optimization.html) - Used for multiple Require.js modules into a single file
*   [require.js](http://requirejs.org/) - Javascript file and module loader
*   [SlidingMarker.js](https://github.com/terikon/marker-animate-unobtrusive) - Used for animating markers on Google map
*   [swig.min.js](http://paularmstrong.github.io/swig/) - Template engine
*   [text.js](http://requirejs.org/docs/download.html#plugins) - Require.js plugin for loading templates
*   [underscore-min.js](http://underscorejs.org/) - Provides useful functional programming helpers

> **Note:** Even though `moment-timezone-with-data.js` is a superset of `moment-with-locales.min.js`, they are both needed since `moment-with-locales.min.js` is a strict dependency of `bootstrap-datetimepicker.min.js`.

### Database Population

The command line script (`db_population.js`) for populating the database is included in `utils/` directory. It can be run using the following command:

<pre>$ node db_population.js <argument></pre>

The following command-line arguments are allowed:

*   `live` populates the VehicleLocation collection at regular intervals of 40 seconds. It can be manually stopped by pressing <kbd>Ctrl + C</kbd>.
*   `nonlive` first empties the Stop and Service collections, and then repopulates them with the latest data fetched from the TFE API.
*   `vehicle_to_services` first empties the VehicleToServices collection, and then repopulates it using the existing Stop and Service collections.

If any other arguments are supplied to this script, it will print an error message and immediately exit.

> **Note:** When you first run the database populate script, you must run it in the following order of arguments:
> 
> 1.  `nonlive` (will exit automatically when done)
> 2.  `live` (will need to be stopped manually when enough data has been collected)
> 3.  `vehicle_to_services` (will exit automatically when done)

### Project Structure

When you first clone the repository, `app` directory structure would look like this:

<pre>app/
 |-- bin/
 |-- models/
 |-- node_modules/ (will be created after you execute 'npm install')
 |-- public/
 |-- routes/
 |-- uploads/ (will be created after the user uploads a simulated data file)
 |-- utils/
 |-- views/
 |-- app.js
 |-- package.json
            </pre>

These files/directories are:

*   `bin/` serves as a location where you can define your various start up scripts.
*   `models/` consists of all the ODM models (Mongoose schemas).
*   `node_modules/` consists of all the dependencies installed using npm.
*   `public/` consists of all the static files served by the web app (i.e. JavaScripts, CSS stylesheets, HTML templates, images and fonts).
*   `routes/` consists of all route files. A route file consists of functions that generate HTTP responses based on the requests received. These responses could be for example an HTML template (`routes/index.js`) or simply JSON (`routes/api.js`).
*   `uploads/` consists of all simulated data plain text files uploaded by the users.
*   `utils/` consists of database population/configuration scripts.
*   `views/` consists of HTML templates that are accessed directly by route functions (`routes/`).
*   `app.js` is the nain configuration file for the `express.js` app.
*   `package.json` is used to give information to npm that allows it to identify the project as well as handle the project's dependencies.

### Client-side JavaScript Structure

`Backbone.js` has been used to develop the client-side single-page application. The code is structured into multiple modules using `Require.js` as follows:

<pre>javascripts/
 |-- build/
      |-- main.min.js (will be created when you use Require.js optimizer to combine all modules)
 |-- collections/
      |-- all_vehicles.js
      |-- services.js
      |-- unique_vehicles.js
 |-- libs/
      |-- ... (listed under 'Dependencies -> Client-side dependencies' section)
 |-- models/
      |-- service.js
      |-- vehicle.js
 |-- views/
      |-- configure_controls_modal.js
      |-- control_panel.js
      |-- doc.js
      |-- legend_disabled_confirmation_modal.js
      |-- map.js
      |-- map_controls.js
      |-- nav.js
      |-- select_services_modal.js
      |-- select_time_span_modal.js
      |-- select_vehicles_modal.js
      |-- service_item.js
      |-- snackbar.js
      |-- tool.js
      |-- vehicle_item.js
 |-- main.js
 |-- router.js
            </pre>

These files/directories are:

*   `build/` consists of the minified and uglified JavaScript file, which includes all the required modules.
*   `collections/` consists of Backbone.js collections. Collections are nothing but ordered sets of models.
    *   `all_vehicles.js` is a collection of all vehicles returned by the server when the user clicks on submit button in the control panel. The models in this collection are used to display markers on the map.
    *   `services.js` is a collection of all services stored in the database. The models in this collection are used to display services in 'Select services' modal.
    *   `unique_vehicles.js` is a collection of vehicles with unique vehicle IDs, corresponding to the services selected by the user.
*   `libs/` consists of all client-side dependencies (as listed under 'Dependencies -> client- side dependencies' section).
*   `models/` consists of the actual data models that collections are made of. They basically correspond to the Mongoose schemas on the server-side (in `app/models/`).
    *   `service.js` is the data model of which `services.js` collection is comprised of.
    *   `vehicle.js` is the dat model which `all_vehicles` and `unique_vehicles` collections are comprised of.
*   `views/` consists of view files that represent the various parts/sections of the user interface.
    *   `configure_controls_modal.js` represents the modal that is used to configure the step sizes of the simulation controls. This model is displayed whenever the user clicks on 'Configure' at the top right corner of the map control panel.
    *   `control_panel.js` represents the sliding control panel that is used to select services, vehicles and the time span for the simulation, and also upload plain text files to visualize simulated data. It also allows the user to switch to live simulation mode. Its visiblity can be toggled via the 'Control Panel' button that appears just under the top navigation bar.
    *   `doc.js` represents the documentation page. It basically handles the the navigation sidebar that indicates which section of the documentation the user is currently viewing. This page can be displayed by clicking on the 'Documentation' tab on the navigation bar, or by changing the URL to `/doc`.
    *   `legend_disabled_confirmation_modal.js` represents the modal that is displayed as a warning message whenever the user selects more services than the maximum number of marker icons available.
    *   `map.js` represents the Google map. It provides methods to draw markers and polylines on the map. These methods are invoked by `map_controls.js`.
    *   `map_controls.js` represents the simulation control panel. It basically handles the entire simulation, and sends messages to `map.js` whenever it needs something to be drawn on the map.
    *   `nav.js` represents the navigation bar that appears at the top of the page. It basically handles that navigation tabs.
    *   `select_services_modal.js` represents the modal that allows the user to select the services they would like to view the vehicles of.
    *   `select_time_span_modal.js` represents the modal that allows the user to select time span for the simulation.
    *   `select_vehicles_modal.js` represents the modal that allows the user to select the vehicles they would like to view the simulation of.
    *   `service_item.js` represents a single list item displyed in 'Select services' modal. It handles the selection of an individual service, as well as displaying a popover to view the description of that service.
    *   `snackbar.js` represents the alert message that is displayed at the bottom right corner of the screen. It is used throught the application to display hint and error messages.
    *   `tool.js` represents the tool page. It handles the rendering of all of its sub-views.
    *   `vehicle_item.js` represents a single list item displayed in 'Select vehicles' modal. It handles the selection of an individual vehicle, as well as displaying a popover to view all services served by that vehicle.
*   `main.js` is the main `Require.js` configuration file. This is also the main entry point of the application.
*   `router.js` is where the routes are defined. It also exposes the app initialization function `init` which is invoked from `main.js`.

> **Note**: You might have noticed the use of `require` to create a module in `main.js`, instead of using `define`. Here's why:
> 
> *   Use `define` if you want to declare a module other parts of your application depend on.
> *   Use `require` if just want to load and use other modules.
