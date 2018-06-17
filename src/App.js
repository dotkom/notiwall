import React, { Component } from 'react';
import { get, set } from 'object-path';
import Style from 'style-it';

import './App.css';
import { BasicSettings } from './components/forms';
import { Section } from './components/layout';
import * as Template from './components/templates';
import * as Styles from './styles';
import {
  API,
  Storage,
  getStringParams,
  findObjectPaths,
  injectValuesIntoString,
} from './utils';
import {
  defaultAffiliationSettings,
  defaultApis,
  defaultSettings,
  defaultTranslations,
} from './defaults';

class App extends Component {
  constructor() {
    super();

    this.storage = new Storage();
    this.intervals = {};

    let {
      apis,
      settings,
      translations,
      affiliationSettings,
    } = this.storage.merge({

      // Get all the APIs
      apis: defaultApis,

      // Get the global settings
      settings: defaultSettings,

      // Get all translations, such that glos = Gløshaugen
      translations: defaultTranslations,

      // Get all the affiliation settings
      affiliationSettings: defaultAffiliationSettings,
    }, true);

    // Get components from the given affiliation in the settings
    let components = affiliationSettings[settings.affiliation].components;

    for (let root in apis) {
      delete apis[root].fails;
      delete apis[root].offline;
    }

    this.state = {
      offlineMode: !navigator.onLine,
      apis,
      components,
      settings,
      translations,
      edit: false,
    };

    this.updateComponent = this.updateComponent.bind(this);
    this.updateApi = this.updateApi.bind(this);
    this.getApis = this.getApis.bind(this);
    this.translate = this.translate.bind(this);

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
    const components = this.state.components.slice();
    const object = api + (deep ? '.' + deep : '');

    let apiIsInUse = false;

    for (const component of components) {
      if ('apis' in component) {
        for (const assignedTo in component.apis) {
          let assignedToValue = component.apis[assignedTo];

          if ('injectInto' in component) {
            if (component.injectInto.includes(`apis.${assignedTo}`)) {
              assignedToValue = injectValuesIntoString(
                component.apis[assignedTo],
                this.state.settings
              );
            }
          }

          const [ apiPath ] = assignedToValue.split(':');

          if (apiPath === object) {
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

    const callback = data => {
      let components = this.state.components.slice();

      if (deep) {
        api += '.' + deep;
      }

      for (let component of components) {
        if ('apis' in component) {
          for (const assignedTo in component.apis) {
            const injectedSettingsIntoPath = injectValuesIntoString(
              component.apis[assignedTo],
              this.state.settings
            );
            const [ apiPath, deepPath ] = injectedSettingsIntoPath.split(':');

            if (apiPath === api) {
              set(component, assignedTo, get(data, deepPath));
            }
          }
        }
      }

      this.setState(Object.assign({}, this.state, { components }));
    };

    const onError = () => {
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
    };

    // Execute [[scripts]] inside the url and replace
    // the fields with the data
    const urlCopy = (url || this.state.apis[api].url).slice();
    const urlSripts = getStringParams(urlCopy, '[[', ']]');
    let urlExecuted = urlCopy.slice();
    for (const urlScript of urlSripts) {
      let value = '';
      switch (urlScript) {
        case 'now':
        value = new Date().toISOString();
        break;

        default:
        value = ''; //eval(urlScript); // I know, this is no good.
        break;
      }
      urlExecuted = urlExecuted.replace(`[[${urlScript}]]`, value);
    }

    if (this.state.apis[api].method === 'POST') {
      let [ urlPart, body ] = urlExecuted.split('>>');
      let req = this.state.apis[api].req || {};
      req.body = body;
      API.postRequest(urlPart, req, callback, onError);
    } else {
      API.getRequest(urlExecuted, callback, onError);
    }
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

  getApis() {
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
    return matches;
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

  translate(word) {
    if (word in this.state.translations) {
      return this.state.translations[word];
    }

    return word;
  }

  toggleEdit() {
    if (this.state.edit) {
      this.storage.set('components', this.state.components, true);
    }

    this.setState(Object.assign({}, this.state, {
      edit: !this.state.edit,
    }));
  }

  clearStorage() {
    try {
      localStorage.clear();
    } catch (ex) { }
  }

  getStyle(group) {
    return group in Styles ? Styles[group] : '';
  }

  render() {
    let { components, edit, apis, offlineMode } = this.state;
    let apiList = this.getApis();

    let componentElements = components.map((element, i) => {
      const Element = Template[element.template];
      element = Object.assign({}, element);
      element.css = element.css || `.${element.template} {
  /* Add custom styles here */
}`;
      element.size = element.size || 1;

      if ('injectInto' in element) {
        for (let key of element.injectInto) {
          const value = get(element, key);
          const newValue = injectValuesIntoString(value, this.state.settings);
          set(element, key, newValue);
        }
      }

      let offline = Object.keys(apis).filter(api => apis[api].offline);

      return (
        <Section key={i} size={element.size}>
          <Element
            {...element}
            edit={edit}
            apiList={apiList}
            translate={this.translate}
            updateComponent={this.updateComponent}
            goOnline={this.goOnline.bind(this)}
            offline={offline}
            index={i}
          />
        </Section>
      );
    });

    let editSettingsElement = edit
    //  ? <ChangeAPIs apis={apis} updateApi={this.updateApi} />
      ? <BasicSettings
           apis={apis}
           updateApi={this.updateApi}
           translate={this.translate}
        />
      : null;

    return (
      <Style>
        {this.getStyle('Online')}
        <div className={`App ${process.env.NODE_ENV === 'development' ? 'dev' : ''}`}>
          <Section style={{ minHeight: 20, minWidth:'100%' }}>
            <Template.Header css={', { padding: 0; height: 0 }'}>
              <div>
                <button onClick={() => this.toggleEdit()}>Toggle edit mode</button>
                <button onClick={() => this.clearStorage()}>Reset app</button>
              </div>
              {offlineMode && <button onClick={() => this.goOnline()}>
                Gå online (Du er offline)
              </button>}
            </Template.Header>
          </Section>
          {editSettingsElement || componentElements}
        </div>
      </Style>
    );
  }
}

export default App;
