import type { Meta, StoryObj } from '@storybook/react';
import { Provider, useSelector } from './Context/MultiCounterSharedState'
import { useEffect, useRef } from 'react';

const meta = {
  title: 'Example/Unique Children',
  component: UniqueChildren,
  decorators: [(Story) => <Provider><Story /></Provider>],
  tags: ['autodocs'],
} satisfies Meta<typeof UniqueChildren>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {}


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
    <button onClick={() => setCounterOne(prev => prev + 1)}>Child One {counterOne}</button>
    <ul ref={ulRef}></ul>
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
    <button onClick={() => setCounterTwo(prev => prev + 1)}>Child Two {counterTwo}</button>
    <ul ref={ulRef}></ul>
  </>
}
