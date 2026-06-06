import { useRef } from "react";
import { useSelector } from "./Context/MultiCounterSharedState";

interface PropertySelectorProps {
  /** Amount added to counterTwo on each click. */
  step?: number;
  /** Called with the new counterTwo value after each click. */
  onUpdate?: (count: number) => void;
}

export function PropertySelector({ step = 1, onUpdate }: PropertySelectorProps) {
  const { counterOne, update } = useSelector((state) => ({
    counterOne: state.counterOne,
    update: state.setCounterTwo,
  }));
  const ulRef = useRef<HTMLUListElement>(null);
  console.log("Initial Render. Will not render on click");
  return (
    <div>
      <button
        data-testid="property-selector-btn"
        onClick={() => {
          console.log("Click");
          update((prev) => {
            const next = prev + step;
            onUpdate?.(next);
            return next;
          });
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
