import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sparkline } from '../Chart/Sparkline';
import { Acronym, DataGrid, PriceChange, SideValue, type Column } from './DataGrid';
import { GridTabs, GridTools, type GridTab } from './GridChrome';
import { DEPTH, ORDERS, QUOTES, type DepthLevel, type Order, type Quote } from './sampleData';

const meta = {
  title: 'Components/Grid',
  component: DataGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Figma: Grid page (Grid Cell, Depth Cell) plus Grid Tools and grid tabs. Click a row to select it; Cmd/Ctrl-click or Shift-click to multi-select; ↑ ↓ move focus, Space selects, Enter expands.',
      },
    },
  },
} satisfies Meta<typeof DataGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

const n = (v: number, dp = 0) => v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const STATUS_COLOR: Record<Order['status'], string> = {
  New: 'var(--br-text-body-on)',
  Working: 'var(--br-text-body-on)',
  'Part Filled': 'var(--br-text-body-select)',
  Filled: 'var(--br-text-success)',
  Cancelled: 'var(--br-text-body-deactive)',
};

const ORDER_COLS: Column<Order>[] = [
  { key: 'timestamp', header: 'Timestamp', sortable: true },
  { key: 'status', header: 'Execution status', sortable: true, render: (r) => <span style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span> },
  { key: 'instrument', header: 'Instrument', width: 110, sortable: true },
  { key: 'side', header: 'B/S', render: (r) => <SideValue side={r.side === 'BUY' ? 'bid' : 'ask'}>{r.side}</SideValue> },
  { key: 'isin', header: 'ISIN' },
  { key: 'analytics', header: 'Analytics', render: (r) => <Sparkline values={r.spark} width={50} height={16} label={`${r.instrument} fill profile`} /> },
  { key: 'impact', header: 'Impact ($)', align: 'right', sortable: true, render: (r) => `$${r.impact}` },
  { key: 'risk', header: 'Risk', align: 'right', sortable: true, render: (r) => n(r.risk, 3) },
  { key: 'qty', header: 'Qty.', align: 'right', sortable: true, render: (r) => n(r.qty, 2) },
  { key: 'px', header: 'Px', align: 'right', render: (r) => n(r.px, 2) },
  { key: 'execQty', header: 'Exec. Qty', align: 'right' },
  { key: 'cap', header: 'Cap.', align: 'right', render: (r) => n(r.cap) },
  { key: 'validity', header: 'Validity' },
  { key: 'account', header: 'Account' },
  { key: 'client', header: 'Client ID', grouping: 'Grouping', sortable: true },
  { key: 'broker', header: 'Broker ID' },
  { key: 'lastAction', header: 'Last Action', sortable: true },
];

function OrderDetail({ o }: { o: Order }) {
  return (
    <div className="br-text-bdy-sm-reg" style={{ display: 'flex', gap: 'var(--br-scale-800)', color: 'var(--br-text-body)' }}>
      <span>
        <span style={{ color: 'var(--br-text-information-low)' }}>Order ID</span> {o.id}
      </span>
      <span>
        <span style={{ color: 'var(--br-text-information-low)' }}>Filled</span> {o.execQty} of {n(o.qty)}
      </span>
      <span>
        <span style={{ color: 'var(--br-text-information-low)' }}>Broker</span> {o.broker}
      </span>
    </div>
  );
}

const TABS: GridTab[] = [
  { id: 't1', label: 'Ceti Alpha Six - tab 1' },
  { id: 't2', label: 'Ceti Alpha Six - tab 2' },
];

export const OrderBlotter: Story = {
  name: 'Order blotter (tabs, tools, grid)',
  args: { columns: [], rows: [], rowKey: () => '' },
  render: () => {
    const [tabs, setTabs] = useState(TABS);
    const [tab, setTab] = useState('t2');
    const [filters, setFilters] = useState(['Maturity', 'Benchmark']);
    const [quick, setQuick] = useState(false);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--br-scale-300)', alignContent: 'start' }}>
        <GridTools shown={1231} total={2234} filters={filters} onRemoveFilter={(f) => setFilters(filters.filter((x) => x !== f))} onClearFilters={() => setFilters([])} quickFilters={quick} onQuickFiltersChange={setQuick} />
        <div style={{ minWidth: 0 }}>
          <GridTabs tabs={tabs} value={tab} onChange={setTab} onClose={(id) => setTabs(tabs.filter((t) => t.id !== id))} onAdd={() => { const id = `t${Date.now()}`; setTabs([...tabs, { id, label: `Ceti Alpha Six - tab ${tabs.length + 1}` }]); setTab(id); }} />
          <DataGrid aria-label="Orders" columns={ORDER_COLS} rows={ORDERS} rowKey={(r) => r.id} renderDetail={(r) => <OrderDetail o={r} />} onRowMenu={() => {}} maxHeight={560} />
        </div>
      </div>
    );
  },
};

const QUOTE_COLS: Column<Quote>[] = [
  { key: 'maturity', header: 'Maturity', sortable: true },
  { key: 'coupon', header: 'Coupon', align: 'right' },
  { key: 'instrument', header: 'Instrument', sortable: true },
  { key: 'cusip', header: 'CUSIP' },
  { key: 'bidSize', header: 'Bid Size', align: 'right', render: (r) => <SideValue side="bid">{n(r.bidSize)}</SideValue> },
  { key: 'bidYield', header: 'Bid Yield %', align: 'right', render: (r) => <SideValue side="bid">{r.bidYield.toFixed(3)}</SideValue> },
  { key: 'bid', header: 'Bid', align: 'right', render: (r) => <SideValue side="bid">{n(r.bid * 1000)}</SideValue> },
  { key: 'ask', header: 'Ask', align: 'right', render: (r) => <SideValue side="ask">{r.ask.toFixed(3)}</SideValue> },
  { key: 'askYield', header: 'Ask Yield %', align: 'right', render: (r) => <SideValue side="ask">{n(r.askYield * 1000)}</SideValue> },
  { key: 'ccy', header: 'CCY' },
  { key: 'askSize', header: 'Ask Size', align: 'right', render: (r) => <SideValue side="ask">{n(r.askSize)}</SideValue> },
  { key: 'benchmark', header: 'Benchmark' },
  { key: 'spread', header: 'Spread', align: 'right', render: (r) => r.spread.toFixed(2) },
  { key: 'factor', header: 'Conversion factor', align: 'right', render: (r) => (<><Acronym>IS</Acronym>{r.factor.toFixed(3)}</>) },
  { key: 'baSpread', header: 'B/A spread', align: 'right', sortable: true, render: (r) => (<><Acronym>IS</Acronym><PriceChange value={r.baSpread} /></>) },
  { key: 'dv01', header: 'DV01', align: 'right', render: (r) => (<><Acronym>IS</Acronym>{r.dv01.toFixed(3)}</>) },
  { key: 'pricer', header: 'Primary pricer' },
];

export const PricingGrid: Story = {
  name: 'Pricing grid (acronyms, price change)',
  args: { columns: [], rows: [], rowKey: () => '' },
  render: () => (
    <div style={{ minWidth: 0 }}>
      <DataGrid aria-label="Prices" columns={QUOTE_COLS} rows={QUOTES} rowKey={(r) => r.id} renderDetail={() => <span className="br-text-bdy-sm-reg">Quote history appears here.</span>} onRowMenu={() => {}} defaultSort={{ key: 'maturity', dir: 'asc' }} />
    </div>
  ),
};

export const CheckboxSelection: Story = {
  name: 'Checkbox selection',
  args: { columns: [], rows: [], rowKey: () => '' },
  render: () => {
    const [sel, setSel] = useState<string[]>(['Q-1', 'Q-2']);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-300)', alignContent: 'start' }}>
        <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-body)' }}>
          {sel.length} selected
        </span>
        <DataGrid aria-label="Prices" checkboxes columns={QUOTE_COLS.slice(0, 8)} rows={QUOTES} rowKey={(r) => r.id} selected={sel} onSelectedChange={setSel} />
      </div>
    );
  },
};

const DEPTH_COLS: Column<DepthLevel>[] = [
  { key: 'level', header: 'Lvl', align: 'center', width: 40 },
  { key: 'bidSize', header: 'Bid Size', align: 'right', width: 90, render: (r) => n(r.bidSize) },
  { key: 'bid', header: 'Bid', align: 'right', width: 90, render: (r) => <SideValue side="bid">{r.bid.toFixed(3)}</SideValue> },
  { key: 'ask', header: 'Ask', align: 'right', width: 90, render: (r) => <SideValue side="ask">{r.ask.toFixed(3)}</SideValue> },
  { key: 'askSize', header: 'Ask Size', align: 'right', width: 90, render: (r) => n(r.askSize) },
];

export const DepthLadder: Story = {
  name: 'Depth cells (order-book ladder)',
  args: { columns: [], rows: [], rowKey: () => '' },
  render: () => (
    <div style={{ minWidth: 0 }}>
      <div style={{ width: 'fit-content' }}>
        <DataGrid aria-label="Market depth, B CAN 3 1/2 12/01/45" variant="depth" columns={DEPTH_COLS} rows={DEPTH} rowKey={(r) => String(r.level)} />
      </div>
    </div>
  ),
};
