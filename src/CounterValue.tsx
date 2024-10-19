import { useGlobalState } from "./state/MyState.state";

export function CounterValue() {
  const { counter } = useGlobalState();
  return <div>{counter}</div>;
}
