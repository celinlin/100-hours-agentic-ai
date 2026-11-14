import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { type Lang, LANGS } from './i18n';
import { renderBody, renderInline, type TocEntry } from './markdown';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ChapterMeta {
  id: string;
  order: number;
  title: string;
  block: string;
  blockNumber: number;
  blockName: string;
  question: string;
}

export interface Chapter extends ChapterMeta {
  lang: Lang;
  lede: string;
  questionHtml: string;
  outcomesTitle: string;
  outcomes: string[];
  needsTitle: string;
  needs: string[];
  minimum: string;
  footnote: string;
  stats: string;
  html: string;
  toc: TocEntry[];
  words: number;
}

interface Front {
  id: string;
  title: string;
  block: string;
  lede?: string;
  question?: string;
  outcomesTitle?: string;
  outcomes?: string[];
  needsTitle?: string;
  needs?: string[];
  minimum?: string;
  footnote?: string;
  stats?: string;
}

function listIds(lang: Lang): string[] {
  const dir = path.join(CONTENT_DIR, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^\d{2}\.md$/.test(f))
    .map((f) => f.slice(0, 2))
    .sort();
}

/** Chapter ids present in BOTH languages — the façade is generated from this list. */
export function chapterIds(): string[] {
  const sets = LANGS.map((l) => new Set(listIds(l)));
  return listIds(LANGS[0]).filter((id) => sets.every((s) => s.has(id)));
}

function readFront(lang: Lang, id: string) {
  const file = path.join(CONTENT_DIR, lang, `${id}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  return { data: parsed.data as Front, body: parsed.content, file };
}

function splitBlock(block: string) {
  // "Bloc 1 · Foundations" / "Block 1 · Foundations"
  const m = /(\d+)\s*·\s*(.+)$/.exec(block);
  return { blockNumber: m ? Number(m[1]) : 0, blockName: m ? m[2].trim() : block };
}

const metaCache = new Map<Lang, ChapterMeta[]>();

export function getChapterMetas(lang: Lang): ChapterMeta[] {
  const hit = metaCache.get(lang);
  if (hit) return hit;
  const metas = chapterIds().map((id, i) => {
    const { data } = readFront(lang, id);
    return {
      id,
      order: i + 1,
      title: data.title,
      block: data.block,
      question: data.question ?? '',
      ...splitBlock(data.block),
    };
  });
  metaCache.set(lang, metas);
  return metas;
}

const chapterCache = new Map<string, Promise<Chapter>>();

export function getChapter(lang: Lang, id: string): Promise<Chapter> {
  const key = `${lang}/${id}`;
  let p = chapterCache.get(key);
  if (!p) {
    p = loadChapter(lang, id);
    chapterCache.set(key, p);
  }
  return p;
}

async function loadChapter(lang: Lang, id: string): Promise<Chapter> {
  const { data, body, file } = readFront(lang, id);
  const meta = getChapterMetas(lang).find((m) => m.id === id);
  if (!meta) throw new Error(`Unknown chapter ${id}`);
  const { html, toc } = await renderBody(body, file, lang);
  const inl = (s?: string) => (s ? renderInline(s) : '');
  return {
    ...meta,
    lang,
    lede: inl(data.lede),
    questionHtml: inl(data.question),
    outcomesTitle: data.outcomesTitle ?? '',
    outcomes: (data.outcomes ?? []).map(inl),
    needsTitle: data.needsTitle ?? '',
    needs: (data.needs ?? []).map(inl),
    minimum: inl(data.minimum),
    footnote: inl(data.footnote),
    stats: data.stats ?? '',
    html,
    toc,
    words: body.split(/\s+/).length,
  };
}
