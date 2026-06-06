import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Title,
  Description,
  Primary as PrimaryBlock,
  Controls,
  Source,
} from "@storybook/addon-docs/blocks";
import { Provider } from "./Context/MultiCounterSharedState";
import { within, userEvent, expect } from "storybook/test";
import { UniqueChildren } from "./UniqueChildren";
import code from "./UniqueChildren?raw";
import basicCode from "./Basic?raw";
import stateCode from "./Context/MultiCounterSharedState?raw";
import { Callout } from "./utils/Callout";

const meta = {
  title: "Example/Unique Children",
  component: UniqueChildren,
  parameters: {
    docs: {
      source: {
        code: `${basicCode}\n\n${code}`,
      },
      page: () => (
        <>
          <Title />
          <Description />
          <PrimaryBlock />
          <Controls />
          <h3>Basic.tsx</h3>
          <Source code={basicCode} language="tsx" />
          <h3>UniqueChildren.tsx</h3>
          <Source code={code} language="tsx" />
          <h3>MultiCounterSharedState.ts</h3>
          <Source code={stateCode} language="tsx" />
        </>
      ),
    },
  },
  decorators: [
    (Story) => (
      <Provider>
        <Callout title="Unique children — isolated re-renders">
          <p>
            Each child subscribes to its own slice of state. Clicking one child
            re-renders <strong>only</strong> that child — its render log grows
            while the sibling's stays put. The test clicks Child One (its log
            goes to 2 while Child Two stays at 1), then clicks Child Two.
          </p>
          <p>
            This example shows the standard use case of yasml. One shared state
            object but isolated rendering.
          </p>
        </Callout>
        <Story />
      </Provider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof UniqueChildren>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("child-one-btn"));
    await expect(canvas.getByTestId("child-one-results").children).toHaveLength(
      2,
    );
    await expect(canvas.getByTestId("child-two-results").children).toHaveLength(
      1,
    );
    await userEvent.click(canvas.getByTestId("child-two-btn"));
    await expect(canvas.getByTestId("child-two-results").children).toHaveLength(
      2,
    );
  },
};
