
export default {

    /*Caterer API*/
    GETcatererprofile: "/caterer/getcatererprofile",
    GETcaterer: "/caterer/getcaterer",
    POSTnewcaterersignup: "/caterer/newcaterersignup",

    /*Customer API*/
    GETcustomerprofile: "/customer/getcustomerprofile",
    UPDATEcustomerpassword: "/customer/updatecustomerpassword",
    UPDATEcustomerprofile: "/customer/updatecustomerprofile",

    /*Company API*/
    GETcompany: "/company/getcompany",
    POSTcompany: "/company/postcompany",

    /*Lunch Menu API*/
    GETlunchmenu: "/lunchMenu/get_lunchmenu",

    /*Review API*/
    GETreview: "/review/getreview",
    GETcaterer_review: "/review/get_caterer_review",
    POSTreview: "/review/addreview",
    UPDATEreview: "/review/updatereview",

    /*Lunch Order API*/
    GETlunchorder: "/lunchorder/getlunchorder",
    POSTlunchaddorder: "/lunchorder/addlunchorder",
    PUTupdatelunchorder: "/lunchorder/updatelunchorder",

    /*Payment API*/
    GETcustomer_paymentaccount: "/payment/get_customer_paymentaccount",
    GETcustomer_card: "/payment/get_customer_card",
    PUTupdate_customer_card: '/payment/update_customer_card',
    POSTcustomer_makepayment: '/payment/customer_makepayment',
    POSTsave_customer_card: "/payment/save_customer_card",
    POSTcreate_customer_paymentaccount: "/payment/create_customer_paymentaccount",
    UPDATE_customer_paymentaccount: "/payment/update_customer_paymentaccount",
    DELETEcustomer_card: "/payment/detach_customer_card",
    DELETE_cancel_payment_intent: "/payment/cancel_paymentIntent",
    POSTcustomer_subscribe: '/payment/create_subscription',
    DELETE_cancel_subscription: "/payment/cancel_subscription",

    /*Auth API*/
    POSTcustomersignup: "/auth/customersignup",
    POSTcustomerlogin: "/auth/customerlogin",
    GETcustomerlogout: "/auth/logout",
    POSTpasswordreset: "/auth/resetpassword",
    GETresetpassword: '/auth/getresetpassword',
    PUTupdatepassword: '/auth/updatepassword',

    /*Report & Message API*/
    POSTcustomermessage: "/postmessage"

  };



