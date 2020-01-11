var express = require('express');
var router = express.Router();
var Review = require('../../models/review');
var Caterer = require('../../models/caterer');
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
var moment = require('moment');
const jwt = require('jsonwebtoken');

router.get('/getreview', authenticate(), (req, res) => {
    
    const { user, jwttoken } = req;
    var userID = user.customerID
    var token = jwttoken

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
         if (err) {
             return res.status(500).send({ error: err });
         }
         else {
            if (typeof token !== 'undefined') {
                res.cookie('jwt', token, { httpOnly: true,});
            }
            res.status(200).header('x-auth', token).json(doc);
         }
      });
});

router.post('/addreview', authenticate(), (req, res) => {
	
	const { user, jwttoken } = req;
    var userID = user.customerID
    var token = jwttoken

    // create the new menu
    var newData = req.body
    var catererID = newData.catererID
    var newReview = new Review(newData);
    newReview.customerID = new ObjectId(userID)

    newReview.save(function(err, doc, numAffected) {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else {
            updateCatererRating(catererID, true, function(updated_err, updated_data) {
                if (typeof token !== 'undefined') {
                    res.cookie('jwt', token, { httpOnly: true,});
                }
                res.status(200).header('x-auth', token).json(doc)  
            }); 
        }
    });
})


router.put('/updatereview', authenticate(), (req, res) => {

    const { user, jwttoken } = req;
    var userID = user.customerID
    var token = jwttoken

    var matchquery;
    matchquery = {customerID: new ObjectId(userID)}

    if (typeof req.query._id === 'undefined') {
        matchquery._id = new ObjectId()
    }
    else {
        matchquery._id = new ObjectId(req.query._id)
    }
   
    var updateData = req.body
    var catererID = updateData.catererID
    console.log(updateData)
   
    Review.findOneAndUpdate(matchquery, {$set: updateData}, (err, doc) => {
        if (err) {
            console.log(err)
            return res.status(500).send({ error: err });
        }
        else {
            updateCatererRating(catererID, false, function(updated_err, updated_data) {
                if (typeof token !== 'undefined') {
                    res.cookie('jwt', token, { httpOnly: true,});
                }
                res.status(201).header('x-auth', token).json(doc)  
            }); 
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

var updateCatererRating = function(catererID, isNewReview, callback) {

    var matchquery = {}

    matchquery.catererID = new ObjectId(catererID)

    var q = Review.find(matchquery);
	q.exec((err, doc) => {
         if (err) {
            callback (err)
         }
         else {
            if (doc.length > 0) {
                var result = doc.reduce(function (r, a) {
                    r[a.customerRating] = r[a.customerRating] || [];
                    r[a.customerRating].push(a);
                    return r;
                }, Object.create(null));

                var numofRating5 = "5" in result ? result["5"].length : 0
                var numofRating4 = "4" in result ? result["4"].length : 0
                var numofRating3 = "3" in result ? result["3"].length : 0
                var numofRating2 = "2" in result ? result["2"].length : 0
                var numofRating1 = "1" in result ? result["1"].length : 0

                var overallrating = (5*numofRating5 + 4*numofRating4 + 3*numofRating3 + 2*numofRating2 + 1*numofRating1) / (numofRating5+numofRating4+numofRating3+numofRating2+numofRating1)

                var updateData = {
                    rating: overallrating
                }
     
                Caterer.findOneAndUpdate({_id: new ObjectId(catererID)}, {$set: updateData, $inc: {numofreview: isNewReview ? 1 : 0} }, (updateerr, updatedoc) => {
                    if (updateerr) {
                        callback (erupdateerrr)
                    }
                    else {
                        callback (null, doc)
                    }
                }); 
            }
            else {
                callback (null, doc)
            }
         }
    });
};


function authenticate() {
    return (req, res, next) => {
      passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            console.log( 'err = ', err)
            next(err);
        } 
        else if (info) {
           // next(info);
            if (info.name === 'TokenExpiredError') {

                var myDate = new Date();
                myDate.setHours(myDate.getHours() + 24);

                if (req && req.headers.authorization && req.headers.authorization.split(" ")[0] === 'Bearer' && req.headers.authorization.split(" ")[2] === 'Refresh') {
                    const refresh_token = req.headers.authorization.split(" ")[3]
                    console.log('refresh_token =', refresh_token)

                    const jwttoken = req.headers.authorization.split(" ")[1]
                    var decoded = jwt.decode(jwttoken, {complete: true});
                    var decodedPayload = decoded.payload

                    if (decodedPayload.refreshToken === refresh_token) {
                        const payload = {
                            customerID: decodedPayload.customerID,
                            customerName: decodedPayload.customerName,
                            customerEmail: decodedPayload.customerEmail,
                            refreshToken: decodedPayload.refreshToken,
                            expires: myDate, 
                        };
                        const token = jwt.sign(payload, process.env.jwtSecretKey, {expiresIn: '2m'} );
                        req.user = payload;
                        req.jwttoken = token
                        next();
                    }
                    else {
                        res.status(401).send('Unauthorized');
                    }
                }
                else if (req && req.cookies['jwt'] && req.cookies['refreshToken']) {
                    const refresh_token = req.cookies['refreshToken']
                    console.log('refresh_token =', refresh_token)

                    const jwttoken = req.cookies['jwt']
                    var decoded = jwt.decode(jwttoken, {complete: true});
                    var decodedPayload = decoded.payload

                    if (decodedPayload.refreshToken === refresh_token) {
                        const payload = {
                            customerID: decodedPayload.customerID,
                            customerName: decodedPayload.customerName,
                            customerEmail: decodedPayload.customerEmail,
                            refreshToken: decodedPayload.refreshToken,
                            expires: myDate, 
                        };
                        const token = jwt.sign(payload, process.env.jwtSecretKey, {expiresIn: '2m'} );
                        req.user = payload;
                        req.jwttoken = token
                        next();
                    }
                    else {
                        res.status(401).send('Unauthorized');
                    }
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            }
            else {
                res.status(401).send('Unauthorized');
            }
        } 
        else {
            console.log(user)
            req.user = user;
            next();
        }
      })(req, res, next);
    };
  }

module.exports = router;
