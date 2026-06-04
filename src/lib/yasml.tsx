import {
  Context,
  createContext,
  useContext,
  useRef,
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

// Dev-only cache so contexts survive hot reloads. Keyed by the State function
// reference (not its name) to avoid collisions between same-named or anonymous
// hooks, and so entries can be garbage collected once the factory is gone.
const _cachedContext = new WeakMap<object, Map<unknown, Context<unknown>>>();
function yasml<Props, Value extends StateResult>(
  State: (props: Props) => Value
) {
  const contexts = (
    isDev && _cachedContext.has(State)
      ? _cachedContext.get(State)
      : new Map<keyof Value, Context<unknown>>()
  ) as Map<keyof Value, Context<unknown>>;
  if (isDev) {
    // Register the live map itself so the Provider and useSelector keep writing
    // through to the cached instance across hot reloads.
    _cachedContext.set(State, contexts as Map<unknown, Context<unknown>>);
  }
  // Best-effort snapshot of the most recent state, shared by every Provider
  // instance of this factory. It is NOT a source of live values — those always
  // come from useContext. It is only used to (a) seed the dependency-tracking
  // proxy for function selectors so traversal does not throw, and (b) provide a
  // dev-only fallback when a provider is missing during hot reload. Because it
  // never feeds the rendered output in production, the fact that it reflects the
  // most-recently-rendered instance is harmless. Keys are merged (not replaced)
  // so a probe sees the union of keys across concurrently mounted providers.
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
      // `contexts` is itself the dev-cached map, so this also persists across
      // hot reloads without a separate registration step.
      contexts.set(key, context);
    }
    return context;
  };

  const Provider: FC<PropsWithChildren<Props>> = ({ children, ...props }) => {
    const orderRef = useRef<string[]>([]);
    const stateValues = State(props as Props);
    // Validate before using the result anywhere (typeof null === "object", so
    // null must be rejected explicitly).
    if (stateValues === null || typeof stateValues !== "object") {
      throw new Error("The state must return an object.");
    }
    let element = children as ReactElement;
    _cachedState = { ..._cachedState, ...stateValues };

    // The provider nesting order must be stable across renders, but the sorted
    // key list rarely changes. Recompute it only when the set of keys changes
    // instead of re-sorting on every render. A plain comparator is sufficient
    // (and cheaper than locale-aware collation) since we only need determinism.
    const keysList = Object.keys(stateValues);
    if (
      orderRef.current.length !== keysList.length ||
      keysList.some((k) => !orderRef.current.includes(k))
    ) {
      orderRef.current = [...keysList].sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0
      );
    }

    // Keys are unknown until State() runs, so contexts are discovered on the
    // first render. getOrCreateContext is idempotent, so this is cheap on
    // subsequent renders and shares one creation path with useSelector.
    orderRef.current.forEach((key) => {
      const context = getOrCreateContext(key as keyof Value);
      element = (
        <context.Provider value={stateValues[key]}>
          {element}
        </context.Provider>
      );
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

        if (isDev && value === NO_PROVIDER && key in _cachedState) {
          // Dev-only hot-reload fallback to last known value.
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
        ? Array.from(contexts.keys())
        : (keys as (keyof Value)[]);
    const result = {} as { [key in T[number]]: Value[key] };

    contextKeys.forEach((key) => {
      // Always resolve to a real context so useContext is called for every
      // requested key on every render (stable hook order). A bogus key still
      // surfaces via the NO_PROVIDER warning below.
      const context = getOrCreateContext(key);
      const value = useContext(context) as Value[T[number]];

      if (isDev && value === NO_PROVIDER) {
        displayWarning(context.displayName);
      }

      if (isDev && value === NO_PROVIDER && key in _cachedState) {
        // Dev-only hot-reload fallback when the context value is lost
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
