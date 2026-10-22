import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Acronym } from '../Grid/DataGrid';
import { DirectionLozenge, IssueLozenge } from '../Lozenge/Lozenge';
import { Chip, Roundel, ScenarioPill } from './Pills';

const meta = {
  title: 'Components/Pills & Chips',
  component: Chip,
  parameters: { layout: 'fullscreen' },
  args: { children: 'Maturity', type: 'filter', filled: false },
  argTypes: { type: { control: 'inline-radio', options: ['filter', 'grouping'] } },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', gap: 'var(--br-scale-300)', alignItems: 'center', flexWrap: 'wrap' } as const;
const H = ({ children }: { children: string }) => (
  <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 var(--br-scale-300)' }}>
    {children}
  </h3>
);

export const Playground: Story = {};

export const Chips: Story = {
  render: () => {
    const [filters, setFilters] = useState(['Maturity', 'Benchmark', 'CCY']);
    const [groups, setGroups] = useState<string[]>(['Issuer']);
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
        <section>
          <H>Filter</H>
          <div style={row}>
            <Chip>Available</Chip>
            <Chip filled>Applied</Chip>
            <Chip filled count={3}>With count</Chip>
            <Chip compact>In panel</Chip>
            <Chip disabled>Deactivated</Chip>
          </div>
        </section>
        <section>
          <H>Grouping</H>
          <div style={row}>
            <Chip type="grouping">Available</Chip>
            <Chip type="grouping" filled>Applied</Chip>
            <Chip type="grouping" compact>In panel</Chip>
            <Chip type="grouping" disabled>Deactivated</Chip>
          </div>
        </section>
        <section>
          <H>Removable (applied filters)</H>
          <div style={row}>
            {filters.map((f) => (
              <Chip key={f} filled onRemove={() => setFilters(filters.filter((x) => x !== f))}>
                {f}
              </Chip>
            ))}
            {filters.length === 0 && <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-information-low)' }}>No filters</span>}
          </div>
        </section>
        <section>
          <H>Toggle (choose grouping)</H>
          <div style={row}>
            {['Issuer', 'Sector', 'Rating', 'Currency'].map((g) => (
              <Chip key={g} type="grouping" pressed={groups.includes(g)} onClick={() => setGroups(groups.includes(g) ? groups.filter((x) => x !== g) : [...groups, g])}>
                {g}
              </Chip>
            ))}
          </div>
        </section>
      </div>
    );
  },
};

export const RoundelsAndScenarios: Story = {
  name: 'Roundels, scenarios & tags',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
      <section>
        <H>Roundels</H>
        <div style={row}>
          <Roundel tone="up" direction="up" />
          <Roundel tone="up" direction="down" />
          <Roundel tone="down" direction="up" />
          <Roundel tone="down" direction="down" />
          <Roundel tone="neutral" direction="flat" />
          <Roundel tone="neutral" direction="up" />
        </div>
      </section>
      <section>
        <H>Metric scenarios</H>
        <div style={row}>
          <ScenarioPill tone="actual" value="0.9" caption="$10,897" />
          <ScenarioPill tone={1} value="1.2" caption="$12,410" />
          <ScenarioPill tone={2} value="0.7" caption="$9,212" />
          <ScenarioPill tone={3} value="1.6" caption="$14,050" />
          <ScenarioPill tone={4} value="1.1" caption="$11,300" />
        </div>
      </section>
      <section>
        <H>Acronym, Bid / Ask and issue lozenges</H>
        <div style={row}>
          <span className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-body)' }}>
            0.600 <Acronym>IS</Acronym>
          </span>
          <DirectionLozenge side="bid" size="large" />
          <DirectionLozenge side="ask" size="large" />
          <IssueLozenge kind="issue-2">Size Warning</IssueLozenge>
          <IssueLozenge kind="issue-1">Limit Breach</IssueLozenge>
          <IssueLozenge kind="issue-3" size="small">Client</IssueLozenge>
        </div>
      </section>
    </div>
  ),
};
