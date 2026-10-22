import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { NotificationCard } from './NotificationCard';
import { RfqCard, type Rfq, type RfqCardProps } from './RfqCard';

const RFQ: Rfq = { instrument: 'B CAN 3 1/2 12/01/45', isin: 'CA1234567890', side: 'bid', type: 'Switch', price: '129.905', yield: '-5.175', amount: '250M', client: 'Joyce McMahon - ABC Ltd' };
const RFQ_COMPACT: Rfq = { ...RFQ, amount: '12M' };

const meta = {
  title: 'Components/Cards',
  component: RfqCard,
  args: { rfq: RFQ, size: 'detailed', status: 'new', issue: 'none', secondsLeft: 20, totalSeconds: 60, pinned: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['detailed', 'compact'] },
    status: { control: 'inline-radio', options: ['new', 'quote-sent', 'expired'] },
    issue: { control: 'inline-radio', options: ['none', 'size', 'limit'] },
    claimedBy: { control: 'text' },
    secondsLeft: { control: { type: 'range', min: 0, max: 60 } },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RfqCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RfqPlayground: Story = { name: 'RFQ card' };

export const RfqLiveTimer: Story = {
  name: 'RFQ card, live countdown',
  render: (args) => {
    const [left, setLeft] = useState(20);
    useEffect(() => {
      const t = setInterval(() => setLeft((l) => (l <= 0 ? 20 : l - 1)), 1000);
      return () => clearInterval(t);
    }, []);
    return <RfqCard {...args} secondsLeft={left} totalSeconds={20} status={left === 0 ? 'expired' : 'new'} />;
  },
};

const VARIANTS: { title: string; props: Partial<RfqCardProps> }[] = [
  { title: 'New, requesting', props: { status: 'new' } },
  { title: 'Size warning', props: { status: 'new', issue: 'size' } },
  { title: 'Limit breach', props: { status: 'new', issue: 'limit' } },
  { title: 'Quote sent', props: { status: 'quote-sent', secondsLeft: 114, totalSeconds: 120 } },
  { title: 'Expired', props: { status: 'expired' } },
  { title: 'Claimed', props: { status: 'new', claimedBy: 'J.Howard' } },
];

function Board({ size }: { size: 'detailed' | 'compact' }) {
  const rows: { label: string; extra: Partial<RfqCardProps> }[] = [
    { label: 'Active', extra: {} },
    { label: 'Pinned', extra: { pinned: true } },
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--br-scale-600)' }}>
      {rows.map((r) => (
        <section key={r.label} style={{ display: 'grid', gap: 'var(--br-scale-200)' }}>
          <h3 className="br-text-h5-med" style={{ margin: 0, color: 'var(--br-text-headings)' }}>
            {r.label}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--br-scale-400)', alignItems: 'flex-start' }}>
            {VARIANTS.map((v) => (
              <div key={v.title} style={{ display: 'grid', gap: 'var(--br-scale-100)' }}>
                <RfqCard rfq={size === 'detailed' ? RFQ : RFQ_COMPACT} size={size} secondsLeft={size === 'detailed' ? 20 : 114} totalSeconds={size === 'detailed' ? 60 : 180} {...v.props} {...r.extra} />
                <span className="br-text-bdy-xxsm-reg" style={{ color: 'var(--br-text-information-low)' }}>
                  {v.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export const RfqDetailedVariants: Story = {
  name: 'RFQ detailed, all variants',
  parameters: { layout: 'fullscreen', docs: { description: { story: 'Hover a card for the Rollover state, tab to it for Focus.' } } },
  render: () => <Board size="detailed" />,
};

export const RfqCompactVariants: Story = {
  name: 'RFQ compact, all variants',
  parameters: { layout: 'fullscreen' },
  render: () => <Board size="compact" />,
};

const NOTE = {
  issue: { kind: 'issue-2' as const, label: 'Size Warning' },
  when: 'Just now',
  details: [
    { label: 'Client', value: 'Tessier Ashpool Corp' },
    { label: 'Direction / Size', value: 'ASK 50M' },
    { label: 'Instrument', value: 'CAN 1 06/01/27' },
  ],
  escalation: 'Escalated',
  owner: 'Marshall, S.',
  timestamp: 'Today @ 10:30',
};

export const Notification: Story = {
  name: 'Notification card',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--br-scale-800)', alignItems: 'flex-start', flexWrap: 'wrap', padding: 'var(--br-scale-400)' }}>
      <NotificationCard {...NOTE} />
      <NotificationCard {...NOTE} stacked />
      <NotificationCard {...NOTE} issue={{ kind: 'issue-1', label: 'Liquidity' }} when="2 min ago" escalation={undefined} />
      <NotificationCard {...NOTE} issue={{ kind: 'system', label: 'System notification' }} when="10:12" details={[{ label: 'Service', value: 'Pricing engine' }, { label: 'Status', value: 'Reconnected' }]} escalation={undefined} owner={undefined} />
    </div>
  ),
};
