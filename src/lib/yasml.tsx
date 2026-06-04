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

  // Lazily create (or fetch) the context for a single state key. Centralising
  // creation here lets useSelector call useContext unconditionally for every
  // requested key, which keeps the hook order stable across renders even when a
  // key's context did not exist yet (Rules of Hooks).
  const getOrCreateContext = (key: keyof Value): Context<unknown> => {
    let context = contexts.get(key);
    if (!context) {
      context = createContext(NO_PROVIDER) as Context<unknown>;
      context.displayName = String(key);
      contexts.set(key, context);
      if (isDev) {
        const cache = _cachedContext.get(State.name);
        if (cache) {
          cache.set(key, context);
        } else {
          _cachedContext.set(State.name, new Map([[key, context]]));
        }
      }
    }
    return context;
  };

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
    // Function/custom selector: discover which source keys the selector reads
    // via a recording proxy, subscribe to exactly those contexts, then recompute
    // the result from the *live* context values. This keeps derived and renamed
    // values correct and re-renders the component when the values they depend on
    // change (previously the result was computed once from stale cached state).
    if (typeof keys[0] === "function") {
      const selector = keys[0] as (value: Value) => Partial<Value>;
      const readKeys = new Set<keyof Value>();
      const probe = new Proxy(
        _cachedState as Record<string | symbol, unknown>,
        {
          get(target, prop) {
            readKeys.add(prop as keyof Value);
            return target[prop];
          },
        }
      );
      // Run once against the cached state purely to record dependencies.
      selector(probe as unknown as Value);

      const live = {} as Value;
      readKeys.forEach((key) => {
        const context = contexts.get(key);
        if (!context) return;
        const value = useContext(context) as Value[keyof Value];

        if (isDev && value === NO_PROVIDER) {
          displayWarning(context.displayName);
        }

        if (value === NO_PROVIDER && key in _cachedState) {
          // Hot-reload / missing-provider fallback to last known value.
          live[key] = _cachedState[key];
        } else {
          live[key] = value;
          if (isDev && value !== NO_PROVIDER) {
            _cachedState[key] = value;
          }
        }
      });

      // Recompute from the live values so derived/renamed results are correct.
      return selector(live) as unknown as Pick<Value, T[number]>;
    }

    const contextKeys =
      keys.length === 0
        ? (Array.from(contexts.keys()) as (keyof Value)[])
        : (keys as (keyof Value)[]);
    const result = {} as { [key in T[number]]: Value[key] };

    contextKeys.forEach((key) => {
      // Always resolve to a real context so useContext is called for every
      // requested key on every render (stable hook order). A bogus key still
      // surfaces via the NO_PROVIDER warning below.
      const context = getOrCreateContext(key as keyof Value);
      const value = useContext(context) as Value[T[number]];

      if (isDev && value === NO_PROVIDER) {
        displayWarning(context.displayName);
      }

      if (value === NO_PROVIDER && key in _cachedState) {
        // Handles condition during hot reload where value is lost
        result[key] = _cachedState[key];
      } else {
        result[key] = value;
        // Stores last known value from context. Used for not reloading
        if (isDev && value !== NO_PROVIDER) {
          _cachedState[key] = value;
        }
      }
    });

    return result;
  }

  return {
    Provider,
    useSelector,
  };
}

export default yasml;
