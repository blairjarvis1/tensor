import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchBar, type SearchItem } from './SearchBar';

const ITEMS: SearchItem[] = [
  { id: 'c1', label: 'Teffler Industries', kind: 'Clients', description: 'Corporate client, Canadian rates desk. Typical size 25–250M; prefers RFQ over streaming.', tags: ['Maturity'] },
  { id: 'c2', label: 'Tessier Ashpool Corp', kind: 'Clients', description: 'Asset manager. 3 open RFQs, 1 escalation today.', tags: ['Limit breach'] },
  { id: 'c3', label: 'Weyland-Yutani', kind: 'Clients', description: 'Algo client. Running Finish Sooner on 4 orders.', tags: ['Algo'] },
  { id: 'i1', label: 'B CAN 3 1/2 12/01/45', kind: 'Instruments', description: 'Government of Canada 3.5% 2045. ISIN CA1234567890.' },
  { id: 'i2', label: 'CAN 1 06/01/27', kind: 'Instruments', description: 'Government of Canada 1% 2027.' },
  { id: 'i3', label: 'CGBM26', kind: 'Instruments', description: '10-year Canadian bond future, June 2026.' },
  { id: 't1', label: 'ORD-1002 SELL 500 CGBM26', kind: 'Trades', description: 'Part Filled, 45% executed at 120.21.' },
  { id: 't2', label: 'ORD-1007 BUY 1,290,150 SXFU26', kind: 'Trades', description: 'Working since 09:14.' },
  { id: 'k1', label: 'RFQ Teffler Industries 50M', kind: 'Tickets', description: 'Request Offer, Outright CAN 2.250 06/01/2029.' },
  { id: 'a1', label: 'Size Warning: Tessier Ashpool Corp', kind: 'Alerts', description: 'ASK 50M CAN 1 06/01/27, escalated to Marshall, S.' },
];

const meta = {
  title: 'Components/Search',
  component: SearchBar,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Figma: Search / Global Search v.2. Try typing "can", use ↑ ↓ and Enter, or Backspace to remove the last chip.' } } },
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GlobalSearch: Story = {
  name: 'Global search',
  args: { items: [], values: [], onValuesChange: () => {} },
  render: () => {
    const [values, setValues] = useState<SearchItem[]>([]);
    return (
      <div style={{ minHeight: 440 }}>
        <SearchBar items={ITEMS} values={values} onValuesChange={setValues} kinds={['Trades', 'Clients', 'Instruments', 'Tickets', 'Alerts']} width={640} />
      </div>
    );
  },
};

export const WithPreview: Story = {
  name: 'With preview (Phase 3)',
  args: { items: [], values: [], onValuesChange: () => {} },
  render: () => {
    const [values, setValues] = useState<SearchItem[]>([ITEMS[3]]);
    return (
      <div style={{ minHeight: 440 }}>
        <SearchBar items={ITEMS} values={values} onValuesChange={setValues} kinds={['Trades', 'Clients', 'Instruments', 'Tickets', 'Alerts']} preview width={800} />
      </div>
    );
  },
};
