import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@ds/tokens/generated/tokens.css';
import '@ds/tokens/generated/typography.css';
import '@ds/styles/base.css';
import './styles/tokens-additions.css';
import './styles/app.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
