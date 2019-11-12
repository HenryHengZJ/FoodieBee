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
import Layout from '../../components/Layout';
import './SearchLunch.css'
import axios from "axios";
import apis from "../../apis";
import Router, { withRouter } from 'next/router'
import NextSeo from 'next-seo';
import { server } from '../../config';
import SearchLunchChild from './SearchLunchChild';
import getConfig from 'next/config'

const {publicRuntimeConfig} = getConfig()
const {STIRPE_CLIENT_KEY} = publicRuntimeConfig


class SearchLunch extends Component {

  static async getInitialProps({query: { companyID }}) {

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
    this.getCompanyName(this.props.companyID)
  }

  constructor(props) {
    super(props);

    this.state = {
      stripe: null,
      companyName: "",
    }
  }


  componentDidMount() {
    if (window.Stripe) {
      this.setState({stripe: window.Stripe(STIRPE_CLIENT_KEY)});
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(STIRPE_CLIENT_KEY)});
      });
    }
  }

  getCompanyName = (companyID) => {

    var url = apis.GETcompany + "?companyID=" + companyID 

    axios.get(url)
    .then((response) => {
      var data = response.data;
      if (data.length> 0) {
        this.setState({
          companyName: "-" + data[0].companyName
        })
      }
    })
    .catch(err => {
     
    });

  };

  render() {

    return (
      <Layout title={'FoodieBee GoLunch ' + this.state.companyName}>
      <NextSeo config={{ title: "FoodieBee GoLunch " + this.state.companyName }}/>
      <StripeProvider stripe={this.state.stripe}>
      <Elements>
        <SearchLunchChild
          dailyMenu = {this.props.dailyMenu}
          loading = {this.props.dailyMenu}
          empty = {this.props.dailyMenu}
          companyID = {this.props.companyID}
          locationquerystring = {this.props.locationquerystring}
          companyNameChanged={(companyID) => this.getCompanyName(companyID)}
        />
      </Elements>
      </StripeProvider>
      </Layout>
    );
  }
}

export default withRouter(SearchLunch);
