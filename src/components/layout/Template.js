import React, { Component } from 'react';
import Style from 'style-it';
import './Template.css';

class Template extends Component {
  render() {
    let props = Object.assign({}, this.props.props);

    props.className = `${this.props.className || ''} Template ${props.className || ''}`;

    let modularCSS = ' ';
    if ('css' in this.props) {
      modularCSS = this.props.css;
    }

    return (
      <Style>
        {modularCSS}
        <div {...props}>
          {this.props.children}
        </div>
      </Style>
    );
  }
}

export default Template;
