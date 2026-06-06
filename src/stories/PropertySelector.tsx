import { useRef } from "react";
import { useSelector } from "./Context/MultiCounterSharedState";

export function PropertySelector() {
  const { counterOne, update } = useSelector((state) => ({
    counterOne: state.counterOne,
    update: state.setCounterTwo,
  }));
  const ulRef = useRef<HTMLUListElement>(null);
  console.log("Initial Render. Will not render on click");
  return (
    <div>
      <h3>Note: Clicking the button will not trigger a re-render. Update sets <code>counterTwo</code> not <code>counterOne</code>.</h3>
      <button
        data-testid="property-selector-btn"
        onClick={() => {
          console.log("Click");
          update((prev) => prev + 1);
          const li = document.createElement("li");
          li.innerHTML = `[PropertySelector] Clicked ${new Date().getTime()}`;
          ulRef.current?.appendChild(li);
        }}
      >
        {counterOne.toString()}
      </button>
      <ul data-testid="property-selector-results" ref={ulRef}></ul>
    </div>
  );
}
