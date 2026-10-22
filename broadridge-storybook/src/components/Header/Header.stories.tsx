import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DataGrid, SideValue, type Column } from '../Grid/DataGrid';
import { GridTabs, GridTools } from '../Grid/GridChrome';
import { ORDERS, type Order } from '../Grid/sampleData';
import { GlobalHeader, PanelHeader } from './Header';

const meta = {
  title: 'Components/Header',
  component: GlobalHeader,
  parameters: { layout: 'fullscreen' },
  args: { product: 'Tensor', notifications: 1, initials: 'JS' },
} satisfies Meta<typeof GlobalHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Global: Story = {
  name: 'Global header',
  render: (args) => {
    const [active, setActive] = useState<string | undefined>();
    return <GlobalHeader {...args} activeLink={active} onLink={setActive} />;
  },
};

export const Panel: Story = {
  name: 'Panel header',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-400)', maxWidth: 560 }}>
      <PanelHeader layout="right" floating onExpand={() => {}} onClose={() => {}} />
      <PanelHeader layout="left" floating onExpand={() => {}} onClose={() => {}} />
      <PanelHeader layout="left" onExpand={() => {}} onClose={() => {}} />
      <PanelHeader layout="right" title="SELL 500 - CGBM26 @ 120.21 CAD" onExpand={() => {}} onClose={() => {}} />
    </div>
  ),
};

const COLS: Column<Order>[] = [
  { key: 'timestamp', header: 'Timestamp', sortable: true },
  { key: 'status', header: 'Execution status' },
  { key: 'instrument', header: 'Instrument', sortable: true },
  { key: 'side', header: 'B/S', render: (r) => <SideValue side={r.side === 'BUY' ? 'bid' : 'ask'}>{r.side}</SideValue> },
  { key: 'isin', header: 'ISIN' },
  { key: 'qty', header: 'Qty.', align: 'right', render: (r) => r.qty.toLocaleString('en-GB') },
  { key: 'validity', header: 'Validity' },
  { key: 'account', header: 'Account' },
  { key: 'client', header: 'Client ID' },
  { key: 'lastAction', header: 'Last Action' },
];

export const AppShell: Story = {
  name: 'App shell (header + grid)',
  parameters: { pageHeader: false },
  render: (args) => {
    const [nav, setNav] = useState('book');
    const [tab, setTab] = useState('t1');
    return (
      <div style={{ minHeight: '100vh', background: 'var(--br-surface-global-level-1)', display: 'flex', flexDirection: 'column' }}>
        <GlobalHeader {...args} />
        <div style={{ padding: '0 var(--br-scale-400)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--br-scale-300)' }}>
          <div role="tablist" className="br-text-bdy-sm-med" style={{ display: 'flex', gap: 'var(--br-scale-600)', borderBottom: '1px solid var(--br-border-separator-level-2)' }}>
            {[
              ['book', 'Order Book'],
              ['instr', 'Instruments'],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={nav === id}
                onClick={() => setNav(id)}
                style={{ all: 'unset', cursor: 'pointer', padding: '12px 0 8px', color: nav === id ? 'var(--br-text-headings)' : 'var(--br-text-body-off)', borderBottom: `2px solid ${nav === id ? 'var(--br-border-action-primary)' : 'transparent'}` }}
              >
                {label}
              </button>
            ))}
          </div>
          <GridTools shown={1125} total={1125} filters={[]} />
          <div style={{ minWidth: 0 }}>
            <GridTabs tabs={[{ id: 't1', label: 'Ceti Alpha Six - tab 1' }, { id: 't2', label: 'Ceti Alpha Six - tab 2' }]} value={tab} onChange={setTab} onAdd={() => {}} />
            <DataGrid aria-label="Orders" columns={COLS} rows={ORDERS} rowKey={(r) => r.id} renderDetail={(r) => <span className="br-text-bdy-sm-reg">{r.id}</span>} maxHeight="calc(100vh - 200px)" />
          </div>
        </div>
      </div>
    );
  },
};
