'use client';

import type { Toolkit } from '../../../game/types';
import type { Lang } from '../../../lib/i18n';

const T = {
  fr: {
    title: 'Kit de transmission',
    lede: 'Tout ce qu’il faut pour expliquer ce chapitre à une équipe, en 20 minutes.',
    simple: 'L’explication simple',
    analogy: 'L’analogie visuelle',
    useCase: 'Le cas d’usage professionnel',
    demo: 'La démonstration courte',
    exercise: 'L’exercice à proposer',
    questions: 'Trois questions pour vérifier',
    mistakes: 'Les erreurs fréquentes',
    vigilance: 'Points de vigilance',
  },
  en: {
    title: 'Teaching kit',
    lede: 'Everything you need to explain this chapter to a team, in 20 minutes.',
    simple: 'The simple explanation',
    analogy: 'The visual analogy',
    useCase: 'The business use case',
    demo: 'The short demo',
    exercise: 'The exercise to run',
    questions: 'Three questions to check understanding',
    mistakes: 'Common mistakes',
    vigilance: 'Points to watch',
  },
};

export default function ToolkitView({ lang, kit, chapter }: { lang: Lang; kit: Toolkit; chapter: string }) {
  const t = T[lang];
  return (
    <div className="kit">
      <p className="station__kicker">{chapter}</p>
      <h2 className="station__title">{t.title}</h2>
      <p className="station__show">{t.lede}</p>
      <dl className="kit__list">
        <div>
          <dt>{t.simple}</dt>
          <dd>{kit.simple[lang]}</dd>
        </div>
        <div>
          <dt>{t.analogy}</dt>
          <dd>{kit.analogy[lang]}</dd>
        </div>
        <div>
          <dt>{t.useCase}</dt>
          <dd>{kit.useCase[lang]}</dd>
        </div>
        <div>
          <dt>{t.demo}</dt>
          <dd>{kit.demo[lang]}</dd>
        </div>
        <div>
          <dt>{t.exercise}</dt>
          <dd>{kit.exercise[lang]}</dd>
        </div>
        <div>
          <dt>{t.questions}</dt>
          <dd>
            <ol>
              {kit.questions.map((q, i) => (
                <li key={i}>{q[lang]}</li>
              ))}
            </ol>
          </dd>
        </div>
        <div>
          <dt>{t.mistakes}</dt>
          <dd>
            <ul>
              {kit.mistakes.map((q, i) => (
                <li key={i}>{q[lang]}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>{t.vigilance}</dt>
          <dd>
            <ul>
              {kit.vigilance.map((q, i) => (
                <li key={i}>{q[lang]}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  );
}
