var mongoose = require("mongoose");

// create restaurant schema
var restaurantSchema = mongoose.Schema({
    name: String,
    nameSpaced: String,
    password: String,
    phoneNumber: String,
    rating: Number,
    pricing: Number, // either '$', '$$', '$$$', '$$$$' 
    address: String,
    ownerFirstName: String,
    ownerLastName: String,
    ownerTitle: String,
    ownerEmail: String,
    ownerPhoneNumber: String,

    // each story will be an object of strings: text, link to media
    stories: [{
        text: String,
        mediaLink: String
    }],

    tags: [String],

    // each food item will have a name, price, description, and imageLink
    foodItems: [{
        name: String,
        price: Number,
        description: String,
        imageLink: String
    }],
    
    // each review will be an array of strings: user_id, comment, rating
    reviews: [{
        user_id: String,
        comment: String,
        rating: Number
    }]
})

// create restaurant model to export
var Restaurant = mongoose.model("Node", restaurantSchema);

// export the model to access it in app.js
module.exports = Restaurant;