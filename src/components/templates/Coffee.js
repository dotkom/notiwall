import React, { Component } from 'react';
import { Template } from '../layout';
import { distanceInWordsToNow, format, differenceInHours } from 'date-fns';
import { get } from 'object-path';
import * as locale from 'date-fns/locale/nb';
import { simpleClock } from '../gadgets/Clocks';

class Coffee extends Component {
  constructor() {
    super();
    this.mounted = false;

    this.state = {
      coffeeTime: 0,
      pots: [],
    };

    this.templateVars = {
      apis: 'apis',
    };

    this.lastRendered = Date.now();
  }

  componentDidMount() {
    this.forceUpdate();
    this.mounted = true;
  }

  componentDidUpdate() {
    const now = Date.now();
    const diff = now - this.lastRendered;
    this.lastRendered = now;
    const timeout = diff >= 1000 ? 0 : 1000 - diff;

    setTimeout(() => {
      if (this.mounted) {
        this.forceUpdate();
      }
    }, timeout);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    const nextDate = get(nextProps, 'coffeeTime');
    const time = new Date(nextDate).getTime();

    const state = Object.assign({}, this.state, {
      coffeeTime: nextDate === null ? -1 : time,
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
    } else if (
      offline &&
      offline.find(a => a.split('.')[0] === 'affiliation')
    ) {
      coffeeInfo = "API'et er utilgjengelig";
    }

    let potsList = [];
    if (this.state.pots) {
      potsList = this.state.pots
        .filter(e => differenceInHours(new Date(), e) <= 24)
        .map(e => format(e, 'HH:mm', { locale }));
    }

    const time = new Date();

    return (
      <Template
        className={this.constructor.name}
        {...this.props}
        templateVars={this.templateVars}
      >
        <h3>Kaffe</h3>
        {this.props.showCoffeePots !== 'false' && coffeeInfo}
        {simpleClock(
          new Date(time - (time % 1000)),
          potsList || [],
          this.props.showCoffeePots !== 'false',
        )}
      </Template>
    );
  }
}

export default Coffee;
