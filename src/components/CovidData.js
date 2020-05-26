import React from "react";
import _ from 'lodash';

export default class CovidData extends React.Component {
  state = {
    loading: true,
    countries: null,
    allCountriesData: null,
    isUpdating: false,
    sort: {
      column: 'country',
      direction: 'asc',
    },
    search: '',
  };

  async componentDidMount() {
    this.fetchData();
    setInterval(this.fetchData.bind(this), 60000);
  }
  
  async fetchData() {
    const url = "https://corona.lmao.ninja/v2/countries";
    this.setState({ isUpdating: true });
    const response = await fetch(url);
    const data = await response.json();
    this.setState({ allCountriesData: _.orderBy(data, [this.state.sort.column], [this.state.sort.direction]), loading: false, isUpdating: false }, () => {
      this.dataMatch();
    })
  }
  
  formatDate(datestring) {
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
  
  dataSortBy(key) {
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
  
  findData(e) {
    this.setState({
      search: e.target.value,
    }, () => {
      this.dataMatch()
    })
  }

  dataMatch() {
    this.setState({
      countries: _.filter(this.state.allCountriesData, function(cdata) {
        return (cdata.country + '|' + cdata.tests + '|'  + this.formatDate(cdata.updated) + '|' + cdata.cases + '|' + cdata.deaths + '|' + cdata.recovered + '|' + cdata.todayCases + '|' + cdata.todayDeaths).toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1; 
      }.bind(this))
    });
  }

  render() {
    if (this.state.loading) {
      return <div><div className="loader"></div><h3>Loading.....</h3></div>;
    }

    if (!this.state.countries) {
      return <div>didn't get data</div>;
    }
    
    let countries = this.state.countries;

    return (
      <div>
        <div className="filter"><span>Search: </span><input type="text" placeholder="Enter any term to be searched" onChange={(e)=>this.findData(e)} /><div>{this.state.isUpdating ? <big className="loading">Updating Data</big> : null }</div></div>
        <div className="TblDiv">
          <table>
            <thead key="thead">
              <tr>
                  <th width="5%">SL No.</th><th width="20%" onClick={() => this.dataSortBy('country')}>Country<small className={(this.state.sort.column === 'country') ? this.state.sort.direction : ''}></small></th><th width="15%" onClick={() => this.dataSortBy('updated')}>Last Updated <small className={(this.state.sort.column === 'updated') ? this.state.sort.direction : ''}></small></th><th width="10%" onClick={() => this.dataSortBy('tests')}>Total Tests <small className={(this.state.sort.column === 'tests') ? this.state.sort.direction : ''}></small></th><th width="10%" onClick={() => this.dataSortBy('cases')}>Cases <small className={(this.state.sort.column === 'cases') ? this.state.sort.direction : ''}></small></th><th width="10%" onClick={() => this.dataSortBy('deaths')}>Deaths <small className={(this.state.sort.column === 'deaths') ? this.state.sort.direction : ''}></small></th><th width="10%" onClick={() => this.dataSortBy('recovered')}>Recovered <small className={(this.state.sort.column === 'recovered') ? this.state.sort.direction : ''}></small></th><th width="10%" onClick={() => this.dataSortBy('todayCases')}>Today's Cases <small className={(this.state.sort.column === 'todayCases') ? this.state.sort.direction : ''}></small></th><th width="10%" onClick={() => this.dataSortBy('todayDeaths')}>Today's Deaths <small className={(this.state.sort.column === 'todayDeaths') ? this.state.sort.direction : ''}></small></th>
              </tr>
            </thead>
            <tbody>
            { countries.map((country, index) => (
                <tr key={index}>
                  <td>{index+1}.</td><td><img src={country.countryInfo.flag} width="24" alt={country.country} valign="middle"/>&nbsp;&nbsp;<strong>{country.country}</strong></td><td>{this.formatDate(country.updated)}</td><td>{country.tests}</td><td>{country.cases}</td><td>{country.deaths}</td><td>{country.recovered}</td><td>{country.todayCases}</td><td>{country.todayDeaths}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}