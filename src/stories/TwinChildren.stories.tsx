import type { Meta, StoryObj } from "@storybook/react";
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

export const Primary: Story = {};
