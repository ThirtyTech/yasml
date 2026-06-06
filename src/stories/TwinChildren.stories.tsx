import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Title,
  Description,
  Primary as PrimaryBlock,
  Controls,
  Source,
} from "@storybook/addon-docs/blocks";
import { within, userEvent, expect, fn } from "storybook/test";
import { Provider } from "./Context/SimpleSharedCounterState";
import { TwinChildren } from "./TwinChildren";
import code from './TwinChildren?raw'
import basic from './Basic?raw'
import stateCode from "./Context/SimpleSharedCounterState?raw";
import { Callout } from "./utils/Callout";

const meta: Meta<typeof TwinChildren> = {
  title: "Example/Twin Children",
  component: TwinChildren,
  parameters: {
    docs: {
      source: {
        code: `${basic}\n\n${code}`,
      },
      page: () => (
        <>
          <Title />
          <Description />
          <PrimaryBlock />
          <Controls />
          <h3>TwinChildren.tsx</h3>
          <Source code={code} language="tsx" />
          <h3>Basic.tsx</h3>
          <Source code={basic} language="tsx" />
          <h3>SimpleSharedCounterState.ts</h3>
          <Source code={stateCode} language="tsx" />
        </>
      ),
    },
  },
  decorators: [
    (Story) => (
      <Provider>
        <Callout title="Twin children — synchronized via shared state">
          Two independent <code>Basic</code> components read the same shared
          counter. Clicking either one updates the shared state, so both re-render
          together and stay in sync. The test clicks each twin once and asserts
          both labels advance together to <code>Basic 2</code>.
        </Callout>
        <Story />
      </Provider>
    ),
  ],
  tags: ["autodocs"],
  args: {
    label: "Basic",
    step: 1,
    onChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    step: { control: { type: "number", min: 1 } },
    onChange: { table: { category: "Events" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByTestId("basic-btn");
    await expect(buttons).toHaveLength(2);
    // Both twins read the same shared counter.
    await expect(buttons[0]).toHaveTextContent("Basic 0");
    await expect(buttons[1]).toHaveTextContent("Basic 0");
    // Clicking one twin updates the shared state, so both re-render together.
    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveTextContent("Basic 1");
    await expect(buttons[1]).toHaveTextContent("Basic 1");
    // Clicking the other twin keeps advancing the same shared counter.
    await userEvent.click(buttons[1]);
    await expect(buttons[0]).toHaveTextContent("Basic 2");
    await expect(buttons[1]).toHaveTextContent("Basic 2");
    // Both twins share one onChange arg, fired once per click with the new value.
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};
