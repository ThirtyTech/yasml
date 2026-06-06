import { useSelector } from './Context/SimpleSharedCounterState';

export function CustomSelector() {
  const { counter, increment, counterMultiplier } = useSelector(state => ({
    increment: () => state.setCounter(prev => prev + 1),
    counter: state.counter,
    counterMultiplier: `$${(state.counter * 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  }));
  return <div>
    <div>
      <button data-testid="increment-btn" onClick={() => increment()}>Increment</button>
      <div data-testid="counter">Counter: {counter}</div>
      <div data-testid="counter-multiplier">Counter Multiplier: {counterMultiplier}</div>
    </div>
  </div>;
}
