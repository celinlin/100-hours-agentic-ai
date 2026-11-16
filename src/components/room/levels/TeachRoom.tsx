'use client';

import { useState } from 'react';
import type { Criterion, TeachMission, TeachOption } from '../../../game/types';
import { sfx } from '../../../game/sound';
import type { Lang } from '../../../lib/i18n';
import { shuffle } from '../../../game/mechanics/common';

const T = {
  fr: {
    title: 'À toi de former l’équipe',
    kinds: { simple: 'Question simple', confusion: 'Confusion', risky: 'Usage risqué' },
    explain: 'Ton explication',
    example: 'Ton exemple métier',
    limit: 'La limite à dire',
    answer: 'Répondre',
    crit: { accuracy: 'Justesse technique', simplicity: 'Simplicité', relevance: 'Pertinence métier', limits: 'Limites', example: 'Exemple concret' } as Record<Criterion, string>,
    score: (n: number) => `${n} / 10`,
    convinced: 'C’est clair, merci.',
    unsure: 'Je crois que je vois… mais pas tout à fait.',
    lost: 'Je ne suis pas sûr d’avoir compris.',
    passHint: 'Pour convaincre : les cinq critères au maximum.',
    allDone: 'L’équipe a compris. Tu as su expliquer, donner un exemple et poser les limites.',
    pick: 'Choisis à qui répondre',
    retry: 'Change une partie de ta réponse et réessaie.',
  },
  en: {
    title: 'Your turn to train the team',
    kinds: { simple: 'Simple question', confusion: 'Confusion', risky: 'Risky use' },
    explain: 'Your explanation',
    example: 'Your business example',
    limit: 'The limit to state',
    answer: 'Answer',
    crit: { accuracy: 'Technical accuracy', simplicity: 'Simplicity', relevance: 'Business relevance', limits: 'Limits', example: 'Concrete example' } as Record<Criterion, string>,
    score: (n: number) => `${n} / 10`,
    convinced: 'That’s clear, thanks.',
    unsure: 'I think I see… but not quite.',
    lost: 'I’m not sure I understood.',
    passHint: 'To convince: all five criteria at their maximum.',
    allDone: 'The team understood. You explained, gave an example and stated the limits.',
    pick: 'Choose who to answer',
    retry: 'Change one part of your answer and try again.',
  },
};

const CRITERIA: Criterion[] = ['accuracy', 'simplicity', 'relevance', 'limits', 'example'];

/** Score a composed answer: a criterion takes the lowest score among the parts that touch it. */
export function scoreAnswer(parts: TeachOption[]) {
  const out = {} as Record<Criterion, number>;
  for (const c of CRITERIA) {
    const vals = parts.map((p) => p.scores[c]).filter((v): v is 0 | 1 | 2 => v !== undefined);
    out[c] = vals.length ? Math.min(...vals) : 0;
  }
  const total = CRITERIA.reduce((a, c) => a + out[c], 0);
  return { per: out, total, pass: total === 10 };
}

const TONES = ['#7c2f2a', '#2f5552', '#9a7b2f'];

function Colleague({ i, mood, active }: { i: number; mood: 'idle' | 'happy' | 'unsure' | 'lost'; active: boolean }) {
  const c = TONES[i % 3];
  return (
    <svg viewBox="0 0 120 140" className={`tc__avatar${active ? ' is-active' : ''}`} aria-hidden="true">
      <path d="M14 140 L22 82 Q60 62 98 82 L106 140 Z" fill={c} />
      <circle cx="60" cy="50" r="26" fill={['#c99b78', '#a8785a', '#e0b896'][i % 3]} />
      <path d={['M34 44 Q36 18 60 20 Q86 20 86 46 Q74 30 60 32 Q44 32 34 44 Z', 'M34 50 Q30 22 60 22 Q90 22 86 50 L86 40 Q60 26 34 40 Z', 'M36 40 Q50 16 72 22 Q88 28 86 46 Q70 28 36 40 Z'][i % 3]} fill="#2d2721" />
      <circle cx="51" cy="52" r="2.6" fill="#2d2721" />
      <circle cx="69" cy="52" r="2.6" fill="#2d2721" />
      <path
        d={mood === 'happy' ? 'M51 63 Q60 71 69 63' : mood === 'unsure' ? 'M51 66 Q60 62 69 66' : mood === 'lost' ? 'M52 67 Q60 60 68 67' : 'M52 65 L68 65'}
        fill="none"
        stroke="#2d2721"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {mood === 'lost' && (
        <text x="92" y="30" fontSize="24" fontFamily="var(--serif)" fill="#e3c27a">
          ?
        </text>
      )}
    </svg>
  );
}

export default function TeachRoom({ lang, teach, done, onDone }: { lang: Lang; teach: TeachMission; done: boolean; onDone: () => void }) {
  const t = T[lang];
  const [who, setWho] = useState(0);
  const [picks, setPicks] = useState<Record<string, { explain?: string; example?: string; limit?: string }>>({});
  const [verdicts, setVerdicts] = useState<Record<string, ReturnType<typeof scoreAnswer> & { parts: TeachOption[] }>>({});
  const [passedIds, setPassedIds] = useState<string[]>(done ? teach.colleagues.map((c) => c.id) : []);
  const col = teach.colleagues[who];
  const pick = picks[col.id] ?? {};
  const verdict = verdicts[col.id];

  const choose = (part: 'explain' | 'example' | 'limit', id: string) => {
    sfx('tick');
    setPicks({ ...picks, [col.id]: { ...pick, [part]: id } });
    const v = { ...verdicts };
    delete v[col.id];
    setVerdicts(v);
  };

  const answer = () => {
    const parts = [col.explain.find((o) => o.id === pick.explain)!, col.example.find((o) => o.id === pick.example)!, col.limit.find((o) => o.id === pick.limit)!];
    const s = scoreAnswer(parts);
    setVerdicts({ ...verdicts, [col.id]: { ...s, parts } });
    if (s.pass) {
      sfx('correct');
      const next = passedIds.includes(col.id) ? passedIds : [...passedIds, col.id];
      setPassedIds(next);
      if (next.length === teach.colleagues.length && !done) {
        sfx('solve');
        onDone();
      }
    } else sfx('wrong');
  };

  const moodOf = (id: string): 'idle' | 'happy' | 'unsure' | 'lost' => {
    const v = verdicts[id];
    if (passedIds.includes(id) && (!v || v.pass)) return 'happy';
    if (!v) return 'idle';
    return v.pass ? 'happy' : v.total >= 5 ? 'unsure' : 'lost';
  };

  const part = (key: 'explain' | 'example' | 'limit', label: string) => (
    <fieldset className="tc__part">
      <legend>{label}</legend>
      {shuffle(col[key], `${col.id}:${key}`).map((o) => (
        <label key={o.id} className={`tc__opt${pick[key] === o.id ? ' is-on' : ''}`}>
          <input type="radio" name={`${col.id}-${key}`} checked={pick[key] === o.id} onChange={() => choose(key, o.id)} />
          <span>{o.text[lang]}</span>
        </label>
      ))}
    </fieldset>
  );

  return (
    <div className="teach">
      <header className="teach__head">
        <p className="mission__stamp">{teach.setting[lang]}</p>
        <h2 className="mission__client">{t.title}</h2>
      </header>

      <div className="tc__room" role="tablist" aria-label={t.pick}>
        <svg className="tc__table" viewBox="0 0 600 60" aria-hidden="true" preserveAspectRatio="none">
          <path d="M20 10 H580 L560 50 H40 Z" fill="#5e3f2a" />
          <rect x="20" y="6" width="560" height="6" fill="#c9b67a" />
        </svg>
        {teach.colleagues.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={who === i}
            className={`tc__seat${who === i ? ' is-on' : ''}${passedIds.includes(c.id) ? ' is-passed' : ''}`}
            onClick={() => (sfx('tick'), setWho(i))}
          >
            <Colleague i={i} mood={moodOf(c.id)} active={who === i} />
            <span className="tc__name">{c.name}</span>
            <span className="tc__role">{c.role[lang]}</span>
            <span className={`tc__kind tc__kind--${c.kind}`}>{t.kinds[c.kind]}</span>
          </button>
        ))}
      </div>

      <div className="tc__q" key={col.id}>
        <p className="tc__level">{col.level[lang]}</p>
        <p className="tc__says">« {col.says[lang]} »</p>
      </div>

      <div className="tc__composer">
        {part('explain', t.explain)}
        {part('example', t.example)}
        {part('limit', t.limit)}
      </div>
      <div className="tc__actions">
        <button type="button" className="hx-cta" onClick={answer} disabled={!pick.explain || !pick.example || !pick.limit}>
          {t.answer}
        </button>
        <span className="tc__passhint">{t.passHint}</span>
      </div>

      {verdict && (
        <div className={`tc__verdict${verdict.pass ? ' is-pass' : ''}`} aria-live="polite">
          <p className="tc__reaction">
            <b>{col.name} :</b> « {verdict.pass ? t.convinced : verdict.total >= 5 ? t.unsure : t.lost} »
          </p>
          <ul className="tc__gauges">
            {CRITERIA.map((c) => (
              <li key={c}>
                <span>{t.crit[c]}</span>
                <span className="tc__gauge" aria-label={`${verdict.per[c]} / 2`}>
                  <i className={verdict.per[c] >= 1 ? 'on' : ''} />
                  <i className={verdict.per[c] >= 2 ? 'on' : ''} />
                </span>
              </li>
            ))}
          </ul>
          <p className="tc__total">{t.score(verdict.total)}</p>
          <ul className="tc__notes">
            {verdict.parts.map((p) => (
              <li key={p.id}>{p.note[lang]}</li>
            ))}
          </ul>
          {!verdict.pass && <p className="tc__retry">{t.retry}</p>}
        </div>
      )}
      {passedIds.length === teach.colleagues.length && <p className="tc__all">{t.allDone}</p>}
    </div>
  );
}
