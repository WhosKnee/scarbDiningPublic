var express = require("express");
var mongoose = require("mongoose");
const passport = require("passport");
// we load up the routes to a router which we export to the app.js file
var router = express.Router({mergeParams: true});

// fetch models 
var Restaurant = require("../models/restaurant.js");
var Customer= require("../models/customer.js");
const e = require("express");
const { Passport } = require("passport");

// note that index/ is mapped as the root for ejs files BY DEFAULT

// landing page (get request)
router.get("/", function(req, res){
    res.render("./landing.ejs");
})

// go to restaurant signup
router.get("/restaurantSignup/", function(req, res){
    res.render("./Registration_Form.ejs");
})

// go to customer signup
router.get("/customerSignup/", function(req, res){
    res.render("./Customer_Form.ejs");
})

router.get("/:restaurant/storyUploader", function(req, res){
    res.render("./StoriesForm.ejs",{restaurant: req.param("restaurant")});
})

router.get("/:restaurant/restaurantProfile", function(req, res){
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

// go to a restarant's homepage
router.get("/:restaurant/menu", function(req, res){
    var restaurantName = req.param("restaurant").replace(/-/g, '');
    Restaurant.find({name: restaurantName})
    .populate("foodItems")
    .exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // the query returns a list so we need the first item which is our restaurant
            currRestaurant = Restaurants[0];
            res.render("./menu.ejs", {restaurant: currRestaurant, page: req.query.p});
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
            } else {
                param = "Relevance"
            }
            res.render("search.ejs", {rests: collectedRests, search: req.body.searchContent.trim(), param: param});
        }
    })

})

// get request to analytical dashboard
router.get("/:restaurantName/analytics", function(req, res){
    var restaurantName = req.param("restaurantName").replace(/-/g, '');
    Restaurant.find({name: restaurantName}).exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // the query returns a list so we need the first item which is our restaurant
            res.render("./analytics.ejs", {restaurant: Restaurants[0]});
        }
    })
})

// go to a customer homepage
router.get("/:customerFirstName/:customerLastName/customerProfile", function(req, res){
    Customer.find({customerFirstName:req.params.customerFirstName,customerLastName:req.params.customerLastName}, (err, customer) => {
            if (err) return res.json(err);
            res.render("./customerProfile.ejs",{customerInfo:customer[0]});
        });
})


// simple bubblesort algo to sort search query based on specified param
function bubbleSort(list, param){
    // iterate through list n times tightening the bound each time
    var temp;
    var swap;
    var n = list.length-1;
    // perform swaps until either an iteration with no swpas or end of list
    do{
        swap = false;
        for(var i = 0; i < n; i++){
            // 3 possible sorting params
            if(
                (param == "priceLH" && list[i].pricing > list[i+1].pricing) ||
                (param == "priceHL" && list[i].pricing < list[i+1].pricing) ||
                (param == "rating" && parseFloat(list[i].rating.toString()) < parseFloat(list[i + 1].rating.toString()))
            ){
                    temp = list[i];
                    list[i] = list[i+1];
                    list[i+1] = temp;
                    swap = true;
            }
        }
        n--;
    }while(swap)
    return list;
}

// Post request to create restaurant
router.post("/uploadStory/", function(req,res){
    var newStory = {
        text: req.body.storyText,
        mediaLink: "N/A"
    };

    Restaurant.findOneAndUpdate({name: req.body.restaurantName.replace(/-/g, '')}, {$push: {stories: newStory}}, function (err, result) {
        if (err) return res.json(err);
        // redirect the owner to the public restaurant page
        res.redirect("/restaurantProfile/" + req.body.restaurantName);
    });
})

module.exports = router;

// ===================
// AUTH ROUTES
// ===================
// Post request to create restaurant
router.post("/makeRestaurant", function(req,res){
    // create object to hold new restaurant's info
    // trim whitespace from fields and format correctly
    var d = new Date()
    var month = (d.getMonth() + 1).toString();
    if(month.toString().length < 2){
        month = "0".concat(month)
    }
    var socialInteractionArr = [{
        monthYear: month.concat(d.getFullYear().toString()), 
        monthTotal: 0
    }],
    profileClicksArr = [{
        monthYear: month.concat(d.getFullYear().toString()), 
        monthTotal: 0
    }],
    ordersArr = [{
        monthYear: month.concat(d.getFullYear().toString()), 
        monthTotal: 0
    }],
    salesArr = [{
        monthYear: month.concat(d.getFullYear().toString()), 
        monthTotal: 0
    }],
    ratingsArr = [{
        monthYear: month.concat(d.getFullYear().toString()), 
        monthTotal: 0
    }]

    var restaurantContent= new Restaurant({
        name: req.body.name.trim().replace(/\s/g, ''),
        nameSpaced: req.body.name.trim(),
        username: req.body.ownerEmail.trim(),
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
        reviews: [],
        analytics: {
            socialInteraction: socialInteractionArr,
            profileClicks: profileClicksArr,
            orders: ordersArr,
            sales: salesArr,
            ratings: ratingsArr
        }
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

router.post("/makeCustomer/", function(req,res){
    // create object to hold new restaurant's info
    // trim whitespace from fields
    var customerContent= new Customer({
        customerFirstName: req.body.customerFirstName.trim(),
        customerLastName: req.body.customerLastName.trim(),
        customerBio: req.body.customerBio.trim(),
        customerAddress: req.body.customerAddress.trim(),
        password: req.body.password,
        customerPhoneNumber: req.body.customerPhoneNumber.trim(),
        facebookUrl:req.body.facebookUrl.trim(),
        twitterUrl:req.body.twitterUrl.trim(),
        linkedinUrl:req.body.linkedinUrl.trim()

    });
     //push object to the Restaurant collection in the database
    Customer.create(customerContent, function(err, newCustomer){
        if(err){
            console.log(err);
        }
        else{
            newCustomer.save();
            // redirect the owner to the public restaurant page
            res.redirect("/" + newCustomer.customerFirstName + "/" + newCustomer.customerLastName + "/customerProfile");

        }
    })
})
