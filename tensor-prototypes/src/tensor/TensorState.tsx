import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { makeChildren, makeOrders, type ChildRow, type Order } from './data';

export type Theme = 'light' | 'dark';
export type Flash = Record<string, Record<string, 'up' | 'down'>>;
export type ToastMsg = { id: number; text: string; tone: 'success' | 'error' };

type Ctx = {
  orders: Order[];
  setOrders: (f: (o: Order[]) => Order[]) => void;
  /** Parent selection drives the child window. */
  selectedOrderId: string | null;
  selectOrder: (id: string | null) => void;
  selectedOrder: Order | null;
  children: ChildRow[];
  childLoading: boolean;
  /** Live feed (bolt toggle) and pause, from the Order Book filter bar. */
  live: boolean;
  setLive: (v: boolean) => void;
  paused: boolean;
  setPaused: (v: boolean) => void;
  flash: Flash;
  /** Instrument search from the Tensor header, applied to the Order Book. */
  globalQuery: string;
  setGlobalQuery: (q: string) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toasts: ToastMsg[];
  toast: (text: string, tone?: 'success' | 'error') => void;
};

const C = createContext<Ctx | null>(null);
export const useTensor = () => {
  const c = useContext(C);
  if (!c) throw new Error('useTensor outside TensorState');
  return c;
};

const pad = (n: number) => String(n).padStart(2, '0');
const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('tensor-theme');
    return t === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function TensorState({ children: kids }: { children: ReactNode }) {
  const [orders, setOrdersState] = useState(() => makeOrders());
  const [selectedOrderId, setSelected] = useState<string | null>(() => orders[0]?.id ?? null);
  const [childLoading, setChildLoading] = useState(false);
  // Live feed is on from the start; the bolt toggle in the Order Book bar turns it off.
  const [live, setLive] = useState(true);
  const [paused, setPaused] = useState(false);
  const [flash, setFlash] = useState<Flash>({});
  const [globalQuery, setGlobalQuery] = useState('');
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const setOrders = useCallback((f: (o: Order[]) => Order[]) => setOrdersState(f), []);

  // Light is the default; the corner toggle switches the whole page.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('tensor-theme', theme);
    } catch {
      /* storage unavailable: the toggle still works for this visit */
    }
  }, [theme]);

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) ?? null, [orders, selectedOrderId]);
  // Child rows depend only on which order is selected, not on its live fields.
  const children = useMemo(() => (selectedOrder ? makeChildren(selectedOrder) : []), [selectedOrderId]);

  const loadTimer = useRef<number | undefined>(undefined);
  const selectOrder = useCallback((id: string | null) => {
    setSelected(id);
    // A short load state so the child visibly refreshes from the parent.
    setChildLoading(true);
    window.clearTimeout(loadTimer.current);
    loadTimer.current = window.setTimeout(() => setChildLoading(false), 280);
  }, []);

  // Live feed: every ~1.4s a few orders fill, prices tick and Last Action updates; now and then a new
  // order arrives at the top (about 4 a minute).
  const seq = useRef(1);
  useEffect(() => {
    if (!live || paused) return;
    const t = window.setInterval(() => {
      const f: Flash = {};
      setOrdersState((all) => {
        const next = [...all];
        for (let k = 0; k < 4; k++) {
          // Weighted towards the top of the book, so the rows on screen visibly fill.
          const i = Math.floor(Math.random() ** 1.8 * Math.min(next.length, 40));
          const o = { ...next[i] };
          const dir = Math.random() > 0.5 ? 1 : -1;
          o.px = +(o.px * (1 + dir * 0.0006)).toFixed(o.px < 200 ? 3 : 2);
          o.risk = +(o.risk * (1 + dir * 0.004)).toFixed(3);
          o.lastAction = nowTime();
          const cells: Record<string, 'up' | 'down'> = { px: dir > 0 ? 'up' : 'down', risk: dir > 0 ? 'up' : 'down', lastAction: 'up' };
          // Fills move in visible steps but at a pace that keeps a mix of statuses through a demo.
          const fills = Math.random() < 0.55;
          if (Math.random() < 0.25 && (o.status === 'working' || o.status === 'new')) {
            o.status = 'part-filled';
            o.fill = 0.05;
            cells.status = 'up';
          } else if (fills && o.status === 'part-filled') {
            o.fill = Math.min(1, o.fill + 0.05 + Math.random() * 0.07);
            if (o.fill >= 1) {
              o.status = 'filled';
              o.fill = 1;
            }
            cells.status = 'up';
          }
          o.execQty = Math.round(o.qty * o.fill);
          cells.execQty = 'up';
          next[i] = o;
          f[o.id] = cells;
        }
        // New orders arrive at the top of the book now and then, so New and Working never run out.
        if (Math.random() < 0.1) {
          const src = next[Math.floor(Math.random() * next.length)];
          const id = `OB-${490000 + seq.current++}`;
          const t = nowTime();
          next.unshift({ ...src, id, status: Math.random() < 0.5 ? 'new' : 'working', fill: 0, final: false, execQty: 0, timestamp: `10/10/26 ${t}`, lastAction: t, side: Math.random() > 0.35 ? 'BUY' : 'SELL' });
          f[id] = { timestamp: 'up', status: 'up', instrument: 'up', side: 'up', qty: 'up', px: 'up', lastAction: 'up' };
        }
        return next;
      });
      setFlash(f);
    }, 1400);
    return () => window.clearInterval(t);
  }, [live, paused]);

  const toastId = useRef(0);
  const toast = useCallback((text: string, tone: 'success' | 'error' = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value: Ctx = {
    orders,
    setOrders,
    selectedOrderId,
    selectOrder,
    selectedOrder,
    children,
    childLoading,
    live,
    setLive,
    paused,
    setPaused,
    flash,
    globalQuery,
    setGlobalQuery,
    theme,
    setTheme: setThemeState,
    toasts,
    toast,
  };
  return <C.Provider value={value}>{kids}</C.Provider>;
}
