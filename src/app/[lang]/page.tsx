import type { Metadata } from 'next';
import Header from '../../components/Header';
import HotelView from '../../components/HotelView';
import { getChapterMetas } from '../../lib/content';
import { isLang, routes, type Lang } from '../../lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l = (isLang(lang) ? lang : 'en') as Lang;
  return {
    title: { absolute: '100 Hours of Agentic AI' },
    alternates: { languages: { fr: routes.hotel('fr'), en: routes.hotel('en') } },
    other: { 'content-language': l },
  };
}

export default async function HotelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = raw as Lang;
  const metas = getChapterMetas(lang);
  const chapters = metas.map((m) => ({ id: m.id, title: m.title, blockNumber: m.blockNumber, blockName: m.blockName, question: m.question }));
  return (
    <div className="page page--hotel">
      <Header lang={lang} ids={metas.map((m) => m.id)} tone="night" />
      <main>
        <HotelView lang={lang} chapters={chapters} />
      </main>
    </div>
  );
}
