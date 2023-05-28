import type { Meta, StoryObj } from "@storybook/react";
import { Provider, useSelector } from "./Context/MultiCounterSharedState";

const meta: Meta<typeof PropertySelector> = {
  title: "Example/Property Selector",
  component: PropertySelector,
  parameters: {
    docs: {
      source: {},
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

function PropertySelector() {
  const { counterOne , update} = useSelector((state) => ({
    counterOne: state.counterOne,
    update: state.setCounterTwo,
  }));
  console.log("Initial Render. Will not render on click");
  return (
    <div>
      <button
        onClick={() => {
          console.log("Click");
          update((prev) => prev + 1);
        }}
      >
        {counterOne.toString()}
      </button>
    </div>
  );
}
