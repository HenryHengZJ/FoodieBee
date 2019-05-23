import React from "react";
import {
  Button,
  Row,
  Col,
  FormGroup,
  FormFeedback,
  Form,
  Label,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Card,
  CardBody
} from "reactstrap";

class Banner extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section
        id="hero"
        style={{
          height: 600,
          marginTop: -70,
          backgroundImage:
            "url(https://s3-eu-west-1.amazonaws.com/foodiebeegeneralphoto/admin_login_wallpaper.jpg)",
          backgroundSize: "cover"
        }}
      >
        <Row className="justify-content-center" style={{ display: "flex" }}>
          <Col
            style={{
              textAlign: "center",
              marginTop: 200,
              color: "white"
            }}
            xs="12"
          >
            <h2 style={{ fontSize: 40 }}>About FoodieBee</h2>
          </Col>
        </Row>
      </section>
    );
  }
}

export default Banner;
