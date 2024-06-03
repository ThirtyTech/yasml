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

function displayWarning(name: string | undefined) {
  const warnMessage = name
    ? `The context consumer of ${name} must be wrapped with its corresponding Provider`
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
  function useSelector<
    T extends (value: Value) => Partial<Value> & Record<string, unknown>
  >(selector: T): ReturnType<T>;
  function useSelector<T extends (keyof Value)[]>(
    ...keys: T | [(value: Value) => Partial<Value>]
  ): T | T["length"] extends 0 ? Value : Pick<Value, T[number]> {
    let innerKeys = [] as (keyof Value)[];
    let _cacheFuncResult = {} as Partial<Value>;
    const isFunction = typeof keys[0] === "function";
    if (typeof keys[0] === "function") {
      _cacheFuncResult = keys[0](_trappedState);
      innerKeys = Object.keys(_cacheFuncResult);
    } else {
      innerKeys = keys as (keyof Value)[];
    }
    const result = {} as { [key in T[number]]: Value[key] };

    if (innerKeys.length === 0) {
      contexts.forEach((context) => {
        const name = context.displayName as keyof Value;
        const value = useContext(context) as Value[keyof Value];
        if (isDev && value !== NO_PROVIDER) {
          if (value !== NO_PROVIDER) {
            _trappedState[name] = value;
          } else {
            displayWarning(context.displayName);
          }
        }
        result[name] = value !== NO_PROVIDER ? value : _trappedState[name];
      });
    } else {
      innerKeys.forEach((key) => {
        const context = contexts.get(key as T[number]) as Context<unknown>;
        if (context) {
          const value = useContext(context) as Value[T[number]];
          if (isDev && value !== NO_PROVIDER) {
            if (value !== NO_PROVIDER) {
              _trappedState[key] = value;
            } else {
              displayWarning(context.displayName);
            }
          }
          result[key] = value !== NO_PROVIDER ? value : _trappedState[key];
        } else if (isFunction) {
          result[key] = _cacheFuncResult[key] as Value[T[number]];
        } else if (typeof key === "string") {
          displayWarning(key);
        }
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
