export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

/** URL helpers — every page has an equivalent in the other language. */
export const routes = {
  hotel: (lang: Lang) => `/${lang}/`,
  chapter: (lang: Lang, id: string) => `/${lang}/${lang === 'fr' ? 'etape' : 'step'}-${id}/`,
  progress: (lang: Lang) => `/${lang}/${lang === 'fr' ? 'progression' : 'progress'}/`,
  hall: (lang: Lang) => `/${lang}/${lang === 'fr' ? 'hall' : 'lobby'}/`,
};

export type Route =
  | { kind: 'hotel' }
  | { kind: 'progress' }
  | { kind: 'hall' }
  | { kind: 'chapter'; id: string };

/** Parse a `[slug]` segment, in either language. */
export function parseSlug(slug: string): Route | null {
  if (slug === 'progression' || slug === 'progress') return { kind: 'progress' };
  if (slug === 'hall' || slug === 'lobby') return { kind: 'hall' };
  const m = /^(?:etape|step)-(\d{2})$/.exec(slug);
  if (m) return { kind: 'chapter', id: m[1] };
  return null;
}

export function hrefFor(lang: Lang, r: Route): string {
  if (r.kind === 'hotel') return routes.hotel(lang);
  if (r.kind === 'progress') return routes.progress(lang);
  if (r.kind === 'hall') return routes.hall(lang);
  return routes.chapter(lang, r.id);
}

/** Map any pathname to the same page in another language. */
export function switchLangPath(pathname: string, to: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return routes.hotel(to);
  const r = parseSlug(parts[1]);
  return r ? hrefFor(to, r) : routes.hotel(to);
}

const fr = {
  brand: '100 Hours of Agentic AI',
  brandShort: '100 Hours',
  tagline: 'Un voyage interactif dans le monde des agents IA.',
  intro: 'Explore l’hôtel. Ouvre une étape. Apprends à ton rythme.',
  explore: 'Explorer l’hôtel',
  continue: 'Reprendre',
  continueLearning: 'Continuer l’apprentissage',
  startJourney: 'Commencer à l’étape 01',
  myProgress: 'Ma progression',
  theHotel: 'L’hôtel',
  backToHotel: 'Retour à l’hôtel',
  chapter: 'Étape',
  chapters: 'étapes',
  floor: 'Étage',
  of: 'sur',
  completedCount: (n: number, t: number) => `${n} / ${t} étapes terminées`,
  status: {
    not_started: 'Pas commencée',
    in_progress: 'En cours',
    completed: 'Terminée',
  },
  markCompleted: 'Marquer comme terminée',
  markedCompleted: 'Étape terminée',
  undoCompleted: 'Annuler',
  completedNote: 'Sa fenêtre est désormais allumée sur la façade.',
  previous: 'Étape précédente',
  next: 'Étape suivante',
  contents: 'Sommaire',
  onThisPage: 'Dans cette étape',
  readingProgress: 'Progression de lecture',
  copy: 'Copier',
  copied: 'Copié',
  openChapter: 'Entrer',
  enter: 'Entrer dans l’étape',
  directory: 'Répertoire',
  directoryTitle: 'Répertoire de l’hôtel',
  close: 'Fermer',
  lastVisited: 'Dernière étape consultée',
  resetProgress: 'Réinitialiser la progression',
  resetConfirm: 'Effacer toute ta progression sur cet appareil ?',
  progressTitle: 'Ta progression',
  progressLede:
    'Ta progression est enregistrée sur cet appareil, sans compte. Toutes les étapes restent ouvertes : avance dans l’ordre que tu veux.',
  storageUnavailable:
    'Ton navigateur bloque l’enregistrement local : ta progression sera perdue à la fermeture de l’onglet.',
  skip: 'Aller au contenu',
  language: 'Langue',
  selectHint: 'Choisis une fenêtre éclairée pour ouvrir une étape.',
  scrollHint: 'Fais défiler pour monter dans l’hôtel',
  block: 'Bloc',
  externalLink: '(s’ouvre dans un nouvel onglet)',
  notFoundTitle: 'Cette porte n’existe pas.',
  notFoundBody: 'La page demandée est introuvable. Revenez dans le hall.',
  footer: 'Programme de celinlin. Les étapes sont accessibles librement, sans date ni compte.',
  minutesRead: 'Lecture',
  startHere: 'Commencer ici',
  completedOn: 'Terminée',
  legendTitle: 'Lecture de la façade',
  legend: {
    not_started: 'Rideaux tirés : pas commencée',
    in_progress: 'Lumière tamisée : en cours',
    completed: 'Pleine lumière et couronne de laiton : terminée',
  },
  lobby: 'Hall d’entrée',
  pressEnter: 'Entrée pour ouvrir',
};

type Dict = typeof fr;

const en: Dict = {
  brand: '100 Hours of Agentic AI',
  brandShort: '100 Hours',
  tagline: 'An interactive journey into the world of AI agents.',
  intro: 'Explore the hotel. Open a chapter. Learn at your own pace.',
  explore: 'Explore the Hotel',
  continue: 'Continue',
  continueLearning: 'Continue Learning',
  startJourney: 'Begin with Step 01',
  myProgress: 'My Progress',
  theHotel: 'The Hotel',
  backToHotel: 'Back to Hotel',
  chapter: 'Step',
  chapters: 'steps',
  floor: 'Floor',
  of: 'of',
  completedCount: (n: number, t: number) => `${n} / ${t} chapters completed`,
  status: {
    not_started: 'Not started',
    in_progress: 'In progress',
    completed: 'Completed',
  },
  markCompleted: 'Mark as completed',
  markedCompleted: 'Chapter completed',
  undoCompleted: 'Undo',
  completedNote: 'Its window is now lit on the façade.',
  previous: 'Previous step',
  next: 'Next step',
  contents: 'Contents',
  onThisPage: 'In this step',
  readingProgress: 'Reading progress',
  copy: 'Copy',
  copied: 'Copied',
  openChapter: 'Enter',
  enter: 'Enter this step',
  directory: 'Directory',
  directoryTitle: 'Hotel directory',
  close: 'Close',
  lastVisited: 'Last visited',
  resetProgress: 'Reset progress',
  resetConfirm: 'Erase all your progress on this device?',
  progressTitle: 'Your progress',
  progressLede:
    'Your progress is saved on this device, no account needed. Every step stays open: move through them in any order you like.',
  storageUnavailable:
    'Your browser blocks local storage: your progress will be lost when this tab closes.',
  skip: 'Skip to content',
  language: 'Language',
  selectHint: 'Choose a lit window to open a step.',
  scrollHint: 'Scroll to climb the hotel',
  block: 'Block',
  externalLink: '(opens in a new tab)',
  notFoundTitle: 'This door does not exist.',
  notFoundBody: 'The page you asked for cannot be found. Head back to the lobby.',
  footer: 'A programme by celinlin. Every step is open, with no dates and no account.',
  minutesRead: 'Reading',
  startHere: 'Start here',
  completedOn: 'Completed',
  legendTitle: 'Reading the façade',
  legend: {
    not_started: 'Curtains drawn: not started',
    in_progress: 'Soft light: in progress',
    completed: 'Full light and brass crown: completed',
  },
  lobby: 'Lobby',
  pressEnter: 'Enter to open',
};

export const dict: Record<Lang, Dict> = { fr, en };
export type { Dict };
