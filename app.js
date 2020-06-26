// collect dependencies so that that can be used in the project
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

// set ejs as the view engine
app.set("view engine", "ejs");

// use bodyparser when fetching input data from a form
app.use(bodyParser.urlencoded({extended: true}));

// get stylesheets, where __dirname is the root
app.use(express.static(__dirname + "/public"))

// fetch models 
var Restaurant = require("./models/restaurant.js");

// fetch routes
var routes = require("./routes/routes.js");
app.use(routes);

// run app locally on server
app.listen(3000, 'localhost', function(){
    console.log("The Notepad server has started on port 3000");
})

// to start the server, run 'node app.js' and go to localhost:3000 on
// any browser