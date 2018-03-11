import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';
import { get } from 'object-path';

class Bus extends Component {
  constructor() {
    super();

    this.state = {
      departures: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    let nextDepartures = get(nextProps, 'data.departures');
    let departures = get(this.props, 'data.departures');

    if (nextDepartures !== departures) {
      this.setState(Object.assign({}, this.state, {
        departures: nextDepartures,
      }))
    }
  }

  render() {
    let departures = this.state.departures.map((e, i) => {
      return <div key={i}>{e.line}-{e.destination}</div>;
    });

    return (
      <Template className={this.constructor.name} {...this.props}>
        Bussen går:
        {departures}
      </Template>
    );
  }
}

export default Bus;
