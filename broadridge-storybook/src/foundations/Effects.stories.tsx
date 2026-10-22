import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyVar, Page, Section } from './kit/Kit';
import { meta as data } from './kit/meta';

const USES: Record<string, string> = {
  'Card light hover shadow': 'Card rollover',
  'Modal light': 'Modals and confirmation dialogs',
  'Menu Modal': 'Menus and dropdown popovers',
  'Presentation ticket': 'Floating trade ticket and analysis panel',
};

const overlays = [
  { name: 'Surface/Global/Overlay Level 1', css: '--br-surface-global-overlay-level-1', use: 'Scrim behind modals' },
  { name: 'Surface/Global/Overlay Level 2', css: '--br-surface-global-overlay-level-2', use: 'Subtle tint over content' },
];

const meta = {
  title: 'Foundations/Effects',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Elevation: Story = {
  name: 'Shadows & overlays',
  render: () => (
    <Page
      eyebrow="Foundations · Effects"
      title="Shadows & overlays"
      lede="Four Figma effect styles, all soft drop shadows with no offset except the floating ticket. The shadows are fixed values; the mode-aware shadow colour lives in the semantic token Effects/Dropshadow."
    >
      <Section title="Effect styles" count={data.effects.length}>
        <div className="fd-grid" style={{ gap: 'var(--br-scale-800)' }}>
          {data.effects.map((e) => (
            <div className="fd-card" key={e.css} style={{ boxShadow: `var(${e.css})`, borderColor: 'transparent', background: 'var(--br-surface-global-level-3)' }}>
              <span className="fd-card-title br-text-h5-med">{e.name}</span>
              <span className="fd-meta">{USES[e.name]}</span>
              <code className="fd-hex fd-meta">{e.value}</code>
              <CopyVar css={e.css} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Overlays" note="Semantic tokens, so they change with the Theme toolbar.">
        <div className="fd-grid">
          {overlays.map((o) => (
            <div className="fd-card" key={o.css}>
              <div style={{ position: 'relative', height: 96, borderRadius: 'var(--br-radius-lg)', overflow: 'hidden', background: 'var(--br-surface-card-on)' }}>
                <div style={{ padding: 'var(--br-scale-300)' }}>
                  <span className="br-text-bdy-sm-med" style={{ color: 'var(--br-text-headings)' }}>
                    SELL 500 CGBM26 @ 120.21
                  </span>
                </div>
                <div style={{ position: 'absolute', inset: '40% 0 0 0', background: `var(${o.css})` }} />
              </div>
              <span className="fd-card-title br-text-bdy-sm-med">{o.name}</span>
              <span className="fd-meta">{o.use}</span>
              <CopyVar css={o.css} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Paint styles" count={data.paints.length}>
        <div className="fd-grid">
          {data.paints.map((p) => (
            <div className="fd-card" key={p.css}>
              <div style={{ height: 72, borderRadius: 'var(--br-radius-lg)', background: `var(${p.css})` }} />
              <span className="fd-card-title br-text-bdy-sm-med">{p.name}</span>
              <code className="fd-hex fd-meta">{p.value}</code>
              <CopyVar css={p.css} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
