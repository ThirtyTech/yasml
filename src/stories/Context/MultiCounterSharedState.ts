import { useState } from "react"
import yasml from "../../lib/yasml";

const MultiCounterSharedState = () => {

  const [counterOne, setCounterOne] = useState(0);
  const [counterTwo, setCounterTwo] = useState(0);

  return {
    counterOne,
    counterTwo,
    setCounterOne,
    setCounterTwo
  }
}

export const { Provider, useSelector } = yasml(MultiCounterSharedState);
