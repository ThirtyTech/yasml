import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, fn } from "storybook/test";
import { Basic } from "./Basic";
import code from "./Basic?raw";
import { Provider } from "./Context/SimpleSharedCounterState";

const meta: Meta<typeof Basic> = {
  title: "Example/Basic",
  component: Basic,
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
    expect(button).toHaveTextContent("Basic 0");
    expect(canvas.getByTestId("basic-results").children).toHaveLength(1);
    // Each click increments the shared counter, re-rendering and logging a render.
    await userEvent.click(button);
    expect(button).toHaveTextContent("Basic 1");
    expect(canvas.getByTestId("basic-results").children).toHaveLength(2);
    await userEvent.click(button);
    expect(button).toHaveTextContent("Basic 2");
    expect(canvas.getByTestId("basic-results").children).toHaveLength(3);
    // The onChange arg is spied with fn(), so it shows in Actions and is assertable.
    expect(args.onChange).toHaveBeenCalledTimes(2);
    expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};
