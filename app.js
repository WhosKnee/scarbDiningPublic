// collect dependencies so that that can be used in the project
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require('fs')
const cookieSession = require('cookie-session')

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

// create folder for multer to use
// check if directory exists
if (!fs.existsSync('./uploads/')) {
    // if not create directory
    fs.mkdirSync('./uploads/');
}

// multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage
});

// include uploads directory in project, subsitute for multer destination atm
app.use(express.static(__dirname + "/uploads"))

// configure user session
// TODO: need to use encryption library to sign/verify cookies
app.use(cookieSession({secret:"temp", maxAge:60*60*1000}))
app.use(function(req, res, next){
     // make cart variable accessible to all ejs templates
    res.locals.cart = req.session.cart;
    next();
})

// fetch models 
var Restaurant = require("./models/restaurant.js");

// fetch routes
var routes = require("./routes/routes.js");
app.use(routes);


// connecting to db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database running");
    
    // run app locally on server
    app.listen(3000, 'localhost', function () {
        console.log("The Notepad server has started on port 3000");
    })
});


// to start the server, run 'node app.js' and go to localhost:3000 on
// any browser