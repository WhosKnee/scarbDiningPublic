// collect dependencies so that that can be used in the project
const express = require("express");
const app = express();
const fs = require('fs');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const expressSession = require('express-session');
const path = require('path'); 

// fetch models 
var Restaurant = require("./models/restaurant.js");
var Customer= require("./models/customer.js")

// set ejs as the view engine
app.set("view engine", "ejs");

// use bodyparser when fetching input data from a form
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// connect mongoose to a local database
mongoose.connect('mongodb+srv://projectflashcards:cscc01@scarboroughdining.vujjd.mongodb.net/ScarboroughDiningMain?retryWrites=true&w=majority', {
    useNewUrlParser: true
});

// get stylesheets, where __dirname is the root
app.use(express.static(__dirname + "/public"))

// configure session
app.use(expressSession({
    secret: "temp",
    maxAge: 1000 * 60 * 60,
    resave: false,
    saveUninitialized: false
}))

// configure passport
app.use(passport.initialize());
app.use(passport.session());
passport.use('customerLocal', new LocalStrategy(Customer.authenticate()));
passport.use('ownerLocal', new LocalStrategy(Restaurant.authenticate()));

passport.serializeUser(function(user, done) { 
    done(null, user);
  });

passport.deserializeUser(function(user, done) {
    if(user!=null)
      done(null,user);
});

// user flash for authentication errors
app.use(flash());

// setup middleware for ejs variables
app.use(function(req, res, next){
    // make cart variable accessible to all ejs templates
    res.locals.cart = req.session.cart;
    // make flash messages accessible from ejs
    res.locals.message = req.flash();
    // make authenticated user accessible from ejs
    res.locals.user = req.user;
    next();
});

// create folder for multer to use
if (!fs.existsSync('./uploads/')) {
    fs.mkdirSync('./uploads/');
};

// fetch routes
var routes = require("./routes/routes.js");
app.use(routes);

// connecting to db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database running");
    
    // run app locally on server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Our app is running on port ${ PORT }`);
    });
});

// to start the server, run 'node app.js' and go to localhost:3000 on
// any browser