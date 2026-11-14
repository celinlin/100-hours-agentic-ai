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

/**
 * Everyday analogy made playable: a desk with limited room. The learner places documents
 * (only `slots` fit); each upcoming question can be answered only if the documents it needs
 * are on the desk. Solved when every question is answered.
 */
export interface DeskMechanic {
  kind: 'desk';
  prompt: T;
  slots: number;
  docs: { id: string; label: T; detail?: T }[];
  questions: { q: T; needs: string[]; answer: T; missing: T }[];
}

/**
 * An animation the learner steps through (each step lights an actor of the scene),
 * followed by a check question that validates the mechanism was understood.
 */
export interface StepperMechanic {
  kind: 'stepper';
  prompt: T;
  steps: { actor: 'guest' | 'model' | 'tool' | 'system' | 'human'; label: T; detail: T }[];
  check: ChoiceMechanic;
}

export type Mechanic =
  | DeskMechanic
  | StepperMechanic
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
  /** Optional second, harder activity on the same object, shown once the first is solved. */
  then?: Mechanic;
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
  /** Everyday analogy shown before the activity, with the point where it stops being true. */
  everyday?: { analogy: T; limit: T };
}

/* ------------------------------------------------------------------ */
/* Learning experience 2.0: story, business mission, teaching, toolkit */
/* ------------------------------------------------------------------ */

/** The opening scene at the concierge desk: a first success within seconds. */
export interface IntroScene {
  guest: string; // fictional guest name
  request: T;
  /** What the concierge says if it answers without a tool (a plausible invention). */
  guess: T;
  tools: { id: string; label: T; result: T }[];
  correct: string;
  answer: T; // the concierge's answer once the right result is in
  wrongTool: T; // feedback when another tool is chosen
  lesson: { model: T; call: T; result: T };
}

export type PermissionLevel = 'read' | 'draft' | 'approve' | 'auto' | 'deny';

/** APPLY — a client brief turned into a workflow that is tested on synthetic requests. */
export interface BusinessMission {
  sector: T;
  client: T; // fictional company name + context
  brief: T;
  constraints: { label: T; detail: T }[];
  problem: ChoiceMechanic;
  /** bins must be: rule (classic automation), llm (LLM feature), agent, human */
  tasks: SortMechanic;
  tools: { id: string; label: T; desc: T; role: 'needed' | 'optional' | 'forbidden'; why: T }[];
  permissions: { tool: string; options: PermissionLevel[]; allowed: PermissionLevel[]; why: T }[];
  /** Each test passes if its tools were selected and its permission rule is respected. */
  tests: {
    id: string;
    request: T;
    needsTools: string[];
    permission?: { tool: string; allowed: PermissionLevel[] };
    critical?: boolean;
    ok: T;
    ko: T;
  }[];
  limits: T[];
  realCase?: {
    company: string;
    facts: T[];
    source: { title: string; url: string; publisher: string };
    caveat: T;
  };
}

export type Criterion = 'accuracy' | 'simplicity' | 'relevance' | 'limits' | 'example';

export interface TeachOption {
  id: string;
  text: T;
  /** 0, 1 or 2 on the criteria this part contributes to */
  scores: Partial<Record<Criterion, 0 | 1 | 2>>;
  note: T; // pedagogical feedback on this choice
}

/** TEACH — the learner trains a fictional team: three colleagues, three kinds of questions. */
export interface TeachMission {
  setting: T;
  colleagues: {
    id: string;
    name: string;
    role: T;
    level: T;
    kind: 'simple' | 'confusion' | 'risky';
    says: T;
    explain: TeachOption[];
    example: TeachOption[];
    limit: TeachOption[];
  }[];
}

/** A reusable kit to teach the chapter to a team. */
export interface Toolkit {
  simple: T;
  analogy: T;
  useCase: T;
  demo: T;
  exercise: T;
  questions: T[];
  mistakes: T[];
  vigilance: T[];
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
  /** The hotel concierge's new capability, gained in this chapter (the common thread). */
  capability?: T;
  intro?: IntroScene;
  mission?: BusinessMission;
  teach?: TeachMission;
  toolkit?: Toolkit;
  /** Skills validated by the chapter, one line each. */
  skills: T[];
  /** Notions from formation-ia-gratuite.com integrated here (for the notions index). */
  notions: T[];
  stations: Station[];
  challenge: Challenge;
  videos: Video[];
  resources: Resource[];
}
