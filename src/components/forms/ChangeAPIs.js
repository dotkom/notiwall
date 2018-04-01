import React, { Component } from 'react';
import { Section } from '../layout';

class ChangeAPIs extends Component {
  render() {
    let { apis, updateApi } = Object.assign({}, this.props);

    let apisElement = Object.entries(apis).map(([name, api]) => {
      return (
        <div key={name}>{name} - {api.interval} - {api.url}</div>
      );
    });
 
    return (
      <Section column size={2}>
        <h2>Change APIs</h2>
        {apisElement}
      </Section>
    );
  }
}

export default ChangeAPIs;
