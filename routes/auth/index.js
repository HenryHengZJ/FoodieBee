var express = require('express');
var router = express.Router();
var randtoken = require('rand-token') 
const jwt = require('jsonwebtoken');
var passport = require('passport');
var Customer = require('../../models/customer');
const crypto = require('crypto');
var mail = require('../../nodeMailerWithTemp');
var ObjectId = require('mongodb').ObjectID;
var bcrypt   = require('bcrypt-nodejs');
var twiliocall = require('../../twilioAction')
const VoiceResponse = require('twilio').twiml.VoiceResponse;
require('dotenv').config();

router.post('/customersignup', (req, res) => {
	
    var email = req.body.customerEmail.toLowerCase();

	Customer.findOne({ 'customerEmail' :  email }, function(err, customer) {
		// if there are any errors, return the error
		if (err) {
			return res.status(404).json({
				'message': err
			});
		}
		// check to see if theres already a customer with that email
		if (customer) {
			return res.status(404).json({
				'message': 'email existed'
			});
		} 
		else {
			// create the customer
			var newCustomer = new Customer(req.body);
            newCustomer.customerPassword = newCustomer.generateHash(req.body.customerPassword);
            console.log(newCustomer)
            newCustomer.save(function(err, doc, numAffected) {
                if (err) {
                    return res.status(500).send({ error: err });
                }
                else {
                    res.status(200).json(newCustomer)
                }
                
            });
		}
	});
});

router.post('/resetpassword', (req, res) => {
	
    var email = req.body.customerEmail.toLowerCase();

	Customer.findOne({ 'customerEmail' :  email }, function(err, customer) {
		// if there are any errors, return the error
		if (err) {
			return res.status(404).json({
				'message': err
			});
		}
		// check to see if theres already a customer with that email
		else if (!customer) {
			return res.status(404).json({
				'message': 'user not exist'
			});
		} 
		else {
			// update the customer resetpassword token
            const token = crypto.randomBytes(20).toString('hex');
            customer.update({
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 360000,
            }).then(() => 
                {
                    var urlhost = "";
                    if (process.env.NODE_ENV === 'development') {
                        urlhost = "http://localhost:5000/"
                    }
                    else {
                        urlhost = "https://foodiebee.herokuapp.com/"
                    }
                    
                    mail.sendResetPasswordEmail('/templates/resetpassword/email.html', email, `${urlhost}/resetpassword/${token}`);
                    res.status(200).json({
                        'customerID': customer._id,
                    });
                }
            );
		}
	});
});

router.post('/customerlogin', (req, res) => {

   passport.authenticate(
      'customer-login',
      { session: false },
      (error, user) => {
  
        if (error || !user) {
            console.log('5')
            console.log('user = ', user)
          res.status(400).json({ 'error': error });
        }
        else {
            /** This is what ends up in our JWT */
            const refresh_payload = {
                customerID: user._id,
                customerName: user.customerFirstName,
                customerEmail: user.customerEmail,
                customerCompanyID: user.customerCompanyID,
            };

            const refreshToken = jwt.sign(refresh_payload, process.env.jwtSecretKey, {expiresIn: '365d'} );

            const payload = {
                customerID: user._id,
                customerName: user.customerFirstName,
                customerEmail: user.customerEmail,
                customerCompanyID: user.customerCompanyID,
                refreshToken: refreshToken,
            };

            /** assigns payload to req.user */
            req.login(payload, {session: false}, (error) => {
                if (error) {
                    console.log('6')
                    res.status(400).send({ error });
                }
                else {
                    /** generate a signed json web token and return it in the response */
                    const token = jwt.sign(payload, process.env.jwtSecretKey, {expiresIn: '30m'} );

                    console.log(token)

                    /** assign our jwt to the cookie */
                    res.cookie('jwt', token, { httpOnly: true,});
                    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000});
                    res.cookie('userName', user.customerFirstName, {maxAge: 365 * 24 * 60 * 60 * 1000});
                    res.status(200).header('x-auth', token).json(payload);
                }
            });
        }
      },
    )(req, res);
});

router.put('/updatepassword', (req, res) => {

	var matchquery;
    matchquery = {_id: new ObjectId(req.query._id)}

    var userpassword = req.body.customerPassword
    var updateData = {
        customerPassword: bcrypt.hashSync(userpassword, bcrypt.genSaltSync(8), null)
    }

    Customer.findOneAndUpdate(matchquery, {$set: updateData}, {runValidators: true}, (err, doc) => {
        if (err) return res.status(500).send({ error: err });
        return res.status(201).json(doc);
    });
});

router.get('/getresetpassword', (req, res) => {
    console.log(req.query.resetPasswordToken)
    Customer.findOne({
        resetPasswordToken: req.query.resetPasswordToken,
      }).then((customer) => {
        if (customer === null) {
          console.error('password reset link is invalid');
          res.status(403).send('password reset link is invalid');
        } 
        else if (new Date() > new Date(customer.resetPasswordExpires)) {
            console.error('password reset link has expired');
            res.status(403).send('password reset link has expired');
        }
        else {
          res.status(200).send({
            'customerID': customer._id,
          });
        }
      });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.clearCookie('userName')
    res.clearCookie('refreshToken')
    res.status(200).clearCookie('jwt', {path: '/'}).json({message: "successfully logout"});
});

module.exports = router;