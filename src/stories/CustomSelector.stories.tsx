import type { Meta, StoryObj } from "@storybook/react";
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
