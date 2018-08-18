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

          {/*<svg width="300" height="300" viewBox="0 0 300 300" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="Canvas" fill="none">
              <g id="Ellipse 2.1">
                <circle cx="150" cy="150" r="150" fill="black" fill-opacity="0.1"/>
                <circle cx="150" cy="150" r="147.5" stroke-width="5" stroke="white"/>
              </g>
            </g>
          </svg>*/}
        </SubSection>
      </Template>
    );
  }
}

export default StatusTop;
