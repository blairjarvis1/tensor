import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { ConfirmDialog, EmptyState, GlobalBanner, StatusToast, Toast } from './Messaging';

const meta = {
  title: 'Components/Messaging',
  component: GlobalBanner,
  parameters: { layout: 'fullscreen' },
  args: { children: 'This is a global notification error message on one line', tone: 'error' },
} satisfies Meta<typeof GlobalBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);
const row = { display: 'flex', gap: 'var(--br-scale-600)', alignItems: 'flex-start', flexWrap: 'wrap' } as const;

export const Banners: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-300)', maxWidth: 520 }}>
        {show ? <GlobalBanner tone="error" onDismiss={() => setShow(false)} action={{ label: 'Retry', onClick: () => {} }}>Pricing feed disconnected. Quotes may be stale.</GlobalBanner> : <Button variant="secondary" onClick={() => setShow(true)}>Show banner again</Button>}
        <GlobalBanner tone="warning">Market closes in 15 minutes.</GlobalBanner>
        <GlobalBanner tone="success">All 12 orders were sent.</GlobalBanner>
        <GlobalBanner tone="info">A new version of Tensor is available.</GlobalBanner>
      </div>
    );
  },
};

export const Toasts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
      <section>
        <H>Notification toast</H>
        <div style={row}>
          <Toast title="Notification message" onProceed={() => {}} onCancel={() => {}}>This is an example message of a toast notification over two lines?</Toast>
          <Toast tone="info" title="Ticket claimed">J.Howard has claimed RFQ B CAN 3 1/2 12/01/45.</Toast>
        </div>
      </section>
      <section>
        <H>Status toast</H>
        <div style={row}>
          <StatusToast tone="success">Price Sent</StatusToast>
          <StatusToast tone="error">Error Toast</StatusToast>
        </div>
      </section>
    </div>
  ),
};

export const Confirmation: Story = {
  name: 'Confirmation modal',
  render: () => {
    const [open, setOpen] = useState(true);
    const [result, setResult] = useState('');
    return (
      <div style={{ position: 'relative', height: 360, display: 'grid', placeItems: 'center', border: '1px dashed var(--br-border-separator-level-2)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <Button onClick={() => setOpen(true)}>Accept trade</Button>
          <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-information-low)' }}>{result}</span>
        </div>
        <ConfirmDialog inline open={open} title="Accept trade" onCancel={() => { setOpen(false); setResult('Cancelled'); }} onConfirm={() => { setOpen(false); setResult('Trade accepted'); }}>
          You just chose to <strong>accept</strong> this trade. This action cannot be changed. Are you sure you want to proceed?
        </ConfirmDialog>
      </div>
    );
  },
};

export const Placeholders: Story = {
  name: 'Empty and issue placeholders',
  render: () => (
    <div style={row}>
      <EmptyState icon="ticket">You have no RFQs</EmptyState>
      <EmptyState icon="data-table" hint="Change your filters to see more rows.">You have no data</EmptyState>
      <EmptyState tone="issue" hint="We couldn't load this panel.">Issue Placeholder</EmptyState>
    </div>
  ),
};
