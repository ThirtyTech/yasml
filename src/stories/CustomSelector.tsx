import { useSelector } from './Context/SimpleSharedCounterState';

interface CustomSelectorProps {
  /** Text shown on the increment button. */
  label?: string;
  /** Rate the counter is multiplied by for the derived display value. */
  multiplier?: number;
  /** Called with the new counter value after each increment. */
  onIncrement?: (count: number) => void;
}

export function CustomSelector({ label = 'Increment', multiplier = 2, onIncrement }: CustomSelectorProps) {
  const { counter, increment, counterMultiplier } = useSelector(state => ({
    increment: () => state.setCounter(prev => {
      const next = prev + 1;
      onIncrement?.(next);
      return next;
    }),
    counter: state.counter,
    counterMultiplier: `$${(state.counter * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  }));
  return <div>
    <div>
      <button data-testid="increment-btn" onClick={() => increment()}>{label}</button>
      <div data-testid="counter">Counter: {counter}</div>
      <div data-testid="counter-multiplier">Counter Multiplier: {counterMultiplier}</div>
    </div>
  </div>;
}
