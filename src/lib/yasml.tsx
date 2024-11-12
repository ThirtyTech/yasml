import {
  Context,
  createContext,
  useContext,
  FC,
  PropsWithChildren,
  ReactElement,
} from "react";

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

const _cachedContext = new Map<string, Map<unknown, Context<unknown>>>();
function yasml<Props, Value extends StateResult>(
  State: (props: Props) => Value
) {
  const contexts =
    isDev && _cachedContext.get(State.name)
      ? (_cachedContext.get(State.name) as Map<keyof Value, Context<unknown>>)
      : new Map<keyof Value, Context<unknown>>();
  let _cachedState: Value = {} as Value;
  const Provider: FC<PropsWithChildren<Props>> = ({ children, ...props }) => {
    let element = children as ReactElement;
    const stateValues = State(props as Props);
    _cachedState = stateValues;
    if (typeof stateValues !== "object") {
      throw new Error("The state must return an object.");
    }

    Object.keys(stateValues)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        if (!contexts.has(key as keyof Value)) {
          const context = createContext(NO_PROVIDER) as Context<unknown>;
          context.displayName = key;
          contexts.set(key as keyof Value, context);
          if (isDev) {
            const cache = _cachedContext.get(State.name);
            if (cache) {
              cache.set(key, context);
            } else {
              _cachedContext.set(State.name, new Map([[key, context]]));
            }
          }
        }
        const context = contexts.get(key as keyof Value);
        if (context) {
          element = (
            <context.Provider value={stateValues[key]}>
              {element}
            </context.Provider>
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
    let contextKeys = [] as (keyof Value)[];
    let _cacheFuncResult = {} as Partial<Value>;
    const isFunction = typeof keys[0] === "function";
    if (typeof keys[0] === "function") {
      _cacheFuncResult = keys[0](_cachedState);
      contextKeys = Object.keys(_cacheFuncResult);
    } else {
      contextKeys = keys as (keyof Value)[];
    }
    const result = {} as { [key in T[number]]: Value[key] };

    if (contextKeys.length === 0) {
      contexts.forEach((context) => {
        const name = context.displayName as keyof Value;
        const value = useContext(context) as Value[keyof Value];

        if (isDev && value === NO_PROVIDER) {
          displayWarning(context.displayName);
        }

        // Stores last known value from context. Used for not reloading
        if (isDev && value !== NO_PROVIDER) {
          _cachedState[name] = value;
        }
        result[name] = value;

        // Handles condition during hot reload where value is lost
        if (isDev && value === NO_PROVIDER && name in _cachedState) {
          result[name] = _cachedState[name];
        }
      });
    } else {
      contextKeys.forEach((key) => {
        const context = contexts.get(key as T[number]) as Context<unknown>;

        if (context) {
          const value = useContext(context) as Value[T[number]];

          if (isDev && value === NO_PROVIDER) {
            displayWarning(context.displayName);
          }

          // Stores last known value from context. Used for not reloading
          if (isDev && value !== NO_PROVIDER) {
            _cachedState[key] = value;
          }

          result[key] = value;

          // Handles condition during hot reload where value is lost
          if (isDev && value === NO_PROVIDER && key in _cachedState) {
            result[key] = _cachedState[key];
          }
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
