import React, { Component } from 'react';
import { Template } from '../layout';
import './Bus.css';
import {
  format,
  addMilliseconds,
  differenceInMilliseconds,
  differenceInMinutes,
} from 'date-fns';
import { get, set } from 'object-path';
import * as locale from 'date-fns/locale/nb';

class Bus extends Component {
  constructor() {
    super();

    this.mounted = false;

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
    this.mounted = true;
    setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      Object.assign({}, this.state, {
        toCity: get(nextProps, 'toCity', []),
        fromCity: get(nextProps, 'fromCity', []),
      }),
    );
  }

  tick() {
    let toCity = this.state.toCity.slice();
    let fromCity = this.state.fromCity.slice();
    let diff = differenceInMilliseconds(new Date(), this.state.lastTick);

    for (let departure of toCity) {
      set(
        departure,
        this.props.departureSchema.registredTime,
        this.addTime(
          get(departure, this.props.departureSchema.registredTime),
          diff,
        ),
      );
      set(
        departure,
        this.props.departureSchema.scheduledTime,
        this.addTime(
          get(departure, this.props.departureSchema.scheduledTime),
          diff,
        ),
      );
    }

    for (let departure of fromCity) {
      set(
        departure,
        this.props.departureSchema.registredTime,
        this.addTime(
          get(departure, this.props.departureSchema.registredTime),
          diff,
        ),
      );
      set(
        departure,
        this.props.departureSchema.scheduledTime,
        this.addTime(
          get(departure, this.props.departureSchema.scheduledTime),
          diff,
        ),
      );
    }

    if (this.mounted) {
      this.setState(
        Object.assign({}, this.state, {
          toCity,
          fromCity,
          lastTick: new Date().getTime(),
        }),
      );
    }
  }

  addTime(time, add, strFormat = 'YYYY-MM-DDTHH:mm:ss') {
    let newTime = addMilliseconds(time, add);
    return format(newTime, strFormat);
  }

  getDepartureList(departures) {
    return departures
      .map(e => {
        e.time = get(e, this.props.departureSchema.scheduledTime);

        if (get(e, this.props.departureSchema.isRealtime)) {
          e.time = get(e, this.props.departureSchema.registredTime);
        }

        return e;
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((e, i) => {
        let timeLeft = differenceInMinutes(e.time, new Date(), { locale }) + ' min';
        let time = format(e.time, 'HH:mm');
        const isRealtime = get(e, this.props.departureSchema.isRealtime);
        let style = isRealtime
          ? { color: '#ffb800' }
          : {};

        return (
          <div key={i} title={get(e, this.props.departureSchema.name)} className="bus-list-item">
            <div className="bus-list-item-number">{get(e, this.props.departureSchema.number)}</div>
            <div className="bus-list-item-time" style={style}>{isRealtime ? timeLeft : time}</div>
          </div>
        );
      });
  }

  render() {
    const toCity = this.getDepartureList(this.state.toCity);
    const fromCity = this.getDepartureList(this.state.fromCity);
    const { translate } = this.props;

    return (
      <Template
        className={this.constructor.name}
        {...this.props}
        templateVars={this.templateVars}
      >
        <div className="bus-wrapper">
          <h2 className="bus-stop">{translate(this.props.name)}</h2>
          <div className="bus-dir">
            <h3 className="bus-dir-item">Til byen</h3>
            <h3 className="bus-dir-item">Fra byen</h3>
          </div>
          <div className="bus-list">{fromCity}</div>
          <div className="bus-list">{toCity}</div>
        </div>
      </Template>
    );
  }
}

export default Bus;
