import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, fn } from "storybook/test";
import { Provider } from "./Context/SimpleSharedCounterState";
import { CustomSelector } from "./CustomSelector";
import code from "./CustomSelector?raw";

const meta: Meta<typeof CustomSelector> = {
  title: "Example/Custom Selector",
  component: CustomSelector,
  parameters: {
    docs: {
      source: {
        code,
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider>
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
    expect(canvas.getByTestId("counter")).toHaveTextContent("Counter: 0");
    expect(canvas.getByTestId("counter-multiplier")).toHaveTextContent(
      "Counter Multiplier: $0.00",
    );
    // The custom selector derives the multiplier (counter * 2) from state.
    await userEvent.click(canvas.getByTestId("increment-btn"));
    expect(canvas.getByTestId("counter")).toHaveTextContent("Counter: 1");
    expect(canvas.getByTestId("counter-multiplier")).toHaveTextContent(
      "Counter Multiplier: $2.00",
    );
    await userEvent.click(canvas.getByTestId("increment-btn"));
    expect(canvas.getByTestId("counter")).toHaveTextContent("Counter: 2");
    expect(canvas.getByTestId("counter-multiplier")).toHaveTextContent(
      "Counter Multiplier: $4.00",
    );
    // onIncrement is spied with fn(), so it shows in Actions and is assertable.
    expect(args.onIncrement).toHaveBeenCalledTimes(2);
    expect(args.onIncrement).toHaveBeenLastCalledWith(2);
  },
};
