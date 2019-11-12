import React from 'react';
import { Button, Row, Col, Card, CardBody, Table} from 'reactstrap';
import './styles.css'
import PropTypes from 'prop-types';
import Link from 'next/link';
import img from "../../assets/img"

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Caterer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section style={{backgroundColor: 'white'}} id="Caterer" className="white">
        <div className="container">
          <Row style={{marginTop: 40}}>
            <Col style={{marginTop: 50}} xs="12" md="6" > 
              <h2 style={{fontSize: 34}}>Restaurant? Be a partner</h2>
              <p style={{marginTop: 30, fontSize: 16}}>Join our community of great restaurants serving thousands of hungry employees during lunch time.</p>

              <Link href="/caterersignup">
                <div className="text-start"> 
                  <Button style={{fontSize: 18, height: 50, marginTop: 10, marginBottom: 30,}} className="bg-primary" size="lg" color="primary">Learn More</Button>
                </div>
              </Link>
    
            </Col>

            <Col xs="12" md="6" >
              <div style={{width: '100%', height: 280, position: 'relative', overflow: 'hidden', borderRadius: '5%'}}>
                <img style={{ objectFit:'cover', width: '100%', height: '100%', }} src={img.restaurant_owner} alt=""/>
              </div>
            </Col>

            <div style={{height: 1, marginTop:70, opacity: 0.2, backgroundColor: 'gray', borderWidth: 1}} className="col l1"></div>

          </Row>


        </div>
      </section>
    );
  }
};


Caterer.propTypes = propTypes;
Caterer.defaultProps = defaultProps;

export default Caterer;
