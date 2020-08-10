var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// create restaurant schema
var restaurantSchema = mongoose.Schema({
    name: String,
    nameSpaced: String,
    password: String,
    phoneNumber: String,
    rating: mongoose.Types.Decimal128,
    numOfRatings: Number,
    pricing: Number, // either '$', '$$', '$$$', '$$$$' 
    address: String,
    ownerFirstName: String,
    ownerLastName: String,
    ownerTitle: String,
    ownerEmail: String,
    ownerPhoneNumber: String,
    image: {
        data: Buffer,
        contentType: String
    },

    // each story will be an object of strings: text, link to media
    stories: [{
        text: String,
        image: {
            data: Buffer,
            contentType: String
        }
    }],

    tags: [String],

    // each food item will have a name, price, description, and imageLink
    foodItems: [{
        name: String,
        price: Number,
        description: String,
        image: {
            data: Buffer,
            contentType: String
        }
    }],
    
    // each review will be an array of strings: user_id, comment, rating
    reviews: [{
        user_id: String,
        comment: String,
        rating: Number
    }],

    // analyticalData
    analytics: {
        socialInteraction: [{
            monthYear: String,
            monthTotal: Number
        }],
        profileClicks: [{
            monthYear: String,
            monthTotal: Number
        }],
        orders: [{
            monthYear: String,
            monthTotal: Number
        }],
        sales: [{
            monthYear: String,
            monthTotal: Number
        }],
        ratings: [{
            monthYear: String,
            monthTotal: Number
        }]
    }
})

restaurantSchema.plugin(passportLocalMongoose);

// create restaurant model to export
var Restaurant = mongoose.model("Node", restaurantSchema);

// export the model to access it in app.js
module.exports = Restaurant;