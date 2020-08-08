var mongoose = require("mongoose");

// create restaurant schema
var cartSchema = mongoose.Schema({
    restaurant: String,
    // each cart item will have an id corresponding to a foodItem in the restaurant, and a quantity
    cartItems: [{
        foodItemId: String,
        quantity: Number
    }]
})

// create restaurant model to export
var Cart = mongoose.model("Cart", cartSchema);

// export the model to access it in app.js
module.exports = Cart;