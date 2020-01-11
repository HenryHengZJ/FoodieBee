import React, { Component } from 'react';
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
import './MobileAddPayment.css'
import axios from "axios";
import apis from "../../apis";
import img from "../../assets/img"
import Lottie from 'react-lottie';

class MobileAddPaymentChild extends Component {

  constructor(props) {
    super(props);

    this.state = {
      holdername: '',
      cardElement: null,
      isCardHolderNameEmpty: false,
      failedModal: false,
      successModal: false,
      customerPaymentAccountID: "",
      customerEmail: "",
    }
  }

  componentWillMount() {
    this.setState({
      customerEmail: this.props.customerEmail,
      customerPaymentAccountID: this.props.customerPaymentAccountID,
    })
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
              failedModal: true
            })
          }
          else {
            if (this.state.customerPaymentAccountID !== "") {
              this.saveNewCard(paymentMethod.id)
            }
            else {
              this.createUserPaymentAccount(paymentMethod.id)
            }
          }
        });
      }
    }
  }

  saveNewCard =  (paymentID) => {
    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.POSTsave_customer_card;

    var body = {
      paymentID: paymentID,
      customerPaymentAccountID: this.state.customerPaymentAccountID
    }

    axios.post(url, body, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            loadingModal: false,
            successModal: true,
          }, () => {
            window.postMessage(JSON.stringify({customerPaymentAccountID: "Saved new card"}));
          })
        } 
      })
      .catch((error) => {
        this.setState({
          loadingModal: false,
          failedModal: true,
        })
      });
  };

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
            customerPaymentAccountID: response.data.id,
            loadingModal: false,
            successModal: true,
          }, () => {
           // this.updateCustomerMongo()
            window.postMessage(JSON.stringify({customerPaymentAccountID: this.state.customerPaymentAccountID}));
          })
        } 
      })
      .catch((error) => {
        this.setState({
          loadingModal: false,
          failedModal: true,
        })
      });
  };

 /* updateCustomerMongo = () => {
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
  }*/

  renderPaymentCard() {
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
      <Col xs="12">
          <Card style={{boxShadow: 'none', borderWidth: 0}}>
          <CardBody>
            <Form>
              <Row
                style={{ marginBottom:0, flex: 1, display: "flex" }}
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
    </Col>
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
              Adding your card payment
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
              Successfully Added
            </p>

          </div>
        </ModalBody>
      </Modal>
    )
  }

  render() {

    return (
     
      <div style={{backgroundColor: 'white'}}  className="container-fluid">
      
        <div className="app">

        <Row style={{paddingTop: 20, }} >

          <Col style={{ marginTop: 20, textAlign: 'center' }} xs="12">
            <h3>Card validity check</h3>
          </Col>

          <Col style={{ marginTop: 10, textAlign: 'center', marginBottom:20 }} xs="12">
            <h5 style={{opacity: 0.8}}>No amount will be debited from your account</h5>
          </Col>

          {this.renderPaymentCard()}

        </Row>

        {this.renderLoadingModal()}

        {this.renderFailedModal()}

        {this.renderSuccessModal()}

      </div>
      
    </div>
    );
  }
}

export default injectStripe(MobileAddPaymentChild)
