import { useSelector } from './Context/SimpleSharedCounterState';

export function CustomSelector() {
  const { counter, increment, counterMultiplier } = useSelector(state => ({
    increment: () => state.setCounter(prev => prev + 1),
    counter: state.counter,
    counterMultiplier: `$${(state.counter * 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  }));
  return <div>
    <div>
      <button onClick={() => increment()}>Increment</button>
      <div>Counter: {counter}</div>
      <div>Counter Multiplier: {counterMultiplier}</div>
    </div>
  </div>;
}
