import Component from 'inferno-component';
import './registerServiceWorker';
import './App.css';
import * as Template from './components/templates';
import { Section } from './components/layout';

class App extends Component {
  constructor() {
    super();

    this.state = {
      components: ['Vakter', 'Bus', 'Vakter'],
    };
  }

  render() {
    let componentElements = this.state.components.map(e => {
      const Element = Template[e];

      return (
        <Section>
          <Element />
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
