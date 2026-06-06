import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider } from "./Context/MultiCounterSharedState";
import { within, userEvent, expect, fn } from "storybook/test";
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
  args: {
    step: 1,
    onUpdate: fn(),
  },
  argTypes: {
    step: { control: { type: "number", min: 1 } },
    onUpdate: { table: { category: "Events" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
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
    // onUpdate fires with the new counterTwo value even though no re-render occurs.
    expect(args.onUpdate).toHaveBeenCalledTimes(2);
    expect(args.onUpdate).toHaveBeenLastCalledWith(2);
  },
};
