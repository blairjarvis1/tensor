import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox, Toggle } from '../Form/Choice';
import { TextField } from '../Form/Field';
import { Select } from '../Form/Select';
import { RangeSlider } from '../Form/Slider';
import { Icon } from '../Icon/Icon';
import { Chip } from '../Pills/Pills';
import { ButtonSelector } from '../Tabs/Tabs';
import { ColumnConfig, GridSettingsPanel, GroupingChain, SettingsCard, SettingsDialog, SettingsRow, SettingsSection, settingsStyles as s, type GridSettingsTab } from './Settings';

const meta = {
  title: 'Components/Settings',
  component: SettingsDialog,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SettingsDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));
const USER = { name: 'A. Kennington', account: 'Tensor account', initials: 'AK' };
const NAV = [
  { items: [{ id: 'interface', label: 'Interface', icon: 'interface' as const }, { id: 'rfqs', label: 'RFQs', icon: 'ticket' as const }] },
  { title: 'Analytics', items: [{ id: 'behaviour', label: 'Behaviour', icon: 'behaviour' as const }] },
  { title: 'Data Grids', items: [{ id: 'columns', label: 'Columns', icon: 'columns' as const }, { id: 'appearance', label: 'Appearance', icon: 'appearance' as const }] },
  { title: 'Prioritisation', items: [{ id: 'alerts', label: 'Alerts', icon: 'alerts' as const }] },
];
const DEFAULT_COLS = ['ID', 'Instrument', 'Benchmark', 'Bid $', 'Ask $', 'Last $', 'Settlement days', 'Pricing method', 'BA Spread', 'Spread', 'Yield', 'Benchmark side'];

function Interface() {
  const [clock24, setClock24] = useState(false);
  const [autoTz, setAutoTz] = useState(true);
  const [lang, setLang] = useState<string | null>('English (Canada)');
  const [units, setUnits] = useState('metric');
  const [week, setWeek] = useState<string | null>('Monday');
  const [pip, setPip] = useState('0.1');
  return (
    <>
      <SettingsSection label="Date & time">
        <SettingsCard>
          <SettingsRow label="Date & time">10:58:56 @ 20 April 2026</SettingsRow>
          <SettingsRow label="Use 24-hour clock"><Toggle aria-label="Use 24-hour clock" checked={clock24} onChange={(e) => setClock24(e.target.checked)} /></SettingsRow>
        </SettingsCard>
        <SettingsCard>
          <SettingsRow label="Set time zone automatically using location"><Toggle aria-label="Set time zone automatically" checked={autoTz} onChange={(e) => setAutoTz(e.target.checked)} /></SettingsRow>
          <SettingsRow label="Time zone">Eastern Time Zone (ET)</SettingsRow>
          <SettingsRow label="Closest city">Montreal, Quebec</SettingsRow>
        </SettingsCard>
      </SettingsSection>
      <SettingsSection label="Language & region">
        <SettingsCard>
          <SettingsRow label="Preferred language"><Select size="small" options={opts(['English (Canada)', 'English (UK)', 'Français (Canada)'])} value={lang} onChange={setLang} width={150} /></SettingsRow>
        </SettingsCard>
        <SettingsCard>
          <SettingsRow label="Measurement system"><ButtonSelector aria-label="Measurement system" size="small" options={[{ value: 'metric', label: 'Metric' }, { value: 'us', label: 'US' }, { value: 'uk', label: 'UK' }]} value={units} onChange={setUnits} /></SettingsRow>
          <SettingsRow label="Week starts"><Select size="small" options={opts(['Monday', 'Sunday'])} value={week} onChange={setWeek} width={110} /></SettingsRow>
          <SettingsRow label="Price increment"><ButtonSelector aria-label="Price increment" variant="ticket" options={opts(['0.1', '0.01', '0.001'])} value={pip} onChange={setPip} /></SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </>
  );
}

export const GlobalSettings: Story = {
  name: 'Global settings',
  args: { user: USER, nav: [], active: '', onNavigate: () => {}, children: null },
  render: () => {
    const [page, setPage] = useState('interface');
    const [cols, setCols] = useState(DEFAULT_COLS);
    const [add, setAdd] = useState<string | null>(null);
    return (
      <SettingsDialog user={USER} nav={NAV} active={page} onNavigate={setPage} subtitle={page === 'columns' ? 'Data grids Columns' : 'General'} onClose={() => {}}>
        {page === 'columns' ? (
          <ColumnConfig
            columns={cols}
            onChange={setCols}
            onReset={() => setCols(DEFAULT_COLS)}
            footer={<Select label="Add Column(s)" placeholder="Choose a column" options={opts(['Coupon', 'Maturity', 'CUSIP', 'DV01', 'Primary pricer'].filter((c) => !cols.includes(c)))} value={add} onChange={(v) => { setCols([...cols, v]); setAdd(null); }} />}
          />
        ) : page === 'interface' ? (
          <Interface />
        ) : (
          <p className="br-text-bdy-sm-reg" style={{ color: 'var(--br-text-information-low)' }}>This section isn't designed yet.</p>
        )}
      </SettingsDialog>
    );
  },
};

function FilterTab() {
  const [range, setRange] = useState<[number, number]>([5, 50]);
  const [scope, setScope] = useState('all');
  const [tiers, setTiers] = useState<string[]>(['Tier 1']);
  const [cell, setCell] = useState<string | null>('Cell text');
  return (
    <>
      <div className={s.forRow}><span>Filters for</span><Select type="secondary" size="small" options={opts(['Cell text', 'Instrument', 'Client'])} value={cell} onChange={setCell} width={110} /></div>
      <TextField label="Search anything" icon="search-check-2" placeholder="Cell text" />
      <TextField label="Date Range" aside="Reset" icon="calendar-today" placeholder="Create Name" />
      <div style={{ display: 'grid', gap: 8 }}>
        <span style={{ color: 'var(--br-text-body-on)', fontWeight: 600 }}>Status</span>
        <div className={s.toggles}>
          <Toggle size="small" label="Pending approval" />
          <Toggle size="small" label="Converted" />
          <Toggle size="small" label="Paid" defaultChecked />
          <Toggle size="small" label="Approved" />
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <span style={{ color: 'var(--br-text-body-on)' }}>Bid Size $</span>
        <RangeSlider label="Bid size" min={0} max={100} value={range} onChange={setRange} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextField aria-label="Minimum" value={`${range[0]}M`} unit="$" width={80} readOnly />
          <TextField aria-label="Maximum" value={`${range[1]}M`} unit="$" width={80} readOnly />
        </div>
      </div>
      <ButtonSelector aria-label="Filter scope" size="small" options={[{ value: 'all', label: 'All filters' }, { value: 'custom', label: 'Custom filters' }]} value={scope} onChange={setScope} />
      <div style={{ display: 'grid', gap: 8 }}>
        <span style={{ color: 'var(--br-text-body-on)', fontWeight: 600 }}>Client tiering</span>
        <div className={s.chipCloud}>
          {['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'].map((t) => <Chip key={t} compact pressed={tiers.includes(t)} onClick={() => setTiers(tiers.includes(t) ? tiers.filter((x) => x !== t) : [...tiers, t])}>{t}</Chip>)}
        </div>
      </div>
    </>
  );
}

function SortTab() {
  const [rules, setRules] = useState([{ id: 1, col: 'Maturity', dir: 'asc' }, { id: 2, col: 'Bid $', dir: 'desc' }]);
  const [scope, setScope] = useState('table');
  const cols = opts(['Maturity', 'Bid $', 'Ask $', 'Spread', 'Yield']);
  return (
    <>
      <ButtonSelector aria-label="Sort scope" size="small" options={[{ value: 'table', label: 'Sort entire table' }, { value: 'rows', label: 'Sort selected rows' }]} value={scope} onChange={setScope} />
      <span style={{ color: 'var(--br-text-body-on)', fontWeight: 600 }}>Sort by</span>
      {rules.map((r) => (
        <div key={r.id} className={s.sortRule}>
          <span style={{ color: 'var(--br-icons-default)', display: 'inline-flex' }}><Icon name="drag-indicator" size={16} /></span>
          <Select size="small" options={cols} value={r.col} onChange={(v) => setRules(rules.map((x) => (x.id === r.id ? { ...x, col: v } : x)))} width="100%" />
          <button type="button" className={s.iconBtn} aria-label={`Remove sort by ${r.col}`} onClick={() => setRules(rules.filter((x) => x.id !== r.id))}><Icon name="delete" size={16} /></button>
          <ButtonSelector aria-label={`${r.col} direction`} size="small" options={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]} value={r.dir} onChange={(v) => setRules(rules.map((x) => (x.id === r.id ? { ...x, dir: v } : x)))} />
        </div>
      ))}
      <button type="button" className={s.add} aria-label="Add sort rule" onClick={() => setRules([...rules, { id: Date.now(), col: 'Spread', dir: 'asc' }])}><Icon name="add-2" size={20} /></button>
      <hr className={s.rule} />
      <span style={{ color: 'var(--br-text-body-on)', fontWeight: 600 }}>Custom Sorting</span>
      <div className={s.forRow} style={{ justifyContent: 'space-between' }}><span>May Maturities</span><Toggle size="small" aria-label="May Maturities" defaultChecked /></div>
      <div className={s.forRow} style={{ justifyContent: 'space-between' }}><span>Q4 Maturities</span><Toggle size="small" aria-label="Q4 Maturities" /></div>
    </>
  );
}

function GroupTab() {
  const [groups, setGroups] = useState(['Maturity', 'Issuer', 'Value 6']);
  const pool = ['Maturity', 'Issuer', 'Value 3', 'Value 4', 'Value 6', 'Value 7', 'Value 8', 'Value 9', 'Value 10'];
  return (
    <>
      <GroupingChain groups={groups} onRemove={(g) => setGroups(groups.filter((x) => x !== g))} />
      <span style={{ color: 'var(--br-text-body-on)', fontWeight: 600 }}>Select column(s)</span>
      <div className={s.chipCloud}>
        {pool.map((p) => <Chip key={p} compact disabled={groups.includes(p)} onClick={() => !groups.includes(p) && setGroups([...groups, p])}>{p}</Chip>)}
      </div>
      <Checkbox label="Show group totals" defaultChecked />
    </>
  );
}

export const GridSettings: Story = {
  name: 'Grid settings panel',
  args: { user: USER, nav: [], active: '', onNavigate: () => {}, children: null },
  render: () => {
    const [tab, setTab] = useState<GridSettingsTab>('filter');
    const [cols, setCols] = useState(DEFAULT_COLS.slice(0, 8));
    return (
      <GridSettingsPanel tab={tab} onTabChange={setTab} onClose={() => {}} onApply={() => {}}>
        {tab === 'filter' && <FilterTab />}
        {tab === 'sort' && <SortTab />}
        {tab === 'group' && <GroupTab />}
        {tab === 'columns' && <ColumnConfig columns={cols} onChange={setCols} onReset={() => setCols(DEFAULT_COLS.slice(0, 8))} />}
      </GridSettingsPanel>
    );
  },
};
