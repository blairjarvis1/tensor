# Broadridge Design System, Storybook

A local Storybook for the Broadridge Design System v1.0 (Project Tensor). It's built from the Figma library at `zDEScc95YdqMUidplqm9dd`.

**Stage 1 (done):** foundations, meaning colour, palette, typography, spacing and shape, and effects.
**Stage 2 (done):** components for every organised Figma page, built only on the semantic tokens.

| Group | Components | Figma page |
|---|---|---|
| Icon | `Icon` (91 icons) | Icons |
| Buttons | `Button`, `IconTileButton`, `SquareIconButton`, `CircleButton`, `Stepper` | Buttons |
| Calendar | `Calendar`, `CalendarDay` | Calendar |
| Cards | `RfqCard` (detailed and compact), `NotificationCard` | Cards |
| Charts | `ExecutionChart`, `Sparkline` | Charts |
| Grid | `DataGrid` (default and depth), `GridTabs`, `GridTools`, `FilterChip`, `Acronym`, `PriceChange`, `SideValue` | Grid, Header (Grid Tools), Tabs |
| Header | `GlobalHeader`, `PanelHeader`, `BroadridgeLogo` | Header, Logo / Profile |
| Form Elements | `Checkbox`, `Radio` / `RadioGroup`, `Toggle`, `Select` (single and multi), `TextField`, `NumberInput`, `ValueSlider`, `RangeSlider`, `Field` | Form Elements |
| Lists & Menus | `Menu`, `MenuItem`, `MenuSeparator`, `MenuLabel`, `MenuButton` | Lists |
| Tabs & Selectors | `Tabs` (large / small), `ButtonSelector` (navigation, ticket, floating) | Tabs |
| Pills & Chips | `Chip` (filter / grouping), `Roundel`, `ScenarioPill` | Pills |
| Metrics | `MetricBox` (v1 level, v2 scenarios), `MetricGrid` (with pager), `LabelMetric`, `StatusValue` | Metrics |
| Panels | `AnalysisPanel`, `PanelSection`, `PanelInset`, `TicketTopBar`, `TicketFrame`, `TicketSidebar`, `CompositeInterval`, `NotificationPanel` | Panels |
| Messaging | `GlobalBanner`, `Toast`, `StatusToast`, `ToastStack`, `ConfirmDialog`, `EmptyState` | Messaging |
| Search | `SearchBar` (chips, filter by kind, results, preview) | Search |
| Settings | `SettingsDialog`, `SettingsSection`, `SettingsCard`, `SettingsRow`, `ColumnConfig`, `GridSettingsPanel`, `GroupingChain` | Settings |
| Utility | `Pagination`, `Tooltip`, `Separator`, `ScrollArea`, `OverlayFade`, `StatusPill` | Pagination, Tooltips, UI, Status Bars |
| Supporting | `IssueLozenge`, `DirectionLozenge`, `ProgressBar` | Pills, Status Bars |

Components live in `src/components/<Name>/`, each with a `.tsx`, a CSS module and a `.stories.tsx`. Icons are generated from `src/tokens/source/icons.figma.json`.

## Run it

```bash
npm install
npm run storybook   # regenerates tokens, then opens http://localhost:6006
```

## Project layout

```
scripts/build-tokens.mjs        DTCG + styles → CSS variables, type classes, metadata
src/tokens/source/              Exported from Figma (edit only by re-exporting)
  tokens.tokens.json            figma-console DTCG export: Raw, Brand, Semantic, Responsive
  styles.json                   Text, effect and paint styles
src/tokens/generated/           Build output, don't edit
  tokens.css                    :root primitives; Semantic on :root/[data-theme="dark"] and [data-theme="light"]
  typography.css                .br-text-* classes, one per Figma text style
  tokens.meta.json              Resolved values and alias chains, used by the stories
src/styles/base.css             Page defaults (background, text colour, font)
src/foundations/                Foundations stories + the small docs kit they share
src/Introduction.mdx            Start page
```

## Token naming

| Figma | CSS |
|---|---|
| `Semantic / Surface/Action/Primary Default` | `--br-surface-action-primary-default` |
| `Semantic / Text/Body` | `--br-text-body` |
| `Brand / Primary/*Default` | `--br-brand-primary-default` |
| `Brand / Border Radius/lg` | `--br-radius-lg` |
| `Raw / Blue/Default` | `--br-raw-blue-default` |
| `Raw / Scale/200` | `--br-scale-200` (8px) |
| `Responsive / H1/font size` | `--br-type-h1-font-size` |
| Text style `Bdy/Bdy sm/Bdy sm Med` | `.br-text-bdy-sm-med` |
| Effect style `Menu Modal` | `--br-shadow-menu-modal` |

Theme: set `data-theme="light"` or `data-theme="dark"` on `<html>`. With no attribute you get Dark, which matches Figma's default mode.

## Why there's a custom build step

figma-console's own `css-vars` output scopes each single-mode collection to its own `[data-theme]` selector, and the Raw and Brand collections share names like `Neutral/50`. `build-tokens.mjs` reads the same DTCG file and fixes both problems. It puts primitives on `:root`, prefixes each layer, and keeps aliases as `var()` references.

## Known quirks inherited from Figma

- Some disabled and calendar text tokens (`Text/Action/On Primary Disabled`, `Text/Action/On Primary Default`) are near-white in Light mode too. Where that would make text disappear, the component uses a readable token instead, with a comment in its CSS.
- `Text/Badge On` and `Border/action/secondary action-hover` come from a remote library that isn't in this file, so the components use white and `Border/Action/Secondary Hover` instead.
- Semantic `Top Right text` and `Top Right Text` are duplicate string placeholders, so only one is emitted. String variables aren't output as CSS.
- `Raw/Blue/800` has 50% alpha (`#1D397F80`).
- Several token names have typos (`Text/Price Descrease`, `Surface/Charting/Bue`, `Surface/Card/DIsabled`). The CSS keeps the Figma spelling so names stay traceable.
