import { Desktop } from './desktop/Desktop';
import { TensorState } from './tensor/TensorState';
import { WindowManager } from './wm/WindowManager';

export default function App() {
  return (
    <TensorState>
      <WindowManager>
        <Desktop />
      </WindowManager>
    </TensorState>
  );
}
