
import { useEffect, useRef } from 'react';
import { useSelector } from './Context/SimpleSharedCounterState';

interface BasicProps {
  /** Text shown before the counter value. */
  label?: string;
  /** Amount added to the counter on each click. */
  step?: number;
  /** Called with the new counter value after each click. */
  onChange?: (count: number) => void;
}

export function Basic({ label = 'Basic', step = 1, onChange }: BasicProps) {
  const { counter, setCounter } = useSelector();
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const li = document.createElement('li');
    li.innerHTML = `[Basic] Rendered ${new Date().getTime()}`;
    ulRef.current?.appendChild(li);
  });

  return <>
    <button
      data-testid="basic-btn"
      onClick={() => setCounter(prev => {
        const next = prev + step;
        onChange?.(next);
        return next;
      })}
    >{label} {counter}</button>
    <ul data-testid="basic-results" ref={ulRef}></ul>
  </>
}
