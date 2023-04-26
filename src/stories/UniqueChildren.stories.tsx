import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "./Context/MultiCounterSharedState";
import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
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
    // Note: Promise.resolve is a hack because @storybook/testing-library doesn't support async/await due to upstream types. https://github.com/storybookjs/testing-library/issues/10
    await Promise.resolve(userEvent.click(canvas.getByTestId("child-one-btn")));
    await Promise.resolve(
      expect(canvas.getByTestId("child-one-results").children).toHaveLength(2)
    );
    await Promise.resolve(
      expect(canvas.getByTestId("child-two-results").children).toHaveLength(1)
    );
    await Promise.resolve(userEvent.click(canvas.getByTestId("child-two-btn")));
    await Promise.resolve(
      expect(canvas.getByTestId("child-two-results").children).toHaveLength(2)
    );
  },
};
