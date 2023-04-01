import { useGlobalState } from "./state/MyState";

export function CounterSetter() {
  const { increment } = useGlobalState('increment');
  const state = useGlobalState((state) => ({
    test: state.counter * 2,
    rawr: "goes the lion",
  }));
  return <button onClick={() => increment()}>Increment {state.test}</button>;
}
