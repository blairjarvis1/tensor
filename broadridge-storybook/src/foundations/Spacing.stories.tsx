import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyVar, Page, Section } from './kit/Kit';
import { byCollection, type TokenMeta } from './kit/meta';

const px = (t: TokenMeta) => parseFloat(Object.values(t.modes)[0].value);
const alias = (t: TokenMeta) => Object.values(t.modes)[0].alias;

const scale = byCollection('raw')
  .filter((t) => t.path[0] === 'Scale')
  .sort((a, b) => px(a) - px(b));
const radius = byCollection('brand')
  .filter((t) => t.path[0] === 'Border Radius')
  .sort((a, b) => px(a) - px(b));
const widths = byCollection('brand')
  .filter((t) => t.path[0] === 'Border Width')
  .sort((a, b) => px(a) - px(b));

const USES: Record<string, string> = {
  '100': 'Icon–label gap in buttons and chips',
  '200': 'Button and chip padding',
  '300': 'Compact line height',
  '400': 'Body line height, toggle knob',
  '600': 'Small control height, chip height',
  '800': 'Medium control height, global header',
  '850': 'Large control height',
  '900': 'Panel header height',
  '1100': 'Full radius for pills and toggles',
};

const meta = {
  title: 'Foundations/Spacing & Shape',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScale: Story = {
  name: 'Spacing scale',
  render: () => (
    <Page
      eyebrow="Foundations · Spacing & Shape"
      title="Spacing scale"
      lede="One 4px-based scale (Raw/Scale) drives padding, gaps, sizes, line heights and radii. The name follows a 100 = 4px convention. Don't use off-scale values."
    >
      <Section title="Scale" count={scale.length}>
        <div className="fd-table-wrap">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Value</th>
                <th style={{ width: '40%' }}>Size</th>
                <th>CSS variable</th>
                <th>Typical use</th>
              </tr>
            </thead>
            <tbody>
              {scale.map((t) => (
                <tr key={t.css}>
                  <td className="fd-name">{t.figmaName}</td>
                  <td className="fd-hex">{px(t)}px</td>
                  <td>
                    <span
                      style={{
                        display: 'block',
                        height: 12,
                        width: `var(${t.css})`,
                        minWidth: 1,
                        background: 'var(--br-surface-action-primary-default)',
                        borderRadius: 'var(--br-radius-sm)',
                      }}
                    />
                  </td>
                  <td>
                    <CopyVar css={t.css} />
                  </td>
                  <td className="fd-meta">{USES[t.path[1]] ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};

export const RadiusAndBorders: Story = {
  name: 'Radius & border width',
  render: () => (
    <Page
      eyebrow="Foundations · Spacing & Shape"
      title="Radius & border width"
      lede="Brand tokens that alias the spacing scale. 4px (Border Radius/lg) is the default corner for buttons, inputs, chips and checkboxes. Strokes are 1px."
    >
      <Section title="Border radius" count={radius.length}>
        <div className="fd-grid">
          {radius.map((t) => (
            <div className="fd-card" key={t.css}>
              <div
                style={{
                  height: 72,
                  background: 'var(--br-surface-global-level-4)',
                  border: 'var(--br-border-width-sm) solid var(--br-border-action-primary)',
                  borderRadius: `var(${t.css})`,
                }}
              />
              <span className="fd-card-title br-text-bdy-sm-med">
                {t.figmaName} · {px(t)}px
              </span>
              <span className="fd-meta">→ {alias(t)}</span>
              <CopyVar css={t.css} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border width" count={widths.length}>
        <div className="fd-grid">
          {widths.map((t) => (
            <div className="fd-card" key={t.css}>
              <div
                style={{
                  height: 48,
                  borderRadius: 'var(--br-radius-lg)',
                  border: `var(${t.css}) solid var(--br-border-action-primary)`,
                  background: 'var(--br-surface-global-level-2)',
                }}
              />
              <span className="fd-card-title br-text-bdy-sm-med">
                {t.figmaName} · {px(t)}px
              </span>
              <span className="fd-meta">→ {alias(t)}</span>
              <CopyVar css={t.css} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
