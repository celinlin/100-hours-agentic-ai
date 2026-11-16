'use client';

import type { Lang } from '../../lib/i18n';

/** Placeholder — replaced by the glossary game. */
export default function CardsRoom({ lang }: { lang: Lang }) {
  return <p style={{ padding: 40 }}>{lang === 'fr' ? 'Le lexique arrive.' : 'The glossary is coming.'}</p>;
}
