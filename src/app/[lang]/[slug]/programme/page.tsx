import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '../../../../components/Header';
import ChapterReader from '../../../../components/ChapterReader';
import ChapterRoom from '../../../../components/room/ChapterRoom';
import { GAMES } from '../../../../game/chapters';
import { getChapter, getChapterMetas } from '../../../../lib/content';
import { LANGS, dict, hrefFor, parseSlug, routes, type Lang } from '../../../../lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const lang of LANGS) {
    const pathOf = (href: string) => href.split('/').filter(Boolean)[1];
    for (const m of getChapterMetas(lang)) out.push({ lang, slug: pathOf(routes.chapter(lang, m.id)) });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = raw as Lang;
  const r = parseSlug(slug);
  if (!r || r.kind === 'hotel') return {};
  const languages = Object.fromEntries(LANGS.map((l) => [l, hrefFor(l, r) + 'programme/']));
  if (r.kind !== 'chapter') return {};
  const m = getChapterMetas(lang).find((c) => c.id === r.id);
  return {
    title: m ? `${dict[lang].chapter} ${m.id} · ${m.title} · Programme` : undefined,
    description: m?.question,
    alternates: { languages },
  };
}

export default async function ProgrammePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  const lang = raw as Lang;
  const r = parseSlug(slug);
  if (!r || r.kind === 'hotel') notFound();
  const metas = getChapterMetas(lang);
  const ids = metas.map((m) => m.id);

  if (r.kind !== 'chapter') notFound();

  const idx = ids.indexOf(r.id);
  if (idx < 0 || slug !== routes.chapter(lang, r.id).split('/')[2]) notFound();
  const game = null as unknown as typeof GAMES[string] | null;
  if (game) {
    const meta = metas[idx];
    return (
      <div className="page page--room">
        <Header lang={lang} ids={ids} tone="night" />
        <main id="main">
          <ChapterRoom lang={lang} game={game} title={meta.title} block={meta.block} ids={ids} />
        </main>
      </div>
    );
  }
  const c = await getChapter(lang, r.id);
  const prev = idx > 0 ? metas[idx - 1] : null;
  const next = idx < metas.length - 1 ? metas[idx + 1] : null;
  return (
    <div className="page page--paper">
      <Header lang={lang} ids={ids} tone="paper" />
      <main>
        <ChapterReader
          key={`${lang}-${c.id}`}
          lang={lang}
          total={metas.length}
          prev={prev && { id: prev.id, title: prev.title }}
          next={next && { id: next.id, title: next.title }}
          chapter={{
            id: c.id,
            title: c.title,
            block: c.block,
            lede: c.lede,
            questionHtml: c.questionHtml,
            outcomesTitle: c.outcomesTitle,
            outcomes: c.outcomes,
            needsTitle: c.needsTitle,
            needs: c.needs,
            minimum: c.minimum,
            footnote: c.footnote,
            stats: c.stats,
            html: c.html,
            toc: c.toc,
            minutes: Math.round(c.words / 200),
          }}
        />
      </main>
    </div>
  );
}
