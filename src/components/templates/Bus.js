import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';
import { distanceInWordsStrict } from 'date-fns';
import { get } from 'object-path';
import * as locale from 'date-fns/locale/nb';

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
      let time = distanceInWordsStrict(e.scheduledDepartureTime, new Date(), { locale });
      return <div key={i}>{e.line} <b>{e.destination}</b> - om {time}</div>;
    });

    return (
      <Template className={this.constructor.name} {...this.props}>
        <b>Bussen går:</b>
        {departures}
      </Template>
    );
  }
}

export default Bus;
