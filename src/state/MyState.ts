import { useCallback, useState } from "react";
import yasml from "../lib/yasml";

function MyState() {
  const [counter, setCounter] = useState(0);
  const increment = useCallback(() => setCounter((v) => (v += 1)), []);
  return { counter, setCounter, increment };
}

export default yasml(MyState);
