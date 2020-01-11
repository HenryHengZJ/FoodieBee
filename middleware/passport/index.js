// load all the things we need
const passport = require('passport');
const LocalStrategy    = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
var ObjectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Customer = require('../../models/customer');

var myLocalConfig = (passport) => {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('customer-login', new LocalStrategy({
	  usernameField: 'email',
	  passwordField: 'password',
	  passReqToCallback : true
	},
	function(req, email, password, done) {
		if (email)
			email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

		// asynchronous
		console.log(email)
		process.nextTick(function() {
			Customer.findOne({ 'customerEmail' :  email }, function(err, customer) {
				// if there are any errors, return the error
				if (err)
				{
					console.log(err)
					return done(err);
				}
				
				// if no customer is found, return the message
				if (!customer)
				{
					console.log('bo lang')
					return done(null, false);
				}
					
				// check customer's password
				if (!customer.validPassword(password))
				{
					console.log('password mmdim')
					return done(null, false);
				}
					
				// all is well, return customer
				else
				{
					return done(null, customer);
				}	
					
			});
		});

	}));
	
	var opts = {}

	opts.jwtFromRequest = function(req) {
		var token = null
		//console.log(req.headers);
		if (req && req.cookies['jwt'])
		{
			token = req.cookies['jwt'];
		}
		else if (req && req.headers.authorization && req.headers.authorization.split(" ")[0] === 'Bearer') {
			token = req.headers.authorization.split(" ")[1]
		}
		return token;
	};
	opts.secretOrKey = process.env.jwtSecretKey;

	passport.use(new JWTStrategy(opts,
	  (jwtPayload, done) => {
		console.log(jwtPayload)
		Customer.findOne({_id: new ObjectId(jwtPayload.customerID)}, function(err, user) {
			if (err) {
				console.log(err)
				return done(err, false);
			}
			if (user) {
				return done(null, jwtPayload);
			} 
			else {
				console.log('no user')
				return done(null, false);
			}
		});
	  }
	));  
};

module.exports = myLocalConfig;