import { useGlobalState } from "./state/MyState";

export function CounterValue() {
  const { counter } = useGlobalState("counter");
  return <div>{counter}</div>;
}
