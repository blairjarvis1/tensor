import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { TextField } from './Field';
import { Select } from './Select';
import { ValueSlider } from './Slider';

const meta = {
  title: 'Components/Form Elements/Examples',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compositions from the Figma Form Elements → Examples section.' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const panel = { background: 'var(--br-surface-global-level-3)', border: '1px solid var(--br-border-card)', borderRadius: 'var(--br-radius-xlg)', padding: 'var(--br-scale-400)', display: 'grid', gap: 'var(--br-scale-300)' } as const;
const hint = { color: 'var(--br-text-information-low)', alignSelf: 'end', paddingBottom: 6 } as const;

export const OrderParameters: Story = {
  name: 'Order parameters',
  render: () => {
    const [tz, setTz] = useState<string | null>('UTC');
    const [ccy, setCcy] = useState<string | null>('USD');
    const [cfg, setCfg] = useState<string | null>(null);
    return (
      <div style={{ ...panel, width: 480 }}>
        <div className="br-text-bdy-sm-med" style={{ display: 'flex', gap: 'var(--br-scale-600)', borderBottom: '1px solid var(--br-border-separator-level-2)' }}>
          <span style={{ color: 'var(--br-text-headings)', paddingBottom: 8, borderBottom: '2px solid var(--br-border-action-primary)' }}>Order parameters</span>
          <span style={{ color: 'var(--br-text-body-off)', paddingBottom: 8 }}>Benchmark parameters</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--br-scale-300)' }}>
          <TextField label="Session date" icon="calendar-today" defaultValue="2026-06-22" />
          <Select label="Trading timezone" options={['UTC', 'GMT', 'EST', 'CET'].map((v) => ({ value: v, label: v }))} value={tz} onChange={setTz} />
          <Select label="CCY" options={['USD', 'EUR', 'GBP', 'CAD'].map((v) => ({ value: v, label: v }))} value={ccy} onChange={setCcy} width={90} />
          <TextField label="Start date" icon="calendar-today" defaultValue="2026-06-23" />
          <TextField label="Start time" defaultValue="08:30" />
          <span className="br-text-bdy-xxsm-reg" style={hint}>Start date follows session date</span>
          <TextField label="End date" icon="calendar-today" defaultValue="2026-04-18" />
          <TextField label="End time" defaultValue="08:30" />
          <span className="br-text-bdy-xxsm-reg" style={hint}>End date can extend beyond session date</span>
          <Select label="Saved Config" options={[{ value: 'a', label: 'Aggressive open' }, { value: 'b', label: 'Passive close' }]} value={cfg} onChange={setCfg} />
          <div style={{ alignSelf: 'end' }}>
            <Button variant="secondary" size="medium" iconStart="close">Maturity</Button>
          </div>
        </div>
      </div>
    );
  },
};

const ROWS = [
  { label: 'Urgency', value: 79, unit: '' },
  { label: 'Target Participation', value: 11, unit: '%' },
  { label: 'Liquidity response', value: 75, unit: '' },
  { label: 'Risk reduction bias', value: 25, unit: '' },
];

export const AlgoParameters: Story = {
  name: 'Algo parameters',
  render: () => {
    const [objective, setObjective] = useState<string | null>('sooner');
    const [vals, setVals] = useState(ROWS.map((r) => r.value));
    return (
      <div style={{ ...panel, width: 420 }}>
        <Select label="Objective" type="secondary" options={[{ value: 'sooner', label: 'Finish Sooner' }, { value: 'impact', label: 'Minimise Impact' }, { value: 'vwap', label: 'Track VWAP' }]} value={objective} onChange={setObjective} width={150} />
        {ROWS.map((r, i) => (
          <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 72px', alignItems: 'center', gap: 'var(--br-scale-300)' }}>
            <span className="br-text-bdy-sm-med" style={{ color: 'var(--br-text-body)' }}>
              {r.label}
            </span>
            <ValueSlider label={r.label} value={vals[i]} onChange={(v) => setVals(vals.map((x, j) => (j === i ? v : x)))} />
            <TextField aria-label={r.label} value={String(vals[i])} onChange={(e) => setVals(vals.map((x, j) => (j === i ? Number(e.target.value) || 0 : x)))} unit={r.unit} align="right" width={72} />
          </div>
        ))}
      </div>
    );
  },
};
