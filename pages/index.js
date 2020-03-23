
import LandingPage from './LandingPage';
//import 'bootstrap/dist/css/bootstrap.min.css';
//import './styles.scss'
import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import axios from "axios";
import apis from "../apis";
import Router, { withRouter } from 'next/router'
import Cookies from 'js-cookie';
import Lottie from 'react-lottie';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      customerCompanyID: null,
      modalVisible: false,
    }
  }


  componentDidMount() {
    if (typeof Cookies.get('userName') !== 'undefined') {
      this.setState({
        modalVisible: true
      }, () => {
        this.getUserCompanyID()
      })
    }
  }

  getUserCompanyID = () => {

    var headers = {
      'Content-Type': 'application/json',
    }

    var url = apis.GETcustomerprofile;

    axios.get(url, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            customerCompanyID: typeof response.data[0].customerCompanyID !== 'undefined' ? response.data[0].customerCompanyID : "",
            //modalVisible: false,
          }, () => {
            sessionStorage.setItem('selectedCompany', JSON.stringify(this.state.customerCompanyID));
            Router.push(`/searchlunch?companyID=${this.state.customerCompanyID}`, `/searchlunch?companyID=${this.state.customerCompanyID}`)
          })
        } 
      })
      .catch((error) => {
        this.setState({
          modalVisible: false
        })
      });

  };

  renderLoading() {
    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: require('../assets/animation/loading.json'),
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };

    return (
      <Modal   
        style={{backgroundColor: 'rgba(0,0,0,0)'}}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        isOpen={this.state.modalVisible} >
       
            <Lottie 
              options={defaultOptions}
              height={200}
              width={200}
             />
          
        
      </Modal>
    )
  }

  render() {
    return (
     
        <div className="App" style={{backgroundColor: 'white'}}>
          <LandingPage/>
          {this.state.modalVisible ? this.renderLoading() : null}
        </div>  
   
    );
  }
}

export default App;