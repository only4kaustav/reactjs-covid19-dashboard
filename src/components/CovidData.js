import React, {Component} from "react";
import _ from 'lodash';
import Popup from "reactjs-popup";
import { Pie } from 'react-chartjs-2';

export default class CovidData extends Component {
  constructor(){
    super();
    // field_name, field_width, field_lebel, field_sortable, field_have_img, field_have_chart, field_is_date
    this.fieldArr = [
      ['slno', '5', 'SL No.', 0, 0, 0, 0],
      ['country', '15', 'Country', 1, 1, 1, 0],
      ['continent', '8', 'Continent', 1, 0, 1, 0],
      ['updated', '8', 'Last Updated', 1, 0, 0, 1],
      ['tests', '8', 'Total Tests', 1, 0, 0, 0],
      ['cases', '8', 'Total Cases', 1, 0, 0, 0],
      ['critical', '8', 'Critical', 1, 0, 0, 0],
      ['deaths', '8', 'Total Deaths', 1, 0, 0, 0],
      ['recovered', '8', 'Total Recovered', 1, 0, 0, 0],
      ['todayCases', '8', 'Today\'s Cases', 1, 0, 0, 0],
      ['todayDeaths', '8', 'Today\'s Deaths', 1, 0, 0, 0],
      ['todayRecovered', '8', 'Today\'s Recovery', 1, 0, 0, 0]
    ];
    this.state = {
      loading: true,
      countries: null,
      allCountriesData: null,
      continent: null,
      isUpdating: false,
      sort: {
        column: 'country',
        direction: 'asc',
      },
      search: '',
      locationData: [],
      chartType: 'Pie',
      chartData:{},
    };
  }

  componentDidMount = async ()  => {
    this.fetchData();
    setInterval(this.fetchData.bind(this), 60000);
  }

  fetchData = async ()  => {
    const url = "https://corona.lmao.ninja/v2/countries";
    this.setState({ isUpdating: true });
    const response = await fetch(url);
    const data = await response.json();
    this.setState({
      allCountriesData: _.orderBy(data, [this.state.sort.column], [this.state.sort.direction]),
      loading: false,
      isUpdating: false,
    }, () => {
      this.dataMatch();
    })
  }

  formatDate = (datestring) => {
    let dateTime = new Date(datestring);
    // year as 4 digits (YYYY)
    var year = dateTime.getFullYear();

    // month as 2 digits (MM)
    var month = ("0" + (dateTime.getMonth() + 1)).slice(-2);

    // date as 2 digits (DD)
    var date = ("0" + dateTime.getDate()).slice(-2);

    // hours as 2 digits (hh)
    var hours = ("0" + dateTime.getHours()).slice(-2);

    // minutes as 2 digits (mm)
    var minutes = ("0" + dateTime.getMinutes()).slice(-2);

    // seconds as 2 digits (ss)
    var seconds = ("0" + dateTime.getSeconds()).slice(-2);
    return date + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  }

  dataSortBy = (key) => {
    let direction = 'asc';
    if (key === this.state.sort.column) {
      direction = this.state.sort.direction === 'asc' ? 'desc' : 'asc';
    }
    this.setState({
      countries: _.orderBy(this.state.countries, [key, 'country'], [direction, 'asc']),
      sort: {
        column: key,
        direction: direction,
      }
    });
  }

  findData = (e) => {
    this.setState({
      search: e.target.value,
    }, () => {
      this.dataMatch()
    })
  }

  dataMatch = () => {
    this.setState({
      countries: _.filter(this.state.allCountriesData, function(cdata) {
        let allfields;
        this.fieldArr.forEach((field) => {
          if (field[3]) {
            let data = (field[6]) ? this.formatDate(cdata[field[0]]) : cdata[field[0]];
            allfields = allfields  + '||' + data;
          }
        })
        return allfields.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
      }.bind(this))
    });
  }

  setLocationData = (location, type) => {
    let locationObj = {};
    let locationDataObj = _.filter(this.state.allCountriesData, [type, location]);
    locationDataObj.forEach(function(loc) {
      locationObj = {
        cases: (locationObj['cases'] ? locationObj['cases'] : 0) + loc.cases,
        active: (locationObj['active'] ? locationObj['active'] : 0) + loc.active,
        recovered: (locationObj['recovered'] ? locationObj['recovered'] : 0) + loc.recovered,
        deaths: (locationObj['deaths'] ? locationObj['deaths'] : 0) + loc.deaths,
      }
    })
    return locationObj;
  }

  setChart = (e) => {
    this.setState({
      chartType: e.target.value,
    })
  }

  getChartData = (location, type) => {
    this.setState({
      locationData: this.setLocationData(location, type),
    }, () => {
      this.setState({
        chartData: {
          labels: ['Active', 'Recovered', 'Deaths'],
          datasets:[
            {
              label: 'Active Vs Recovered Vs Deaths',
              data: [
                (this.state.locationData['active']/this.state.locationData['cases'] * 100).toFixed(2),
                (this.state.locationData['recovered']/this.state.locationData['cases'] * 100).toFixed(2),
                (this.state.locationData['deaths']/this.state.locationData['cases'] * 100).toFixed(2),
              ],
              backgroundColor: [
                'rgba(255, 206, 86, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
              ]
            }
          ]
        }
      })
    });
  }

  render() {
    if (this.state.loading) {
      return <div><div className="loader"></div><h3>Loading.....</h3></div>;
    }

    if (!this.state.countries) {
      return <div>didn't get data</div>;
    }

    const Modal = ({ location, close, flag }) => (
      <div className="modal">
        <span className="close" onClick={close}>&times;</span>
        <div className="header">Statistics of {location} {flag ? <img src={flag} width="32" alt={location} valign="middle"/> : ''}</div>
        <div className="content">
          <Pie
            data = {this.state.chartData}
            options = {{
              responsive: true,
              maintainAspectRatio: true,
              tooltips: {
                callbacks: {
                  label: function(tooltipItem, data) {
                    return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );

    let countries = this.state.countries;

    return (
      <div>
        <div className="filter"><span>Search: </span><input type="text" placeholder="Enter any term to be searched" onChange={(e)=>this.findData(e)} /><div>{this.state.isUpdating ? <big className="loading">Updating Data</big> : null }</div></div>
        <div className="TblDiv">
          <table>
            <thead key="thead">
              <tr>
                { this.fieldArr.map((field, index) => (
                  <th key={index} width={field[1] + '%'} className={field[3] ? undefined : field[0]} onClick={field[3] ? () => this.dataSortBy(field[0]) : undefined}>
                    {field[2]} {(field[3] && this.state.sort.column === field[0]) ? <small className={this.state.sort.direction}></small> : undefined}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
            { countries.map((country, index) => (
                <tr key={index}>
                  { this.fieldArr.map((field, inner_index) => (
                    <td key={index + '_' + inner_index} className={field[0]}>
                      {field[4] ? <img src={country.countryInfo.flag} width="32" alt={country[field[0]]} valign="middle"/> : ''}
                      {!field[5] ? (typeof country[field[0]] === 'undefined' ? index + 1 : (field[6]) ? this.formatDate(country[field[0]]) : country[field[0]]): ''}
                      {field[5] ? <u onClick={() => this.getChartData(country[field[0]], field[0])}><Popup trigger={<span>{country[field[0]]}</span>} modal closeOnDocumentClick>{close => (<Modal location={country[field[0]]} close={close} flag={field[4] ? country.countryInfo.flag : ''}/>)}</Popup></u> : ''}
                    </td>
                  ))}
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}
