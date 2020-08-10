var express = require("express");
var mongoose = require("mongoose");
const passport = require("passport");
const fs = require('fs');
const multer = require("multer");
// we load up the routes to a router which we export to the app.js file
var router = express.Router({mergeParams: true});

// fetch models
var Restaurant = require("../models/restaurant.js");
var Customer= require("../models/customer.js");
var Cart = require("../models/cart.js");

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
});

router.get("/loginRestaurant", function(req, res){
    res.render("./loginR.ejs");
});
router.get("/loginCustomer", function(req, res){
    res.render("./loginC.ejs");
});

// go to restaurant signup
router.get("/restaurantSignup/", function(req, res){
    res.render("./Registration_Form.ejs");
});

// go to customer signup
router.get("/customerSignup/", function(req, res){
    res.render("./Customer_Form.ejs");
});

router.get("/:restaurantId/storyUploader", function(req, res){
    // Prevent unauthorized user from accessing this page
    if(!req.user || req.user._id != req.params.restaurantId){
        return res.redirect("/");
    }
    res.render("./StoriesForm.ejs",{restaurantId: req.params.restaurantId});
});

router.get("/:restaurantId/menuItemUploader", function(req, res){
    // Prevent unauthorized user from accessing this page
    if(!req.user || req.user._id != req.params.restaurantId){
        return res.redirect("/");
    }
    res.render("./MenuItemForm.ejs",{restaurantId: req.params.restaurantId});
});

// go to a restarant's homepage
router.get("/:restaurantId/restaurantProfile", function(req, res){
    Restaurant.find({_id: req.params.restaurantId})
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
});

// go to a restaurant's menu
router.get("/:restaurantId/menu", function(req, res){
    if (!req.user || (req.user.ownerEmail && req.user._id != req.params.restaurantId)){
        return res.redirect("/customerLogin");
    }
    Restaurant.find({_id: req.params.restaurantId})
    .populate("foodItems")
    .exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // the query returns a list so we need the first item which is our restaurant
            currRestaurant = Restaurants[0];
            if (!req.query.p) {
                req.query.p = 1;
            }
            res.render("./menu.ejs", {restaurant: currRestaurant, page: req.query.p});
        }
    })
});

// update shopping cart by adding or removing items, and/or replacing one restaurant's cart for another's
router.post("/updateCart", function(req, res){
    if (req.body.replace == "true" || !req.session.cart){
        req.session.cart = new Cart({
            restaurant: req.body.restaurant,
            cartItems:[]
        })
    }
    if (req.body.action == "add"){
        for(i = 0; i < req.session.cart.cartItems.length; i++){
            cartItem = req.session.cart.cartItems[i]
            if (cartItem.foodItemId == req.body.food_id){
                cartItem.quantity++
                return res.redirect(req.headers.referer)
            }
        }
        req.session.cart.cartItems.push({
            foodItemId:req.body.food_id,
            quantity:1
        })
        return res.redirect(req.headers.referer);
    } else if (req.body.action == "remove"){
        for(i = 0; i < req.session.cart.cartItems.length; i++){
            cartItem = req.session.cart.cartItems[i]
            if (cartItem.foodItemId == req.body.food_id){
                cartItem.quantity--
                if (cartItem.quantity <= 0){
                    req.session.cart.cartItems.splice(i, 1)
                }
                if (req.session.cart.cartItems.length <= 0){
                    req.session.cart = undefined;
                    return res.redirect("/")
                }
                return res.redirect(req.headers.referer)
            }
        }
        console.log("Nothing to remove")
        return res.redirect(req.headers.referer)
    }
    console.log("Bad Action")
    return res.redirect(req.headers.referer)
});

// go to cart page
router.get("/myCart", function(req, res){
    if (req.session.cart){
        Restaurant.find({name: req.session.cart.restaurant})
        .populate("foodItems")
        .exec(function(err, Restaurants){
            if(err){
                console.log(err)
            } else {
                // the query returns a list so we need the first item which is our restaurant
                currRestaurant = Restaurants[0];
                res.render("./cart.ejs", {restaurant: currRestaurant});
            }
        })
    }else{
        // should not be able to go to cart page with an empty cart
        res.redirect("/")
    }
});

// get request to analytical dashboard
router.get("/:restaurantId/analytics", function(req, res){
    var restaurantId = req.params.restaurantId
    Restaurant.find({_id: restaurantId}).exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // the query returns a list so we need the first item which is our restaurant
            res.render("./analytics.ejs", {restaurant: Restaurants[0]});
        }
    })
});

// go to a restarant's review page
router.get("/:restaurantId/reviews", function (req, res) {
    var restaurantId = req.params.restaurantId;

    Customer
        .find({})
        .exec(function (err, customers) {
            var customerMap = {};

            customers.forEach(function (customer) {
                customerMap[customer._id] = customer.customerFirstName + ' ' + customer.customerLastName;
            });

            Restaurant.find({
                    _id: restaurantId
                })
                .exec(function (err, Restaurants) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (!req.query.p) {
                            req.query.p = 1;
                        }
                        // the query returns a list so we need the first item which is our restaurant
                        currRestaurant = Restaurants[0];
                        res.render("./reviews.ejs", {
                            restaurant: currRestaurant,
                            page: req.query.p,
                            customerMap: JSON.stringify(customerMap)
                        });
                    }
        })
    })
});

// Post to query search results
router.post("/searchRestaurants/", function(req,res){
    // collect the search field and create object to pass into ejs
    var searchContent = req.body.searchContent.trim().replace(/\s/g, '');
    var searchTags = req.body.searchContent.trim().split(" ");
    for(var i = 0; i < searchTags.length ; i++){
        searchTags[i] = searchTags[i].charAt(0).toUpperCase() + searchTags[i].slice(1);
    }
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
            res.render("search.ejs", {rests: collectedRests, search: req.body.searchContent.trim(), param: param, paramVal: sortParam});
        }
    })
});

// go to a customer homepage
router.get("/:customerId/customerProfile", function(req, res){
    Customer.find({_id:req.params.customerId}, (err, customer) => {
            if (err) return res.json(err);
            res.render("./customerProfile.ejs",{customerInfo:customer[0]});
        });
});

router.get("/explore", function(req, res){
    // collect the search field and create object to pass into ejs
    var collectedRestsRatings = []
    var collectedRestsPriceLH = []
    var collectedRestsPriceHL = []
    Restaurant.find({})
    .populate("stories")
    .populate("foodItems")
    .populate("reviews")
    .exec(function(err, Restaurants){
        if(err){
            console.log(err)
        } else {
            // get highest rated restaurants 
            sortedByRatings = bubbleSort(Restaurants, "rating")
            for(var i = 0; i < Math.min(Restaurants.length, 10); i++){
                collectedRestsRatings.push(sortedByRatings[i]);
            }

            // get lowest costing restaurants
            sortedByPriceLH = bubbleSort(Restaurants, "priceLH")
            for(var i = 0; i < Math.min(Restaurants.length, 10); i++){
                collectedRestsPriceLH.push(sortedByPriceLH[i]);
            }

            // get highest costing restaurants
            sortedByPriceHL = bubbleSort(Restaurants, "priceHL");
            for(var i = 0; i < Math.min(Restaurants.length, 10); i++){
                collectedRestsPriceHL.push(sortedByPriceHL[i]);
            }
            // get highest costing restaurants
            res.render("explore.ejs", {restsRating: collectedRestsRatings, restsPriceLH: collectedRestsPriceLH, restsPriceHL: collectedRestsPriceHL});
        }
    })
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
};

// Post request to upload story/post
router.post("/uploadStory", upload.single('postImageLink'), function(req,res){
    var encodedImage = fs.readFileSync(req.file.path).toString('base64');
    var finalImage = {
        data: new Buffer(encodedImage, "base64"),
        contentType: req.file.mimetype
    };
    var newStory = {
        text: req.body.bodyText,
        image: finalImage
    };

    Restaurant.findOneAndUpdate({_id: req.body.restaurantId}, {$push: {stories: newStory}}, function (err, result) {
        if (err) return res.json(err);
        // delete image from local disk after upload
        fs.unlink(req.file.path)
        // redirect the owner to the public restaurant page
        res.redirect("/" + req.body.restaurantId + "/restaurantProfile");
    });
});

// upload review
router.post('/:restaurantId/reviews/', function (req, res, next) {
    let newReview = {
        user_id: req.body.user_id,
        comment: req.body.comment,
        rating: req.body.rating
    };

    Restaurant.findOneAndUpdate({_id: req.params.restaurantId}, {$push: {reviews: newReview}}, function (err, result) {
        if (err) return res.json(err);
        return res.json(newReview);
    });
});

// Post request to add menu item
router.post("/addMenuItem", upload.single('foodImageLink'), function(req,res){
    var encodedImage = fs.readFileSync(req.file.path).toString('base64');
    var finalImage = {
        data: new Buffer(encodedImage, "base64"),
        contentType: req.file.mimetype
    };
    var newFoodItem = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: finalImage
    };

    Restaurant.findOneAndUpdate({_id: req.body.restaurantId}, {$push: {foodItems: newFoodItem}}, function (err, result) {
        if (err) return res.json(err);
        // delete image from local disk after upload
        fs.unlink(req.file.path)
        // redirect the owner to the edit menu page
        res.redirect("/" + req.body.restaurantId + "/menu?p=1");
    });
});

// Post request to delete menu item
router.post("/deleteMenuItem", function(req,res){
    Restaurant.findOneAndUpdate({_id: req.body.restaurantId}, {$pull: {foodItems: {_id: req.body.foodId}}}, function (err, result) {
        if (err) return res.json(err);
        // redirect the owner to the edit menu page
        res.redirect("/" + req.body.restaurantId + "/menu?p=1");
    });
});

// ===================
// AUTH ROUTES
// ===================
// Post request to create restaurant
router.post("/makeRestaurant", upload.single('restaurantImageLink'), function(req,res){
    // create image buffer
    var encodedImage = fs.readFileSync(req.file.path).toString('base64');
    var finalImage = {
        data: new Buffer(encodedImage, "base64"),
        contentType: req.file.mimetype
    };
    // create object to hold new restaurant's info
    // trim whitespace from fields and format correctly
    var restaurantContent = new Restaurant({
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
        image: finalImage
    });

    // register restaurant to the Restaurant collection in the database
    Restaurant.register(restaurantContent, req.body.password, function(err, restaurant){
        if(err){
            console.log(err)
            res.redirect("/restaurantSignup/");
        } else {
            console.log("Successful registration.");
            // delete image from local disk after upload
            fs.unlink(req.file.path)
            res.redirect("/loginRestaurant");
        }
    });
});

router.post('/loginRestaurant', passport.authenticate('ownerLocal', {failureRedirect: '/loginRestaurant', failureFlash: true}), function(req, res){
    res.redirect("/"+req.user._id+"/restaurantProfile");
});

router.post("/makeCustomer/", upload.single("customerImageLink"), function(req,res){
    // create image buffer
    var encodedImage = fs.readFileSync(req.file.path).toString('base64');
    var finalImage = {
        data: new Buffer(encodedImage, "base64"),
        contentType: req.file.mimetype
    };
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
        image: finalImage,
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
            // delete image from local disk after upload
            fs.unlink(req.file.path)
            res.redirect("/loginCustomer");
        }
    });
});

router.post('/loginCustomer', passport.authenticate('customerLocal', {failureRedirect: '/loginCustomer', failureFlash: true}), function(req, res){
    res.redirect("/"+req.user._id+"/customerProfile");
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect("/");
});

// go to under construction page
router.get("/construction", function(req, res){
    res.render("./construction.ejs");
});

module.exports = router;
