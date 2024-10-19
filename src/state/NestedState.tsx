import { useState } from "react";
import yasml from "../lib/yasml";

function NestedState() {
  const [state, setState] = useState(0);
  const increment = () => setState(state + 1);
  return {
    state,
    increment,
  };
}

export const { Provider: NestedStateProvider, useSelector: useNestedState } =
  yasml(NestedState);
