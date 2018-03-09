import Component from 'inferno-component';
import { Template } from '../layout';
import { distanceInWordsToNow, format } from 'date-fns';
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
    if ('coffeeTime' in this.state && this.state.coffeeTime > 0) {
      let dateFormatted = distanceInWordsToNow(new Date(this.state.coffeeTime), { locale });
      let timeFormatted = format(this.state.coffeeTime, 'HH:mm');
      coffeeInfo = `Kaffe ble laget ${dateFormatted} siden. (${timeFormatted})`;
    }

    return (
      <Template className="Coffee">
        {coffeeInfo}
      </Template>
    );
  }
}

export default Coffee;
