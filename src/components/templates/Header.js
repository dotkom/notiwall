import Component from 'inferno-component';
import { Template } from '../layout';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <Template className="Header">
        {this.props.children}
      </Template>
    );
  }
}

export default Header;
