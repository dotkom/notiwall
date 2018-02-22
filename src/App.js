import Component from 'inferno-component';
import './registerServiceWorker';
import './App.css';
import * as Template from './components/templates';
import { Section } from './components/layout';
import { API } from './api';
import { API_URL } from './constants';

class App extends Component {
  constructor() {
    super();

    this.state = {
      components: [
        {
          template: 'Vakter',
          title: 'Vakts',
        },
        {
          template: 'Bus',
          title: 'This is bus',
        },
        {
          template: 'Coffee',
          title: 'Coffee was made',
          coffeeTime: 0,
        },
        {
          template: 'Vakter',
          title: 'Vaktsss',
        },
      ],
      noe: 2213
    };

    // Fetch new data each 10th second
    this.fetchData();
    setInterval(() => {
      this.fetchData();
    }, 10000);
  }

  fetchData () {
    API.getRequest(`${API_URL}/affiliation/online`, data => {
      let components = this.state.components.slice();
      components[2].coffeeTime = new Date(data.coffee.date).getTime();

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
