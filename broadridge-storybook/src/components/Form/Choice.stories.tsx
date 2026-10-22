import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox, RadioGroup, Toggle, type ToggleColour } from './Choice';

const meta = {
  title: 'Components/Form Elements/Checkbox, Radio & Toggle',
  component: Checkbox,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', gap: 'var(--br-scale-600)', alignItems: 'center', flexWrap: 'wrap' } as const;
const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);

export const Checkboxes: Story = {
  render: () => {
    const [items, setItems] = useState({ bid: true, ask: false, rfq: false });
    const all = Object.values(items);
    const some = all.some(Boolean) && !all.every(Boolean);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
        <section>
          <H>States</H>
          <div style={row}>
            <Checkbox label="Default" />
            <Checkbox label="Selected" defaultChecked />
            <Checkbox label="Multi-select" indeterminate />
            <Checkbox label="Error" error />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled, selected" disabled defaultChecked />
          </div>
        </section>
        <section>
          <H>Select all (indeterminate)</H>
          <div style={{ display: 'grid', gap: 'var(--br-scale-200)' }}>
            <Checkbox label="All sides" checked={all.every(Boolean)} indeterminate={some} onChange={(e) => setItems({ bid: e.target.checked, ask: e.target.checked, rfq: e.target.checked })} />
            <div style={{ display: 'grid', gap: 'var(--br-scale-200)', paddingLeft: 'var(--br-scale-600)' }}>
              {(Object.keys(items) as (keyof typeof items)[]).map((k) => (
                <Checkbox key={k} label={k.toUpperCase()} checked={items[k]} onChange={(e) => setItems({ ...items, [k]: e.target.checked })} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  },
};

export const Radios: Story = {
  render: () => {
    const [v, setV] = useState('limit');
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
        <section>
          <H>Order type</H>
          <RadioGroup label="Order type" value={v} onChange={setV} options={[{ value: 'market', label: 'Market' }, { value: 'limit', label: 'Limit' }, { value: 'stop', label: 'Stop' }, { value: 'iceberg', label: 'Iceberg', disabled: true }]} />
        </section>
        <section>
          <H>Disabled group</H>
          <RadioGroup label="Venue" value="es" onChange={() => {}} disabled options={[{ value: 'es', label: 'ES Main' }, { value: 'lit', label: 'Lit' }]} />
        </section>
      </div>
    );
  },
};

const colours: ToggleColour[] = ['standard', 'green', 'purple', 'red', 'yellow'];

export const Toggles: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
      {(['medium', 'small'] as const).map((size) => (
        <section key={size}>
          <H>{size === 'medium' ? 'Medium' : 'Small'}</H>
          <div style={{ display: 'grid', gap: 'var(--br-scale-300)' }}>
            {colours.map((c) => (
              <div key={c} style={row}>
                <Toggle size={size} colour={c} label={c[0].toUpperCase() + c.slice(1)} defaultChecked />
                <Toggle size={size} colour={c} label="Off" />
                {c === 'standard' && (
                  <>
                    <Toggle size={size} label="Disabled on" disabled defaultChecked />
                    <Toggle size={size} label="Disabled off" disabled />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};
