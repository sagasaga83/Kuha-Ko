import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * One tab's screen: a large title that scrolls away into a small one in the
 * bar at the top, like iOS. Each screen scrolls on its own, so switching tabs
 * keeps your place.
 */
export function Screen({
  id,
  title,
  largeTitle,
  hidden,
  scrollRef,
  children,
}: {
  id: string;
  title: string;
  /** What to show as the large title; defaults to the title text. */
  largeTitle?: ReactNode;
  hidden: boolean;
  scrollRef?: (el: HTMLElement | null) => void;
  children: ReactNode;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setCollapsed(!e.isIntersecting), {
      root: el.closest('.app-screen'),
      rootMargin: '-56px 0px 0px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      className="app-screen"
      ref={scrollRef}
      hidden={hidden}
      id={`screen-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      // Focusable, as tab panels should be, so keyboard users can scroll it.
      tabIndex={0}
    >
      <div className={`app-nav${collapsed ? ' is-collapsed' : ''}`} aria-hidden="true">
        <span className="app-nav__title">{title}</span>
      </div>
      <header className="app-large-title">
        <h1>{largeTitle ?? title}</h1>
        <div ref={sentinel} className="app-large-title__sentinel" />
      </header>
      <div className="app-screen__body">{children}</div>
    </section>
  );
}

/** An inset grouped list, with an optional small header and footer. */
export function Group({ header, footer, children }: { header?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <div className="app-group">
      {header ? <h2 className="app-group__header">{header}</h2> : null}
      <ul className="app-group__list">{children}</ul>
      {footer ? <p className="app-group__footer">{footer}</p> : null}
    </div>
  );
}

interface RowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Shown on the right, muted. */
  detail?: ReactNode;
  /** Makes the row a link (opens outside the app) or a button. */
  href?: string;
  onClick?: () => void;
  /** Show a chevron: the row opens something. */
  chevron?: boolean;
}

export function Row({ title, subtitle, detail, href, onClick, chevron }: RowProps) {
  const body = (
    <>
      <span className="app-row__text">
        <span className="app-row__title">{title}</span>
        {subtitle ? <span className="app-row__subtitle">{subtitle}</span> : null}
      </span>
      {detail ? <span className="app-row__detail">{detail}</span> : null}
      {chevron || href ? <Chevron /> : null}
    </>
  );
  if (href) {
    return (
      <li>
        <a className="app-row app-row--action" href={href} target="_blank" rel="noreferrer">
          {body}
        </a>
      </li>
    );
  }
  if (onClick) {
    return (
      <li>
        <button type="button" className="app-row app-row--action" onClick={onClick}>
          {body}
        </button>
      </li>
    );
  }
  return (
    <li>
      <div className="app-row">{body}</div>
    </li>
  );
}

function Chevron() {
  return (
    <svg className="app-row__chevron" viewBox="0 0 8 14" width="8" height="14" aria-hidden="true">
      <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A segmented control: a row of options, one selected. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      className="app-segmented"
      role="radiogroup"
      aria-label={label}
      style={{ ['--n' as string]: options.length, ['--i' as string]: index }}
    >
      <span className="app-segmented__thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className="app-segmented__option"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A bottom sheet over the current screen. Closes on the backdrop, the Done button or Escape. */
export function Sheet({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  const done = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    done.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="app-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="app-sheet__backdrop" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div className="app-sheet__panel">
        <div className="app-sheet__grabber" aria-hidden="true" />
        <div className="app-sheet__bar">
          <span className="app-sheet__title">{title}</span>
          <button type="button" ref={done} className="app-sheet__done" onClick={onClose}>
            Done
          </button>
        </div>
        <div className="app-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
