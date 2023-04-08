
import type { Meta, StoryObj } from '@storybook/react';

import { Basic } from './Basic';
import { Provider } from './Context/SimpleSharedCounterState'

const meta = {
  title: 'Example/Basic',
  component: Basic,
  decorators: [(Story) => <Provider><Story /></Provider>],
  tags: ['autodocs'],
} satisfies Meta<typeof Basic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {}
