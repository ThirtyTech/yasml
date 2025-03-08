import { useCustomState } from "./state/CustomState";

export function CounterCustom() {
  const { state } = useCustomState();
  return (
    <div>
      <p>CounterCustom: {state}</p>
    </div>
  );
}
