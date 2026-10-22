/*
 * Mock data for the Order Book (parent) and Order Book Child grids.
 * Values follow the Figma screens (Tensor Home - 10 / 12) and are generated from a seeded random
 * source so every reload shows the same book.
 */

export type ExecStatus = 'new' | 'working' | 'part-filled' | 'filled' | 'cancelled';
export type Side = 'BUY' | 'SELL';

export type Order = {
  id: string;
  timestamp: string;
  status: ExecStatus;
  /** Filled share for Part Filled pills, 0–1. */
  fill: number;
  final: boolean;
  instrument: string;
  side: Side;
  isin: string;
  analytics: number[];
  analyticsLine: number[];
  impact: number;
  risk: number;
  qty: number;
  px: number;
  execQty: number;
  cap: number;
  validity: 'DAY' | 'GTC' | 'IOC';
  account: string;
  clientId: string;
  brokerId: string;
  lastAction: string;
  trader: string;
  venue: string;
};

export type ChildRow = {
  id: string;
  maturity: string;
  coupon: number;
  instrument: string;
  cusip: string;
  bidSize: number;
  bidYield: number;
  bid: number;
  ask: number;
  askYield: number;
  askSize: number;
  ccy: 'CAD';
  benchmark: string;
  /** Figma `Interaction=Error`: benchmark failed validation. */
  benchmarkError: boolean;
  spread: number;
  conversionFactor: number;
  benchmarkSide: 'Bid' | 'Ask' | 'Mid';
  baSpread: number;
  baLogic: 'from Bid' | 'from Ask' | 'from Mid';
  skew: number;
  dv01: number;
  primaryPricer: string;
  repoRate: number;
  repoAskSp: number;
  repoBidSp: number;
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

/** Instruments as named in Figma, with the ISINs used on the frames. */
export const INSTRUMENTS = [
  { code: 'SXFU26', isin: '445566778899', px: 1290.15, kind: 'equity-future' },
  { code: 'Brent Crude Dec26', isin: 'GB000HFC488', px: 79.42, kind: 'commodity' },
  { code: 'SXFM26', isin: '778899001122', px: 1284.6, kind: 'equity-future' },
  { code: 'CGBM26', isin: '112233445566', px: 128.905, kind: 'bond-future' },
  { code: 'CGBU26', isin: '112233445577', px: 129.215, kind: 'bond-future' },
] as const;

const STATUS_MIX: ExecStatus[] = ['part-filled', 'part-filled', 'part-filled', 'part-filled', 'working', 'working', 'new', 'filled', 'cancelled'];
const ACCOUNTS = ['Alpha Fund', 'Alpha Fund', 'Alpha Fund', 'Beacon Macro', 'Northgate RV'];
const CLIENTS = ['Voight', 'Voight', 'Harper', 'Tyrell', 'TA GmbH'];
const TRADERS = ['J. Carter', 'S. Okafor', 'M. Lindqvist', 'R. Banerjee'];
const VENUES = ['Montréal Exchange', 'ICE Futures Europe', 'Eurex', 'CME Globex'];

const pad = (n: number) => String(n).padStart(2, '0');
const time = (sec: number) => `${pad(Math.floor(sec / 3600) % 24)}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`;

export function makeOrders(count = 240): Order[] {
  const r = rng(20261021);
  return Array.from({ length: count }, (_, i) => {
    const inst = pick(r, INSTRUMENTS);
    const status = pick(r, STATUS_MIX);
    const qty = pick(r, [100, 500, 2500, 5000, 25000, 136500, 250000]);
    const px = +(inst.px * (1 + (r() - 0.5) * 0.01)).toFixed(inst.kind === 'commodity' ? 2 : 3);
    const fill = status === 'part-filled' ? 0.1 + r() * 0.75 : status === 'filled' ? 1 : 0;
    const bars = Array.from({ length: 12 }, () => 0.15 + r());
    const startSec = 8 * 3600 + Math.floor(r() * 9 * 3600);
    return {
      id: `OB-${(482100 + i * 7).toString()}`,
      timestamp: `10/10/26 ${time(startSec - 600)}`,
      status,
      fill,
      final: (status === 'filled' || status === 'cancelled') && r() > 0.4,
      instrument: inst.code,
      side: r() > 0.32 ? 'BUY' : 'SELL',
      isin: inst.isin,
      analytics: bars,
      analyticsLine: bars.map((b, j) => Math.max(0.1, b * 0.6 + 0.2 + Math.sin(j / 2) * 0.15)),
      impact: 100 + Math.round(r() * 320),
      risk: +(400 + r() * 4000).toFixed(3),
      qty,
      px,
      execQty: Math.round(qty * fill),
      cap: pick(r, [22_597_400, 601_050_000, 148_250_000, 4_820_000_000]),
      validity: pick(r, ['DAY', 'DAY', 'DAY', 'GTC', 'IOC'] as const),
      account: pick(r, ACCOUNTS),
      clientId: pick(r, CLIENTS),
      brokerId: pick(r, CLIENTS),
      lastAction: time(startSec),
      trader: pick(r, TRADERS),
      venue: pick(r, VENUES),
    };
  });
}

/** Canadian government bonds in the CGB deliverable basket style used by the Figma child grid. */
const BONDS = [
  { coupon: 1.0, mat: '06/01/27', label: '27 Dec 26', cusip: '68333ZBG1' },
  { coupon: 2.75, mat: '09/01/27', label: '01 Sep 27', cusip: '135087Q81' },
  { coupon: 3.5, mat: '03/01/28', label: '01 Mar 28', cusip: '135087R23' },
  { coupon: 2.0, mat: '06/01/28', label: '01 Jun 28', cusip: '135087H23' },
  { coupon: 3.25, mat: '12/01/33', label: '01 Dec 33', cusip: '135087Q99' },
  { coupon: 3.0, mat: '06/01/34', label: '01 Jun 34', cusip: '135087R72' },
  { coupon: 3.25, mat: '12/01/34', label: '01 Dec 34', cusip: '135087S30' },
  { coupon: 2.75, mat: '06/01/35', label: '01 Jun 35', cusip: '135087T21' },
  { coupon: 3.5, mat: '12/01/45', label: '01 Dec 45', cusip: '135087M68' },
  { coupon: 2.0, mat: '12/01/51', label: '01 Dec 51', cusip: '135087G31' },
  { coupon: 1.75, mat: '12/01/53', label: '01 Dec 53', cusip: '135087N50' },
];
const PRICERS = ['Csikszentmihalyi, M.', 'Okafor, S.', 'Lindqvist, M.', 'Banerjee, R.'];

/** Child rows for a parent order. Same parent → same rows. */
export function makeChildren(order: Order): ChildRow[] {
  const seed = [...order.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const r = rng(seed);
  const n = 10 + Math.floor(r() * 12);
  return Array.from({ length: n }, (_, i) => {
    const b = BONDS[(i + Math.floor(r() * 3)) % BONDS.length];
    const mid = 92 + r() * 12;
    const spread = 0.01 + r() * 0.05;
    const bidYield = +(2.6 + r() * 1.4).toFixed(3);
    const instrument = `CAN ${b.coupon % 1 === 0 ? b.coupon.toFixed(0) : b.coupon} ${b.mat}`;
    return {
      id: `${order.id}-${i}`,
      maturity: b.label,
      coupon: b.coupon,
      instrument,
      cusip: b.cusip,
      bidSize: pick(r, [1_000_000, 2_000_000, 5_000_000, 10_000_000]),
      bidYield,
      bid: +(mid - spread).toFixed(3),
      ask: +(mid + spread).toFixed(3),
      askYield: +(bidYield - 0.004 - r() * 0.01).toFixed(3),
      askSize: pick(r, [1_000_000, 2_000_000, 5_000_000]),
      ccy: 'CAD',
      benchmark: i === 0 ? 'CAN 1 06/01/27' : instrument,
      benchmarkError: i === 0 && order.status !== 'filled',
      spread: +(1.2 + r() * 2.4).toFixed(2),
      conversionFactor: +(0.55 + r() * 0.35).toFixed(3),
      benchmarkSide: pick(r, ['Bid', 'Bid', 'Ask', 'Mid'] as const),
      baSpread: +((r() > 0.4 ? 1 : -1) * (20 + r() * 40)).toFixed(2),
      baLogic: pick(r, ['from Bid', 'from Bid', 'from Ask', 'from Mid'] as const),
      skew: pick(r, [0, 0, 0, 0.25, -0.25]),
      dv01: +(2 + r() * 14).toFixed(3),
      primaryPricer: pick(r, PRICERS),
      repoRate: +(1 + r() * 2.5).toFixed(2),
      repoAskSp: +(1 + r() * 3).toFixed(1),
      repoBidSp: +(1 + r() * 3).toFixed(1),
    };
  });
}

/* ---------- Tabs and folders (the bar above each grid) ---------- */

export type TabDef<T> = { id: string; label: string; folder: string; test?: (row: T) => boolean };
export type FolderDef = { id: string; label: string };

export const ORDER_FOLDERS: FolderDef[] = [
  { id: 'ceti', label: 'Ceti Alpha Six' },
  { id: 'rates', label: 'Rates Desk' },
];

export const ORDER_TABS: TabDef<Order>[] = [
  { id: 'all-trades', label: 'All Trades', folder: 'ceti' },
  { id: 'failed', label: 'Failed', folder: 'ceti', test: (o) => o.status === 'cancelled' },
  { id: 'my-trades', label: 'My Trades', folder: 'ceti', test: (o) => o.trader === 'J. Carter' },
  { id: 'over-4500m', label: 'Over 4500M', folder: 'ceti', test: (o) => o.cap > 4_500_000_000 },
  { id: 'govvies', label: 'CAD Govvies', folder: 'rates', test: (o) => o.instrument.startsWith('CGB') },
  { id: 'working', label: 'Working', folder: 'rates', test: (o) => o.status === 'working' || o.status === 'part-filled' },
];

export const CHILD_FOLDERS: FolderDef[] = [{ id: 'basket', label: 'Deliverable Basket' }];
const year = (c: ChildRow) => Number(c.maturity.slice(-2));
export const CHILD_TABS: TabDef<ChildRow>[] = [
  { id: 'all', label: 'All Quotes', folder: 'basket' },
  { id: 'short', label: 'Short End', folder: 'basket', test: (c) => year(c) <= 28 },
  { id: 'long', label: 'Long End', folder: 'basket', test: (c) => year(c) >= 33 },
  { id: 'issues', label: 'Benchmark Issues', folder: 'basket', test: (c) => c.benchmarkError },
];

/* ---------- Formatting (en-GB grouping, as on the Figma frames) ---------- */

export const fmtInt = (n: number) => n.toLocaleString('en-GB');
export const fmtNum = (n: number, dp: number) => n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const STATUS_LABEL: Record<ExecStatus, string> = { new: 'New', working: 'Working', 'part-filled': 'Part Filled', filled: 'Filled', cancelled: 'Cancelled' };
