import React, { Component } from 'react';
import Style from 'style-it';
import './Template.css';

class Template extends Component {
  render() {
    let props = Object.assign({}, this.props);

    props.className = `${props.className || ''} Template`;

    let modularCSS = ' ';
    if ('css' in props) {
      modularCSS = props.css;
      delete props.css;
    }

    delete props.apis;
    delete props.data;
    delete props.template;

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
