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
import Select from "react-select";
import Lottie from 'react-lottie';
import img from "../../assets/img"
import {CopyToClipboard} from 'react-copy-to-clipboard';

class FreeRewards extends Component {

  constructor(props) {
    super(props);

    this.handleEmailChange = this.handleEmailChange.bind(this);

    this.state = {
      inviteEmail: "",
      shareLink: "",
      copied: false,
    }
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
         var last4digits = response.data[0]._id.slice(response.data[0]._id.length - 4);
         var shareLink = "https://foodiebee.eu/invite?refCode=" + response.data[0].customerFirstName + response.data[0].customerLastName.charAt(0) + last4digits
         this.setState({
          shareLink
         })
       } 
     })
     .catch((error) => {
     });
 };

  handleEmailChange(e) {
    this.setState({
      inviteEmail: e.target.value
    });
  }

  onSendInvite = () => {
    this.setState({
      inviteEmail: ""
    })
  }

  onCopyLink = () => {
    this.setState({
      copied: true
    }, () => {
      setTimeout(function() { //Start the timer
        this.setState({copied: false})
      }.bind(this), 5000)
    })
  }

  renderInvite() {
    return (
      <Card style={{ backgroundColor: 'white', margin: 'auto', position: 'relative', marginTop: 60}}>
        <CardBody>
        <div style={{textAlign: 'center', paddingTop: 30}}>
            <b style={{ fontSize: 30, letterSpacing: 1.5, color: "#FF5722", fontWeight: '700'}}>
              Invite co-workers and friends
            </b> 
        </div>

        <div style={{textAlign: 'center', paddingTop: 20, paddingBottom: 20, paddingRight: 20, paddingLeft: 20}}>
          <p style={{marginTop: 20, fontSize: 16, fontWeight: '500'}}>For every person you invited, you will get total of €6 off your next 3 orders (€2 for each), and so does the person you invited. </p>
        </div>
        
        <div style={{textAlign: 'center', paddingTop: 10}}>
          <Row >
           
            <Col xs="12" md="8">
              <Input style={{color: 'black', padding: 15, height: 50}}
                type="email"
                id="hf-email"
                name="hf-email"
                placeholder="Enter Email Addresses"
                autoComplete="email"
                value={this.state.inviteEmail}
                onChange={e => {
                  this.handleEmailChange(e);
                }}
              />         
            </Col>
            <Col  xs="12" md="4">
              <Button block style={{fontSize: 18, height: 50}} color="primary" onClick={() => this.onSendInvite()}>Send</Button>
            </Col>
            
          </Row>
        </div>

        <div style={{textAlign: 'center', paddingTop: 10, paddingBottom: 20}}>
          <Row >
            <Col xs="12">
              <p style={{marginTop: 20, fontSize: 16, fontWeight: '500'}}>Share your invite link</p>
            </Col>
           
            <Col xs="12" md="8">
              <p style={{ color: 'black', paddingTop: 10, paddingLeft:15, paddingRight:15, height: '100%', borderWidth: 1, borderStyle: 'solid', borderRadius: 5, borderColor: '#D4D4D4',}}>
                {this.state.shareLink}
              </p>         
            </Col>
            <Col xs="12" md="4">
              <CopyToClipboard text={this.state.shareLink}
                onCopy={() => this.onCopyLink()}>
                <Button disabled={this.state.copied ? true : false} outline block style={{fontSize: 18, height: 50}} color="primary">{this.state.copied ? "Copied" : "Copy"}</Button>
              </CopyToClipboard>
            </Col>
           
          </Row>
        </div>
        </CardBody>
      </Card>
    )
  }

  render() {
    return (
      <div>
      <img style={{ objectFit:'cover', width: '100%', height: 500 }} src={img.corporate_lunch2} alt=""></img>
        <Row style={{marginTop: -450}}>
          <Col xs="12">
            <div style={{textAlign: 'center', paddingTop: 50}}>
              <b style={{ fontSize: 35, letterSpacing: 1.5, color: "white", fontWeight: '700'}}>
                Share your love of lunch
              </b> 
            </div>
          </Col>
          <Col xs="1" sm="1" md="3" lg="3"></Col>
          <Col xs="10" sm="10" md="6" lg="6">
            {this.renderInvite()}
          </Col>
          <Col xs="1" sm="1" md="3" lg="3"></Col>
        </Row>
        
      </div>
    );
  }
}

export default FreeRewards;
