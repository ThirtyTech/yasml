import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from './Context/SimpleSharedCounterState'
import { Basic } from './Basic';

const meta = {
  title: 'Example/Twin Children',
  component: TwinChildren,
  decorators: [(Story) => <Provider><Story /></Provider>],
  tags: ['autodocs'],
} satisfies Meta<typeof TwinChildren>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {}

function TwinChildren() {
  return <div>
    <div>
      <Basic />
    </div>
    <div style={{ marginTop: 8 }}>
      <Basic />
    </div>
  </div>
}


