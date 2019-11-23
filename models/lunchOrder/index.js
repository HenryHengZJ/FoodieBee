// load the things we need
var mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
var newObjectId = require('mongodb').ObjectID;

var cartSchema = mongoose.Schema({
	title: String,
	descrip: String,
	priceperunit: Number,
	src: String,
});

var orderSchema = mongoose.Schema({
	orderItemID: ObjectId,
	orderNumber: String,
	orderItem: [cartSchema],
	catererID: ObjectId,
	customerID: ObjectId,
	customerType: String,
	totalOrderPrice: Number,
	commission: Number,
	netOrderPrice: Number,
	orderStatus: String,
	paymentIntentID: String,
	paymentType: String,
	paymentStatus: String,
	pickupTime: Date,
}, {
    timestamps: true
});

//Connect to specific database
const db = mongoose.connection.useDb('foodiebee');

// create the model
module.exports = db.model('lunchorder', orderSchema, 'lunchorder');