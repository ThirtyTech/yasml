<p align="center">
  <img src="https://raw.githubusercontent.com/ThirtyTech/yasml/main/public/yasml.png" alt="yasml logo" width="300" />
</p>

# YASML

<a href="https://npmjs.org/package/@thirtytech/yasml"><img alt="NPM version" src="https://img.shields.io/npm/v/@thirtytech/yasml.svg?style=flat-square"></a>
<a href="https://npmjs.org/package/@thirtytech/yasml"><img alt="NPM downloads" src="https://img.shields.io/npm/dm/@thirtytech/yasml.svg?style=flat-square"></a>
<a href="https://unpkg.com/@thirtytech/yasml"><img alt="Size" src="https://img.badgesize.io/https://unpkg.com/@thirtytech/yasml?style=flat-square"></a>

Write local state using [React Hooks](https://reactjs.org/docs/hooks-intro.html) and lift it up to [React Context](https://reactjs.org/docs/context.html) when needed. Protects against unncessary re-renders by isolating state variables into unique contexts.

No need to think about how to slice up your state for performance reasons initially. Write your state then ask for the properties you want when you need them.

Library is fully type safe with go to definition and find all references end to end.


## Key Benefits

- Easy api that simply wraps any hook that returns an object
- Namespaced hooks `MyState.useSelector()` that are relative to their provider and doesn't populate the global variable scope when referencing hook selector with intellisense
- Start simply be by just using the hook without any paramaters. In cases where you only have a few state variables that all the components will be using.
- Improved performance by using easy to opt into api to isolate just the variables you'll be using in each componet without having to think about it up front `MyState.useSelector('counter', 'setCounter')`

<br>

<table>
  <thead>
    <tr>
      <th colspan="5"><center>🕹 StackBlitz demos 🕹</center></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://stackblitz.com/edit/yasml-basic?file=src/App.tsx">Basic Online Sample</a></td>
    </tr>
  </tbody>
</table>

<br>

## Basic example

```jsx
import React, { useState } from "react";
import yasml from "@thirtytech/yasml";

// 1️⃣ Create a custom function/hook as usual to store your state
function CounterState() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prevCount) => prevCount + 1);
  return { count, increment };
}

// 2️⃣ Wrap your state with the yasml factory
const { Provider, useSelector } = yasml(CounterState);

function Button() {
  // 3️⃣ Use context selector instead of custom hook
  const { increment } = useSelector();
  return <button onClick={increment}>+</button>;
}

function Count() {
  // 4️⃣ Use context selector in other components
  const { count } = useSelector();
  return <span>{count}</span>;
}

function App() {
  // 5️⃣ Wrap your components with Provider
  return (
    <Provider>
      <Count />
      <Button />
    </Provider>
  );
}
```

[Learn more](#api)

## Advanced example

```jsx
import React, { useState, useCallback } from "react";
import yasml from "@thirtytech/yasml";

// 1️⃣ Create a custom hook that receives props
function CounterState({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  // 2️⃣ Wrap your updaters with useCallback or use dispatch from useReducer
  const increment = useCallback(() => setCount((prev) => prev + prev), []);
  return { count, increment };
}

// 3️⃣ Wrap your hook with the yasml factory splitting the values. Recommended to alias [Provider] for uniqueness
const { Provider: CounterProvider, useSelector } = yasml(CounterState);

function Button() {
  // 4️⃣ Only the state variables you request will cause re-renders. Note: If only using updaters then no re-renders will be caused.
  const { increment, count } = useSelector("increment", "count");
  return <button onClick={increment}>+{count}</button>;
}

function Count() {
  // 5️⃣ Use the state context in other components
  const { count } = useSelector("count");
  return <span>{count}</span>;
}

function App() {
  // 6️⃣ Wrap your components with Provider passing props to your hook
  return (
    <CounterProvider initialCount={10}>
      <Count />
      <Button />
    </CounterProvider>
  );
}
```

## Installation

npm:

```sh
npm i @thirtytech/yasml
```

pnpm:

```sh
pnpm add @thirtytech/yasml
```

## API

### `yasml(StateFn)`

YASML exports a single factory method. As parameters, it receives a single function [`StateFn`](#usevalue) that returns an object. The factory will then return an object of `{ Provider, useSelector }`.

#### `useValue`

It's any [custom hook](https://reactjs.org/docs/hooks-custom.html):

```js
import { useState } from "react";
import yasml from "@thirtytech/yasml";

const [CountProvider, useCountContext] = yasml(() => {
  const [count] = useState(0);
  return count;
});
```

You can receive props in the custom hook function. They will be populated with `<Provider />`:

```jsx
const { Provider: CountProvider, useSelector } = yasml(
  ({ initialCount = 0 }) => {
    const [count] = useState(initialCount);
    return count;
  }
);

function App() {
  return <CountProvider initialCount={10}>...</CountProvider>;
}
```

The API of the containerized hook returns the same value(s) as the original, as long as it is a descendant of the Provider:

```jsx
function Count() {
  const { count } = useSelector();
  console.log(count); // 10
}
```

## Special Thanks To

[Diego Haz](https://github.com/diegohaz) for his work on the [Constate](https://github.com/diegohaz/constate) library that was the original building block for `yasml`

## Contributing

If you find a bug, please [create an issue](https://github.com/thirtytech/yasml/issues/new) providing instructions to reproduce it. It's always very appreciable if you find the time to fix it. In this case, please [submit a PR](https://github.com/thirtytech/yasml/pulls).

If you're a beginner, it'll be a pleasure to help you contribute. You can start by reading [the beginner's guide to contributing to a GitHub project](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/).

When working on this codebase, please use `pnpm`. Run `pnpm examples` to run examples.

## License

MIT © [Jonathan Sheely](https://github.com/thirtytech)
