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
      <div className="App">
        <Header>
          <div className="triangle">
          </div>
        </Header>
        <Vakter />
        <Section>
          <Bus />
        </Section>
      </div>
    );
  }
}

export default App;
