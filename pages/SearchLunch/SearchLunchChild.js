import React, { Component } from 'react';
import  Link  from 'next/link';
import { Button, Card, CardHeader, CardBody, CardGroup, Col, Container, Form, Modal, ModalBody, ModalHeader, ModalFooter,
  Input, InputGroup, InputGroupAddon, InputGroupText, Row, Label, FormGroup, Popover, PopoverBody, PopoverHeader ,
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Nav, NavItem, NavLink, Table, Collapse } from 'reactstrap';
import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  PaymentRequestButtonElement,
  IbanElement,
  IdealBankElement,
  StripeProvider,
  injectStripe,
  Elements
} from "react-stripe-elements";
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Layout from '../../components/Layout';
import './SearchLunch.css'
import moment from "moment";
import ContentLoader, { Facebook } from "react-content-loader";
import Dotdotdot from "react-dotdotdot";
import axios from "axios";
import apis from "../../apis";
import Router, { withRouter } from 'next/router'
import NextSeo from 'next-seo';
import { server } from '../../config';
import img from "../../assets/img"
import Select from "react-select";
import Lottie from 'react-lottie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { throwStatement } from 'babel-types';
import GoogleMapReact from 'google-map-react';
import getConfig from 'next/config'
import { timeRanges } from  "../../utils"

const {publicRuntimeConfig} = getConfig()
const {GOOGLE_API_KEY} = publicRuntimeConfig

const glutenfreeIcon = '/static/glutenfree1.png';
const hotIcon = '/static/fire.png';
const spicyIcon = '/static/pepper.png';
const vegeIcon = '/static/lettuce.png';
const healthyIcon = '/static/fruit.png';
const halalicon = '/static/halalsign.png';
const closeIcon = '/static/close.png';

const customStyles = {
  control: (base, state) => ({
    ...base,
    fontSize: 16,
    cursor: "text",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#20a8d8",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    width: "100%",
    color: "black"
  }),

  option: (styles, { isFocused }) => {
    return {
      ...styles,
      cursor: "pointer",
      backgroundColor: isFocused ? "white" : "white",
      color: isFocused ? "#20a8d8" : "black",
      lineHeight: 2
    };
  },

  input: styles => ({
    ...styles,
    color: "black",
    boxShadow: "none",
    borderRadius: 0,
    borderWidth: 0
  }),

  menu: styles => ({
    ...styles,
    marginTop: 0,
    boxShadow: "none",
    borderRadius: 0,
    fontSize: 16,
  }),

  singleValue: styles => ({
    ...styles,
    color: "black"
  })
};

const CenterMarker = ({}) => 
  <img
    style={{
      marginLeft: -25,
      marginTop: -45,
      height: 40,
      width: 40,
      objectFit: "cover"
    }}
    src={img.location_pin}
    alt=""
  />;

const RedMarker = ({}) => 
  <img
    style={{
      marginLeft: -15,
      marginTop: -45,
      height: 30,
      width: 30,
      objectFit: "cover",
      cursor: 'pointer',
    }}
    src={img.mapmarker_red}
    alt=""
  />;

const BlueMarker = ({}) => 
  <img
    style={{
      marginLeft: -15,
      marginTop: -45,
      height: 30,
      width: 30,
      objectFit: "cover",
      cursor: 'pointer',
    }}
    src={img.mapmarker}
    alt=""
  />;
  
class SearchLunchChild extends Component {

  static async getInitialProps({query: { companyID, date }}) {

    var url = `${server}${apis.GETlunchmenu}`
    var locationquerystring = "";

    if (typeof companyID !== 'undefined') {
      locationquerystring = "?companyID=" + companyID
      url = url + locationquerystring
    }

    const res = await axios.get(url);
    const data = await res.data;
   
    return {
      locationquerystring: locationquerystring, 
      dailyMenu: data,
      companyID: companyID,
    };
  }

  componentWillMount() {
    this.setState({
      dailyMenu: this.props.dailyMenu,
      loading: false,
      empty: this.props.dailyMenu.length > 0 ? false : true,
      companyID: this.props.companyID,
      locationquerystring: this.props.locationquerystring,
    }, () => {
      this.getCompanyAddress(this.state.companyID)
      this.checkIfMenuExpired()
      this.checkIfUserHasMadeOrderToday()
    })
  }


  constructor(props) {
    super(props);

    this.refObj = React.createRef();
    
    this.toggleMenuModal = this.toggleMenuModal.bind(this);
    this.togglePrimeModal = this.togglePrimeModal.bind(this);
  
    this.state = {
      dailyMenu: [],
      companyList: [],
      baseurl: "/searchlunch",
      locationquerystring: "",
      companyID: "",
      isMobile: false,
      loading: true,
      empty: false,
      address: "",
      dropDownAddress: false,
      isSearchBarOpen: false,
      selectedCompany: {},
      selectedPickUpTime: "",
      menuModalOpen: false,
      primeModalOpen: false,
      activeMenu: null,
      activeIndex: -1,

      holdername: '',
      cardElement: null,
      isCardHolderNameEmpty: false,
      isCardInvalid: false,
      paymentCardModalOpen: false,
      failedModal: false,
      successModal: false,
      limitModal: false,
      customerPaymentAccountID: "",
      customerEmail: "",
      customerIsPrime: false,
      customerPaymentCardID: "",
      customerPaymentCardBrand: "",
      subscriptionID: "",

      center: null,
      isMapView: false,
      searchName: "",
      currentDateString: "",

      isMenuExpired: false,
      customerHasOrderedToday: false,
    }

    this.time  = timeRanges();
  }

  componentDidMount() {
    
    var currentDate = moment().toDate();

    var currentDateString = moment(currentDate).format("ddd, DD MMM YYYY")

    this.setState({
      currentDateString
    })

    if (window.innerWidth < 800) {
      this.setState({
        isMobile: true
      });
    }
    else {
      this.setState({
        isMobile: false
      });
    }

    window.addEventListener(
      "resize",
      () => {
        this.setState({
          isMobile: window.innerWidth < 800 ? true : false
        });
      },
      false
    );

    this.getCustomerDetails()
  }

  getDataFromDb = (url) => {

    axios.get(url)
    .then((response) => {

      var data = response.data;
    
      this.setState({
        dailyMenu: data,
        empty: data.length > 0 ? false : true,
        loading: false
      }, () => {
        this.getCompanyAddress(this.state.companyID)
        this.checkIfMenuExpired()
        this.checkIfUserHasMadeOrderToday()
      })
    })
    .catch(err => {
      // console.log(err)
       this.setState({
        loading: false,
        empty: true,
      })
    });
  };

  getCompanyAddress = (companyID) => {

    var url = apis.GETcompany + "?companyID=" + companyID 

    axios.get(url)
    .then((response) => {

      var data = response.data;

      if (data.length> 0) {
        var selectedCompany =  {
          value: data[0]._id,
          label: data[0].companyName + " | " + data[0].companyFullAddress
        }

        var center = {
          lat: data[0].location.coordinates[0],
          lng: data[0].location.coordinates[1],
        }

        this.setState({
          selectedCompany,
          center,
        })
      }
    })
    .catch(err => {
     
    });

  };

  getCustomerDetails = () => {

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.GETcustomerprofile;

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            customerEmail: typeof response.data[0].customerEmail !== 'undefined' ? response.data[0].customerEmail : "",
            customerPaymentAccountID: typeof response.data[0].customerPaymentAccountID !== 'undefined' ? response.data[0].customerPaymentAccountID : "",
            customerIsPrime: typeof response.data[0].customerIsPrime !== 'undefined' ? response.data[0].customerIsPrime : false,
            subscriptionID: typeof response.data[0].subscriptionID !== 'undefined' ? response.data[0].subscriptionID : "",
          })
        } 
      })
      .catch((error) => {
      });

  };
  
  checkIfMenuExpired = () => {

    var activeDayIndex = new Date().getDay();
        
    var timenow = parseInt(moment(new Date()).format("HHmm"));
    
    if (activeDayIndex === 0 || activeDayIndex === 6 || activeDayIndex === 7 ) {
        var currentDateString = null

        var numofDaysToAdd = (activeDayIndex === 0 || activeDayIndex === 7) ? 1 : activeDayIndex === 6 ? 2 : 0
        
        currentDateString = moment().add(numofDaysToAdd, 'days').format("ddd, DD MMM YYYY")

        this.setState({
            isMenuExpired: false,
            currentDateString
        })
    }
    else if (activeDayIndex === 5) {
        if (timenow > 1100 && timenow < 1700) {
            this.setState({
              isMenuExpired: true
            })
        }
          else {
            var currentDateString = null
      
            if (timenow >= 1700) {
              currentDateString = moment().add(3, 'days').format("ddd, DD MMM YYYY")
            }
            else {
              currentDateString = moment().format("ddd, DD MMM YYYY")
            }
      
            this.setState({
              isMenuExpired: false,
              currentDateString
            })
        }
    }
    else {
        if (timenow > 1100 && timenow < 1700) {
            this.setState({
              isMenuExpired: true
            })
        }
          else {
            var currentDateString = null
      
            if (timenow >= 1700) {
              currentDateString = moment().add(1, 'days').format("ddd, DD MMM YYYY")
            }
            else {
              currentDateString = moment().format("ddd, DD MMM YYYY")
            }
      
            this.setState({
              isMenuExpired: false,
              currentDateString
            })
        }
    }    
  }

  checkIfUserHasMadeOrderToday = () => {
    var headers = {
      'Content-Type': 'application/json',
    }

    var datequery = null

    var timenow = parseInt(moment(new Date()).format("HHmm"));
    if (timenow > 1700) {
      //Add 1 day
      datequery = moment().add(1, 'days').format("ddd, DD MMM YYYY");
    }
    else {
      datequery = moment().format("ddd, DD MMM YYYY");
    }

    var url = apis.GETlunchorder + "?lteDate=" + datequery + "&gteDate=" + datequery;

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length > 0) {
            for (let i = 0; i < response.data.length; i++) {
              var orderStatus = response.data[i].orderStatus
              if (orderStatus === "pending" || orderStatus === "accepted" || orderStatus === "pickedup") {
                this.setState({
                  customerHasOrderedToday: true
                })
                return;
              }
            }
          }
        } 
      })
      .catch((error) => {
      });
  }

  toggleView= () => {
    this.setState({
      isMapView: !this.state.isMapView
    });
  }

  toggleMenuModal() {
    this.setState({
      menuModalOpen: !this.state.menuModalOpen,
      selectedPickUpTime: "",
    });
  }

  togglePrimeModal() {
    this.setState({
      primeModalOpen: !this.state.primeModalOpen,
    });
  }

  togglePaymentCardModal = () => {
    this.setState({
      paymentCardModalOpen: !this.state.paymentCardModalOpen,
      holdername: "",
    });
  }

  signIn(e) {
    e.preventDefault()

    var url = this.state.baseurl;
    var locationquerystring = this.state.locationquerystring;
   
    url = url + locationquerystring; 

    Router.push({
      pathname: '/login',
      query: {'returnurl': url}
    })
  }

  goToOrders = () => {
    this.setState({
      successModal: false
    }, () => {
      Router.push(`/userprofile/Orders`, `/userprofile/Orders`)
    })
  }

  goToLogin = () => {
 
    var url = this.state.baseurl;
    var locationquerystring = this.state.locationquerystring;
   
    url = url + locationquerystring; 

    Router.push({
      pathname: '/login',
      query: {'returnurl': url}
    })
  }

  menuItemClicked = (index) => {
    this.setState({
      menuModalOpen: !this.state.menuModalOpen,
      activeMenu: this.state.dailyMenu[index],
      activeIndex: index,
    });
  };

  onMarkerClicked = (menuID) => {
    var index = this.state.dailyMenu.findIndex(x => x._id === menuID);
    if (index >= 0) {
      this.setState({
        menuModalOpen: !this.state.menuModalOpen,
        activeMenu: this.state.dailyMenu[index],
        activeIndex: index,
      });
    }
  };

  handleCompanyChange = (selectedCompany) => {
    if (selectedCompany.value === 0) {

      var url = this.state.baseurl;
      var locationquerystring = this.state.locationquerystring;

      url = url + locationquerystring; 

      Router.push({
        pathname: '/addcompany',
        query: {'returnurl': url}
      })
    }
    else {
      this.setState({ 
        selectedCompany,
        companyID:  selectedCompany.value
      } , () => {

        sessionStorage.setItem('selectedCompany', JSON.stringify(this.state.selectedCompany));

        var url = this.state.baseurl;
        var locationquerystring = this.state.locationquerystring;

        locationquerystring = "?companyID=" + this.state.selectedCompany.value

        url = url + locationquerystring; 
        var fullapiurl = apis.GETlunchmenu + locationquerystring;

        this.setState({
          loading: true,
          locationquerystring,
        },() => {
          this.refObj.current.scrollIntoView();
          window.history.pushState(null, '', url);    
          this.getDataFromDb(fullapiurl)
          this.props.companyNameChanged(this.state.selectedCompany.value)
        })    
      })
    }
  };

  
  searchNameClicked = () => {
    var url = this.state.baseurl;
    var locationquerystring = this.state.locationquerystring;
    url = url + locationquerystring; 
    var fullapiurl = apis.GETlunchmenu + locationquerystring + "&mealTitle=" + this.state.searchName;

    this.setState({
      loading: true,
    },() => {
      this.refObj.current.scrollIntoView();
      window.history.pushState(null, '', url);    
      this.getDataFromDb(fullapiurl)
    })
  }

  doSearch = (searchword) => {
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (searchword !== "") {
        this.getCompany(searchword)
      }
    }, 500);
  };

  getCompany = (searchCompany) => {

    var addNewCompany = {
      _id: 0,
      companyName: "Add new company: ",
      companyFullAddress: searchCompany
    }

    var url = apis.GETcompany + "?companyName=" + searchCompany

    axios.get(url)
    .then((response) => {
      var data = response.data;
      data.push(addNewCompany)
      this.setState({
        companyList: data
      })
    })
    .catch(err => {
      var data = this.state.companyList
      data.push(addNewCompany)
      this.setState({
        companyList: data
      })
    });
  }

  hoverItem = (index) => {
    this.setState({
      activeIndex: index
    })
  }

  unhoverItem = (index) => {
    this.setState({
      activeIndex: this.state.menuModalOpen ? index : -1
    })
  }

  openMaps = (lat, lng) => {
    if( navigator.geolocation )
    {
        // Call getCurrentPosition with success and failure callbacks
        navigator.geolocation.getCurrentPosition((position) => {
          const user_lat = position.coords.latitude
          const user_lng = position.coords.longitude
          const url = `https://www.google.com/maps/dir/?api=1&origin=${user_lat},${user_lng}&destination=${lat},${lng}`
          window.open(url);
        },
        (error) => {
          window.open("https://maps.google.com?q=" + lat + "," + lng);
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
      );
    }
    else {
      window.open("https://maps.google.com?q=" + lat + "," + lng);
    }
  };

  getSaveAmount = (priceperunit, discountedprice) => {
    var savedamount = parseFloat(priceperunit) - parseFloat(discountedprice)
    return Number(savedamount).toFixed(2)
  }
 
  handlePickUpChange(e) {
    this.setState({ 
      selectedPickUpTime: e.target.value,
    })
  }

  findIcon = (iconname) => {
    var iconPath;
    if (iconname == 'Hot') { iconPath = hotIcon }
    else if (iconname == 'Spicy') { iconPath = spicyIcon }
    else if (iconname == 'Halal') { iconPath = halalicon }
    else if (iconname == 'Gluten Free') { iconPath = glutenfreeIcon }
    else if (iconname == 'Vegetarian') { iconPath = vegeIcon }
    else if (iconname == 'Healthy') { iconPath = healthyIcon }
    return iconPath
  }

  handleSearchNameChange(e) {
    this.setState({
      searchName: e.target.value,
    });
  }

  handleHolderNameChange(e) {
    this.setState({ 
      holdername: e.target.value, 
      isCardHolderNameEmpty: false
    })
  }

  dismissFailedModal = () => {
    this.setState({
      failedModal: false
    })
  }

  dismissSuccessModal = () => {
    this.setState({
      successModal: false
    })
  }

  toggleLimitModal = () => {
    this.setState({
      limitModal: !this.state.limitModal
    })
  }

  handleReady = (element) => {
    this.setState({cardElement: element}) ;
  };

  handleSubmit  = () => {

    if (this.state.holdername === "") {
      this.setState({
        isCardHolderNameEmpty: true
      })
    }
    else {

      this.setState({
        loadingModal: true
      })

      if (this.props.stripe) {

        this.props.stripe.createPaymentMethod('card', this.state.cardElement, {billing_details: { name: this.state.holdername }} )
        .then(({paymentMethod, error}) => {
          if (error) {
            this.setState({
              loadingModal: false,
              paymentCardModalOpen: false,
              failedModal: true
            })
          }
          else {
            this.createUserPaymentAccount(paymentMethod.id)
          }
        });
      }
    }
  }

  createUserPaymentAccount =  (paymentID) => {
    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.POSTcreate_customer_paymentaccount;

    var body = {
      name: this.state.holdername,
      paymentID: paymentID,
      email: this.state.customerEmail
    }

    axios.post(url, body, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            customerPaymentAccountID: response.data.id
          }, () => {
            this.updateCustomerMongo()
          })
        } 
      })
      .catch((error) => {
        this.setState({
          loadingModal: false,
          paymentCardModalOpen: false,
          failedModal: true,
        })
      });
  };

  updateCustomerMongo = () => {
    var headers = {
      'Content-Type': 'application/json',
    }

    var body = {
      customerPaymentAccountID: this.state.customerPaymentAccountID,
    }

    var url = apis.UPDATEcustomerprofile;

    axios.put(url, body, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            paymentCardModalOpen: false,
          }, () => {
            this.getCustomerCard();
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            loadingModal: false,
            paymentCardModalOpen: false,
            failedModal: true
          })
        } 
      }); 
  }

  getCustomerCard = () => {

    this.setState({
      loadingModal: true
    })

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.GETcustomer_card+ "?customerPaymentAccountID=" + this.state.customerPaymentAccountID;

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            customerPaymentCardID: response.data.data[0].id,
            customerPaymentCardBrand: response.data.data[0].card.brand,
          }, () => {
            this.payByDefaultCard()
          })
        } 
      })
      .catch((error) => {
        alert(error)
        this.setState({
          loadingModal: false,
          paymentCardModalOpen: false,
          failedModal: true
        })
      });
  }

  payByDefaultCard = () => {
    const {customerEmail, customerPaymentAccountID, customerPaymentCardID, customerPaymentCardBrand} = this.state

    var makepaymentdetails = {}
    makepaymentdetails.customerEmail = customerEmail
    makepaymentdetails.customerPaymentAccountID = customerPaymentAccountID
    makepaymentdetails.paymentMethodID = customerPaymentCardID
    makepaymentdetails.paymentType = customerPaymentCardBrand
    makepaymentdetails.totalOrderPrice = this.state.customerIsPrime ? this.state.activeMenu.discountedprice : this.state.activeMenu.priceperunit
    makepaymentdetails.catererPaymentAccountID = this.state.activeMenu.catererDetails[0].catererPaymentAccountID
    makepaymentdetails.commission = this.state.customerIsPrime ? 0.05 : 0.1

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.POSTcustomer_makepayment;

    axios.post(url, makepaymentdetails, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.addLunchOrder(response.data.id, customerPaymentCardBrand);
        } 
      })
      .catch((error) => {
        this.setState({
          loadingModal: false,
          paymentCardModalOpen: false,
          failedModal: true
        })
      });
  }

  addLunchOrder = (paymentIntentID, paymentType) => {

    var pickupTime = null
    var createdAt = null

    var timenow = parseInt(moment(new Date()).format("HHmm"));
    if (timenow > 1700) {
      //Add 1 day
      pickupTime = moment(this.state.selectedPickUpTime, 'hh:mm A').add(1, 'days').toISOString();
      createdAt = moment().add(1, 'days').toISOString();
    }
    else {
      pickupTime = moment(this.state.selectedPickUpTime, 'hh:mm A').toISOString();
      createdAt = moment().toISOString();
    }
    
    const {activeMenu} = this.state

    var dataToUpdate = {
      orderItemID: activeMenu._id,
      orderItem:[
        {
          title: activeMenu.title,
          descrip: activeMenu.descrip,
          priceperunit: activeMenu.priceperunit,
          src: activeMenu.src,
        }
      ],
      catererID: activeMenu.catererID,
      totalOrderPrice: this.state.customerIsPrime ? activeMenu.discountedprice : activeMenu.priceperunit,
      commission: this.state.customerIsPrime ? 5 : 10,
      netOrderPrice: this.calculateNetOrderPrice(),
      orderStatus: 'pending',
      paymentIntentID: paymentIntentID,
      paymentType: paymentType,
      paymentStatus: 'incomplete',
      pickupTime: pickupTime,
      createdAt: createdAt,  
      updatedAt: createdAt, 
    }

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.POSTlunchaddorder;

    axios.post(url, dataToUpdate, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            loadingModal: false,
            successModal: true
          })
        } 
      })
      .catch((error) => {
        this.setState({
          loadingModal: false,
          paymentCardModalOpen: false,
          failedModal: true
        })
      });
  
  }

  calculateNetOrderPrice = () => {
    var netOrderPrice = 0
    if (this.state.customerIsPrime) {
      netOrderPrice = parseFloat(this.state.activeMenu.discountedprice) * 0.95
    }
    else {
      netOrderPrice = parseFloat(this.state.activeMenu.priceperunit) * 0.90
    }
    return netOrderPrice.toFixed(2);
  }

  renderIcon(markitem) {
    var iconarray = [];
    for (let i = 0; i < markitem.length; i++) {
      iconarray.push(
        <span key={i} style={{opacity: 0.8}}>
          {markitem[i]}
          <img
            style={{
              marginLeft: 5,
              marginRight:10, 
              marginBottom: 5,
              height: 20,
              width: 20,
              objectFit: "cover"
            }}
            src={this.findIcon(markitem[i])}
            alt=""
          ></img>
        </span>
      );
    }
    return (
      <Row
        style={{
          textAlign: "start",
          marginTop:20, 
          marginBottom: 20,
        }}
      >
        <Col>
        {iconarray}
        </Col>
      </Row>
    );
  }

  
  renderPaymentCardModal() {
    const createOptions = (fontSize, padding) => {
      return {
        style: {
          base: {
            fontSize,
            color: "#424770",
            letterSpacing: "0.025em",
            fontFamily: "Source Code Pro, monospace",
            "::placeholder": {
              color: "#aab7c4"
            },
            padding: 20
          },
          invalid: {
            color: "#9e2146"
          }
        }
      };
    };

    return(
      <Modal isOpen={this.state.paymentCardModalOpen} toggle={() => this.togglePaymentCardModal()}>
     
        <ModalBody>
          <Card style={{boxShadow: 'none', borderWidth: 0}}>
          <CardBody>
            <Form>
              <h2>Payment Card</h2>
              <Row
                style={{ marginTop: 20, marginBottom:0, flex: 1, display: "flex" }}
                className="justify-content-center"
              >
                <Col xs="12" md="12">
                  <form >
                    <Row
                      style={{ marginTop: 20, flex: 1, display: "flex" }}
                      className="justify-content-center"
                    >
                      <Col xs="12">
                        <Label style={{ fontWeight: 400, letterSpacing: 0.025 }}>
                          Card Holder Name
                        </Label>
                        <input
                          className="StripeElement"
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            width: "100%",
                            outline: 0,
                            border: 0,
                            marginBottom: 20,
                            marginTop: 10,
                            color: "rgba(0,0,0,0.8)"
                          }}
                          value={this.state.holdername}
                          onChange={e => this.handleHolderNameChange(e)}
                          type="text"
                          placeholder="Card Holder Name"
                          invalid={this.state.isCardHolderNameEmpty}
                        />
                        {this.state.isCardHolderNameEmpty ? (
                          <Label style={{ color: "red", fontSize: 13, marginBottom: 20 }}>
                            Please enter card holder name
                          </Label>
                        ) : null}
                      </Col>

                      <Col xs="12">
                        <Label style={{ fontWeight: 400, letterSpacing: 0.025 }}>
                          Card Details
                        </Label>
                        <CardElement
                          onReady={this.handleReady}
                          {...createOptions(15)}
                        />
                      </Col>

                      <Col style={{marginTop: 20}} xs="12">
                        <Button onClick={() => this.handleSubmit()} style={{padding:10}} block color="success">
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </form>
                </Col>
              </Row>  
            </Form>
          </CardBody>
        </Card>
      </ModalBody>
    </Modal>
    )
  }

  renderLoadingModal() {

    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: require('../../assets/animation/payment_loading.json'),
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return (
      <Modal    
        aria-labelledby="contained-modal-title-vcenter"
        centered
        isOpen={this.state.loadingModal} >
        <ModalBody>
          <div>
            <Lottie 
              options={defaultOptions}
              height={200}
              width={200}/>

            <p style={{textAlign: 'center', paddingLeft:20, paddingRight:20, fontSize: 16, fontWeight: '600'}}>
              Sit back and relax. We are pre-ordering your food.
            </p>
          </div>
        </ModalBody>
      </Modal>
    )
  }

  renderFailedModal() {

    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: require('../../assets/animation/failed.json'),
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return (
      <Modal    
        aria-labelledby="contained-modal-title-vcenter"
        centered
        isOpen={this.state.failedModal} >
        <ModalBody>
          <div>
            <Lottie 
              options={defaultOptions}
              height={200}
              width={200}/>

            <p style={{textAlign: 'center', paddingLeft:20, paddingRight:20, fontSize: 16, fontWeight: '600'}}>
              An error has occured. No money is charged from your bank. Please try again later or contact our support team at support@foodiebee.eu
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => this.dismissFailedModal()} color="primary">OK</Button>
        </ModalFooter>
      </Modal>
    )
  }

  renderSuccessModal() {

    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: require('../../assets/animation/success.json'),
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return (
      <Modal    
        aria-labelledby="contained-modal-title-vcenter"
        centered
        isOpen={this.state.successModal} >
        <ModalBody>
          <div>
            <Lottie 
              options={defaultOptions}
              height={200}
              width={200}/>

            <p style={{textAlign: 'center', paddingLeft:20, paddingRight:20, fontSize: 16, fontWeight: '600'}}>
              Meal pre-ordered! Just go to Orders section in your profile and show the respective order to the restaurant at your pickup time.
            </p>

            <div style={{textAlign: 'center', marginTop: 20, marginBottom: 15}}>
              <Button block color="success" onClick={() => this.goToOrders()} style={{ fontWeight: '600', fontSize: 17, padding: 10 }} >
                Go To Orders
              </Button>
            </div>

          </div>
        </ModalBody>
      </Modal>
    )
  }

  renderLimitModal() {

    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: require('../../assets/animation/lock.json'),
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return (
      <Modal    
        aria-labelledby="contained-modal-title-vcenter"
        centered
        toggle={() => this.toggleLimitModal()}
        isOpen={this.state.limitModal} >
        <ModalBody>
          <div>
            <Lottie 
              options={defaultOptions}
              height={200}
              width={200}/>

            <p style={{textAlign: 'center', paddingLeft:20, paddingRight:20, fontSize: 16, fontWeight: '600'}}>
              You have reached quota of 1 order per day. 
            </p>

            <div style={{textAlign: 'center', marginTop: 20, marginBottom: 15}}>
              <Button block color="success" onClick={() => this.toggleLimitModal()} style={{ fontWeight: '600', fontSize: 17, padding: 10 }} >
                OK, Got It
              </Button>
            </div>

          </div>
        </ModalBody>
      </Modal>
    )
  }

  renderPrimeModal() {

    return (
      <Modal    
        toggle={this.togglePrimeModal}
        isOpen={this.state.primeModalOpen} >

        <ModalHeader toggle={this.togglePrimeModal}>
          Go Prime
        </ModalHeader>
        <ModalBody style={{paddingTop: 0, marginTop: 0, paddingLeft: 0, paddingRight: 0}}>
          <div style={{ height: 130, backgroundImage: 'url(' + img.golunch_wallpaper_dimmed + ')', backgroundSize: 'cover'}}>

            <Row style={{margin:0, marginTop: 0, display:'flex',}} >

              <Col style={{textAlign: 'center', marginTop: 20, }} xs="12">
                <img style={{objectFit: 'cover', height: 50, width: 160,}} src={'/static/brandlogo_dark.png'} alt="FoodieBee Logo"/>
              </Col>
            
              <Col style={{textAlign: 'center',}} xs="12">
                <b style={{fontSize: 23, letterSpacing: 1.5, color: "white"}}>
                  GO
                  <Button style={{cursor: "pointer", marginLeft: 10, opacity: 1.0, padding: 7, fontWeight: '600', fontSize: 18, borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} disabled>PRIME</Button>          
                </b>
              </Col>

            </Row>

          </div>

          <Table borderless style={{ marginLeft: 10, marginRight: 10, marginTop: 20}}>
            <tbody>
              {this.state.subscriptionID === "" ?
              <tr>
                <td><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={'/static/checked.png'} alt=""/></td>
                <td style={{fontSize: 16}}><p style={{fontWeight: '500', opacity: 0.8}}>Free trial for 1 month. Cancel anytime</p></td>
              </tr> : null }
              <tr>
                <td><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={'/static/checked.png'} alt=""/></td>
                <td style={{fontSize: 16}}><p style={{fontWeight: '500', opacity: 0.8}}>€6 and €10 meals daily</p></td>
              </tr>
              <tr>
                <td><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={'/static/checked.png'} alt=""/></td>
                <td style={{fontSize: 16}}><p style={{fontWeight: '500', opacity: 0.8}}>No commitment. Order when you like</p></td>
              </tr>
            </tbody>
          </Table>

          <div style={{textAlign: 'center', color: 'white',}}>
            <Button  style={{fontSize: 18, height: 50, marginTop: 10, marginBottom: 30,}} className="bg-primary" size="lg" color="primary" onClick={() => this.state.customerEmail === "" ? this.goToLogin() : Router.push('/userprofile/Go%20Prime')}>{this.state.subscriptionID === "" ? "Start Free Trial" : "Subscribe Now"}</Button>
          </div>

          <div style={{textAlign: 'center',marginBottom: 20}}>
            <p style={{fontSize: 16, fontWeight: '600'}}>Only <b style={{fontSize: 20, color: "#FF5722", fontWeight: '700' }}>€4.99</b> / month after free trial. Cancel anytime. </p>
          </div>

        </ModalBody>
      </Modal>
    )
  }

  renderMenuModal() {

    var activeMenu = this.state.activeMenu

    return (
      <Modal isOpen={this.state.menuModalOpen} toggle={this.toggleMenuModal}>
        <ModalBody>
          <b style={{ color: "#20a8d8", fontSize: 19 }}>{activeMenu.title}</b>
          <Button className="float-right" style={{ borderColor: "transparent", paddingTop: 0, paddingLeft: 5, paddingRight: 5, paddingBottom: 5,backgroundColor: "transparent" }} onClick={this.toggleMenuModal}>
              <img 
                style={{cursor:'pointer', objectFit: "cover", width: 13, height: 13 }}
                src={img.close} />
          </Button>

          <img
            style={{ marginTop:10, marginBottom: 10, objectFit: "cover", width: "100%", height: 200 }}
            src={activeMenu.src ? activeMenu.src : img.food_blackwhite}
          /> 

          <p style={{ fontWeight:'600', marginTop: 10, fontSize: 18 }}>{activeMenu.catererDetails[0].catererName}</p>

          <Button
            color="link"
            onClick={() => this.openMaps(activeMenu.catererDetails[0].location.coordinates[0],activeMenu.catererDetails[0].location.coordinates[1])}
            style={{
              padding: 0,
              fontWeight: "500",
              color: "#20a8d8"
            }}
          >
            <img
              style={{
                objectFit: "cover",
                width: 20,
                height: 20,
                marginRight: 10
              }}
              src={img.mapmarker}
              alt=""
            />
            {activeMenu.catererDetails[0].catererAddress}
          </Button>

          <div style={{ marginTop: 10 }}>
            <p>
              {activeMenu.descrip}
            </p>
          </div>

          {typeof activeMenu.markitem === 'undefined' || activeMenu.markitem.length === 0 ? null : this.renderIcon(activeMenu.markitem)} 
        
          <FormGroup>
            <Input value={this.state.selectedPickUpTime} onChange={(e) => this.handlePickUpChange(e)} style={{color:'black', fontSize: 14, fontWeight: '600', letterSpacing: 1}} type="select" placeholder="Select Pick Up Time" autoComplete="pickuptime">
            <option value="" disabled> Pickup Time</option>
            {this.time.map(time =>
              <option style={{color:'black'}} key={time} value={time}>{time}</option>
            )}
            </Input>
          </FormGroup>
          
          <Row>
          
            {!this.state.customerIsPrime ? 
             <div style={{height: 1, width: '100%', marginLeft:20, marginRight: 20, backgroundColor: 'black', opacity: 0.1, marginTop: 20}}></div>
              : null }

            {!this.state.customerIsPrime ? 
            <Col xs="12">
              <Table style={{margin: 0, padding: 0, }} borderless>
                <tbody>
                  <tr>
                    <td onClick={this.togglePrimeModal} style={{cursor: "pointer", textAlign: 'start', paddingBottom: 0}}>
                      <b style={{fontSize: 16, fontWeight: '600', color: "#FF5722",marginTop: 12,}}>Pay just <b style={{fontSize: 20, fontWeight: '700', color: "#FF5722",marginTop: 12,}}>€{activeMenu.discountedprice}</b> with 
                      <Button style={{cursor: "pointer", marginLeft: 10, opacity: 1.0, padding: 5, fontWeight: '600', fontSize: 12,borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} onClick={this.togglePrimeModal}>PRIME</Button>          
                      </b>
                      <p style={{fontSize: 14, fontWeight: '600', color: "#FF5722", }}>You saved €{this.getSaveAmount(activeMenu.priceperunit, activeMenu.discountedprice)}!</p>
                    </td>
                    <td onClick={this.togglePrimeModal} style={{cursor: "pointer", textAlign: 'end', paddingBottom: 0}}><img style={{ marginTop: 13, objectFit:'cover', width: 20, height: 20, }} src={img.dropright_orange}/></td>
                  </tr>
                </tbody>
              </Table>
            </Col> : null }

            {!this.state.customerIsPrime ? 
            <div style={{height: 1, width: '100%', marginLeft:20, marginRight: 20, opacity: 0.1, backgroundColor: 'black', marginBottom: 10}}></div>
            : null }

            {this.state.customerIsPrime ? 
            <Col style={{marginTop: 15,}} xs="12">              
              <p style={{fontSize: 15, fontWeight: '600', color: "#FF5722", }}>You saved €{this.getSaveAmount(activeMenu.priceperunit, activeMenu.discountedprice)} with 
                <Button style={{marginLeft: 10, opacity: 1.0, padding: 5, fontWeight: '600', fontSize: 12,borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} disabled>PRIME</Button>          
              </p>
            </Col> : null }

            
            <Col style={{marginTop: 15,}} xs="12">
              <Button block style={{paddingTop: 5, paddingBottom: 10}} onClick={() => this.state.customerEmail === "" ? this.goToLogin() : this.state.customerHasOrderedToday ? this.toggleLimitModal() : this.state.customerPaymentAccountID === "" ? this.togglePaymentCardModal() : this.getCustomerCard()} color="primary" disabled={this.state.isMenuExpired ? true : this.state.selectedPickUpTime === "" ? true : false}>
                <Table style={{margin: 0, padding: 0, }} borderless>
                  <tbody>
                    <tr>
                      <td style={{textAlign: 'start', paddingBottom: 0, paddingTop: 5,}}>
                        <b style={{fontSize: 17, fontWeight: '600', color: "white", letterSpacing: 1}}>Pre-Order</b>
                      </td>
                      <td style={{textAlign: 'end', paddingBottom: 0, paddingTop: 5,}}>
                        <b style={{fontSize: 17, fontWeight: '600', color: "white", letterSpacing: 1}}>€{Number(this.state.customerIsPrime ? activeMenu.discountedprice : activeMenu.priceperunit).toFixed(2)} {this.state.customerIsPrime ? "" : "(Full Price)"}</b>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Button>
            </Col>  
          </Row>
        </ModalBody>
       
      </Modal>
    );
  }

  renderLoadingItems() {
    var itemsarray = [];

    for (let i = 0; i < 6; i++) {
      itemsarray.push(
        <Col key={i} xs="12" sm="6" md="6" lg="4">
          <ContentLoader height="400">
            <rect x="0" y="0" rx="6" ry="6" width="100%" height="200" />
            <rect x="0" y="240" rx="4" ry="4" width="300" height="13" />
            <rect x="0" y="260" rx="3" ry="3" width="250" height="10" />
            <rect x="0" y="280" rx="2" ry="2" width="100%" height="20" />
          </ContentLoader>
        </Col>
      );
    }

    return (
      <Row
        style={{
          marginTop: 10
        }}
      >
        {itemsarray}
      </Row>
    );
  }

  renderItems() {
    var itemsarray = [];

    var menuitems = this.state.dailyMenu

    for (let i = 0; i < menuitems.length; i++) {

      var item = menuitems[i]

      itemsarray.push(
        <Col key={i} xs="12" sm="6" md="6" lg="4" style={{}}>
          <Card className="card-1" onMouseEnter={() => this.hoverItem(i)} onMouseLeave={() => this.unhoverItem(i)} onClick={() => this.menuItemClicked(i)} style={{ cursor: "pointer", }}>
            <CardBody
              style={{
                cursor: "pointer",
                paddingTop: 0,
                paddingBottom: 0,
                paddingRight: 15,
                paddingLeft: 15,
                height: "100%"
              }}
            >
            <Row>
             
              <Col style={{padding:0}} xs="12">
                <div style={{ objectFit:'cover', width: 'auto', height: 150, }}>
                  <img style={{ objectFit:'cover', width: '100%', height: '100%', opacity: (this.state.isMenuExpired && this.state.activeIndex === i) ? 1 : (this.state.isMenuExpired && this.state.activeIndex !== i) ? 0.3 : 1  }} src={item.src ? item.src : img.food_blackwhite}/>
                </div>
              </Col>

              <Col style={{ marginTop: 15, marginBottom: 10,}} xs="12">
                <div >
                  <Dotdotdot clamp={1}>
                    <p className="h5" style={{ cursor: "pointer",  color: "#20a8d8", overflow: "hidden" }}>
                      {item.title}
                    </p>
                  </Dotdotdot>
                </div>

                <div>
                  <Dotdotdot clamp={1}>
                    <p style={{ marginTop:5, fontWeight: '600', fontSize: 15, cursor: "pointer", overflow: "hidden" }}>
                      {item.catererDetails[0].catererName}
                    </p>
                  </Dotdotdot>
                </div>

                <div>
                  <Dotdotdot clamp={1}>
                    <p style={{ fontWeight: '500', fontSize: 14, cursor: "pointer", overflow: "hidden", opacity: 0.6 }}>
                      {item.catererDetails[0].catererAddress}
                    </p>
                  </Dotdotdot>
                </div>

                <div style={{ marginTop: 0, marginBottom: 10 }}>
                  
                    <Label
                      style={{
                        cursor: "pointer",
                        marginTop: 5,
                        fontWeight: '600',
                        textDecoration: 'line-through',
                        opacity: 0.7
                      }}
                      className="h5 float-left"
                    >
                      €{Number(item.priceperunit).toFixed(2)}
                    </Label>
                    <div
                      style={{
                        cursor: "pointer",
                        marginLeft: 10, 
                        color: "#FF5722"
                      }}
                      className="h5 float-left"
                    >
                      <Label style={{cursor: "pointer", fontSize: 24}}>€{item.discountedprice}</Label>
                      <Button style={{ marginTop: -5, letterSpacing: 1, cursor: "pointer", marginLeft: 5, opacity: 1.0, padding: 5, fontWeight: '500', fontSize:10, borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} disabled>PRIME</Button>          
                    </div>
                  
                </div>
              </Col>

              </Row>
              
            </CardBody>
          </Card>
        </Col>
      );
    }

    return (
      <Row style={{marginLeft: 20, marginRight: 20}} >
        {itemsarray}
      </Row>
    );
  }
  
  renderMarkers(map, maps, dailyMenu) {
    let iconMarker = new maps.MarkerImage(
      img.mapmarker,
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      null, /* anchor is bottom center of the scaled image */
      new window.google.maps.Size(30, 30)
    );
    dailyMenu.map((place, i) => {
      var center = {
        lat: place.catererDetails[0].location.coordinates[0],
        lng: place.catererDetails[0].location.coordinates[1]
      }
      this.marker = new maps.Marker({
        key: place._id,
        position: center,
        map,
        icon: iconMarker,
      });
      this.marker.setMap(map);
      // Add an event listener on the rectangle.
      this.marker.addListener("click", () => {
        this.menuItemClicked(i)
      });
    })
  }

  renderTopSearchBar() {
    
    const searchList = this.state.companyList.map(({ _id, companyName, companyFullAddress }) => {
      return {
        value: _id,
        label: _id === 0 ? companyName + companyFullAddress : companyName + " | " + companyFullAddress
      };
    });

    const DropdownIndicator = () => {
      return <div />;
    };


    return (
      <div style={{boxShadow: '0px 0px 3px #DEDEDE'}}>
         <div className="container-fluid">
          <Row className="justify-content-center" style={{ padding: 10, width: '80%', marginLeft: 10}}>

             <Col xs="6" style={{paddingTop: 20, paddingBottom: 20,backgroundColor: 'white'}}>
           
              <InputGroup >
                <Input onChange={e => this.handleSearchNameChange(e)} value={this.state.searchName} style={{ borderWidth:1.5, color:'black', fontSize: 15, height: 47, borderTopLeftRadius: 15, borderBottomLeftRadius: 15}} type="text" id="input1-group2" name="input1-group2" placeholder="Search Meals" />      
                <InputGroupAddon addonType="prepend">
                  <Button onClick={() => this.searchNameClicked()} style={{borderTopRightRadius: 15, borderBottomRightRadius: 15}}  type="button" color="primary"><i className="fa fa-search"></i></Button>
                </InputGroupAddon>
              </InputGroup>    

            </Col>

         

            <Col xs="6" style={{paddingTop: 20, paddingBottom: 20,  backgroundColor: 'white'}}>
              <Row className="justify-content-center" >
                 <img
                  style={{
                    objectFit: "cover",
                    width: 30,
                    height: 30,
                    marginTop: 10
                  }}
                  alt={""}
                  src={img.location_pin}
                  />
               
               <div style={{width: "80%", marginLeft: 10}} >
                  <Select
                    value={this.state.selectedCompany}
                    options={searchList}
                    onChange={this.handleCompanyChange}
                    onInputChange={this.doSearch}
                    placeholder="ex: Google"
                    openMenuOnClick={false}
                    styles={customStyles}
                    components={{ DropdownIndicator }}
                  />
                </div>
            
              </Row>
            </Col>
          </Row>
        </div>
      <div style={{height: 1, backgroundColor: 'gray', opacity: 0.3}}></div>
      </div>
    )
  }

  renderMobileTopBar() {

    const searchList = this.state.companyList.map(({ _id, companyName, companyFullAddress }) => {
      return {
        value: _id,
        label: _id === 0 ? companyName + companyFullAddress : companyName + " | " + companyFullAddress
      };
    });

    const DropdownIndicator = () => {
      return <div />;
    };

    return (
      <div style={{boxShadow: '0px 0px 3px #DEDEDE'}}>
        <Container>
          <Row className="justify-content-center" style={{ paddingTop: 10, paddingBottom: 10, paddingRight: 10, paddingLeft: 10}}>

             <Col xs="12">

              <Row className="justify-content-center" style={{paddingTop: 12, }}>
                <div style={{width: "70%", marginLeft: 10, marginRight: 5,}} >
               
                  <InputGroup >
                    <Input onChange={e => this.handleSearchNameChange(e)} value={this.state.searchName} style={{ borderWidth:1.5, color:'black', fontSize: 15, height: 45, borderTopLeftRadius: 15, borderBottomLeftRadius: 15}} type="text" id="input1-group2" name="input1-group2" placeholder="Search Meals" />      
                    <InputGroupAddon addonType="prepend">
                      <Button onClick={() => this.searchNameClicked()} style={{borderTopRightRadius: 15, borderBottomRightRadius: 15}}  type="button" color="primary"><i className="fa fa-search"></i></Button>
                    </InputGroupAddon>
                  </InputGroup>
                   
                </div>

                <Button style={{marginLeft: 5, padding: 10, borderRadius: 10, height: 45,}} onClick={() => this.toggleView()} color="primary" outline>
                  {this.state.isMapView ? "List" : "Map"}
                </Button>

              </Row>

            </Col>

            <Col xs="12">
              <Row className="justify-content-center" style={{paddingTop: 15, paddingBottom: 10}}>
                 <img
                  style={{
                    objectFit: "cover",
                    width: 30,
                    height: 30,
                    marginTop: 10
                  }}
                  alt={""}
                  src={img.location_pin}
                  />
               
               <div style={{width: "80%", marginLeft: 10}} >
                  <Select
                    value={this.state.selectedCompany}
                    options={searchList}
                    onChange={this.handleCompanyChange}
                    onInputChange={this.doSearch}
                    placeholder="ex: Google"
                    openMenuOnClick={false}
                    styles={customStyles}
                    components={{ DropdownIndicator }}
                  />
                </div>
            
              </Row>
            </Col>
          </Row>
        </Container>
      <div style={{height: 1, backgroundColor: 'gray', opacity: 0.3}}></div>
      </div>
    )
  }

  renderEmptyItems() {
    return (
      <Row style={{ paddingLeft: 20, paddingRight: 20, marginTop: 50 }}>
        <Col style={{ textAlign: "center" }} xs="12">
          <img
            style={{
              objectFit: "cover",
              width: 70,
              height: 70,
              opacity: 0.6
            }}
            alt={""}
            src={
              "https://cdn0.iconfinder.com/data/icons/huge-black-icons/512/Find.png"
            }
          />
        </Col>
        <Col style={{ textAlign: "center" }} xs="12">
          <p
            style={{ fontSize: 18, letterSpacing: 2, marginTop: 30 }}
            className="big"
          >
            NO AVAILABLE ITEMS.
          </p>
        </Col>
        
      </Row>
    );
  }

  renderLeftView() {
    return (
      <div style={{height: this.state.isMobile && !this.state.isMapView ? '100%' : `100vh`, overflowY: this.state.isMobile && !this.state.isMapView ? "hidden" : "scroll", overflowX: 'hidden', width: this.state.isMobile && !this.state.isMapView ? "100%" : '70%' }} >
        <Row style={{marginTop: 20, marginBottom: 50, }} >

          <Col style={{ marginTop: 20, textAlign: 'center' }} xs="12">
            <h3 style={{}} >{this.state.currentDateString}</h3>
          </Col>

          <Col style={{ marginTop: 10, textAlign: 'center', marginBottom:20 }} xs="12">
            <h5 style={{paddingLeft:20, paddingRight:20, opacity: 0.8}} >Tomorrow lunch menus will be available at 5pm today until 11am tomorrow.</h5>
          </Col>

          <Col style={{ marginTop: 20 }} xs="12">
            {this.state.loading ? this.renderLoadingItems() : null}
          </Col>

          <Col xs="12">
            {this.renderItems()}
          </Col>

          <Col xs="12">
            {this.state.empty ? this.renderEmptyItems() : null}
          </Col>

        </Row>
      </div>
    )
  }

  renderMapView() {
    return (
      <div style={{ position: 'absolute', right: 0, height: this.state.isMobile && this.state.isMapView ? '80%': '100%', width: this.state.isMobile && this.state.isMapView ? '100%' : '30%' }}>
        
        {this.state.isMobile && this.state.isMapView ?
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <h3 style={{}} >{this.state.currentDateString}</h3>
        </div> : null }

        {this.state.isMobile && this.state.isMapView ?
        <div style={{ marginTop: 10, textAlign: 'center', marginBottom:20 }}>
          <h5 style={{paddingLeft:20, paddingRight:20, opacity: 0.8}} >Tomorrow lunch menus will be available at 5pm today until 11am tomorrow.</h5>
        </div> : null}

        <GoogleMapReact
          bootstrapURLKeys={{ key: [GOOGLE_API_KEY] }}
          center={this.state.center}
          zoom={13}
          onChildClick={(e) => this.onMarkerClicked(e)}
        //  yesIWantToUseGoogleMapApiInternals={false}
         // onGoogleApiLoaded={({ map, maps }) => this.renderMarkers(map, maps, this.state.dailyMenu)}
        >
          {
             this.state.dailyMenu.map((place, i) => (
              <BlueMarker
                key={place._id}
                lat={place.catererDetails[0].location.coordinates[0]}
                lng={place.catererDetails[0].location.coordinates[1]}
              />
            ))

          }
          

          {this.state.center ? 
          <CenterMarker
            lat={this.state.center.lat}
            lng={this.state.center.lng}
          />
          : null}

          {this.state.activeIndex >= 0 && this.state.dailyMenu.length > 0 ?
            <RedMarker
              lat={this.state.dailyMenu[this.state.activeIndex].catererDetails[0].location.coordinates[0]}
              lng={this.state.dailyMenu[this.state.activeIndex].catererDetails[0].location.coordinates[1]}
            />
            :
            null}

        </GoogleMapReact>
      </div>
    )
  }

  render() {

    return (
    <div ref={this.refObj} style={{backgroundColor: 'white'}}>
    
      <NavBar stickTop={true} signIn={e=>this.signIn(e)}/>

      {this.state.isMobile? this.renderMobileTopBar() : this.renderTopSearchBar()}

      <div className="container-fluid">

        <div className="app align-items-start">

          {!this.state.isMobile ? this.renderLeftView(): null}

          {!this.state.isMobile ? this.renderMapView(): null}
        
          {this.state.isMobile && !this.state.isMapView ? this.renderLeftView(): null}

          {this.state.isMobile && this.state.isMapView ? this.renderMapView(): null}

        </div>

      </div>

      {this.state.menuModalOpen ? this.renderMenuModal() : null}

      {this.state.primeModalOpen ? this.renderPrimeModal() : null}

      {this.renderPaymentCardModal()}

      {this.renderLoadingModal()}

      {this.renderFailedModal()}

      {this.renderSuccessModal()}

      {this.renderLimitModal()}

      <Footer />
      </div>
    );
  }
}

export default injectStripe(SearchLunchChild)
