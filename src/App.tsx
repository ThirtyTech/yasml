import reactLogo from "./assets/react.svg";
import "./App.css";
import { GlobalStateProvider } from "./state/MyState.state";
import { CounterSetter } from "./CounterSetter";
import { CounterValue } from "./CounterValue";
import { useState } from "react";

function App() {
  const [version, setVersion] = useState(0);
  return (
    <GlobalStateProvider key={version}>
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
        <h1 onClick={() => setVersion((v) => (v += 1))}>
          Vite + Yasml + React
        </h1>
        <CounterSetter />
        <CounterValue />
      </div>
    </GlobalStateProvider>
  );
}

export default App;
