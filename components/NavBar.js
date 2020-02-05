import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, Nav, NavItem, NavLink, NavDropdown, NavbarToggler, Button,
  Dropdown, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Label} from 'reactstrap';
import './styles/navbar.css'
import PropTypes from 'prop-types';
import Router from 'next/router'
import axios from 'axios';
import apis from "../apis";
import Cookies from 'js-cookie';
import {server} from "../config"

class NavBar extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      dropDown: false,
      userName: "",
      goCateringHover: this.props.catering === true ? true : false,
      goLunchHover: this.props.catering === false ? true : false,
      aboutUsHover: false,
      contactUsHover: false,
      signInHover: false,
      catererSignInHover: false,
      userNameHover: false,
    };
  }

  componentDidMount() {

    if (typeof Cookies.get('userName') !== 'undefined') {
      this.setState({
        userName: Cookies.get('userName'),
      })
    }
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  toggleDropDown = () => {
    this.setState({
      dropDown: !this.state.dropDown
    });
  }

  aboutUsClicked = () => {
    Router.push(`/aboutus`)
  }

  caterersignupClicked = () => {
    Router.push(`/caterersignup`)
  }

  contactUsClicked = () => {
    Router.push(`/contactus`)
  }

  toggleHover = (navitem) => {
    this.setState({[navitem]: !this.state[navitem]})
  }


  navItemClicked = (selectedMenu) => {
    if(selectedMenu === "Log Out") {
     
      var headers = {
        'Content-Type': 'application/json',
      }
  
      var url = apis.GETcustomerlogout;
     
      axios.get(url, {withCredentials: true}, {headers: headers})
        .then((response) => {
          if (response.status === 200) {
            Router.push(`/`)
            //window.location.assign(`${server}`);
          }
        })
        .catch((error) => {

        });
      
    }
    else {
      Router.push(`/userprofile/${selectedMenu}`, `/userprofile/${selectedMenu}`)
    }
  };

  render() {
    const {
      theme,
      stickTop,
      catering,
      landingpage,
    } = this.props;

    const backgroundColorVal = theme === 'dark' ? this.state.isOpen ? '#696969' : 'transparent' : '#F5F5F5' ;
    const boxShadowVal = theme === 'dark' ? 'none' : '0px 0px 3px #9E9E9E';
    const lightVal = theme === 'dark' ? false : true;
    const darkVal = theme === 'dark' ? true : false;
    const imgsrc = theme === 'dark' ? '/static/brandlogo_dark.png' : '/static/brandlogo_light.png';
    const colorVal = theme === 'dark' ? 'white' : null;
    const opacityVal = theme === 'dark' ? 1 : this.state.userNameHover ? 0.8 : 0.6;
    const userLoggedInVal = this.state.userName === "" ? false : true
    const cateringVal = catering ? catering : false
    const landingpageVal = landingpage ? landingpage : false
    const stickyVal = stickTop ? "top" : null

    return (
        <Navbar style={{padding: 0, margin: 0, backgroundColor: backgroundColorVal, boxShadow: boxShadowVal}} light={lightVal} dark={darkVal} expand="md" sticky={stickyVal}>
          <NavbarBrand style={{padding: 0, margin: 0,}} href="/">
            <img style={{objectFit: 'cover', height: 50, width: 160, marginLeft: 20, marginTop: 10}} src={imgsrc} alt="FoodieBee Logo"/>
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/caterersignup" style={{ cursor: 'pointer', color: colorVal, fontWeight: '600', fontSize: 15, paddingLeft: 20, paddingRight: 20}}>For Restaurants</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/contactus" style={{ cursor: 'pointer', color: colorVal, fontWeight: '600', fontSize: 15, paddingLeft: 20, paddingRight: 20}}>Contact</NavLink>
              </NavItem>

              {userLoggedInVal ?
              <NavItem onMouseEnter={()=> this.toggleHover("userNameHover")} onMouseLeave={()=> this.toggleHover("userNameHover")}>
                <UncontrolledDropdown isOpen={this.state.dropDown}  toggle={() => this.toggleDropDown()}>
                  <DropdownToggle
                    style={{
                      color: colorVal,
                      borderWidth: 0,
                      marginRight:10,
                      backgroundColor: "transparent",
                      opacity: opacityVal
                    }}
                    caret
                  >
                  <Label style={{ paddingLeft: this.state.isOpen ? 8 : 0, fontWeight: '500', cursor: 'pointer', paddingRight: 5, paddingTop:2, fontSize: 15, color: colorVal, margin : 0, }}>{this.state.userName}</Label> 
                  </DropdownToggle>
                  <DropdownMenu right style={{ right: 0, left: 'auto' }}>
                    <DropdownItem href="/userprofile/Account Info" onClick={() => this.navItemClicked("Account Info")}>Account Info</DropdownItem>
                    <DropdownItem href="/userprofile/Go Prime" onClick={() => this.navItemClicked("Go Prime")}>Go Prime</DropdownItem>
                    <DropdownItem href="/userprofile/Free Rewards" onClick={() => this.navItemClicked("Free Rewards")}>Free Rewards</DropdownItem>
                    <DropdownItem href="/userprofile/Orders" onClick={() => this.navItemClicked("Orders")}>Orders</DropdownItem>
                    <DropdownItem href="/userprofile/Payment Methods" onClick={() => this.navItemClicked("Payment Methods")}>Payment Methods</DropdownItem>
                    <DropdownItem href="/userprofile/Company Address" onClick={() => this.navItemClicked("Company Address")}>Company Address</DropdownItem>
                    <DropdownItem href="/userprofile/Reviews" onClick={() => this.navItemClicked("Reviews")}>Reviews</DropdownItem>
                    <DropdownItem onClick={() => this.navItemClicked("Log Out")}>Log Out</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </NavItem>
              : 
              <NavItem>
                <NavLink href="/login" onClick={e => this.props.signIn(e)} style={{ cursor: 'pointer', color: this.state.signInHover ? "#20a8d8" : colorVal, fontWeight: '600', fontSize: 15, paddingLeft: 20, paddingRight: 20}}>Sign In</NavLink>
              </NavItem>
              }

            </Nav>
          </Collapse>
        </Navbar>
    );
  }
};

NavBar.propTypes = {
  theme: PropTypes.string,
  stickTop: PropTypes.bool,
  catering: PropTypes.bool,
  landingpage: PropTypes.bool,
};

export default NavBar;
