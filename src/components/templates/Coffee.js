import React, { Component } from 'react';
import { Template } from '../layout';
import { distanceInWordsToNow, format, differenceInHours } from 'date-fns';
import { get } from 'object-path';
import * as locale from 'date-fns/locale/nb';

class Coffee extends Component {
  constructor() {
    super();

    this.state = {
      coffeeTime: 0,
      pots: [],
    };

    this.templateVars = {
      apis: 'apis',
    };

    this.clockInterval = null;
  }

  componentDidMount() {
    this.clockInterval = setInterval(() => this.forceUpdate(), 1000 / 50); // Almost 60 frames per sec
  }

  componentWillUnmount() {
    clearInterval(this.clockInterval);
  }

  componentWillReceiveProps(nextProps) {
    let nextDate = get(nextProps, 'coffeeTime');

    let state = Object.assign({}, this.state, {
      coffeeTime: nextDate === null ? -1 : new Date(nextDate).getTime(),
      pots: get(nextProps, 'pots'),
    });

    this.setState(state);
  }

  render() {
    let coffeeInfo = 'Henter kaffestatus...';
    let { offline } = this.props;

    if (this.state.coffeeTime > 0) {
      let coffeeDate = this.state.coffeeTime;

      if (differenceInHours(new Date(), coffeeDate) > 1) {
        let timeFormatted = format(this.state.coffeeTime, 'HH:mm');
        coffeeInfo = `Kaffe ble laget kl. ${timeFormatted}`;
      } else {
        let dateFormatted = distanceInWordsToNow(coffeeDate, { locale });
        coffeeInfo = `Kaffe ble laget ${dateFormatted} siden`;
      }
    } else if (this.state.coffeeTime === -1) {
      coffeeInfo = 'Kaffen har ikke blitt satt på i dag.';
    } else if (offline && offline.find(a => a.split('.')[0] === 'affiliation')) {
      coffeeInfo = 'API\'et er utilgjengelig';
    }

    let potsList = [];
    let pots = null;
    if (this.state.pots) {
      potsList = this.state.pots
        .filter(e => differenceInHours(new Date(), e) <= 24)
        .map(e => format(e, 'HH:mm', { locale }));
      pots = potsList.map((e, i) => {
        return <div key={i}>{e}</div>;
      });
    }

    const clockElement = (time, pots = []) => {
      const potsElement = pots.map((e, i) => {
        const [ hours, minutes ] = e.split(':').map(e => parseInt(e, 10));
        const pos = (hours + minutes / 60) / 12;
        const dx = Math.sin(Math.PI - pos * Math.PI * 2) * 40;
        const dy = Math.cos(Math.PI + pos * Math.PI * 2) * 40;
        return <circle key={i} cx={50 + dx} cy={50 + dy} r="2" fill="#f80" />;
      });

      const hour = time.getHours();
      const minute = time.getMinutes();
      const second = time.getSeconds();
      const millisecond = time.getMilliseconds();

      const hourX = Math.sin(Math.PI - Math.PI * 2 * (hour / 12 + minute / 12 / 60)) * 16;
      const hourY = Math.cos(Math.PI + Math.PI * 2 * (hour / 12 + minute / 12 / 60)) * 16;
      const minuteX = Math.sin(Math.PI - Math.PI * 2 * (minute / 60 + second / 60 / 60)) * 32;
      const minuteY = Math.cos(Math.PI + Math.PI * 2 * (minute / 60 + second / 60 / 60)) * 32;
      const secondX = Math.sin(Math.PI - Math.PI * 2 * (second / 60 + millisecond / 60 / 1000)) * 32;
      const secondY = Math.cos(Math.PI + Math.PI * 2 * (second / 60 + millisecond / 60 / 1000)) * 32;

      const borderSize = 2;

      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <line strokeLinecap="round" x1="50" y1="50" x2={50 + hourX} y2={50 + hourY} strokeWidth={borderSize} stroke="#fff" />
          <line strokeLinecap="round" x1="50" y1="50" x2={50 + minuteX} y2={50 + minuteY} strokeWidth={borderSize} stroke="#fff" />
          <line strokeLinecap="round" x1="50" y1="50" x2={50 + secondX} y2={50 + secondY} strokeWidth={borderSize / 2} stroke="#fff" />
          <circle cx="50" cy="50" r="40" strokeWidth={borderSize} stroke="#fff" fill="none" />
          {potsElement}
        </svg>
      );
    }

    return (
      <Template className={this.constructor.name} {...this.props} templateVars={this.templateVars}>
        <h3>Kaffe</h3>
        {coffeeInfo}
        {pots && pots.length ? <h3>Kaffe hittil i dag</h3> : null}
        {false && pots}
        {clockElement(new Date(), potsList || [])}
      </Template>
    );
  }
}

export default Coffee;
