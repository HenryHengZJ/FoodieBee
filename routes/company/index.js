var express = require('express');
var router = express.Router();
var Company = require('../../models/company');
var CatererPublished = require('../../models/catererPublished');
var LunchMenuPublished = require('../../models/lunchMenuPublished');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');

router.get('/getcompany', (req, res) => {

    var matchquery = {};
    
	if (typeof req.query.companyName !== 'undefined')
	{
		matchquery.companyName = {$regex: "^" + req.query.companyName,$options:'i'}
	}

	if (typeof req.query.companyID !== 'undefined')
	{
		matchquery._id = req.query.companyID
	}

	var q = Company.find(matchquery).limit(5);
	q.exec((err, doc) => {
        if (err) return res.status(500).send({ error: err });
		if (doc === null) return res.status(404).send({ error: 'doc not found' });
        return res.status(200).json(doc);
    });
}); 

router.get('/getdailycaterer', (req, res) => {

    var matchquery = {};

	if (typeof req.query.companyID !== 'undefined')
	{
		matchquery._id = req.query.companyID
	}

	var dailyCatererDate = ""

	if (typeof req.query.date !== 'undefined') {
        dailyCatererDate = req.query.date
	} 

	Company.findOne(matchquery, (company_err, company_doc) => {
        if (company_err) {
			return res.status(500).send({ error: company_err });
		}
		else if (company_doc === null) {
			return res.status(404).send({ error: 'doc not found' });
		}
		else {
			var catererID = ""
			for(var i = 0; i < company_doc.dailyCaterer.length; i++){
				if (company_doc.dailyCaterer[i].date === dailyCatererDate) {
					catererID = company_doc.dailyCaterer[i].catererID
				}
			}
			findCatererDetails(catererID, function(err, caterers_details) {
				if (err) {
					return res.status(500).send({ error: err });
				}
				else {
					findLunchMenuPublished(catererID, function(err, lunch_details) {
						if (err) {
							return res.status(500).send({ error: err });
						}
						else {
							var returndoc = {}
							returndoc.catererDetails = caterers_details
							returndoc.menuitems = lunch_details
							console.log(returndoc)
							return res.status(200).json([returndoc]);
						}
					});
				}
			});
		}
    });
});

router.post('/postcompany', (req, res) => {

	// create the company
	var newCompanyDetails = new Company(req.body);
	newCompanyDetails.save(function(err, doc, numAffected) {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else {
			console.log(doc);
			insertDailyCaterer(doc._id, function(err, updated_doc) {
				if (err) {
                    return res.status(500).send({ error: err });
                }
                else {
					res.status(200).json(updated_doc)
				}
			})
		}
	});	

});


var insertDailyCaterer = function(companyID, callback) {

    var matchquery = {_id: companyID};

    Company.find(matchquery, (err,doc) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else {
            if (doc.length > 0) {
                let promiseArr = [];
                for(var i = 0; i < doc.length; i++){
                    var companyID = doc[i]._id
                    promiseArr.push(updateAction(companyID))
                }

                Promise.all(promiseArr)
                .then((result) => {
                    console.log('result = ', result)
                    callback (null, result)
                })
                .catch((err) => {
                    console.log(err)
                    callback (err)
                })
            }
            else {
                callback ("doc not found")
            }
        }
     });
}

function updateAction(companyID) {
    return new Promise((resolve, reject) => {

		CatererPublished.find({status: "verified"}, (err,doc) => {
			if (err) {
				return res.status(500).send({ error: err });
			}
			else {
				var max = doc.length-1
				var min = 0
				var dateList = getTheDate();
				var catererIDArray = []
				var updateDailyCatererArray = []
				for(var i = 0; i < 5; i++){
					var randomedIndex = Math.floor(Math.random() * (max - min + 1)) + min;
					var catererID = doc[randomedIndex]._id.toString()
					while (catererIDArray.includes(catererID)) {
						randomedIndex = Math.floor(Math.random() * (max - min + 1)) + min;
						catererID = doc[randomedIndex]._id.toString()
					}
					catererIDArray.push(doc[randomedIndex]._id.toString())
					var date = dateList[i]
					var count = 1
					var updateDailyCaterer = {
						date: date,
						count: count,
						catererID: doc[randomedIndex]._id,
					}
					updateDailyCatererArray.push(updateDailyCaterer)
				}
				var updateData = {}
				updateData = {dailyCaterer: updateDailyCatererArray}
				Company.findOneAndUpdate({_id: companyID}, {$set: updateData}, {returnOriginal: false, runValidators: true}, (updated_err, updateddoc) => {
					if (updated_err) {
						reject(updated_err)
					}
					else {
						resolve(updateddoc)
					}
				})   
			}
		})
    });
 }
 
function getTheDate() {

	var dateList = [];
	
	var todayDate = new Date();
    var mondayOfTheWeek = getMonday(todayDate);
    var dayOfTheWeek = null;

    if (todayDate.getDay() === 0 || todayDate.getDay() === 6) {
      //detect if weekends, if yes, get next monday
      mondayOfTheWeek = new Date(mondayOfTheWeek.setDate(mondayOfTheWeek.getDate() + 7));

      dayOfTheWeek = mondayOfTheWeek;

      for (let i = 0; i < 5; i++) {
        var newAddedDate = moment(dayOfTheWeek).format("YYYY-MM-DD");
        dateList.push(newAddedDate);
        dayOfTheWeek = new Date(
          dayOfTheWeek.setDate(dayOfTheWeek.getDate() + 1)
        );
      }
	} 
	else {
	  //Get Monday of current weekday
      dayOfTheWeek = mondayOfTheWeek;

      for (let i = 0; i < 5; i++) {
        var newAddedDate2 = moment(dayOfTheWeek).format("YYYY-MM-DD");
        dateList.push(newAddedDate2);
        dayOfTheWeek = new Date(
          dayOfTheWeek.setDate(dayOfTheWeek.getDate() + 1)
        );
      }
	}
	
	return(dateList)
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};


var findCatererDetails = function(catererID, callback) {
	
	var matchquery = {};
	
    if (typeof catererID !== 'undefined') {
        matchquery = {_id: catererID}
    }
	
	CatererPublished.findOne(matchquery, (err, doc) => {
		if (err) {
			callback (err)
		}
		else {
			callback (null, doc)   
		}
	});
}

var findLunchMenuPublished = function(catererID, callback) {
	
	var matchquery = {};
	
    if (typeof catererID !== 'undefined') {
        matchquery = {catererID: catererID}
    }
	
	LunchMenuPublished.find(matchquery, (err, doc) => {
		if (err) {
			callback (err)
		}
		else {
			callback (null, doc)   
		}
	});
}

module.exports = router;
