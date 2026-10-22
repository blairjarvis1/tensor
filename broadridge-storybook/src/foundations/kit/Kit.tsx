import { useState, type ReactNode } from 'react';
import './kit.css';

export function Page({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <div className="fd">
      <header className="fd-head">
        <span className="fd-eyebrow br-text-bdy-xxsm-med">{eyebrow}</span>
        <h1 className="fd-title br-text-h3-med">{title}</h1>
        {lede && <p className="fd-lede br-text-bdy-md-reg">{lede}</p>}
      </header>
      {children}
    </div>
  );
}

export function Section({ title, count, note, children }: { title: string; count?: number; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="fd-section">
      <h2 className="fd-section-title br-text-h5-med">
        {title}
        {count !== undefined && <span className="fd-count br-text-bdy-sm-reg">{count}</span>}
      </h2>
      {note && <p className="fd-note br-text-bdy-sm-reg">{note}</p>}
      {children}
    </section>
  );
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Click to copy `var(--token)` to the clipboard. */
export function CopyVar({ css }: { css: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="fd-copy"
      title={`Copy var(${css})`}
      data-copied={copied}
      onClick={async () => {
        if (await writeClipboard(`var(${css})`)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }
      }}
    >
      {copied ? 'Copied' : css}
    </button>
  );
}

export function Swatch({ color }: { color: string }) {
  return (
    <span className="fd-swatch" aria-hidden="true">
      <i style={{ background: color }} />
    </span>
  );
}

export function Mini({ color }: { color: string }) {
  return <span className="fd-mini" style={{ background: color }} aria-hidden="true" />;
}

export function Chip({ label, css, hex }: { label: string; css: string; hex: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="fd-chip"
      title={`${css}\nClick to copy var(${css})`}
      data-copied={copied}
      onClick={async () => {
        if (await writeClipboard(`var(${css})`)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }
      }}
    >
      <span className="fd-chip-color">
        <i style={{ background: `var(${css})` }} />
      </span>
      <span className="fd-chip-step">{label}</span>
      <span className="fd-chip-hex">{copied ? 'Copied' : hex}</span>
    </button>
  );
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="fd-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
