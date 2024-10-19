import { useCallback, useMemo, useState } from "react";
import yasml from "../lib/yasml";

function MyState() {
  const [counter, setCounter] = useState(0);
  const increment = useCallback(() => setCounter((v) => (v += 1)), []);
  return useMemo(
    () => ({ counter, setCounter, increment }),
    [counter, setCounter, increment]
  );
}


export const { Provider: GlobalStateProvider, useSelector: useGlobalState } =
  yasml(MyState);
