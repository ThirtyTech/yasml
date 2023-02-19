import MyState from "./state/MyState";

export function CounterValue() {
  const { counter } = MyState.useSelector();
  return <div>{counter}</div>;
}
