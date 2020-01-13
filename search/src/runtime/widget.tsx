import { React } from "jimu-core";
import { BaseWidget, AllWidgetProps } from "jimu-core";
import { css, jsx } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  ListGroup, 
  ListGroupItem, 
  ListGroupItemHeading, 
  ListGroupItemText,
  Table
} from "reactstrap";

import axios from "axios";

interface State {
  extent: __esri.Extent;
}

const InsurancePlanList = ({children}) => {

  const pStyle = { overflow: 'auto', maxHeight: "500px" };

  return (<ListGroup style={pStyle}>{children}</ListGroup>);
};

const InsurancePlan = (props) => {
  const { 
    name,
    premium,
    premium_w_credit,
    ehb_premium,
    pediatric_ehb_premium,
    aptc_eligible_premium,
    benefits,
    benefits_url,
    brochure_url,
    formulary_url,
    network_url
    } = props.plan;

  return (
    <ListGroupItem className="card border mb-3 rounded px-3 py-3">
      <ListGroupItemHeading><a href={brochure_url}>{name}</a></ListGroupItemHeading>

      <Table>
        <tbody>
          <tr className="mb-2">
            <th>Premium</th>
            <td className="pl-3">${premium}</td>
          </tr>
          <tr className="mb-2">
            <th>Premium With Credit</th>
            <td className="pl-3">${premium_w_credit}</td>
          </tr>
          <tr className="mb-2">
            <th>EHB Premium</th>
            <td className="pl-3">${ehb_premium}</td>
          </tr>
          <tr className="mb-2">
            <th>Pediatric EHB Premium</th>
            <td className="pl-3">${pediatric_ehb_premium}</td>
          </tr>
          <tr className="mb-2">
            <th>APTC Eligible Premium</th>
            <td className="pl-3">${aptc_eligible_premium}</td>
          </tr>
        </tbody>
      </Table>
    </ListGroupItem>)
}

export default class Widget extends BaseWidget<AllWidgetProps<{}>, State> {
  extentWatch: __esri.WatchHandle;
  state: State = {
    extent: null
  };

  constructor(props) {
    super(props);

    this.state = {
      age: "",
      aptcEligible: "",
      gender: "",
      income: "",
      tobacco: "",
      market: "",
      zipCode: "",
      plans: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(evt) {
    debugger;
    this.getDataAxios();
    evt.preventDefault();
  }

  handleInputChange = ({ target: { id, value } }) => {
    this.setState({ [id]: value });
  };

  async getDataAxios() {
    const {
      age,
      aptcEligible,
      gender,
      income,
      market,
      tobacco,
      zipCode
    } = this.state;

    const API_KEY = "xxx";
    const FIPS_URL =
      "https://marketplace.api.healthcare.gov/api/v1/counties/by/zip/";
    const FIPS_RESPONSE = await axios.get(
      `${FIPS_URL}${zipCode}?apikey=${API_KEY}`
    );
    const FIPS_CODE = FIPS_RESPONSE["data"]["counties"][0]["fips"];
    debugger;
    const STATE = FIPS_RESPONSE["data"]["counties"][0]["state"];
    const SEARCH_URL = `https://marketplace.api.healthcare.gov/api/v1/plans/search?apikey=${API_KEY}`;
    const SEARCH_RESPONSE = await axios.post(SEARCH_URL, {
      "household": {
        "income": parseInt(income),
        "people": [
          {
            "age": parseInt(age),
            "aptc_eligible": aptcEligible == "Yes",
            "gender": gender,
            "uses_tobacco": tobacco == "Yes"
          }
        ]
      },
      "market": market,
      "place": {
        "countyfips": FIPS_CODE,
        "state": STATE,
        "zipcode": zipCode
      },
      "year": 2019
    });
    this.setState({plans: SEARCH_RESPONSE.data.plans})
    debugger;
  }

  render() {
    const { plans } = this.state;
    const pStyle = { color: '#2c2c2d !important' };
    
    return (
      <Container style={pStyle}>
        <h1 className="py-3">Search for Health Insurance Plans</h1>
        <Row>
          <Col className="col-4 border-right py-2">
            <Form onSubmit={this.handleSubmit}>
              <FormGroup className="mb-3">
                <Label
                  className="text-uppercase small font-weight-bold"
                  for="zipCode"
                >
                  Zip code
                </Label>
                <Input
                  onChange={this.handleInputChange}
                  value={this.state.zipCode}
                  className="w-100"
                  type="text"
                  name="zipcode"
                  id="zipCode"
                />
              </FormGroup>
              <FormGroup className="mb-3">
                <Label className="text-uppercase small font-weight-bold">
                  Income
                </Label>
                <Input
                  className="w-100"
                  onChange={this.handleInputChange}
                  value={this.state.income}
                  type="text"
                  name="income"
                  id="income"
                />
              </FormGroup>
              <FormGroup className="mb-3">
                <Label className="text-uppercase small font-weight-bold">
                  Age
                </Label>
                <Input
                  className="w-100"
                  onChange={this.handleInputChange}
                  value={this.state.age}
                  type="text"
                  name="age"
                  id="age"
                />
              </FormGroup>
              <FormGroup className="mb-3">
                <Label className="text-uppercase small font-weight-bold">
                  APTC Eligible
                </Label>
                <Input
                  className="w-100"
                  onChange={this.handleInputChange}
                  value={this.state.aptcEligible}
                  type="select"
                  name=""
                  id="aptcEligible"
                >
                  <option></option>
                  <option>Yes</option>
                  <option>No</option>
                </Input>
              </FormGroup>
              <FormGroup className="mb-3">
                <Label className="text-uppercase small font-weight-bold">
                  Gender
                </Label>
                <Input
                  onChange={this.handleInputChange}
                  value={this.state.gender}
                  className="w-100"
                  type="select"
                  name=""
                  id="gender"
                >
                  <option></option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </Input>
              </FormGroup>
              <FormGroup className="mb-3">
                <Label className="text-uppercase small font-weight-bold">
                  Do you use tobacco?
                </Label>
                <Input
                  onChange={this.handleInputChange}
                  value={this.state.tobacco}
                  className="w-100"
                  type="select"
                  name=""
                  id="tobacco"
                >
                  <option></option>
                  <option>Yes</option>
                  <option>No</option>
                </Input>
              </FormGroup>
              <FormGroup className="mb-3">
                <Label className="text-uppercase small font-weight-bold">
                  Market
                </Label>
                <Input
                  onChange={this.handleInputChange}
                  value={this.state.market}
                  className="w-100"
                  type="select"
                  name=""
                  id="market"
                >
                  <option></option>
                  <option>Individual</option>
                </Input>
              </FormGroup>
              <Button>Submit</Button>
            </Form>
          </Col>

          <Col className="col-8">
            <InsurancePlanList>
            {
              plans.map(plan => <InsurancePlan plan={plan}/>)
            }
            </ListGroup>
          </Col>
        </Row>
      </Container>
    );
  }
}
