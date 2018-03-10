import React, { Component } from 'react';
import './App.css';
import * as Template from './components/templates';
import { Section } from './components/layout';
import { API } from './api';
import { API_URL } from './constants';

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
    };

    let components = [
      {
        template: 'Vakter',
        title: 'Vakts',
      },
      {
        template: 'Bus',
        title: 'This is bus',
      },
      {
        apis: [ 'affiliation', 'coffeePots' ],
        template: 'Coffee',
        title: 'Kaffe ble laget',
        css: `
          .Coffee { background-color: red; }
        `,
      },
      {
        template: 'Vakter',
        title: 'Vaktsss',
      },
    ];

    this.state = {
      apis,
      components,
    };

    this.startAPI('affiliation');
  }
  
  startAPI(api) {
    this.fetchData(api);

    let interval = this.state.apis[api].interval;

    if (interval && interval > 0) {
      setInterval(() => {
        this.fetchData(api);
      }, interval * 1000);
    }
  }

  fetchData(api) {
    API.getRequest(this.state.apis[api].url, data => {
      let components = this.state.components.slice();

      for (let component of components) {
        if ('apis' in component && component.apis.indexOf(api) !== -1) {
          component.data = data;
        }
      }

      this.setState(Object.assign({}, this.state, {
        components: components,
      }));
    }, console.log);
  }

  render() {
    let componentElements = this.state.components.map(element => {
      const Element = Template[element.template];

      return (
        <Section>
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
