import React, { Component } from 'react';
import { Template } from '../layout';
import { distanceInWordsToNow, format, differenceInHours } from 'date-fns';
import { get } from 'object-path';
import * as locale from 'date-fns/locale/nb';
import { simpleClock } from '../ui-elements/Clocks';

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

    this.lastRendered = Date.now();
  }

  componentDidUpdate() {
    const now = Date.now();
    const diff = now - this.lastRendered;
    this.lastRendered = now;
    const timeout = diff >= 16 ? 0 : 16 - diff;

    setTimeout(() => {
      this.forceUpdate();
    }, timeout);
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

    return (
      <Template className={this.constructor.name} {...this.props} templateVars={this.templateVars}>
        <h3>Kaffe</h3>
        {coffeeInfo}
        {simpleClock(new Date(), potsList || [])}
      </Template>
    );
  }
}

export default Coffee;
