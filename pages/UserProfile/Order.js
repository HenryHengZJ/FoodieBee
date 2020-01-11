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
import Router from 'next/router'
import axios from "axios";
import apis from "../../apis";
import moment from "moment";
import ContentLoader, { Facebook } from "react-content-loader";
import Dotdotdot from "react-dotdotdot";
import img from "../../assets/img"
import { timeRanges } from  "../../utils"
import Lottie from 'react-lottie';
import StarRatings from 'react-star-ratings';

class Order extends Component {

  constructor(props) {
    super(props);

    this.changeRating = this.changeRating.bind(this)

    this.state = {
      orderLunchModal: false,
      selectedLunchOrderItem: null,
      lunchempty: false,
      lunchtableitems: [],
      filtered_data: [],
      selectedOrderTable: "Current Orders",
      selectedPickUpTime: "",
      failedModal: false,
      successModal: false,
      successText: "",
      rating: 0,
      reviewComment: "",
      reviewID: "",
      reviewModalOpen: false
    };

    this.time  = timeRanges();
  }

  componentDidMount() {
    //Get Orders
    this.getLunchOrder()
  }

  getLunchOrder = () => {

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.GETlunchorder;

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          console.log('order data =', response.data)
          this.setState({
            lunchtableitems: response.data,
            lunchempty: response.data.length > 0 ? false : true
          },
          () => {
            this.filterOrder();
          })
        } 
      })
      .catch((error) => {
      });
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

  showPosition(position) {
    alert( position.coords.latitude)
   /* x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude;*/
  }

  openEmail = () => {
    window.location.href = `mailto:support@foodiebee.eu`;
  }

  lunchTableItemClicked = (_id) => {
    
    var itemindex = this.state.lunchtableitems.findIndex(x => x._id == _id);

    this.setState({
      selectedLunchOrderItem: this.state.lunchtableitems[itemindex]
    }, () => {
      this.toggleLunchOrderModal()
    })
  }

  toggleLunchOrderModal = () => {
    this.setState({
      orderLunchModal: !this.state.orderLunchModal,
      selectedPickUpTime: "",
    })
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  navItemClicked = selectedMenu => {
    this.setState(
      {
        selectedOrderTable: selectedMenu
      },
      () => {
        this.filterOrder();
      }
    );
  };

  filterOrder = () => {
    var filtered_data = [];
    if (this.state.selectedOrderTable === "Current Orders") {
      filtered_data = this.state.lunchtableitems
        .slice()
        .filter(
          datachild =>
            datachild.orderStatus === "accepted" ||
            datachild.orderStatus === "pending"
        );
    } else {
      filtered_data = this.state.lunchtableitems
        .slice()
        .filter(
          datachild =>
            datachild.orderStatus === "pickedup" ||
            datachild.orderStatus === "rejected" ||
            datachild.orderStatus === "cancelled"
        );
    }

    this.setState({
      filtered_data
    });
  };

  handlePickUpChange(e) {
    this.setState({ 
      selectedPickUpTime: e.target.value,
    })
  }

  dismissFailedModal = () => {
    this.setState({
      failedModal: false
    })
  }

  dismissSuccessModal = () => {
    this.setState({
      successModal: false,
      successText: "",
    })
  }

  toggleReviewModal = () => {
    this.setState({
      reviewModalOpen: !this.state.reviewModalOpen,
    } ,() => {
      if (this.state.reviewModalOpen) {
        this.getReview()
      }
      else {
        this.setState({
          reviewComment: "",
          rating: 0,
        })
      }
    })
  }

  changeRating( newRating, name ) {
    this.setState({
      rating: newRating
    });
  }

  handleReviewComment = (e) => {
    this.setState({ 
      reviewComment: e.target.value
    })
  }

  getReview = () => {

    const { selectedLunchOrderItem, reviewComment, rating } = this.state;

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.GETreview + "?catererID=" + selectedLunchOrderItem.catererDetails[0]._id

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length > 0) {
            this.setState({
              reviewComment: response.data[0].customerComment,
              rating: response.data[0].customerRating,
              reviewID : response.data[0]._id,
            })
          }
        } 
      })
      .catch((error) => {
      }); 
  }

  postReview = () => {

    const { selectedLunchOrderItem, reviewComment, rating, reviewID } = this.state;

    if (rating === 0) {
      return
    }
    var data = {
      customerComment: reviewComment,
      catererID: selectedLunchOrderItem.catererDetails[0]._id,
      customerRating: rating
    }

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = ""
    var execquery = null

    if (reviewID !== "") {
      url = apis.UPDATEreview + "?_id=" + reviewID
      execquery = axios.put(url, data, {withCredentials: true}, {headers: headers})
    }
    else {
      url = apis.POSTreview
      execquery = axios.post(url, data, {withCredentials: true}, {headers: headers})
    }

    execquery.then((response) => {
        if (response.status === 200 || response.status === 201) {
          this.setState({
            orderLunchModal: false,
            reviewModalOpen: false,
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            orderLunchModal: false,
            reviewModalOpen: false,
            failedModal: true
          })
        } 
      }); 
  }

  changePickUpTime = () => {

    const { selectedLunchOrderItem, selectedPickUpTime } = this.state;

    var pickupTime = null

    var timenow = parseInt(moment(new Date()).format("HHmm"));
    if (timenow > 1700) {
      //Add 1 day
      pickupTime = moment(selectedPickUpTime, 'hh:mm A').add(1, 'days').toISOString();
    }
    else {
      pickupTime = moment(selectedPickUpTime, 'hh:mm A').toISOString();
    }

    var dataToUpdate = {
      pickupTime: pickupTime
    }

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.PUTupdatelunchorder + "?_id=" + selectedLunchOrderItem._id;

    axios.put(url, dataToUpdate, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            orderLunchModal: false,
            successModal: true,
            successText: "Pickup Time for Order #" + selectedLunchOrderItem.orderNumber + " has been successfully changed."
          }, () => {
            this.getLunchOrder();
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            orderLunchModal: false,
            failedModal: true
          })
        } 
      }); 
  }

  cancelOrder = () => {

    const { selectedLunchOrderItem } = this.state;

    var dataToUpdate = {
      orderStatus: "cancelled",
      totalOrderPrice: 0
    }

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.PUTupdatelunchorder + "?_id=" + selectedLunchOrderItem._id;

    axios.put(url, dataToUpdate, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            orderLunchModal: false,
            successModal: true,
            successText: "Order #" + selectedLunchOrderItem.orderNumber + " has been successfully cancelled. Nothings was charged from your account."
          }, () => {
            this.getLunchOrder();
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            orderLunchModal: false,
            failedModal: true
          })
        } 
      }); 
  }

  cancelPaymentIntent = () => {

    const { selectedLunchOrderItem } = this.state;

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.DELETE_cancel_payment_intent + "?paymentIntentID=" + selectedLunchOrderItem.paymentIntentID;

    axios.delete(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.cancelOrder()
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            orderLunchModal: false,
            failedModal: true
          })
        } 
      }); 
  }

  mealPickedUp = () => {

    const { selectedLunchOrderItem } = this.state;

    var dataToUpdate = {
      orderStatus: "pickedup"
    }

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.PUTupdatelunchorder + "?_id=" + selectedLunchOrderItem._id;

    axios.put(url, dataToUpdate, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            orderLunchModal: false,
            successModal: true,
            successText: "You have picked up Order #" + selectedLunchOrderItem.orderNumber + " - " +  selectedLunchOrderItem.orderItem[0].title + ". You can leave your review later. Now, enjoy and eat!"
          }, () => {
            this.getLunchOrder();
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            orderLunchModal: false,
            failedModal: true
          })
        } 
      }); 
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
              An error has occured. Please try again later or contact our support team at support@foodiebee.eu
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
              {this.state.successText}
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

  renderReviewModal() {
    const { selectedLunchOrderItem } = this.state
    return (
      <Modal    
        toggle={() => this.toggleReviewModal()}
        isOpen={this.state.reviewModalOpen} >
        <ModalHeader toggle={() => this.toggleReviewModal()}>
          Leave a Review
        </ModalHeader>
        <ModalBody style={{paddingTop: 0, marginTop: 0, paddingLeft: 0, paddingRight: 0}}>

          <div style={{ width: 80, height: 80, position: 'relative', margin: 'auto', overflow: 'hidden', borderRadius: '50%'}}>
            <img alt="" style={{ objectFit:'cover', width: '100%', height: '100%', display: 'inline' }} src={selectedLunchOrderItem.catererDetails[0].profilesrc}/>
          </div>

          <div style={{textAlign: 'center', marginBottom: 10}}>
            <b>{selectedLunchOrderItem.catererDetails[0].catererName}</b>
          </div>

          <div style={{textAlign: 'center', marginBottom: 10}}>
            <StarRatings
              rating={this.state.rating}
              starRatedColor="orange"
              changeRating={this.changeRating}
              numberOfStars={5}
              name='rating'
            />
          </div>

          <div style={{ margin: 20}}>
            <Input style={{color: 'black', height: 100}} value={this.state.reviewComment} onChange={(e) => this.handleReviewComment(e)} type="textarea" placeholder="More details of your experience" />
          </div>

          <div style={{textAlign: 'center', margin: 20}}>
            <Button block style={{fontSize: 18, height: 50, marginTop: 10, marginBottom: 10,}} className="bg-primary" color="primary" onClick={()=> this.postReview()}>Post</Button>
          </div>
          <div style={{textAlign: 'center', }}>
            <Button block color="link" onClick={() => this.toggleReviewModal()} style={{ fontSize: 18,  fontWeight: '500',color: "#20a8d8" }} >
              <p style={{padding: 0, marginTop: 10}}>Later</p>
            </Button>
          </div>
          
        </ModalBody>
      </Modal>
    )
  }

  rendeSelectedLunchOrderItems() {
    const { selectedLunchOrderItem } = this.state;
    return (
      <div>

        {selectedLunchOrderItem.orderStatus === "pending" ? 
          <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '700', borderRadius: 0, marginBottom: 10 }} disabled block color="warning">
            Pending
          </Button>
          :
          selectedLunchOrderItem.orderStatus === "accepted" ? 
          <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', borderRadius: 0, marginBottom: 10}} disabled block color="success">
            Accepted
          </Button>
          :
          selectedLunchOrderItem.orderStatus === "rejected" ? 
          <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', borderRadius: 0, marginBottom: 10}} disabled block color="danger">
            Rejected
          </Button>
          : 
          selectedLunchOrderItem.orderStatus === "cancelled" ? 
          <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', borderRadius: 0, marginBottom: 10}} disabled block color="secondary">
            Cancelled
          </Button>
          :  
          selectedLunchOrderItem.orderStatus === "pickedup" ? 
          <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', borderRadius: 0, marginBottom: 10}} disabled block color="primary">
            Picked Up
          </Button>
          :
          null
        }

        <b style={{ paddingLeft: 15, paddingRight: 15, color: "#20a8d8", fontSize: 19 }}>{selectedLunchOrderItem.orderItem[0].title}</b>

        <img
          style={{paddingLeft: 15, paddingRight: 15, marginTop:10, marginBottom: 10, objectFit: "cover", width: "100%", height: 200 }}
          src={selectedLunchOrderItem.orderItem[0].src ? selectedLunchOrderItem.orderItem[0].src : img.food_blackwhite}
        /> 

        <p style={{ paddingLeft: 15, paddingRight: 15, fontWeight:'600', marginTop: 10, fontSize: 18 }}>{selectedLunchOrderItem.catererDetails[0].catererName}</p>

        <Button
          color="link"
          onClick={() => this.openMaps(selectedLunchOrderItem.catererDetails[0].location.coordinates[0],selectedLunchOrderItem.catererDetails[0].location.coordinates[1])}
          style={{
            padding: 0,
            fontWeight: "500",
            color: "#20a8d8",
            paddingLeft: 15, paddingRight: 15,
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
          {selectedLunchOrderItem.catererDetails[0].catererAddress}
        </Button>

        <div style={{paddingLeft: 15, paddingRight: 15, marginTop: 10 }}>
          <p>
            {selectedLunchOrderItem.orderItem[0].descrip}
          </p>
        </div>

        <div style={{height: 1, backgroundColor: 'black', width: '93%', opacity: 0.2, marginLeft: 15, marginTop: 10, marginBottom: 10}}></div>

        <Table borderless>
          <tbody>
            <tr>
              <td style={{ paddingLeft: 15, fontSize: 16, textAlign: "start", }}>
                Pickup Time
              </td>
              <td style={{  paddingRight: 15, fontSize: 17, textAlign: "end", color: "#FF5722", fontWeight: '600' }}>
                {moment(selectedLunchOrderItem.pickupTime).format("hh:mm A")}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 15, fontSize: 16, textAlign: "start" }}>
                Date
              </td>
              <td style={{  paddingRight: 15, fontSize: 16, fontWeight: "600", textAlign: "end" }}>
                {moment(selectedLunchOrderItem.createdAt).format("ddd, DD MMM YYYY")}
              </td>
            </tr>
            <tr>
              <td
                style={{ paddingLeft: 15, fontSize: 16,  textAlign: "start" }}
              >
                {selectedLunchOrderItem.orderStatus === "pending"? "Charge Pending" : "Charged"}
              </td>
              <td style={{ paddingRight: 15, fontSize: 16, fontWeight: "600", textAlign: "end" }}>
                €{Number(selectedLunchOrderItem.totalOrderPrice).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </Table>

       {selectedLunchOrderItem.orderStatus === "pending" ? 
          <Row style={{paddingLeft: 15, paddingRight: 15}}>
             <Col style={{marginTop: 15,}} xs="4" md="4">
              <FormGroup>
                <Input value={this.state.selectedPickUpTime} onChange={(e) => this.handlePickUpChange(e)} style={{color:'black', fontSize: 14, fontWeight: '600', letterSpacing: 1, height: 45, borderColor: "#FF5722", borderWidth: 1, borderType: 'solid'}} type="select" placeholder="Select Pick Up Time" autoComplete="pickuptime">
                <option value="" disabled> Pickup Time</option>
                {this.time.map(time =>
                  <option style={{color:'black'}} key={time} value={time}>{time}</option>
                )}
                </Input>
              </FormGroup>
            </Col>

            <Col style={{marginTop: 15,}} xs="8" md="8">
              <Button onClick={() => this.changePickUpTime()} style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', backgroundColor: "#FF5722", color: 'white'}} block >
                Change Pickup Time
              </Button>
            </Col>

            <Col style={{marginTop: 10,}} xs="12">
              <Button onClick={() => this.cancelPaymentIntent()} style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600',}} block color="danger">
                Cancel Order
              </Button>
            </Col>
          </Row>
          : null }

        {selectedLunchOrderItem.orderStatus === "accepted" ? 
          <Row style={{paddingLeft: 15, paddingRight: 15}}>

            <Col style={{marginTop: 15,}} xs="4" md="4">
              <FormGroup>
                <Input value={this.state.selectedPickUpTime} onChange={(e) => this.handlePickUpChange(e)} style={{color:'black', fontSize: 14, fontWeight: '600', letterSpacing: 1, height: 45, borderColor: "#FF5722", borderWidth: 1, borderType: 'solid'}} type="select" placeholder="Select Pick Up Time" autoComplete="pickuptime">
                <option value="" disabled> Pickup Time</option>
                {this.time.map(time =>
                  <option style={{color:'black'}} key={time} value={time}>{time}</option>
                )}
                </Input>
              </FormGroup>
            </Col>

            <Col style={{marginTop: 15,}} xs="8" md="8">
              <Button onClick={() => this.changePickUpTime()} style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', backgroundColor: "#FF5722", color: 'white'}} block >
                Change Pickup Time
              </Button>
            </Col>

            <Col style={{marginTop: 10,}} xs="12">
              <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600',}} block color="primary" onClick={() => this.mealPickedUp()}>
                MEAL PICKED UP
              </Button>
            </Col>

            <Col xs="12">
              <p
                style={{ marginTop: 20, marginBottom: 10 }}
                className="text-muted text-center"
              >
                Any queries or request for refund, please contact us at&nbsp;
                <Button color="link" onClick={() => this.openEmail()} style={{ fontWeight: '500',color: "#20a8d8" }} >
                  <p style={{padding: 0, marginTop: 0}}>support@foodiebee.eu</p>
                </Button>
              </p>
            </Col>

          </Row>
          : null }

        {selectedLunchOrderItem.orderStatus === "rejected" ? 
          <Row style={{paddingLeft: 15, paddingRight: 15}}>
            <Col xs="12">
              <p
                style={{ marginTop: 20, marginBottom: 10 }}
                className="text-muted text-center"
              >
                Any queries or request for refund, please contact us at&nbsp;
                <Button color="link" onClick={() => this.openEmail()} style={{ fontWeight: '500',color: "#20a8d8" }} >
                  <p style={{padding: 0, marginTop: 0}}>support@foodiebee.eu</p>
                </Button>
              </p>
            </Col>
          </Row>
          : null }

        {selectedLunchOrderItem.orderStatus === "pickedup" ? 
          <Row style={{paddingLeft: 15, paddingRight: 15}}>

            <Col style={{marginTop: 10,}} xs="12">
              <Button style={{opacity: 1, padding: 10, fontSize: 17, fontWeight: '600', backgroundColor: '#20c997', color: 'white'}} block onClick={() => this.toggleReviewModal()}>
                Leave Review
              </Button>
            </Col>

            <Col xs="12">
              <p
                style={{ marginTop: 20, marginBottom: 10 }}
                className="text-muted text-center"
              >
                Any queries please contact us at&nbsp;
                <Button color="link" onClick={() => this.openEmail()} style={{ fontWeight: '500',color: "#20a8d8" }} >
                  <p style={{padding: 0, marginTop: 0}}>support@foodiebee.eu</p>
                </Button>
              </p>
            </Col>

          </Row>
          : null }

      </div>
    );
  }

  renderLunchOrderModal() {
    const { selectedLunchOrderItem } = this.state;
    return (
      <Modal
        isOpen={this.state.orderLunchModal}
        toggle={() => this.toggleLunchOrderModal()}
      >
        <ModalHeader toggle={() => this.toggleLunchOrderModal()}>

          <b style={{ color: "#FF5722", fontSize: 18 }}> Order #{selectedLunchOrderItem.orderNumber}</b>

         
        </ModalHeader>
        <ModalBody style={{paddingTop: 0, paddingLeft: 0, paddingRight: 0}}>{this.rendeSelectedLunchOrderItems()}</ModalBody>
      </Modal>
    );
  }

  
  renderItems() {
    var itemsarray = [];

    var orderitems = this.state.filtered_data;

    for (let i = 0; i < orderitems.length; i++) {
      var item = orderitems[i];

      itemsarray.push(
        <Col xs="12" sm="6" md="6" lg="4" style={{ marginBottom: 20 }}>
          <Card
            className="card-1"
            onClick={() => this.lunchTableItemClicked(orderitems[i]._id)}
            style={{ cursor: "pointer" }}
          >
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
                <Col style={{ padding: 0 }} xs="12">
                  <div
                    style={{ objectFit: "cover", width: "auto", height: 180 }}
                  >
                    <img
                      alt=""
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%"
                      }}
                      src={
                        item.orderItem[0].src
                          ? item.orderItem[0].src
                          : food_blackwhitePic
                      }
                    />
                  </div>
                </Col>

                <Col style={{ marginTop: 15 }} xs="12">
                  <div>
                    <Dotdotdot clamp={1}>
                      <p
                        className="h5"
                        style={{
                          cursor: "pointer",
                          color: "#20a8d8",
                          overflow: "hidden"
                        }}
                      >
                        {item.orderItem[0].title}
                      </p>
                    </Dotdotdot>
                  </div>
                  <div>
                    <Dotdotdot clamp={1}>
                      <p
                        style={{
                          marginTop: 5,
                          fontWeight: "600",
                          fontSize: 16,
                          cursor: "pointer",
                          overflow: "hidden"
                        }}
                      >
                        {item.catererDetails[0].catererName}
                      </p>
                    </Dotdotdot>
                  </div>
                  <div style={{ marginTop: -5 }}>
                    <Dotdotdot clamp={1}>
                      <p
                        style={{
                          fontWeight: "500",
                          fontSize: 14,
                          cursor: "pointer",
                          overflow: "hidden",
                          opacity: 0.5
                        }}
                      >
                        {item.catererDetails[0].catererAddress}
                      </p>
                    </Dotdotdot>
                  </div>
                  <div style={{ marginTop: -5 }}>
                    <Badge
                      color={
                        item.orderStatus === "pending"
                          ? "warning"
                          : item.orderStatus === "accepted"
                          ? "success"
                          : item.orderStatus === "rejected"
                          ? "danger"
                          : item.orderStatus === "pickedup"
                          ? "primary"
                          : item.orderStatus === "cancelled"
                          ? "secondary"
                          : "secondary"
                      }
                    >
                      {item.orderStatus.toUpperCase()}
                    </Badge>
                  </div>
                </Col>

                <Col
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    paddingLeft: 5,
                    paddingRight: 5
                  }}
                  xs="12"
                >
                  <div>
                    <Table borderless style={{ padding: 0, margin: 0 }}>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              paddingTop: 5,
                              paddingBottom: 5,
                              textAlign: "start",
                              fontSize: 14,
                              fontWeight: "600",
                              opacity: 0.6
                            }}
                          >
                            Pickup Time
                          </td>
                          <td
                            style={{
                              paddingTop: 5,
                              paddingBottom: 5,
                              textAlign: "end",
                              fontSize: 15,
                              fontWeight: "700",
                              color: "#FF5722"
                            }}
                          >
                            {moment(item.pickupTime).format("hh:mm A")}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              paddingTop: 5,
                              paddingBottom: 5,
                              textAlign: "start",
                              fontSize: 14,
                              fontWeight: "600",
                              opacity: 0.6
                            }}
                          >
                            Date
                          </td>
                          <td
                            style={{
                              paddingTop: 5,
                              paddingBottom: 5,
                              textAlign: "end",
                              fontSize: 15,
                              fontWeight: "600",
                              color: "black"
                            }}
                          >
                            {moment(item.pickupTime).format("ddd, DD MMM YYYY")}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              paddingTop: 5,
                              paddingBottom: 5,
                              textAlign: "start",
                              fontSize: 14,
                              fontWeight: "600",
                              opacity: 0.6
                            }}
                          >
                            {item.orderStatus === "pending"? "Charge Pending" : "Charged"}
                          </td>
                          <td
                            style={{
                              paddingTop: 5,
                              paddingBottom: 5,
                              textAlign: "end",
                              fontSize: 15,
                              fontWeight: "600",
                              color: "black"
                            }}
                          >
                            { (item.orderStatus === "cancelled" || item.orderStatus === "rejected") ?  "€0" : "€" + Number(item.totalOrderPrice).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      );
    }

    return <Row>{itemsarray}</Row>;
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

  renderEmptyItems() {
    return (
      <Row style={{ marginTop: 90 }}>
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
              "https://s3-eu-west-1.amazonaws.com/foodiebeegeneralphoto/empty.png"
            }
          />
        </Col>
        <Col style={{ textAlign: "center" }} xs="12">
          <p
            style={{ fontSize: 18, letterSpacing: 2, marginTop: 30 }}
            className="big"
          >
            You have 0 items ordered.
          </p>
        </Col>
      </Row>
    );
  }
  
  renderNavItem(menutitle) {
    return (
      <NavItem >
        <NavLink
          onClick={() => this.navItemClicked(menutitle)}
          style={{
            cursor: "pointer",
            fontWeight: "600",
            color: this.state.selectedOrderTable === menutitle ? "#FF5722" : "black",
            fontSize: 17
          }}
        >
          {menutitle}
        </NavLink>
        <div
          style={{
            height: 2,
            width: "100%",
            backgroundColor:
              this.state.selectedOrderTable === menutitle
                ? "#FF5722"
                : "transparent"
          }}
        />
      </NavItem>
    );
  }

  render() {
    return (
      <Row style={{flex: 1, display: 'flex'}}>
        <Col xs="12">
          <Nav fill>
            {this.renderNavItem("Current Orders")}
            {this.renderNavItem("Past Orders")}
          </Nav>
        </Col>
        
        <Col
          style={{ paddingTop: 30,  }}
          xs="12"
        >
          <Row>
            <Col style={{ marginTop: 20 }} xs="12">
              {this.state.loading
                ? this.renderLoadingItems()
                : this.state.lunchtableitems.length > 0
                ? this.renderItems()
                : this.renderEmptyItems()}
            </Col>
          </Row>
        </Col>
      {this.state.selectedLunchOrderItem !== null ? this.renderLunchOrderModal() : null}
      {this.renderFailedModal()}
      {this.renderSuccessModal()}
      { this.state.selectedLunchOrderItem !== null ? this.renderReviewModal() : null}
    </Row>
    );
  }
}

export default Order;
