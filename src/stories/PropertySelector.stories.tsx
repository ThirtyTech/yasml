import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider } from "./Context/MultiCounterSharedState";
import { PropertySelector } from "./PropertySelector";
import code from "./PropertySelector?raw";

const meta: Meta<typeof PropertySelector> = {
  title: "Example/Property Selector",
  component: PropertySelector,
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
