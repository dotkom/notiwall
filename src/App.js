import { version } from 'inferno';
import Component from 'inferno-component';
import './registerServiceWorker';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="head">
          <h2>Notiwall v2</h2>
        </header>
        <main className="content">

        </main>
      </div>
    );
  }
}

export default App;
