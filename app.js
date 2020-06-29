// collect dependencies so that that can be used in the project
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// set ejs as the view engine
app.set("view engine", "ejs");

// use bodyparser when fetching input data from a form
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// connect mongoose to a local database
mongoose.connect('mongodb://localhost:27017/scarb_dining', { useNewUrlParser: true });

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
        let newRestaurant = new Restaurant ({
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
            return res.json(result);
        });
    });

    // run app locally on server
    app.listen(3000, 'localhost', function(){
        console.log("The Notepad server has started on port 3000");
    })
});


// to start the server, run 'node app.js' and go to localhost:3000 on
// any browser