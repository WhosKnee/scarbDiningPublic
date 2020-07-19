var express = require("express");
// we load up the routes to a router which we export to the app.js file
var router = express.Router({mergeParams: true});

// fetch models 
var Restaurant = require("../models/restaurant.js");
const e = require("express");

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
router.get("/restaurantProfile/:restaurant", function(req, res){
    console.log("made it");
    var restaurantName = req.param("restaurant").replace(/-/g, '');
    Restaurant.find({name: restaurantName})
    .populate("stories")
    .populate("foodItems")
    .populate("reviews")
    .exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // the query returns a list so we need the first item which is our restaurant
            currRestaurant = Restaurants[0];
            res.render("./restaurant.ejs", {restaurant: currRestaurant});
        }
    })
})

// Post to query search results
router.post("/searchRestaurants/", function(req,res){
    // collect the search field and create object to pass into ejs
    var searchContent = req.body.searchContent.trim().replace(/\s/g, '');
    var searchTags = req.body.searchContent.trim().split(" ");
    var collectedRests = []
    var collectedRestNames = []
    // check if search contains a restaurant or any restaurants that contain at least 1 tags
    Restaurant.find( { $or: [{name: {$regex : ".*" + searchContent + ".*", $options: "$i"}},
                             {tags: {"$in":searchTags}}] } )
    .populate("stories")
    .populate("foodItems")
    .populate("reviews")
    .exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // add restaurant names into the return object
            var temp;
            for(i = 0; i < Restaurants.length; i++){
                if(!collectedRestNames.includes(Restaurants[i]["name"]))
                    // move exact match the front of the arrays
                    if(searchContent.includes(Restaurants[i]["name"])){
                        collectedRests.unshift(Restaurants[i]);
                        collectedRestNames.unshift(Restaurants[i]["name"]);
                    } else {
                        collectedRests.push(Restaurants[i]);
                        collectedRestNames.push(Restaurants[i]["name"]);
                    }
            }
            res.render("search.ejs", {rests: collectedRests, search: req.body.searchContent.trim()});
        }
    })
})

// Post request to create restaurant
router.post("/makeRestaurant", function(req,res){
    // create object to hold new restaurant's info
    // trim whitespace from fields and format correctly
    var restaurantContent= new Restaurant({
        name: req.body.name.trim().replace(/\s/g, ''),
        nameSpaced: req.body.name.trim(),
        password: req.body.password,
        phoneNumber: req.body.phoneNumber.trim().replace(/\s/g, '').replace(/-/g, '').replace(/[(]/g, '').replace(/[)]/g, ''),
        rating: 0,
        pricing: req.body.pricing, 
        address: req.body.address.trim(),
        ownerFirstName: req.body.ownerFirstName.trim(),
        ownerLastName: req.body.ownerLastName.trim(),
        ownerTitle: req.body.ownerTitle.trim(),
        ownerEmail: req.body.ownerEmail.trim(),
        ownerPhoneNumber: req.body.ownerPhoneNumber.trim().replace(/[(]/g, '').replace(/[)]/g, ''),
        stories: [],
        tags: req.body.tags.trim().replace(/\s/g, '').split(","), 
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
            res.redirect("/restaurantProfile/" + newRestaurant.name.replace(/ /g, "-"));
        }
    })
})

module.exports = router;