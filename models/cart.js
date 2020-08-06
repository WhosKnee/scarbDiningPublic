var mongoose = require("mongoose");

// create restaurant schema
var cartSchema = mongoose.Schema({
    restaurant: String,
    items: [] // list of foodItem ids
})

// create restaurant model to export
var Cart = mongoose.model("Cart", cartSchema);

// export the model to access it in app.js
module.exports = Cart;