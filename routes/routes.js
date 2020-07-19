var express = require("express");
var mongoose = require("mongoose");
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
    var sortParam = req.body.sortBy;
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
            // check for sorting param
            var param
            if(sortParam != "rel"){
                collectedRests = bubbleSort(collectedRests, sortParam);
                switch(sortParam) {
                    case "priceLH": param = "Price (Low to High)"; break;
                    case "priceHL": param = "Price (High to Low)"; break;
                    case "rating": param = "Rating";
                }
                console.log(collectedRests[0].rating.toString());
                console.log(collectedRests[1].rating.toString());
                console.log(collectedRests[2].rating.toString());
            } else {
                param = "Relevance"
            }
            res.render("search.ejs", {rests: collectedRests, search: req.body.searchContent.trim(), param: param});
        }
    })
})

// simple bubblesort algo to sort search query based on specified param
function bubbleSort(list, param){
    console.log("sorting:")
    console.log(list);
    // iterate through list n times tightening the bound each time
    var temp;
    var swap;
    var n = list.length-1;
    do{
        swap = false;
        for(var i = 0; i < n; i++){
            if(
                (param == "priceLH" && list[i].pricing > list[i+1].pricing) ||
                (param == "priceHL" && list[i].pricing < list[i+1].pricing) ||
                (param == "rating" && parseFloat(list[i].rating.toString()) < parseFloat(list[i + 1].rating.toString()))
            ){
                    //console.log(list[i].nameSpaced + " swap with " + list[i+1].nameSpaced);
                    console.log(list[i].nameSpaced)
                    temp = list[i];
                    list[i] = list[i+1];
                    list[i+1] = temp; 
                    swap = true;
                    console.log(list[i].nameSpaced) 
            }
        }
        n--;
    }while(swap)
    console.log(parseFloat(list[0].rating.toString()));
    console.log(parseFloat(list[1].rating.toString()));
    console.log(parseFloat(list[2].rating.toString()));
    console.log("---------");
    return list;
}

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