import React, { Component } from 'react';
import { Template } from '../layout';
import { distanceInWordsToNow, format, differenceInHours } from 'date-fns';
import * as locale from 'date-fns/locale/nb';

class Coffee extends Component {
  constructor() {
    super();

    this.state = {
      coffeeTime: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({}, this.state, {
        coffeeTime: new Date(nextProps.data.coffee.date).getTime(),
      }));
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
    }

    return (
      <Template className="Coffee" {...this.props}>
        {coffeeInfo}
      </Template>
    );
  }
}

export default Coffee;
