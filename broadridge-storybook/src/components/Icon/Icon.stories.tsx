import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Page, Search } from '../../foundations/kit/Kit';
import { Icon, iconNames } from './Icon';
import { icons } from './icons';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'close', size: 24 },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: { type: 'number', min: 12, max: 64, step: 4 } },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <span style={{ color: 'var(--br-icons-information)' }}>
      <Icon {...args} />
    </span>
  ),
};

function Gallery() {
  const [q, setQ] = useState('');
  const list = iconNames.filter((n) => n.includes(q.trim().toLowerCase()));
  return (
    <Page eyebrow="Components · Icon" title="Icon set" lede={<>All {iconNames.length} icons exported from Figma. They inherit <code>currentColor</code>; colour them with the <code>--br-icons-*</code> tokens. Use as <code>{'<Icon name="close" size={16} />'}</code>.</>}>
      <div className="fd-toolbar">
        <Search value={q} onChange={setQ} placeholder="Filter icons" />
        <span className="fd-count br-text-bdy-sm-reg">{list.length} icons</span>
      </div>
      <div className="fd-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--br-scale-200)' }}>
        {list.map((n) => (
          <div key={n} className="fd-card" style={{ justifyItems: 'center', textAlign: 'center', padding: 'var(--br-scale-300)' }} title={icons[n].figma}>
            <span style={{ color: 'var(--br-icons-information)' }}>
              <Icon name={n} size={24} />
            </span>
            <code className="fd-meta" style={{ overflowWrap: 'anywhere' }}>{n}</code>
          </div>
        ))}
      </div>
    </Page>
  );
}

export const AllIcons: Story = { name: 'All icons', parameters: { layout: 'fullscreen', pageHeader: false }, render: () => <Gallery /> };
