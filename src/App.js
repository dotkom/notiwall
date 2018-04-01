import React, { Component } from 'react';
import './App.css';
import { ChangeAPIs } from './components/forms';
import { Section } from './components/layout';
import * as Template from './components/templates';
import {
  API,
  Storage,
  getStringParams,
  findObjectPaths,
} from './utils';
import { API_URL } from './constants';
import { get, set } from 'object-path';

class App extends Component {
  constructor() {
    super();

    this.storage = new Storage();
    this.intervals = {};

    let apis = {};
    let components = [];

    if (this.storage.has('apis')) {
      apis = this.storage.get('apis');
    } else {
      apis = {
        affiliation: {
          interval: 10,
          url: `${API_URL}/affiliation/{{org.*}}`,
          org: {
            online: 'online',
            abakus: 'abakus',
            delta: 'delta',
          },
        },
        coffeePots: {
          interval: 60,
          url: `${API_URL}/coffee/online`,
        },
        bus: {
          interval: 10,
          // api.entur.org is also an option for the whole country
          url: 'https://atbapi.tar.io/api/v1/departures/{{stops.*.fromCity,toCity}}',
          stops: {
            glos: {
              fromCity: '16010265',
              toCity: '16011265',
            },
            samf: {
              fromCity: '16010476',
              toCity: '16011476',
            },
          },
        },
      };

      this.storage.merge({ apis }, true);
    }

    if (this.storage.has('components')) {
      components = this.storage.get('components');
    } else {
      components = [
        {
          template: 'Vakter',
          props: {},
        },
        {
          template: 'Coffee',
          apis: {
            // Format:
            // api.name:path.to.api.value: objectPath.to.save.value
            'affiliation.org.online:coffee.date': 'coffeeTime',
            'coffeePots:pots': 'pots',
          },
          props: {},
        },
        {
          template: 'Bus',
          name: 'Gløshaugen syd',
          apis: {
            'bus.stops.glos.fromCity:departures': 'fromCity',
            'bus.stops.glos.toCity:departures': 'toCity',
          },
          props: {},
        },
        {
          template: 'Bus',
          name: 'Samfundet',
          apis: {
            'bus.stops.samf.fromCity:departures': 'fromCity',
            'bus.stops.samf.toCity:departures': 'toCity',
          },
          props: {},
        },
      ];

      this.storage.merge({ components }, true);
    }

    for (let root in apis) {
      delete apis[root].fails;
      delete apis[root].offline;
    }

    this.state = {
      offlineMode: !navigator.onLine,
      apis,
      components,
      edit: false,
    };

    this.updateComponent = this.updateComponent.bind(this);
    this.updateApi = this.updateApi.bind(this);

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
    // Check if any components has this API, else we should not fetch data
    let components = this.state.components.slice();
    let object = api + (deep ? '.' + deep : '');
    let apiIsInUse = false;

    for (let component of components) {
      if ('apis' in component) {
        for (let apiPath in component.apis) {
          if (apiPath.indexOf(object) === 0) {
            apiIsInUse = true;
            break;
          }
        }
      }
      if (apiIsInUse) {
        break;
      }
    }

    if (!apiIsInUse) {
      return;
    }

    // Run API
    let delay = this.state.apis[api].delay || 0;

    setTimeout(() => {
      this.fetchData(api, url, deep);

      let interval = this.state.apis[api].interval;

      if (interval && interval > 0) {
        this.intervals[`${api}${deep ? '.' + deep : ''}`] = {
          url,
          deep,
          interval: setInterval(() => {
            this.fetchData(api, url, deep);
          }, interval * 1000),
        };
      }
    }, delay * 1000);
  }

  fetchData(api, url = '', deep = '') {
    if (this.state.apis[api].offline) {
      return;
    }

    API.getRequest(url || this.state.apis[api].url, data => {
      let components = this.state.components.slice();

      if (deep) {
        api += '.' + deep;
      }

      for (let component of components) {
        if ('apis' in component) {
          for (let apiPath in component.apis) {
            if (apiPath.indexOf(api) === 0) {
              let deepPath = apiPath.split(api + ':')[1];
              set(component, component.apis[apiPath], get(data, deepPath));
            }
          }
        }
      }

      this.setState(Object.assign({}, this.state, { components }));
    }, () => {
      // Stop API when it reaches to many failed requests
      let maxFails = 1;
      let apis = Object.assign({}, this.state.apis);

      // If the API only fetches a single time
      if (!apis[api].interval) {
        maxFails = 1;
      }

      // If the API only fetches a single time in 30 seconds
      if ('interval' in apis[api] && apis[api].interval >= 30) {
        maxFails = 1;
      }

      // Increment or set an fails property on the API
      apis[api].fails = (apis[api].fails || 0) + 1;
      this.setState(Object.assign({}, this.state, { apis }));

      // If API has reached its maxFails, it goes offline
      if ('fails' in apis[api] && apis[api].fails >= maxFails) {
        apis[api].offline = true;
        delete apis[api].fails;

        this.setState(Object.assign({}, this.state, { apis }));
      }
    });
  }

  goOnline(api = null) {
    let apis = Object.assign({}, this.state.apis);

    if (api === null) {
      for (let root in apis) {
        delete apis[root].fails;
        delete apis[root].offline;
      }

      this.setState(Object.assign({}, this.state, { apis, offlineMode: false }));
    } else {
      let root = api.split('.')[0];
      delete apis[root].fails;
      delete apis[root].offline;

      this.setState(Object.assign({}, this.state, { apis }));

      if (api in this.intervals) {
        this.fetchData(root, this.intervals[api].url, this.intervals[api].deep);

        clearInterval(this.intervals[api].interval);
        this.intervals[api].interval = setInterval(() => {
          this.fetchData(root, this.intervals[api].url, this.intervals[api].deep);
        }, this.state.apis[root].interval * 1000);
      }
    }
  }

  getApis(key) {
    let matches = [];

    // Go through all APIs
    for (let api in this.state.apis) {
      let obj = this.state.apis[api];

      // Get fields to search further with
      let paramsInUrl = getStringParams(obj.url);

      // If parameter is found, do advances search
      if (paramsInUrl.length) {
        for (let section of paramsInUrl) {
          for (let path of findObjectPaths(obj, section)) {
            matches.push(path);
          }
        }
      } else { // Else we add match
        matches.push(api);
      }
    }

    // Filter and return fitting matches
    return matches.filter(match => match.indexOf(key) === 0);
  }

  updateComponent(index, key, value) {
    let components = this.state.components.slice();
    set(components[index], key, value);
    this.setState(Object.assign({}, this.state, { components }));
  }

  updateApi(api, key, value) {
    let apis = Object.assign({}, this.state.apis);
    set(apis[api], key, value);
    this.setState(Object.assign({}, this.state, { apis }));
  }

  toggleEdit() {
    if (this.state.edit) {
      this.storage.set('components', this.state.components, true);
    }

    this.setState(Object.assign({}, this.state, {
      edit: !this.state.edit,
    }))
  }

  render() {
    let { components, edit, apis, offlineMode } = this.state;

    let componentElements = components.map((element, i) => {
      const Element = Template[element.template];
      element.css = element.css || `.${element.template} {
  /* Add custom styles here */
}`;

      let offline = Object.keys(apis).filter(api => apis[api].offline);

      return (
        <Section key={i}>
          <Element
            {...element}
            edit={edit}
            updateComponent={this.updateComponent}
            goOnline={this.goOnline.bind(this)}
            offline={offline}
            index={i}
          />
        </Section>
      );
    });

    let editApisElement = edit ? <ChangeAPIs apis={apis} updateApi={this.updateApi} /> : null;

    return (
      <div className={`App ${process.env.NODE_ENV === 'development' ? 'dev' : ''}`}>
        <Section>
          <Template.Header>
            <div className="triangle">
            </div>
            <button onClick={() => this.toggleEdit()}>Toggle edit mode</button>
            {offlineMode && <button onClick={() => this.goOnline()}>
              Gå online (Du er offline)
            </button>}
          </Template.Header>
        </Section>
        {editApisElement}
        {componentElements}
      </div>
    );
  }
}

export default App;
