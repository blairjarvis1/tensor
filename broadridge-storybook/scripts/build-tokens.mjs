#!/usr/bin/env node
/**
 * Build CSS + metadata from the Figma exports in src/tokens/source.
 *
 *   tokens.tokens.json  DTCG export of the four Figma variable collections
 *                       (Raw, Brand, Semantic, Responsive) via figma-console-mcp
 *   styles.json         Figma text / effect / paint styles (not variables)
 *
 * Outputs (src/tokens/generated, do not edit by hand):
 *   tokens.css          CSS custom properties. Primitives on :root, Semantic
 *                       tokens on :root + [data-theme="dark"] (Figma default)
 *                       and [data-theme="light"].
 *   typography.css      .br-text-* utility classes, one per Figma text style
 *   tokens.meta.json    Resolved values + alias chains, used by the
 *                       Foundations stories
 *
 * Naming: Figma path → kebab-case, prefixed by layer.
 *   Raw/Blue/Default                  → --br-raw-blue-default
 *   Brand/Primary/*Default            → --br-brand-primary-default
 *   Semantic/Surface/Action/Primary…  → --br-surface-action-primary-default
 *   Responsive/H1/font size           → --br-type-h1-font-size
 *   Raw/Scale/200                     → --br-scale-200 (8px)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src/tokens/source');
const OUT = join(root, 'src/tokens/generated');
mkdirSync(OUT, { recursive: true });

const dtcg = JSON.parse(readFileSync(join(SRC, 'tokens.tokens.json'), 'utf8'));
const styles = JSON.parse(readFileSync(join(SRC, 'styles.json'), 'utf8'));

const P = 'br';
const slug = (s) => String(s).replace(/\*/g, '').replace(/&/g, '-and-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const FONT_WEIGHTS = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, Semibold: 600, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };
const FONT_STACK = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

// ---------------------------------------------------------------- collect
const tokens = []; // { collection, path[], figmaName, type, values: { mode: raw } }
function walk(node, collection, path) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const ext = v.$extensions?.['figma-console-mcp'] ?? {};
      const values = {};
      for (const [mode, sv] of Object.entries(ext.lastSyncedValue ?? {})) values[mode] = sv.reference ?? sv.literal;
      if (!Object.keys(values).length) values[ext.primaryMode ?? 'default'] = v.$value;
      tokens.push({ collection, path: [...path, k], figmaName: [...path, k].join('/'), type: v.$type, figmaType: ext.figmaResolvedType, values, primaryMode: ext.primaryMode, variableId: ext.variableId, description: v.$description });
    } else if (v && typeof v === 'object') walk(v, collection, [...path, k]);
  }
}
for (const [col, node] of Object.entries(dtcg)) if (!col.startsWith('$')) walk(node, col, []);

function cssName(t) {
  const s = t.path.map(slug).join('-');
  if (t.collection === 'raw') {
    if (t.path[0] === 'Scale') return `--${P}-scale-${slug(t.path[1])}`;
    if (t.path[0] === 'Font Family') return `--${P}-font-family-${slug(t.path[1])}`;
    if (t.path[0] === 'Font Weight') return `--${P}-font-weight-${slug(t.path[1])}`;
    return `--${P}-raw-${s}`;
  }
  if (t.collection === 'brand') {
    if (t.path[0] === 'Border Radius') return `--${P}-radius-${slug(t.path[1])}`;
    if (t.path[0] === 'Border Width') return `--${P}-border-width-${slug(t.path[1])}`;
    return `--${P}-brand-${s}`;
  }
  if (t.collection === 'responsive') return `--${P}-type-${s}`;
  return `--${P}-${s}`; // semantic
}

const byRef = new Map();
for (const t of tokens) { t.css = cssName(t); byRef.set(`${t.collection}.${t.path.join('.')}`, t); }

// Duplicate CSS names (e.g. Semantic "Top Right text" / "Top Right Text")
const seen = new Map();
for (const t of tokens) {
  if (seen.has(t.css)) { t.duplicateOf = seen.get(t.css).figmaName; t.skip = true; } else seen.set(t.css, t);
}

const isRef = (v) => typeof v === 'string' && /^\{.+\}$/.test(v);
const refTarget = (v) => byRef.get(v.slice(1, -1));

function literalCss(t, v) {
  if (t.figmaType === 'COLOR' || t.type === 'color') return String(v).toUpperCase().length === 9 && String(v).toUpperCase().endsWith('FF') ? String(v).slice(0, 7).toUpperCase() : String(v).toUpperCase();
  if (t.figmaType === 'FLOAT' || t.type === 'dimension' || t.type === 'number') return `${v}px`;
  if (t.path[0] === 'Font Family') return `"${v}", ${FONT_STACK}`;
  if (t.path[0] === 'Font Weight') return String(FONT_WEIGHTS[v] ?? FONT_WEIGHTS[String(v).replace(/\s/g, '')] ?? 400);
  return JSON.stringify(String(v));
}
function cssValue(t, mode) {
  const v = t.values[mode] ?? Object.values(t.values)[0];
  if (isRef(v)) { const tgt = refTarget(v); if (!tgt) throw new Error(`Unresolved ${v} in ${t.figmaName}`); return `var(${tgt.css})`; }
  return literalCss(t, v);
}
function resolve(t, mode, chain = []) {
  const v = t.values[mode] ?? Object.values(t.values)[0];
  if (isRef(v)) { const tgt = refTarget(v); chain.push(`${tgt.collection}/${tgt.figmaName}`); return resolve(tgt, Object.keys(tgt.values)[0], chain); }
  return { value: literalCss(t, v), chain };
}

// ---------------------------------------------------------------- effects / paints
const rgba = ([r, g, b, a]) => `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${+a.toFixed(2)})`;
const effectVars = styles.effects.map((e) => ({
  name: e.name, css: `--${P}-shadow-${slug(e.name)}`,
  value: e.effects.map((x) => `${x.type === 'INNER_SHADOW' ? 'inset ' : ''}${x.x}px ${x.y}px ${x.blur}px ${x.spread}px ${rgba(x.color)}`).join(', '),
}));
const paintVars = styles.paints.map((p) => ({
  name: p.name, css: `--${P}-paint-${slug(p.name)}`,
  value: p.type === 'SOLID' ? p.value : `linear-gradient(135deg, ${p.stops.map(([pos, c]) => `${c} ${Math.round(pos * 100)}%`).join(', ')})`,
}));

// ---------------------------------------------------------------- tokens.css
const live = tokens.filter((t) => !t.skip && t.figmaType !== 'STRING' || (!t.skip && t.collection === 'raw'));
const prim = live.filter((t) => t.collection !== 'semantic');
const sem = live.filter((t) => t.collection === 'semantic');
const section = (title, list, mode) => [`  /* ${title} */`, ...list.map((t) => `  ${t.css}: ${cssValue(t, mode)};`)].join('\n');
const order = ['raw', 'brand', 'responsive'];
const primBlocks = order.map((c) => section(`${c[0].toUpperCase() + c.slice(1)} collection`, prim.filter((t) => t.collection === c), Object.keys(prim.find((t) => t.collection === c).values)[0]));

const header = `/* Generated by scripts/build-tokens.mjs from src/tokens/source. Do not edit by hand. */\n/* Source: Figma file ${styles.figmaFileKey} (Broadridge Design System v1.0) */\n`;
const css = `${header}
:root {
${primBlocks.join('\n\n')}

  /* Effect styles */
${effectVars.map((e) => `  ${e.css}: ${e.value};`).join('\n')}

  /* Paint styles */
${paintVars.map((p) => `  ${p.css}: ${p.value};`).join('\n')}
}

/* Semantic collection: Dark is the Figma default mode */
:root,
[data-theme="dark"] {
  color-scheme: dark;
${sem.map((t) => `  ${t.css}: ${cssValue(t, 'Dark')};`).join('\n')}
}

[data-theme="light"] {
  color-scheme: light;
${sem.map((t) => `  ${t.css}: ${cssValue(t, 'Light')};`).join('\n')}
}
`;
writeFileSync(join(OUT, 'tokens.css'), css);

// ---------------------------------------------------------------- typography.css
const respByName = new Map(tokens.filter((t) => t.collection === 'responsive').map((t) => [t.figmaName, t]));
const rawByName = new Map(tokens.filter((t) => t.collection === 'raw').map((t) => [t.figmaName, t]));
const varFor = (name, fallback) => { const t = respByName.get(name) ?? rawByName.get(name); return t ? `var(${t.css}, ${fallback})` : fallback; };
const textStyles = styles.text.map((s) => {
  const parts = s.name.split('/');
  const leaf = parts[parts.length - 1];
  const cls = `${P}-text-${slug(leaf)}`;
  const bv = s.boundVariables ?? {};
  const weight = FONT_WEIGHTS[s.fontStyle] ?? 400;
  const decl = {
    'font-family': bv.fontFamily ? varFor(bv.fontFamily, `"Inter", ${FONT_STACK}`) : `var(--${P}-font-family-body-and-sub)`,
    'font-weight': bv.fontStyle ? varFor(bv.fontStyle, weight) : String(weight),
    'font-size': bv.fontSize ? varFor(bv.fontSize, `${s.fontSize}px`) : `${s.fontSize}px`,
    'line-height': bv.lineHeight ? varFor(bv.lineHeight, `${s.lineHeight}px`) : `${s.lineHeight}px`,
    'letter-spacing': `${s.letterSpacing}px`,
    ...(s.textDecoration === 'UNDERLINE' ? { 'text-decoration': 'underline' } : {}),
  };
  return { figmaName: s.name, group: parts.length > 1 ? parts.slice(0, -1).join('/') : 'Bdy xsm', className: cls, fontSize: s.fontSize, lineHeight: s.lineHeight, paragraphSpacing: s.paragraphSpacing, weight, fontStyle: s.fontStyle, textDecoration: s.textDecoration, boundVariables: bv, decl };
});
writeFileSync(join(OUT, 'typography.css'), `${header}
/* One class per Figma text style. Sizes and line heights point at the Responsive collection where Figma binds them. */
${textStyles.map((t) => `/* ${t.figmaName} */\n.${t.className} {\n${Object.entries(t.decl).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`).join('\n\n')}
`);

// ---------------------------------------------------------------- meta
const meta = {
  source: { figmaFileKey: styles.figmaFileKey, fileName: 'Broadridge Design System v1.0', exportedAt: dtcg.$extensions?.['figma-console-mcp']?.exportedAt },
  tokens: tokens.map((t) => {
    const modes = Object.keys(t.values);
    const out = { collection: t.collection, figmaName: t.figmaName, path: t.path, css: t.css, figmaType: t.figmaType, variableId: t.variableId };
    if (t.skip) out.duplicateOf = t.duplicateOf;
    out.modes = Object.fromEntries(modes.map((m) => { const v = t.values[m]; const r = resolve(t, m); return [m, { alias: isRef(v) ? v.slice(1, -1).replace('.', '/').replace(/\./g, '/') : null, value: r.value, chain: r.chain }]; }));
    return out;
  }),
  textStyles,
  effects: effectVars,
  paints: paintVars,
};
writeFileSync(join(OUT, 'tokens.meta.json'), JSON.stringify(meta, null, 2));

const counts = order.concat('semantic').map((c) => `${c}: ${tokens.filter((t) => t.collection === c).length}`).join(', ');
console.log(`tokens.css, typography.css, tokens.meta.json written (${counts}; ${textStyles.length} text styles, ${effectVars.length} effects)`);
const dups = tokens.filter((t) => t.skip);
if (dups.length) console.log(`Skipped duplicate CSS names: ${dups.map((d) => `${d.figmaName} (= ${d.duplicateOf})`).join(', ')}`);
