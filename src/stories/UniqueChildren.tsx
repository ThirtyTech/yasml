import { useEffect, useRef } from "react";
import { useSelector } from "./Context/MultiCounterSharedState";

export function UniqueChildren() {
  return <div>
    <div>
      <ChildOne />
    </div>
    <div style={{ marginTop: 8 }}>
      <ChildTwo />
    </div>
  </div>
}

function ChildOne() {
  const { counterOne, setCounterOne } = useSelector('counterOne', 'setCounterOne');
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const li = document.createElement('li')
    li.innerHTML = `[ChildOne] Rendered ${new Date().getTime()}`;
    ulRef.current?.appendChild(li);
  });

  return <>
    <button data-testid="child-one-btn" onClick={() => setCounterOne(prev => prev + 1)}>Child One {counterOne}</button>
    <ul data-testid="child-one-results" ref={ulRef}></ul>
  </>
}

function ChildTwo() {
  const { counterTwo, setCounterTwo } = useSelector('counterTwo', 'setCounterTwo');
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const li = document.createElement('li');
    li.innerHTML = `[ChildTwo] Rendered ${new Date().getTime()}`;
    ulRef.current?.appendChild(li);
  })

  return <>
    <button data-testid="child-two-btn" onClick={() => setCounterTwo(prev => prev + 1)}>Child Two {counterTwo}</button>
    <ul data-testid="child-two-results" ref={ulRef}></ul>
  </>
}