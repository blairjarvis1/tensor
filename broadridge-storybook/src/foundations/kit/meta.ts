import raw from '../../tokens/generated/tokens.meta.json';

export type ModeValue = { alias: string | null; value: string; chain: string[] };
export type TokenMeta = {
  collection: 'raw' | 'brand' | 'semantic' | 'responsive';
  figmaName: string;
  path: string[];
  css: string;
  figmaType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  variableId?: string;
  duplicateOf?: string;
  modes: Record<string, ModeValue>;
};
export type TextStyleMeta = {
  figmaName: string;
  group: string;
  className: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  weight: number;
  fontStyle: string;
  textDecoration: string;
  boundVariables: Record<string, string>;
  decl: Record<string, string>;
};
export type NamedValue = { name: string; css: string; value: string };

type Meta = {
  source: { figmaFileKey: string; fileName: string; exportedAt?: string };
  tokens: TokenMeta[];
  textStyles: TextStyleMeta[];
  effects: NamedValue[];
  paints: NamedValue[];
};

export const meta = raw as unknown as Meta;
export const tokens = meta.tokens.filter((t) => !t.duplicateOf);
export const byCollection = (c: TokenMeta['collection']) => tokens.filter((t) => t.collection === c);

/** Natural sort for ramp steps: 50, 100 … 900, with Default placed as 500. */
export function stepRank(step: string) {
  const s = step.replace('*', '');
  if (/^default$/i.test(s)) return 500;
  const n = Number(s);
  return Number.isFinite(n) ? n : 10_000;
}

/** Group tokens by the first N path segments, keeping Figma's order of first appearance. */
export function groupBy<T extends TokenMeta>(list: T[], depth = 1) {
  const map = new Map<string, T[]>();
  for (const t of list) {
    const key = t.path.slice(0, depth).join(' / ');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return map;
}

export const varRef = (css: string) => `var(${css})`;
