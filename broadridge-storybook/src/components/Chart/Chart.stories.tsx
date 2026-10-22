import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExecutionChart, type ExecutionPoint } from './ExecutionChart';
import { Sparkline, type SparkColor } from './Sparkline';

// Sample execution profile, matching the Figma "Urgency & Impact" graph (08:30–08:40).
const TIMES = ['08:30', '08:31', '08:32', '08:33', '08:34', '08:35', '08:36', '08:37', '08:38', '08:39', '08:40'];
const QTY = [22, 14, 18, 15, 3, 5, 8, 3, 3, 3, 3];
const INV = [80, 63, 53, 44, 37, 33, 29, 26, 24, 21, 19];
const SINGLE: ExecutionPoint[] = TIMES.map((time, i) => ({ time, qty: QTY[i], inventory: INV[i] }));
const BAND = [78, 72, 66, 58, 52, 60, 70, 82, 92, 100, 96];

const PRE = [22, 15, 19, 17, 4, 7, 9, 4, 4, 4, 4];
const NOW = [20, 13, 21, 18, 5, 6, 11, 4, 3, 4, 4];
const PRED = [undefined, undefined, undefined, 19, 6, 8, 12, 5, 5, 5, undefined];
const COMPARE: ExecutionPoint[] = TIMES.map((time, i) => ({
  time,
  qty: NOW[i],
  preTrade: PRE[i],
  predicted: PRED[i],
  inventory: [85, 70, 60, 50, 42, 34, 28, 22, 16, 12, 8][i],
  predictedInventory: i < 4 ? [80, 63, 53, 50][i] : undefined,
}));

const meta = {
  title: 'Components/Charts',
  component: ExecutionChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Figma: Charts page. Plain SVG drawn with the Surface/Graph and Surface/Charting tokens, so both themes work. The predicted-inventory line is a hard-coded orange (#e07d0b) in Figma; here it uses Brand/Chart Orange/400.',
      },
    },
  },
  args: { data: SINGLE, band: BAND, window: [0, 10], mode: 'single' },
} satisfies Meta<typeof ExecutionChart>;
export default meta;
type Story = StoryObj<typeof meta>;

const panel = (children: React.ReactNode, width?: number) => (
  <div style={{ background: 'var(--br-surface-global-level-1)', padding: 'var(--br-scale-400)', borderRadius: 'var(--br-radius-xlg)', maxWidth: width }}>{children}</div>
);

export const Large: Story = { name: 'Execution path (large)', render: (args) => panel(<ExecutionChart {...args} />, 1105) };

export const Compare: Story = {
  name: 'Compare: pre-trade vs trading now',
  args: { data: COMPARE, mode: 'compare', band: undefined, window: undefined },
  render: (args) => panel(<ExecutionChart {...args} />, 1105),
};

export const Floating: Story = {
  name: 'Floating panel size',
  args: { compact: true, height: 192 },
  render: (args) => panel(<ExecutionChart {...args} />, 520),
};

export const CompareSideBySide: Story = {
  name: 'Compare x2',
  render: () =>
    panel(
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--br-scale-600)' }}>
        <ExecutionChart data={SINGLE} band={BAND} window={[0, 10]} compact height={192} />
        <ExecutionChart data={COMPARE} mode="compare" compact height={192} />
      </div>,
    ),
};

const SERIES = [
  { values: [6, 3, 7, 4, 8, 5, 9, 4, 6, 3, 2], line: undefined },
  { values: [2, 4, 1, 5, 2, 6, 1, 3, 7, 2, 4], line: undefined },
  { values: [7, 2, 5, 1, 3, 2, 4, 1, 2, 1, 1], line: [9, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1] },
  { values: [0.5, 0.5, 0.5, 1, 0.5, 6, 1, 3, 1, 0.5, 0.5], line: [8, 7, 5, 4, 3, 3, 2, 2, 1, 1, 1] },
];

export const SmallMultiples: Story = {
  name: 'Small multiples (sparklines)',
  render: () =>
    panel(
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 'var(--br-scale-300) var(--br-scale-800)', alignItems: 'center' }}>
        {(['green', 'blue', 'light-blue', 'orange'] as SparkColor[]).map((c) => (
          <div key={c} style={{ display: 'grid', gap: 'var(--br-scale-200)' }}>
            <span className="br-text-bdy-xxsm-med" style={{ color: 'var(--br-text-information-low)' }}>
              {c}
            </span>
            {SERIES.map((sr, i) => (
              <Sparkline key={i} color={c} values={sr.values} line={sr.line} />
            ))}
          </div>
        ))}
      </div>,
    ),
};
