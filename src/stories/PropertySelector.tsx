import { useSelector } from "./Context/MultiCounterSharedState";

export function PropertySelector() {
  const { counterOne, update } = useSelector((state) => ({
    counterOne: state.counterOne,
    update: state.setCounterTwo,
  }));
  console.log("Initial Render. Will not render on click");
  return (
    <div>
      <button
        onClick={() => {
          console.log("Click");
          update((prev) => prev + 1);
        }}
      >
        {counterOne.toString()}
      </button>
    </div>
  );
}
