import type { Meta, StoryObj } from '@storybook/react-vite';
import { LabelMetric, MetricBox, MetricGrid, StatusValue } from './Metrics';

const meta = {
  title: 'Components/Metrics',
  component: MetricBox,
  parameters: { layout: 'fullscreen' },
  args: { label: 'Order Size', value: 'Large', caption: '10% of ADV', level: 'high' },
  argTypes: { level: { control: 'inline-radio', options: ['low', 'mid', 'high'] } },
} satisfies Meta<typeof MetricBox>;
export default meta;
type Story = StoryObj<typeof meta>;

const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);

export const Playground: Story = { render: (args) => <MetricBox {...args} style={{ width: 178 }} /> };

export const MetricBoxesV1: Story = {
  name: 'Metric boxes v1.0 (with pager)',
  render: () => (
    <div style={{ maxWidth: 500 }}>
      <MetricGrid label="Pre-trade metrics">
        {[
          <MetricBox key="1" label="Order Size" value="Large" caption="10% of ADV" level="high" />,
          <MetricBox key="2" label="Market Volatility" value="Normal" caption="25% v 10% average" level="mid" />,
          <MetricBox key="3" label="Market Impact" value="0.9 bps" caption="$10,897" level="high" />,
          <MetricBox key="4" label="Execution Risk" value="2.6 bps" caption="$14,009" level="low" />,
          <MetricBox key="5" label="Completion Time" value="09:41" caption="Tot. duration 61 mins" level="mid" />,
          <MetricBox key="6" label="Participation" value="14.4%" caption="12% avg, 16% ceiling" level="high" />,
          <MetricBox key="7" label="Spread Cost" value="1.1 bps" caption="$4,120" level="low" />,
          <MetricBox key="8" label="Fill Probability" value="92%" caption="Within window" level="high" />,
        ]}
      </MetricGrid>
    </div>
  ),
};

export const MetricBoxesV2: Story = {
  name: 'Metric boxes v2.0 (scenarios)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 220px))', gap: 'var(--br-scale-300)' }}>
      <MetricBox label="Market Impact (bps)" scenarios={[{ tone: 1, value: '0.9 bps', caption: '$10,897', position: 0.4 }]} />
      <MetricBox label="Execution Risk (bps)" scenarios={[{ tone: 1, value: '2.6 bps', caption: '$10,897', position: 0.7 }, { tone: 2, value: '2.6 bps', caption: '$10,897', position: 0.5 }]} />
      <MetricBox label="Participation Rate (%)" scenarios={[{ tone: 1, value: '12.8%', caption: '16% ceiling', position: 0.5 }, { tone: 2, value: '14.4%', caption: '12% avg', position: 0.7 }]} />
      <MetricBox label="Market Impact (bps)" scenarios={[{ tone: 'actual', value: '2.3 bps', caption: '$25,771', position: 0.9 }, { tone: 3, value: '0.9 bps', caption: '$10,897', position: 0.5 }, { tone: 4, value: '1.7 bps', caption: '$20,443', position: 0.2 }]} />
      <MetricBox label="Completion Time" scenarios={[{ tone: 3, value: '09:31', caption: '61 mins', position: 0.6 }, { tone: 4, value: '09:23', caption: '53 mins', position: 0.4 }]} />
      <MetricBox label="Execution Risk (bps)" empty />
    </div>
  ),
};

export const LabelAndMetric: Story = {
  name: 'Label and metric',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
      <section>
        <H>Top down</H>
        <LabelMetric layout="top-down" items={[{ label: 'Client', value: 'Tessier-Ashpool Corp' }, { label: 'Trader', value: 'Ryan Twelvetrees' }]} />
      </section>
      <section>
        <H>Left to right, 2 columns</H>
        <LabelMetric
          columns={2}
          items={[
            { label: 'Status', value: <StatusValue>Part Filled</StatusValue> },
            { label: 'Requested start', value: '08:30' },
            { label: 'Objective', value: '303,952.862' },
            { label: 'Impact($)', value: '$122' },
            { label: 'Base notional ($)', value: '22,500,000' },
            { label: '50% done (min)', value: '3' },
            { label: 'Solve time (ms)', value: '0.472' },
            { label: 'Auto window', value: 'Yes' },
            { label: 'Price', value: '120.21' },
            { label: 'CCY', value: 'CAD' },
            { label: 'Requested start', value: '08:40' },
            { label: 'Risk benchmark', value: 'Arrival' },
            { label: 'Impact', value: '9.737' },
            { label: 'Risk', value: '4,203.159' },
            { label: '95% done (min)', value: '10' },
            { label: 'Solver status', value: 'Solved' },
          ]}
        />
      </section>
      <section>
        <H>Left to right, 3 columns</H>
        <LabelMetric
          columns={3}
          items={[
            { label: 'Status', value: <StatusValue>Part Filled</StatusValue> },
            { label: 'Objective', value: '303,952.862' },
            { label: 'Impact($)', value: '$122' },
            { label: 'Solve time (ms)', value: '0.472' },
            { label: 'Price', value: '120.21' },
            { label: 'CCY', value: 'CAD' },
            { label: 'Risk benchmark', value: 'Arrival' },
            { label: '50% done (min)', value: '3' },
            { label: 'Requested start', value: '08:30' },
            { label: 'Requested end', value: '08:40' },
            { label: 'Base notional ($)', value: '22,500,000' },
            { label: 'Assets', value: '1' },
          ]}
        />
      </section>
    </div>
  ),
};
