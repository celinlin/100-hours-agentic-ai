'use client';

import { useState } from 'react';
import type { Video } from '../../game/types';

/**
 * Official YouTube embed (privacy-enhanced domain), loaded only on click: no autoplay
 * before the learner asks, no third-party request until then. Subtitles stay available
 * in the player; fullscreen is allowed. A plain link is always offered as a fallback.
 */
export default function LiteVideo({ v, lang }: { v: Video; lang: 'fr' | 'en' }) {
  const [on, setOn] = useState(false);
  const label = lang === 'fr' ? `Lire la vidéo : ${v.title}` : `Play video: ${v.title}`;
  return (
    <figure className="lv">
      <div className="lv__frame">
        {on ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&cc_load_policy=1&hl=${lang}`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" className="lv__poster" onClick={() => setOn(true)} aria-label={label}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="lv__play" aria-hidden="true" />
          </button>
        )}
      </div>
      <figcaption className="lv__cap">
        <span className="lv__title">{v.title}</span>
        <span className="lv__meta">
          {v.channel} · {v.lang.toUpperCase()} · {v.programme ? 'programme' : lang === 'fr' ? 'complément' : 'extra'}
        </span>
        <span className="lv__note">{v.note[lang]}</span>
        <a className="lv__ext" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
          {lang === 'fr' ? 'Ouvrir sur YouTube' : 'Open on YouTube'}
        </a>
      </figcaption>
    </figure>
  );
}
