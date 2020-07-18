var express = require("express");
// we load up the routes to a router which we export to the app.js file
var router = express.Router({mergeParams: true});

// fetch models 
var Restaurant = require("../models/restaurant.js");
var Customer= require("../models/customer.js");

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

// go to a restarant's homepage
router.get("/restuarantProfile/:restaurantName", function(req, res){
     Restaurant.find({name:req.params.restaurantName}, (err, restaurant) => {
            if (err) return res.json(err);

            res.render("./restaurant.ejs",{restaurantInfo:restaurant[0]});
        });
})
// go to a customer homepage
router.get("/customerProfile/:customerId", function(req, res){
            res.render("./customerProfile.ejs");
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

router.post("/makeCustomer/", function(req,res){
    // create object to hold new restaurant's info
    // trim whitespace from fields
    var customerContent= new Customer({
        customerFirstName: req.body.customerFirstName.trim(),
        customerLastName: req.body.customerFirstName.trim(),
        password: req.body.password,
        customerPhoneNumber: req.body.customerPhoneNumber.trim(),
        facebookUrl:req.body.facebookUrl.trim(),
        twitterUrl:req.body.twitterUrl.trim(),

    });


     //push object to the Restaurant collection in the database
    Customer.create(customerContent, function(err, newCustomer){
        if(err){
            console.log(err);
        }
        else{
            newCustomer.save();
            // redirect the owner to the public restaurant page
            res.redirect("/");
        }
    })
})

module.exports = router;