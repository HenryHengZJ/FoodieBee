
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
var fs = require('fs');
var Admin = require('./models/admin');
var moment = require('moment');
require('dotenv').config();

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

smtpTransport = nodemailer.createTransport(smtpTransport({
    //  service: 'gmail',
  //  host: 'smtp.gmail.com',
    host: 'smtp.zoho.com',
   // secure: mailConfig.secure,
  //  port: mailConfig.port,
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.zohoUser,
        pass: process.env.zohoPassword
    }
}));

exports.sendWelcomeEmail = function (path, body, password) {
    console.log(password)
    console.log(body.catererEmail)
    readHTMLFile(__dirname + path, function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
             useremail: body.catererEmail,
             userpassword: password
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'FoodieBee <support@foodiebee.eu>',
            to : body.catererEmail,
            subject : 'Welcome to FoodieBee',
            html : htmlToSend
         };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    });
}

exports.sendRejectedEmail = function (path, sendtoemail) {
    readHTMLFile(__dirname + path, function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
             useremail: sendtoemail,
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'FoodieBee <support@foodiebee.eu>',
            to : sendtoemail,
            subject : 'Thank you for your interest in FoodieBee',
            html : htmlToSend
         };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    });
}

exports.sendNewCatererRegisterEmail = function (path, sendtoemail) {
    readHTMLFile(__dirname + path, function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'FoodieBee <support@foodiebee.eu>',
            to : sendtoemail,
            subject : 'Thanks for your interest',
            html : htmlToSend
         };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    });
}

exports.sendNewCatererRegisterAdminEmail = function (path, body) {

    Admin.find( (err,admin) => {
        if (err) return res.send(err);
		var emailArray = [];
		
		for(var i = 0; i < admin.length;i++){
			 emailArray.push(admin[i].adminEmail)
		}
        //console.log(JSON.stringify(emailArray))

        var finalEmailArray = JSON.stringify(emailArray).replace("[", "").replace("]", "")
        console.log(finalEmailArray)

        readHTMLFile(__dirname + path, function(err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                catererEmail    	: body.catererEmail,
                catererName	 	 	: body.catererName,
                catererPhoneNumber  : body.catererPhoneNumber,
                catererAddress      : body.catererAddress,
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: 'FoodieBee <support@foodiebee.eu>',
                to : finalEmailArray,
                subject : 'NewCaterer to FoodieBee',
                html : htmlToSend
             };
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                }
            });
        });

       // return res.status(200).json(admin);
      });
}

exports.sendCustomerMessageEmail = function (path, body) {

    Admin.find( (err,admin) => {
        if (err) {
            return res.send(err);
        }
        else {
            var emailArray = [];
            
            for(var i = 0; i < admin.length;i++){
                emailArray.push(admin[i].adminEmail)
            }

            var finalEmailArray = JSON.stringify(emailArray).replace("[", "").replace("]", "")

            readHTMLFile(__dirname + path, function(err, html) {
                var template = handlebars.compile(html);
                var replacements = {
                    email    	: body.email,
                    message	 	 	: body.message,
                };
                var htmlToSend = template(replacements);
                var mailOptions = {
                    from: 'FoodieBee <support@foodiebee.eu>',
                    to : finalEmailArray,
                    subject : 'New Message',
                    html : htmlToSend
                };
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log(response);
                    }
                });
            });
        }

       // return res.status(200).json(admin);
      });
}


exports.sendResetPasswordEmail = function (path, sendtoemail, resetlink) {
    readHTMLFile(__dirname + path, function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            resetlink: resetlink
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'FoodieBee <support@foodiebee.eu>',
            to : sendtoemail,
            subject : 'Password Reset',
            html : htmlToSend
         };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
            else {
                console.log(response);
            }
        });
    });
}

////////////////////////////////LUNCH//////////////////////////////////////////////////////////////////

exports.sendCustomerLunchOrderEmail = function (path,  orderdetails,  catererDetails, customerEmail, orderStatus) {
  
    getCustomerLunchOrderVariables(orderdetails, orderStatus, function(err, totalRow, str_orderDescrip, str_orderStatus, str_orderID, str_orderNumber, str_updatedAt, str_pickupTime, str_subtotal, str_deliveryfee, str_ordertotal, str_footer1) {

        readHTMLFile(__dirname + path, function(err, html) {
            var template = handlebars.compile(html);

            var catererName = catererDetails.catererName
            var catererFullAddress = catererDetails.catererFullAddress
            var catererLatitude = catererDetails.location.coordinates[0]
            var catererLongitude = catererDetails.location.coordinates[1]
            var mapLink = "https://maps.google.com?q=" + catererLatitude + "," + catererLongitude

            var replacements = {
                catererName: catererName,
                catererFullAddress: catererFullAddress,
                mapLink: mapLink,
                newrow: totalRow,
                str_orderDescrip: str_orderDescrip,
                str_orderStatus: str_orderStatus,
                str_orderID: str_orderID,
                str_orderNumber: str_orderNumber,
                str_updatedAt: str_updatedAt,
                str_pickupTime: str_pickupTime,
                str_subtotal: str_subtotal,
                str_deliveryfee: str_deliveryfee,
                str_ordertotal: str_ordertotal,
                str_footer1: str_footer1
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: 'FoodieBee <support@foodiebee.eu>',
                to : customerEmail,
                subject : orderStatus === "accepted" ? 'Order Accepted' : orderStatus === "rejected" ? 'Order Rejected' : "Order Details",
                html : htmlToSend
             };
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(response);
                }
            });
    
        });

    });

}


exports.sendCatererLunchOrderEmail = function (path,  orderdetails,  catererEmail) {
  
    getCatererLunchOrderVariables(orderdetails, catererEmail, function(err, totalRow, str_orderTitle, str_orderDescrip, str_orderStatus, str_orderDate, str_footer1) {

        readHTMLFile(__dirname + path, function(err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                newrow: totalRow,
                str_orderTitle: str_orderTitle,
                str_orderDescrip: str_orderDescrip,
                str_orderStatus: str_orderStatus,
                str_orderDate: str_orderDate,
                str_footer1: str_footer1
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: 'FoodieBee <support@foodiebee.eu>',
                to : catererEmail,
                subject : 'Pending Order Details',
                html : htmlToSend
             };
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(response);
                }
            });
    
        });

    });

}

var getCustomerLunchOrderVariables = function(orderdetails, orderStatus, callback) {

    var order = orderdetails

    var str_orderDescrip = ""
    var str_orderStatus = ""
    
    if (orderStatus === 'accepted') {
      str_orderDescrip = `<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">Your order status is accepted. <br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">We will notify you again when your meal is arrived.&nbsp;</p> `;
      str_orderStatus = `<span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#32CD32;background:#32CD32;border-width:0px;display:inline-block;border-radius:15px;width:auto;"> <a href="https://foodiebee.eu" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:underline;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#FFFFFF;border-style:solid;border-color:#32CD32;border-width:10px 20px 10px 20px;display:inline-block;background:#32CD32;border-radius:15px;font-weight:600;font-style:normal;line-height:19px;width:auto;text-align:center;">ACCEPTED</a> </span>`
    }
    else if (orderStatus === 'rejected') {
      str_orderDescrip = `<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">Your order status is rejected. <br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">If you have any queries, contact us at <a target="_blank" href="mailto:support@foodiebee.eu" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#47AADA;">support@foodiebee.eu</a></p> `;
      str_orderStatus = `<span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#ff0000;background:#ff0000;border-width:0px;display:inline-block;border-radius:15px;width:auto;"> <a href="https://foodiebee.eu" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:underline;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#FFFFFF;border-style:solid;border-color:#ff0000;border-width:10px 20px 10px 20px;display:inline-block;background:#ff0000;border-radius:15px;font-weight:600;font-style:normal;line-height:19px;width:auto;text-align:center;">REJECTED</a> </span>`
    }
    else if (orderStatus === 'delivered') {
        str_orderDescrip = `<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">Your lunch has been delivered to your office. <br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">Please collect your meal at reception.&nbsp;</p> `;
        str_orderStatus = `<span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#32CD32;background:#32CD32;border-width:0px;display:inline-block;border-radius:15px;width:auto;"> <a href="https://foodiebee.eu" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:underline;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#FFFFFF;border-style:solid;border-color:#32CD32;border-width:10px 20px 10px 20px;display:inline-block;background:#32CD32;border-radius:15px;font-weight:600;font-style:normal;line-height:19px;width:auto;text-align:center;">DELIVERED</a> </span>`
    }

    var str_orderID = order._id;
    
    var str_orderNumber = order.orderNumber;

    var str_updatedAt = moment(order.updatedAt).format("MMM DD, YYYY");

    var str_pickupTime =  moment(order.pickupTime).format("hh:mm A");
  
    var subtotal = order.totalOrderPrice - 0
    var str_subtotal = '€' + Number(subtotal).toFixed(2);
      
    var str_deliveryfee = '€' + Number(0).toFixed(2);
      
    var str_ordertotal = '€' + Number(order.totalOrderPrice).toFixed(2);
     
    var str_footer1 = `This email was sent to ${order.customerDetails[0].customerEmail}. If you have any questions or concerns, please contact us at `
    
    var totalRow = ""

    var orderItem = order.orderItem

    for(var x=0; x<orderItem.length; x++) {

        var newRow = "";
 
        newRow = `<tr style="border-collapse:collapse;"> <td align="left" style="Margin:0;padding-top:5px;padding-bottom:10px;padding-right:20px;padding-left:40px;"> <table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> <tr style="border-collapse:collapse;"> <td width="540" align="left" style="padding:0;Margin:0;"> <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> <tr style="border-collapse:collapse;"> <td align="left" style="padding:0;Margin:0;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;"><br></p> <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;" class="cke_show_border" cellspacing="1" cellpadding="1" border="0"> <tr style="border-collapse:collapse;"> <td style="padding:0;Margin:0;"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:15px;text-decoration:underline;color:#0C9CE2;" href="https://foodiebee.eu">${orderItem[x].title}</a></td> <td style="padding:0;Margin:0;text-align:center;" width="60">${1}</td> <td style="padding:0;Margin:0;text-align:center;" width="100">€${Number(orderItem[x].priceperunit).toFixed(2)}</td> </tr> </table> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;"><br></p> </td> </tr> </table> </td> </tr> </table> </td></tr>`;

        totalRow = totalRow + newRow
    }

    callback(null, totalRow, str_orderDescrip, str_orderStatus, str_orderID, str_orderNumber, str_updatedAt, str_pickupTime, str_subtotal, str_deliveryfee, str_ordertotal, str_footer1)

}

var getCatererLunchOrderVariables = function(orderdetails, catererEmail, callback) {

    var order = orderdetails

    console.log(order)

    var str_orderTitle = "New Order"
    var str_orderDescrip = `<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">You have a new pending order. <br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">You may accept or reject the order from your caterer dashboard.&nbsp;</p> `;
    var str_orderStatus = `<span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#D48344;background:#F6B26B;border-width:0px;display:inline-block;border-radius:15px;width:auto;"> <a href="https://caterer.foodiebee.eu" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:underline;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#FFFFFF;border-style:solid;border-color:#F6B26B;border-width:10px 20px 10px 20px;display:inline-block;background:#F6B26B;border-radius:15px;font-weight:600;font-style:normal;line-height:19px;width:auto;text-align:center;">PENDING</a> </span>`
    
    var str_orderDate = moment(Date.now()).format("MMM DD, YYYY");
     
    var str_footer1 = `This email was sent to ${catererEmail}. If you have any questions or concerns, please contact us at `
    
    var totalRow = ""

    for(var x=0; x< order.length; x++) {
        var newRow = "";
        var orderItemTitle = "1x " + order[x].orderItem[0].title
        var orderItemPrice = order[x].orderItem[0].priceperunit
        var customerName = order[x].customerDetails[0].customerFirstName + " " + order[x].customerDetails[0].customerLastName.charAt(0) + "."
        newRow = `<tr style="border-collapse:collapse;"><td align="left" style="Margin:0;padding-top:5px;padding-bottom:10px;padding-right:20px;padding-left:40px;"><table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"><tr style="border-collapse:collapse;"><td width="540" align="left" style="padding:0;Margin:0;"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"><tr style="border-collapse:collapse;"><td align="left" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;"><br></p><table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;" class="cke_show_border" cellspacing="1" cellpadding="1" border="0"><tr style="border-collapse:collapse;"><td style="padding:0;Margin:0;text-align:center;" width="100">${customerName}</td><td style="padding:0;Margin:0;"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:15px;text-decoration:underline;color:#0C9CE2;" href="https://caterer.foodiebee.eu">${orderItemTitle}</a></td><td style="padding:0;Margin:0;text-align:center;" width="60">€${Number(orderItemPrice).toFixed(2)}</td></tr></table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;"><br></p></td></tr></table></td></tr></table></td></tr>`;
        totalRow = totalRow + newRow
    }

    callback(null, totalRow, str_orderTitle, str_orderDescrip, str_orderStatus, str_orderDate, str_footer1)

}
