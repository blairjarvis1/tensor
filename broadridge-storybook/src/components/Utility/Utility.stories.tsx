import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SquareIconButton } from '../Button/ActionButtons';
import { Button } from '../Button/Button';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { OverlayFade, Pagination, ScrollArea, Separator, StatusPill, Tooltip } from './Utility';

const meta = {
  title: 'Components/Pagination, Tooltips, UI & Status',
  component: Pagination,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);

export const PaginationStory: Story = {
  name: 'Pagination',
  args: { page: 0, pages: 1, onChange: () => {} },
  render: () => {
    const [a, setA] = useState(2);
    const [b, setB] = useState(2);
    const [c, setC] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)', justifyItems: 'start' }}>
        <section><H>Large with text</H><Pagination page={a} pages={6} onChange={setA} caption={['Weyland-Yutani', `Analysis ${a + 1} of 6`]} /></section>
        <section><H>Small</H><Pagination size="small" page={b} pages={6} onChange={setB} /></section>
        <section><H>Aggregate view</H><Pagination page={c} pages={10} onChange={setC} caption={['Weyland-Yutani', `Analysis ${c + 1} of 10`]} /></section>
      </div>
    );
  },
};

export const Tooltips: Story = {
  args: { page: 0, pages: 1, onChange: () => {} },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--br-scale-1100)', padding: 'var(--br-scale-1100)', alignItems: 'center' }}>
      <Tooltip content="I am a tooltip"><Button variant="secondary">Hover or focus me</Button></Tooltip>
      <Tooltip content="Refresh prices" placement="bottom"><SquareIconButton icon="refresh" aria-label="Refresh" /></Tooltip>
      <Tooltip content="Pin this RFQ" placement="right"><SquareIconButton icon="keep" aria-label="Pin" /></Tooltip>
    </div>
  ),
};

export const UI: Story = {
  name: 'Separators, scroll bars & fades',
  args: { page: 0, pages: 1, onChange: () => {} },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-800)', maxWidth: 520 }}>
      <section>
        <H>Separators</H>
        <div style={{ display: 'grid', gap: 'var(--br-scale-300)' }}>
          {([1, 2, 3, 4, 5] as const).map((l) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="br-text-bdy-xxsm-reg" style={{ width: 50, color: 'var(--br-text-information-low)' }}>Level {l}</span>
              <Separator level={l} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 24 }} className="br-text-bdy-sm-reg">
            <span>Showing 1,231 rows</span><Separator orientation="vertical" level={2} /><span>2 filters applied</span>
          </div>
        </div>
      </section>
      <section>
        <H>Scroll area with overlay fade</H>
        <OverlayFade edges={['top', 'bottom']} to="var(--br-surface-global-level-1)">
          <ScrollArea maxHeight={180} label="Order notes">
            <div className="br-text-bdy-sm-reg" style={{ display: 'grid', gap: 8, padding: '12px 4px', color: 'var(--br-text-body)' }}>
              {Array.from({ length: 16 }, (_, i) => <span key={i}>10:{String(12 + i).padStart(2, '0')} Fill 250 @ 129.9{i % 10} on ES Main</span>)}
            </div>
          </ScrollArea>
        </OverlayFade>
      </section>
    </div>
  ),
};

export const Status: Story = {
  name: 'Execution status & RFQ fill',
  args: { page: 0, pages: 1, onChange: () => {} },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--br-scale-1100)', flexWrap: 'wrap' }}>
      <section style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
        <H>Live</H>
        <StatusPill status="new" />
        <StatusPill status="working" />
        <StatusPill status="part-filled" fill={0.45} />
        <StatusPill status="filled" />
        <StatusPill status="cancelled" />
      </section>
      <section style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
        <H>Final</H>
        <StatusPill status="working" final />
        <StatusPill status="part-filled" fill={0.7} final />
        <StatusPill status="filled" final />
        <StatusPill status="cancelled" final />
      </section>
      <section style={{ display: 'grid', gap: 10, alignContent: 'start', width: 200 }}>
        <H>RFQ fill</H>
        {[0, 0.25, 0.45, 0.7, 0.9].map((v) => <ProgressBar key={v} value={v} />)}
        {[0.25, 0.45, 0.7, 0.9].map((v) => <ProgressBar key={`l${v}`} value={v} size="large" />)}
      </section>
      <section style={{ display: 'grid', gap: 10, alignContent: 'start', width: 200 }}>
        <H>Greyed out</H>
        {[0.25, 0.45, 0.7, 0.9].map((v) => <ProgressBar key={v} value={v} muted />)}
        {[0.25, 0.45, 0.7, 0.9].map((v) => <ProgressBar key={`l${v}`} value={v} size="large" muted />)}
      </section>
    </div>
  ),
};
