import React, { Component } from 'react';
import  Link  from 'next/link';
import Head from 'next/head';
import { FormFeedback, Label, Button, Card, CardBody, CardFooter, Col, Container, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Layout from '../../components/Layout';
import Router from 'next/router'
import axios from "axios";
import apis from "../../apis";
import {server} from "../../config"
import NextSeo from 'next-seo';
import Cookies from 'js-cookie';
import AutoCompleteAddress from '../../components/AutoCompleteAddress'
import Geocode from "react-geocode";
import GoogleMapReact from 'google-map-react';
import img from "../../assets/img"

const GOOGLE_API_KEY = "AIzaSyCFHrZBb72wmg5LTiMjUgI_CLhsoMLmlBk";

class AddCompany extends Component {

  static async getInitialProps({query: { returnurl }}) {
    console.log('returnurl = ' + returnurl)
    return {
      returnurl: returnurl,
    };
  }

  componentWillMount() {
    this.setState({
      returnurl: this.props.returnurl,
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      returnurl: "",
      companyName: "",
      isCompanyNameEmpty: false,
      center: {
        lat: 53.3498091,
        lng: -6.2621753
      },
      companyFullAddress: "",
      companyAddress: "",
      companyCity: "",
      companyCounty: "",
      companyCountry: "",
      isCompanyAddressEmpty: false,
      isAddressButtonActive: false,
      userName: "",
    };

    this.handleCompanyName = this.handleCompanyName.bind(this);
    this.marker = null;
   
  }

  componentDidMount() {
    if (typeof Cookies.get('userName') !== 'undefined') {
      this.setState({
        userName: Cookies.get('userName'),
      })
    }
    Geocode.setApiKey(GOOGLE_API_KEY);
  }

  signIn(e) {
    e.preventDefault()
    Router.push({
      pathname: '/login'
    })
  }

  handleCompanyName(e) {
    this.setState(
      {
        companyName: e.target.value,
      },
    );
  }

  checkInput = () => {
    const {
      companyName,
      companyFullAddress,
    } = this.state;

    if (companyName === "") {
      this.setState({ isCompanyNameEmpty: true });
    }
    else  if (companyFullAddress === "") {
      this.setState({ isCompanyAddressEmpty: true });
    }
    else {
      this.onUpdate()
    }
  }

  onUpdate = () => {
    
    const {center, companyName, companyAddress, companyFullAddress, companyCity, companyCountry, companyCounty} = this.state

    var data = {
      location: {
        type: "Point",
        coordinates: [center.lat, center.lng]
      },
      companyName: companyName,
      companyAddress: companyAddress,
      companyFullAddress: companyFullAddress,
      companyCity: companyCity,
      companyCountry: companyCountry,
      companyCounty: companyCounty,
    }

    if (this.state.userName === "") {
      //New User
      sessionStorage.setItem("customerCompany", JSON.stringify(data));
      Router.push({
        pathname: '/register'
      })
    }
    else {
      //User Logged In
      var headers = {
        'Content-Type': 'application/json',
      }
  
      var url = apis.POSTcompany;
  
      axios.post(url, data, {withCredentials: true}, {headers: headers})
        .then((response) => {
          if (response.status === 200) {
            this.updateCustomerCompany(response.data._id)
          } 
        })
        .catch((error) => {
        });
    }
  }

  updateCustomerCompany = (_id) => {
    var headers = {
      'Content-Type': 'application/json',
    }

    var body = {
      customerCompanyID: _id,
    }

    var url = apis.UPDATEcustomerprofile;

    axios.put(url, body, {withCredentials: true}, {headers: headers})
      .then((response) => {
        if (response.status === 201) {
          if (typeof this.state.returnurl === 'undefined') {
            window.location.assign(`${server}/`);
          }
          else if (this.state.returnurl.includes("searchlunch") ) {
            var datesubstr = this.state.returnurl.substring(this.state.returnurl.lastIndexOf("=") + 1, this.state.returnurl.length)
            window.location.assign(`${server}/searchlunch?companyID=${_id}&date=${datesubstr}`);
          }
          else {
            window.location.assign(`${server}${this.state.returnurl}`);
          }
        } 
      })
      .catch((error) => {
      }); 
  }

  showPlaceDetails(address) {
    var lat = Number(address.geometry.location.lat())
    var lng = Number(address.geometry.location.lng())
    
    Geocode.fromLatLng(lat, lng).then(
      response => {

        //Get rid of postal code
        for(var i = 0 ; i < response.results[0].address_components.length ; i++){
          if (response.results[0].address_components[i].types[0] === "postal_code") {
            response.results[0].address_components.splice(i, 1)
          }
        }

        var address_components = response.results[0].address_components
 
        var companyAddress = ""
        for(var i = address_components.length - 4 ; i >= 0; i--){
          companyAddress = address_components[i].long_name + ( i === address_components.length - 4 ? "" : ", " ) + companyAddress 
        }
        
        this.setState({
          center: {
            lat: lat,
            lng: lng,
          },
          companyFullAddress: response.results[0].formatted_address,
          companyAddress: companyAddress,
          companyCity: address_components[address_components.length - 3].long_name,
          companyCounty: address_components[address_components.length - 2].long_name,
          companyCountry: address_components[address_components.length - 1].long_name,
        })
      },
      error => {
        console.log(error);
      }
    );
  }

  onInputChanged(value) {
    this.setState({
      companyFullAddress: value
    })
  }

  onMapChange = ({center}) => {
   
    var lat = center.lat;
    var lng = center.lng;

    Geocode.fromLatLng(lat, lng).then(
      response => {

        //Get rid of postal code
        for(var i = 0 ; i < response.results[0].address_components.length ; i++){
          if (response.results[0].address_components[i].types[0] === "postal_code") {
            response.results[0].address_components.splice(i, 1)
          }
        }

        var address_components = response.results[0].address_components

        var companyAddress = ""
        for(var i = address_components.length - 4 ; i >= 0; i--){
          companyAddress = address_components[i].long_name + ( i === address_components.length - 4 ? "" : ", " ) + companyAddress 
        }
        
        this.setState({
          center: {
            lat: lat,
            lng: lng,
          },
          companyFullAddress: response.results[0].formatted_address,
          companyAddress: companyAddress,
          companyCity: address_components[address_components.length - 3].long_name,
          companyCounty: address_components[address_components.length - 2].long_name,
          companyCountry: address_components[address_components.length - 1].long_name,
        })
      },
      error => {
        console.log(error);
      }
    );
  };

  render() {
    return (
      <Layout title={'Add Company'}>
        <NextSeo
          config={{
            title: 'Add Company | FoodieBee',
          }}
        />
        <div style={{backgroundColor: 'white'}}>
          <NavBar signIn={e=>this.signIn(e)}/>
          <div className="app justify-content-center align-items-center">
          <Container>
            <Row style={{flex: 1, display: 'flex', marginTop: 20}} className="justify-content-center">
              <Col md="9" lg="7" xl="6">
                <Card  style={{boxShadow: '1px 1px 3px #9E9E9E'}} className="p-4">
                  <CardBody className="p-4">
                    <Form>
                      <h2>Add New Company</h2>
                      <FormGroup style={{ marginTop: 30 }}>
                        <h6>Company Name</h6>
                        <Input
                          style={{ color: "black" }}
                          value={this.state.companyName}
                          onChange={e => this.handleCompanyName(e)}
                          type="text"
                          placeholder="Company Name"
                          autoComplete="companyname"
                          invalid={this.state.isCompanyNameEmpty ? true : false}
                        />
                        <FormFeedback className="help-block">
                          Please enter company name
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup style={{ marginTop: 20 }}>
                        <h6>Company Address</h6>
                        <span style={{fontWeight: '600', fontSize: 13, opacity: 0.7}}>Drag the map to pin your restaurant's location.</span>
                        <Col style={{marginTop:10, paddingLeft: 0, paddingRight: 0}} xs="12">
                          <InputGroup >
                            <AutoCompleteAddress 
                              borderTopRightRadius={0}
                              borderBottomRightRadius = {0}
                              borderTopLeftRadius={5}
                              borderBottomLeftRadius={5}
                              borderColor = 'rgba(211,211,211,0.3)'
                              paddingLeft = {20}
                              paddingRight = {20}
                              paddingTop = {10}
                              paddingBottom = {10}
                              fontSize = {14}
                              color = 'black'
                              placeholder = "Enter business address"
                              onInputChanged={this.onInputChanged.bind(this)}
                              value={this.state.companyFullAddress}
                              onPlaceChanged={this.showPlaceDetails.bind(this)} />    
                          </InputGroup>
                          {this.state.isCompanyAddressEmpty ? 
                          <Label style={{fontSize: 11, color: 'red', opacity: 0.8}}>
                            Please enter company name
                          </Label> : null }
                        </Col>
                      </FormGroup>
                      <div style={{ marginTop:25, height: '60vh', width: '100%' }}>
                        <GoogleMapReact
                          bootstrapURLKeys={{ key: [GOOGLE_API_KEY] }}
                          center={this.state.center}
                          zoom={14}
                          onChange={this.onMapChange}
                        >
                        </GoogleMapReact>
                        <div style={{position: 'absolute',top: '60%', left: '50%', zIndex: 1, height: 30, width: 30 }}>
                          <img style={{ objectFit:'cover', width: 30, height: 30 }} src={img.mapmarker} />
                        </div>

                      </div>
                      <Button
                        style={{
                          paddingTop: 10,
                          paddingBottom: 10,
                          marginTop: 20,
                          color: "white"
                        }}
                        color="success"
                        block
                        onClick={() => this.checkInput()}
                      >
                        {this.state.userName === "" ? "Next" : "Save Changes"}
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
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

export default AddCompany;
