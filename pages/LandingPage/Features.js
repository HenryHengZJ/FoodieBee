import React from 'react';
import { Button, Col, Row, Container} from 'reactstrap';
import './styles.css'
import PropTypes from 'prop-types';
import img from "../../assets/img"

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Features extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
    }
  }

  showPlaceDetails(address) {
    this.setState({ address });
  }

  render() {
    return (
      <section style={{backgroundColor: 'white',}} id="features" className="white">
        <Container>
          <Row style={{marginTop: 20, flex: 1, display: 'flex', marginBottom: 20}} className="justify-content-center">

            <Col xs="12" style={{textAlign: 'center'}}>
              <h2 style={{textAlign: 'center', fontSize: 34, paddingLeft:10, paddingRight: 10}}>How It Works</h2>
            </Col>

            <Col style={{marginTop:50}}xs="12"></Col>
         
            <Col xs="6" md="3" style={{marginTop: 10, textAlign: 'center'}}>
              <img style={{ objectFit:'cover', width: 80, height: 80 }} src={img.menu} alt="" />
              <h6 style={{fontWeight: '600', fontSize: 18, marginTop: 20}} >Fresh Menu</h6>
              <p style={{marginTop: 10}} >Fresh lunch menus curated everyday from different restaurants.</p>
            </Col>
            <Col xs="6" md="3" style={{marginTop: 10, textAlign: 'center'}}>
              <img style={{ objectFit:'cover', width: 80, height: 80 }} src={img.placeorder} alt="" />
              <h6 style={{fontWeight: '600', fontSize: 18, marginTop: 20}}>Pre Order</h6>
              <p style={{marginTop: 10}} >Pre-order from 5pm the day before until 10.30am on the actual day.</p>
            </Col>
            <Col xs="6" md="3" style={{marginTop: 10, textAlign: 'center'}}>
              <img style={{ objectFit:'cover', width: 80, height: 80 }} src={img.queue} alt="" />
              <h6 style={{fontWeight: '600', fontSize: 18, marginTop: 20}}>Skip Queue</h6>
              <p style={{marginTop: 10}} >Skip the long queue and pick up directly from the store.</p>
            </Col>
            <Col xs="6" md="3" style={{marginTop: 10, textAlign: 'center'}}>
              <img style={{ objectFit:'cover', width: 80, height: 80 }} src={img.eat1} alt="" />
              <h6 style={{fontWeight: '600', fontSize: 18, marginTop: 20}}>Enjoy, Eat, Repeat</h6>
              <p style={{marginTop: 10}} >Enjoy best food from restaurants everyday at a fraction of the price.</p>
            </Col>
         
            <div style={{textAlign: 'center', marginTop: 20 }} className="center-align">
              <Button onClick={e => this.props.findFoodNow(e)} style={{ fontSize: 20, marginTop: 30, paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20}} className="bg-primary" size="lg" color="primary">Get Lunch Now</Button>
            </div>
              
          </Row>
        </Container>
      </section>
    );
  }
};

Features.propTypes = propTypes;
Features.defaultProps = defaultProps;

export default Features;
