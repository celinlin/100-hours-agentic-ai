'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { roman } from '../game/hotel/geometry';
import { routes, type Lang } from '../lib/i18n';
import { useGame, windowState, nextUp, resetGame, type WindowState } from '../game/state';
import { useChrono, chrono, fmtTotal, GOAL_MS } from '../game/chrono';
import { revealPage } from '../lib/transition';
import Chronometer from './Chronometer';

interface Item {
  id: string;
  title: string;
  blockNumber: number;
  blockName: string;
  stations: number;
  reward: { fr: string; en: string } | null;
}

const L = {
  fr: {
    kicker: 'Ma progression',
    title: 'Le registre de l’hôtel',
    lede: 'Tout est enregistré sur cet appareil, sans compte. Une fenêtre s’ouvre quand le défi de la précédente est réussi.',
    hours: 'Vers les 100 heures',
    windows: 'Fenêtres',
    open: 'ouvertes',
    done: 'terminées',
    current: 'En cours',
    resume: (id: string) => `Reprendre l’étape ${id}`,
    begin: 'Ouvrir la fenêtre 01',
    state: { locked: 'Verrouillée', available: 'À ouvrir', in_progress: 'En cours', completed: 'Terminée' } as Record<WindowState, string>,
    objects: (d: number, t: number) => `${d} / ${t} objets compris`,
    collection: 'Les objets obtenus',
    none: 'Aucun pour l’instant : réussis un défi pour obtenir le premier.',
    reset: 'Réinitialiser',
    resetGame: 'Effacer la progression des étapes',
    resetTime: 'Remettre le temps total à zéro',
    confirm1: 'Effacer la progression des étapes sur cet appareil ?',
    confirm2: 'Confirme une seconde fois : cette action est définitive.',
    confirmTime: 'Remettre le temps total à zéro ? Cette action est définitive.',
    back: 'Retour à l’hôtel',
    time: 'Temps total',
  },
  en: {
    kicker: 'My progress',
    title: 'The hotel register',
    lede: 'Everything is saved on this device, no account needed. A window opens when the previous one’s challenge is passed.',
    hours: 'Towards 100 hours',
    windows: 'Windows',
    open: 'open',
    done: 'completed',
    current: 'Current',
    resume: (id: string) => `Resume step ${id}`,
    begin: 'Open window 01',
    state: { locked: 'Locked', available: 'Ready to open', in_progress: 'In progress', completed: 'Completed' } as Record<WindowState, string>,
    objects: (d: number, t: number) => `${d} / ${t} objects understood`,
    collection: 'Objects earned',
    none: 'None yet: pass a challenge to earn the first.',
    reset: 'Reset',
    resetGame: 'Erase step progress',
    resetTime: 'Reset total time to zero',
    confirm1: 'Erase step progress on this device?',
    confirm2: 'Confirm once more: this cannot be undone.',
    confirmTime: 'Reset total time to zero? This cannot be undone.',
    back: 'Back to the hotel',
    time: 'Total time',
  },
};

export default function ProgressView({ lang, chapters }: { lang: Lang; chapters: Item[] }) {
  const t = L[lang];
  const g = useGame();
  const c = useChrono();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    revealPage();
  }, []);
  const ids = chapters.map((x) => x.id);
  const st = (id: string): WindowState => (hydrated ? windowState(g, ids, id) : id === ids[0] ? 'available' : 'locked');
  const openN = ids.filter((id) => st(id) !== 'locked').length;
  const doneN = ids.filter((id) => st(id) === 'completed').length;
  const next = hydrated ? nextUp(g, ids) : ids[0];
  const earned = chapters.filter((x) => st(x.id) === 'completed' && x.reward);
  const total = hydrated ? c.totalMs : 0;

  const groups = new Map<number, { name: string; items: Item[] }>();
  chapters.forEach((x) => {
    if (!groups.has(x.blockNumber)) groups.set(x.blockNumber, { name: x.blockName, items: [] });
    groups.get(x.blockNumber)!.items.push(x);
  });

  return (
    <div className="register2" id="main" tabIndex={-1}>
      <header className="register2__head">
        <p className="register2__kicker">{t.kicker}</p>
        <h1 className="register2__title">{t.title}</h1>
        <p className="register2__lede">{t.lede}</p>
      </header>

      <div className="register2__grid">
        <section className="register2__card register2__card--chrono" aria-label={t.hours}>
          <p className="register2__label">{t.hours}</p>
          <Chronometer lang={lang} expanded />
          <p className="register2__big">
            {fmtTotal(total, lang)} <span>/ 100 h</span>
          </p>
          <p className="register2__small">{Math.round((total / GOAL_MS) * 1000) / 10} %</p>
        </section>

        <section className="register2__card">
          <p className="register2__label">{t.windows}</p>
          <p className="register2__big">
            {openN} <span>{t.open}</span>
          </p>
          <p className="register2__big">
            {doneN} <span>/ {ids.length} {t.done}</span>
          </p>
          <ol className="hx-ticks register2__ticks" aria-hidden="true">
            {ids.map((id) => (
              <li key={id} className={`is-${st(id)}`} />
            ))}
          </ol>
          <p className="register2__label">{t.current}</p>
          <Link className="hx-cta register2__cta" href={routes.chapter(lang, next)}>
            {next === ids[0] && !(hydrated && g.chapters[next]?.visited) ? t.begin : t.resume(next)}
          </Link>
        </section>
      </div>

      <section className="register2__floors">
        {[...groups.entries()].reverse().map(([n, grp]) => (
          <div key={n} className="register2__block">
            <h2 className="register2__block-title">
              <span>{roman(n)}</span> {grp.name}
            </h2>
            <ol>
              {[...grp.items].reverse().map((x) => {
                const s = st(x.id);
                const solved = hydrated ? g.chapters[x.id]?.stations.length ?? 0 : 0;
                return (
                  <li key={x.id} className={`register2__row is-${s}`}>
                    <span className="register2__num">{x.id}</span>
                    {s === 'locked' ? (
                      <span className="register2__name">{x.title}</span>
                    ) : (
                      <Link className="register2__name" href={routes.chapter(lang, x.id)}>
                        {x.title}
                      </Link>
                    )}
                    <span className="register2__meta">{x.stations ? t.objects(Math.min(solved, x.stations), x.stations) : ''}</span>
                    <span className={`register2__state is-${s}`}>{t.state[s]}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      <section className="register2__collection">
        <h2 className="register2__block-title">{t.collection}</h2>
        {earned.length ? (
          <ul>
            {earned.map((x) => (
              <li key={x.id}>
                <span className="register2__num">{x.id}</span> {x.reward![lang]}
              </li>
            ))}
          </ul>
        ) : (
          <p className="register2__small">{t.none}</p>
        )}
      </section>

      <footer className="register2__foot">
        <Link className="room-btn" href={routes.hotel(lang)}>
          {t.back}
        </Link>
        <details className="register2__reset">
          <summary>{t.reset}</summary>
          <button
            type="button"
            className="link-btn link-btn--danger"
            onClick={() => {
              if (window.confirm(t.confirm1) && window.confirm(t.confirm2)) resetGame();
            }}
          >
            {t.resetGame}
          </button>
          <button
            type="button"
            className="link-btn link-btn--danger"
            onClick={() => {
              if (window.confirm(t.confirmTime) && window.confirm(t.confirm2)) chrono.resetAll();
            }}
          >
            {t.resetTime}
          </button>
        </details>
      </footer>
    </div>
  );
}
