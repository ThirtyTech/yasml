import MyState from "./state/MyState";

export function CounterSetter() {
  const { increment } = MyState.useSelector("increment");
  return <button onClick={() => increment()}>Increment</button>;
}
