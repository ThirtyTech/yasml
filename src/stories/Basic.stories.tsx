import type { Meta, StoryObj } from "@storybook/react";
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
};

export default meta;
type Story = StoryObj<typeof Basic>;

export const Primary: Story = {};
