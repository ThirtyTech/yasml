import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
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

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("basic-btn");
    // Mounts once, so the effect has logged a single render.
    expect(button).toHaveTextContent("Basic 0");
    expect(canvas.getByTestId("basic-results").children).toHaveLength(1);
    // Each click increments the shared counter, re-rendering and logging a render.
    await userEvent.click(button);
    expect(button).toHaveTextContent("Basic 1");
    expect(canvas.getByTestId("basic-results").children).toHaveLength(2);
    await userEvent.click(button);
    expect(button).toHaveTextContent("Basic 2");
    expect(canvas.getByTestId("basic-results").children).toHaveLength(3);
  },
};
