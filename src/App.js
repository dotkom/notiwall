import { version } from 'inferno';
import Component from 'inferno-component';
import './registerServiceWorker';
import './App.css';
import Header from './components/Header';
import Bus from './components/Bus';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header>
          <h2>Notiwall v2</h2>
          <div className="triangle">
          </div>
        </Header>
        <Bus />
      </div>
    );
  }
}

export default App;
