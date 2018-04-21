import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';
import { distanceInWords, format, addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { get, set } from 'object-path';
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
    };
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
      set(departure, this.props.apiPaths.registredTime, this.addTime(get(departure, this.props.apiPaths.registredTime), diff));
      set(departure, this.props.apiPaths.scheduledTime, this.addTime(get(departure, this.props.apiPaths.scheduledTime), diff));
    }

    for (let departure of fromCity) {
      set(departure, this.props.apiPaths.registredTime, this.addTime(get(departure, this.props.apiPaths.registredTime), diff));
      set(departure, this.props.apiPaths.scheduledTime, this.addTime(get(departure, this.props.apiPaths.scheduledTime), diff));
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
      e.time = get(e, this.props.apiPaths.scheduledTime);

      if (get(e, this.props.apiPaths.isRealtime)) {
        e.time = get(e, this.props.apiPaths.registredTime);
      }

      return e;
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((e, i) => {
      let timeLeft = distanceInWords(e.time, new Date(), { locale });
      let time = format(e.time, 'HH:mm');
      let style = get(e, this.props.apiPaths.isRealtime) ? { color: 'blue' } : {};

      return <div key={i} style={style}>{get(e, this.props.apiPaths.number)} <b>{get(e, this.props.apiPaths.name)}</b> - om {timeLeft} ({time})</div>;
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
