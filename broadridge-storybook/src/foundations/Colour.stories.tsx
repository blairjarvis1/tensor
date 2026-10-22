import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { CopyVar, Mini, Page, Search, Section, Swatch } from './kit/Kit';
import { byCollection, groupBy, varRef, type TokenMeta } from './kit/meta';

const GROUP_ORDER = ['Surface', 'Text', 'Border', 'Icons', 'Effects'];
const semantic = byCollection('semantic')
  .filter((t) => t.figmaType === 'COLOR')
  .sort((a, b) => GROUP_ORDER.indexOf(a.path[0]) - GROUP_ORDER.indexOf(b.path[0]) || a.figmaName.localeCompare(b.figmaName, undefined, { numeric: true }));

function ModeCell({ t, mode }: { t: TokenMeta; mode: 'Dark' | 'Light' }) {
  const m = t.modes[mode];
  if (!m) return <td />;
  return (
    <td className="fd-cell">
      <span className="fd-hex">
        <Mini color={m.value} />
        {m.value}
      </span>
      {m.alias && <span className="fd-alias">{m.alias}</span>}
    </td>
  );
}

function SemanticTable({ list }: { list: TokenMeta[] }) {
  return (
    <div className="fd-table-wrap">
      <table className="fd-table">
        <thead>
          <tr>
            <th style={{ width: 56 }}>Live</th>
            <th>Figma token</th>
            <th>CSS variable</th>
            <th>Dark (default)</th>
            <th>Light</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.css}>
              <td>
                <Swatch color={varRef(t.css)} />
              </td>
              <td className="fd-name">{t.figmaName}</td>
              <td>
                <CopyVar css={t.css} />
              </td>
              <ModeCell t={t} mode="Dark" />
              <ModeCell t={t} mode="Light" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const GROUP_NOTES: Record<string, string> = {
  Text: 'Foreground colours for copy. Use Text/Headings for titles, Text/Body for running text and Text/Information Low for metadata.',
  Surface: 'Backgrounds. Surface/Global/Level 1 is the app background; higher levels sit on top of it. Grid, Ticket, Card and Menu groups belong to those components.',
  Border: 'Strokes and separators. Inputs, actions, chips and grid rows each have their own state ramps.',
  Icons: 'Icon fills. Icons/Default is the resting state; Actions/* track the button they sit inside.',
  Effects: 'Shadow colours that change with the mode. Pair them with the effect styles on the Effects page.',
};

function SemanticColours({ only }: { only?: string }) {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = semantic.filter((t) => (!only || t.path[0] === only) && (!needle || `${t.figmaName} ${t.css} ${t.modes.Dark?.value} ${t.modes.Light?.value} ${t.modes.Dark?.alias} ${t.modes.Light?.alias}`.toLowerCase().includes(needle)));
    return groupBy(list, only ? 2 : 1);
  }, [q, only]);
  const total = [...groups.values()].reduce((n, g) => n + g.length, 0);

  return (
    <Page
      eyebrow="Foundations · Colour"
      title={only ? `${only} colours` : 'Semantic colours'}
      lede={
        <>
          The tokens components should use. Each one has a Dark value (the Figma default) and a Light value. Switch the <strong>Theme</strong> toolbar to see the live swatches change. Click a variable to copy <code>var(--…)</code>.
        </>
      }
    >
      <div className="fd-toolbar">
        <Search value={q} onChange={setQ} placeholder="Filter by name, hex or alias" />
        <span className="fd-count br-text-bdy-sm-reg">
          {total} of {only ? semantic.filter((t) => t.path[0] === only).length : semantic.length} tokens
        </span>
      </div>
      {total === 0 && <p className="fd-empty br-text-bdy-sm-reg">No tokens match “{q}”.</p>}
      {[...groups.entries()].map(([name, list]) => (
        <Section key={name} title={name} count={list.length} note={!only ? GROUP_NOTES[name] : undefined}>
          <SemanticTable list={list} />
        </Section>
      ))}
    </Page>
  );
}

const meta = {
  title: 'Foundations/Colour',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const AllSemantic: Story = { name: 'All semantic tokens', render: () => <SemanticColours /> };
export const Surface: Story = { render: () => <SemanticColours only="Surface" /> };
export const Text: Story = { render: () => <SemanticColours only="Text" /> };
export const Border: Story = { render: () => <SemanticColours only="Border" /> };
export const Icons: Story = { render: () => <SemanticColours only="Icons" /> };
