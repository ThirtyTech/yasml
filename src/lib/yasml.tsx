import {
  Context,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  FC,
  PropsWithChildren,
  ReactElement,
} from "react";

const isDev = process.env.NODE_ENV !== "production";

const NO_PROVIDER = {};

// Distinct from NO_PROVIDER: marks a key the global store has never published,
// so useSelector can tell "no global Host value yet" apart from "no Provider".
const UNSET = {};

type StateResult = {
  [key: string]: unknown;
} & object;

type YasmlOptions = {
  // When false, this factory does NOT register a global Host with <YasmlRoot>.
  // Consumers then require an explicit <Provider> (the pre-global behavior), and
  // no global instance is mounted — use this for containers you always provide
  // explicitly (e.g. ones with side-effecting effects or required props).
  global?: boolean;
};

function displayWarning(name: string | undefined) {
  const warnMessage = name
    ? `The context consumer of ${name} must be wrapped with its corresponding Provider`
    : "Component must be wrapped with Provider.";
  console.warn(warnMessage);
}

// ---------------------------------------------------------------------------
// Global (provider-less) Host registry.
//
// A factory that opts into a global default registers a Host here. <YasmlRoot>
// renders these Hosts as SIBLINGS of your app — never ancestors. That matters:
// React cannot reparent, so if the global instances were nested *around* the
// app, a factory registering late (e.g. when a code-split chunk loads) would
// force a new wrapper into the chain and remount the whole app. As siblings,
// a late registration just mounts one more Host next to the app, leaving the
// app's tree untouched. Each Host runs its State() and publishes values into
// that factory's store; consumers read the store as a fallback (see below).
// ---------------------------------------------------------------------------
type GlobalHost = { id: number; Host: FC };
let _nextHostId = 0;
const _globalHosts: GlobalHost[] = [];
const _globalHostListeners = new Set<() => void>();
// Cached snapshot for useSyncExternalStore: a stable reference until the set of
// hosts changes (required so getSnapshot does not loop).
let _globalHostsSnapshot: GlobalHost[] = _globalHosts;
// Dedupe registration by State reference so a module imported twice (or a
// factory shared across entry points) contributes a single Host.
const _registeredStates = new WeakSet<object>();

function registerGlobalHost(State: object, Host: FC) {
  if (_registeredStates.has(State)) return;
  _registeredStates.add(State);
  _globalHosts.push({ id: _nextHostId++, Host });
  _globalHostsSnapshot = _globalHosts.slice();
  _globalHostListeners.forEach((listener) => listener());
}

function subscribeGlobalHosts(listener: () => void) {
  _globalHostListeners.add(listener);
  return () => {
    _globalHostListeners.delete(listener);
  };
}

function getGlobalHostsSnapshot() {
  return _globalHostsSnapshot;
}

const YasmlGlobalHosts: FC = () => {
  // Subscribing here is what makes code-splitting work: when a lazy chunk loads
  // and its factory registers a Host, this component re-renders and mounts it.
  const hosts = useSyncExternalStore(
    subscribeGlobalHosts,
    getGlobalHostsSnapshot,
    getGlobalHostsSnapshot,
  );
  return (
    <>
      {hosts.map(({ id, Host }) => (
        <Host key={id} />
      ))}
    </>
  );
};

// Mount once at your app root. Every factory created with `global` left on gets
// a default instance via the sibling Hosts above; an explicit <Provider> deeper
// in the tree still wins for its subtree (see useSelector resolution). Exposed
// as a property of the default export (`yasml.YasmlRoot`) to keep the package's
// single callable default export intact for CommonJS/UMD consumers.
const YasmlRoot: FC<PropsWithChildren> = ({ children }) => (
  <>
    <YasmlGlobalHosts />
    {children}
  </>
);

// Dev-only cache so contexts survive hot reloads. Keyed by the State function
// reference (not its name) to avoid collisions between same-named or anonymous
// hooks, and so entries can be garbage collected once the factory is gone.
const _cachedContext = new WeakMap<object, Map<unknown, Context<unknown>>>();
function yasml<Props, Value extends StateResult>(
  State: (props: Props) => Value,
  options: YasmlOptions = {},
) {
  const { global: globalEnabled = true } = options;
  const contexts = (
    isDev && _cachedContext.has(State)
      ? _cachedContext.get(State)
      : new Map<keyof Value, Context<unknown>>()
  ) as Map<keyof Value, Context<unknown>>;
  if (isDev) {
    // Register the live map itself so the Provider and useSelector keep writing
    // through to the cached instance across hot reloads.
    _cachedContext.set(State, contexts);
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

  // Per-factory store backing the global (provider-less) fallback. The global
  // Host runs State() and publishes each key here; useSelector reads it via
  // useSyncExternalStore when no explicit Provider is in scope. Notifications
  // are per-key, so the global path keeps the same re-render isolation that the
  // per-key contexts give the explicit-Provider path.
  const store = (() => {
    const values = new Map<keyof Value, unknown>();
    const lastNotified = new Map<keyof Value, unknown>();
    const listeners = new Map<keyof Value, Set<() => void>>();
    // Per-key subscribe/getSnapshot functions are memoized so their identity is
    // stable across renders (useSyncExternalStore re-subscribes if it changes).
    const subscribers = new Map<keyof Value, (cb: () => void) => () => void>();
    const snapshots = new Map<keyof Value, () => unknown>();

    const listenersFor = (key: keyof Value) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      return set;
    };

    return {
      // Render phase: keep getSnapshot fresh so a consumer rendering after the
      // Host in the same pass reads real values (the Host is the first sibling
      // under YasmlRoot, so it renders before the app). Does NOT notify.
      seed(next: Value) {
        (Object.keys(next) as (keyof Value)[]).forEach((key) => {
          values.set(key, next[key]);
        });
      },
      // Commit phase: notify subscribers of keys whose value actually changed.
      // Compared against lastNotified (not values) so a render-phase seed cannot
      // hide a real change from the diff.
      flush(next: Value) {
        (Object.keys(next) as (keyof Value)[]).forEach((key) => {
          const value = next[key];
          if (!Object.is(lastNotified.get(key), value)) {
            lastNotified.set(key, value);
            values.set(key, value);
            listenersFor(key).forEach((cb) => cb());
          }
        });
      },
      subscribe(key: keyof Value) {
        let fn = subscribers.get(key);
        if (!fn) {
          fn = (cb: () => void) => {
            const set = listenersFor(key);
            set.add(cb);
            return () => set.delete(cb);
          };
          subscribers.set(key, fn);
        }
        return fn;
      },
      getSnapshot(key: keyof Value) {
        let fn = snapshots.get(key);
        if (!fn) {
          fn = () => (values.has(key) ? values.get(key) : UNSET);
          snapshots.set(key, fn);
        }
        return fn;
      },
    };
  })();

  // Resolve a single key from its explicit context value and its global store
  // value, applying precedence: an explicit <Provider> always wins; otherwise
  // fall back to the global Host; otherwise warn / dev hot-reload fallback.
  const resolveKey = (
    key: keyof Value,
    displayName: string | undefined,
    contextValue: unknown,
    globalValue: unknown,
  ): unknown => {
    // 1. An explicit <Provider> in scope wins for this subtree.
    if (contextValue !== NO_PROVIDER) {
      if (isDev) _cachedState[key] = contextValue as Value[keyof Value];
      return contextValue;
    }
    // 2. No explicit Provider: fall back to the global Host's value.
    if (globalEnabled && globalValue !== UNSET) {
      return globalValue;
    }
    // 3. Nothing in scope. Only warn when no global Host could ever satisfy this
    //    key (global opted out) — otherwise the Host just hasn't published yet.
    if (isDev && !globalEnabled) {
      displayWarning(displayName);
    }
    if (isDev && key in _cachedState) {
      return _cachedState[key];
    }
    return contextValue; // NO_PROVIDER sentinel, preserving prior behavior
  };

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
        a < b ? -1 : a > b ? 1 : 0,
      );
    }

    // Keys are unknown until State() runs, so contexts are discovered on the
    // first render. getOrCreateContext is idempotent, so this is cheap on
    // subsequent renders and shares one creation path with useSelector.
    orderRef.current.forEach((key) => {
      const context = getOrCreateContext(key);
      element = (
        <context.Provider value={stateValues[key]}>{element}</context.Provider>
      );
    });

    return element;
  };

  if (isDev && State.name) {
    Provider.displayName = State.name;
  }

  // The global default instance. Mounted (as a sibling of your app) by
  // <YasmlRoot> for every factory that opted in. It runs State() with default
  // props and publishes the result into `store`; it renders nothing.
  const Host: FC = () => {
    const stateValues = State({} as Props);
    if (stateValues === null || typeof stateValues !== "object") {
      throw new Error("The state must return an object.");
    }
    // Keep the dev snapshot / function-selector probe seeded even when only the
    // global Host (no explicit Provider) is mounted.
    _cachedState = { ..._cachedState, ...stateValues };
    // Seed synchronously (no notify) so consumers rendering after the Host in
    // the same pass read real values; commit/notify happens below.
    store.seed(stateValues);
    useLayoutEffect(() => {
      store.flush(stateValues);
    });
    return null;
  };

  if (isDev && State.name) {
    Host.displayName = `${State.name}.Host`;
  }

  if (globalEnabled) {
    registerGlobalHost(State, Host);
  }

  function useSelector<T extends (keyof Value)[]>(
    ...keys: T
  ): T["length"] extends 0 ? Value : Pick<Value, T[number]>;
  function useSelector<
    T extends (value: Value) => Partial<Value> & Record<string, unknown>,
  >(selector: T): ReturnType<T>;
  function useSelector<T extends (keyof Value)[]>(
    ...keys: T | [(value: Value) => Partial<Value>]
  ): T["length"] extends 0 ? Value : Pick<Value, T[number]> {
    // Function/custom selector: discover which source keys the selector reads
    // via a recording proxy, subscribe to exactly those contexts, then recompute
    // the result from the *live* context values. This keeps derived and renamed
    // values correct and re-renders the component when the values they depend on
    // change (previously the result was computed once from stale cached state).
    if (typeof keys[0] === "function") {
      const selector = keys[0];
      const readKeys = new Set<keyof Value>();
      const probe = new Proxy(_cachedState, {
        get(target, prop) {
          readKeys.add(prop as keyof Value);
          return target[prop as keyof Value];
        },
      });
      // Run once against the cached state purely to record dependencies.
      selector(probe);

      // Seed `live` with the full cached snapshot so the recompute's returned
      // closures can reach keys they reference lazily (e.g. a setter used only
      // inside an `onClick`). The probe only records keys read *synchronously*
      // during the selector run, so anything accessed later from inside a
      // returned function would otherwise be missing here and blow up when the
      // closure fires. Subscribed keys below overwrite these with live context
      // values; setters are stable, so the snapshot is correct for them.
      const live = { ..._cachedState };
      readKeys.forEach((key) => {
        // Subscribe to both the explicit context and the global store for every
        // read key (unconditionally, for stable hook order); resolveKey applies
        // precedence between them.
        const context = getOrCreateContext(key);
        const contextValue = useContext(context);
        const globalValue = useSyncExternalStore(
          store.subscribe(key),
          store.getSnapshot(key),
          store.getSnapshot(key),
        );
        live[key] = resolveKey(
          key,
          context.displayName,
          contextValue,
          globalValue,
        ) as Value[keyof Value];
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
      // requested key on every render (stable hook order). The global store is
      // read alongside it as the provider-less fallback; resolveKey picks.
      const context = getOrCreateContext(key);
      const contextValue = useContext(context);
      const globalValue = useSyncExternalStore(
        store.subscribe(key),
        store.getSnapshot(key),
        store.getSnapshot(key),
      );
      result[key] = resolveKey(
        key,
        context.displayName,
        contextValue,
        globalValue,
      ) as Value[T[number]];
    });

    return result;
  }

  return {
    Provider,
    useSelector,
  };
}

export default Object.assign(yasml, { YasmlRoot });
