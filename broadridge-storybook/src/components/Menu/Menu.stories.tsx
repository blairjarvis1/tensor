import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Menu, MenuButton, MenuItem, MenuLabel, MenuSeparator } from './Menu';

const meta = {
  title: 'Components/Lists & Menus',
  component: Menu,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Figma: Lists page (Menu - v2, MenuCell - v2). Focus a menu item, then use ↑ ↓ Home End, Enter or Space, and Esc.' } } },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', gap: 'var(--br-scale-800)', alignItems: 'flex-start', flexWrap: 'wrap' } as const;
const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);

export const ColumnMenu: Story = {
  name: 'Column menu (with footer)',
  args: { children: null },
  render: () => (
    <div style={row}>
      <section>
        <H>Default (36px)</H>
        <Menu aria-label="Column options" width={256} footer={<><Button variant="secondary" size="small">Cancel</Button><Button size="small">Done</Button></>}>
          <MenuItem icon="columns" shortcut="Alt + C">Choose columns</MenuItem>
          <MenuItem icon="grouping" shortcut="Alt + G">Group by this column</MenuItem>
          <MenuItem icon="keep" shortcut="Alt + F">Freeze header columns</MenuItem>
          <MenuItem icon="arrows-outward" shortcut="Alt + A">Autosize this column</MenuItem>
          <MenuItem icon="arrows-outward" shortcut="Alt + A">Autosize all columns</MenuItem>
          <MenuSeparator />
          <MenuItem submenu>Sort</MenuItem>
          <MenuItem submenu>Filter</MenuItem>
          <MenuSeparator />
          <MenuItem disabled shortcut="Alt + R">Reset column</MenuItem>
          <MenuItem destructive icon="delete">Remove column</MenuItem>
        </Menu>
      </section>
      <section>
        <H>Small (24px)</H>
        <Menu aria-label="Row actions" size="small" width={220}>
          <MenuLabel>Order ORD-1002</MenuLabel>
          <MenuItem icon="ticket">Open ticket</MenuItem>
          <MenuItem icon="analysis">View analytics</MenuItem>
          <MenuItem icon="escalate">Escalate</MenuItem>
          <MenuItem icon="copy" shortcut="⌘ C">Copy ID</MenuItem>
          <MenuSeparator />
          <MenuItem icon="delete" destructive>Cancel order</MenuItem>
        </Menu>
      </section>
    </div>
  ),
};

const FIELDS = ['Maturity', 'Instrument', 'Benchmark', 'Bid size $', 'Bid price $', 'Ask price $', 'Ask size $', 'Issuer', 'Client', 'Yield spread %', 'Bid spread $', 'Exchange'];

export const MultiSelect: Story = {
  name: 'Multi-select menu',
  args: { children: null },
  render: () => {
    const [on, setOn] = useState<string[]>(['Instrument', 'Benchmark', 'Ask price $', 'Ask size $']);
    const [saved, setSaved] = useState(on);
    return (
      <div style={row}>
        <Menu aria-label="Visible columns" width={240} footer={<><Button variant="secondary" size="small" onClick={() => setOn(saved)}>Cancel</Button><Button size="small" onClick={() => setSaved(on)}>Done</Button></>}>
          {FIELDS.map((f) => (
            <MenuItem key={f} checked={on.includes(f)} onSelect={() => setOn(on.includes(f) ? on.filter((x) => x !== f) : [...on, f])}>
              {f}
            </MenuItem>
          ))}
        </Menu>
        <p className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-body)', maxWidth: 260 }}>
          Applied columns: {saved.join(', ')}
        </p>
      </div>
    );
  },
};

export const WithTrigger: Story = {
  name: 'Opened from a button',
  args: { children: null },
  render: () => {
    const [last, setLast] = useState('Nothing yet');
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-400)', minHeight: 320, alignContent: 'start' }}>
        <MenuButton aria-label="Ticket actions" width={220} trigger={({ open, toggle }) => <Button variant="secondary" iconEnd="keyboard-arrow-down" aria-expanded={open} aria-haspopup="menu" onClick={toggle}>Actions</Button>}>
          {(close) => (
            <>
              <MenuItem icon="analysis" onSelect={() => { setLast('View analytics'); close(); }}>View analytics</MenuItem>
              <MenuItem icon="ticket" onSelect={() => { setLast('Open ticket'); close(); }}>Open ticket</MenuItem>
              <MenuItem icon="bookmark-added" onSelect={() => { setLast('Add to watchlist'); close(); }}>Add to watchlist</MenuItem>
            </>
          )}
        </MenuButton>
        <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-information-low)' }}>
          Last action: {last}
        </span>
      </div>
    );
  },
};
