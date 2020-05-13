import React, { Component } from 'react';
import './App.css';
import CovidData from "./components/CovidData";

class App extends Component {
  state = {
    visible: true
  };
  
  render() {
    return (
      <div className="App">
        <CovidData />
      </div>
    );
  }
}

export default App;