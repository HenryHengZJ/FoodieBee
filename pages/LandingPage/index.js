import React, { Component } from 'react';
import NavBar from '../../components/NavBar';
import Hero from './Hero';
import Restaurants from './Restaurants';
import Occasion from './Occasion';
import Features from './Features';
import Caterer from './Caterer';
import Footer from '../../components/Footer'
import Shops from './Shops';
import JoinNow from './JoinNow';
import Testimonial from './Testimonial';
import Router from 'next/router'
import Layout from '../../components/Layout'
import NextSeo from 'next-seo';

class LandingPage extends Component {

  constructor(props) {
    super(props);

    this.refObj = React.createRef();

  }
  
  signIn(e) {
    e.preventDefault()
    Router.push({
      pathname: '/login',
    })
  }

  findFoodNow(e) {
    e.preventDefault()
    this.refObj.current.scrollIntoView({behavior: 'smooth'});
  }

  restaurantClicked(e) {
    e.preventDefault()
    this.refObj.current.scrollIntoView({behavior: 'smooth'});
  }

  registerCatererClicked(e) {
    e.preventDefault()
    Router.push({
      pathname: '/caterersignup'
    })
  }

  showPlaceDetails(address) {
    this.setState({ address, searchAddressInvalid: false });
  }

  render() {
    return (
      <Layout>
        <NextSeo
          config={{
            title: 'FoodieBee',
          }}
        />
        <div id="app">
          <div ref={this.refObj} > </div>
          <NavBar theme={'dark'} catering={false} landingpage={true} signIn={e=>this.signIn(e)}/>
          <Hero/>
          <Features findFoodNow={e=>this.findFoodNow(e)}/>
          <Restaurants restaurantClicked={e=>this.restaurantClicked(e)}/>
          <Caterer/>
          <Shops/>
          <JoinNow/>
          <Footer />
        </div>
      </Layout>
    );
  }
};

export default LandingPage;
