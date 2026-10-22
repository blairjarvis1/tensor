// Sample trading data for stories. Mirrors the Figma Grid and Algo Grid frames.

export type Order = {
  id: string;
  timestamp: string;
  status: 'New' | 'Working' | 'Part Filled' | 'Filled' | 'Cancelled';
  instrument: string;
  side: 'BUY' | 'SELL';
  isin: string;
  impact: number;
  risk: number;
  qty: number;
  px: number;
  execQty: number;
  cap: number;
  validity: string;
  account: string;
  client: string;
  broker: string;
  lastAction: string;
  spark: number[];
};

const STATUSES: Order['status'][] = ['Part Filled', 'Part Filled', 'New', 'Cancelled', 'Part Filled', 'Filled', 'Filled', 'Working', 'Part Filled', 'New'];
const INSTR = ['SXFU26', 'Brent Crude Fut', 'CGBM26', 'SXFM26', 'Brent Crude Fut'];
const ISIN = ['445566778899', 'GB000HFC488', '112233445566', '778899001122', 'GB000HFC488'];
const CLIENT = ['Voight', 'Harper', 'TA GmbH', 'Tyrell', 'Harper'];
const seeded = (n: number) => {
  let x = n * 9301 + 49297;
  return () => ((x = (x * 9301 + 49297) % 233280) / 233280);
};

export const ORDERS: Order[] = Array.from({ length: 24 }, (_, i) => {
  const r = seeded(i + 1);
  const k = i % 5;
  return {
    id: `ORD-${1000 + i}`,
    timestamp: `10/10/26 11:12:${String(34 + (i % 20)).padStart(2, '0')}`,
    status: STATUSES[i % STATUSES.length],
    instrument: INSTR[k],
    side: i % 3 === 0 ? 'BUY' : 'SELL',
    isin: ISIN[k],
    impact: 122 + i * 13,
    risk: Math.round(4203159 - i * 151000) / 1000,
    qty: [100, 1290150, 136500, 5000][i % 4],
    px: [100, 1290150, 136500, 5000][(i + 1) % 4] / 1,
    execQty: [0, 1, 0, 15][i % 4],
    cap: i % 2 ? 22597400 : 601050000,
    validity: 'Day',
    account: 'Alpha Fund',
    client: CLIENT[k],
    broker: CLIENT[k],
    lastAction: `${String(8 + (i % 9)).padStart(2, '0')}:${String(Math.floor(r() * 59)).padStart(2, '0')}:${String(Math.floor(r() * 59)).padStart(2, '0')}`,
    spark: Array.from({ length: 11 }, () => Math.round(r() * 8) + 1),
  };
});

export type Quote = { id: string; maturity: string; coupon: number; instrument: string; cusip: string; bidSize: number; bidYield: number; bid: number; ask: number; askYield: number; ccy: string; askSize: number; benchmark: string; spread: number; factor: number; baSpread: number; dv01: number; pricer: string };

export const QUOTES: Quote[] = Array.from({ length: 12 }, (_, i) => ({
  id: `Q-${i}`,
  maturity: ['27 Dec 26', '15 Mar 27', '01 Jun 28', '01 Dec 30'][i % 4],
  coupon: [3.3, 2.75, 1.5, 4.0][i % 4],
  instrument: ['CAN 1 06/01/27', 'CAN 3 1/2 12/01/45', 'CAN 2 3/4 06/01/33', 'CAN 1 1/2 12/01/31'][i % 4],
  cusip: ['68333ZBG1', '135087M84', '135087Q49', '135087L93'][i % 4],
  bidSize: 1000000 + (i % 3) * 250000,
  bidYield: 5.0 - (i % 5) * 0.125,
  bid: 91.5 + (i % 4) * 0.375,
  ask: 89.02 + (i % 4) * 0.375,
  askYield: 5.0 + (i % 3) * 0.05,
  ccy: 'CAD',
  askSize: 1000000,
  benchmark: 'CAN 1 06/01/27',
  spread: 2.34 + (i % 3) * 0.11,
  factor: 0.6,
  baSpread: [52.89, -72.53][i % 2] + (i % 4) * 0.4,
  dv01: 7.961 + (i % 5) * 0.12,
  pricer: ['Csikszentmihalyi, M.', 'Okafor, A.', 'Lindqvist, E.'][i % 3],
}));

export type DepthLevel = { level: number; bidSize: number; bid: number; ask: number; askSize: number };
export const DEPTH: DepthLevel[] = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  bidSize: [250, 500, 1200, 300, 750, 2000, 450, 900, 1500, 600][i],
  bid: +(129.905 - i * 0.005).toFixed(3),
  ask: +(129.915 + i * 0.005).toFixed(3),
  askSize: [300, 650, 400, 1800, 500, 950, 1300, 220, 700, 1100][i],
}));
