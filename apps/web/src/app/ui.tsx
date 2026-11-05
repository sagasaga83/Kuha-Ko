import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { prefersReducedMotion, project, rubberband, spring, velocityTracker } from '../motion';

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

/** The full site's wide-screen drawer comes in from the right; everywhere else the sheet rises from the bottom. */
const isDrawer = () =>
  window.matchMedia?.('(min-width: 768px)').matches && !document.documentElement.classList.contains('kk-app');

/**
 * A bottom sheet over the current screen (a drawer from the right on the wide full site).
 * Closes on the backdrop, the Done button or Escape, and leaves the way it came in.
 * Its grabber and title bar can be dragged: the sheet follows the finger, resists being
 * pulled the wrong way, and a flick decides whether it closes or springs back.
 */
export function Sheet({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  const done = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const motion = useRef({ offset: 0, stop: () => {}, closing: false });

  // The sheet's offset along its axis, in px: 0 is fully open, its size is fully closed.
  const place = (offset: number) => {
    const p = panel.current;
    if (!p) return;
    motion.current.offset = offset;
    const drawer = isDrawer();
    const size = drawer ? p.offsetWidth : p.offsetHeight;
    p.style.animation = 'none';
    p.style.transform = drawer ? `translateX(${offset}px)` : `translateY(${offset}px)`;
    if (backdrop.current) {
      backdrop.current.style.animation = 'none';
      backdrop.current.style.opacity = String(Math.max(0, Math.min(1, 1 - offset / size)));
    }
  };

  /** Take over from the opening animation (or a running spring) at the exact spot it has reached. */
  const grab = () => {
    const p = panel.current;
    motion.current.stop();
    motion.current.closing = false;
    if (!p) return 0;
    const m = new DOMMatrixReadOnly(getComputedStyle(p).transform);
    const now = isDrawer() ? m.m41 : m.m42;
    place(now);
    return now;
  };

  /** Spring to open or closed, carrying the finger's speed. */
  const settle = (close: boolean, velocity = 0) => {
    const p = panel.current;
    if (!p) return close ? onClose() : undefined;
    const size = isDrawer() ? p.offsetWidth : p.offsetHeight;
    motion.current.closing = close;
    motion.current.stop = spring({
      from: motion.current.offset,
      to: close ? size : 0,
      velocity,
      // A flick earns a little bounce on the way back; a plain close settles without one.
      damping: close ? 1 : 0.85,
      response: 0.32,
      onUpdate: place,
      onDone: close ? onClose : undefined,
    });
  };

  const requestClose = () => {
    if (motion.current.closing) return;
    // Without animation support (or with reduced motion) the sheet just goes.
    if (prefersReducedMotion() || !panel.current || typeof panel.current.animate !== 'function') return onClose();
    grab();
    settle(true);
  };
  const close = useRef(requestClose);
  close.current = requestClose;

  useEffect(() => {
    if (!open) return;
    motion.current = { offset: 0, stop: () => {}, closing: false };
    done.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      motion.current.stop();
    };
  }, [open]);

  // Dragging the grabber or the title bar.
  const drag = useRef({ id: -1, start: 0, from: 0, moved: false, track: velocityTracker() });
  const axisOf = (e: PointerEvent<HTMLElement>) => (isDrawer() ? e.clientX : e.clientY);
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    const d = drag.current;
    d.id = e.pointerId;
    d.start = axisOf(e);
    d.from = grab(); // grabbing a moving sheet catches it where it is
    d.moved = false;
    d.track.reset();
    d.track.add(d.start);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const p = panel.current;
    if (e.pointerId !== d.id || !p) return;
    const pos = axisOf(e);
    d.track.add(pos);
    const raw = d.from + pos - d.start;
    if (!d.moved && Math.abs(pos - d.start) < 4) return;
    d.moved = true;
    const size = isDrawer() ? p.offsetWidth : p.offsetHeight;
    place(raw < 0 ? rubberband(raw, size) : raw);
  };
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const p = panel.current;
    if (e.pointerId !== d.id || !p) return;
    d.id = -1;
    const velocity = e.type === 'pointercancel' ? 0 : d.track.velocity();
    const size = isDrawer() ? p.offsetWidth : p.offsetHeight;
    // Close if the flick would carry the sheet past halfway, or it's moving away fast.
    const landing = motion.current.offset + project(velocity);
    settle(landing > size / 2 || velocity > 900, velocity);
  };
  const handle = { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };

  if (!open) return null;
  return createPortal(
    <div className="app-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" ref={backdrop} className="app-sheet__backdrop" aria-label="Close" tabIndex={-1} onClick={requestClose} />
      <div className="app-sheet__panel" ref={panel}>
        <div className="app-sheet__grabber" aria-hidden="true" {...handle} />
        <div className="app-sheet__bar" {...handle}>
          <span className="app-sheet__title">{title}</span>
          <button type="button" ref={done} className="app-sheet__done" onClick={requestClose}>
            Done
          </button>
        </div>
        <div className="app-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
