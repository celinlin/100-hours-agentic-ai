'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { buildModel, roman, CX, type Suite } from '../../game/hotel/geometry';
import { useGame, windowState, nextUp, travel, type WindowState } from '../../game/state';
import { sfx } from '../../game/sound';
import { coverAndGo, revealPage, prefersReducedMotion } from '../../lib/transition';
import { routes, type Lang } from '../../lib/i18n';
import { HotelDecor, SuiteWindow } from './HotelFacade';

export interface SceneChapter {
  id: string;
  title: string;
  blockNumber: number;
  blockName: string;
  question: string;
}

/** Above this, Chrome's raster cost for the zoom layer becomes visible on mid-range devices. */
const MAX_ZOOM = 2.6;

const L = {
  fr: {
    step: 'Étape',
    state: { locked: 'Verrouillée', available: 'À ouvrir', in_progress: 'En cours', completed: 'Terminée' } as Record<WindowState, string>,
    lockedHint: (prev: string) => `Réussis le défi de l’étape ${prev} pour ouvrir cette fenêtre.`,
    enter: 'Entrer',
    overview: 'Vue d’ensemble',
    opened: (n: number, t: number) => `${n} / ${t} fenêtres ouvertes`,
    tagline: 'Un hôtel, quatorze fenêtres. Chacune ouvre une pièce où l’on apprend en manipulant.',
    begin: 'Ouvrir la fenêtre 01',
    openN: (id: string) => `Ouvrir la fenêtre ${id}`,
    resume: (id: string) => `Reprendre l’étape ${id}`,
    tap: 'Touche une fenêtre pour t’en approcher.',
    hover: 'Choisis une fenêtre éclairée.',
    facade: 'Façade de l’hôtel : quatorze fenêtres, une par étape',
    hall: 'Le salon du hall',
    hallHint: 'Accès libre · les outils du quotidien',
  },
  en: {
    step: 'Step',
    state: { locked: 'Locked', available: 'Ready to open', in_progress: 'In progress', completed: 'Completed' } as Record<WindowState, string>,
    lockedHint: (prev: string) => `Pass the challenge of step ${prev} to open this window.`,
    enter: 'Enter',
    overview: 'Whole hotel',
    opened: (n: number, t: number) => `${n} / ${t} windows open`,
    tagline: 'One hotel, fourteen windows. Each opens a room where you learn by doing.',
    begin: 'Open window 01',
    openN: (id: string) => `Open window ${id}`,
    resume: (id: string) => `Resume step ${id}`,
    tap: 'Tap a window to get closer.',
    hover: 'Choose a lit window.',
    facade: 'Hotel façade: fourteen windows, one per step',
    hall: 'The lobby lounge',
    hallHint: 'Open access · everyday tools',
  },
};

export default function HotelScene({ lang, chapters }: { lang: Lang; chapters: SceneChapter[] }) {
  const t = L[lang];
  const router = useRouter();
  const game = useGame();
  const ids = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const byId = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);
  const model = useMemo(() => buildModel(chapters), [chapters]);
  const [hydrated, setHydrated] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoomTier, setZoomTier] = useState<number | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [hallHover, setHallHover] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const stateOf = useCallback((id: string): WindowState => (hydrated ? windowState(game, ids, id) : id === ids[0] ? 'available' : 'locked'), [game, ids, hydrated]);
  const openedCount = ids.filter((id) => stateOf(id) !== 'locked').length;
  const upNext = hydrated ? nextUp(game, ids) : ids[0];

  /* ---------- camera ---------- */
  const camera = useCallback((target: { x: number; y: number; w: number; h: number } | null, k = 1, animate = true, clamp = false) => {
    const cam = camRef.current;
    const svg = frameRef.current;
    const stage = stageRef.current;
    if (!cam || !svg || !stage) return;
    cam.style.transition = animate && !prefersReducedMotion() ? '' : 'none';
    if (!target) {
      cam.style.transform = 'translate(0px, 0px) scale(1)';
      return;
    }
    const scale = svg.clientWidth / model.W;
    const px = svg.offsetLeft + (target.x + target.w / 2) * scale;
    const py = svg.offsetTop + (target.y + target.h / 2) * scale;
    const tx = stage.clientWidth / 2 - k * px;
    let ty = stage.clientHeight / 2 - k * py;
    if (clamp) {
      // never reveal empty space below the street
      const bottom = svg.offsetTop + svg.clientHeight;
      ty = Math.max(ty, stage.clientHeight - k * bottom);
    }
    cam.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
  }, [model.W]);

  const scaleNow = () => (frameRef.current ? frameRef.current.clientWidth / model.W : 1);

  // prefetch the rooms the learner can open, while the browser is idle
  useEffect(() => {
    if (!hydrated) return;
    const go = () => {
      router.prefetch(routes.hall(lang));
      ids.forEach((id) => {
        if (windowState(game, ids, id) !== 'locked') router.prefetch(routes.chapter(lang, id));
      });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go);
    else setTimeout(go, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, lang]);

  // arrival: zoom back out from the window we came from, then play an unlock if any
  useLayoutEffect(() => {
    setHydrated(true);
    const from = travel.takeFrom();
    const unlocked = travel.takeUnlocked();
    const s = from ? model.suites.find((x) => x.id === from) : null;
    if (s && !prefersReducedMotion()) {
      const stage = stageRef.current!;
      const k = Math.min(MAX_ZOOM, Math.min(stage.clientWidth / (s.w * scaleNow()), stage.clientHeight / (s.h * scaleNow())) * 0.9);
      camera(s, k, false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          revealPage();
          camera(null, 1, true);
        }),
      );
    } else {
      revealPage();
    }
    if (unlocked) {
      setTimeout(() => {
        setUnlocking(unlocked);
        sfx('unlock');
        setTimeout(() => setUnlocking(null), 2600);
      }, s ? 1100 : 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (zoomTier == null) camera(null, 1, false);
      else zoomToTier(zoomTier, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  const zoomToTier = (tierIdx: number, animate = true) => {
    const tier = model.tiers[tierIdx];
    const stage = stageRef.current!;
    const k = Math.min(3, (stage.clientWidth * 0.96) / (tier.w * scaleNow()), (stage.clientHeight * 0.5) / (tier.h * scaleNow()));
    camera({ x: tier.x, y: tier.y - 10, w: tier.w, h: tier.h + 40 }, Math.max(1, k), animate, true);
  };

  const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const enter = (s: Suite) => {
    if (opening) return;
    const st = stateOf(s.id);
    if (st === 'locked') {
      setSelected(s.id);
      setShake(s.id);
      sfx('wrong');
      setTimeout(() => setShake(null), 500);
      return;
    }
    const href = routes.chapter(lang, s.id);
    travel.setFrom(s.id);
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }
    setOpening(s.id);
    sfx('open');
    const stage = stageRef.current!;
    // the curtains part first, then the camera travels into the window
    setTimeout(() => {
      // capped: the browser rasterises the layer at the final scale of the animation
      const k = Math.min(MAX_ZOOM, Math.max(stage.clientWidth / (s.w * scaleNow()), stage.clientHeight / (s.h * scaleNow())));
      camera({ x: s.x, y: s.y + 20, w: s.w, h: s.h - 20 }, k, true);
    }, 420);
    setTimeout(() => coverAndGo(href, 'warm'), 860);
  };

  const enterHall = () => {
    if (opening) return;
    const href = routes.hall(lang);
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }
    setOpening('hall');
    sfx('open');
    router.prefetch(href);
    const lob = model.lobby;
    const door = { x: CX - 90, y: lob.y + 50, w: 180, h: lob.h - 50 };
    const stage = stageRef.current!;
    const k = Math.min(MAX_ZOOM, Math.max(stage.clientWidth / (door.w * scaleNow()), stage.clientHeight / (door.h * scaleNow())));
    camera(door, k, true);
    setTimeout(() => coverAndGo(href, 'warm'), 700);
  };

  const pick = (s: Suite) => {
    if (isTouch()) {
      // contextual magnifier: first tap brings the tier close and previews the window
      if (zoomTier !== s.tier || selected !== s.id) {
        setZoomTier(s.tier);
        zoomToTier(s.tier);
        setSelected(s.id);
        sfx('tick');
        return;
      }
    }
    enter(s);
  };

  const overview = () => {
    setZoomTier(null);
    setSelected(null);
    camera(null, 1, true);
  };

  const shown = hover ?? selected;
  const shownSuite = shown ? model.suites.find((s) => s.id === shown) : null;
  const shownCh = shown ? byId.get(shown) : null;
  const shownState = shown ? stateOf(shown) : null;
  const prevId = shownSuite && shownSuite.index > 0 ? ids[shownSuite.index - 1] : '';

  return (
    <div className="hx">
      <div className="hx-stage" ref={stageRef}>
        <div className="hx-camera" ref={camRef}>
          <div className="hx-frame" ref={frameRef} style={{ aspectRatio: `${model.W} / ${model.H}` }}>
          {/* static decor on its own layer: painted once, never repainted by window animations */}
          <svg className="hx-svg hx-svg--decor" viewBox={`0 0 ${model.W} ${model.H}`} aria-hidden="true" focusable="false">
            <HotelDecor m={model} />
          </svg>
          <svg
            ref={svgRef}
            className="hx-svg hx-svg--suites"
            viewBox={`0 0 ${model.W} ${model.H}`}
            role="group"
            aria-label={t.facade}
          >
            <g className="hx-suites">
              {model.suites
                .slice()
                .sort((a, b) => a.index - b.index)
                .map((s) => {
                  const st = stateOf(s.id);
                  const ch = byId.get(s.id)!;
                  const label = `${t.step} ${s.id}, ${ch.title}. ${t.state[st]}.${st === 'locked' && s.index > 0 ? ' ' + t.lockedHint(ids[s.index - 1]) : ''}`;
                  const common = {
                    className: `hx-suite${shake === s.id ? ' is-shaking' : ''}`,
                    'data-chapter': s.id,
                    'aria-label': label,
                    onMouseEnter: () => setHover(s.id),
                    onMouseLeave: () => setHover(null),
                    onFocus: () => setHover(s.id),
                    onBlur: () => setHover(null),
                  };
                  const body = (
                    <>
                      <rect x={s.cell.x} y={s.cell.y} width={s.cell.w} height={s.cell.h} fill="transparent" />
                      <SuiteWindow s={s} state={st} active={shown === s.id} opening={opening === s.id} unlocking={unlocking === s.id} />
                    </>
                  );
                  if (st === 'locked') {
                    return (
                      <g
                        key={s.id}
                        {...common}
                        role="button"
                        tabIndex={0}
                        aria-disabled="true"
                        onClick={() => pick(s)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            enter(s);
                          }
                        }}
                      >
                        {body}
                      </g>
                    );
                  }
                  return (
                    <a
                      key={s.id}
                      {...common}
                      href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${routes.chapter(lang, s.id)}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        e.preventDefault();
                        pick(s);
                      }}
                    >
                      {body}
                    </a>
                  );
                })}
            </g>
            <a
              className="hx-suite hx-door"
              href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${routes.hall(lang)}`}
              aria-label={`${t.hall}. ${t.hallHint}.`}
              onMouseEnter={() => setHallHover(true)}
              onMouseLeave={() => setHallHover(false)}
              onFocus={() => setHallHover(true)}
              onBlur={() => setHallHover(false)}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                enterHall();
              }}
            >
              <rect x={CX - 92} y={model.lobby.y + 56} width={184} height={model.lobby.h - 56} fill="transparent" />
              <rect className="hx-door__glow" x={CX - 86} y={model.lobby.y + 63} width={172} height={model.lobby.h - 63} />
              <rect className="sw__focus" x={CX - 96} y={model.lobby.y + 52} width={192} height={model.lobby.h - 50} rx={4} />
            </a>
          </svg>
          </div>
          {hallHover && (
            <div
              className="hx-label hx-label--hall"
              aria-hidden="true"
              style={{
                left: `${(frameRef.current?.offsetLeft ?? 0) + (CX + 130) * scaleNow()}px`,
                top: `${(frameRef.current?.offsetTop ?? 0) + (model.lobby.y + 60) * scaleNow()}px`,
              }}
            >
              <span className="hx-label__num">{t.hallHint}</span>
              <span className="hx-label__title">{t.hall}</span>
            </div>
          )}
          {/* label pinned in façade coordinates (desktop hover) */}
          {hover && shownSuite && shownCh && (
            <div
              className={`hx-label is-${shownState}`}
              aria-hidden="true"
              style={{
                left: `${(frameRef.current?.offsetLeft ?? 0) + (shownSuite.x + shownSuite.w + 14) * scaleNow()}px`,
                top: `${(frameRef.current?.offsetTop ?? 0) + (shownSuite.y + shownSuite.h / 2) * scaleNow()}px`,
              }}
            >
              <span className="hx-label__num">
                {t.step} {shownSuite.id} · {roman(shownCh.blockNumber)} {shownCh.blockName}
              </span>
              <span className="hx-label__title">{shownCh.title}</span>
              <span className="hx-label__state">{shownState === 'locked' && prevId ? t.lockedHint(prevId) : t.state[shownState!]}</span>
            </div>
          )}
        </div>

        {/* caption — desktop */}
        <aside className="hx-caption">
          <h1 className="hx-caption__title">
            100 Hours <em>of Agentic AI</em>
          </h1>
          <p className="hx-caption__tagline">{t.tagline}</p>
          <p className="hx-caption__count">{t.opened(openedCount, ids.length)}</p>
          <ol className="hx-ticks" aria-hidden="true">
            {ids.map((id) => (
              <li key={id} className={`is-${stateOf(id)}`} />
            ))}
          </ol>
          <button type="button" className="hx-cta" onClick={() => enter(model.suites.find((s) => s.id === upNext)!)}>
            {hydrated && game.chapters[upNext]?.visited ? t.resume(upNext) : t.openN(upNext)}
          </button>
        </aside>

        {zoomTier != null && (
          <button type="button" className="hx-overview" onClick={overview}>
            {t.overview}
          </button>
        )}
      </div>

      {/* preview card — touch & narrow screens */}
      <div className="hx-card" aria-live="polite">
        {selected && shownCh && shownState ? (
          <div className={`hx-card__inner is-${shownState}`} key={selected}>
            <span className="hx-card__num">{selected}</span>
            <span className="hx-card__text">
              <span className="hx-card__title">{shownCh.title}</span>
              <span className="hx-card__state">{shownState === 'locked' && prevId ? t.lockedHint(prevId) : `${roman(shownCh.blockNumber)} ${shownCh.blockName} · ${t.state[shownState]}`}</span>
            </span>
            {shownState !== 'locked' && (
              <button type="button" className="hx-card__enter" onClick={() => enter(model.suites.find((s) => s.id === selected)!)}>
                {t.enter}
              </button>
            )}
          </div>
        ) : (
          <div className="hx-card__inner hx-card__inner--idle">
            <span className="hx-card__hint">{t.tap}</span>
            <button type="button" className="hx-card__enter" onClick={() => enter(model.suites.find((s) => s.id === upNext)!)}>
              {hydrated && game.chapters[upNext]?.visited ? t.resume(upNext) : t.openN(upNext)}
            </button>
          </div>
        )}
      </div>
      <Link href={routes.progress(lang)} className="sr-only">
        {lang === 'fr' ? 'Progression' : 'Progress'}
      </Link>
    </div>
  );
}
