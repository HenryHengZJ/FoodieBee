var express = require('express');
var router = express.Router();
var Customer = require('../../models/customer');
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/getcustomerprofile', authenticate(), (req, res) => {

    const { user, jwttoken } = req;
    var userID = user.customerID
    var token = jwttoken

    var matchquery;
    matchquery = {_id: new ObjectId(userID)}

    Customer.find(matchquery, (err,doc) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
		else if (doc === null) {
            return res.status(404).send({ error: 'doc not found' });
        }
        else {
            if (typeof token !== 'undefined') {
                res.cookie('jwt', token, { httpOnly: true,});
            }
            res.status(200).header('x-auth', token).json(doc)
        }
    });
}); 

router.put('/updatecustomerprofile', authenticate(), (req, res) => {

    const { user, jwttoken } = req;
    var userID = user.customerID
    var token = jwttoken

    var matchquery;
    matchquery = {_id: new ObjectId(userID)}
    
    var updateData = req.body

    console.log(updateData)
    console.log(userID)


    Customer.findOneAndUpdate(matchquery, {$set: updateData}, {runValidators: true}, (err, doc) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else {
            if (typeof token !== 'undefined') {
                res.cookie('jwt', token, { httpOnly: true,});
            }
            res.cookie('userName', doc.customerFirstName, {maxAge: 900000});
            res.status(201).header('x-auth', token).json(doc)
        }
    });
});

router.put('/updatecustomerpassword', authenticate(), (req, res) => {
    
    const { user, jwttoken } = req;
    var userID = user.customerID
    var token = jwttoken

    var matchquery;
    matchquery = {_id: new ObjectId(userID)}
    
    var updateData = req.body
    var originalpassword = updateData.originalpassword
    var newpassword = updateData.newpassword

    Customer.findOne(matchquery, function(err, customer) {
        // if there are any errors, return the error
        if (err) return res.status(500).send({ error: err });
        // if no customer is found, return the message
        if (!customer) return res.status(404).send({ error: err });
        // check customer's password
        if (customer.validPassword(originalpassword))
        {
            customer.update({
                customerPassword: customer.generateHash(newpassword)
            }).then(() => {
                if (typeof token !== 'undefined') {
                    res.cookie('jwt', token, { httpOnly: true,});
                }
                res.status(201).header('x-auth', token).json(customer)
            });
        }
        else {
            return res.status(401).send({ error: 'invalid password' });
        } 
    });
});


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
                        const token = jwt.sign(payload, process.env.jwtSecretKey, {expiresIn: '30m'} );
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
                        const token = jwt.sign(payload, process.env.jwtSecretKey, {expiresIn: '30m'} );
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