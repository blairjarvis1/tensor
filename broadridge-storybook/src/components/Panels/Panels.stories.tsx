import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Button } from '../Button/Button';
import { ExecutionChart, type ExecutionPoint } from '../Chart/ExecutionChart';
import { TextField } from '../Form/Field';
import { NumberInput } from '../Form/NumberInput';
import { Select } from '../Form/Select';
import { LabelMetric, MetricBox, MetricGrid } from '../Metrics/Metrics';
import { Tabs } from '../Tabs/Tabs';
import { AnalysisPanel, PanelInset, PanelSection } from './AnalysisPanel';
import { NotificationPanel, type NotificationItem } from './NotificationPanel';
import { CompositeInterval, TicketFrame, TicketSidebar, TicketTopBar, ticketStyles as t } from './Ticket';

const meta = {
  title: 'Components/Panels',
  component: AnalysisPanel,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AnalysisPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

const TIMES = ['08:30', '08:31', '08:32', '08:33', '08:34', '08:35', '08:36', '08:37', '08:38', '08:39', '08:40'];
const DATA: ExecutionPoint[] = TIMES.map((time, i) => ({ time, qty: [22, 14, 18, 15, 3, 5, 8, 3, 3, 3, 3][i], inventory: [80, 63, 53, 44, 37, 33, 29, 26, 24, 21, 19][i] }));
const BAND = [78, 72, 66, 58, 52, 60, 70, 82, 92, 100, 96];
const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export const Analysis: Story = {
  name: 'Analysis panel',
  args: { side: 'sell', title: '', children: null },
  render: () => {
    const [tab, setTab] = useState('pre');
    const [status, setStatus] = useState<string | null>('New');
    const [ptab, setPtab] = useState('order');
    const [tz, setTz] = useState<string | null>('UTC');
    const [ccy, setCcy] = useState<string | null>('USD');
    return (
      <AnalysisPanel side="sell" title="500 - CGBM26 @ 120.21 CAD" status={<Select options={opts(['New', 'Working', 'Part Filled', 'Filled'])} value={status} onChange={setStatus} width={100} />} onMenu={() => {}} onExpand={() => {}} onClose={() => {}}>
        <Tabs aria-label="Trade phase" items={[{ value: 'pre', label: 'Pre-trade' }, { value: 'intra', label: 'Intra-trade' }, { value: 'post', label: 'Post-trade' }]} value={tab} onChange={setTab} />
        <MetricGrid label="Pre-trade metrics">
          {[
            <MetricBox key="1" label="Order Size" value="Large" caption="10% of ADV" level="high" />,
            <MetricBox key="2" label="Market Volatility" value="Normal" caption="25% v 10% average" level="mid" />,
            <MetricBox key="3" label="Market Impact" value="0.9 bps" caption="$10,897" level="high" />,
            <MetricBox key="4" label="Execution Risk" value="2.6 bps" caption="$14,009" level="low" />,
            <MetricBox key="5" label="Completion Time" value="09:41" caption="Tot. duration 61 mins" level="mid" />,
            <MetricBox key="6" label="Participation" value="14.4%" caption="12% avg, 16% ceiling" level="high" />,
            <MetricBox key="7" label="Spread Cost" value="1.1 bps" caption="$4,120" level="low" />,
          ]}
        </MetricGrid>
        <PanelSection>
          <ExecutionChart data={DATA} band={BAND} window={[0, 9]} compact height={200} />
        </PanelSection>
        <PanelInset>
          <Tabs aria-label="Parameters" size="small" items={[{ value: 'order', label: 'Order parameters' }, { value: 'bench', label: 'Benchmark parameters' }]} value={ptab} onChange={setPtab} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: 'var(--br-scale-300)' }}>
            <TextField label="Session date" icon="calendar-today" defaultValue="2026-06-22" />
            <Select label="Trading timezone" options={opts(['UTC', 'GMT', 'EST'])} value={tz} onChange={setTz} />
            <Select label="CCY" options={opts(['USD', 'CAD', 'EUR'])} value={ccy} onChange={setCcy} />
            <TextField label="Start date" icon="calendar-today" defaultValue="2026-06-23" />
            <TextField label="Start time" defaultValue="08:30" />
            <span className="br-text-bdy-xxsm-reg" style={{ color: 'var(--br-text-information-low)', alignSelf: 'end', paddingBottom: 6 }}>Start date follows session date</span>
          </div>
        </PanelInset>
      </AnalysisPanel>
    );
  },
};

export const TradeTicket: Story = {
  name: 'Trade ticket (full)',
  args: { side: 'sell', title: '', children: null },
  render: () => {
    const [secs, setSecs] = useState(20);
    useEffect(() => {
      const id = setInterval(() => setSecs((x) => (x <= 0 ? 20 : x - 1)), 1000);
      return () => clearInterval(id);
    }, []);
    const [askPrice, setAskPrice] = useState(129.905);
    const [askYield, setAskYield] = useState(129.905);
    const [repo, setRepo] = useState(129.905);
    const [wire, setWire] = useState(2);
    const [hedge, setHedge] = useState(false);
    const [bench, setBench] = useState<string | null>('Bond 1');
    const [portfolio, setPortfolio] = useState<string | null>('Portfolio 2');
    const [chips, setChips] = useState({ Composite: ['Maturity'], Internal: ['Maturity'], Tier: ['Maturity'] });
    const fields = Object.entries(chips).map(([label, values]) => ({ label, values }));
    return (
      <div className={t.ticket}>
        <div className={t.ticketFull}>
          <TicketTopBar requestType="Request Offer" instrument="Outright CAN 2.250 06/01/2029" secondsLeft={secs} totalSeconds={20} />
          <div style={{ marginTop: 'var(--br-scale-300)' }}>
            <LabelMetric layout="top-down" items={[{ label: 'Client', value: 'Tessier-Ashpool Corp' }, { label: 'Trader', value: 'Ryan Twelvetrees' }]} />
          </div>
        </div>
        <div className={t.ticketMain}>
          <TicketFrame side="ask" settlement="T+5 2026-05-05 UTC" size="50M" instrument="CAN 2.250 06/01/2029">
            <div className={t.pair}>
              <NumberInput label="Ask Price" pips={[0.1, 0.01, 0.001]} value={askPrice} onChange={setAskPrice} width="100%" />
              <NumberInput label="Ask Yield" pips={[0.1, 0.01, 0.001]} value={askYield} onChange={setAskYield} width="100%" />
              <span />
              <NumberInput label="Repo rate" value={repo} onChange={setRepo} step={0.001} width="100%" />
            </div>
            <div>
              <p className={t.subhead}>Last Quote</p>
              <div className={t.pair}>
                <TextField label="Client Price" />
                <TextField label="Dealer Price" />
              </div>
            </div>
            <div style={{ display: 'grid', gap: 'var(--br-scale-200)' }}>
              <p className={t.subhead}>Regular settlement</p>
              <CompositeInterval fields={fields} onRemove={(f, v) => setChips({ ...chips, [f]: chips[f as keyof typeof chips].filter((x) => x !== v) })} />
            </div>
            <div className={t.inlineField}>
              <p className={t.subhead}>Benchmark</p>
              <div style={{ flex: 1 }}>
                <Select options={opts(['Bond 1', 'Bond 2', 'Bond 3'])} value={bench} onChange={setBench} width="100%" />
              </div>
            </div>
          </TicketFrame>
          <div className={t.footerPanel}>
            <div className={t.pair}>
              <Select label="Portfolio" options={opts(['Portfolio 1', 'Portfolio 2'])} value={portfolio} onChange={setPortfolio} width="100%" />
              <TextField label="Net Position" placeholder="9,000,000,000" disabled />
              <TextField label="Venue" defaultValue="SI" disabled />
              <TextField label="Sales" />
            </div>
          </div>
        </div>
        <TicketSidebar onTheWire={wire} onOnTheWireChange={setWire} autoHedge={hedge} onAutoHedgeChange={setHedge} netDv01={-649} />
      </div>
    );
  },
};

export const TicketParts: Story = {
  name: 'Ticket parts',
  args: { side: 'sell', title: '', children: null },
  render: () => {
    const [wire, setWire] = useState(2);
    const [hedge, setHedge] = useState(true);
    return (
      <div style={{ display: 'flex', gap: 'var(--br-scale-800)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 'var(--br-scale-800)', width: 420 }}>
          <TicketTopBar requestType="Request Offer" instrument="Outright CAN 2.250 06/01/2029" secondsLeft={6} totalSeconds={20} />
          <TicketFrame side="ask" settlement="T+5 2026-05-05 UTC" size="50M" instrument="CAN 2.250 06/01/2029">
            <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-information-low)' }}>Quote fields go here.</span>
          </TicketFrame>
          <TicketFrame side="bid" settlement="T+2 2026-05-02 UTC" size="25M" instrument="CAN 1 06/01/27">
            <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-information-low)' }}>Bid side uses the green frame.</span>
          </TicketFrame>
          <CompositeInterval fields={[{ label: 'Composite', values: ['Maturity'] }, { label: 'Internal', values: ['Maturity'] }, { label: 'Tier', values: ['Maturity'] }]} onRemove={() => {}} />
        </div>
        <div style={{ width: 200, height: 520, display: 'flex' }}>
          <TicketSidebar onTheWire={wire} onOnTheWireChange={setWire} autoHedge={hedge} onAutoHedgeChange={setHedge} netDv01={-649} />
        </div>
      </div>
    );
  },
};

const NOTE = (id: string, extra: Partial<NotificationItem> = {}): NotificationItem => ({
  id,
  issue: { kind: 'issue-2', label: 'Size Warning' },
  when: 'Just now',
  details: [
    { label: 'Client', value: 'Tessier Ashpool Corp' },
    { label: 'Direction / Size', value: 'ASK 50M' },
    { label: 'Instrument', value: 'CAN 1 06/01/27' },
  ],
  escalation: 'Escalated',
  owner: 'Marshall, S.',
  timestamp: 'Today @ 10:30',
  ...extra,
});

export const Notifications: Story = {
  name: 'Notification panel',
  args: { side: 'sell', title: '', children: null },
  render: () => {
    const [groups, setGroups] = useState([
      { id: 'limit', title: 'Limit breach', items: [NOTE('a'), NOTE('b', { when: '2 min ago' }), NOTE('c', { when: '5 min ago' })] },
      { id: 'liq', title: 'Liquidity', items: [NOTE('d', { issue: { kind: 'issue-1', label: 'Liquidity' }, when: '12 min ago', escalation: undefined })] },
    ]);
    return <NotificationPanel height={760} latest={NOTE('latest', { escalation: undefined, owner: undefined, timestamp: undefined })} groups={groups} onClose={() => {}} onClearGroup={(id) => setGroups(groups.map((g) => (g.id === id ? { ...g, items: [] } : g)).filter((g) => g.items.length))} />;
  },
};

export const Docked: Story = {
  name: 'Analysis panel, docked',
  args: { side: 'sell', title: '', children: null },
  parameters: { layout: 'fullscreen', pageHeader: false },
  render: () => (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--br-surface-global-level-1)' }}>
      <div style={{ flex: 1, padding: 'var(--br-scale-400)' }} className="br-text-bdy-sm-reg">
        <span style={{ color: 'var(--br-text-information-low)' }}>Order grid sits here.</span>
      </div>
      <AnalysisPanel side="buy" mode="docked" width={420} title="1,200 - SXFU26 @ 98.40" onClose={() => {}}>
        <LabelMetric columns={1} items={[{ label: 'Objective', value: 'Finish Sooner' }, { label: 'Urgency', value: '79' }, { label: 'Participation', value: '11%' }, { label: 'Benchmark', value: 'Arrival' }]} />
        <Button variant="secondary">Open full analysis</Button>
      </AnalysisPanel>
    </div>
  ),
};
