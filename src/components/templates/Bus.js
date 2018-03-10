import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';

class Bus extends Component {
  render() {
    return (
      <Template className="Bus">
        Bussen er her {this.props.coffeeTime}
      </Template>
    );
  }
}

export default Bus;
