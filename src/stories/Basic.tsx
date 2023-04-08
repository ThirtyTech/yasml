
import { useEffect, useRef } from 'react';
import { useSelector } from './Context/SimpleSharedCounterState';

export function Basic() {
  const { counter, setCounter } = useSelector();
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const li = document.createElement('li');
    li.innerHTML = '[Basic] Rendered ' + new Date().getTime();
    ulRef.current?.appendChild(li);
  });

  return <>
    <button onClick={() => setCounter(prev => prev + 1)}>Basic {counter}</button>
    <ul ref={ulRef}></ul>
  </>
}
