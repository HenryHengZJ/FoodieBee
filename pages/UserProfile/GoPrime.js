import React, { Component } from 'react';
import  Link  from 'next/link';
import Head from 'next/head';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardGroup,
    Col,
    Container,
    Form,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Row,
    Label,
    FormGroup,
    FormFeedback,
    UncontrolledDropdown,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavItem,
    NavLink,
    Table,
    ButtonGroup,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Collapse,
    Badge,
  } from "reactstrap";
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
import Router from 'next/router'
import axios from "axios";
import apis from "../../apis";
import {server} from "../../config"
import Select from "react-select";
import Lottie from 'react-lottie';
import img from "../../assets/img"

class GoPrime extends Component {

  constructor(props) {
    super(props);

    this.state = {
      customerIsPrime: false,
      customerPaymentAccountID: "",
      subscriptionID: "",
      customerEmail: "",

      holdername: '',
      cardElement: null,
      isCardHolderNameEmpty: false,
      isCardInvalid: false,
      paymentCardModalOpen: false,

      failedModal: false,
      successModal: false,
      successtext: "",
  
    };
  }

  componentDidMount() {
     this.getCustomerDetails()
  }

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
            customerIsPrime: response.data[0].customerIsPrime,
            customerPaymentAccountID: typeof response.data[0].customerPaymentAccountID !== 'undefined' ? response.data[0].customerPaymentAccountID : "",
            subscriptionID: typeof response.data[0].subscriptionID !== 'undefined' ? response.data[0].subscriptionID : "",
          })
        } 
      })
      .catch((error) => {
      });
  };
  
  dismissFailedModal = () => {
    this.setState({
      failedModal: false
    })
  }

  dismissSuccessModal = () => {
    this.setState({
      successModal: false
    }, () => {
      Router.push(`/`)
    })
  }

  togglePaymentCardModal = () => {
    this.setState({
      paymentCardModalOpen: !this.state.paymentCardModalOpen,
      holdername: "",
    });
  }

  handleHolderNameChange(e) {
    this.setState({ 
      holdername: e.target.value, 
      isCardHolderNameEmpty: false
    })
  }

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
            this.subscribeNow()
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
    
    const {customerPaymentAccountID, subscriptionID, customerIsPrime} = this.state

    var headers = {
      'Content-Type': 'application/json',
    }

    var body = {}
    var successtext =""

    if (customerIsPrime) {
      body.customerIsPrime = false
      successtext = "You have unsubsribed to FoodieBee Prime."
    }
    else {
      body.customerIsPrime = true
      body.customerPaymentAccountID = customerPaymentAccountID
      body.subscriptionID = subscriptionID
      successtext = "You are now a prime member of FoodieBee! Enjoy the benefits and save up more from your daily lunches!"
    }

    var url = apis.UPDATEcustomerprofile;

    axios.put(url, body, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            paymentCardModalOpen: false,
            loadingModal: false,
            successModal: true,
            successtext: successtext,
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

  subscribeNow = () => {

    this.setState({
      loadingModal: true
    })

    const {customerPaymentAccountID} = this.state

    var subscribedetails = {}
    subscribedetails.customerPaymentAccountID = customerPaymentAccountID
    
    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.POSTcustomer_subscribe + "?trialvalid=" + (this.state.subscriptionID === "" ? "true" : "false");

    axios.post(url, subscribedetails, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          var subscriptionID = response.data.id
          this.setState({
            subscriptionID: subscriptionID,
          }, () => {
            this.updateCustomerMongo()
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

  cancelSubscribeNow = () => {

    this.setState({
      loadingModal: true
    })

    const {subscriptionID} = this.state

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.DELETE_cancel_subscription + "?subscriptionID=" + subscriptionID;

    axios.delete(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.updateCustomerMongo()
        } 
      })
      .catch((error) => {
        this.setState({
          loadingModal: false,
          failedModal: true
        })
      });
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
              Sit back and relax. We are processing your payment.
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
              {this.state.successtext}
            </p>

            <div style={{textAlign: 'center', marginTop: 20, marginBottom: 15}}>
              <Button block color="success" onClick={() => this.dismissSuccessModal()} style={{ fontWeight: '600', fontSize: 17, padding: 10 }} >
                OK
              </Button>
            </div>

          </div>
        </ModalBody>
      </Modal>
    )
  }

  renderPrime() {
    return (
      <Card style={{ backgroundColor: 'white', margin: 'auto', position: 'relative', marginTop: 60}}>
        <CardBody>
        <div style={{textAlign: 'center', paddingTop: 30}}>
            <b style={{ fontSize: 30, letterSpacing: 1.5, color: "#FF5722", fontWeight: '700'}}>
              Get lunch from just €6
            </b> 
        </div>
        {this.state.customerIsPrime ?
        <div style={{textAlign: 'center', paddingTop: 10}}>
          <p style={{marginTop: 20, fontSize: 18, fontWeight: '600'}}>Are you sure you want to cancel your prime membership?</p>
          <p>You will no longer entitled to following benefits as a prime member.</p>
        </div>
        :
        <div style={{textAlign: 'center', paddingTop: 10}}>
          <p style={{marginTop: 20, fontSize: 16, fontWeight: '500'}}>You can save much more by subscribing to prime membership.</p>
        </div>
        }
        <div style={{textAlign: 'center', paddingTop: 10}}>
          <Table borderless style={{  marginLeft: 10, marginRight: 10, marginTop: 20}}>
            <tbody>
              {this.state.subscriptionID === "" ?
              <tr>
                <td style={{textAlign: 'end'}}><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={img.checked} alt=""/></td>
                <td style={{fontSize: 17, textAlign: 'start'}}><p style={{fontWeight: '500', opacity: 0.8}}>Free trial for 1 month. Cancel anytime</p></td>
              </tr> : null }
              <tr>
                <td style={{textAlign: 'end'}}><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={img.checked} alt=""/></td>
                <td style={{fontSize: 17, textAlign: 'start'}}><p style={{fontWeight: '500', opacity: 0.8}}>€6 and €10 meals daily</p></td>
              </tr>
              <tr>
                <td style={{textAlign: 'end'}}><img style={ { objectFit:'cover', marginTop:5, width: 25, height: 25 }} src={img.checked} alt=""/></td>
                <td style={{fontSize: 17, textAlign: 'start'}}><p style={{fontWeight: '500', opacity: 0.8}}>No commitment. Order when you like</p></td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div style={{textAlign: 'center', color: 'white',}}>
          <Button  style={{fontSize: 18, height: 50, marginTop: 10, marginBottom: 30,}} className="bg-primary" size="lg" color="primary" onClick={() => this.state.customerIsPrime ? this.cancelSubscribeNow() : this.state.customerPaymentAccountID  === "" ? this.togglePaymentCardModal() : this.subscribeNow()}>{this.state.customerIsPrime ? "Cancel Membership" : this.state.subscriptionID === "" ? "Start Free Trial" : "Subsribe Now" }</Button>
        </div>
        <div style={{textAlign: 'center',marginBottom: 20}}>
          {this.state.customerIsPrime ? 
          <p style={{fontSize: 16, fontWeight: '600'}}>You will still be able to enjoy the benefits until the next cycle of your subscription date.</p>
          :
          <p style={{fontSize: 16, fontWeight: '600'}}>Only <b style={{fontSize: 20, color: "#FF5722", fontWeight: '700' }}>€4.99</b> / month after free trial. Cancel anytime. </p>
          }
          </div>
        </CardBody>
      </Card>
    )
  }

  render() {
    return (
      <div>
      <img style={{ objectFit:'cover', width: '100%', height: 500 }} src={img.golunch_wallpaper_dimmed} alt=""></img>
        <Row style={{marginTop: -450}}>
          <Col xs="12">
            <div style={{textAlign: 'center', paddingTop: 50}}>
              <b style={{ fontSize: 45, letterSpacing: 1.5, color: "white", fontWeight: '700'}}>
                FoodieBee
                <Button style={{cursor: "pointer", marginLeft: 10, opacity: 1.0, padding: 7, fontWeight: '600', fontSize: 20, borderWidth: 0, backgroundColor: "#FF5722", color: "white" }} disabled>PRIME</Button>          
              </b> 
            </div>
          </Col>
          <Col xs="1" sm="1" md="3" lg="3"></Col>
          <Col xs="10" sm="10" md="6" lg="6">
            {this.renderPrime()}
          </Col>
          <Col xs="1" sm="1" md="3" lg="3"></Col>
        </Row>

        {this.renderPaymentCardModal()}
        
        {this.renderLoadingModal()}

        {this.renderFailedModal()}

        {this.renderSuccessModal()}

      </div>
    );
  }
}

export default injectStripe(GoPrime);
