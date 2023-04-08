
import type { Meta, StoryObj } from '@storybook/react';
import { Provider, useSelector } from './Context/SimpleSharedCounterState'

const meta = {
  title: 'Example/Custom Selector',
  component: CustomSelector,
  decorators: [(Story) => <Provider><Story /></Provider>],
  tags: ['autodocs'],
} satisfies Meta<typeof CustomSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {}

function CustomSelector() {
  const { counter, increment, counterMultiplier } = useSelector(state => ({
    increment: () => state.setCounter(prev => prev + 1),
    counter: state.counter,
    counterMultiplier: `$${(state.counter * 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  }));
  return <div>
    <div>
      <button onClick={() => increment()}>Increment</button>
      <div>Counter: {counter}</div>
      <div>Counter Multiplier: {counterMultiplier}</div>
    </div>
  </div>
}


