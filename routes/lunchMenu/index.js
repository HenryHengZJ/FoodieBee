var express = require('express');
var router = express.Router();
var LunchMenu = require('../../models/lunchMenu');
var Caterer = require('../../models/caterer');
var Company = require('../../models/company');
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
var moment = require('moment');

router.get('/get_lunchmenu',  (req, res) => {

    var company_matchquery =  {};

    if (typeof req.query.companyID !== 'undefined') {
        company_matchquery._id =  req.query.companyID
    }
    
    Company.find(company_matchquery, (company_err, company_doc) => {
        if (company_err) {
            return res.status(500).send({ error: company_err });
        }
        else {
            if (company_doc.length > 0) {
                var latitude = company_doc[0].location.coordinates[0]
                var longitude = company_doc[0].location.coordinates[1]

                var restaurant_matchquery =  {status: "verified", catererPaymentAccountID: { $exists: true }};

                if (typeof longitude !== 'undefined' && typeof latitude !== 'undefined')
                {
                    restaurant_matchquery.location = { $nearSphere: { $geometry: { type: "Point", coordinates: [ parseFloat(latitude), parseFloat(longitude) ] }, $maxDistance: 12000 } }
                }

                if (typeof req.query.cuisine !== 'undefined')
                {
                    restaurant_matchquery.catererCuisine = { $in: req.query.cuisine }
                }

                Caterer.find(restaurant_matchquery, (restaurant_err, restaurant_doc) => {
                    if (restaurant_err) {
                        return res.status(500).send({ error: restaurant_err });
                    }
                    else {
                        if (restaurant_doc.length > 0) {

                            var catererIDArry = []
                            
                            for(var i = 0; i < restaurant_doc.length; i++){
                                catererIDArry.push(restaurant_doc[i]._id)
                            }

                            var activeDayIndex = new Date().getDay();
                            var dayArry = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                            var currentTime = parseInt(moment(new Date()).format("HHmm"));
                            var activeDay = dayArry[currentTime >= 1700 ? activeDayIndex : activeDayIndex-1]
                            var lunchmenu_matchquery =  {selected: true, activeDay: activeDay, catererID: { $in: catererIDArry }};

                            if (typeof req.query.mealTitle !== 'undefined')
                            {
                                lunchmenu_matchquery.title = {$regex: req.query.mealTitle, $options:'i'}
                            }

                            LunchMenu.aggregate([ 
                                {$match: lunchmenu_matchquery},
                                {$lookup: {
                                    from: "caterer", 
                                    localField: "catererID", 
                                    foreignField: "_id", 
                                    as: "catererDetails" }
                                }
                              ], (lunchmenu_err, lunchmenu_doc) => {
                                 if (lunchmenu_err) {
                                     return res.status(500).send({ error: lunchmenu_err });
                                 }
                                 else {
                                    return res.status(200).json(lunchmenu_doc);
                                 }
                              });
                        }
                        else {
                            return res.status(200).json(doc);
                        }
                    }
                })
            }
            else {
                return res.status(404).send({ error: 'doc not found' });
            }
        }
        
    });

})

router.put('/update_lunchmenu', (req, res) => {

    var matchquery;
    if (typeof req.query._id === 'undefined') {
        matchquery= {_id: new ObjectId()}
    }
    else {
        matchquery = {_id: new ObjectId(req.query._id)}
    }
   
    var updateData = req.body

    LunchMenu.findOneAndUpdate(matchquery, {$set: updateData}, {upsert: true, new: true, runValidators: true}, (err, doc) => {
        if (err) return res.status(500).send({ error: err });
        return res.status(201).json(doc);
    });
});

 
module.exports = router;