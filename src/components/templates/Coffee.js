import React, { Component } from 'react';
import { Template } from '../layout';
import { distanceInWordsToNow, format, differenceInHours, getDay } from 'date-fns';
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
    }
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
    }

    let pots = null;
    if (this.state.pots) {
      pots = this.state.pots
      .filter(e => getDay(new Date()) === getDay(e))
      .map((e, i) => {
        return <div key={i}>{format(e, 'HH:mm', { locale })}</div>;
      });
    }

    return (
      <Template className={this.constructor.name} {...this.props} templateVars={this.templateVars}>
        <h3>Kaffe</h3>
        {coffeeInfo}
        {pots && pots.length ? <h3>Kaffe hittil i dag</h3> : null}
        {pots}
      </Template>
    );
  }
}

export default Coffee;
