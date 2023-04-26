import { Basic } from './Basic';

export function TwinChildren() {
  return <div>
    <div>
      <Basic />
    </div>
    <div style={{ marginTop: 8 }}>
      <Basic />
    </div>
  </div>;
}
