import { useGlobalState } from "./state/MyState";

export function CounterSetter() {
  const { increment } = useGlobalState("increment", "counter");
  const state = useGlobalState((state) => ({ counter: state.counter }));
  return <button onClick={() => increment()}>Increment</button>;
}
