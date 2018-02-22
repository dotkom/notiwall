import Component from 'inferno-component';
import { Template } from '../layout';
import { formatDate } from '../../common'

class Coffee extends Component {
  render() {
    let dateFormatted = '';
    if ('coffeeTime' in this.props) {
      dateFormatted = formatDate(this.props.coffeeTime);
    }

    return (
      <Template className="Coffee">
        {this.props.title} {dateFormatted}
      </Template>
    );
  }
}

export default Coffee;
