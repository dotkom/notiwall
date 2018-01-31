import Component from 'inferno-component';
import './Section.css';

class Section extends Component {
  render() {
    return (
      <div className="Section">
        {this.props.children}
      </div>
    );
  }
}

export default Section;
