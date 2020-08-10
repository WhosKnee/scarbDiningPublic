var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// create restaurant schema
var customerSchema = mongoose.Schema({
    customerFirstName: String,
    customerLastName: String,
    password: String,
    customerEmail: String,
    customerAddress: String,
    customerBio: String,
    customerPhoneNumber: String,
    image: {
        data: Buffer,
        contentType: String
    },
    facebookUrl: {
        type : String,
        required: false
        },
    twitterUrl: {
        type:String,
        required: false
        },
    linkedinUrl: {
        type:String,
        required: false
        }
})

customerSchema.plugin(passportLocalMongoose);

// create restaurant model to export
var Customer = mongoose.model("Customer", customerSchema);

// export the model to access it in app.js
module.exports = Customer;