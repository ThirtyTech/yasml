import {
  Context,
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
} from "react";
import { useContext } from "react";

const isDev = process.env.NODE_ENV !== "production";

const NO_PROVIDER = {};

type StateResult = {
  [key: string]: unknown;
} & object;

function displayWarning(context: Context<unknown>) {
  const warnMessage = context.displayName
    ? `The context consumer of ${context.displayName} must be wrapped with its corresponding Provider`
    : "Component must be wrapped with Provider.";
  // eslint-disable-next-line no-console
  console.warn(warnMessage);
}

function yasml<Props, Value extends StateResult>(
  State: (props: Props) => Value
) {
  const contexts = new Map<keyof Value, Context<unknown>>();
  let _trappedState: Value = {} as Value;
  const Provider: FC<PropsWithChildren<Props>> = ({ children, ...props }) => {
    let element = children as ReactElement;
    const value = State(props as Props);
    _trappedState = value;
    if (typeof value !== "object") {
      throw new Error("The state must return an object.");
    }

    Object.keys(value)
      .reverse()
      .forEach((key) => {
        if (!contexts.has(key as keyof Value)) {
          const context = createContext(NO_PROVIDER) as Context<unknown>;
          context.displayName = key;
          contexts.set(key as keyof Value, context);
        }
        const context = contexts.get(key as keyof Value);
        if (context) {
          element = (
            <context.Provider value={value[key]}>{element}</context.Provider>
          );
        }
      });

    return element;
  };

  if (isDev && State.name) {
    Provider.displayName = State.name;
  }

  function useSelector<T extends (keyof Value)[]>(
    ...keys: T
    ): T["length"] extends 0 ? Value : Pick<Value, T[number]>;
    function useSelector<T extends (value: Value) => Partial<Value>>(
      selector: T
    ): ReturnType<T>;
  function useSelector<T extends (keyof Value)[]>(
    ...keys: T | [(value: Value) => Partial<Value>]
  ): T | T["length"] extends 0 ? Value : Pick<Value, T[number]> {
    let innerKeys = [] as (keyof Value)[];
    if (typeof keys[0] === "function") {
      innerKeys = Object.keys(keys[0](_trappedState));
    } else {
      innerKeys;
    }
    const result = {} as { [key in T[number]]: Value[key] };

    if (innerKeys.length === 0) {
      contexts.forEach((context) => {
        const value = useContext(context) as Value[keyof Value];
        if (isDev && value === NO_PROVIDER) {
          displayWarning(context);
        }
        const name = context.displayName as keyof Value;
        result[name] = value;
      });
    } else {
      innerKeys.forEach((key) => {
        const context = contexts.get(key as T[number]) as Context<unknown>;
        const value = useContext(context) as Value[T[number]];
        if (isDev && value === NO_PROVIDER) {
          displayWarning(context);
        }
        result[key] = value;
      });
    }

    return result;
  }

  return {
    Provider,
    useSelector,
  };
}

export default yasml;
