import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ButtonSelector, Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs & Selectors',
  component: Tabs,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Figma: Tabs page. Tab into a group, then use ← → Home End.' } } },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);

export const TextTabs: Story = {
  name: 'Text tabs',
  args: { items: [], value: '', onChange: () => {} },
  render: () => {
    const [a, setA] = useState('pre');
    const [b, setB] = useState('order');
    const PHASES = [{ value: 'pre', label: 'Pre-trade' }, { value: 'intra', label: 'Intra-trade' }, { value: 'post', label: 'Post-trade' }, { value: 'tca', label: 'TCA', disabled: true }];
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)', maxWidth: 520 }}>
        <section>
          <H>Large</H>
          <Tabs aria-label="Trade phase" items={PHASES} value={a} onChange={setA} />
        </section>
        <section>
          <H>Small</H>
          <Tabs aria-label="Parameters" size="small" items={[{ value: 'order', label: 'Order parameters' }, { value: 'bench', label: 'Benchmark parameters' }]} value={b} onChange={setB} />
        </section>
      </div>
    );
  },
};

const MAT = [{ value: 'a', label: 'Maturity' }, { value: 'b', label: 'Yield' }, { value: 'c', label: 'Spread' }];

export const Selectors: Story = {
  name: 'Button selectors',
  args: { items: [], value: '', onChange: () => {} },
  render: () => {
    const [v1, s1] = useState('a');
    const [v2, s2] = useState('b');
    const [v3, s3] = useState('a');
    const [pip, setPip] = useState('0.1');
    const [op, setOp] = useState('and');
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
        <section>
          <H>Navigation · Large and Small</H>
          <div style={{ display: 'flex', gap: 'var(--br-scale-600)', alignItems: 'center', flexWrap: 'wrap' }}>
            <ButtonSelector aria-label="Measure" options={MAT} value={v1} onChange={s1} />
            <ButtonSelector aria-label="Measure, small" size="small" options={MAT} value={v2} onChange={s2} />
            <ButtonSelector aria-label="Measure, disabled" options={MAT} value="a" onChange={() => {}} disabled />
          </div>
        </section>
        <section>
          <H>Navigation · Level 2 background</H>
          <div style={{ padding: 'var(--br-scale-400)', background: 'var(--br-surface-global-level-3)', borderRadius: 'var(--br-radius-xlg)', width: 'fit-content' }}>
            <ButtonSelector aria-label="Measure on panel" background="level-2" options={MAT} value={v3} onChange={s3} />
          </div>
        </section>
        <section>
          <H>Ticket</H>
          <ButtonSelector aria-label="Increment" variant="ticket" options={['0.1', '0.01', '0.001'].map((v) => ({ value: v, label: v }))} value={pip} onChange={setPip} />
        </section>
        <section>
          <H>Floating operator selector</H>
          <ButtonSelector aria-label="Operator" variant="floating" options={['And', 'Or', 'Not', 'Equals', 'Contains'].map((v) => ({ value: v.toLowerCase(), label: v }))} value={op} onChange={setOp} />
        </section>
      </div>
    );
  },
};
