var express = require('express');
var router = express.Router();
var Review = require('../../models/review');
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
var moment = require('moment');

router.get('/getreview', passport.authenticate('jwt', {session: false}), (req, res) => {

    const { user } = req;
    var userID = user.customerID

	var matchquery = {};

    if (typeof req.query.lteDate !== 'undefined' && typeof req.query.gteDate !== 'undefined') {
		var gteDate = moment(req.query.gteDate, 'DD MMM, YYYY').toDate()
		var lteDate = moment(req.query.lteDate, 'DD MMM, YYYY').add(1, 'days').toDate()
        matchquery = {"createdAt":{$gte: new Date(gteDate.toISOString()),$lte: new Date(lteDate.toISOString())}}
    }

    if (typeof req.query.catererID !== 'undefined') {
        matchquery.catererID = new ObjectId(req.query.catererID)
    }
 
    matchquery.customerID = new ObjectId(userID)

    Review.aggregate([ 
        {$match: matchquery},
        {$lookup: {
            from: "caterer", 
            localField: "catererID", 
            foreignField: "_id", 
            as: "catererDetails" }
        },
        {$lookup: {
            from: "customer", 
            localField: "customerID", 
            foreignField: "_id", 
            as: "customerDetails" }
        },
        { $sort : { createdAt : -1 } }
      ], (err,doc) => {
         if (err) return res.status(500).send({ error: err });
         return res.status(200).json(doc);
      });
});


router.post('/addreview', passport.authenticate('jwt', {session: false}), (req, res) => {
	
	const { user } = req;
    var userID = user.customerID

    // create the new menu
    var newData = req.body
    var newReview = new Review(newData);
    newReview.customerID = new ObjectId(userID)

    newReview.save(function(err, doc, numAffected) {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else {
            return res.status(200).json(doc)
        }
    });
})


router.put('/updatereview', passport.authenticate('jwt', {session: false}), (req, res) => {

    const { user } = req;
    var userID = user.customerID

    var matchquery;
    matchquery = {customerID: new ObjectId(userID)}

    if (typeof req.query._id === 'undefined') {
        matchquery._id = new ObjectId()
    }
    else {
        matchquery._id = new ObjectId(req.query._id)
    }
   
    var updateData = req.body
    console.log(updateData)
   
    Review.findOneAndUpdate(matchquery, {$set: updateData}, (err, doc) => {
        if (err) {
            console.log(err)
            return res.status(500).send({ error: err });
        }
        else {
            console.log(doc)
            res.status(201).json(doc);
        }
    });
});

router.get('/get_caterer_review',  (req, res) => {

	var matchquery = {};

    if (typeof req.query.lteDate !== 'undefined' && typeof req.query.gteDate !== 'undefined') {
		var gteDate = moment(req.query.gteDate, 'DD MMM, YYYY').toDate()
		var lteDate = moment(req.query.lteDate, 'DD MMM, YYYY').add(1, 'days').toDate()
        matchquery = {"createdAt":{$gte: new Date(gteDate.toISOString()),$lte: new Date(lteDate.toISOString())}}
    }

    if (typeof req.query.catererID !== 'undefined') {
        matchquery.catererID = new ObjectId(req.query.catererID)
    }
   
    Review.aggregate([ 
        {$match: matchquery},
        {$lookup: {
            from: "caterer", 
            localField: "catererID", 
            foreignField: "_id", 
            as: "catererDetails" }
        },
        {$lookup: {
            from: "customer", 
            localField: "customerID", 
            foreignField: "_id", 
            as: "customerDetails" }
        },
        { $sort : { createdAt : -1 } }
      ], (err,doc) => {
         if (err) return res.status(500).send({ error: err });
         return res.status(200).json(doc);
      });
});

module.exports = router;
