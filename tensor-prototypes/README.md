# Tensor prototypes

Interactive prototypes for Broadridge Tensor, running on a simulated Windows 11 desktop.

**Prototype 1: Parent / Child.** Built from Figma `Broadridge Design System v1.0`, Grid page, frames *Tensor Home - 10* (main header) and *Tensor Home - 12* (50/50 stacked Parent / Child).

## Run it

```bash
npm install
npm run dev     # http://localhost:5180
```

The desktop is 1920×1080 and scales to fit the browser. Full screen on a 1080p Windows machine shows it at 1:1.

## What works

| Area | Behaviour |
|---|---|
| Windows | Drag the header to move. Resize from any edge or corner. Minimise, maximise / restore and close. Double-click a header to maximise. Drag to the top edge to maximise, or to the left or right edge to snap to half the screen. Dragging a maximised window restores it. |
| Taskbar | The Tensor icon restores or minimises all windows, and reopens Tensor after it's closed. |
| Parent / Child | Selecting an order in **Order Book** loads its quotes into **Order Book Child**. |
| Split | Drag the 16px gap between the panels to resize both; double-click it to reset to 50/50. With the gap focused, the arrow keys move it. |
| Grouping | Drag a panel by its title to tear it into its own window. Drag a window over another to dock it (top, bottom, left or right) and form a set. Header ⚙ → Layout switches between Stacked and Horizontal, swaps the panels, or resets everything. |
| Bar above each grid | Tabs pill: switch tabs by folder, create tabs (they keep the current filters) and folders. Search, filter chips, row count, live feed (on by default: prices tick, orders fill and new orders arrive at the top; bolt + toggle), export to CSV, trade date, pause feed. The child's tools start minimised (chevron + filter). |
| Grids | Sort by header, expand rows (or all rows from the header chevron), row actions menu, keyboard ↑ ↓ / Space / Enter. The child supports Cmd/Ctrl- and Shift-click multi-select. |
| Header | Search and Watchlist filter the Order Book by instrument. Also notifications, settings (layout and appearance) and the account menu. The ▾ after "Tensor" folds the header into the first panel's bar (Figma *Tensor Home - 12*): the bar shows the Broadridge mark and a ▴ to reopen it, and the window controls move to the right end of the bar, which also moves the window. |
| Theme | Light by default. Switch with the small moon/sun button in the top-right corner of the desktop. The choice is remembered per browser. |

## How it's built

- **Design system:** tokens, type classes and components are imported straight from `../broadridge-storybook/src` (`@ds/*` alias). Nothing is copied.
- **Figma first:** where Storybook lags the Figma library, the prototype follows Figma:
  - `src/styles/tokens-additions.css` adds `Surface/Chrome/*`, `Surface/Pending` and `Surface/Ended`.
  - `src/tensor/TIcon.tsx` adds the icons Storybook doesn't have yet (search, bolt, export, pause, window controls).
  - Grid cells, status pills, the Minimised grid header and the Windows Framework are built from the Figma specs.
- **Prototype-only additions** that aren't in Figma yet: the play and restore-down icons, the theme toggle, the drop-to-dock preview, and the drag grip that appears when you hover a panel title.

```
src/wm/        window manager: state (store.ts), drag/resize/snap/dock (WindowManager.tsx), frame + controls (AppWindow.tsx)
src/tensor/    Tensor UI: main header, module panels, grid header and filters, grid, cells, mock data
src/desktop/   Windows 11 desktop, taskbar icon, theme toggle
public/desktop wallpaper + taskbar exported from the Figma frame
```
