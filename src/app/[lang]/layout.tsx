import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '../../styles/globals.css';
import '../../styles/hotel.css';
import '../../styles/mechanics.css';
import '../../styles/room.css';
import Veil from '../../components/Veil';
import { LANGS, isLang, dict } from '../../lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict[isLang(lang) ? lang : 'en'];
  return {
    title: { default: '100 Hours of Agentic AI', template: '%s · 100 Hours of Agentic AI' },
    description: `${t.tagline} ${t.intro}`,
    icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.svg` },
  };
}

export const viewport: Viewport = {
  themeColor: '#17232E',
  width: 'device-width',
  initialScale: 1,
};

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang}>
      <body>
        {children}
        <Veil />
      </body>
    </html>
  );
}
