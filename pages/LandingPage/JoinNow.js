import React from "react";
import img from "../../assets/img"
import { Container, Popover, PopoverBody, PopoverHeader ,Button, Row, Col, InputGroup, InputGroupAddon, FormGroup, Form, Label, Input, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import "./styles.css";
import Router from 'next/router'
import Select from "react-select";
import axios from "axios";
import apis from "../../apis";

const customStyles = {
    control: (base, state) => ({
      ...base,
      fontSize: 16,
      border: state.isFocused ? 0 : 0,
      boxShadow: state.isFocused ? 0 : 0,
      cursor: "text",
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderWidth: 1,
      borderColor: "transparent",
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 5,
      paddingBottom: 5,
      width: "100%",
      color: "black"
    }),
  
    option: (styles, { isFocused }) => {
      return {
        ...styles,
        cursor: "pointer",
        backgroundColor: isFocused ? "#20a8d8" : "white",
        color: isFocused ? "white" : "black",
        lineHeight: 2,
        fontSize: 16,
      };
    },
  
    input: styles => ({
      ...styles,
      color: "black",
      boxShadow: "none",
      borderRadius: 0,
      borderWidth: 0
    }),
  
    menu: styles => ({
      ...styles,
      marginTop: 0,
      boxShadow: "none",
      borderRadius: 0
    }),
  
    singleValue: styles => ({
      ...styles,
      color: "black"
    })
  };

  
class AboutUs extends React.Component {
    constructor(props) {
      super(props);

      this.toggle = this.toggle.bind(this);

      this.state = {
        address: "",
        searchAddressInvalid: false,
        selectedCompany: null,
        companyList: [],
      }
  
      this.timeout =  0;

    }

    toggle() {
        this.setState({
            searchAddressInvalid: false
        });
    }
    
    getStarted = () => {
        if (this.state.selectedCompany === null)  {
          this.setState({
            searchAddressInvalid: true
          })
        }
        else if (this.state.selectedCompany.value === 0) {
          //Disable Button Function
        }
        else {
          sessionStorage.setItem('selectedCompany', JSON.stringify(this.state.selectedCompany));
          Router.push(`/searchlunch?companyID=${this.state.selectedCompany.value}`, `/searchlunch?companyID=${this.state.selectedCompany.value}`)
        }
    }
    
    handleChange = (selectedCompany) => {
        this.setState({ 
          selectedCompany,
          searchAddressInvalid: false,
        })
        if (selectedCompany.value === 0) {
          Router.push("/addcompany")
        }
    };
    
    doSearch = (searchword) => {
        if(this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          if (searchword !== "") {
            this.getCompany(searchword)
          }
        }, 500);
    };
    
    getCompany = (searchCompany) => {
    
        var addNewCompany = {
          _id: 0,
          companyName: "Add new company: ",
          companyAddress: searchCompany
        }
    
        var url = apis.GETcompany + "?companyName=" + searchCompany
    
        axios.get(url)
        .then((response) => {
          var data = response.data;
          data.push(addNewCompany)
          this.setState({
            companyList: data
          })
        })
        .catch(err => {
          var data = this.state.companyList
          data.push(addNewCompany)
          this.setState({
            companyList: data
          })
        });
    }
  
    render() {

        const searchList = this.state.companyList.map(({ _id, companyName, companyAddress }) => {
            return {
                value: _id,
                label: _id === 0 ? companyName + companyAddress : companyName + " | " + companyAddress
            };
        });
    
        const DropdownIndicator = () => {
        return <div />;
        };

        return (
          <section
            style={{
                paddingTop: 30,
                paddingBottom: 100,
                backgroundSize: 'cover',
                backgroundImage: 'url(' + img.golunch_wallpaper2 + ')'
            }}
            id="Caterer"
            className="white"
            >
            <Container>
                <Row>
                <Col style={{ color:"white", textAlign: "center", marginTop: 50}} xs="12" md="12">
                    <h2 style={{ marginTop: 20, fontSize: 34 }}>Join Now</h2>
                    <p style={{ fontSize: 18, letterSpacing: 2, marginTop: 30, }}>
                    Wait no more and tell us where you work to discover daily lunch from your favourite local restaurants
                    </p>
                </Col>

                <Col xs="12">
                    <Row >
                        <Col style={{padding: 0,}} xs="1" sm="1" md="3" lg="3"/>
                        <Col id="PopoverFooter" style={{padding: 0,}} xs="10" sm="10" md="6" lg="6">
                        <Row>
                            <Col style={{paddingRight: 0,}} xs="9" md="9">
                            <Select
                                value={this.state.selectedCompany}
                                options={searchList}
                                onChange={this.handleChange}
                                onInputChange={this.doSearch}
                                placeholder="ex: Google"
                                openMenuOnClick={false}
                                styles={customStyles}
                                components={{ DropdownIndicator }}
                            />
                            </Col>
                            <Col style={{ paddingLeft: 0 }} xs="3" md="3">
                            <Button
                                onClick={e => this.getStarted()}
                                block
                                style={{
                                height: "100%",
                                fontWeight: "600",
                                fontSize: 14,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                borderTopRightRadius: 5,
                                borderBottomRightRadius: 5,
                                }}
                                className="bg-primary"
                                color="primary"
                            >
                                SEARCH
                            </Button>
                            </Col>
                        </Row>
                        
                        </Col>

                        <Col style={{padding: 0,}} xs="1" sm="1" md="3" lg="3"/>
                    </Row>
                </Col>

                <Popover placement="bottom-start" isOpen={this.state.searchAddressInvalid} target="PopoverFooter" toggle={this.toggle}>
                    <PopoverHeader style={{color: 'red'}}>Invalid Workplace</PopoverHeader>
                    <PopoverBody>Please search for a valid workplace</PopoverBody>
                </Popover>

                </Row>
            </Container>
            </section>
        );
    }
};

export default AboutUs;
