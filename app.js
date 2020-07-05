// collect dependencies so that that can be used in the project
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

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

// fetch models 
var Restaurant = require("./models/restaurant.js");

// fetch routes
var routes = require("./routes/routes.js");
app.use(routes);


// connecting to db
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("('we're in)");

    // add restaurant to db
    app.post('/api/restaurants/', function (req, res, next) {
        let newRestaurant = new Restaurant({
            _id: mongoose.Types.ObjectId(),
            name: req.body.name,
            phone: req.body.phoneNumber,
            address: req.body.address,
            ownerFirstName: req.body.ownerFirstName,
            ownerLastName: req.body.ownerLastName,
            ownerTitle: req.body.ownerTitle,
            ownerEmail: req.body.ownerEmail,
            ownerPhone: req.body.ownerPhoneNumber
        });

        newRestaurant.save(function (err, result) {
            if (err) console.log('error');
            return res.json('Success');
        });
    });

    // add story to db
    app.patch('/api/restaurants/stories/', function (req, res, next) {
        let newStory = {
            text: req.body.storyText,
            mediaLink: req.body.mediaLink
        };
        
        Restaurant.findOneAndUpdate({_id: req.body._id}, {$push: {stories: newStory}}, function (err, result) {
            if (err) return res.json("error");
            return res.json(result);
        });
    });

    // upload image

    // run app locally on server
    app.listen(3000, 'localhost', function () {
        console.log("The Notepad server has started on port 3000");
    })
});


// to start the server, run 'node app.js' and go to localhost:3000 on
// any browser