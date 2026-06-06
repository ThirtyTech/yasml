import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Title,
  Description,
  Primary as PrimaryBlock,
  Controls,
  Source,
} from "@storybook/addon-docs/blocks";
import { within, userEvent, expect, fn } from "storybook/test";
import { Basic } from "./Basic";
import code from "./Basic?raw";
import stateCode from "./Context/SimpleSharedCounterState?raw";
import { Provider } from "./Context/SimpleSharedCounterState";
import { Callout } from "./utils/Callout";

const meta: Meta<typeof Basic> = {
  title: "Example/Basic",
  component: Basic,
  parameters: {
    docs: {
      source: {
        code,
      },
      page: () => (
        <>
          <Title />
          <Description />
          <PrimaryBlock />
          <Controls />
          <h3>Basic.tsx</h3>
          <Source code={code} language="tsx" />
          <h3>SimpleSharedCounterState.ts</h3>
          <Source code={stateCode} language="tsx" />
        </>
      ),
    },
  },
  decorators: [
    (Story) => (
      <Provider>
        <Callout title="Basic — shared counter">
          A single counter lives in shared state. Each click increments it, the
          component re-renders, and the list logs one entry per render. The test
          clicks twice and asserts the label reads <code>Basic 2</code> with three
          render entries.

          <p>This example is is basically <code>useState</code> but with the state lifted to a shared context.</p>
        </Callout>
        <Story />
      </Provider>
    ),
  ],
  tags: ["autodocs"],
  args: {
    label: "Basic",
    step: 1,
    onChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    step: { control: { type: "number", min: 1 } },
    onChange: { table: { category: "Events" } },
  },
};

export default meta;
type Story = StoryObj<typeof Basic>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("basic-btn");
    // Mounts once, so the effect has logged a single render.
    await expect(button).toHaveTextContent("Basic 0");
    await expect(canvas.getByTestId("basic-results").children).toHaveLength(1);
    // Each click increments the shared counter, re-rendering and logging a render.
    await userEvent.click(button);
    await expect(button).toHaveTextContent("Basic 1");
    await expect(canvas.getByTestId("basic-results").children).toHaveLength(2);
    await userEvent.click(button);
    await expect(button).toHaveTextContent("Basic 2");
    await expect(canvas.getByTestId("basic-results").children).toHaveLength(3);
    // The onChange arg is spied with fn(), so it shows in Actions and is assertable.
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};
