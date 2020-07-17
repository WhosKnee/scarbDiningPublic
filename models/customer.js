var mongoose = require("mongoose");

// create restaurant schema
var customerSchema = mongoose.Schema({
    customerFirstsName: String,
    customerLastName: String,
    password: String,
    customerPhoneNumber: Number,
    facebookUrl: {
        type : String,
        required: false},
    twitterUrl: {
        type:String,
        required: false
    }
})

// create restaurant model to export
var Customer = mongoose.model("Customer", customerSchema);

// export the model to access it in app.js
module.exports = Customer;