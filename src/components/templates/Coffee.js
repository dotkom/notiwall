import Component from 'inferno-component';
import { Template } from '../layout';
import { formatDate } from '../../common'

class Coffee extends Component {
  constructor() {
    super();

    this.state = {
      coffeeTime: 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState(Object.assign({}, this.state, {
        coffeeTime: new Date(nextProps.data.coffee.date).getTime()
      }));
    }
  }

  render() {
    let dateFormatted = '';
    if ('coffeeTime' in this.state) {
      dateFormatted = formatDate(this.state.coffeeTime);
    }

    return (
      <Template className="Coffee">
        {this.props.title} {dateFormatted}
      </Template>
    );
  }
}

export default Coffee;
