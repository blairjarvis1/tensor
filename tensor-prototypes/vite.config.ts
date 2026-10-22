import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// The Broadridge Design System lives next door. Import its tokens and components directly so the
// prototype stays in step with Storybook instead of copying it.
const ds = path.resolve(dirname, '../broadridge-storybook/src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@ds': ds },
    // Storybook components import React from their own node_modules; use one copy.
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5180, fs: { allow: [dirname, ds] } },
});
