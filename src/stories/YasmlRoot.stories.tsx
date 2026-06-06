import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Title,
  Description,
  Primary as PrimaryBlock,
  Controls,
  Source,
} from "@storybook/addon-docs/blocks";
import { within, userEvent, expect } from "storybook/test";
import yasml from "../lib/yasml";
import { UniqueChildren } from "./UniqueChildren";
import code from "./UniqueChildren?raw";
import stateCode from "./Context/MultiCounterSharedState?raw";
import { Callout } from "./utils/Callout";

const { YasmlRoot } = yasml;

// Hand-written snippet shown in the docs to illustrate the wiring. This is the
// only setup the global default needs — no per-feature <Provider> at all.
const wiringCode = `import yasml from "@thirtytech/yasml";
const { YasmlRoot } = yasml;

// Mount once at the app root. Every factory created with the default
// \`global: true\` gets a default instance via YasmlRoot, so useSelector works
// with no <Provider> in the tree. An explicit <Provider> deeper in the tree
// still wins for its own subtree.
function App() {
  return (
    <YasmlRoot>
      <UniqueChildren />
    </YasmlRoot>
  );
}`;

const meta = {
  title: "Example/YasmlRoot Global Default",
  component: UniqueChildren,
  parameters: {
    docs: {
      source: {
        code: `${wiringCode}\n\n${code}`,
      },
      page: () => (
        <>
          <Title />
          <Description />
          <PrimaryBlock />
          <Controls />
          <h3>App wiring</h3>
          <Source code={wiringCode} language="tsx" />
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
      <YasmlRoot>
        <Callout title="No Provider — served by YasmlRoot" tone="success">
          <p>
            There is <strong>no</strong> <code>&lt;Provider&gt;</code> in this
            tree. <code>&lt;YasmlRoot&gt;</code> mounts a global default instance
            of <code>MultiCounterSharedState</code> as a sibling of the app, so{" "}
            <code>useSelector</code> resolves with zero wiring.
          </p>
          <p>
            Per-key isolation still holds through the global path: clicking Child
            One re-renders <strong>only</strong> Child One (its log grows to 2
            while Child Two stays at 1), then clicking Child Two grows its log.
          </p>
        </Callout>
        <Story />
      </YasmlRoot>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof UniqueChildren>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No Provider is mounted — these values come from the YasmlRoot default.
    await userEvent.click(canvas.getByTestId("child-one-btn"));
    await expect(canvas.getByTestId("child-one-results").children).toHaveLength(
      2,
    );
    // Child Two never re-rendered: the global path keeps per-key isolation.
    await expect(canvas.getByTestId("child-two-results").children).toHaveLength(
      1,
    );
    await userEvent.click(canvas.getByTestId("child-two-btn"));
    await expect(canvas.getByTestId("child-two-results").children).toHaveLength(
      2,
    );
  },
};
