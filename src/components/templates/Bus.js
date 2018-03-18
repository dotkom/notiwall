import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';
import { distanceInWords, format, addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { get } from 'object-path';
import * as locale from 'date-fns/locale/nb';

class Bus extends Component {
  constructor() {
    super();

    this.state = {
      toCity: [],
      fromCity: [],
      lastTick: new Date().getTime(),
    };

    this.templateVars = {
      name: 'string',
      apis: 'apis',
    }
  }

  componentDidMount() {
    setInterval(() => this.tick(), 1000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(Object.assign({}, this.state, {
      toCity: get(nextProps, 'toCity', []),
      fromCity: get(nextProps, 'fromCity', []),
    }));
  }

  tick() {
    let toCity = this.state.toCity.slice();
    let fromCity = this.state.fromCity.slice();
    let diff = differenceInMilliseconds(new Date(), this.state.lastTick);

    for (let departure of toCity) {
      departure.registeredDepartureTime = this.addTime(departure.registeredDepartureTime, diff);
      departure.scheduledDepartureTime = this.addTime(departure.scheduledDepartureTime, diff);
    }

    for (let departure of fromCity) {
      departure.registeredDepartureTime = this.addTime(departure.registeredDepartureTime, diff);
      departure.scheduledDepartureTime = this.addTime(departure.scheduledDepartureTime, diff);
    }

    this.setState(Object.assign({}, this.state, { toCity, fromCity, lastTick: new Date().getTime() }));
  }

  addTime(time, add, strFormat = 'YYYY-MM-DDTHH:mm:ss') {
    let newTime = addMilliseconds(time, add);
    return format(newTime, strFormat);
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
      <Template className={this.constructor.name} {...this.props} templateVars={this.templateVars}>
        <h3>{this.props.name} (fra byen)</h3>
        {fromCity}
        <h3>{this.props.name} (mot byen)</h3>
        {toCity}
      </Template>
    );
  }
}

export default Bus;
