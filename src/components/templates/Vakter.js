import React, { Component } from 'react';
import { Template } from '../layout';
import './Vakter.css';
import { get } from 'object-path';

class Vakter extends Component {
  constructor() {
    super();

    this.state = {
      message: ' ',
      responsible: 0,
      responsibles: [
        'Emil', 'Karoline', 'Sjokolade', 'Kake', 'Niklas', 'Doge',
      ]
    };

    this.templateVars = {
    }
  }

  componentWillReceiveProps(nextProps) {
    let nextMsg = get(nextProps, 'message');
    let nextResponsible = get(nextProps, 'responsible');

    let state = Object.assign({}, this.state, {
      message: nextMsg,
      responsible: nextResponsible,
    });

    this.setState(state);
  }

  render() {
    let responsibleListElement = null;
    if (this.state.responsibles.length){
      responsibleListElement = this.state.responsibles.map((e, i) => {
        return <div key={i}>{e}</div>;
      })
    }
    return (
      <Template className={this.constructor.name} {...this.props}>
        Vakter her {this.state.message}
        {responsibleListElement}
      </Template>
    );
  }
}

export default Vakter;
