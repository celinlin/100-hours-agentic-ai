'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { roman } from '../lib/building';
import { dict, routes, type Lang } from '../lib/i18n';
import { useProgress, useHydrated, statusOf, completedCount, resetProgress, setStatus, nav, isStorageAvailable, type Status } from '../lib/progress';
import { revealPage, enterChapter, isPlainClick } from '../lib/transition';

interface Item {
  id: string;
  title: string;
  blockNumber: number;
  blockName: string;
}

export default function ProgressView({ lang, chapters }: { lang: Lang; chapters: Item[] }) {
  const t = dict[lang];
  const progress = useProgress();
  const hydrated = useHydrated();
  const ids = chapters.map((c) => c.id);
  const done = hydrated ? completedCount(progress, ids) : 0;
  const started = hydrated ? ids.filter((id) => statusOf(progress, id) === 'in_progress').length : 0;
  const last = hydrated && progress.lastVisited ? chapters.find((c) => c.id === progress.lastVisited) : undefined;
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    revealPage();
    setStorageOk(isStorageAvailable());
  }, []);

  const open = (e: React.MouseEvent, id: string, resume = false) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    if (resume) nav.setResume(id);
    enterChapter(null, routes.chapter(lang, id));
  };

  const groups = new Map<number, { name: string; items: Item[] }>();
  chapters.forEach((c) => {
    if (!groups.has(c.blockNumber)) groups.set(c.blockNumber, { name: c.blockName, items: [] });
    groups.get(c.blockNumber)!.items.push(c);
  });

  const pctDone = ids.length ? done / ids.length : 0;

  return (
    <div className="register" id="main" tabIndex={-1}>
      <header className="register__head">
        <p className="eyebrow eyebrow--dark">{t.myProgress}</p>
        <h1 className="register__title">{t.progressTitle}</h1>
        <p className="register__lede">{t.progressLede}</p>
        {!storageOk && <p className="notice notice--paper">{t.storageUnavailable}</p>}
        <div className="register__summary">
          <div className="dial" aria-hidden="true">
            <svg viewBox="0 0 120 70">
              <path d="M10 64 A50 50 0 0 1 110 64" className="dial__track" />
              <path d="M10 64 A50 50 0 0 1 110 64" className="dial__fill" pathLength={1} style={{ strokeDasharray: `${pctDone} 1` }} />
              <line
                x1="60"
                y1="64"
                x2={60 + Math.cos(Math.PI + pctDone * Math.PI) * 40}
                y2={64 + Math.sin(Math.PI + pctDone * Math.PI) * 40}
                className="dial__needle"
              />
              <circle cx="60" cy="64" r="4" className="dial__hub" />
            </svg>
          </div>
          <div>
            <p className="register__count">{t.completedCount(done, ids.length)}</p>
            <p className="register__sub">
              {started} {t.status.in_progress.toLowerCase()} · {ids.length - done - started} {t.status.not_started.toLowerCase()}
            </p>
            {last ? (
              <Link href={routes.chapter(lang, last.id)} className="btn btn--brass" onClick={(e) => open(e, last.id, true)}>
                {t.continueLearning}
                <span className="btn__meta">
                  {t.chapter} {last.id} · {last.title}
                </span>
              </Link>
            ) : (
              <Link href={routes.chapter(lang, ids[0])} className="btn btn--brass" onClick={(e) => open(e, ids[0])}>
                {t.startJourney}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="register__floors">
        {[...groups.entries()].map(([n, g]) => (
          <section key={n} className="register__block">
            <h2 className="register__block-title">
              <span>{roman(n)}</span> {g.name}
            </h2>
            <ol className="register__list">
              {g.items.map((c) => {
                const st: Status = hydrated ? statusOf(progress, c.id) : 'not_started';
                return (
                  <li key={c.id} className={`register__row is-${st}`}>
                    <span className="register__num">{c.id}</span>
                    <Link href={routes.chapter(lang, c.id)} className="register__name" onClick={(e) => open(e, c.id, st === 'in_progress')}>
                      {c.title}
                    </Link>
                    <span className={`register__state is-${st}`}>
                      <span className={`status-mark is-${st}`} aria-hidden="true" />
                      {t.status[st]}
                    </span>
                    <span className="register__toggle">
                      {st === 'completed' ? (
                        <button type="button" className="link-btn" onClick={() => setStatus(c.id, 'in_progress')}>
                          {t.undoCompleted}
                        </button>
                      ) : (
                        <button type="button" className="link-btn" onClick={() => setStatus(c.id, 'completed')}>
                          {t.markCompleted}
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <footer className="register__foot">
        <Link href={routes.hotel(lang)} className="btn btn--ghost-dark">
          {t.backToHotel}
        </Link>
        <button
          type="button"
          className="link-btn link-btn--danger"
          onClick={() => {
            if (window.confirm(t.resetConfirm)) resetProgress();
          }}
        >
          {t.resetProgress}
        </button>
      </footer>
    </div>
  );
}
