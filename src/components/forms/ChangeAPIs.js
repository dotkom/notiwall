import React, { Component } from 'react';
import { Section } from '../layout';
import { getStringParams } from '../../utils';

class ChangeAPIs extends Component {
  render() {
    let { apis, updateApi } = Object.assign({}, this.props);

    let apisElement = Object.entries(apis).map(([name, api]) => {
      let paramsInUrl = getStringParams(api.url);
      let entries = [];

      if (paramsInUrl.length) {
        for (let section of paramsInUrl) {
          entries.push(section.split('.')[0]);
        }
      }

      entries = entries.map((e, i) => (
        <div key={i}>
          <span>{e}: </span>
          <textarea defaultValue={JSON.stringify(api[e], null, 2)} />
        </div>
      ));

      return (
        <div key={name}>
          <h3>{name}</h3>
          <input defaultValue={api.interval} type="number" min={0} />
          <input defaultValue={api.url} />
          <div>
            {!!entries.length && <h4>Combinations in URL</h4>}
            {entries}
          </div>
        </div>
      );
    });

    return (
      <Section column size={'full'}>
        <h2>Change APIs</h2>
        {apisElement}
      </Section>
    );
  }
}

export default ChangeAPIs;
