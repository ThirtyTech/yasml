import { useGlobalState } from "./state/MyState";

export function CounterValue() {
  const { counter } = useGlobalState();
  return <div>{counter}</div>;
}
