import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyVar, Page, Section } from './kit/Kit';
import { byCollection, meta as data, type TextStyleMeta } from './kit/meta';

const GROUP_ORDER = ['Headings/H1', 'Headings/H2', 'Headings/H3', 'Headings/H4', 'Headings/H5', 'Bdy/Bdy lg', 'Bdy/Bdy md', 'Bdy/Bdy sm', 'Bdy xsm', 'Bdy/Bdy XS'];
const GROUP_USE: Record<string, string> = {
  'Headings/H1': 'Hero numbers, rare',
  'Headings/H2': 'Large display',
  'Headings/H3': 'Large metric values, page titles',
  'Headings/H4': 'Metric box values, panel titles',
  'Headings/H5': 'Section headings, card titles',
  'Bdy/Bdy lg': 'Emphasised body',
  'Bdy/Bdy md': 'Panel content, Medium button labels',
  'Bdy/Bdy sm': 'Default UI text: inputs, menus, grid cells',
  'Bdy xsm': 'Field labels, compact labels',
  'Bdy/Bdy XS': 'Captions, helper text, checkbox and toggle labels',
};
const SAMPLE: Record<string, string> = {
  Headings: 'B CAN 3 1/2 12/01/45',
  Bdy: 'Part Filled · 250M @ 129.905 · Yield −5.175',
};

const grouped = GROUP_ORDER.map((g) => [g, data.textStyles.filter((s) => s.group === g)] as const).filter(([, l]) => l.length);

function Specimen({ s }: { s: TextStyleMeta }) {
  const sample = SAMPLE[s.figmaName.startsWith('Headings') ? 'Headings' : 'Bdy'];
  return (
    <tr>
      <td style={{ color: 'var(--br-text-headings)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <span className={s.className} title={sample}>{sample}</span>
      </td>
      <td className="fd-name">{s.figmaName.split('/').pop()}</td>
      <td className="fd-hex">
        {s.fontSize}/{s.lineHeight} · {s.weight}
        {s.textDecoration === 'UNDERLINE' ? ' · underline' : ''}
      </td>
      <td>
        <code className="fd-hex">.{s.className}</code>
      </td>
    </tr>
  );
}

const families = byCollection('raw').filter((t) => t.path[0] === 'Font Family');
const weights = byCollection('raw')
  .filter((t) => t.path[0] === 'Font Weight')
  .sort((a, b) => Number(Object.values(a.modes)[0].value) - Number(Object.values(b.modes)[0].value));
const responsive = byCollection('responsive');
const scaleRows = ['H1', 'H2', 'H3', 'H4', 'H5', 'Body L', 'Body M', 'Body S', 'Body XS', 'Body XXSM'].map((k) => ({
  key: k,
  size: responsive.find((t) => t.figmaName === `${k}/font size`),
  lh: responsive.find((t) => t.figmaName === `${k}/line height`),
  ps: responsive.find((t) => t.figmaName === `${k}/paragraph spacing`),
}));
const v = (t?: { modes: Record<string, { value: string }> }) => (t ? Object.values(t.modes)[0].value : '–');

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const TextStyles: Story = {
  name: 'Text styles',
  render: () => (
    <Page
      eyebrow="Foundations · Typography"
      title="Text styles"
      lede={
        <>
          Inter throughout, in Light, Regular, Medium and Bold. This is a dense trading UI, so most of the interface runs at 10–14px. Each Figma text style has a matching class, for example <code>.br-text-bdy-sm-med</code>.
        </>
      }
    >
      {grouped.map(([g, list]) => (
        <Section key={g} title={g.replace('Bdy/', '').replace('Headings/', '')} note={GROUP_USE[g]}>
          <div className="fd-table-wrap">
            <table className="fd-table is-fixed">
              <thead>
                <tr>
                  <th style={{ width: '52%' }}>Specimen</th>
                  <th style={{ width: '14%' }}>Figma style</th>
                  <th style={{ width: '14%' }}>Size / line · weight</th>
                  <th style={{ width: '20%' }}>Class</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <Specimen key={s.className} s={s} />
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
    </Page>
  ),
};

export const TypeScale: Story = {
  name: 'Type scale & fonts',
  render: () => (
    <Page
      eyebrow="Foundations · Typography"
      title="Type scale & fonts"
      lede="The Responsive collection holds the numbers the text styles bind to. It has one mode, Desktop. Font family and weight come from the Raw collection."
    >
      <Section title="Type scale" note="Body XS has a 12px line height here, but the root-level Bdy xsm Light and Reg styles use 16px. Read the line height from the text style.">
        <div className="fd-table-wrap">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Font size</th>
                <th>Line height</th>
                <th>Paragraph spacing</th>
                <th>Size variable</th>
              </tr>
            </thead>
            <tbody>
              {scaleRows.map((r) => (
                <tr key={r.key}>
                  <td className="fd-name">{r.key}</td>
                  <td className="fd-hex">{v(r.size)}</td>
                  <td className="fd-hex">{v(r.lh)}</td>
                  <td className="fd-hex">{v(r.ps)}</td>
                  <td>{r.size && <CopyVar css={r.size.css} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Font families">
        <div className="fd-grid">
          {families.map((t) => (
            <div className="fd-card" key={t.css}>
              <span className="fd-meta">{t.figmaName}</span>
              <span className="br-text-h3-reg" style={{ fontFamily: `var(${t.css})`, color: 'var(--br-text-headings)' }}>
                Aa 0123
              </span>
              <CopyVar css={t.css} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Font weights">
        <div className="fd-grid">
          {weights.map((t) => (
            <div className="fd-card" key={t.css}>
              <span className="fd-meta">
                {t.figmaName} · {Object.values(t.modes)[0].value}
              </span>
              <span className="br-text-h4-reg" style={{ fontWeight: `var(${t.css})` as unknown as number, color: 'var(--br-text-headings)' }}>
                129.905
              </span>
              <CopyVar css={t.css} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
