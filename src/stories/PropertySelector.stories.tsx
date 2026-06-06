import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider } from "./Context/MultiCounterSharedState";
import { within, userEvent, expect } from "storybook/test";
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

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("property-selector-btn");
    // counterOne starts at 0 and the button label shows it.
    expect(button).toHaveTextContent("0");
    await userEvent.click(button);
    // Clicking updates counterTwo, not counterOne, so the label does not
    // re-render — but the click appends a result li via the DOM ref.
    expect(button).toHaveTextContent("0");
    expect(canvas.getByTestId("property-selector-results").children).toHaveLength(1);
    await userEvent.click(button);
    expect(button).toHaveTextContent("0");
    expect(canvas.getByTestId("property-selector-results").children).toHaveLength(2);
  },
};
