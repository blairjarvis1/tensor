# Tensor prototypes (Broadridge)

Interactive prototypes for Broadridge Tensor, plus the Broadridge Design System Storybook they are built on.

| Folder | What it is |
|---|---|
| `tensor-prototypes/` | The prototype app (Vite + React + TypeScript). Prototype 1: Parent / Child. See its README for every interaction. |
| `broadridge-storybook/` | Broadridge Design System v1.0 in code: tokens, type classes and React components, with Storybook. |

The prototype imports tokens and components straight from `broadridge-storybook/src`, so **keep the two folders side by side**.

## Run the prototype

Needs Node 24.

```bash
cd broadridge-storybook && npm install && cd ..
cd tensor-prototypes && npm install
npm run dev        # http://localhost:5180
```

## Run Storybook

```bash
cd broadridge-storybook
npm run storybook  # http://localhost:6006
```

Figma (source of truth): *Broadridge Design System v1.0*, Grid page, frames *Tensor Home - 10* and *Tensor Home - 12*.
