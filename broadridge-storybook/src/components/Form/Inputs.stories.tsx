import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TextField } from './Field';
import { NumberInput } from './NumberInput';
import { Select, type SelectOption, type SelectType } from './Select';
import { RangeSlider, ValueSlider } from './Slider';

const meta = {
  title: 'Components/Form Elements/Inputs',
  component: Select,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);
const row = { display: 'flex', gap: 'var(--br-scale-600)', alignItems: 'flex-start', flexWrap: 'wrap' } as const;

const YIELD: SelectOption[] = [
  { value: 'ask', label: 'Ask Yield', shortcut: 'Alt + A' },
  { value: 'bid', label: 'Bid Yield', shortcut: 'Alt + B' },
  { value: 'mid', label: 'Mid Yield', shortcut: 'Alt + M' },
  { value: 'spread', label: 'Spread to benchmark' },
  { value: 'z', label: 'Z-spread', disabled: true },
];
const CCY: SelectOption[] = ['USD', 'EUR', 'GBP', 'CAD', 'JPY'].map((c) => ({ value: c, label: c }));

export const Dropdown: Story = {
  name: 'Dropdown',
  args: { options: YIELD, value: 'ask', onChange: () => {} },
  render: () => {
    const [v, setV] = useState<Record<SelectType, string | null>>({ primary: 'ask', secondary: 'ask', filter: 'ask', group: 'ask' });
    const [multi, setMulti] = useState<string[]>(['USD', 'CAD']);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)', paddingBottom: 220 }}>
        <section>
          <H>Types</H>
          <div style={row}>
            {(['primary', 'secondary', 'filter', 'group'] as SelectType[]).map((t) => (
              <Select key={t} type={t} label={t === 'filter' ? 'Overflow Filter' : t === 'group' ? 'Overflow Group' : t[0].toUpperCase() + t.slice(1)} aside="Reset" onAside={() => setV({ ...v, [t]: null })} options={YIELD} value={v[t]} onChange={(x) => setV({ ...v, [t]: x })} width={200} />
            ))}
          </div>
        </section>
        <section>
          <H>Sizes and states</H>
          <div style={row}>
            <Select label="Small" size="small" options={CCY} value="USD" onChange={() => {}} width={120} />
            <Select label="Medium" options={CCY} value="USD" onChange={() => {}} width={120} />
            <Select label="Large" size="large" options={CCY} value="USD" onChange={() => {}} width={120} />
            <Select label="Error" error message="Choose a currency" options={CCY} value={null} onChange={() => {}} width={140} />
            <Select label="Deactivated" disabled options={CCY} value="USD" onChange={() => {}} width={120} />
          </div>
        </section>
        <section>
          <H>Multi-select</H>
          <Select multiple label="Currencies" options={CCY} value={multi} onChange={setMulti} width={200} />
        </section>
      </div>
    );
  },
};

export const TextFields: Story = {
  name: 'Text field',
  args: { options: [], value: null, onChange: () => {} },
  render: () => (
    <div style={row}>
      <TextField label="Session date" icon="calendar-today" defaultValue="2026-06-22" width={160} />
      <TextField label="Start time" defaultValue="08:30" width={160} />
      <TextField label="Net Position" placeholder="9,000,000,000" align="right" width={180} />
      <TextField label="Urgency" defaultValue="1.0" unit="bps" align="right" width={100} />
      <TextField label="Venue" defaultValue="SI" disabled width={160} />
      <TextField label="Client ID" defaultValue="ABC-00" error message="Unknown client ID" width={160} />
    </div>
  ),
};

export const NumberInputs: Story = {
  name: 'Number input',
  args: { options: [], value: null, onChange: () => {} },
  render: () => {
    const [price, setPrice] = useState(129.905);
    const [size, setSize] = useState(250);
    return (
      <div style={row}>
        <NumberInput label="Ask Yield" aside="Reset" onAside={() => setPrice(129.905)} pips={[0.1, 0.01, 0.001]} value={price} onChange={setPrice} />
        <NumberInput label="Amount (M)" value={size} onChange={setSize} step={5} min={0} precision={0} />
        <NumberInput label="Error" error message="Above limit" value={500} onChange={() => {}} precision={0} />
        <NumberInput label="Disabled" disabled pips={[0.1, 0.01, 0.001]} value={129.905} onChange={() => {}} />
      </div>
    );
  },
};

export const Sliders: Story = {
  args: { options: [], value: null, onChange: () => {} },
  render: () => {
    const [urgency, setUrgency] = useState(60);
    const [range, setRange] = useState<[number, number]>([10, 50]);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)', maxWidth: 360 }}>
        <section>
          <H>Value slider</H>
          <div style={{ display: 'grid', gap: 'var(--br-scale-400)' }}>
            <ValueSlider label="Urgency" value={urgency} onChange={setUrgency} showValue />
            <ValueSlider label="Without steppers" value={urgency} onChange={setUrgency} steppers={false} />
            <ValueSlider label="Disabled" value={80} onChange={() => {}} disabled />
          </div>
        </section>
        <section>
          <H>Range slider</H>
          <div style={{ display: 'grid', gap: 'var(--br-scale-400)' }}>
            <RangeSlider label="Participation" value={range} onChange={setRange} minGap={5} />
            <span className="br-text-bdy-xxsm-reg" style={{ color: 'var(--br-text-information-low)' }}>
              {range[0]}% – {range[1]}% participation
            </span>
            <RangeSlider label="Disabled" value={[0, 100]} onChange={() => {}} disabled />
          </div>
        </section>
      </div>
    );
  },
};
