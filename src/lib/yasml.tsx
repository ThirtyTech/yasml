import React, { Context, createContext, useEffect, useState } from "react";
import { useContext } from "react";

const isDev = process.env.NODE_ENV !== "production";

const NO_PROVIDER = {};

type StateResult = {
  [key: string]: unknown;
} & object;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function displayWarning(context: React.Context<any>) {
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
  const Provider: React.FC<React.PropsWithChildren<Props>> = ({
    children,
    ...props
  }) => {
    const value = State(props as Props);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
      Object.keys(value)
        .reverse()
        .forEach((key) => {
          const context = createContext(NO_PROVIDER) as Context<unknown>;
          context.displayName = key;
          contexts.set(key as keyof Value, context);
        });
      setInitialized(true);
    }, []);

    if (!initialized) {
      return null;
    }

    let element = children as React.ReactElement;

    Object.keys(value)
      .reverse()
      .forEach((key) => {
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
        const context = contexts.get(key as T[number]) as Context<T[number]>;
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
