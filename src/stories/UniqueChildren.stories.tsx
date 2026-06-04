import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider } from "./Context/MultiCounterSharedState";
import { within, userEvent, expect } from "storybook/test";
import { UniqueChildren } from "./UniqueChildren";
import code from "./UniqueChildren?raw";
import basicCode from "./Basic?raw";

const meta = {
  title: "Example/Unique Children",
  component: UniqueChildren,
  parameters: {
    docs: {
      source: {
        code: `${basicCode}\n\n${code}`,
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
} satisfies Meta<typeof UniqueChildren>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("child-one-btn"));
    expect(canvas.getByTestId("child-one-results").children).toHaveLength(2);
    expect(canvas.getByTestId("child-two-results").children).toHaveLength(1);
    await userEvent.click(canvas.getByTestId("child-two-btn"));
    expect(canvas.getByTestId("child-two-results").children).toHaveLength(2);
  },
};
