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
import { throwStatement } from 'babel-types';
import GoogleMapReact from 'google-map-react';
import getConfig from 'next/config'

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
      objectFit: "cover"
    }}
    src={img.mapmarker_red}
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
      isMobile: null,
      loading: true,
      empty: false,
      address: "",
      dropDownAddress: false,
      isSearchBarOpen: false,
      selectedCompany: {},
      menuModalOpen: false,
      primeModalOpen: false,
      activeMenu: null,
      activeIndex: -1,
      holdername: '',
      cardElement: null,
      isCardHolderNameEmpty: false,
      isCardInvalid: false,
      paymentCardModalOpen: false,
      customerPaymentAccoundID: "",
      customerEmail: "",
      paymentcarddetails: [],
      customerpaymentaccountdetails: [],

      customerIsPrime: false,
      center: null,
      isMapView: false,
      searchName: "",
      currentDateString: "",
    }
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
          label: data[0].companyName + " | " + data[0].companyAddress
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
            customerPaymentAccoundID: typeof response.data[0].customerPaymentAccoundID !== 'undefined' ? response.data[0].customerPaymentAccoundID : "",
            customerIsPrime: typeof response.data[0].customerIsPrime !== 'undefined' ? response.data[0].customerIsPrime : false,
          })
        } 
      })
      .catch((error) => {
      });

  };
  
  toggleView= () => {
    this.setState({
      isMapView: !this.state.isMapView
    });
  }

  toggleMenuModal() {
    this.setState({
      menuModalOpen: !this.state.menuModalOpen,
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

  menuItemClicked = (index) => {
    this.setState({
      menuModalOpen: !this.state.menuModalOpen,
      activeMenu: this.state.dailyMenu[index],
      activeIndex: index,
    });
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
      companyAddress: searchCompany
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
    window.open("https://maps.google.com?q=" + lat + "," + lng);
  };
  
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
              loadingModal: false
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
            customerPaymentAccoundID: response.data.id
          }, () => {
            this.updateCustomerMongo()
          })
        } 
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          loadingModal: false,
          paymentCardModalOpen: false
        }, () => {
          console.log("error 2 = ", error)
          toast(<ErrorInfo/>, {
            position: toast.POSITION.BOTTOM_RIGHT
          });
        })
      });
  };

  updateCustomerMongo = () => {
    var headers = {
      'Content-Type': 'application/json',
    }

    var body = {
      customerPaymentAccoundID: this.state.customerPaymentAccoundID,
    }

    var url = apis.UPDATEcustomerprofile;

    axios.put(url, body, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            loadingModal: false,
            paymentCardModalOpen: false
          }, () => {
            toast(<SuccessInfo/>, {
              position: toast.POSITION.BOTTOM_RIGHT
            });
            var url = this.state.baseurl;
            var locationquerystring = this.state.locationquerystring;
            url = url + locationquerystring; 
            var fullapiurl = apis.GETdailyMenu + locationquerystring;
            this.getDataFromDb(fullapiurl)
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            loadingModal: false,
            paymentCardModalOpen: false
          }, () => {
            console.log("error 3 = ", error)
            toast(<ErrorInfo/>, {
              position: toast.POSITION.BOTTOM_RIGHT
            });
          })
        } 
      }); 
  }

  renderMarkAsIcon(markitem) {
    var iconarray = [];
    for (let i = 0; i < markitem.length; i++) {
      iconarray.push(
        <img
          key={i} 
          style={{
            marginLeft: i === 0 ? 0 : 5,
            marginBottom: 5,
            height: 20,
            width: 20,
            objectFit: "cover"
          }}
          src={this.findIcon(markitem[i])}
          alt=""
        />
      );
    }
    return (
      <Col
        style={{
          textAlign: "start",
          flex: 1
        }}
      >
        {iconarray}
      </Col>
    );
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
              Please don't close the browser or refresh the page while we are connecting to your payment account. This proccess may take a while.
            </p>
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
              <tr>
                <td><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={'/static/checked.png'} alt=""/></td>
                <td style={{fontSize: 16}}><p style={{fontWeight: '500', opacity: 0.8}}>Free trial for 1 month. Cancel anytime</p></td>
              </tr>
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
            <Button  style={{fontSize: 18, height: 50, marginTop: 10, marginBottom: 30,}} className="bg-primary" size="lg" color="primary">Start Free Trial</Button>
          </div>

          <div style={{textAlign: 'center',marginBottom: 20}}>
            <p style={{fontSize: 16, fontWeight: '600'}}>€4.99 / month after free trial. Cancel anytime. </p>
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
            style={{cursor:'pointer', marginTop:10, marginBottom: 10, objectFit: "cover", width: "100%", height: 200 }}
            onClick={() => this.inputOpenFileRef.current.click()}
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

          <Row>

            <Col style={{marginTop: 10, }} xs="12">
              <Button style={{borderColor: "#FF5722", borderWidth: 1, backgroundColor: "white"}} onClick={this.togglePrimeModal}>
                <b style={{fontSize: 16, fontWeight: '700', color: "#FF5722",marginTop: 12,}}>Get it for €{activeMenu.category === "lite" ? "6" : "10"} with 
                  <Button style={{cursor: "pointer", marginLeft: 10, opacity: 1.0, padding: 5, fontWeight: '600', fontSize: 12,borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} disabled>PRIME</Button>          
                </b>
              </Button>
            </Col>

           

            <Col style={{marginTop: 15,}} xs="6">
              <b style={{fontSize: 19, fontWeight: '600',}}>€{Number(activeMenu.priceperunit).toFixed(2)}</b>
            </Col>

            <Col style={{textAlign:'end', marginTop: 15,}} xs="6">
              <Button style={{fontSize: 17, padding: 10}} onClick={() => this.togglePaymentCardModal()} color="primary" disabled>
                Pre-Order
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
          <Card className="card-1" onMouseEnter={() => this.hoverItem(i)} onMouseLeave={() => this.unhoverItem(i)} onClick={() => this.menuItemClicked(i)} style={{ cursor: "pointer" }}>
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
                  <img style={{ objectFit:'cover', width: '100%', height: '100%', }} src={item.src ? item.src : img.food_blackwhite}/>
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
                        fontWeight: '600'
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
                      className="h5 float-right"
                    >
                      <Button style={{cursor: "pointer", marginRight: 5, opacity: 1.0, padding: 5, fontWeight: '600', fontSize:11, borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} disabled>PRIME</Button>          
                      <Label style={{cursor: "pointer", fontSize: 22}}>€{item.discountedprice}</Label>
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
    
    const searchList = this.state.companyList.map(({ _id, companyName, companyAddress }) => {
      return {
        value: _id,
        label: _id === 0 ? companyName + companyAddress : companyName + " | " + companyAddress
      };
    });

    const DropdownIndicator = () => {
      return <div />;
    };


    return (
      <div style={{boxShadow: '0px 0px 3px #DEDEDE'}}>
        <Container>
          <Row style={{ paddingTop: 20, paddingBottom: 10}}>

            <Col style={{ marginTop: 25, paddingLeft: 30 }} xs={this.state.isMobile ? "10": "12"} md={this.state.isMobile ? "10" : "6"}>
              <Form action="" method="post" className="form-horizontal">
                <FormGroup row>
                  <Col md="12">
                    <InputGroup >
                      <Input onChange={e => this.handleSearchNameChange(e)} value={this.state.searchName} style={{ borderWidth:1.5, color:'black', fontSize: 15, height: 45, borderTopLeftRadius: 15, borderBottomLeftRadius: 15}} type="text" id="input1-group2" name="input1-group2" placeholder="Search Meals" />      
                      <InputGroupAddon addonType="prepend">
                        <Button onClick={() => this.searchNameClicked()} style={{borderTopRightRadius: 15, borderBottomRightRadius: 15}}  type="button" color="primary"><i className="fa fa-search"></i></Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Col>
                </FormGroup>
              </Form>
            </Col>

            {this.state.isMobile ?
            <Col style={{ marginTop: 25, paddingRight: 30 }} xs="2">
              <Button style={{padding: 10, borderRadius: 10,}} onClick={() => this.toggleView()} color="primary" outline>
                {this.state.isMapView ? "List" : "Map"}
              </Button>
            </Col> : null }

            <Col xs="12" md={this.state.isMobile ? "12" : "6"}>
              <Row className="justify-content-center" style={{paddingTop: 20, paddingBottom: 20}}>
                 <img
                  style={{
                    objectFit: "cover",
                    width: 30,
                    height: 30,
                    marginTop: 10
                  }}
                  alt={""}
                  src={img.mapmarker}
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
            <h5 style={{paddingLeft:20, paddingRight:20, opacity: 0.8}} >Tommorow lunch menus will be available at 5pm today until 10:30am tommorow.</h5>
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
          <h5 style={{paddingLeft:20, paddingRight:20, opacity: 0.8}} >Tommorow lunch menus will be available at 5pm today until 10:30am tommorow.</h5>
        </div> : null}

        <GoogleMapReact
          bootstrapURLKeys={{ key: [GOOGLE_API_KEY] }}
          center={this.state.center}
          zoom={13}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.renderMarkers(map, maps, this.state.dailyMenu)}
        >
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

      {this.renderTopSearchBar()}

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

      <Footer />
      </div>
    );
  }
}

const SuccessInfo = ({ closeToast }) => (
  <div>
    <img style={ { marginLeft:10, objectFit:'cover', width: 25, height: 25 }} src={"https://foodiebeegeneralphoto.s3-eu-west-1.amazonaws.com/checked.png"} />

     <b style={{marginLeft:10, marginTop:5, color: 'green'}}>Successfully Ordered!</b>
   
  </div>
)

const ErrorInfo = ({ closeToast }) => (
  <div>
    <img style={ { marginLeft:10, objectFit:'cover', width: 25, height: 25 }} src={"https://foodiebeegeneralphoto.s3-eu-west-1.amazonaws.com/cancel.png"} />

     <b style={{marginLeft:10, marginTop:5, color: 'red'}}>Error ordering item.</b>
   
  </div>
)

export default injectStripe(SearchLunchChild)
