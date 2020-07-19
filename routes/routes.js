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

// go to restaurant signup
router.get("/restaurantSignup/", function(req, res){
    res.render("./Registration_Form.ejs");
})

// go to a restarant's homepage
router.get("/restuarantProfile/:restaurantName", function(req, res){
     Restaurant.find({name:req.params.restaurantName}, (err, restaurant) => {
            if (err) return res.json(err);
            res.render("./restaurant.ejs",{restaurantInfo:restaurant[0]});
        });
})

// go to a restarant's homepage
router.get("/menu/:restaurant", function(req, res){
    restaurantName = req.param("restaurant").replace(/-/g, ' ');
    Restaurant.find({name: restaurantName})
    .populate("foodItems")
    .exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // the query returns a list so we need the first item which is our restaurant
            currRestaurant = Restaurants[0];
            console.log(currRestaurant["name"]);
            res.render("./menu.ejs", {restaurant: currRestaurant, page: req.query.p});
        }
    })
})

// Post request to create restaurant
router.post("/makeRestaurant/", function(req,res){
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