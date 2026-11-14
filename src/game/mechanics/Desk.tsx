'use client';

import { useState } from 'react';
import type { DeskMechanic } from '../types';
import { sfx } from '../sound';
import { Frame, useSolve, useStatus, cx, shuffle, type MechProps } from './common';

const T = {
  fr: {
    desk: 'Le bureau',
    tray: 'Le classeur',
    room: (n: number, t: number) => `${n} / ${t} places occupées`,
    full: 'Le bureau est plein : retire un document pour en poser un autre.',
    ask: 'Faire entrer le client',
    questions: 'Le client va demander',
    answered: 'Réponse',
    missing: 'Il manque',
    put: 'Poser sur le bureau',
    remove: 'Ranger',
    allOk: 'Les trois réponses tiennent : tout ce qu’il fallait était sur le bureau.',
    some: (n: number, t: number) => `${n} réponse(s) sur ${t}. Regarde ce qui manquait, change les documents, puis refais entrer le client.`,
  },
  en: {
    desk: 'The desk',
    tray: 'The filing cabinet',
    room: (n: number, t: number) => `${n} / ${t} spaces used`,
    full: 'The desk is full: put a document away to place another one.',
    ask: 'Let the guest in',
    questions: 'The guest will ask',
    answered: 'Answer',
    missing: 'Missing',
    put: 'Place on the desk',
    remove: 'Put away',
    allOk: 'All three answers hold: everything needed was on the desk.',
    some: (n: number, t: number) => `${n} answer(s) out of ${t}. See what was missing, change the documents, then let the guest in again.`,
  },
};

/**
 * Context window as a desk with limited room. The answers are computed from what is on
 * the desk: a question is answered only if every document it needs is there.
 */
export default function Desk({ m, lang, onSolved, onMistake, compact }: MechProps<DeskMechanic>) {
  const t = T[lang];
  const [onDesk, setOnDesk] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[] | null>(null);
  const [status, setStatus] = useStatus();
  const { solved, solve } = useSolve(onSolved);
  const order = shuffle(m.docs, `desk:${m.prompt.en}`);
  const label = (id: string) => m.docs.find((d) => d.id === id)!.label[lang];

  const toggle = (id: string) => {
    if (solved) return;
    setResults(null);
    if (onDesk.includes(id)) {
      setOnDesk(onDesk.filter((x) => x !== id));
      sfx('tick');
      return;
    }
    if (onDesk.length >= m.slots) {
      setStatus('info', t.full);
      sfx('wrong');
      return;
    }
    setOnDesk([...onDesk, id]);
    sfx('place');
    setStatus(null);
  };

  const ask = () => {
    const r = m.questions.map((q) => q.needs.every((n) => onDesk.includes(n)));
    setResults(r);
    const ok = r.filter(Boolean).length;
    if (ok === r.length) {
      setStatus('ok', t.allOk);
      solve();
    } else {
      setStatus('err', t.some(ok, r.length));
      sfx('wrong');
      onMistake?.();
    }
  };

  return (
    <Frame kind="desk" prompt={m.prompt[lang]} lang={lang} compact={compact} solved={solved} status={status}
      footer={!solved && (
        <button type="button" className="mg-btn mg-btn--primary" onClick={ask} disabled={onDesk.length === 0}>
          {t.ask}
        </button>
      )}
    >
      <div className="dk">
        <div className="dk__desk" aria-label={t.desk}>
          <div className="dk__desk-top">
            <span className="dk__lamp" aria-hidden="true" />
            <p className="dk__title">
              {t.desk} <span>{t.room(onDesk.length, m.slots)}</span>
            </p>
            <ul className="dk__slots">
              {Array.from({ length: m.slots }, (_, i) => {
                const id = onDesk[i];
                return (
                  <li key={i} className={cx('dk__slot', id && 'is-filled')}>
                    {id ? (
                      <button type="button" className="dk__doc dk__doc--on" onClick={() => toggle(id)} aria-label={`${t.remove} : ${label(id)}`}>
                        <span className="dk__doc-fold" aria-hidden="true" />
                        {label(id)}
                      </button>
                    ) : (
                      <span className="dk__empty" aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="dk__legs" aria-hidden="true" />
        </div>
        <div className="dk__tray" aria-label={t.tray}>
          <p className="dk__title">{t.tray}</p>
          <ul>
            {order.map((d) => {
              const on = onDesk.includes(d.id);
              return (
                <li key={d.id}>
                  <button type="button" className={cx('dk__doc', on && 'is-used')} onClick={() => toggle(d.id)} aria-pressed={on} aria-label={`${on ? t.remove : t.put} : ${d.label[lang]}`}>
                    <span className="dk__doc-fold" aria-hidden="true" />
                    <span className="dk__doc-label">{d.label[lang]}</span>
                    {d.detail && <span className="dk__doc-detail">{d.detail[lang]}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="dk__questions">
          <p className="dk__title">{t.questions}</p>
          <ol>
            {m.questions.map((q, i) => {
              const r = results?.[i];
              const lacking = q.needs.filter((n) => !onDesk.includes(n));
              return (
                <li key={i} className={cx('dk__q', r === true && 'is-ok', r === false && 'is-err')}>
                  <span className="dk__q-text">« {q.q[lang]} »</span>
                  {r === true && (
                    <span className="dk__a">
                      <b>{t.answered} :</b> {q.answer[lang]}
                    </span>
                  )}
                  {r === false && (
                    <span className="dk__a dk__a--err">
                      {q.missing[lang]} <i>{t.missing} : {lacking.map(label).join(', ')}</i>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Frame>
  );
}
