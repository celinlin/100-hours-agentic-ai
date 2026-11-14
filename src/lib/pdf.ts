/** Downloadable programme PDFs (French originals), served from /public/pdf. */
const base = () => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/pdf`;

export const pdf = {
  chapter: (id: string) => `${base()}/100-Hours-of-Agentic-AI_Etape-${id}.pdf`,
  volumes: () => [
    { label: { fr: 'Volume 1 · étapes 01 à 09', en: 'Volume 1 · steps 01 to 09' }, href: `${base()}/100-Hours-of-Agentic-AI_Volume-1_Etapes-01-09.pdf`, size: '5,4 Mo' },
    { label: { fr: 'Volume 2 · étapes 10 à 14', en: 'Volume 2 · steps 10 to 14' }, href: `${base()}/100-Hours-of-Agentic-AI_Volume-2_Etapes-10-14.pdf`, size: '2,8 Mo' },
  ],
};
