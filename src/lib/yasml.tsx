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
  const Provider: FC<PropsWithChildren<Props>> = ({ children, ...props }) => {
    let element = children as ReactElement;
    const value = State(props as Props);

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

  function useSelector<T extends Array<keyof Value>>(
    ...keys: T
  ): T["length"] extends 0 ? Value : Pick<Value, T[number]> {
    const result = {} as { [key in T[number]]: Value[key] };

    if (keys.length === 0) {
      contexts.forEach((context) => {
        const value = useContext(context) as Value[keyof Value];
        if (isDev && value === NO_PROVIDER) {
          displayWarning(context);
        }
        const name = context.displayName as keyof Value;
        result[name] = value;
      });
    } else {
      keys.forEach((key) => {
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
