import type { Meta, StoryObj } from '@storybook/react';
import { Provider, useSelector } from './Context/MultiCounterSharedState'
import { useEffect, useRef } from 'react';
import { within, userEvent } from '@storybook/testing-library'
import { expect } from '@storybook/jest';

const meta = {
  title: 'Example/Unique Children',
  component: UniqueChildren,
  decorators: [(Story) => <Provider><Story /></Provider>],
  tags: ['autodocs'],
} satisfies Meta<typeof UniqueChildren>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
}

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Note: Promise.resolve is a hack because @storybook/testing-library doesn't support async/await due to upstream types. https://github.com/storybookjs/testing-library/issues/10
    await Promise.resolve(userEvent.click(canvas.getByTestId('child-one-btn')));
    await Promise.resolve(expect(canvas.getByTestId('child-one-results').children).toHaveLength(2));
    await Promise.resolve(expect(canvas.getByTestId('child-two-results').children).toHaveLength(1));
    await Promise.resolve(userEvent.click(canvas.getByTestId('child-two-btn')));
    await Promise.resolve(expect(canvas.getByTestId('child-two-results').children).toHaveLength(2));
  }
}

function UniqueChildren() {
  return <div>
    <div>
      <ChildOne />
    </div>
    <div style={{ marginTop: 8 }}>
      <ChildTwo />
    </div>
  </div>
}

function ChildOne() {
  const { counterOne, setCounterOne } = useSelector('counterOne', 'setCounterOne');
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const li = document.createElement('li')
    li.innerHTML = '[ChildOne] Rendered ' + new Date().getTime();
    ulRef.current?.appendChild(li);
  });

  return <>
    <button data-testid="child-one-btn" onClick={() => setCounterOne(prev => prev + 1)}>Child One {counterOne}</button>
    <ul data-testid="child-one-results" ref={ulRef}></ul>
  </>
}

function ChildTwo() {
  const { counterTwo, setCounterTwo } = useSelector('counterTwo', 'setCounterTwo');
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const li = document.createElement('li');
    li.innerHTML = '[ChildTwo] Rendered ' + new Date().getTime();
    ulRef.current?.appendChild(li);
  })

  return <>
    <button data-testid="child-two-btn" onClick={() => setCounterTwo(prev => prev + 1)}>Child Two {counterTwo}</button>
    <ul data-testid="child-two-results" ref={ulRef}></ul>
  </>
}
