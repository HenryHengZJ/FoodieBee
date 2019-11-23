var express = require('express');
var router = express.Router();
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);

/*router.post('/create_customer_card', (req, res) => { 

	stripe.customers.createSource(
	  req.body.customerPaymentAccountID,
	  {
		  source: req.body.cardToken,
	  },
	  function(err, card) {
      if (err) return res.status(500).send({ error: err });
          return res.send(card);
      }
    );
	
});

router.delete('/delete_customer_card', (req, res) => { 
	
	stripe.customers.deleteSource(req.query.customerPaymentAccountID, req.query.cardID, function(err, confirmation) {
		if (err) return res.status(500).send({ error: err });
		res.status(200).json(confirmation);
	});
	
});*/


router.post('/save_customer_card', (req, res) => { 

	stripe.paymentMethods.attach(req.body.paymentID, {customer: req.body.customerPaymentAccountID}, function(err, paymentMethod) {
		  if (err) return res.status(500).send({ error: err });
      stripe.customers.update(
        req.body.customerPaymentAccountID,
        {invoice_settings: {default_payment_method: paymentMethod.id}},
          function(err, customer) {
            if (err) {
              console.log(err)
              return res.status(500).send({ error: err });
            }
            else {
              return res.status(200).json(paymentMethod);
            }
        }
      );
	});
	
});

router.get('/get_customer_card', (req, res) => { 

	stripe.paymentMethods.list({ customer: req.query.customerPaymentAccountID, type: "card" }, function(err, paymentMethods) {
		  if (err) {
        console.log(err)
        return res.status(500).send({ error: err });
      }
      else {
        return res.send(paymentMethods);
      }
	});
	
});

router.delete('/detach_customer_card', (req, res) => { 
	
	stripe.paymentMethods.detach(req.query.paymentID, function(err, paymentMethod) {
		    if (err) {
          console.log(err)
          return res.status(500).send({ error: err });
        }
        else {
          return res.send(paymentMethod);
        }
	  }
	);
});

router.put('/update_customer_card', (req, res) => { 

  var updatebody = req.body

  console.log(updatebody)
	
  stripe.customers.update(
    req.body.customerPaymentAccountID,
    {invoice_settings: {default_payment_method: req.body.paymentID}},
      function(err, customer) {
        if (err) {
          console.log(err)
          return res.status(500).send({ error: err });
        }
        else {
          return res.status(201).json(customer);
        }
    }
  );

});


router.put('/update_customer_paymentaccount', (req, res) => {

  var updatebody = req.body

  console.log(updatebody)

	stripe.customers.update(
    req.query.customerPaymentAccountID,
    updatebody,
      function(err, customer) {
        if (err) {
          console.log(err)
          return res.status(500).send({ error: err });
        }
        else {
          res.status(201).json(customer);
        }
    }
  );
	
});

router.post('/create_customer_paymentaccount', (req, res) => { 

	stripe.customers.create({
		name: req.body.name,
		email: req.body.email,
	}, function(err, customer) {
    if (err) {
      console.log(err)
      return res.status(500).send({ error: err });
    }
    else {
      stripe.paymentMethods.attach(req.body.paymentID, {customer: customer.id}, function(err, paymentMethod) {
        if (err) {
          console.log(err)
          return res.status(500).send({ error: err });
        }
        else {
          stripe.customers.update(
            customer.id,
            {invoice_settings: {default_payment_method: req.body.paymentID}},
            function(err, updatedcustomer) {
              if (err) {
                console.log(err)
                return res.status(500).send({ error: err });
              }
              else {
                return res.status(200).send(updatedcustomer);
              }
            }
          );
        }
      });
    }
	});
	
});

router.get('/get_customer_paymentaccount', (req, res) => { 

	stripe.customers.retrieve(req.query.customerPaymentAccountID, function(err, customer) {
		if (err) return res.status(500).send({ error: err });
		res.status(200).json(customer);
	});
	
});

router.post('/customer_makepayment', (request, res) => { 
  console.log(request.body)
  var amount = parseFloat(request.body.totalOrderPrice) * 100
  console.log('amount = ', amount)
  var commission = parseInt(amount * 0.11)
  if (typeof request.body.commission !== 'undefined') {
    commission = parseInt(amount * parseFloat(request.body.commission))
  }
  console.log('commission = ', commission)
	stripe.paymentIntents.create({
		payment_method: request.body.paymentMethodID,
		payment_method_types: ['card'],
		save_payment_method: true,
		currency: 'eur',
		application_fee_amount: commission,
		customer: request.body.customerPaymentAccountID,
		amount: amount,
    confirmation_method: 'manual',
    receipt_email: request.body.customerEmail,
		transfer_data: {
		  destination: request.body.catererPaymentAccountID,
		},
	}, function(err, paymentIntent) {
		if (err) {
      console.log(err)
      return res.status(500).send({ error: err });
    }
    else {
      res.status(200).json(paymentIntent);
    }
	});
});


router.post('/create_subscription', (req, res) => { 
  var trialvalid = req.query.trialvalid
  if (trialvalid === "true") {
    trialvalid = true
  }
  else {
    trialvalid = false
  }
  var customerPaymentAccountID = req.body.customerPaymentAccountID
  console.log(customerPaymentAccountID)
	stripe.products.create({
	  name: 'FoodieBee Prime',
	  type: 'service',
	}, function(err, product) {
		if (err) {
			return res.status(500).send({ error: err });
		}
		else {
			var productID = product.id
			console.log(productID)
			stripe.plans.create({
			  nickname: "Prime Monthly",
			  product: productID,
			  amount: 499,
			  currency: "eur",
			  interval: "month",
			  usage_type: "licensed",
			  trial_period_days: 30,
			}, function(err, plan) {
				if (err) {
					return res.status(500).send({ error: err });
				}
				else {
					var planID = plan.id
					console.log(planID)
					stripe.subscriptions.create({
					  customer: customerPaymentAccountID,
					  items: [
						{
						  plan: planID,
						},
					  ],
					  trial_from_plan: trialvalid,
					  expand: ['latest_invoice.payment_intent'],
					}, function(err, subscription) {
						if (err) {
              console.log(err)
							return res.status(500).send({ error: err });
						}
						else {
							console.log(subscription)
							res.status(200).json(subscription);
						}
					  }
					);
				}
			});
		}
	});
});

router.delete('/cancel_subscription', (req, res) => { 
	var subscriptionID = req.query.subscriptionID
	stripe.subscriptions.del(
	  subscriptionID,
	  function(err, confirmation) {
		if (err) {
			return res.status(500).send({ error: err });
		}
		else {
			console.log(confirmation)
			res.status(200).json(confirmation);
		}
	  }
	);
});

router.delete('/cancel_paymentIntent', (req, res) => { 
	var paymentIntentID = req.query.paymentIntentID
	stripe.paymentIntents.cancel(
	  paymentIntentID,
	  function(err, confirmation) {
		if (err) {
			return res.status(500).send({ error: err });
		}
		else {
			console.log(confirmation)
			res.status(200).json(confirmation);
		}
	  }
	);
});


//////////////////////////////////////CATERER///////////////////////////////////////////////////


router.post('/create_caterer_paymentaccount', (req, res) => { 

  console.log(req.body)

  var body = req.body
  body.type = 'custom';
  body.tos_acceptance =  {
    date: Math.floor(Date.now() / 1000),
    ip: req.connection.remoteAddress // Assumes you're not using a proxy
  };

  console.log(body)

    stripe.accounts.create(body, function(err, acct) {
      // asynchronously called
      if (err) return res.status(500).send({ error: err });
      return res.send(acct);
    });
	
});

router.get('/get_caterer_paymentaccount', (req, res) => { 

	stripe.accounts.retrieve(req.query.catererPaymentAccountID, function(err, connectedacc) {
		if (err) return res.status(500).send({ error: err });
		res.status(200).json(connectedacc);
	});
	
});


router.get('/get_caterer_person', (req, res) => { 

	stripe.accounts.listPersons(
    req.query.catererPaymentAccountID,
    function(err, persons) {
      if (err) return res.status(500).send({ error: err });
      res.status(200).json(persons);
    }
  );
	
});

router.get('/get_caterer_balance', (req, res) => { 

  stripe.balance.retrieve({
    stripe_account: req.query.catererPaymentAccountID
  }, function(err, connectedacc) {
		if (err) return res.status(500).send({ error: err });
		res.status(200).json(connectedacc);
	});
	
});


router.post('/create_caterer_external_bankaccount', (req, res) => { 

    stripe.accounts.createExternalAccount(req.body.catererPaymentAccountID,{external_account: req.body.bankacctoken}, function(err, connectedacc) {
      if (err) return res.status(500).send({ error: err });
      res.status(200).json(connectedacc);
    });
	
});

router.put('/update_caterer_external_bankaccount', (req, res) => { 

  stripe.accounts.updateExternalAccount( req.body.catererPaymentAccountID, req.body.bankID,
    { default_for_currency: true },
    function(err, bank_account) {
      if (err) return res.status(500).send({ error: err });
      res.status(201).json(bank_account);
  });

});

router.delete('/delete_caterer_external_bankaccount', (req, res) => { 

  console.log(req.query.catererPaymentAccountID)

  console.log(req.query.bankID)

  stripe.accounts.deleteExternalAccount(req.query.catererPaymentAccountID, req.query.bankID, function(err, confirmation) {
    if (err) {
      console.log(err)
      return res.status(500).send({ error: err });
    }
    else {
      res.status(200).json(confirmation);
    }
  });

});


router.put('/update_caterer_paymentaccount', (req, res) => { 

    var updatebody = req.body.updatebody

    console.log(updatebody)

    stripe.accounts.update(
        req.body.catererPaymentAccountID,
        updatebody,
        function(err, connectedacc) {
            if (err) {
              console.log(err)
              return res.status(500).send({ error: err });
            }
            else {
              res.status(201).json(connectedacc);
            }
        });
    
});

router.put('/update_caterer_person', (req, res) => { 

  var persondetails = req.body.persondetails

  console.log(persondetails)

  stripe.accounts.createPerson(
    req.body.catererPaymentAccountID,
    persondetails,
    function(err, person) {
      if (err) {
        console.log(err)
        return res.status(500).send({ error: err });
      }
      else {
        res.status(201).json(person);
      }
    }
  );
  
});


router.post('/caterer_confirm_payment', (request, res) => { 
	stripe.paymentIntents.confirm(request.body.paymentIntentID, function(err, intent) {
		if (err) return res.status(500).send({ error: err });
		res.status(200).json(intent);
	});
});


router.post('/confirm_payment2', async (request, response) => {
    try {
      let intent;
      if (request.body.payment_method_id) {
        console.log(request.body.payment_method_id)
        // Create the PaymentIntent
        intent = await stripe.paymentIntents.create({
          payment_method: request.body.payment_method_id,
          payment_method_types: ['card'],
          currency: 'eur',
          application_fee_amount: 123,
          customer: request.body.customerPaymentAccountID,
          statement_descriptor: 'New Order',
          amount: 1099,
          confirmation_method: 'manual',
          confirm: true,
          transfer_data: {
            destination: request.body.catererPaymentAccountID,
          },
        });
      } else if (request.body.payment_intent_id) {
        console.log(request.body.payment_intent_id)
        intent = await stripe.paymentIntents.confirm(
          request.body.payment_intent_id
        );
      }
      // Send the response to the client
      response.send(generate_payment_response(intent));
    } catch (e) {
      // Display error on client
      return response.send({ error: e.message });
    }
  });
  
  const generate_payment_response = (intent) => {
    if (
      intent.status === 'requires_action' &&
      intent.next_action.type === 'use_stripe_sdk'
    ) {
      // Tell the client to handle the action
      return {
        requires_action: true,
        payment_intent_client_secret: intent.client_secret
      };
    } else if (intent.status === 'succeeded') {
      // The payment didn’t need any additional actions and completed!
      // Handle post-payment fulfillment
      return {
        success: true
      };
    } else {
      // Invalid status
      return {
        error: 'Invalid PaymentIntent status'
      }
    }
  };
  



module.exports = router;
