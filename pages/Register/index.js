import React, { Component } from 'react';
import  Link  from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import { Button, Card, CardBody, CardFooter, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Layout from '../../components/Layout';
import Router from 'next/router'

class Register extends Component {


  constructor(props) {
    super(props);
  }

  signIn(e) {
    e.preventDefault()
    Router.push({
      pathname: '/login'
    })
  }

  render() {
    return (
      <Layout title={'Register FoodieBee - Catering Service'}>
        <div style={{backgroundColor: 'white'}}>
          <NavBar signIn={e=>this.signIn(e)}/>
          <div className="app justify-content-center align-items-center">
          <Container>
            <Row style={{flex: 1, display: 'flex'}} className="justify-content-center">
              <Col md="9" lg="7" xl="6">
                <Card  style={{boxShadow: '1px 1px 3px #9E9E9E'}} className="p-4">
                  <CardBody className="p-4">
                    <Form>
                      <h2>Register</h2>
                      <p className="text-muted">Create your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <a style={{color: 'gray', marginLeft: 2.5, marginRight: 2.5}} className="fa fa-user"></a>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="First Name" autoComplete="firstname" />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <a style={{color: 'gray', marginLeft: 2.5, marginRight: 2.5}} className="fa fa-user"></a>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Last Name" autoComplete="lastname" />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>@</InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Email" autoComplete="email" />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <a style={{color: 'gray', marginLeft: 2.5, marginRight: 2.5}} className="fa fa-lock"></a>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="new-password" />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <a style={{color: 'gray', marginLeft: 2.5, marginRight: 2.5}} className="fa fa-lock"></a>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Repeat password" autoComplete="new-password" />
                      </InputGroup>
                      <Button style={{paddingTop:10, paddingBottom: 10}} color="success" block>Create Account</Button>
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

export default Register;
