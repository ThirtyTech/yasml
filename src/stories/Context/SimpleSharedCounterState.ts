import { useCallback, useState } from "react"
import yasml from "../../lib/yasml";

const SimpleSharedCounterState = () => {

  const [counter, setCounter] = useState(0);

  return {
    counter,
    setCounter
  }
}

export const { Provider, useSelector } = yasml(SimpleSharedCounterState);
