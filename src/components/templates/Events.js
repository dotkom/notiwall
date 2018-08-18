import React, { Component } from 'react';
import { Template } from '../layout';
import './Events.css';

class Events extends Component {
  render() {
    return <Template className={this.constructor.name} {...this.props} />;
  }
}

export default Events;
