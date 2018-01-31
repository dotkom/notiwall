import Component from 'inferno-component';
import './registerServiceWorker';
import './App.css';
import {
  Bus,
  Header,
  Vakter,
} from './components/templates';
import {
  Section,
} from './components/layout';

class App extends Component {
  render() {
    return (
      <div className={`App ${process.env.NODE_ENV === 'development' ? 'dev' : ''}`}>
        <Section>
          <Header>
            <div className="trianglee">
            </div>
          </Header>
        </Section>
        <Section>
          <Vakter />
        </Section>
        <Section>
          <Bus />
        </Section>
      </div>
    );
  }
}

export default App;
