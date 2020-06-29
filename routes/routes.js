var express = require("express");
// we load up the routes to a router which we export to the app.js file
var router = express.Router({mergeParams: true});

// fetch models 
var Restaurant = require("../models/restaurant.js");

// note that index/ is mapped as the root for ejs files BY DEFAULT

// landing page (get request)
router.get("/", function(req, res){
    res.render("./landing.ejs");
})
router.get("/restuarantProfile/:restaurant", function(req, res){
    res.render("./restaurant.ejs",{people: {id:1, name: "bob"}});
})

// Post request to create restaurant
router.post("", function(req,res){
    // create object to hold new restaurant's info
    // trim whitespace from fields
    var restaurantContent= new Restaurant({
        name: req.body.name.trim(),
        password: req.body.password,
        phoneNumber: req.body.phoneNumber.trim(),
        rating: 0,
        address: req.body.address.trim(),
        ownerFirstName: req.body.ownerFirstName.trim(),
        ownerLastName: req.body.ownerLastName.trim(),
        ownerTitle: req.body.ownerTitle.trim(),
        ownerEmail: req.body.ownerEmail.trim(),
        ownerPhoneNumber: req.body.ownerPhoneNumber.trim(),
        stories: [],
        foodItems: [],
        reviews: []
    });

    // push object to the Restaurant collection in the database
    Restaurant.create(restaurantContent, function(err, newRestaurant){
        if(err){
            console.log(err);
        }
        else{
            newRestaurant.save();
            // redirect the owner to the public restaurant page
            res.redirect("/restaurant/" + newRestaurant.name.replace(/ /g, "-"));
        }
    })
})

module.exports = router;