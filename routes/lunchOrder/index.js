var express = require('express');
var router = express.Router();
var LunchOrder = require('../../models/lunchOrder');
var Customer = require('../../models/customer');
var Caterer = require('../../models/caterer');
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
var moment = require('moment');
var twiliocall = require('../../twilioAction')
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var mail = require('../../nodeMailerWithTemp');
require('dotenv').config();


router.post('/addlunchorder', passport.authenticate('jwt', {session: false}), (req, res) => {
	
	const { user } = req;
    var userID = user.customerID

    // create the new menu
    var newData = req.body
	var newLunchOrder = new LunchOrder(newData);
	newLunchOrder.customerID = new ObjectId(userID)
	
	var matchquery = {
		catererID: new ObjectId(req.body.catererID),
		customerID: new ObjectId(userID)
	}
	
	LunchOrder.find(matchquery).exec((err,doc) => {
        if (err) {
			return res.status(500).send({ error: err });
		}
		else {
			//If doc exists => customer has ordered from this restaurant before
			if (doc.length > 0) {
				newLunchOrder.customerType = "recurring"
			}
			else {
				newLunchOrder.customerType = "new"
			}
			
			var lunchorderquery = {};
			lunchorderquery.catererID = new ObjectId(req.body.catererID)
			var lunchorder_exec =  LunchOrder.find(lunchorderquery).sort({createdAt: -1}).limit(1)
			lunchorder_exec.exec((err,doc) => {
				if (err) {
					return res.status(500).send({ error: err });
				}
				else {
					if (doc.length > 0) {
						var lastOrderNumber = doc[0].orderNumber
						var newOrderNumber = parseInt(lastOrderNumber) + 1
						newLunchOrder.orderNumber = newOrderNumber.toString()
					}
					else {
						var lastOrderNumber = "1000"
						var newOrderNumber = parseInt(lastOrderNumber) + 1
						newLunchOrder.orderNumber = newOrderNumber.toString()
					}

					//Now, add new order
					newLunchOrder.save(function(err, doc, numAffected) {
						if (err) {
							return res.status(500).send({ error: err });
						}
						else {
							return res.status(200).json(doc)
						}
					});
				}
			});
		}
    })
});


router.get('/getlunchorder', passport.authenticate('jwt', {session: false}),  (req, res) => {

    const { user } = req;
    var userID = user.customerID

    var matchquery =  {};
    matchquery.customerID = new ObjectId(userID)

    if (typeof req.query.lteDate !== 'undefined' && typeof req.query.gteDate !== 'undefined') {
		var gteDate = moment(req.query.gteDate, 'ddd, DD MMM YYYY').toDate()
		var lteDate = moment(req.query.lteDate, 'ddd, DD MMM YYYY').add(1, 'days').toDate()
        matchquery.createdAt = {$gte: new Date(gteDate.toISOString()),$lte: new Date(lteDate.toISOString())}
    }
	
    /*LunchOrder.find(matchquery).sort({createdAt: -1}).exec((err,doc) => {
        if (err) return res.status(500).send({ error: err });
        return res.status(200).json(doc);
    });*/

	LunchOrder.aggregate([ 
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

router.put('/updatelunchorder', passport.authenticate('jwt', {session: false}), (req, res) => {

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

    if (typeof req.body.pickupTime !== 'undefined') {
        updateData.pickupTime = new Date(req.body.pickupTime)
    }

    console.log(updateData)
    console.log(matchquery)

    LunchOrder.findOneAndUpdate(matchquery, {$set: updateData}, (err, doc) => {
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

module.exports = router;
