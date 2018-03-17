import React, { Component } from 'react';
import './App.css';
import * as Template from './components/templates';
import { Section } from './components/layout';
import { API } from './api';
import { API_URL } from './constants';
import { get, set } from 'object-path';
import { findObjectPaths, getStringParams } from './utils';

class App extends Component {
  constructor() {
    super();

    let apis = {
      affiliation: {
        interval: 10,
        url: `${API_URL}/affiliation/online`,
      },
      coffeePots: {
        interval: 60,
        url: `${API_URL}/coffee/online`,
      },
      bus: {
        interval: 0,
        // api.entur.org is also an option for the whole country
        url: 'https://atbapi.tar.io/api/v1/departures/{{stops.*.fromCity,toCity}}',
        stops: {
          glos: {
            fromCity: '16010265',
            toCity: '16010266',
          },
          samf: {
            fromCity: '16010265',
            toCity: '16010266',
          }
        }
      },
    };

    let components = [
      {
        template: 'Vakter',
        props: {},
      },
      {
        template: 'Coffee',
        apis: {
          // Format:
          // apiName.path.to.api.value: objectPath.to.save.value
          'affiliation.coffee.date': 'coffeeTime',
          'coffeePots.pots': 'pots',
        },
        css: `
          .Coffee {
            background-color: #f80;
          }
        `,
        props: {},
      },
      {
        template: 'Bus',
        apis: {
          'bus.stops.glos.fromCity.tests.departures': 'fromCity',
          'bus.stops.glos.toCity.tests.departures': 'toCity',
        },
        name: 'Gløshaugen syd',
        props: {},
      },
    ];

    this.state = {
      apis,
      components,
    };

    // Start the APIs and resolve template URLs
    for (let api in this.state.apis) {
      let obj = this.state.apis[api];
      let paramsInUrl = getStringParams(obj.url);
      if (paramsInUrl.length) {
        let paramsData = {};
        for (let section of paramsInUrl) {
          paramsData[section] = {};
          for (let path of findObjectPaths(obj, section)) {
            paramsData[section][path] = get(obj, path);
          }
        }

        let urls = {};
        for (let section in paramsData) {
          if (Object.keys(urls).length) {
            for (let url in urls) {
              for (let path in paramsData[section]) {
                urls[`${url}.${path}`] = urls[url].replace(
                  new RegExp(`{{${section}}}`, 'g'),
                  paramsData[section][path]
                );
              }
              delete urls[url];
            }
          } else {
            for (let path in paramsData[section]) {
              urls[path] = obj.url.replace(
                new RegExp(`{{${section}}}`, 'g'),
                paramsData[section][path]
              );
            }
          }
        }

        for (let object in urls) {
          this.startAPI(api, urls[object], object);
        }
      } else {
        this.startAPI(api);
      }
    }
  }

  startAPI(api, url = '', deep = '') {
    let delay = this.state.apis[api].delay || 0;

    setTimeout(() => {
      this.fetchData(api, url, deep);

      let interval = this.state.apis[api].interval;

      if (interval && interval > 0) {
        setInterval(() => {
          this.fetchData(api, url, deep);
        }, interval * 1000);
      }
    }, delay * 1000);
  }

  fetchData(api, url = '', deep = '') {
    API.getRequest(url || this.state.apis[api].url, data => {
      let components = this.state.components.slice();

      if (deep) {
        api += '.' + deep;
      }

      for (let component of components) {
        if ('apis' in component) {
          for (let apiPath in component.apis) {
            if (apiPath.indexOf(api) !== -1) {
              let deepPath = apiPath.split(api + '.')[1];
              set(component, component.apis[apiPath], get(data, deepPath));
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
