import { useState } from "react";
import yasml from "../lib/yasml";

function CustomStateFileName() {
  const [state, setState] = useState<number>(0);

  return { state, setState };
}

export const { Provider: CustomStateProvider, useSelector: useCustomState } =
  yasml(CustomStateFileName);
