import React, { Component } from 'react';
import { Template, SubSection } from '../layout';
import * as Templates from '../templates';
import './StatusTop.css';
import { get } from 'object-path';

class StatusTop extends Component {
  constructor() {
    super();

    this.state = {
      components: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    let components = this.state.components.slice();
    
    for (let index in this.props.components) {
      for (let use of this.props.components[index].uses) {
        if (!(index in components)) {
          components[index] = {};
        }

        components[index][use] = get(nextProps, use);
      }
    }

    this.setState(Object.assign({}, this.state, { components }));
  }

  render() {
    let templatesElement = this.props.components.map((e, i) => {
      let Element = Templates[e.template];

      return <Element key={i} {...this.state.components[i]} />;
    });

    return (
      <Template className={this.constructor.name} {...this.props}>
        <SubSection>
          {templatesElement}
        </SubSection>
      </Template>
    );
  }
}

export default StatusTop;
