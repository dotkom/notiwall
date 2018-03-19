import React, { Component } from 'react';
import { Template } from '../layout';
import './Vakter.css';

class Vakter extends Component {
  render() {
    return (
      <Template className={this.constructor.name} {...this.props}>
        Vakter her
      </Template>
    );
  }
}

export default Vakter;
