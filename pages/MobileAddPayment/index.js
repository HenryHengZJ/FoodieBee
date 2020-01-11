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
import Router, { withRouter } from 'next/router'
import NextSeo from 'next-seo';
import MobileAddPaymentChild from './MobileAddPaymentChild';
import getConfig from 'next/config'
import './MobileAddPayment.css'

const {publicRuntimeConfig} = getConfig()
const {STIRPE_CLIENT_KEY} = publicRuntimeConfig


class MobileAddPayment extends Component {

  static async getInitialProps({query: { customerEmail, customerPaymentAccountID }}) {
    return {
      customerEmail: customerEmail,
      customerPaymentAccountID: customerPaymentAccountID,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      stripe: null,
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

  render() {

    return (
      <Layout title={'FoodieBee Add Payment'}>
      <NextSeo config={{ title: "FoodieBee Add Payment" }}/>
      <StripeProvider stripe={this.state.stripe}>
      <Elements>
        <MobileAddPaymentChild customerEmail={this.props.customerEmail} customerPaymentAccountID={this.props.customerPaymentAccountID}/>
      </Elements>
      </StripeProvider>
      </Layout>
    );
  }
}

export default withRouter(MobileAddPayment);
