import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';
import { distanceInWords, format } from 'date-fns';
import { get } from 'object-path';
import * as locale from 'date-fns/locale/nb';

class Bus extends Component {
  constructor() {
    super();

    this.state = {
      toCity: [],
      fromCity: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(Object.assign({}, this.state, {
      toCity: get(nextProps, 'data.toCity', []),
      fromCity: get(nextProps, 'data.fromCity', []),
    }))
  }

  getDepartureList(departures) {
    return departures
    .map(e => {
      e.time = e.scheduledDepartureTime;

      if (e.isRealtimeData) {
        e.time = e.registeredDepartureTime;
      }

      return e;
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((e, i) => {
      let timeLeft = distanceInWords(e.time, new Date(), { locale });
      let time = format(e.time, 'HH:mm');
      let style = e.isRealtimeData ? { color: 'blue' } : {};

      return <div key={i} style={style}>{e.line} <b>{e.destination}</b> - om {timeLeft} ({time})</div>;
    });
  }

  render() {
    let toCity = this.getDepartureList(this.state.toCity);
    let fromCity = this.getDepartureList(this.state.fromCity);

    return (
      <Template className={this.constructor.name} {...this.props}>
        <h3>Gløshaugen syd (fra byen)</h3>
        {fromCity}
        <h3>Gløshaugen syd (mot byen)</h3>
        {toCity}
      </Template>
    );
  }
}

export default Bus;
