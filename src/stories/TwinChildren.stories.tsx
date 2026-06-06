import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
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
  },
};
