// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

// define the schema for our customerSchema model
var customerSchema = mongoose.Schema({
    customerFirstName: String,
	customerLastName: String,
    customerEmail: String,
	customerPassword: String,
    customerPhoneNumber: String,
    customerCity: String,
    customerCounty: String,
    customerCountry: String,
    customerCountryCode: String,
    customerCompanyID: ObjectId,
    customerOrderCount: {
        type: Number,
        default: 0
    },
    customerIsPrime: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    customerPaymentAccountID: String,
    subscriptionID: String,
}, {
    timestamps: true
});

// generating a hash
customerSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
customerSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.customerPassword);
};

customerSchema.methods.generateJWT = function() {
  return jwt.sign({
    customerEmail: this.customerEmail,
    id: this._id,
  }, process.env.jwtSecretKey, {expiresIn: '24h'} );
}

//Connect to specific database
const db = mongoose.connection.useDb('foodiebee');

// create the model
module.exports = db.model('customer', customerSchema, 'customer');