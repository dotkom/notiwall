import Component from 'inferno-component';
import './Template.css';

class Template extends Component {
  render() {
    this.props.className = `${this.props.className || ''} Template`;

    return (
      <div {...this.props}>
        {this.props.children}
      </div>
    );
  }
}

export default Template;
