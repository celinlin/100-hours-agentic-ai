/**
 * The contract between pedagogical data and the game engine.
 *
 * A chapter is a ROOM with STATIONS. Each station is an object in the room that
 * runs one SEQUENCE (one idea): show → interact → understand. When the required
 * stations are done, the FINAL CHALLENGE opens; passing it unlocks the next window.
 *
 * Every learner-facing string exists in French and English (`T`).
 * Validation is always computed from the data (expected order, correct bins, etc.),
 * never from a hard-coded "success" flag.
 */

export type T = { fr: string; en: string };

/* ------------------------------------------------------------------ */
/* Mechanics                                                           */
/* ------------------------------------------------------------------ */

/** Put steps in the right order. `items` are listed in the CORRECT order; the UI shuffles them. */
export interface OrderMechanic {
  kind: 'order';
  prompt: T;
  items: { id: string; label: T; hint?: T }[];
}

/** Sort cards into bins. */
export interface SortMechanic {
  kind: 'sort';
  prompt: T;
  bins: { id: string; label: T }[];
  items: { id: string; label: T; bin: string; why: T }[];
}

/** Connect each left item to its right partner. */
export interface MatchMechanic {
  kind: 'match';
  prompt: T;
  pairs: { id: string; left: T; right: T }[];
}

/** A decision in a situation. Each option explains itself. One or more options can be correct. */
export interface ChoiceMechanic {
  kind: 'choice';
  prompt: T;
  scene?: T; // short situation, shown above the options
  multiple?: boolean;
  options: { id: string; label: T; correct: boolean; why: T }[];
}

/** Visual debugging: click the faulty line(s) of a trace, code or prompt. */
export interface SpotMechanic {
  kind: 'spot';
  prompt: T;
  /** Lines are shown verbatim (monospace if `code`). Text is language-specific when it is prose. */
  code?: boolean;
  lines: { text: T; faulty: boolean; why?: T }[];
}

/** Fill the blanks of a snippet by choosing tokens. Use `{{0}}`, `{{1}}`… in `template`. */
export interface FillMechanic {
  kind: 'fill';
  prompt: T;
  code?: boolean;
  template: T;
  blanks: { options: string[]; answer: string; why: T }[];
}

/**
 * Next-token sampler: a REAL sampling over ILLUSTRATIVE probabilities (labelled as such).
 * The learner moves temperature and draws; the task is reached when `goal` is satisfied.
 */
export interface SamplerMechanic {
  kind: 'sampler';
  prompt: T;
  context: T; // the text before the next token
  tokens: { text: T; p: number }[]; // base probabilities at temperature 1
  goal: { draws: number; distinctAtHighTemp?: number }; // e.g. draw 5 times, see ≥2 different tokens at T≥1.2
}

/**
 * Agent loop: the learner plays the model. Each turn the context grows; the learner chooses
 * an action (a tool call or FINAL). The system executes the tool and returns a result.
 */
export interface LoopMechanic {
  kind: 'loop';
  prompt: T;
  goal: T; // the user's request
  tools: { id: string; label: string; returns: T }[]; // label is code-like, e.g. "calendrier(jeudi)"
  /** The expected sequence of tool ids before FINAL (order matters unless `anyOrder`). */
  expected: string[];
  anyOrder?: boolean;
  /** Feedback when the learner calls a tool that is not needed / FINAL too early. */
  wrongTool: T;
  tooEarly: T;
  finalLabel: T;
}

export type Mechanic =
  | OrderMechanic
  | SortMechanic
  | MatchMechanic
  | ChoiceMechanic
  | SpotMechanic
  | FillMechanic
  | SamplerMechanic
  | LoopMechanic;

/* ------------------------------------------------------------------ */
/* Rooms, stations, challenge                                          */
/* ------------------------------------------------------------------ */

export interface Station {
  id: string;
  /** Name of the object in the room ("La machine à tokens"). */
  object: T;
  /** One idea, as a short title. */
  title: T;
  /** One or two sentences shown before the interaction. */
  show: T;
  mechanic: Mechanic;
  /** What to remember, shown after success (≤ 2 sentences). */
  takeaway: T;
  /** Optional deeper explanation, collapsed by default. Plain text with line breaks. */
  more?: T;
  /** The prop drawn in the room for this station (key in the room's prop registry). */
  prop: string;
  /** Position of the hotspot in the room's 1600×900 coordinate space (centre of the object). */
  at: { x: number; y: number };
  /** Optional: a video id (from `videos`) suggested after success. */
  video?: string;
}

export interface Challenge {
  title: T;
  brief: T;
  /** All steps must be solved. Mistakes are explained; the learner can retry. */
  steps: Mechanic[];
  /** The symbolic object earned (a key, a seal, a card…). */
  reward: { name: T; prop: string };
}

export type ResourceKind = 'video' | 'doc' | 'article' | 'paper' | 'tool' | 'course' | 'repo' | 'exercise';

export interface Resource {
  title: string;
  url: string;
  kind: ResourceKind;
  source: string; // "Anthropic", "Hugging Face"…
  lang: 'en' | 'fr';
  note: T; // one useful sentence
  /** true when the resource comes from the original programme */
  programme: boolean;
}

export interface Video {
  id: string; // YouTube id, verified via oEmbed
  title: string; // exact title
  channel: string;
  lang: 'en' | 'fr';
  note: T;
  programme: boolean;
}

export interface RoomStyle {
  /** wall / accent colours of the room, chosen within the house palette */
  wall: string;
  wallDeep: string;
  floor: string;
  accent: string;
  /** wallpaper motif drawn on the back wall */
  motif: 'chevron' | 'fan' | 'grid' | 'stripes' | 'diamond' | 'arch';
}

export interface ChapterGame {
  id: string; // "01"
  room: { name: T; style: RoomStyle };
  /** Skills validated by the chapter, one line each. */
  skills: T[];
  /** Notions from formation-ia-gratuite.com integrated here (for the notions index). */
  notions: T[];
  stations: Station[];
  challenge: Challenge;
  videos: Video[];
  resources: Resource[];
}
