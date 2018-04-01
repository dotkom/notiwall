import React, { Component } from 'react';
import './Section.css';

class Section extends Component {
  render() {
    let props = Object.assign({}, this.props);

    props.className = `Section ${this.props.className || ''}`;

    if (this.props.column) {
      props.className += ' column';
      delete props.column;
    }

    if (this.props.size) {
      props.className += ` width-${this.props.size}`;
      delete props.size;
    }
 
    return (
      <div {...props}>
        {this.props.children}
      </div>
    );
  }
}

export default Section;
