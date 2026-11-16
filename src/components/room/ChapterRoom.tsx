'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChapterGame, Station } from '../../game/types';
import { RoomStage, Hotspot, RW, RH } from '../../game/room/RoomScene';
import { PROPS } from '../../game/props';
import { DOOR_AT } from '../../game/chapters';
import MechanicView from '../../game/mechanics';
import { useGame, isUnlocked, markVisited, solveStation, passChallenge, setResume, travel } from '../../game/state';
import { sfx } from '../../game/sound';
import { coverAndGo, revealPage, prefersReducedMotion } from '../../lib/transition';
import { routes, type Lang } from '../../lib/i18n';
import LiteVideo from './LiteVideo';
import IntroSceneView from './levels/IntroScene';
import MissionBoard from './levels/MissionBoard';
import TeachRoom from './levels/TeachRoom';
import ToolkitView from './levels/ToolkitView';
import Companion from '../Companion';
import { companion } from '../../game/companion';

const L = {
  fr: {
    step: 'Étape',
    back: 'L’hôtel',
    library: 'Bibliothèque',
    deeper: 'Atelier pratique',
    stations: (d: number, t: number) => `${d} / ${t} objets compris`,
    open: 'Examiner',
    done: 'Compris',
    next: 'Objet suivant',
    close: 'Revenir à la pièce',
    takeaway: 'À retenir',
    more: 'En savoir plus',
    watch: 'Une vidéo pour prolonger',
    door: 'La porte du défi',
    doorLocked: (n: number) => `Comprends d’abord les ${n} objets de la pièce.`,
    doorReady: 'Le défi final t’attend.',
    doorDone: 'Défi réussi. La porte est ouverte.',
    trial: (i: number, n: number) => `Épreuve ${i} sur ${n}`,
    continue: 'Épreuve suivante',
    retry: 'Une erreur se corrige : relis l’explication et réessaie.',
    earned: 'Tu as obtenu',
    unlockedNext: (_id: string) => 'La fenêtre de cette chambre est maintenant illuminée sur la façade.',
    lastFloor: 'Tu as terminé le dernier étage de l’hôtel.',
    toHotel: 'Retourner à l’hôtel',
    stay: 'Rester dans la pièce',
    lockedTitle: 'Cette porte est encore fermée.',
    lockedBody: (prev: string) => `Réussis le défi de l’étape ${prev} pour ouvrir cette pièce.`,
    goPrev: (prev: string) => `Aller à l’étape ${prev}`,
    videos: 'Vidéos',
    resources: 'Ressources',
    programme: 'Programme',
    extra: 'Complément',
    kind: { video: 'Vidéo', doc: 'Documentation', article: 'Article', paper: 'Article de recherche', tool: 'Outil', course: 'Cours', repo: 'Dépôt GitHub', exercise: 'Exercice' } as Record<string, string>,
    skills: 'Ce que tu sauras faire',
    notions: 'Notions abordées',
    objects: 'Les objets de la pièce',
  },
  en: {
    step: 'Step',
    back: 'The hotel',
    library: 'Library',
    deeper: 'Practice Lab',
    stations: (d: number, t: number) => `${d} / ${t} objects understood`,
    open: 'Examine',
    done: 'Understood',
    next: 'Next object',
    close: 'Back to the room',
    takeaway: 'Remember',
    more: 'Learn more',
    watch: 'A video to go further',
    door: 'The challenge door',
    doorLocked: (n: number) => `First understand the ${n} objects in the room.`,
    doorReady: 'The final challenge awaits.',
    doorDone: 'Challenge passed. The door is open.',
    trial: (i: number, n: number) => `Trial ${i} of ${n}`,
    continue: 'Next trial',
    retry: 'Mistakes can be fixed: read the explanation and try again.',
    earned: 'You earned',
    unlockedNext: (_id: string) => 'This room’s window is now lit on the façade.',
    lastFloor: 'You have completed the hotel’s top floor.',
    toHotel: 'Back to the hotel',
    stay: 'Stay in the room',
    lockedTitle: 'This door is still closed.',
    lockedBody: (prev: string) => `Pass the challenge of step ${prev} to open this room.`,
    goPrev: (prev: string) => `Go to step ${prev}`,
    videos: 'Videos',
    resources: 'Resources',
    programme: 'Programme',
    extra: 'Extra',
    kind: { video: 'Video', doc: 'Documentation', article: 'Article', paper: 'Research paper', tool: 'Tool', course: 'Course', repo: 'GitHub repo', exercise: 'Exercise' } as Record<string, string>,
    skills: 'What you will be able to do',
    notions: 'Notions covered',
    objects: 'Objects in the room',
  },
};

type Panel = { type: 'station'; id: string } | { type: 'challenge' } | { type: 'library' } | { type: 'kit' } | { type: 'mission' } | { type: 'teach' } | { type: 'intro' } | { type: 'menu' } | null;
const WIDE = ['mission', 'teach', 'intro'];

export default function ChapterRoom({
  lang,
  game,
  title,
  block,
  ids,
  annex = false,
}: {
  lang: Lang;
  game: ChapterGame;
  title: string;
  block: string;
  ids: string[];
  annex?: boolean;
}) {
  const t = L[lang];
  const g = useGame();
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [ceremony, setCeremony] = useState(false);
  const [greeting, setGreeting] = useState<string | undefined>(undefined);
  const camRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const idx = ids.indexOf(game.id);
  const prevId = idx > 0 ? ids[idx - 1] : null;
  const nextId = idx < ids.length - 1 ? ids[idx + 1] : null;
  const unlocked = !hydrated || isUnlocked(g, ids, game.id);
  const cs = g.chapters[game.id];
  const solved = useMemo(() => new Set(hydrated ? cs?.stations ?? [] : []), [cs, hydrated]);
  const passed = hydrated && !!cs?.challenge;
  const solvedCount = game.stations.filter((s) => solved.has(s.id)).length;
  const stationsDone = solvedCount === game.stations.length;
  const missionDone = !game.mission || solved.has('mission');
  const teachDone = !game.teach || solved.has('teach');
  const introDone = !game.intro || solved.has('intro');
  const doorReady = stationsDone && missionDone && teachDone;

  useLayoutEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (isUnlocked(g, ids, game.id)) {
      // Gaspard greets once per room (first visit), then stays quiet unless asked
      if (!g.chapters[game.id]?.visited)
        setGreeting(
          lang === 'fr'
            ? `Bienvenue : ${game.room.name.fr}. Touche un objet doré, je reste là si besoin.`
            : `Welcome: ${game.room.name.en}. Tap a golden object, I’m here if needed.`,
        );
      markVisited(game.id);
      sfx('enter');
      // first visit: the concierge desk opens straight away — a first success in seconds
      if (game.intro && !(g.chapters[game.id]?.stations ?? []).includes('intro')) setPanel({ type: 'intro' });
    }
    revealPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /* camera: lean towards the object being studied (wide screens) */
  const focus = useCallback((at: { x: number; y: number } | null) => {
    const cam = camRef.current;
    const stage = stageRef.current;
    if (!cam || !stage) return;
    const wide = window.matchMedia('(min-width: 900px)').matches;
    if (!at || !wide || prefersReducedMotion()) {
      cam.style.transform = '';
      return;
    }
    const svg = cam.querySelector('.room-frame') as HTMLDivElement;
    const k = 1.35;
    const sc = svg.clientWidth / RW;
    const px = svg.offsetLeft + at.x * sc;
    const py = svg.offsetTop + at.y * sc;
    // keep the object in the left part of the screen, the panel covers the right
    let tx = stage.clientWidth * 0.3 - k * px;
    let ty = stage.clientHeight * 0.5 - k * py;
    // never show beyond the edges of the room (the panel covers the right ~48%)
    const fl = svg.offsetLeft;
    const ft = svg.offsetTop;
    const fw = svg.clientWidth;
    const fh = svg.clientHeight;
    const visibleW = stage.clientWidth * 0.52;
    tx = Math.min(-k * fl, Math.max(visibleW - k * (fl + fw), tx));
    ty = Math.min(-k * ft, Math.max(stage.clientHeight - k * (ft + fh), ty));
    cam.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
  }, []);

  const openStation = (s: Station) => {
    sfx('open');
    companion.setContext({ nudge: s.everyday?.analogy[lang], key: s.takeaway[lang] });
    setPanel({ type: 'station', id: s.id });
    setResume(game.id, s.id);
    // let the panel mount first, then move the camera on the next frame
    requestAnimationFrame(() => requestAnimationFrame(() => focus(s.at)));
  };
  useEffect(() => () => companion.setContext(null), []);
  const openDoor = () => {
    if (!doorReady && !passed) {
      sfx('wrong');
      setPanel({ type: 'challenge' });
      focus(DOOR_AT);
      return;
    }
    sfx('open');
    setPanel({ type: 'challenge' });
    focus(DOOR_AT);
  };
  const closePanel = () => {
    sfx('close');
    companion.setContext(null);
    setPanel(null);
    focus(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panel && !ceremony) closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const openLevel = (type: 'intro' | 'mission' | 'teach') => {
    sfx('open');
    setPanel({ type });
    focus(null);
  };
  /** The single next thing to do — the primary action on phones. */
  const firstOpen = game.stations.find((x) => !solved.has(x.id));
  const nextAction: { label: string; run: () => void } = !introDone
    ? { label: lang === 'fr' ? 'Commencer au comptoir' : 'Start at the desk', run: () => openLevel('intro') }
    : firstOpen
      ? { label: `${lang === 'fr' ? 'Continuer' : 'Continue'} · ${firstOpen.object[lang]}`, run: () => openStation(firstOpen) }
      : !missionDone
        ? { label: lang === 'fr' ? 'Mission · Appliquer en entreprise' : 'Mission · Apply at work', run: () => openLevel('mission') }
        : !teachDone
          ? { label: lang === 'fr' ? 'Former l’équipe' : 'Train the team', run: () => openLevel('teach') }
          : !passed
            ? { label: lang === 'fr' ? 'Défi final' : 'Final challenge', run: () => openDoor() }
            : { label: t.toHotel, run: () => toHotel() };
  const totalSteps = game.stations.length + (game.intro ? 1 : 0) + (game.mission ? 1 : 0) + (game.teach ? 1 : 0) + 1;
  const doneSteps = solvedCount + (game.intro && introDone ? 1 : 0) + (game.mission && missionDone ? 1 : 0) + (game.teach && teachDone ? 1 : 0) + (passed ? 1 : 0);

  const toHotel = () => {
    if (!annex) travel.setFrom(game.id);
    coverAndGo(routes.hotel(lang), 'night');
  };

  const win = () => {
    passChallenge(game.id);
    sfx('unlock');
    setCeremony(true);
  };

  if (hydrated && !unlocked) {
    return (
      <div className="room room--locked">
        <div className="locked">
          <p className="locked__kicker">
            {t.step} {game.id}
          </p>
          <h1 className="locked__title">{t.lockedTitle}</h1>
          <p className="locked__body">{prevId && t.lockedBody(prevId)}</p>
          <div className="locked__actions">
            {prevId && (
              <Link className="hx-cta" href={routes.chapter(lang, prevId)}>
                {t.goPrev(prevId)}
              </Link>
            )}
            <button type="button" className="room-btn" onClick={toHotel}>
              {t.toHotel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const station = panel?.type === 'station' ? game.stations.find((s) => s.id === panel.id)! : null;
  const stationIdx = station ? game.stations.indexOf(station) : -1;
  const nextStation = game.stations.find((s, i) => i > stationIdx && !solved.has(s.id)) ?? game.stations.find((s) => !solved.has(s.id));

  return (
    <div className={`room${panel ? ' has-panel' : ''}`} style={{ ['--room-accent' as string]: game.room.style.accent }}>
      <div className="room-bar">
        <button type="button" className="room-back" onClick={toHotel}>
          <span className="room-back__arrow" aria-hidden="true" />
          {t.back}
        </button>
        <div className="room-bar__title">
          <p className="room-bar__kicker">
            {annex ? (lang === 'fr' ? 'Rez-de-chaussée · accès libre' : 'Ground floor · open access') : `${t.step} ${game.id} · ${game.room.name[lang]}`}
          </p>
          <h1 className="room-bar__h1">{title}</h1>
        </div>
        <div className="room-bar__progress" aria-label={t.stations(solvedCount, game.stations.length)}>
          <ol aria-hidden="true">
            {game.stations.map((s) => (
              <li key={s.id} className={solved.has(s.id) ? 'is-done' : ''} />
            ))}
            <li className={`is-door${passed ? ' is-done' : ''}`} />
          </ol>
          <span>{t.stations(solvedCount, game.stations.length)}</span>
        </div>
        <button type="button" className="room-more" aria-label={lang === 'fr' ? 'Plus : ressources et atelier' : 'More: resources and lab'} onClick={() => (sfx('open'), setPanel({ type: 'menu' }), focus(null))}>
          <span aria-hidden="true" />
        </button>
        <div className="room-bar__actions">
          {game.toolkit && (
            <button type="button" className="room-btn room-btn--ghost" onClick={() => (sfx('open'), setPanel({ type: 'kit' }), focus(null))}>
              {lang === 'fr' ? 'Kit de transmission' : 'Teaching kit'}
            </button>
          )}
          <button type="button" className="room-btn" onClick={() => (sfx('open'), setPanel({ type: 'library' }), focus(null))}>
            {t.library}
          </button>
          {!annex && (
            <Link className="room-btn room-btn--ghost" href={`${routes.chapter(lang, game.id)}programme/`}>
              {t.deeper}
            </Link>
          )}
        </div>
      </div>

      {(game.intro || game.mission || game.teach) && (
        <nav className="journey" aria-label={lang === 'fr' ? 'Parcours de la chambre' : 'Room journey'}>
          <ol>
            {game.intro && (
              <li>
                <button type="button" className={`journey__step${introDone ? ' is-done' : ''}`} onClick={() => (sfx('open'), setPanel({ type: 'intro' }), focus(null))}>
                  <span className="journey__k">{lang === 'fr' ? 'Accueil' : 'Welcome'}</span>
                  <span className="journey__t">{lang === 'fr' ? 'Le comptoir' : 'The desk'}</span>
                </button>
              </li>
            )}
            <li>
              <button type="button" className={`journey__step${stationsDone ? ' is-done' : ''}`} onClick={() => { const s0 = game.stations.find((x) => !solved.has(x.id)) ?? game.stations[0]; openStation(s0); }}>
                <span className="journey__k">{lang === 'fr' ? 'Niveau 1' : 'Level 1'}</span>
                <span className="journey__t">
                  {lang === 'fr' ? 'Comprendre' : 'Understand'} <em>{solvedCount}/{game.stations.length}</em>
                </span>
              </button>
            </li>
            {game.mission && (
              <li>
                <button type="button" className={`journey__step${missionDone ? ' is-done' : ''}`} onClick={() => (sfx('open'), setPanel({ type: 'mission' }), focus(null))}>
                  <span className="journey__k">{lang === 'fr' ? 'Niveau 2' : 'Level 2'}</span>
                  <span className="journey__t">{lang === 'fr' ? 'Appliquer' : 'Apply'}</span>
                </button>
              </li>
            )}
            {game.teach && (
              <li>
                <button type="button" className={`journey__step${teachDone ? ' is-done' : ''}`} onClick={() => (sfx('open'), setPanel({ type: 'teach' }), focus(null))}>
                  <span className="journey__k">{lang === 'fr' ? 'Niveau 3' : 'Level 3'}</span>
                  <span className="journey__t">{lang === 'fr' ? 'Transmettre' : 'Teach'}</span>
                </button>
              </li>
            )}
            <li>
              <button type="button" className={`journey__step journey__step--door${passed ? ' is-done' : ''}${doorReady ? ' is-ready' : ''}`} onClick={openDoor}>
                <span className="journey__k">{lang === 'fr' ? 'Validation' : 'Validation'}</span>
                <span className="journey__t">{lang === 'fr' ? 'Défi final' : 'Final challenge'}</span>
              </button>
            </li>
          </ol>
        </nav>
      )}

      <div className="room-stage" ref={stageRef}>
        <div className="room-camera" ref={camRef}>
          <div className="room-frame">
          <RoomStage game={game}>
            {game.stations.map((s, i) => (
              <Hotspot
                key={s.id}
                st={s}
                index={i}
                style={game.room.style}
                solved={solved.has(s.id)}
                active={station?.id === s.id}
                label={`${i + 1}. ${s.object[lang]} : ${s.title[lang]}${solved.has(s.id) ? ` (${t.done})` : ''}`}
                onOpen={() => openStation(s)}
              />
            ))}
            <g
              className={`hs hs--door${passed ? ' is-solved' : ''}${doorReady ? ' is-ready' : ''}${panel?.type === 'challenge' ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${t.door}. ${passed ? t.doorDone : doorReady ? t.doorReady : t.doorLocked(game.stations.length)}`}
              onClick={openDoor}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openDoor();
                }
              }}
            >
              <ellipse className="hs__glow" cx={DOOR_AT.x} cy={DOOR_AT.y} rx="150" ry="230" fill="url(#rm-pool)" />
              <g className="hs__prop">{PROPS.door({ x: DOOR_AT.x, y: DOOR_AT.y, style: game.room.style })}</g>
              <rect className="hs__hit" x={DOOR_AT.x - 100} y={DOOR_AT.y - 220} width="200" height="400" fill="transparent" />
              <rect className="hs__focus" x={DOOR_AT.x - 104} y={DOOR_AT.y - 226} width="208" height="408" rx="14" />
            </g>
          </RoomStage>
          </div>
        </div>
      </div>

      {/* object list: the room's index (always available; primary navigation on phones) */}
      <nav className="room-list" aria-label={t.objects}>
        <ol>
          {game.intro && (
            <li>
              <button type="button" className={`room-list__item room-list__item--level${introDone ? ' is-done' : ''}`} onClick={() => openLevel('intro')}>
                <span className="room-list__n" aria-hidden="true">◆</span>
                <span className="room-list__text">
                  <span className="room-list__obj">{lang === 'fr' ? 'Accueil' : 'Welcome'}</span>
                  <span className="room-list__title">{lang === 'fr' ? 'Le comptoir du concierge' : 'The concierge desk'}</span>
                </span>
                <span className="room-list__state">{introDone ? t.done : t.open}</span>
              </button>
            </li>
          )}
          {game.stations.map((s, i) => (
            <li key={s.id}>
              <button type="button" className={`room-list__item${solved.has(s.id) ? ' is-done' : ''}`} onClick={() => openStation(s)}>
                <span className="room-list__n">{i + 1}</span>
                <span className="room-list__text">
                  <span className="room-list__obj">{s.object[lang]}</span>
                  <span className="room-list__title">{s.title[lang]}</span>
                </span>
                <span className="room-list__state">{solved.has(s.id) ? t.done : t.open}</span>
              </button>
            </li>
          ))}
          {game.mission && (
            <li>
              <button type="button" className={`room-list__item room-list__item--level${missionDone ? ' is-done' : ''}`} onClick={() => openLevel('mission')}>
                <span className="room-list__n" aria-hidden="true">◆</span>
                <span className="room-list__text">
                  <span className="room-list__obj">{lang === 'fr' ? 'Niveau 2 · Appliquer' : 'Level 2 · Apply'}</span>
                  <span className="room-list__title">{game.mission.client[lang]}</span>
                </span>
                <span className="room-list__state">{missionDone ? t.done : t.open}</span>
              </button>
            </li>
          )}
          {game.teach && (
            <li>
              <button type="button" className={`room-list__item room-list__item--level${teachDone ? ' is-done' : ''}`} onClick={() => openLevel('teach')}>
                <span className="room-list__n" aria-hidden="true">◆</span>
                <span className="room-list__text">
                  <span className="room-list__obj">{lang === 'fr' ? 'Niveau 3 · Transmettre' : 'Level 3 · Teach'}</span>
                  <span className="room-list__title">{lang === 'fr' ? 'À toi de former l’équipe' : 'Your turn to train the team'}</span>
                </span>
                <span className="room-list__state">{teachDone ? t.done : t.open}</span>
              </button>
            </li>
          )}
          <li>
            <button type="button" className={`room-list__item room-list__item--door${passed ? ' is-done' : ''}${doorReady ? ' is-ready' : ''}`} onClick={openDoor}>
              <span className="room-list__n" aria-hidden="true">
                ⌂
              </span>
              <span className="room-list__text">
                <span className="room-list__obj">{t.door}</span>
                <span className="room-list__title">{game.challenge.title[lang]}</span>
              </span>
              <span className="room-list__state">{passed ? t.done : doorReady ? t.open : `${solvedCount}/${game.stations.length}`}</span>
            </button>
          </li>
        </ol>
      </nav>

      {/* side panel / sheet */}
      {panel && WIDE.includes(panel.type) && (
        <section className={`level-sheet level-sheet--${panel.type}`} role="dialog" aria-modal="false" aria-label={panel.type}>
          <div className="level-sheet__bar">
            <button type="button" className="room-panel__close" onClick={closePanel}>
              {t.close}
            </button>
          </div>
          <div className="level-sheet__body">
            {panel.type === 'intro' && game.intro && (
              <IntroSceneView
                lang={lang}
                intro={game.intro}
                onDone={() => {
                  solveStation(game.id, 'intro');
                  closePanel();
                }}
              />
            )}
            {panel.type === 'mission' && game.mission && (
              <MissionBoard lang={lang} mission={game.mission} done={missionDone && hydrated && solved.has('mission')} onDone={() => solveStation(game.id, 'mission')} />
            )}
            {panel.type === 'teach' && game.teach && (
              <TeachRoom lang={lang} teach={game.teach} done={hydrated && solved.has('teach')} onDone={() => solveStation(game.id, 'teach')} />
            )}
            {panel.type === 'mission' && missionDone && (
              <button type="button" className="hx-cta level-sheet__next" onClick={() => (game.teach && !teachDone ? setPanel({ type: 'teach' }) : openDoor())}>
                {game.teach && !teachDone ? (lang === 'fr' ? 'Niveau 3 · Transmettre' : 'Level 3 · Teach') : t.door}
              </button>
            )}
            {panel.type === 'teach' && teachDone && (
              <button type="button" className="hx-cta level-sheet__next" onClick={openDoor}>
                {t.door}
              </button>
            )}
          </div>
        </section>
      )}

      {panel && !WIDE.includes(panel.type) && (
        <aside className={`room-panel room-panel--${panel.type}`} role="dialog" aria-modal="false" aria-label={station ? station.title[lang] : panel.type === 'library' ? t.library : game.challenge.title[lang]}>
          <div className="room-panel__head">
            <button type="button" className="room-panel__close" onClick={closePanel}>
              {t.close}
            </button>
          </div>
          <div className="room-panel__body" key={panel.type === 'station' ? panel.id : panel.type}>
            {station && (
              <StationView
                lang={lang}
                s={station}
                index={stationIdx}
                game={game}
                solved={solved.has(station.id)}
                onSolved={() => {
                  solveStation(game.id, station.id);
                  sfx('correct');
                }}
                onNext={
                  nextStation && nextStation.id !== station.id
                    ? () => openStation(nextStation)
                    : game.mission && !missionDone
                      ? () => (sfx('open'), setPanel({ type: 'mission' }), focus(null))
                      : game.teach && !teachDone
                        ? () => (sfx('open'), setPanel({ type: 'teach' }), focus(null))
                        : openDoor
                }
                nextLabel={
                  nextStation && nextStation.id !== station.id
                    ? `${t.next} · ${nextStation.object[lang]}`
                    : game.mission && !missionDone
                      ? lang === 'fr' ? 'Niveau 2 · Appliquer' : 'Level 2 · Apply'
                      : game.teach && !teachDone
                        ? lang === 'fr' ? 'Niveau 3 · Transmettre' : 'Level 3 · Teach'
                        : t.door
                }
              />
            )}
            {panel.type === 'challenge' && (
              <ChallengeView lang={lang} game={game} ready={doorReady || passed} passed={passed} solvedCount={solvedCount} onWin={win} />
            )}
            {panel.type === 'library' && <LibraryView lang={lang} game={game} />}
            {panel.type === 'menu' && (
              <div className="room-menu">
                <h2 className="station__title">{game.room.name[lang]}</h2>
                <button type="button" className="room-menu__item" onClick={() => setPanel({ type: 'library' })}>
                  <b>{t.library}</b>
                  <span>{lang === 'fr' ? 'Vidéos, ressources et notions de la chambre' : 'Videos, resources and notions of the room'}</span>
                </button>
                {game.toolkit && (
                  <button type="button" className="room-menu__item" onClick={() => setPanel({ type: 'kit' })}>
                    <b>{lang === 'fr' ? 'Kit de transmission' : 'Teaching kit'}</b>
                    <span>{lang === 'fr' ? 'Pour expliquer ce chapitre à une équipe' : 'To explain this chapter to a team'}</span>
                  </button>
                )}
                {!annex && (
                  <Link className="room-menu__item" href={`${routes.chapter(lang, game.id)}programme/`}>
                    <b>{t.deeper}</b>
                    <span>{lang === 'fr' ? 'Construire, casser, mesurer : les exercices approfondis' : 'Build, break, measure: the in-depth exercises'}</span>
                  </Link>
                )}
              </div>
            )}
            {panel.type === 'kit' && game.toolkit && <ToolkitView lang={lang} kit={game.toolkit} chapter={`${t.step} ${game.id} · ${title}`} />}
          </div>
        </aside>
      )}

      {!ceremony && <Companion lang={lang} greeting={greeting} />}

      {/* phones: one primary action, within thumb reach */}
      {!panel && !ceremony && (
        <div className="room-next">
          <span className="room-next__count" aria-label={`${doneSteps} / ${totalSteps}`}>
            {doneSteps}/{totalSteps}
          </span>
          <button type="button" className="hx-cta room-next__btn" onClick={nextAction.run}>
            {nextAction.label}
          </button>
        </div>
      )}

      {ceremony && (
        <div className="ceremony" role="dialog" aria-modal="true" aria-label={game.challenge.reward.name[lang]}>
          <div className="ceremony__rays" aria-hidden="true" />
          <div className="ceremony__inner">
            <svg className="ceremony__object" viewBox="-160 -120 320 240" aria-hidden="true">
              {(PROPS[game.challenge.reward.prop] ?? PROPS.key)({ x: 0, y: 0, style: game.room.style })}
            </svg>
            <p className="ceremony__kicker">{t.earned}</p>
            <h2 className="ceremony__title">{game.challenge.reward.name[lang]}</h2>
            {game.capability && (
              <p className="ceremony__cap">
                {lang === 'fr' ? 'Le concierge sait maintenant : ' : 'The concierge can now: '}
                <b>{game.capability[lang]}</b>
              </p>
            )}
            <p className="ceremony__body">{annex ? (lang === 'fr' ? 'Il rejoint ta collection. Les fenêtres de l’hôtel t’attendent.' : 'It joins your collection. The hotel windows await you.') : nextId ? t.unlockedNext(nextId) : t.lastFloor}</p>
            <div className="ceremony__actions">
              <button type="button" className="hx-cta" onClick={toHotel} autoFocus>
                {t.toHotel}
              </button>
              <button type="button" className="room-btn" onClick={() => (setCeremony(false), closePanel())}>
                {t.stay}
              </button>
            </div>
          </div>
        </div>
      )}
      <span className="sr-only">{block}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StationView({
  lang,
  s,
  index,
  game,
  solved,
  onSolved,
  onNext,
  nextLabel,
}: {
  lang: Lang;
  s: Station;
  index: number;
  game: ChapterGame;
  solved: boolean;
  onSolved: () => void;
  onNext: (() => void) | null;
  nextLabel: string;
}) {
  const t = L[lang];
  const [won, setWon] = useState(solved);
  const [firstDone, setFirstDone] = useState(solved);
  const video = s.video ? game.videos.find((v) => v.id === s.video) : null;
  return (
    <div className="station">
      <p className="station__kicker">
        <span className="station__n">{index + 1}</span> {s.object[lang]}
      </p>
      <h2 className="station__title">{s.title[lang]}</h2>
      {s.everyday && (
        <div className="everyday">
          <p className="everyday__k">{lang === 'fr' ? 'Dans la vie de tous les jours' : 'In everyday life'}</p>
          <p className="everyday__a">{s.everyday.analogy[lang]}</p>
          <p className="everyday__l">
            <b>{lang === 'fr' ? 'Là où l’image s’arrête : ' : 'Where the picture stops: '}</b>
            {s.everyday.limit[lang]}
          </p>
        </div>
      )}
      <p className="station__show">{s.show[lang]}</p>
      <MechanicView
        key={s.id}
        m={s.mechanic}
        lang={lang}
        onSolved={() => {
          if (s.then) {
            setFirstDone(true);
            return;
          }
          setWon(true);
          if (!solved) onSolved();
        }}
      />
      {s.then && (firstDone || solved) && (
        <div className="station__then">
          <p className="station__then-k">{lang === 'fr' ? 'À toi de jouer' : 'Your turn'}</p>
          <MechanicView
            key={`${s.id}-then`}
            m={s.then}
            lang={lang}
            onSolved={() => {
              setWon(true);
              if (!solved) onSolved();
            }}
          />
        </div>
      )}
      {(won || solved) && (
        <div className="station__after">
          <div className="takeaway-card">
            <p className="takeaway-card__label">{t.takeaway}</p>
            <p className="takeaway-card__text">{s.takeaway[lang]}</p>
          </div>
          {s.more && (
            <details className="more">
              <summary>{t.more}</summary>
              <p>{s.more[lang]}</p>
            </details>
          )}
          {video && (
            <div className="station__video">
              <p className="takeaway-card__label">{t.watch}</p>
              <LiteVideo v={video} lang={lang} />
            </div>
          )}
          {onNext && (
            <button type="button" className="hx-cta station__next" onClick={onNext}>
              {nextLabel}
            </button>
          )}
        </div>
      )}
      {!won && !solved && s.more && (
        <details className="more more--before">
          <summary>{t.more}</summary>
          <p>{s.more[lang]}</p>
        </details>
      )}
    </div>
  );
}

function ChallengeView({ lang, game, ready, passed, solvedCount, onWin }: { lang: Lang; game: ChapterGame; ready: boolean; passed: boolean; solvedCount: number; onWin: () => void }) {
  const t = L[lang];
  const [step, setStep] = useState(0);
  const [stepSolved, setStepSolved] = useState(false);
  const n = game.challenge.steps.length;
  if (!ready) {
    return (
      <div className="station">
        <p className="station__kicker">{t.door}</p>
        <h2 className="station__title">{game.challenge.title[lang]}</h2>
        <p className="station__show">
          {game.mission || game.teach
            ? lang === 'fr'
              ? 'La porte s’ouvre quand les trois niveaux sont faits : comprendre, appliquer, transmettre.'
              : 'The door opens once the three levels are done: understand, apply, teach.'
            : t.doorLocked(game.stations.length)}
        </p>
        <div className="door-meter" aria-hidden="true">
          {game.stations.map((s, i) => (
            <span key={s.id} className={i < solvedCount ? 'is-done' : ''} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="station">
      <p className="station__kicker">{t.door}</p>
      <h2 className="station__title">{game.challenge.title[lang]}</h2>
      <p className="station__show">{passed ? t.doorDone : game.challenge.brief[lang]}</p>
      <ol className="trials" aria-hidden="true">
        {game.challenge.steps.map((_, i) => (
          <li key={i} className={i < step || (i === step && stepSolved) || passed ? 'is-done' : i === step ? 'is-current' : ''} />
        ))}
      </ol>
      <p className="trial__label">{t.trial(step + 1, n)}</p>
      <MechanicView
        key={`trial-${step}`}
        m={game.challenge.steps[step]}
        lang={lang}
        onSolved={() => {
          setStepSolved(true);
          if (step === n - 1 && !passed) onWin();
        }}
      />
      {stepSolved && step < n - 1 && (
        <button
          type="button"
          className="hx-cta station__next"
          onClick={() => {
            setStep(step + 1);
            setStepSolved(false);
            sfx('latch');
          }}
        >
          {t.continue}
        </button>
      )}
      {!stepSolved && <p className="trial__hint">{t.retry}</p>}
    </div>
  );
}

function LibraryView({ lang, game }: { lang: Lang; game: ChapterGame }) {
  const t = L[lang];
  return (
    <div className="library">
      <p className="station__kicker">{game.room.name[lang]}</p>
      <h2 className="station__title">{t.library}</h2>
      <section className="library__skills">
        <h3>{t.skills}</h3>
        <ul>
          {game.skills.map((s, i) => (
            <li key={i}>{s[lang]}</li>
          ))}
        </ul>
      </section>
      {game.videos.length > 0 && (
        <section>
          <h3>{t.videos}</h3>
          <div className="library__videos">
            {game.videos.map((v) => (
              <LiteVideo key={v.id} v={v} lang={lang} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h3>{t.resources}</h3>
        <ul className="res-list">
          {game.resources.map((r) => (
            <li key={r.url} className="res">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="res__link">
                <span className="res__meta">
                  <span className="res__kind">{t.kind[r.kind]}</span>
                  <span>{r.source}</span>
                  <span className="res__lang">{r.lang.toUpperCase()}</span>
                  <span className={`res__origin${r.programme ? ' is-programme' : ''}`}>{r.programme ? t.programme : t.extra}</span>
                </span>
                <span className="res__title">{r.title}</span>
                <span className="res__note">{r.note[lang]}</span>
                <span className="res__host">{new URL(r.url).hostname.replace(/^www\./, '')} ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      {game.coverage && game.coverage.length > 0 && (
        <details className="cov">
          <summary>{lang === 'fr' ? `Carte des compétences · ${game.coverage.length} notions` : `Skills map · ${game.coverage.length} notions`}</summary>
          <ol>
            {game.coverage.map((r, i) => {
              const where = (k: string) =>
                k === 'intro' ? (lang === 'fr' ? 'Comptoir' : 'Desk') :
                k === 'mission' ? (lang === 'fr' ? 'Mission' : 'Mission') :
                k === 'teach' ? (lang === 'fr' ? 'Former l’équipe' : 'Train the team') :
                k === 'challenge' ? (lang === 'fr' ? 'Défi final' : 'Final challenge') :
                k === 'lab' ? t.deeper :
                game.stations.find((x) => x.id === k)?.object[lang] ?? k;
              return (
                <li key={i}>
                  <p className="cov__notion">{r.notion[lang]}</p>
                  <p className="cov__skill">{r.skill[lang]}</p>
                  <p className="cov__path">
                    <span>{lang === 'fr' ? 'Découvrir' : 'Discover'} : {where(r.learn)}</span>
                    <span>{lang === 'fr' ? 'Réutiliser' : 'Reuse'} : {where(r.practice)}</span>
                    <span className="is-check">{r.check[lang]}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        </details>
      )}
      <section className="library__notions">
        <h3>{t.notions}</h3>
        <ul>
          {game.notions.map((s, i) => (
            <li key={i}>{s[lang]}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export { RH };
