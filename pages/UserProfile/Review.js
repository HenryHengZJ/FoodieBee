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
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Layout from '../../components/Layout';
import Router from 'next/router'
import axios from "axios";
import apis from "../../apis";
import {server} from "../../config"
import moment from "moment";
import { DateRangePicker, DateRange } from 'react-date-range';
import StarRatings from 'react-star-ratings';
import { format, addDays, subDays } from 'date-fns';

class Review extends Component {

  constructor(props) {
    super(props);

    this.changeRating = this.changeRating.bind(this)

    this.state = {
      empty: false,
      maxDate: null,
      currentDate: null,
      previousDate: null,
      dropDownDate: false,
      dropDownPayment: false,
      dropDownType: false,
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
      dateRange: '',
      dateArray: [],
      tableitems: [],
      selectedReviewItem: null,
      reviewComment: "",
      rating: 0,
      reviewModalOpen: false,
    };
  }


  getSessionStorage = () => {
    
    var currentDateString;
    var previousDateString;

    var currentDateString = sessionStorage.getItem("currentReviewDateString")
    var previousDateString = sessionStorage.getItem("previousReviewDateString")

    this.getReview(currentDateString, previousDateString)
    
  }

  componentDidMount() {

    if (sessionStorage.getItem("currentReviewDateString") !== null && sessionStorage.getItem("previousReviewDateString") !== null) {
      this.getSessionStorage()
    }
    else {

      var currentDateString;
      var previousDateString;
   
      var dateNow = moment().toDate();
      currentDateString = moment(dateNow).format("DD MMM, YYYY")
      previousDateString =  moment(subDays(new Date(), 7)).format("DD MMM, YYYY");
      
      this.getReview(currentDateString, previousDateString)
    }

  }

  getReview = (currentDateString, previousDateString) => {

    var finalOrderSelectionDateString = previousDateString + ' - ' + currentDateString
  
    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.GETreview;

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data)
          this.setState({
            tableitems: response.data,
            empty: response.data.length === 0 ? true : false,
            maxDate: new Date(),
            dateRange: finalOrderSelectionDateString,
          })
        } 
      })
      .catch((error) => {
        this.setState({
          empty: true 
        })
      });
  }

  postReview = () => {

    const { selectedReviewItem, reviewComment, rating } = this.state;

    if (rating === 0) {
      return
    }
    var data = {
      customerComment: reviewComment,
      catererID: selectedReviewItem.catererDetails[0]._id,
      customerRating: rating
    }

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = ""
    var execquery = null

    if (selectedReviewItem._id !== "") {
      url = apis.UPDATEreview + "?_id=" + selectedReviewItem._id
      execquery = axios.put(url, data, {withCredentials: true}, {headers: headers})
    }
    else {
      url = apis.POSTreview
      execquery = axios.post(url, data, {withCredentials: true}, {headers: headers})
    }

    execquery.then((response) => {
        if (response.status === 200 || response.status === 201) {
          this.setState({
            reviewModalOpen: false,
            reviewComment: "",
            rating: 0,
          }, () => {
            this.getReview("", "")
          })
        } 
      })
      .catch((error) => {
        if (error) {
          this.setState({
            reviewModalOpen: false,
            reviewComment: "",
            rating: 0,
          }, () => {
            this.getReview("", "")
          })
        } 
      }); 
  }

  toggleDropDown = () => {
    this.setState({
      dropDownDate: !this.state.dropDownDate
    })
  }

  handleRangeChange(which, payload) {
    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
    })
  }

  selectDateRange = () => {
    var startDate = moment(this.state.dateRangePicker.selection.startDate).format("DD MMM, YYYY")
    var endDate = moment(this.state.dateRangePicker.selection.endDate).format("DD MMM, YYYY")
    var finalDate = startDate + ' - ' + endDate

    this.setState({
      dateRange: finalDate,
      dropDownDate: !this.state.dropDownDate,
    }, () => {
      sessionStorage.setItem('currentReviewDateString', endDate)
      sessionStorage.setItem('previousReviewDateString', startDate)
      this.getReview(endDate, startDate)
    })
  }

  toggleReviewModal = () => {
    this.setState({
      reviewModalOpen: !this.state.reviewModalOpen,
      reviewComment: "",
      rating: 0,
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

  renderReviewModal() {
    const { selectedReviewItem } = this.state
    return (
      <Modal    
        toggle={() => this.toggleReviewModal()}
        isOpen={this.state.reviewModalOpen} >
        <ModalHeader toggle={() => this.toggleReviewModal()}>
          Leave a Review
        </ModalHeader>
        <ModalBody style={{paddingTop: 0, marginTop: 0, paddingLeft: 0, paddingRight: 0}}>

          <div style={{ width: 80, height: 80, position: 'relative', margin: 'auto', overflow: 'hidden', borderRadius: '50%'}}>
            <img alt="" style={{ objectFit:'cover', width: '100%', height: '100%', display: 'inline' }} src={selectedReviewItem.catererDetails[0].profilesrc}/>
          </div>

          <div style={{textAlign: 'center', marginBottom: 10}}>
            <b>{selectedReviewItem.catererDetails[0].catererName}</b>
          </div>

          <div style={{textAlign: 'center', marginBottom: 10}}>
            <StarRatings
              rating={this.state.rating === 0 ? selectedReviewItem.customerRating : this.state.rating }
              starRatedColor="orange"
              changeRating={this.changeRating}
              numberOfStars={5}
              name='rating'
            />
          </div>

          <div style={{ margin: 20}}>
            <Input style={{color: 'black', height: 100}} value={this.state.reviewComment === "" ? selectedReviewItem.customerComment : this.state.reviewComment } onChange={(e) => this.handleReviewComment(e)} type="textarea" placeholder="More details of your experience" />
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

  renderDateAction() {
    return (
      <Row style={{marginBottom: 10, marginRight: 10}}>
        <Col>
        
        <Button
          style={{ marginLeft: 10 }}
          outline
          color="primary"
          onClick={() => this.selectDateRange()}
        >
          Select
        </Button>
        <Button
          style={{ marginLeft: 10, opacity: 0.6 }}
          outline
          color="dark"
          onClick={() => this.toggleDropDown()}
        >
          Cancel
        </Button>
        </Col>
      </Row>
    );
  }

  renderTableItems() {
    var itemarray = [];

    var tableitems = this.state.tableitems;

    for (let i = 0; i < tableitems.length; i++) {
      itemarray.push(
        <tr style={{cursor: 'pointer'}} onClick={()=> this.setState({selectedReviewItem: tableitems[i]}, () => {this.toggleReviewModal()})}>
          <td style={{width: '10%'}}>{tableitems[i].catererDetails[0].catererName}</td>
          <td style={{width: '15%'}}>
            <StarRatings
              starRatedColor='orange'
              starSpacing='0px'
              starDimension='15px'
              rating={tableitems[i].customerRating}
              numberOfStars={5}
              name='rating'
            />
          </td>
          <td style={{width: '45%'}}>{tableitems[i].customerComment}</td>
          <td style={{width: '15%'}}>{moment(tableitems[i].createdAt).format("DD MMM, YYYY")}</td>
        </tr>
      );
    }

    return <tbody>{itemarray}</tbody>;
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
            You have 0 reviews for now.
          </p>
        </Col>
      </Row>
    );
  }
 

  renderReviewTable() {
    return (
      <div>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          {this.state.empty ? null : this.renderTableItems()}
          </Table>
          {this.state.empty ? this.renderEmptyItems() : null }
        </div>
    );
  }

  render() {
    return (
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <Row >
                <Col>
                  <Label style={{ marginTop: 10 }} className="h6">
                    Review
                  </Label>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <div class="table-wrapper-scroll-y my-custom-scrollbar">
                {this.renderReviewTable()}
              </div>
            </CardBody>
          </Card>
        </Col>
        { this.state.selectedReviewItem !== null ? this.renderReviewModal() : null}
      </Row>
    );
  }
}

export default Review;
