import { useMemo, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { CHILD_FOLDERS, CHILD_TABS, ORDER_FOLDERS, ORDER_TABS, STATUS_LABEL, fmtInt, fmtNum, type ChildRow, type Order, type TabDef } from './data';
import { Change, DetailList, Spark, StatusCell, WithAcronym } from './cells';
import { GridFilters, GridHeader, TabGroups, type FilterGroup, type Filters, type TabsState } from './GridHeader';
import { TensorGrid, type GridColumn, type RowAction } from './TensorGrid';
import { useTensor } from './TensorState';
import s from './modules.module.css';

/** Header wiring that depends on where the module sits (main window, own window, grouped set). */
export type Chrome = {
  onTitlePointerDown?: (e: RPointerEvent) => void;
  onHeaderPointerDown?: (e: RPointerEvent) => void;
  onHeaderDoubleClick?: () => void;
  trailing?: ReactNode;
  /** Folded Tensor header (logo / arrow / divider) when the main window's header is minimised. */
  brand?: ReactNode;
};

const text = (q: string, ...fields: (string | number)[]) => {
  const n = q.trim().toLowerCase();
  return !n || fields.some((f) => String(f).toLowerCase().includes(n));
};

function downloadCsv<T>(name: string, columns: GridColumn<T>[], rows: T[]) {
  const value = (c: GridColumn<T>, r: T) => {
    const v = c.sortValue ? c.sortValue(r) : (r as Record<string, unknown>)[c.key];
    const str = Array.isArray(v) ? '' : String(v ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [columns.map((c) => c.header).join(','), ...rows.map((r) => columns.map((c) => value(c, r)).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Order Book (parent) ---------- */

const ORDER_COLUMNS: GridColumn<Order>[] = [
  { key: 'timestamp', header: 'Timestamp', width: 129 },
  { key: 'status', header: 'Execution Status', width: 117, render: (o) => <StatusCell status={o.status} fill={o.fill} final={o.final} />, sortValue: (o) => STATUS_LABEL[o.status] },
  { key: 'instrument', header: 'Instrument', width: 110 },
  { key: 'side', header: 'B/S', width: 64 },
  { key: 'isin', header: 'ISIN', width: 120 },
  { key: 'analytics', header: 'Analytics', width: 100, align: 'right', render: (o) => <Spark values={o.analytics} line={o.analyticsLine} />, sortValue: (o) => o.fill },
  { key: 'impact', header: 'Impact($)', width: 66, align: 'center', render: (o) => `$${o.impact}` },
  { key: 'risk', header: 'Risk', width: 89, align: 'right', render: (o) => fmtNum(o.risk, 3) },
  { key: 'qty', header: 'Qty', width: 97, align: 'right', render: (o) => fmtNum(o.qty, 2) },
  { key: 'px', header: 'Px', width: 87, align: 'right', render: (o) => fmtNum(o.px, 3) },
  { key: 'execQty', header: 'Exec. Qty', width: 66, render: (o) => fmtInt(o.execQty) },
  { key: 'cap', header: 'Cap', width: 103, align: 'right', render: (o) => fmtInt(o.cap) },
  { key: 'validity', header: 'Validity', width: 60 },
  { key: 'account', header: 'Account', width: 97 },
  { key: 'clientId', header: 'Client ID', width: 72 },
  { key: 'brokerId', header: 'Broker ID', width: 72 },
  { key: 'lastAction', header: 'Last Action', width: 185 },
];

const ORDER_FILTERS: FilterGroup[] = [
  { id: 'status', label: 'Execution status', options: (['new', 'working', 'part-filled', 'filled', 'cancelled'] as const).map((v) => ({ value: v, label: STATUS_LABEL[v] })) },
  { id: 'side', label: 'Side', options: [{ value: 'BUY', label: 'BUY' }, { value: 'SELL', label: 'SELL' }] },
  { id: 'instrument', label: 'Instrument', options: ['SXFU26', 'SXFM26', 'CGBM26', 'CGBU26', 'Brent Crude Dec26'].map((v) => ({ value: v, label: v })) },
  { id: 'validity', label: 'Validity', options: ['DAY', 'GTC', 'IOC'].map((v) => ({ value: v, label: v })) },
];

export function OrdersModule({ chrome }: { chrome: Chrome }) {
  const t = useTensor();
  const [tabs, setTabs] = useState<TabsState>({ tabs: ORDER_TABS as TabDef<unknown>[], folders: ORDER_FOLDERS, active: 'all' });
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  // Saved tabs remember the filters and search they were created with.
  const [saved, setSaved] = useState<Record<string, { filters: Filters; query: string }>>({});

  const rows = useMemo(() => {
    const tab = tabs.tabs.find((x) => x.id === tabs.active) as TabDef<Order> | undefined;
    return t.orders.filter((o) => {
      if (tab?.test && !tab.test(o)) return false;
      for (const [k, vals] of Object.entries(filters)) if (vals.length && !vals.includes(String(o[k as keyof Order]))) return false;
      return text(query, o.instrument, o.isin, o.account, o.clientId, o.id) && text(t.globalQuery, o.instrument, o.isin);
    });
  }, [t.orders, tabs, filters, query, t.globalQuery]);

  const actions: RowAction<Order>[] = [
    { label: 'Open ticket', icon: 'ticket', onSelect: (o) => t.toast(`Ticket opened for ${o.instrument} ${o.side}`) },
    { label: 'Amend order', icon: 'edit', onSelect: (o) => t.toast(`Amend ${o.id}: ticket opened`) },
    { label: 'View history', icon: 'history', onSelect: (o) => t.toast(`History for ${o.id}`) },
    {
      label: 'Copy ISIN',
      icon: 'copy',
      onSelect: (o) => {
        navigator.clipboard?.writeText(o.isin).catch(() => {});
        t.toast(`Copied ${o.isin}`);
      },
    },
    'separator',
    {
      label: 'Cancel order',
      icon: 'delete',
      destructive: true,
      onSelect: (o) => {
        t.setOrders((all) => all.map((x) => (x.id === o.id ? { ...x, status: 'cancelled', final: false } : x)));
        t.toast(`${o.id} cancelled`, 'error');
      },
    },
  ];

  const sel = t.selectedOrder;
  return (
    <>
      <GridHeader
        title="Order Book"
        {...chrome}
        left={
          <TabGroups
            state={tabs}
            onChange={(next) => {
              const created = next.tabs.find((x) => !tabs.tabs.some((y) => y.id === x.id));
              if (created) setSaved((sv) => ({ ...sv, [created.id]: { filters, query } }));
              if (next.active !== tabs.active && saved[next.active]) {
                setFilters(saved[next.active].filters);
                setQuery(saved[next.active].query);
              }
              setTabs(next);
            }}
          />
        }
        right={
          <GridFilters
            shown={rows.length}
            total={t.orders.length}
            query={query}
            onQuery={setQuery}
            groups={ORDER_FILTERS}
            filters={filters}
            onFilters={setFilters}
            onExport={() => {
              downloadCsv('order-book.csv', ORDER_COLUMNS, rows);
              t.toast(`Exported ${fmtInt(rows.length)} rows to order-book.csv`);
            }}
            date={date}
            onDate={setDate}
            live={t.live}
            onLive={t.setLive}
            paused={t.paused}
            onPause={t.setPaused}
          />
        }
      />
      {t.globalQuery && (
        <div className={s.notice}>
          Filtered by header search: <b>{t.globalQuery}</b>
          <button type="button" onClick={() => t.setGlobalQuery('')}>
            Clear
          </button>
        </div>
      )}
      <TensorGrid
        label="Order Book"
        columns={ORDER_COLUMNS}
        rows={rows}
        rowKey={(o) => o.id}
        selection="single"
        selected={sel ? [sel.id] : []}
        onSelect={(k) => k[0] && t.selectOrder(k[0])}
        flash={t.flash}
        rowActions={actions}
        renderDetail={(o) => (
          <DetailList
            items={[
              ['Order ID', o.id],
              ['Trader', o.trader],
              ['Venue', o.venue],
              ['Filled', `${Math.round(o.fill * 100)}% (${fmtInt(o.execQty)} of ${fmtNum(o.qty, 0)})`],
              ['Remaining', fmtInt(Math.max(0, Math.round(o.qty - o.execQty)))],
              ['Notional', `$${fmtInt(Math.round(o.qty * o.px))}`],
            ]}
          />
        )}
        empty="No orders match this tab and filters"
      />
    </>
  );
}

/* ---------- Order Book Child ---------- */

const benchmark = (c: ChildRow) => (c.benchmarkError ? <span className={s.cellError} title="Benchmark doesn't match the instrument's curve">{c.benchmark}</span> : c.benchmark);

const CHILD_COLUMNS: GridColumn<ChildRow>[] = [
  { key: 'maturity', header: 'Maturity', width: 70, sortValue: (c) => Number(c.maturity.slice(-2)) * 400 + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(c.maturity.slice(3, 6)) * 32 + Number(c.maturity.slice(0, 2)) },
  { key: 'coupon', header: 'Coupon', width: 57, align: 'right' },
  { key: 'instrument', header: 'Instrument', width: 104 },
  { key: 'cusip', header: 'CUSIP', width: 78 },
  { key: 'bidSize', header: 'Bid Size', width: 68, align: 'right', tone: 'bid', render: (c) => fmtInt(c.bidSize) },
  { key: 'bidYield', header: 'Bid Yield %', width: 74, align: 'right', tone: 'bid', render: (c) => fmtNum(c.bidYield, 3) },
  { key: 'bid', header: 'Bid', width: 60, align: 'right', tone: 'bid', render: (c) => fmtNum(c.bid, 3) },
  { key: 'ask', header: 'Ask', width: 60, tone: 'ask', render: (c) => fmtNum(c.ask, 3) },
  { key: 'askYield', header: 'Ask Yield %', width: 77, align: 'right', tone: 'ask', render: (c) => fmtNum(c.askYield, 3) },
  { key: 'askSize', header: 'Ask Size', width: 68, align: 'right', tone: 'ask', render: (c) => fmtInt(c.askSize) },
  { key: 'ccy', header: 'CCY', width: 40 },
  { key: 'benchmark', header: 'Benchmark', width: 102, render: benchmark },
  { key: 'spread', header: 'Spread', width: 54, align: 'right', render: (c) => fmtNum(c.spread, 2) },
  { key: 'conversionFactor', header: 'Conversion factor', width: 109, render: (c) => <WithAcronym>{fmtNum(c.conversionFactor, 3)}</WithAcronym> },
  { key: 'benchmarkSide', header: 'Benchmark side', width: 100, render: (c) => <WithAcronym align="left">{c.benchmarkSide}</WithAcronym> },
  { key: 'baSpread', header: 'B/A spread', width: 108, render: (c) => <Change value={c.baSpread} /> },
  { key: 'baLogic', header: 'B/A Sp logic', width: 82, render: (c) => <WithAcronym align="left">{c.baLogic}</WithAcronym> },
  { key: 'skew', header: 'Skew', width: 45, render: (c) => <WithAcronym>{c.skew}</WithAcronym> },
  { key: 'dv01', header: 'DV01', width: 65, render: (c) => <WithAcronym>{fmtNum(c.dv01, 3)}</WithAcronym> },
  { key: 'primaryPricer', header: 'Primary pricer', width: 122 },
  { key: 'repoRate', header: 'Repo Rate', width: 70, align: 'right', render: (c) => fmtNum(c.repoRate, 2) },
  { key: 'repoAskSp', header: 'Repo Ask Sp.', width: 85, align: 'right', render: (c) => fmtNum(c.repoAskSp, 1) },
  { key: 'repoBidSp', header: 'Repo Bid Sp.', width: 83, align: 'right', render: (c) => fmtNum(c.repoBidSp, 1) },
];

const CHILD_FILTERS: FilterGroup[] = [
  { id: 'benchmarkSide', label: 'Benchmark side', options: ['Bid', 'Ask', 'Mid'].map((v) => ({ value: v, label: v })) },
  { id: 'baLogic', label: 'B/A spread logic', options: ['from Bid', 'from Ask', 'from Mid'].map((v) => ({ value: v, label: v })) },
  { id: 'primaryPricer', label: 'Primary pricer', options: ['Csikszentmihalyi, M.', 'Okafor, S.', 'Lindqvist, M.', 'Banerjee, R.'].map((v) => ({ value: v, label: v })) },
];

export function ChildModule({ chrome }: { chrome: Chrome }) {
  const t = useTensor();
  const [tabs, setTabs] = useState<TabsState>({ tabs: CHILD_TABS as TabDef<unknown>[], folders: CHILD_FOLDERS, active: 'all' });
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const tab = tabs.tabs.find((x) => x.id === tabs.active) as TabDef<ChildRow> | undefined;
    return t.children.filter((c) => {
      if (tab?.test && !tab.test(c)) return false;
      for (const [k, vals] of Object.entries(filters)) if (vals.length && !vals.includes(String(c[k as keyof ChildRow]))) return false;
      return text(query, c.instrument, c.cusip, c.benchmark, c.primaryPricer);
    });
  }, [t.children, tabs, filters, query]);

  const o = t.selectedOrder;

  const actions: RowAction<ChildRow>[] = [
    { label: 'Open in ticket', icon: 'ticket', onSelect: (c) => t.toast(`Ticket opened for ${c.instrument}`) },
    { label: 'Pricing history', icon: 'show-chart', onSelect: (c) => t.toast(`Pricing history for ${c.instrument}`) },
    {
      label: 'Copy CUSIP',
      icon: 'copy',
      onSelect: (c) => {
        navigator.clipboard?.writeText(c.cusip).catch(() => {});
        t.toast(`Copied ${c.cusip}`);
      },
    },
    'separator',
    { label: 'Escalate benchmark', icon: 'escalate', onSelect: (c) => t.toast(`Escalated benchmark for ${c.instrument}`, 'error') },
  ];

  return (
    <>
      <GridHeader
        title="Order Book Child"
        {...chrome}
        left={<TabGroups state={tabs} onChange={setTabs} />}
        right={
          <GridFilters
            collapsible
            shown={rows.length}
            total={t.children.length}
            query={query}
            onQuery={setQuery}
            groups={CHILD_FILTERS}
            filters={filters}
            onFilters={setFilters}
            onExport={() => {
              downloadCsv(`order-book-child-${o?.id ?? 'none'}.csv`, CHILD_COLUMNS, rows);
              t.toast(`Exported ${fmtInt(rows.length)} rows`);
            }}
            date={date}
            onDate={setDate}
          />
        }
      />
      <TensorGrid
        label="Order Book Child"
        columns={CHILD_COLUMNS}
        rows={rows}
        rowKey={(c) => c.id}
        selection="multi"
        selected={selected}
        onSelect={setSelected}
        loading={t.childLoading}
        rowActions={actions}
        renderDetail={(c) => (
          <DetailList
            items={[
              ['Instrument', c.instrument],
              ['CUSIP', c.cusip],
              ['Mid', fmtNum((c.bid + c.ask) / 2, 3)],
              ['Bid / Ask yield', `${fmtNum(c.bidYield, 3)} / ${fmtNum(c.askYield, 3)}`],
              ['DV01', fmtNum(c.dv01, 3)],
              ['Primary pricer', c.primaryPricer],
            ]}
          />
        )}
        empty={o ? 'No quotes match this tab and filters' : 'Select an order in the Order Book to load its quotes'}
      />
    </>
  );
}
