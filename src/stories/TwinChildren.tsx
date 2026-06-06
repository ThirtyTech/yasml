import { Basic } from './Basic';

interface TwinChildrenProps {
  /** Text shown before the counter on both twins. */
  label?: string;
  /** Amount each click adds to the shared counter. */
  step?: number;
  /** Called with the new counter value after either twin is clicked. */
  onChange?: (count: number) => void;
}

export function TwinChildren({ label, step, onChange }: TwinChildrenProps) {
  return <div>
    <div>
      <Basic label={label} step={step} onChange={onChange} />
    </div>
    <div style={{ marginTop: 8 }}>
      <Basic label={label} step={step} onChange={onChange} />
    </div>
  </div>;
}
