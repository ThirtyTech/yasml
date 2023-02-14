import MyState from "./state/MyState";

export function CounterValue() {
  const { counter } = MyState.useSelector("counter");
  return <div>{counter}</div>;
}
