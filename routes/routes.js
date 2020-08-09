var express = require("express");
var mongoose = require("mongoose");
const passport = require("passport");
// we load up the routes to a router which we export to the app.js file
var router = express.Router({mergeParams: true});

// fetch models 
var Restaurant = require("../models/restaurant.js");
var Customer= require("../models/customer.js");
const fs = require('fs');
const multer = require("multer");

// multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
})

const upload = multer({
    storage: storage
});

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
    // Prevent unauthorized user from accessing this page
    if(!req.user || req.user.name != req.param("restaurant").replace(/-/g, '')){
        return res.redirect("/");
    }
    res.render("./StoriesForm.ejs",{restaurant: req.param("restaurant")});
})

// go to a restarant's homepage
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

// go to a restaurant's menu
router.get("/:restaurant/menu", function(req, res){
    if (!req.user || req.usedStrategy != "customerLocal"){
        return res.redirect("/customerLogin");
    }
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
router.post("/uploadStory", upload.single('imageLink'), function(req,res){
    console.log(req.file)
    var encodedImage = fs.readFileSync(req.file.path).toString('base64');
    var finalImage = {
        data: new Buffer(encodedImage, "base64"),
        contentType: req.file.mimetype
    };
    var newStory = {
        text: req.body.bodyText,
        image: finalImage
    };

    Restaurant.findOneAndUpdate({name: req.body.restaurantName.replace(/-/g, '')}, {$push: {stories: newStory}}, function (err, result) {
        if (err) return res.json(err);
        // redirect the owner to the public restaurant page
        res.redirect("/" + req.body.restaurantName + "/restaurantProfile");
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
        reviews: []
    });

    // register restaurant to the Restaurant collection in the database
    Restaurant.register(restaurantContent, req.body.password, function(err, restaurant){
        if(err){
            console.log(err)
            res.redirect("/restaurantSignup/");
        } else {
            console.log("Successful registration.");
            res.redirect("/loginRestaurant");
        }
    });
})

router.post('/loginRestaurant', passport.authenticate('ownerLocal', {failureRedirect: '/loginRestaurant', failureFlash: true}), function(req, res){
    res.redirect("/"+req.user.nameSpaced.replace(/ /g, "-")+"/restaurantProfile");
});

router.post("/makeCustomer/", function(req,res){
    // create object to hold new customer's info
    // trim whitespace from fields
    var customerContent= new Customer({
        customerFirstName: req.body.customerFirstName.trim(),
        customerLastName: req.body.customerLastName.trim(),
        customerBio: req.body.customerBio.trim(),
        customerAddress: req.body.customerAddress.trim(),
        username: req.body.customerEmail.trim(),
        password: req.body.password,
        customerEmail: req.body.customerEmail.trim(),
        customerPhoneNumber: req.body.customerPhoneNumber.trim(),
        facebookUrl:req.body.facebookUrl.trim(),
        twitterUrl:req.body.twitterUrl.trim(),
        linkedinUrl:req.body.linkedinUrl.trim()

    });

    // register customer to the Customer collection in the database
    Customer.register(customerContent, req.body.password, function(err, customer){
        if(err){
            console.log(err)
            res.redirect("/customerSignup/");
        } else {
            console.log("Successful registration.");
            res.redirect("/loginCustomer");
        }
    });
})

router.post('/loginCustomer', passport.authenticate('customerLocal', {failureRedirect: '/loginCustomer', failureFlash: true}), function(req, res){
    res.redirect("/"+req.user.customerFirstName+"/"+req.user.customerLastName+"/customerProfile");
});
