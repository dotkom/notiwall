import Component from 'inferno-component';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <div className="Header">
        {this.props.children}
      </div>
    );
  }
}

export default Header;
