import React, { Component } from 'react';
import './App.css';
import * as Template from './components/templates';
import { Section } from './components/layout';
import { API } from './api';
import { API_URL } from './constants';
import { get, set } from 'object-path';

class App extends Component {
  constructor() {
    super();

    let apis = {
      affiliation: {
        interval: 10,
        url: `${API_URL}/affiliation/online`,
      },
      coffeePots: {
        url: `${API_URL}/coffee/online`,
      },
      busFromCity: {
        interval: 10,
        url: 'https://atbapi.tar.io/api/v1/departures/16010265',
      },
      busToCity: {
        interval: 10,
        url: 'https://atbapi.tar.io/api/v1/departures/16010266',
      },
    };

    let components = [
      {
        template: 'Vakter',
      },
      {
        apis: {
          // Format:
          // apiName.path.to.api.value: objectPath.to.save.value
          'affiliation.coffee.date': 'coffeeTime',
          'coffeePots.pots': 'pots',
        },
        template: 'Coffee',
        css: `
          .Coffee {
            background-color: #f80;
          }
        `,
      },
      {
        apis: {
          'busFromCity.departures': 'fromCity',
          'busToCity.departures': 'toCity',
        },
        template: 'Bus',
      },
    ];

    this.state = {
      apis,
      components,
    };

    for (let api in this.state.apis) {
      this.startAPI(api);
    }
  }

  startAPI(api) {
    let delay = this.state.apis[api].delay || 0;

    setTimeout(() => {
      this.fetchData(api);

      let interval = this.state.apis[api].interval;

      if (interval && interval > 0) {
        setInterval(() => {
          this.fetchData(api);
        }, interval * 1000);
      }
    }, delay * 1000);
  }

  fetchData(api) {
    API.getRequest(this.state.apis[api].url, data => {
      let components = this.state.components.slice();

      for (let component of components) {
        if ('apis' in component) {
          for (let apiPath in component.apis) {
            let [ apiKey, ...deepPath ] = apiPath.split('.');

            if (apiKey === api) {
              set(component, [ 'data', component.apis[apiPath] ], get(data, deepPath));
            }
          }
        }
      }

      this.setState(Object.assign({}, this.state, {
        components: components,
      }));
    });
  }

  render() {
    let componentElements = this.state.components.map((element, i) => {
      const Element = Template[element.template];

      return (
        <Section key={i}>
          <Element {...element} />
        </Section>
      );
    });

    return (
      <div className={`App ${process.env.NODE_ENV === 'development' ? 'dev' : ''}`}>
        <Section>
          <Template.Header>
            <div className="triangle">
            </div>
          </Template.Header>
        </Section>
        {componentElements}
      </div>
    );
  }
}

export default App;
