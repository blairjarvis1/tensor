import type { Meta, StoryObj } from '@storybook/react-vite';
import { DirectionLozenge, IssueLozenge } from './Lozenge';

const meta = {
  title: 'Components/Lozenges',
  component: IssueLozenge,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'From the Figma Pills page. Built early because the RFQ and notification cards use them.' } } },
  args: { kind: 'issue-2', size: 'medium', children: 'Size Warning' },
  argTypes: { kind: { control: 'inline-radio', options: ['issue-1', 'issue-2', 'issue-3', 'system', 'text'] }, size: { control: 'inline-radio', options: ['medium', 'small'] } },
} satisfies Meta<typeof IssueLozenge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Issue: Story = {};

export const AllLozenges: Story = {
  name: 'All lozenges',
  render: () => {
    const row = { display: 'flex', gap: 'var(--br-scale-300)', alignItems: 'center', flexWrap: 'wrap' } as const;
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-400)' }}>
        {(['medium', 'small'] as const).map((size) => (
          <div key={size} style={row}>
            <IssueLozenge kind="issue-1" size={size}>Liquidity</IssueLozenge>
            <IssueLozenge kind="issue-2" size={size}>Size Warning</IssueLozenge>
            <IssueLozenge kind="issue-3" size={size}>Client</IssueLozenge>
            <IssueLozenge kind="system" size={size}>System notification</IssueLozenge>
            <IssueLozenge kind="text" size={size}>Requesting</IssueLozenge>
          </div>
        ))}
        {(['large', 'small'] as const).map((size) => (
          <div key={size} style={row}>
            <DirectionLozenge side="bid" size={size} />
            <DirectionLozenge side="bid" size={size} disabled />
            <DirectionLozenge side="ask" size={size} />
            <DirectionLozenge side="ask" size={size} disabled />
          </div>
        ))}
      </div>
    );
  },
};
