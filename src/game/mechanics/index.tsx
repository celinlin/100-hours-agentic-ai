'use client';

import type { Mechanic } from '../types';
import Order from './Order';
import Sort from './Sort';
import Match from './Match';
import Choice from './Choice';
import Spot from './Spot';
import Fill from './Fill';
import Sampler from './Sampler';
import Loop from './Loop';
import Desk from './Desk';
import Stepper from './Stepper';
import { SIGNATURE } from '../signature';
import type { SignatureKey } from '../signature/list';

export type { Lang } from './strings';

/**
 * Renders one mechanic. State resets when the mechanic changes (keyed by kind + prompt);
 * pass your own `key` if two consecutive mechanics could share a prompt.
 */
export default function MechanicView(props: { m: Mechanic; lang: 'fr' | 'en'; onSolved: () => void; onMistake?: () => void; compact?: boolean }) {
  const { m, ...rest } = props;
  const key = `${m.kind}:${m.prompt.en}`;
  switch (m.kind) {
    case 'order':
      return <Order key={key} m={m} {...rest} />;
    case 'sort':
      return <Sort key={key} m={m} {...rest} />;
    case 'match':
      return <Match key={key} m={m} {...rest} />;
    case 'choice':
      return <Choice key={key} m={m} {...rest} />;
    case 'spot':
      return <Spot key={key} m={m} {...rest} />;
    case 'fill':
      return <Fill key={key} m={m} {...rest} />;
    case 'sampler':
      return <Sampler key={key} m={m} {...rest} />;
    case 'loop':
      return <Loop key={key} m={m} {...rest} />;
    case 'desk':
      return <Desk key={key} m={m} {...rest} />;
    case 'stepper':
      return <Stepper key={key} m={m} {...rest} />;
    case 'custom': {
      const Game = SIGNATURE[m.game as SignatureKey];
      if (!Game) return null;
      return (
        <div className="mg mg-custom" key={key}>
          <p className="mg-prompt">{m.prompt[rest.lang]}</p>
          <Game lang={rest.lang} onSolved={rest.onSolved} onMistake={rest.onMistake} />
        </div>
      );
    }
    default: {
      const never: never = m;
      return never;
    }
  }
}
