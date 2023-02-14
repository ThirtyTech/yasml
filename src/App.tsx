import reactLogo from "./assets/react.svg";
import "./App.css";
import MyState from "./state/MyState";
import { CounterSetter } from "./CounterSetter";
import { CounterValue } from "./CounterValue";

function App() {
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://github.com/thirtytech/yasml" target="_blank">
          <img src="/yasml.png" className="logo" alt="Yasml logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + Yasml + React</h1>
      <MyState.Provider>
        <CounterSetter />
        <CounterValue />
      </MyState.Provider>
    </div>
  );
}

export default App;
