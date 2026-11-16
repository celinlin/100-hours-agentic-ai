'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { dict, routes, switchLangPath, parseSlug, LANGS, type Lang } from '../lib/i18n';
import { useProgress, useHydrated, completedCount, saveScroll, nav } from '../lib/progress';
import { leaveToHotel, isPlainClick } from '../lib/transition';
import Chronometer from './Chronometer';
import SoundToggle from './SoundToggle';
import MusicPlayer from './MusicPlayer';
import Onboarding, { openOnboarding } from './Onboarding';
import { useState } from 'react';
import { useGame, isUnlocked, travel } from '../game/state';

export function Monogram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 36" aria-hidden="true">
      <path d="M14 1 L15 7 H13 Z" fill="currentColor" />
      <path d="M10 7 H18 V12 H21 V18 H24 V35 H4 V18 H7 V12 H10 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 7 V35 M10 18 V35 M18 18 V35" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}

export default function Header({ lang, ids, tone }: { lang: Lang; ids: string[]; tone: 'night' | 'paper' }) {
  const t = dict[lang];
  const pathname = usePathname() ?? `/${lang}/`;
  const router = useRouter();
  const progress = useProgress();
  const hydrated = useHydrated();
  const game = useGame();
  const done = ids.filter((id) => game.chapters[id]?.challenge).length;
  void completedCount;
  void progress;
  void isUnlocked;
  const route = parseSlug(pathname.split('/').filter(Boolean)[1] ?? '');
  const onHotel = !route;
  const [more, setMore] = useState(false);

  const switchTo = (to: Lang) => {
    try {
      window.localStorage.setItem('hotel100.lang', to);
    } catch {
      /* preference simply not remembered */
    }
    if (route?.kind === 'chapter') {
      const h = document.documentElement;
      saveScroll(route.id, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight));
      nav.setResume(route.id);
    } else if (onHotel) {
      nav.saveHotelScroll(window.scrollY / Math.max(1, document.documentElement.scrollHeight));
    }
  };

  return (
    <header className={`site-header site-header--${tone}`}>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <div className="site-header__inner">
        <Link
          href={routes.hotel(lang)}
          className="brand"
          onClick={(e) => {
            if (!onHotel && isPlainClick(e)) {
              e.preventDefault();
              if (route?.kind === 'chapter') travel.setFrom(route.id);
              leaveToHotel(routes.hotel(lang));
            }
          }}
        >
          <Monogram className="brand__mark" />
          <span className="brand__name">
            <span className="brand__line">100 Hours</span>
            <span className="brand__line brand__line--sub">of Agentic AI</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label={lang === 'fr' ? 'Navigation principale' : 'Main navigation'}>
          {!onHotel && (
            <Link
              href={routes.hotel(lang)}
              className="site-nav__link site-nav__link--hotel"
              onClick={(e) => {
                if (isPlainClick(e)) {
                  e.preventDefault();
                  if (route?.kind === 'chapter') travel.setFrom(route.id);
                  leaveToHotel(routes.hotel(lang));
                }
              }}
            >
              {t.theHotel}
            </Link>
          )}
          <Chronometer lang={lang} tone={tone} />
          <button type="button" className={`site-nav__more-btn${more ? ' is-open' : ''}`} aria-expanded={more} aria-controls="site-more" aria-label={lang === 'fr' ? 'Menu' : 'Menu'} onClick={() => setMore((m) => !m)}>
            <span aria-hidden="true" />
          </button>
          <div id="site-more" className={`site-nav__more${more ? ' is-open' : ''}`}>
          <Link
            onClick={() => setMore(false)}
            href={routes.progress(lang)}
            className="site-nav__progress"
            aria-current={route?.kind === 'progress' ? 'page' : undefined}
          >
            <span className="site-nav__progress-label">{t.myProgress}</span>
            <span className="site-nav__count" aria-hidden={!hydrated}>
              {hydrated ? `${done}/${ids.length}` : `–/${ids.length}`}
            </span>
          </Link>
          <Link href={routes.cards(lang)} className="site-nav__progress" onClick={() => setMore(false)} aria-current={route?.kind === 'cards' ? 'page' : undefined}>
            <span className="site-nav__progress-label">{lang === 'fr' ? 'Lexique' : 'Glossary'}</span>
          </Link>
          <Link href={routes.lab(lang)} className="site-nav__progress" onClick={() => setMore(false)} aria-current={route?.kind === 'lab' ? 'page' : undefined}>
            <span className="site-nav__progress-label">{lang === 'fr' ? 'Laboratoire' : 'Lab'}</span>
          </Link>
          <MusicPlayer lang={lang} />
          <SoundToggle lang={lang} />
          <button type="button" className="sound-toggle help-btn" aria-label={lang === 'fr' ? 'Revoir le tutoriel' : 'Replay the tutorial'} title={lang === 'fr' ? 'Revoir le tutoriel' : 'Replay the tutorial'} onClick={() => (setMore(false), openOnboarding())}>
            ?
          </button>
          <div className="lang-switch" role="group" aria-label={t.language}>
            {LANGS.map((l) => (
              <Link
                key={l}
                href={switchLangPath(pathname, l)}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? 'true' : undefined}
                className={`lang-switch__opt${l === lang ? ' is-current' : ''}`}
                onClick={(e) => {
                  if (l === lang) {
                    e.preventDefault();
                    return;
                  }
                  switchTo(l);
                  if (isPlainClick(e)) {
                    e.preventDefault();
                    router.push(switchLangPath(pathname, l) + (typeof window !== 'undefined' ? window.location.hash : ''), { scroll: false });
                  }
                }}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          </div>
        </nav>
      </div>
      <Onboarding lang={lang} auto={onHotel} />
    </header>
  );
}
