import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, fn } from "storybook/test";
import { Provider } from "./Context/SimpleSharedCounterState";
import { TwinChildren } from "./TwinChildren";
import code from './TwinChildren?raw'
import basic from './Basic?raw'

const meta: Meta<typeof TwinChildren> = {
  title: "Example/Twin Children",
  component: TwinChildren,
  parameters: {
    docs: {
      source: {
        code: `${basic}\n\n${code}`,
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
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByTestId("basic-btn");
    expect(buttons).toHaveLength(2);
    // Both twins read the same shared counter.
    expect(buttons[0]).toHaveTextContent("Basic 0");
    expect(buttons[1]).toHaveTextContent("Basic 0");
    // Clicking one twin updates the shared state, so both re-render together.
    await userEvent.click(buttons[0]);
    expect(buttons[0]).toHaveTextContent("Basic 1");
    expect(buttons[1]).toHaveTextContent("Basic 1");
    // Clicking the other twin keeps advancing the same shared counter.
    await userEvent.click(buttons[1]);
    expect(buttons[0]).toHaveTextContent("Basic 2");
    expect(buttons[1]).toHaveTextContent("Basic 2");
    // Both twins share one onChange arg, fired once per click with the new value.
    expect(args.onChange).toHaveBeenCalledTimes(2);
    expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};
