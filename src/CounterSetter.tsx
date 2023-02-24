import { useGlobalState } from "./state/MyState";

export function CounterSetter() {
  const { increment } = useGlobalState('increment');
  return <button onClick={() => increment()}>Increment</button>;
}
