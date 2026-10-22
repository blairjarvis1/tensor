import type { ReactNode } from 'react';
import { Page } from './Kit';

/** One-line descriptions for component groups whose stories don't set their own docs description. */
const GROUP_LEDE: Record<string, string> = {
  Icon: 'Figma: Icons page. 91 icons that inherit currentColor; colour them with the --br-icons-* tokens.',
  Buttons: 'Figma: Buttons page (Button - v2, Icon Button, Square icon Button, Circle Button, Stepper). Hover and focus are live.',
  Calendar: 'Figma: Calendar page. Click one date, or a start and an end in range mode.',
  Cards: 'Figma: Cards page. RFQ cards (detailed and compact) and the notification card. Hover a card for Rollover, tab to it for Focus.',
  Charts: 'Figma: Charts page. Plain SVG drawn with the Surface/Graph and Surface/Charting tokens.',
  Grid: 'Figma: Grid page. Click a row to select it; Cmd/Ctrl-click or Shift-click to multi-select; ↑ ↓ move, Space selects, Enter expands.',
  Header: 'Figma: Header page. The global app header and the 40px panel header.',
  Lozenges: 'Figma: Pills page. Issue and Bid / Ask lozenges used on RFQ and notification cards.',
  'Form Elements': 'Figma: Form Elements page. Every control has hover, focus, error and disabled states.',
  'Lists & Menus': 'Figma: Lists page (Menu - v2, MenuCell - v2). Focus a menu item, then use ↑ ↓ Home End, Enter or Space, and Esc.',
  'Tabs & Selectors': 'Figma: Tabs page. Tab into a group, then use ← → Home End.',
  'Pills & Chips': 'Figma: Pills page. Filter and grouping chips, roundels and scenario pills.',
  Metrics: 'Figma: Metrics page. Metric boxes v1.0 and v2.0, and label and metric layouts.',
  Panels: 'Figma: Panels page. The analysis panel, trade ticket parts and the notification panel.',
  Messaging: 'Figma: Messaging page. Banners, toasts, the confirmation modal and empty states.',
  Search: 'Figma: Search page (Global Search v.2). Type to search, use ↑ ↓ and Enter, Backspace removes the last chip.',
  Settings: 'Figma: Settings page. The settings dialog, column configuration and the grid settings panel.',
  'Pagination, Tooltips, UI & Status': 'Figma: Pagination, Tooltips, UI and Status Bars pages.',
};

type Ctx = {
  title: string;
  name: string;
  parameters: { pageHeader?: boolean; docs?: { description?: { story?: string; component?: string } } };
};

/** Should this story get the shared title block? Components stories in the canvas, unless they opt out with `parameters.pageHeader: false`. */
export const wantsPageHeader = (ctx: Ctx & { viewMode?: string }) => ctx.title.startsWith('Components/') && ctx.viewMode !== 'docs' && ctx.parameters.pageHeader !== false;

/** Wraps a component story in the same title block and padding as the Foundations pages. */
export function ComponentPage({ ctx, children }: { ctx: Ctx; children: ReactNode }) {
  const parts = ctx.title.split('/').slice(1);
  const group = parts[0];
  const lede = ctx.parameters.docs?.description?.story ?? ctx.parameters.docs?.description?.component ?? GROUP_LEDE[group];
  return (
    <Page eyebrow={['Components', ...parts].join(' · ')} title={ctx.name} lede={lede}>
      {children}
    </Page>
  );
}
