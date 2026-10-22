import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip, Page, Section } from './kit/Kit';
import { byCollection, groupBy, stepRank, type TokenMeta } from './kit/meta';

const firstMode = (t: TokenMeta) => Object.values(t.modes)[0];
const sortSteps = (list: TokenMeta[]) => [...list].sort((a, b) => stepRank(a.path[a.path.length - 1]) - stepRank(b.path[b.path.length - 1]));
const stepLabel = (t: TokenMeta) => t.path[t.path.length - 1].replace('*', '');

const isRampColour = (t: TokenMeta) => t.figmaType === 'COLOR';

function Ramps({ list, describe }: { list: TokenMeta[]; describe?: (family: string, items: TokenMeta[]) => string | undefined }) {
  const groups = groupBy(list.filter(isRampColour), 1);
  return (
    <div className="fd-ramps">
      {[...groups.entries()].map(([family, items]) => (
        <div className="fd-ramp" key={family}>
          <div className="fd-ramp-name br-text-bdy-sm-med">
            {family}
            {describe?.(family, items) && <small className="br-text-bdy-xxsm-reg">{describe(family, items)}</small>}
          </div>
          <div className="fd-chips">
            {sortSteps(items).map((t) => (
              <Chip key={t.css} label={stepLabel(t)} css={t.css} hex={firstMode(t).value} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const BRAND_ROLES: Record<string, string> = {
  Primary: 'Main action colour. Blue ramp',
  Neutral: 'Dark-mode greys',
  LightUI: 'Light-mode warm greys',
  'Bid Green': 'Bid / buy side',
  'Ask Red': 'Ask / sell side',
  'Price Increase': 'Tick up, success',
  'Price Decrease': 'Tick down',
  RFQ: 'Request for quote, warnings. Orange ramp',
  'Issue Purple': 'Issue severity 1',
  'Issue Red': 'Issue severity 2, input errors',
  'Issue Magenta': 'Issue severity 3',
  Alerts: 'Alert badges and icons',
  'Light Blue': 'Chart backgrounds',
};
function brandDescribe(family: string, items: TokenMeta[]) {
  const sourceFamily = items.map((t) => firstMode(t).alias).find(Boolean)?.split('/')[1];
  const role = BRAND_ROLES[family] ?? (family.startsWith('Chart') ? 'Data-visualisation series' : undefined);
  return [role, sourceFamily && sourceFamily !== family ? `from Raw/${sourceFamily}` : undefined].filter(Boolean).join(' · ') || undefined;
}

const raw = byCollection('raw');
const brand = byCollection('brand');
const brandCore = brand.filter((t) => isRampColour(t) && !t.path[0].startsWith('Chart'));
const brandChart = brand.filter((t) => isRampColour(t) && t.path[0].startsWith('Chart'));

const meta = {
  title: 'Foundations/Palette',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const BrandRoles: Story = {
  name: 'Brand roles',
  render: () => (
    <Page
      eyebrow="Foundations · Palette"
      title="Brand roles"
      lede="The Brand collection gives each raw ramp a job. These colours carry trading meaning (bid, ask, RFQ, issue severity), so use them for that meaning only. Components should still reach them through semantic tokens. Click a chip to copy its variable."
    >
      <Section title="Core roles" count={brandCore.length}>
        <Ramps list={brandCore} describe={brandDescribe} />
      </Section>
      <Section title="Chart series" count={brandChart.length} note="Use only for data visualisation. The Surface/Charting/* semantic tokens pick the default step from each of these.">
        <Ramps list={brandChart} describe={brandDescribe} />
      </Section>
    </Page>
  ),
};

export const RawPrimitives: Story = {
  name: 'Raw primitives',
  render: () => (
    <Page
      eyebrow="Foundations · Palette"
      title="Raw primitives"
      lede="Every hex value in the system lives here. Don't use these directly in components; they exist so Brand and Semantic tokens have something to point at. Default is the 500 step."
    >
      <Section title="Colour ramps" count={raw.filter(isRampColour).length}>
        <Ramps list={raw} />
      </Section>
    </Page>
  ),
};
