import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Title,
  Description,
  Primary as PrimaryBlock,
  Controls,
  Source,
} from "@storybook/addon-docs/blocks";
import { within, userEvent, expect, fn } from "storybook/test";
import { Provider } from "./Context/SimpleSharedCounterState";
import { CustomSelector } from "./CustomSelector";
import code from "./CustomSelector?raw";
import stateCode from "./Context/SimpleSharedCounterState?raw";
import { Callout } from "./utils/Callout";

const meta: Meta<typeof CustomSelector> = {
  title: "Example/Custom Selector",
  component: CustomSelector,
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
          <h3>CustomSelector.tsx</h3>
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
        <Callout title="Custom selector — derived values">
          The selector returns a derived, formatted multiplier
          (<code>counter × {2}</code>) alongside an <code>increment</code> action,
          rather than raw state. The test increments twice and asserts the counter
          and its <code>$</code> multiplier update together (<code>$2.00</code> →
          <code>$4.00</code>).
        </Callout>
        <Story />
      </Provider>
    ),
  ],
  tags: ["autodocs"],
  args: {
    label: "Increment",
    multiplier: 2,
    onIncrement: fn(),
  },
  argTypes: {
    label: { control: "text" },
    multiplier: { control: { type: "number", min: 1 } },
    onIncrement: { table: { category: "Events" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("counter")).toHaveTextContent("Counter: 0");
    await expect(canvas.getByTestId("counter-multiplier")).toHaveTextContent(
      "Counter Multiplier: $0.00",
    );
    // The custom selector derives the multiplier (counter * 2) from state.
    await userEvent.click(canvas.getByTestId("increment-btn"));
    await expect(canvas.getByTestId("counter")).toHaveTextContent("Counter: 1");
    await expect(canvas.getByTestId("counter-multiplier")).toHaveTextContent(
      "Counter Multiplier: $2.00",
    );
    await userEvent.click(canvas.getByTestId("increment-btn"));
    await expect(canvas.getByTestId("counter")).toHaveTextContent("Counter: 2");
    await expect(canvas.getByTestId("counter-multiplier")).toHaveTextContent(
      "Counter Multiplier: $4.00",
    );
    // onIncrement is spied with fn(), so it shows in Actions and is assertable.
    await expect(args.onIncrement).toHaveBeenCalledTimes(2);
    await expect(args.onIncrement).toHaveBeenLastCalledWith(2);
  },
};
