'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Facade, { type FacadeChapter } from './Facade';
import { buildModel, roman } from '../lib/building';
import { dict, routes, type Lang } from '../lib/i18n';
import { useProgress, useHydrated, statusOf, completedCount, nav, isStorageAvailable, type Status } from '../lib/progress';
import { enterChapter, isPlainClick, revealPage } from '../lib/transition';

export interface HotelChapter extends FacadeChapter {
  question: string;
}

function StatusMark({ status }: { status: Status }) {
  return <span className={`status-mark is-${status}`} aria-hidden="true" />;
}

function useChapterNav(lang: Lang) {
  return useCallback(
    (e: React.MouseEvent, id: string) => {
      if (!isPlainClick(e)) return;
      e.preventDefault();
      nav.saveHotelScroll(window.scrollY / Math.max(1, document.documentElement.scrollHeight));
      nav.setFocusWindow(id);
      const win = document.querySelector(`[data-chapter="${id}"] .cw__light`) as SVGGraphicsElement | null;
      const r = win?.getBoundingClientRect();
      const visible = r && r.bottom > 0 && r.top < window.innerHeight;
      enterChapter(visible ? r! : null, routes.chapter(lang, id));
    },
    [lang],
  );
}

export default function HotelView({ lang, chapters }: { lang: Lang; chapters: HotelChapter[] }) {
  const t = dict[lang];
  const progress = useProgress();
  const hydrated = useHydrated();
  const ids = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const done = completedCount(progress, ids);
  const [hl, setHl] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [dirOpen, setDirOpen] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const openChapter = useChapterNav(lang);
  const model = useMemo(() => buildModel(chapters), [chapters]);

  // restore façade position & lift the veil
  useEffect(() => {
    const ratio = nav.hotelScroll();
    if (ratio != null) {
      window.scrollTo({ top: ratio * document.documentElement.scrollHeight, behavior: 'instant' as ScrollBehavior });
    }
    revealPage();
    setStorageOk(isStorageAvailable());
  }, []);

  // remember position continuously (covers browser back as well as language switches)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => nav.saveHotelScroll(window.scrollY / Math.max(1, document.documentElement.scrollHeight)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const byId = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);
  const shownId = hl ?? selected ?? active;
  const shown = shownId ? byId.get(shownId) : null;
  const last = hydrated && progress.lastVisited && byId.has(progress.lastVisited) ? progress.lastVisited : null;

  const scrollToWindow = (id: string) => {
    const el = document.querySelector<SVGAElement>(`[data-chapter="${id}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: window.scrollY + r.top - window.innerHeight / 2 + r.height / 2, behavior: reduce ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
    setSelected(id);
  };

  // blocks top-down, like a lift panel
  const blocks = useMemo(() => {
    const m = new Map<number, { name: string; items: HotelChapter[] }>();
    chapters.forEach((c) => {
      if (!m.has(c.blockNumber)) m.set(c.blockNumber, { name: c.blockName, items: [] });
      m.get(c.blockNumber)!.items.push(c);
    });
    return [...m.entries()].sort((a, b) => b[0] - a[0]).map(([n, v]) => ({ n, name: v.name, items: [...v.items].reverse() }));
  }, [chapters]);

  const onSelect = useCallback((id: string | null) => setSelected(id), []);
  const onActive = useCallback((id: string | null) => setActive(id), []);

  const directory = (
    <ol className="directory" aria-label={t.directoryTitle}>
      {blocks.map((b) => (
        <li key={b.n} className="directory__block">
          <p className="directory__block-name">
            <span>{roman(b.n)}</span> {b.name}
          </p>
          <ol className="directory__items">
            {b.items.map((c) => {
              const st = statusOf(progress, c.id);
              return (
                <li key={c.id}>
                  <Link
                    href={routes.chapter(lang, c.id)}
                    className={`directory__item is-${hydrated ? st : 'not_started'}${shownId === c.id ? ' is-shown' : ''}`}
                    onMouseEnter={() => setHl(c.id)}
                    onMouseLeave={() => setHl(null)}
                    onFocus={() => setHl(c.id)}
                    onBlur={() => setHl(null)}
                    onClick={(e) => {
                      setDirOpen(false);
                      openChapter(e, c.id);
                    }}
                  >
                    <span className="directory__num">{c.id}</span>
                    <span className="directory__title">{c.title}</span>
                    <StatusMark status={hydrated ? st : 'not_started'} />
                    <span className="sr-only">{t.status[st]}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );

  const progressLine = (
    <div className="ledger" aria-label={t.completedCount(done, ids.length)}>
      <p className="ledger__count">{hydrated ? t.completedCount(done, ids.length) : t.completedCount(0, ids.length)}</p>
      <ol className="ledger__ticks" aria-hidden="true">
        {ids.map((id) => (
          <li key={id} className={`is-${hydrated ? statusOf(progress, id) : 'not_started'}`} />
        ))}
      </ol>
    </div>
  );

  const primaryCta = last ? (
    <Link
      href={routes.chapter(lang, last)}
      className="btn btn--brass"
      onClick={(e) => {
        nav.setResume(last);
        openChapter(e, last);
      }}
    >
      {t.continueLearning}
      <span className="btn__meta">
        {t.chapter} {last}
      </span>
    </Link>
  ) : (
    <a
      href="#floor-01"
      className="btn btn--brass"
      onClick={(e) => {
        e.preventDefault();
        scrollToWindow(ids[0]);
      }}
    >
      {t.explore}
    </a>
  );

  return (
    <div className="hotel">
      <div className="hotel__grid">
        <aside className="hotel__left">
          <div className="hotel__intro">
            <p className="eyebrow">{lang === 'fr' ? 'Un hôtel, quatorze étages d’apprentissage' : 'One hotel, fourteen floors of learning'}</p>
            <h1 className="hotel__title">
              100 Hours
              <span>of Agentic AI</span>
            </h1>
            <p className="hotel__tagline">{t.tagline}</p>
            <p className="hotel__lede">{t.intro}</p>
            <div className="hotel__ctas">
              {primaryCta}
              {last && (
                <a
                  href="#floor-01"
                  className="btn btn--ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToWindow(ids[0]);
                  }}
                >
                  {t.explore}
                </a>
              )}
            </div>
            {progressLine}
            {!storageOk && <p className="notice">{t.storageUnavailable}</p>}
          </div>

          <div className={`concierge${shown ? ' has-chapter' : ''}`} aria-live="polite">
            {shown ? (
              <>
                <p className="concierge__kicker">
                  {t.chapter} {shown.id} · {roman(shown.blockNumber)} {shown.blockName}
                </p>
                <p className="concierge__title">{shown.title}</p>
                <p className="concierge__q">{shown.question}</p>
                <p className={`concierge__status is-${statusOf(progress, shown.id)}`}>
                  <StatusMark status={statusOf(progress, shown.id)} />
                  {t.status[statusOf(progress, shown.id)]}
                </p>
              </>
            ) : (
              <p className="concierge__hint">{t.selectHint}</p>
            )}
          </div>
        </aside>

        <div className="hotel__stage" id="main" tabIndex={-1}>
          <span id="floor-01" className="sr-only" />
          <Facade lang={lang} chapters={chapters} highlight={hl} selected={selected} onSelect={onSelect} onActive={onActive} />
        </div>

        <aside className="hotel__right">
          <div className="lift">
            <p className="lift__title">{t.directoryTitle}</p>
            <MiniMap model={model} lang={lang} onJump={scrollToWindow} />
            {directory}
            <div className="legend">
              <p className="legend__title">{t.legendTitle}</p>
              <ul>
                {(['not_started', 'in_progress', 'completed'] as Status[]).map((s) => (
                  <li key={s}>
                    <StatusMark status={s} /> {t.legend[s]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* compact panel for touch & narrow screens */}
      <div className="dock" role="region" aria-label={t.directory}>
        <div className="dock__inner">
          {shown ? (
            <Link
              href={routes.chapter(lang, shown.id)}
              className="dock__chapter"
              onClick={(e) => openChapter(e, shown.id)}
            >
              <span className="dock__num">{shown.id}</span>
              <span className="dock__text">
                <span className="dock__title">{shown.title}</span>
                <span className={`dock__status is-${statusOf(progress, shown.id)}`}>{t.status[statusOf(progress, shown.id)]}</span>
              </span>
              <span className="dock__enter">{t.openChapter}</span>
            </Link>
          ) : (
            <p className="dock__hint">{t.selectHint}</p>
          )}
          <button type="button" className="dock__dir" aria-expanded={dirOpen} aria-controls="directory-sheet" onClick={() => setDirOpen(true)}>
            <span className="dock__dir-icon" aria-hidden="true" />
            <span className="sr-only">{t.directory}</span>
          </button>
        </div>
      </div>

      <DirectorySheet open={dirOpen} onClose={() => setDirOpen(false)} title={t.directoryTitle} closeLabel={t.close}>
        {progressLine}
        {directory}
      </DirectorySheet>

      <footer className="hotel__footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}

function DirectorySheet({ open, onClose, title, closeLabel, children }: { open: boolean; onClose: () => void; title: string; closeLabel: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      id="directory-sheet"
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="sheet__head">
        <p className="sheet__title">{title}</p>
        <button type="button" className="sheet__close" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
      <div className="sheet__body">{children}</div>
    </dialog>
  );
}

function MiniMap({ model, lang, onJump }: { model: ReturnType<typeof buildModel>; lang: Lang; onJump: (id: string) => void }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const viewRef = useRef<SVGRectElement>(null);
  const top = model.crown.spire.y - 20;
  const h = model.groundY - top + 10;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const svg = document.querySelector('.facade__svg') as SVGSVGElement | null;
      const v = viewRef.current;
      if (!svg || !v) return;
      const r = svg.getBoundingClientRect();
      const k = model.H / r.height;
      const y0 = Math.max(top, -r.top * k);
      const y1 = Math.min(model.groundY + 10, (window.innerHeight - r.top) * k);
      v.setAttribute('y', String(y0));
      v.setAttribute('height', String(Math.max(0, y1 - y0)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [model, top]);

  return (
    <svg className="minimap" viewBox={`180 ${top} 840 ${h}`} aria-hidden="true" focusable="false">
      <path d={model.silhouette} className="minimap__body" />
      <rect ref={viewRef} x={190} y={top} width={820} height={0} className="minimap__view" />
      {model.chapterWindows.map((c) => (
        <rect
          key={c.id}
          x={c.x}
          y={c.y}
          width={c.w}
          height={c.h}
          className={`minimap__win is-${hydrated ? statusOf(progress, c.id) : 'not_started'}`}
          onClick={() => onJump(c.id)}
        >
          <title>{`${lang === 'fr' ? 'Étape' : 'Step'} ${c.id}`}</title>
        </rect>
      ))}
    </svg>
  );
}
