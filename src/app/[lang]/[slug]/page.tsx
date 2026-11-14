import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import ChapterReader from '../../../components/ChapterReader';
import ChapterRoom from '../../../components/room/ChapterRoom';
import { GAMES } from '../../../game/chapters';
import HALL from '../../../game/chapters/hall';
import ProgressView from '../../../components/ProgressView';
import { getChapter, getChapterMetas } from '../../../lib/content';
import { LANGS, dict, hrefFor, parseSlug, routes, type Lang } from '../../../lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const lang of LANGS) {
    const pathOf = (href: string) => href.split('/').filter(Boolean)[1];
    out.push({ lang, slug: pathOf(routes.progress(lang)) });
    out.push({ lang, slug: pathOf(routes.hall(lang)) });
    for (const m of getChapterMetas(lang)) out.push({ lang, slug: pathOf(routes.chapter(lang, m.id)) });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = raw as Lang;
  const r = parseSlug(slug);
  if (!r || r.kind === 'hotel') return {};
  const languages = Object.fromEntries(LANGS.map((l) => [l, hrefFor(l, r)]));
  if (r.kind === 'progress') return { title: dict[lang].progressTitle, alternates: { languages } };
  if (r.kind === 'hall') return { title: HALL.room.name[lang], alternates: { languages } };
  const m = getChapterMetas(lang).find((c) => c.id === r.id);
  return {
    title: m ? `${dict[lang].chapter} ${m.id} · ${m.title}` : undefined,
    description: m?.question,
    alternates: { languages },
  };
}

export default async function SlugPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  const lang = raw as Lang;
  const r = parseSlug(slug);
  if (!r || r.kind === 'hotel') notFound();
  const metas = getChapterMetas(lang);
  const ids = metas.map((m) => m.id);

  if (r.kind === 'progress') {
    if (slug !== routes.progress(lang).split('/')[2]) notFound();
    return (
      <div className="page page--register">
        <Header lang={lang} ids={ids} tone="night" />
        <main>
          <ProgressView
            lang={lang}
            chapters={metas.map((m) => ({
              id: m.id,
              title: m.title,
              blockNumber: m.blockNumber,
              blockName: m.blockName,
              stations: GAMES[m.id]?.stations.length ?? 0,
              reward: GAMES[m.id]?.challenge.reward.name ?? null,
            }))}
          />
        </main>
      </div>
    );
  }

  if (r.kind === 'hall') {
    if (slug !== routes.hall(lang).split('/')[2]) notFound();
    return (
      <div className="page page--room">
        <Header lang={lang} ids={ids} tone="night" />
        <main id="main">
          <ChapterRoom lang={lang} game={HALL} title={HALL.room.name[lang]} block="" ids={['00']} annex />
        </main>
      </div>
    );
  }

  const idx = ids.indexOf(r.id);
  if (idx < 0 || slug !== routes.chapter(lang, r.id).split('/')[2]) notFound();
  const game = GAMES[r.id];
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
