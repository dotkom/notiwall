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
    };
  }

  componentWillReceiveProps(nextProps) {
    let nextDate = get(nextProps, 'data.coffeeTime');
    let date = get(this.props, 'data.coffeeTime');

    if (nextDate !== date) {
      if (nextDate === null) {
        this.setState(Object.assign({}, this.state, {
          coffeeTime: -1,
        }));
      } else {
        this.setState(Object.assign({}, this.state, {
          coffeeTime: new Date(nextDate).getTime(),
        }));
      }
    }
  }

  render() {
    let coffeeInfo = 'Henter kaffastatus...';

    if (this.state.coffeeTime > 0) {
      let coffeeDate = new Date(this.state.coffeeTime);

      if (differenceInHours(new Date(), coffeeDate) > 1) {
        let timeFormatted = format(this.state.coffeeTime, 'HH:mm');
        coffeeInfo = `Kaffe ble laget kl. ${timeFormatted}`;
      } else {
        let dateFormatted = distanceInWordsToNow(coffeeDate, { locale });
        let timeFormatted = format(this.state.coffeeTime, 'HH:mm');
        coffeeInfo = `Kaffe ble laget ${dateFormatted} siden (${timeFormatted})`;
      }
    } else if (this.state.coffeeTime === -1) {
      coffeeInfo = 'Kaffen har ikke blitt satt på i dag.';
    }

    return (
      <Template className={this.constructor.name} {...this.props}>
        {coffeeInfo}
      </Template>
    );
  }
}

export default Coffee;
