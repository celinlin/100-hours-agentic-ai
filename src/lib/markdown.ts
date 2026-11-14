import 'server-only';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import { toString as mdToString } from 'mdast-util-to-string';
import { createHighlighter, type Highlighter } from 'shiki';
import type { Root as MdRoot, Parent, RootContent, Code, Paragraph, ListItem, List, Text, PhrasingContent } from 'mdast';
import type { Root as HRoot, Element, ElementContent } from 'hast';
import type { Lang } from './i18n';
import { hotelCodeTheme } from './codeTheme';

export interface TocEntry {
  id: string;
  title: string;
  mark?: string;
  kicker?: string;
  depth: 2 | 3;
  activity?: string;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

type AnyNode = RootContent & { data?: Record<string, unknown>; children?: unknown[] };

/** A generic mdast wrapper rendered as an arbitrary HTML element. */
function el(tag: string, className: string | string[] | null, children: unknown[], props: Record<string, unknown> = {}): AnyNode {
  const cls = className == null ? undefined : Array.isArray(className) ? className : [className];
  return {
    type: 'hotelElement',
    data: { hName: tag, hProperties: { ...(cls ? { className: cls } : {}), ...props } },
    children,
  } as unknown as AnyNode;
}
function txt(value: string): Text {
  return { type: 'text', value };
}
/** Raw hast children (for diagrams built directly in hast). */
function hast(tag: string, className: string | null, children: unknown[], props: Record<string, unknown> = {}): AnyNode {
  return {
    type: 'hotelElement',
    data: { hName: tag, hProperties: { ...(className ? { className: [className] } : {}), ...props }, hChildren: children },
    children: [],
  } as unknown as AnyNode;
}
function h(tag: string, props: Record<string, unknown>, children: ElementContent[] = []): Element {
  return { type: 'element', tagName: tag, properties: props as Element['properties'], children };
}
function ht(value: string): ElementContent {
  return { type: 'text', value };
}

function attr(node: { attributes?: Record<string, string | null | undefined> | null }, k: string): string {
  const v = node.attributes?.[k];
  return typeof v === 'string' ? v : '';
}

/** "1 h 30" → 90, "45 min" → 45, "2 h" → 120 */
export function parseMinutes(s: string): number {
  const t = s.replace(/\s+/g, ' ').trim().toLowerCase();
  let m = 0;
  const hm = /(\d+)\s*h(?:\s*(\d+))?/.exec(t);
  if (hm) m += Number(hm[1]) * 60 + (hm[2] ? Number(hm[2]) : 0);
  const mm = /(\d+)\s*min/.exec(t);
  if (mm && !hm) m += Number(mm[1]);
  return m;
}

/** Split "Strong. text | 20 min | build" — returns meta parts and mutates the last text node. */
function stripPipes(p: Paragraph): string[] {
  const last = p.children[p.children.length - 1];
  if (!last || last.type !== 'text') return [];
  const idx = last.value.indexOf(' | ');
  if (idx < 0) return [];
  const meta = last.value.slice(idx + 3).split('|').map((s) => s.trim());
  last.value = last.value.slice(0, idx);
  return meta;
}

/** In a list item, separate the leading **term** from the rest. */
function termSplit(item: ListItem): { term: PhrasingContent[]; rest: unknown[] } {
  const [first, ...others] = item.children;
  if (first && first.type === 'paragraph' && first.children[0]?.type === 'strong') {
    const term = (first.children[0] as Parent).children as PhrasingContent[];
    const remaining = first.children.slice(1);
    if (remaining[0]?.type === 'text') {
      (remaining[0] as Text).value = (remaining[0] as Text).value.replace(/^\s+/, '');
    }
    const rest: unknown[] = [];
    if (remaining.length && !(remaining.length === 1 && remaining[0].type === 'text' && !(remaining[0] as Text).value)) {
      rest.push({ type: 'paragraph', children: remaining });
    }
    rest.push(...others);
    return { term, rest };
  }
  return { term: [], rest: item.children };
}

/* ------------------------------------------------------------------ */
/* diagrams                                                            */
/* ------------------------------------------------------------------ */

function tokensDiagram(code: string): AnyNode {
  const chips = code
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => {
      const hi = l.startsWith('!');
      const v = hi ? l.slice(1) : l;
      return h('span', { className: hi ? ['chip', 'chip--hi'] : ['chip'] }, [ht(v)]);
    });
  return hast('div', 'tokens', chips, { role: 'img', ariaLabel: code.replace(/^!/gm, '').split('\n').filter(Boolean).join(' · ') });
}

function flowDiagram(code: string): AnyNode {
  const items = code.split('\n').map((l) => l.trim()).filter(Boolean);
  const kids: ElementContent[] = [];
  items.forEach((l, i) => {
    const hi = l.startsWith('*');
    const v = hi ? l.slice(1).trim() : l;
    if (i > 0) kids.push(h('span', { className: ['flow__arrow'], ariaHidden: 'true' }, []));
    kids.push(h('li', { className: hi ? ['flow__step', 'flow__step--hi'] : ['flow__step'] }, [ht(v)]));
  });
  return hast('ol', 'flow', kids);
}

function barsDiagram(code: string): AnyNode {
  let title = '';
  const rows: { label: string; value: number; raw: string }[] = [];
  for (const line of code.split('\n')) {
    const l = line.trim();
    if (!l) continue;
    if (/^title\s*:/i.test(l)) {
      title = l.replace(/^title\s*:\s*/i, '');
      continue;
    }
    const [label, val] = l.split('|').map((s) => s.trim());
    const n = parseFloat((val ?? '').replace(',', '.'));
    rows.push({ label, value: isNaN(n) ? 0 : n, raw: val ?? '' });
  }
  const max = Math.max(100, ...rows.map((r) => r.value));
  const kids: ElementContent[] = [];
  if (title) kids.push(h('p', { className: ['bars__title'] }, [ht(title)]));
  kids.push(
    h(
      'dl',
      { className: ['bars__rows'] },
      rows.flatMap((r) => [
        h('dt', {}, [ht(r.label)]),
        h('dd', {}, [
          h('span', { className: ['bars__track'], ariaHidden: 'true' }, [
            h('span', { className: ['bars__fill'], style: `--v:${(r.value / max).toFixed(3)}` }, []),
          ]),
          h('span', { className: ['bars__val'] }, [ht(/%/.test(r.raw) ? r.raw : `${r.raw} %`.replace(' %', ' %'))]),
        ]),
      ]),
    ),
  );
  return hast('figure', 'bars', kids);
}

function schemaDiagram(code: string, lang: Lang): AnyNode {
  let legend: { kind: string; label: string }[] = [];
  const nodes: { kind: string; title: string; body: string }[] = [];
  const edges: { from: string; to: string; label: string }[] = [];
  for (const line of code.split('\n')) {
    const l = line.trim();
    if (!l) continue;
    if (/^legend\s*:/i.test(l)) {
      legend = l
        .replace(/^legend\s*:\s*/i, '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const [k, ...rest] = s.split('=');
          return { kind: k.trim(), label: rest.join('=').trim() };
        });
      continue;
    }
    if (l.startsWith('->')) {
      const body = l.slice(2).trim();
      const lm = /\(([^)]*)\)\s*$/.exec(body);
      const label = lm ? lm[1] : '';
      const core = lm ? body.slice(0, lm.index).trim() : body;
      const [from, to] = core.split(/\s*(?:→|->)\s*/);
      edges.push({ from: from ?? core, to: to ?? '', label });
      continue;
    }
    const nm = /^\[(\w+)\]\s*(.*)$/.exec(l);
    if (nm) {
      const [title, ...body] = nm[2].split('|');
      nodes.push({ kind: nm[1], title: title.trim(), body: body.join('|').trim() });
    } else {
      nodes.push({ kind: 'plain', title: l, body: '' });
    }
  }
  const kids: ElementContent[] = [];
  kids.push(
    h(
      'ul',
      { className: ['schema__nodes'] },
      nodes.map((n) =>
        h('li', { className: ['schema__node', `schema__node--${n.kind}`] }, [
          h('span', { className: ['schema__title'] }, [ht(n.title)]),
          ...(n.body ? [h('span', { className: ['schema__body'] }, [ht(n.body)])] : []),
        ]),
      ),
    ),
  );
  if (edges.length) {
    kids.push(
      h('div', { className: ['schema__edges'] }, [
        h('p', { className: ['schema__edges-title'] }, [ht(lang === 'fr' ? 'Les flèches' : 'The arrows')]),
        h(
          'ul',
          {},
          edges.map((e) =>
            h('li', {}, [
              h('span', { className: ['schema__from'] }, [ht(e.from)]),
              h('span', { className: ['schema__arrow'], ariaLabel: lang === 'fr' ? 'vers' : 'to' }, [ht('→')]),
              h('span', { className: ['schema__to'] }, [ht(e.to)]),
              ...(e.label ? [h('span', { className: ['schema__label'] }, [ht(e.label)])] : []),
            ]),
          ),
        ),
      ]),
    );
  }
  if (legend.length) {
    kids.push(
      h(
        'ul',
        { className: ['schema__legend'] },
        legend.map((g) => h('li', { className: [`schema__key--${g.kind}`] }, [ht(g.label)])),
      ),
    );
  }
  return hast('figure', 'schema', kids);
}

/* ------------------------------------------------------------------ */
/* code highlighting                                                   */
/* ------------------------------------------------------------------ */

let hlPromise: Promise<Highlighter> | null = null;
const CODE_LANGS = ['python', 'bash', 'json', 'toml', 'yaml', 'javascript', 'typescript', 'sql', 'ini', 'dockerfile', 'html', 'markdown', 'diff'];
function highlighter() {
  hlPromise ??= createHighlighter({ themes: [hotelCodeTheme], langs: CODE_LANGS });
  return hlPromise;
}
const LANG_ALIAS: Record<string, string> = { sh: 'bash', shell: 'bash', console: 'bash', zsh: 'bash', py: 'python', js: 'javascript', ts: 'typescript', yml: 'yaml', env: 'ini', md: 'markdown' };
const LANG_LABEL: Record<string, string> = { python: 'Python', bash: 'Terminal', json: 'JSON', toml: 'TOML', yaml: 'YAML', javascript: 'JavaScript', typescript: 'TypeScript', sql: 'SQL', ini: 'Config', dockerfile: 'Dockerfile', html: 'HTML', markdown: 'Markdown', diff: 'Diff', text: 'Texte' };

function codeBlock(hl: Highlighter, node: Code, lang: Lang, file?: string): AnyNode {
  const raw = (node.lang ?? 'text').toLowerCase();
  const l = LANG_ALIAS[raw] ?? raw;
  const known = CODE_LANGS.includes(l);
  const root = hl.codeToHast(node.value, { lang: known ? l : 'text', theme: hotelCodeTheme.name! }) as HRoot;
  const pre = root.children.find((c) => c.type === 'element') as Element;
  pre.properties = { className: ['code__pre'], tabIndex: 0 };
  let label = LANG_LABEL[known ? l : 'text'] ?? l;
  if (l === 'text' && lang === 'en') label = 'Text';
  const head = h('div', { className: ['code__head'] }, [
    h('span', { className: ['code__lang'] }, [ht(file ?? label)]),
    h('button', { type: 'button', className: ['code__copy', 'js-copy'], dataCopyTarget: 'pre' }, [ht(lang === 'fr' ? 'Copier' : 'Copy')]),
  ]);
  return hast('div', 'code', [head, pre]);
}

/* ------------------------------------------------------------------ */
/* the remark plugin                                                   */
/* ------------------------------------------------------------------ */

interface Ctx {
  lang: Lang;
  file: string;
  toc: TocEntry[];
  hl: Highlighter;
  warnings: string[];
}

function transform(tree: MdRoot, ctx: Ctx) {
  let currentPart = 'intro';
  let h3Count = 0;
  let pendingTime = '';
  const { lang } = ctx;

  const walk = (parent: Parent) => {
    for (let i = 0; i < parent.children.length; i++) {
      const node = parent.children[i] as AnyNode & { name?: string; attributes?: Record<string, string> };
      const replace = (n: AnyNode) => {
        parent.children[i] = n as RootContent;
      };

      // file label: a paragraph made of a single **name.ext** right before a code block
      if (node.type === 'paragraph') {
        const p = node as unknown as Paragraph;
        const next = parent.children[i + 1];
        if (
          next?.type === 'code' &&
          p.children.length === 1 &&
          p.children[0].type === 'strong' &&
          /^[\w./-]+\.\w{1,6}$/.test(mdToString(p.children[0]))
        ) {
          (next as Code & { meta?: string }).meta = `file=${mdToString(p.children[0])}`;
          parent.children.splice(i, 1);
          i--;
          continue;
        }
      }

      switch (node.type) {
        case 'heading': {
          const hd = node as unknown as { depth: number; data?: Record<string, unknown> } & Parent;
          if (hd.depth === 3) {
            h3Count++;
            const id = `${currentPart}-${h3Count}`;
            const title = mdToString(hd);
            const kind = activityKind(title);
            const props: Record<string, string> = { id };
            if (pendingTime && currentPart.startsWith('seance')) {
              props.dataActivity = id;
              props.dataMinutes = String(parseMinutes(pendingTime));
              props.dataTime = pendingTime;
            }
            if (kind) props.dataKind = kind;
            pendingTime = '';
            hd.data = { ...(hd.data ?? {}), hProperties: props };
            ctx.toc.push({ id, title, depth: 3, activity: props.dataActivity ? id : undefined });
          }
          if (hd.depth === 1) hd.depth = 2;
          break;
        }
        case 'code': {
          const c = node as unknown as Code;
          const l = (c.lang ?? '').toLowerCase();
          if (l === 'tokens') replace(tokensDiagram(c.value));
          else if (l === 'flow') replace(flowDiagram(c.value));
          else if (l === 'bars') replace(barsDiagram(c.value));
          else if (l === 'schema') replace(schemaDiagram(c.value, lang));
          else {
            const fm = /file=(\S+)/.exec((c as Code & { meta?: string }).meta ?? '');
            replace(codeBlock(ctx.hl, c, lang, fm?.[1]));
          }
          continue;
        }
        case 'table': {
          replace(el('div', 'table-wrap', [node], { tabIndex: 0 }));
          continue;
        }
        case 'textDirective': {
          // Not part of our vocabulary: restore literal text (e.g. "rôle:assistant").
          const label = mdToString(node);
          replace({ type: 'text', value: `:${node.name}${label ? `[${label}]` : ''}` } as Text as AnyNode);
          continue;
        }
        case 'leafDirective': {
          const name = node.name;
          if (name === 'part') {
            const id = (node.attributes?.id as string) || `part-${i}`;
            currentPart = id;
            h3Count = 0;
            const mark = attr(node, 'mark');
            const kicker = attr(node, 'kicker');
            const title = mdToString(node);
            ctx.toc.push({ id, title, mark, kicker, depth: 2 });
            replace(
              el('header', 'part', [
                el('span', 'part__mark', [txt(mark)], { ariaHidden: 'true' }),
                el('div', 'part__titles', [
                  ...(kicker ? [el('p', 'part__kicker', [txt(kicker)])] : []),
                  { type: 'heading', depth: 2, children: (node as Parent).children, data: { hProperties: { id, tabIndex: -1 } } },
                ]),
              ]),
            );
            continue;
          }
          if (name === 'margin') {
            const time = attr(node, 'time');
            pendingTime = time;
            const kids = (node as Parent).children;
            replace(
              el('aside', ['margin', time ? 'margin--time' : 'margin--note'], [
                ...(time ? [el('span', 'margin__time', [txt(time)])] : []),
                ...(kids.length ? [el('span', 'margin__note', kids)] : []),
              ]),
            );
            continue;
          }
          ctx.warnings.push(`Unknown leaf directive ::${name}`);
          replace(el('p', null, (node as Parent).children));
          continue;
        }
        case 'containerDirective': {
          const name = node.name as string;
          const kids = (node as Parent).children as AnyNode[];
          // directive label ([..]) shows up as a first paragraph flagged directiveLabel
          const body = kids.filter((k) => !(k.data as { directiveLabel?: boolean } | undefined)?.directiveLabel);
          walk({ type: 'root', children: body } as unknown as Parent); // process nested content first
          const title = attr(node, 'title');
          switch (name) {
            case 'plan': {
              const out: AnyNode[] = [];
              for (const k of body) {
                if (k.type === 'heading') {
                  out.push(el('p', 'plan__session', (k as unknown as Parent).children));
                } else if (k.type === 'list') {
                  const rows = (k as unknown as List).children.map((li) => {
                    const p = li.children[0] as Paragraph;
                    const meta = p?.type === 'paragraph' ? stripPipes(p) : [];
                    const dur = meta[0] ?? '';
                    const flag = meta.slice(1).join(' ');
                    const min = parseMinutes(dur);
                    return el('li', ['plan__row', ...(flag.includes('build') ? ['plan__row--build'] : [])], [
                      el('span', 'plan__label', p ? p.children : []),
                      el('span', 'plan__bar', [el('span', 'plan__fill', [], { style: `--w:${Math.min(1, min / 120).toFixed(3)}` })], { ariaHidden: 'true' }),
                      el('span', 'plan__time', [txt(dur)]),
                    ]);
                  });
                  out.push(el('ul', 'plan__rows', rows));
                } else out.push(k);
              }
              replace(el('div', 'plan', out));
              continue;
            }
            case 'resource': {
              const time = attr(node, 'time');
              const items = body.map((k, idx) => {
                if (k.type !== 'paragraph') return k;
                const p = k as unknown as Paragraph;
                if (idx === 0 && p.children.length === 1 && p.children[0].type === 'strong') {
                  return el('h4', 'resource__q', (p.children[0] as Parent).children);
                }
                if (p.children[0]?.type === 'strong' && idx === body.length - 1 && idx > 0) {
                  return el('p', 'resource__say', p.children);
                }
                return k;
              });
              replace(el('div', 'resource', [...(time ? [el('span', 'resource__time', [txt(time)])] : []), ...items]));
              continue;
            }
            case 'steps':
              replace(el('div', 'steps', body));
              continue;
            case 'minimum':
              replace(el('div', 'box box--minimum', body));
              continue;
            case 'takeaway':
              replace(el('div', 'takeaway', body));
              continue;
            case 'prompt':
              replace(
                el('div', 'prompt', [
                  el('div', 'prompt__head', [
                    el('span', 'prompt__label', [txt(title || (lang === 'fr' ? 'Consigne à copier' : 'Prompt to copy'))]),
                    hast('button', 'js-copy prompt__copy', [ht(lang === 'fr' ? 'Copier' : 'Copy')], { type: 'button', dataCopyTarget: '.prompt__body' }),
                  ]),
                  el('div', 'prompt__body', body),
                ]),
              );
              continue;
            case 'journal':
            case 'kv':
            case 'glossary': {
              const list = body.find((k) => k.type === 'list') as unknown as List | undefined;
              const others = body.filter((k) => k.type !== 'list');
              const rows = (list?.children ?? []).map((li) => {
                const { term, rest } = termSplit(li);
                return el('div', 'kv__row', [el('dt', null, term), el('dd', null, rest.length ? rest : [])]);
              });
              const cls = name === 'journal' ? 'journal' : name === 'glossary' ? 'glossary' : 'kv';
              replace(
                el('div', `${cls}-wrap`, [
                  ...(title ? [el('p', `${cls}__title`, [txt(title)])] : []),
                  el('dl', cls, rows),
                  ...others,
                ]),
              );
              continue;
            }
            case 'answers': {
              const list = body.find((k) => k.type === 'list') as unknown as List | undefined;
              const others = body.filter((k) => k.type !== 'list');
              const rows = (list?.children ?? []).map((li, n) => {
                const { term, rest } = termSplit(li);
                const start = (list?.start ?? 1) + n;
                return el('li', 'answers__item', [
                  el('span', 'answers__n', [txt(String(start))], { ariaHidden: 'true' }),
                  el('div', null, [el('p', 'answers__q', term), ...(rest as AnyNode[])]),
                ]);
              });
              replace(el('div', 'answers-wrap', [...(title ? [el('p', 'answers__title', [txt(title)])] : []), el('ol', 'answers', rows, { start: list?.start ?? 1 }), ...others]));
              continue;
            }
            case 'callout':
              replace(el('div', 'box box--callout', [...(title ? [el('p', 'box__title', [txt(title)])] : []), ...body]));
              continue;
            default:
              ctx.warnings.push(`Unknown container :::${name}`);
              replace(el('div', 'box box--callout', [...(title ? [el('p', 'box__title', [txt(title)])] : []), ...body]));
              continue;
          }
        }
      }
      if (Array.isArray((node as Parent).children) && node.type !== 'hotelElement' as string) {
        walk(node as unknown as Parent);
      }
    }
  };
  walk(tree as unknown as Parent);

  // group the flat flow into one <section> per part (used by focus mode)
  const sections: AnyNode[] = [];
  let cur: AnyNode = el('section', 'part-section', [], { dataPart: 'intro' });
  for (const child of tree.children as AnyNode[]) {
    const props = (child.data?.hProperties ?? {}) as { className?: string[] };
    if (child.type === ('hotelElement' as string) && props.className?.includes('part')) {
      if ((cur.children as unknown[]).length) sections.push(cur);
      const h2 = ((child.children as AnyNode[])[1]?.children as AnyNode[] | undefined)?.find((k) => k.type === 'heading');
      const id = ((h2?.data?.hProperties ?? {}) as { id?: string }).id ?? 'part';
      cur = el('section', 'part-section', [], { dataPart: id });
    }
    (cur.children as unknown[]).push(child);
  }
  if ((cur.children as unknown[]).length) sections.push(cur);
  tree.children = sections as RootContent[];
}

const KINDS: [RegExp, string][] = [
  [/^pre-test$/i, 'pretest'],
  [/^learn$/i, 'learn'],
  [/^practice$/i, 'practice'],
  [/^break \/ fix$/i, 'breakfix'],
  [/^evals$/i, 'evals'],
  [/^teach-back$/i, 'teachback'],
  [/^final test$/i, 'finaltest'],
  [/^review$/i, 'review'],
  [/^build/i, 'build'],
];
function activityKind(title: string): string | undefined {
  const t = title.trim();
  return KINDS.find(([re]) => re.test(t))?.[1];
}

/** rehype: external links, list numbering hooks. */
function rehypeLinks(lang: Lang) {
  return (tree: HRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a') {
        const href = String(node.properties?.href ?? '');
        if (/^https?:\/\//.test(href)) {
          let host = '';
          try {
            host = new URL(href).hostname.replace(/^www\./, '');
          } catch {
            /* keep href as given */
          }
          node.properties = {
            ...node.properties,
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
            className: ['ext'],
            dataHost: host,
          };
          node.children.push(h('span', { className: ['sr-only'] }, [ht(lang === 'fr' ? ' (s’ouvre dans un nouvel onglet)' : ' (opens in a new tab)')]));
          return SKIP;
        }
      }
      return undefined;
    });
  };
}

export async function renderBody(md: string, file: string, lang: Lang): Promise<{ html: string; toc: TocEntry[] }> {
  const hl = await highlighter();
  const ctx: Ctx = { lang, file, toc: [], hl, warnings: [] };
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(() => (tree: MdRoot) => transform(tree, ctx))
    .use(remarkRehype, {
      allowDangerousHtml: false,
      unknownHandler: undefined,
    })
    .use(() => rehypeLinks(lang))
    .use(rehypeStringify);
  const out = await processor.process(md);
  if (ctx.warnings.length) console.warn(`[content] ${file}:\n  ${ctx.warnings.join('\n  ')}`);
  return { html: String(out), toc: ctx.toc };
}

const inlineProcessor = (lang: Lang = 'en') =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(() => rehypeLinks(lang))
    .use(rehypeStringify);

/** Render a short inline markdown string (frontmatter values) without the wrapping <p>. */
export function renderInline(s: string, lang: Lang = 'en'): string {
  const html = String(inlineProcessor(lang).processSync(s)).trim();
  return html.replace(/^<p>/, '').replace(/<\/p>$/, '');
}
