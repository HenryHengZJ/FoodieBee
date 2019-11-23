import React, { Component } from "react";
import  Link  from "next/link";
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
import Account from './Account'
import GoPrime from './GoPrime'
import Address from './Address'
import Order from './Order'
import Review from './Review'
import Payment from './Payment'
import FreeRewards from './FreeRewards'
import moment from "moment";
import { format, addDays, subDays } from 'date-fns';
import Router from 'next/router'
import {server} from "../../config"
import axios from "axios";
import apis from "../../apis";
import { StripeProvider, Elements } from 'react-stripe-elements'
import "./styles.css"
import 'react-toastify/dist/ReactToastify.css';
import getConfig from 'next/config'
import NextSeo from 'next-seo';

const {publicRuntimeConfig} = getConfig()
const {STIRPE_CLIENT_KEY} = publicRuntimeConfig

class UserProfile extends Component {

  static async getInitialProps({query: { userprofilepage, currentDate, previousDate }}) {

    console.log('userprofilepage = ' + userprofilepage)
    var activemenu;
    if (typeof userprofilepage !== 'undefined') {
      activemenu = userprofilepage
    }
    else {
      activemenu = "Account Info"
    }
    return {
      selectedMenu: activemenu,
    };
  }

  componentWillMount() {
    this.setState({
      selectedMenu: this.props.selectedMenu,
      orderdata: this.props.orderdata,
      finalOrderSelectionDateString: this.props.finalOrderSelectionDateString
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedMenu: "",
      isMobile: false,
      menuDropDownOpen: false,
      menutitle: [
        "Account Info",
        "Go Prime",
        'Free Rewards',
        "Orders",
        "Payment Methods",
        "Company Address",
        "Reviews",
      ], 
      orderdata: null,
      stripe: null,
      finalOrderSelectionDateString: null,
    };
  }

  componentDidMount() {

      if (window.innerWidth < 800) {
        this.setState({
          isMobile: true
        });
      }
  
      window.addEventListener(
        "resize",
        () => {
          this.setState({
            isMobile: window.innerWidth < 800
          });
        },
        false
      );

      if (window.Stripe) {
        this.setState({stripe: window.Stripe(STIRPE_CLIENT_KEY)});
      } else {
        document.querySelector('#stripe-js').addEventListener('load', () => {
          // Create Stripe instance once Stripe.js loads
          this.setState({stripe: window.Stripe(STIRPE_CLIENT_KEY)});
        });
      }

    }


  ////////////////////////////////////////////////Other functions/////////////////////////////////////////////////////

  navItemClicked = (selectedMenu) => {
    var url = `/userprofile/${selectedMenu}`;
    Router.replace(url)
    /*this.setState({
      selectedMenu: selectedMenu,
    });*/
  };

  toggleDropDown = () => {
    this.setState({
      menuDropDownOpen: !this.state.menuDropDownOpen,
    });
  }

  ////////////////////////////////////////////////Render////////////////////////////////////////////////////////
  
  renderNavItem(menutitle) {
    return (
      <NavItem>
        <NavLink
          onClick={() => this.navItemClicked(menutitle)}
          style={{
            cursor: 'pointer',
            paddingRight: 20,
            paddingLeft: menutitle === "Account Info" ? 0 : 20,
            fontWeight: "600",
            color: this.state.selectedMenu === menutitle ? "#20a8d8" : "black",
            fontSize: 15
          }}
        >
          {menutitle}
        </NavLink>
        <div
          style={{
            height: 2,
            width: "100%",
            backgroundColor:
              this.state.selectedMenu === menutitle ? "#20a8d8" : "transparent"
          }}
        />
      </NavItem>
    );
  }

  renderAccountInfo() {
    return (
      <Account/>
    )
  }

  renderWorkAddress() {
    return (
      <Address/>
    )
  }

  renderGoPrime() {
    return (
      <StripeProvider stripe={this.state.stripe}>
        <Elements>
          <GoPrime/>
        </Elements>
      </StripeProvider>
    )
  }

  renderPaymentMethods() {
    return (
      <StripeProvider stripe={this.state.stripe}>
        <Elements>
          <Payment/>
        </Elements>
      </StripeProvider>
    )
  }

  renderOrderTable() {
    return (
      <Order/>
    );
  }

  renderReviewTable() {
    return (
      <Review/>
    );
  }

  renderFreeRewards() {
    return (
      <FreeRewards/>
    )
  }

  ////////////////////////////////////////////////Render Modal////////////////////////////////////////////////////////

  
  renderSmallScreenNavBar() {
    return (
      <Col style={{ paddingLeft: 40, paddingRight: 40, marginTop: 30, marginBottom: 20 }} xs="12" md="12">
        <UncontrolledDropdown isOpen={this.state.menuDropDownOpen}  toggle={() => this.toggleDropDown()}>
          <DropdownToggle
            style={{
              height: 40,
              width: '100%',
              color: "rgba(0,0,0, 0.5)",
              borderColor: "rgba(211,211,211, 0.8)",
              backgroundColor: "white",
            }}
            caret
          >
          <Label style={{ cursor: 'pointer', fontSize: 15, fontWeight: '600', paddingLeft:5, textAlign:'start', color: '#20a8d8', height:12, width: '98%'}}>{this.state.selectedMenu}</Label> 
          </DropdownToggle>
          <DropdownMenu style={{width: '100%'}}>
            <DropdownItem onClick={() => this.navItemClicked("Account Info")}>Account Info</DropdownItem>
            <DropdownItem onClick={() => this.navItemClicked("Go Prime")}>Go Prime</DropdownItem>
            <DropdownItem onClick={() => this.navItemClicked("Free Rewards")}>Free Rewards</DropdownItem>
            <DropdownItem onClick={() => this.navItemClicked("Orders")}>Orders</DropdownItem>
            <DropdownItem onClick={() => this.navItemClicked("Payment Methods")}>Payment Methods</DropdownItem>
            <DropdownItem onClick={() => this.navItemClicked("Delivery Addresses")}>Delivery Addresses</DropdownItem>
            <DropdownItem onClick={() => this.navItemClicked("Reviews")}>Reviews</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>      
      </Col>
    )
  }

  render() {

    return (
     
      <Layout title={"FoodieBee - " + this.state.selectedMenu}>

      <NextSeo
        config={{
          title: "FoodieBee - " + this.state.selectedMenu,
        }}
      />
    
      <div style={{backgroundColor: 'white'}}>
         <NavBar signInHide={true}/>
      <div className="app align-items-center">

          <Container>
            <Row
              style={{ marginTop: 20, marginBottom: 50 }}
              className="justify-content-center"
            >
             
              {!this.state.isMobile ? <Col style={{ paddingLeft: 40, paddingRight: 40, marginTop: 30, marginBottom: 20 }} xs="12" md="12">
                <Nav className="float-left" pills>
                  {this.renderNavItem(this.state.menutitle[0])}
                  {this.renderNavItem(this.state.menutitle[1])}
                  {this.renderNavItem(this.state.menutitle[2])}
                  {this.renderNavItem(this.state.menutitle[3])}
                  {this.renderNavItem(this.state.menutitle[4])}
                  {this.renderNavItem(this.state.menutitle[5])}
                  {this.renderNavItem(this.state.menutitle[6])}
                </Nav>
              </Col> : null}

              {this.state.isMobile ? this.renderSmallScreenNavBar() : null}

              <Col style={{ marginTop: 20 }} xs="12" sm="12" md="12" lg="12">
                {this.state.selectedMenu === "Account Info" ? this.renderAccountInfo() :
                this.state.selectedMenu === "Go Prime" ? this.renderGoPrime() :
                this.state.selectedMenu === "Free Rewards" ? this.renderFreeRewards() :
                this.state.selectedMenu === "Orders" ? this.renderOrderTable() :
                this.state.selectedMenu === "Payment Methods" ? this.renderPaymentMethods() :
                this.state.selectedMenu === "Company Address" ? this.renderWorkAddress() :
                this.state.selectedMenu === "Reviews" ? this.renderReviewTable() : null}
              </Col>

            </Row>
            
          </Container>
        </div>
        <Footer />
      </div>
    
      </Layout>
    );
  }
}

export default UserProfile;
