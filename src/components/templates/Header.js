import React, { Component } from 'react';
import { Template } from '../layout';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <Template className={this.constructor.name}>
        {this.props.children}
      </Template>
    );
  }
}

export default Header;
