import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tokens/generated/tokens.css';
import './tokens/generated/typography.css';
import './styles/base.css';

// Placeholder app shell. The design system lives in Storybook: npm run storybook
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main style={{ padding: 32 }}>
      <h1 className="br-text-h4-med">Broadridge Design System</h1>
      <p className="br-text-bdy-md-reg">Run <code>npm run storybook</code> to browse the foundations.</p>
    </main>
  </StrictMode>,
);
