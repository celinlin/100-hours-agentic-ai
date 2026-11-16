'use client';

import { useMemo, useState } from 'react';
import type { BusinessMission, PermissionLevel } from '../../../game/types';
import MechanicView from '../../../game/mechanics';
import { sfx } from '../../../game/sound';
import type { Lang } from '../../../lib/i18n';
import { shuffle } from '../../../game/mechanics/common';

const T = {
  fr: {
    sim: 'Simulation pédagogique',
    brief: 'Brief client',
    stages: ['Le problème', 'Les contraintes', 'Les tâches', 'Les outils', 'Les autorisations', 'Le test'],
    reveal: 'Découvrir',
    readAll: 'Toutes les contraintes sont lues.',
    next: 'Continuer',
    toolsHint: 'Sélectionne les outils dont la solution a besoin. Rien de plus : chaque outil élargit ce que la solution peut faire, et donc ce qui peut mal tourner.',
    permHint: 'Pour chaque outil retenu, choisis ce que la solution a le droit de faire.',
    noPerm: 'Aucun outil retenu n’a besoin d’une autorisation particulière.',
    perm: { read: 'Lire', draft: 'Préparer un brouillon', approve: 'Agir après validation humaine', auto: 'Agir seule', deny: 'Interdit' } as Record<PermissionLevel, string>,
    run: 'Lancer les tests',
    rerun: 'Relancer les tests',
    results: (ok: number, n: number) => `${ok} / ${n} demandes traitées correctement`,
    critical: 'Échec critique',
    forbidden: (l: string) => `Outil retenu sans raison et risqué : ${l}.`,
    pass: 'Le workflow tient. Voici ses limites, à présenter au client :',
    fail: 'Le workflow ne tient pas encore. Corrige les outils ou les autorisations, puis relance.',
    real: 'Cas réel documenté',
    source: 'Source',
    done: 'Mission accomplie',
    back: 'Revenir à l’étape',
    selected: 'retenu',
    flow: 'Ton workflow',
    msg: 'Demande',
    sol: 'La solution lit, choisit, rédige',
    autoSend: 'Envoi automatique',
    draftSend: 'Brouillon pour l’équipe',
    approveSend: 'Envoi après validation',
    team: 'Transmis à l’équipe',
    teamWhy: 'tout ce qui n’est pas autorisé',
    uses: 'Outils',
  },
  en: {
    sim: 'Teaching simulation',
    brief: 'Client brief',
    stages: ['The problem', 'The constraints', 'The tasks', 'The tools', 'The permissions', 'The test'],
    reveal: 'Reveal',
    readAll: 'All constraints read.',
    next: 'Continue',
    toolsHint: 'Select the tools the solution needs. Nothing more: each tool widens what the solution can do, and so what can go wrong.',
    permHint: 'For each selected tool, choose what the solution is allowed to do.',
    noPerm: 'No selected tool needs a specific permission.',
    perm: { read: 'Read', draft: 'Prepare a draft', approve: 'Act after human approval', auto: 'Act on its own', deny: 'Forbidden' } as Record<PermissionLevel, string>,
    run: 'Run the tests',
    rerun: 'Run the tests again',
    results: (ok: number, n: number) => `${ok} / ${n} requests handled correctly`,
    critical: 'Critical failure',
    forbidden: (l: string) => `Tool selected for no reason, and risky: ${l}.`,
    pass: 'The workflow holds. Here are its limits, to present to the client:',
    fail: 'The workflow does not hold yet. Fix the tools or permissions, then run again.',
    real: 'Documented real case',
    source: 'Source',
    done: 'Mission accomplished',
    back: 'Back to step',
    selected: 'selected',
    flow: 'Your workflow',
    msg: 'Request',
    sol: 'The solution reads, chooses, drafts',
    autoSend: 'Sent automatically',
    draftSend: 'Draft for the team',
    approveSend: 'Sent after approval',
    team: 'Passed to the team',
    teamWhy: 'everything that is not allowed',
    uses: 'Tools',
  },
};

export default function MissionBoard({ lang, mission, done, onDone }: { lang: Lang; mission: BusinessMission; done: boolean; onDone: () => void }) {
  const t = T[lang];
  const [stage, setStage] = useState(done ? 5 : 0);
  const [reached, setReached] = useState(done ? 5 : 0);
  const [revealed, setRevealed] = useState<number[]>(done ? mission.constraints.map((_, i) => i) : []);
  const [solvedProblem, setSolvedProblem] = useState(done);
  const [solvedTasks, setSolvedTasks] = useState(done);
  const [tools, setTools] = useState<string[]>(done ? mission.tools.filter((x) => x.role === 'needed').map((x) => x.id) : []);
  const [perms, setPerms] = useState<Record<string, PermissionLevel>>(
    done ? Object.fromEntries(mission.permissions.map((p) => [p.tool, p.allowed[0]])) : {},
  );
  const [ran, setRan] = useState(done);

  const go = (n: number) => {
    setStage(n);
    setReached((r) => Math.max(r, n));
    sfx('latch');
  };

  const label = (id: string) => mission.tools.find((x) => x.id === id)?.label[lang] ?? id;
  const permsShown = mission.permissions.filter((p) => tools.includes(p.tool));

  const results = useMemo(() => {
    return mission.tests.map((test) => {
      const missingTools = test.needsTools.filter((x) => !tools.includes(x));
      // a tool that is not selected counts as "denied"; a selected tool without a permission setting acts on its own
      const level: PermissionLevel | null = test.permission ? (tools.includes(test.permission.tool) ? perms[test.permission.tool] ?? 'auto' : 'deny') : null;
      const permOk = !test.permission || test.permission.allowed.includes(level!);
      return { test, ok: missingTools.length === 0 && permOk, missingTools };
    });
  }, [mission.tests, tools, perms]);
  const forbidden = tools.filter((id) => mission.tools.find((x) => x.id === id)?.role === 'forbidden');
  const okCount = results.filter((r) => r.ok).length;
  const criticalFail = results.some((r) => !r.ok && r.test.critical);
  const passed = ran && !criticalFail && forbidden.length === 0 && okCount >= mission.tests.length - 1;

  const run = () => {
    setRan(true);
    const willPass = !results.some((r) => !r.ok && r.test.critical) && forbidden.length === 0 && okCount >= mission.tests.length - 1;
    if (willPass) {
      sfx('solve');
      if (!done) onDone();
    } else sfx('wrong');
  };

  return (
    <div className="mission">
      <header className="mission__head">
        <p className="mission__stamp">{t.sim}</p>
        <p className="mission__sector">{mission.sector[lang]}</p>
        <h2 className="mission__client">{mission.client[lang]}</h2>
        <blockquote className="mission__brief">
          <span>{t.brief}</span>« {mission.brief[lang]} »
        </blockquote>
      </header>

      <ol className="mission__tabs">
        {t.stages.map((s, i) => (
          <li key={s}>
            <button type="button" className={`mission__tab${stage === i ? ' is-on' : ''}${i < reached || (i === 5 && passed) ? ' is-done' : ''}`} disabled={i > reached} onClick={() => setStage(i)}>
              <span>{i + 1}</span> {s}
            </button>
          </li>
        ))}
      </ol>

      <section className="mission__stage" key={stage}>
        {stage === 0 && (
          <>
            <MechanicView m={mission.problem} lang={lang} onSolved={() => setSolvedProblem(true)} />
            {solvedProblem && (
              <button type="button" className="hx-cta mission__next" onClick={() => go(1)}>
                {t.next}
              </button>
            )}
          </>
        )}

        {stage === 1 && (
          <>
            <ul className="mission__constraints">
              {mission.constraints.map((c, i) => (
                <li key={i} className={revealed.includes(i) ? 'is-open' : ''}>
                  {revealed.includes(i) ? (
                    <>
                      <b>{c.label[lang]}</b>
                      <span>{c.detail[lang]}</span>
                    </>
                  ) : (
                    <button type="button" onClick={() => (sfx('tick'), setRevealed([...revealed, i]))}>
                      <b>{c.label[lang]}</b>
                      <span className="mission__reveal">{t.reveal}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {revealed.length === mission.constraints.length && (
              <button type="button" className="hx-cta mission__next" onClick={() => go(2)}>
                {t.next}
              </button>
            )}
          </>
        )}

        {stage === 2 && (
          <>
            <MechanicView m={mission.tasks} lang={lang} onSolved={() => setSolvedTasks(true)} />
            {solvedTasks && (
              <button type="button" className="hx-cta mission__next" onClick={() => go(3)}>
                {t.next}
              </button>
            )}
          </>
        )}

        {stage === 3 && (
          <>
            <p className="mission__hint">{t.toolsHint}</p>
            <ul className="mission__tools">
              {shuffle(mission.tools, `tools:${mission.client.en}`).map((x) => {
                const on = tools.includes(x.id);
                return (
                  <li key={x.id}>
                    <button
                      type="button"
                      className={`mission__tool${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => {
                        sfx(on ? 'tick' : 'place');
                        setRan(false);
                        setTools(on ? tools.filter((y) => y !== x.id) : [...tools, x.id]);
                      }}
                    >
                      <span className="mission__tool-name">{x.label[lang]}</span>
                      <span className="mission__tool-desc">{x.desc[lang]}</span>
                      {on && <span className="mission__tool-on">{t.selected}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="hx-cta mission__next" onClick={() => go(4)} disabled={tools.length === 0}>
              {t.next}
            </button>
          </>
        )}

        {stage === 4 && (
          <>
            <p className="mission__hint">{permsShown.length ? t.permHint : t.noPerm}</p>
            <ul className="mission__perms">
              {permsShown.map((p) => (
                <li key={p.tool}>
                  <span className="mission__perm-tool">{label(p.tool)}</span>
                  <div className="mission__seg" role="radiogroup" aria-label={label(p.tool)}>
                    {p.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        role="radio"
                        aria-checked={perms[p.tool] === o}
                        className={perms[p.tool] === o ? 'is-on' : ''}
                        onClick={() => {
                          sfx('tick');
                          setRan(false);
                          setPerms({ ...perms, [p.tool]: o });
                        }}
                      >
                        {t.perm[o]}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="hx-cta mission__next" onClick={() => go(5)} disabled={permsShown.some((p) => !perms[p.tool])}>
              {t.next}
            </button>
          </>
        )}

        {stage === 5 && (
          <>
            <button type="button" className="hx-cta" onClick={run}>
              {ran ? t.rerun : t.run}
            </button>
            {ran && (
              <div className="mission__results" aria-live="polite">
                <figure className="mflow" aria-label={t.flow}>
                  <figcaption>{t.flow}</figcaption>
                  <div className="mflow__row">
                    <span className="mflow__node">{t.msg}</span>
                    <span className="mflow__arrow" aria-hidden="true" />
                    <span className="mflow__node mflow__node--core">{t.sol}</span>
                    <span className="mflow__arrow" aria-hidden="true" />
                    <span className="mflow__out">
                      {(['auto', 'read', 'draft', 'approve'] as PermissionLevel[]).map((lvl) => {
                        const list = tools.filter((id) => (perms[id] ?? (mission.permissions.some((p) => p.tool === id) ? null : 'auto')) === lvl);
                        return list.length ? (
                          <span key={lvl} className={`mflow__node mflow__node--${lvl}`}>
                            {t.perm[lvl]}
                            <small>{list.map(label).join(' · ')}</small>
                          </span>
                        ) : null;
                      })}
                      <span className="mflow__node mflow__node--team">
                        {t.team}
                        <small>{t.teamWhy}</small>
                      </span>
                    </span>
                  </div>
                </figure>
                <p className="mission__score">{t.results(okCount, mission.tests.length)}</p>
                <ol>
                  {results.map((r, i) => (
                    <li key={r.test.id} className={r.ok ? 'is-ok' : 'is-ko'} style={{ animationDelay: `${i * 120}ms` }}>
                      <span className="mission__req">« {r.test.request[lang]} »</span>
                      <span className="mission__out">
                        {!r.ok && r.test.critical && <b className="mission__crit">{t.critical} · </b>}
                        {r.ok ? r.test.ok[lang] : r.test.ko[lang]}
                      </span>
                    </li>
                  ))}
                </ol>
                {forbidden.length > 0 && <p className="mission__warn">{t.forbidden(forbidden.map(label).join(', '))}</p>}
                {!passed && (
                  <div className="mission__why">
                    <p>{t.fail}</p>
                    <ul>
                      {mission.tools
                        .filter((x) => (x.role === 'needed' && !tools.includes(x.id)) || (x.role === 'forbidden' && tools.includes(x.id)))
                        .map((x) => (
                          <li key={x.id}>
                            <b>{x.label[lang]}</b> — {x.why[lang]}
                          </li>
                        ))}
                      {mission.permissions
                        .filter((p) => tools.includes(p.tool) && perms[p.tool] && !p.allowed.includes(perms[p.tool]))
                        .map((p) => (
                          <li key={p.tool}>
                            <b>{label(p.tool)}</b> — {p.why[lang]}
                          </li>
                        ))}
                    </ul>
                    <div className="mission__backs">
                      <button type="button" className="room-btn room-btn--paper" onClick={() => setStage(3)}>
                        {t.back} 4
                      </button>
                      <button type="button" className="room-btn room-btn--paper" onClick={() => setStage(4)}>
                        {t.back} 5
                      </button>
                    </div>
                  </div>
                )}
                {passed && (
                  <div className="mission__limits">
                    <p className="mission__done">{t.done}</p>
                    <p>{t.pass}</p>
                    <ul>
                      {mission.limits.map((l, i) => (
                        <li key={i}>{l[lang]}</li>
                      ))}
                    </ul>
                    {mission.realCase && (
                      <aside className="mission__real">
                        <p className="mission__real-k">
                          {t.real} · {mission.realCase.company}
                        </p>
                        <ul>
                          {mission.realCase.facts.map((f, i) => (
                            <li key={i}>{f[lang]}</li>
                          ))}
                        </ul>
                        <p className="mission__caveat">{mission.realCase.caveat[lang]}</p>
                        <a href={mission.realCase.source.url} target="_blank" rel="noopener noreferrer">
                          {t.source} : {mission.realCase.source.title} — {mission.realCase.source.publisher} ↗
                        </a>
                      </aside>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
