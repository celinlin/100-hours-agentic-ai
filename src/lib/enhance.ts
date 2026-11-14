'use client';

import type { Lang } from './i18n';
import { wbGet, wbSet, focusTimer } from './workbook';

/**
 * Turns the static chapter into a workbook, using only the structure the programme
 * already prescribes (pre-test answers, journal lines, break/fix causes, eval sheets,
 * teach-back points, review lines, final test scored against the answer key).
 * Nothing is added to the programme's text: these are input fields around it.
 */

const L = {
  fr: {
    done: 'Fait',
    timer: (t: string) => `Minuteur · ${t}`,
    yourAnswer: 'Ta réponse',
    answerHint: 'Deux lignes suffisent. « Je ne sais pas » est une réponse.',
    resourceDone: 'Ressource consultée',
    mySentence: 'Ma phrase « À savoir dire »',
    cause: 'La cause, en une phrase',
    fix: 'Ma correction',
    reviewLabels: ['Ce qui a cliqué', 'Ce qui reste flou', 'Ce qui attendra'],
    notes: 'Mes notes',
    sheetTitle: 'Ta feuille de Final test',
    sheetIntro: 'Réponds sans regarder tes premières réponses. Tout est enregistré sur cet appareil.',
    compare: 'Comparer avec le pre-test et le corrigé',
    hide: 'Masquer la comparaison',
    pre: 'Pre-test',
    final: 'Final test',
    key: 'Corrigé',
    empty: '(pas de réponse)',
    point: 'Même idée, avec mes mots : 1 point',
    score: (n: number, t: number) => `${n} / ${t} points`,
    fill: 'À remplir',
    saved: 'Enregistré sur cet appareil',
  },
  en: {
    done: 'Done',
    timer: (t: string) => `Timer · ${t}`,
    yourAnswer: 'Your answer',
    answerHint: 'Two lines are enough. “I don’t know” is an answer.',
    resourceDone: 'Resource read',
    mySentence: 'My “be able to say” sentence',
    cause: 'The cause, in one sentence',
    fix: 'My fix',
    reviewLabels: ['What clicked', 'What is still unclear', 'What can wait'],
    notes: 'My notes',
    sheetTitle: 'Your Final test sheet',
    sheetIntro: 'Answer without looking at your first answers. Everything is saved on this device.',
    compare: 'Compare with the pre-test and the answer key',
    hide: 'Hide the comparison',
    pre: 'Pre-test',
    final: 'Final test',
    key: 'Answer key',
    empty: '(no answer)',
    point: 'Same idea, in my own words: 1 point',
    score: (n: number, t: number) => `${n} / ${t} points`,
    fill: 'To fill in',
    saved: 'Saved on this device',
  },
};

let uid = 0;
const nextId = () => `wb-${++uid}`;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function autoGrow(ta: HTMLTextAreaElement) {
  ta.style.height = 'auto';
  ta.style.height = `${Math.min(480, ta.scrollHeight + 2)}px`;
}

function field(chapter: string, key: string, label: string, opts: { rows?: number; placeholder?: string; single?: boolean } = {}) {
  const wrap = h('div', 'wb-field');
  const id = nextId();
  const lab = h('label', 'wb-field__label', label);
  lab.htmlFor = id;
  let input: HTMLTextAreaElement | HTMLInputElement;
  if (opts.single) {
    input = h('input', 'wb-field__input');
    (input as HTMLInputElement).type = 'text';
  } else {
    input = h('textarea', 'wb-field__input');
    (input as HTMLTextAreaElement).rows = opts.rows ?? 2;
  }
  input.id = id;
  if (opts.placeholder) input.placeholder = opts.placeholder;
  const v = wbGet(chapter, key);
  if (typeof v === 'string') input.value = v;
  input.addEventListener('input', () => {
    wbSet(chapter, key, input.value, false);
    if (input instanceof HTMLTextAreaElement) autoGrow(input);
    wrap.classList.toggle('has-value', !!input.value);
  });
  wrap.classList.toggle('has-value', !!input.value);
  wrap.append(lab, input);
  if (input instanceof HTMLTextAreaElement) requestAnimationFrame(() => autoGrow(input as HTMLTextAreaElement));
  return wrap;
}

function check(chapter: string, key: string, label: string, onChange?: (v: boolean) => void, cls = 'wb-check') {
  const lab = h('label', cls);
  const input = h('input');
  input.type = 'checkbox';
  input.checked = wbGet(chapter, key) === true;
  const box = h('span', 'wb-check__box');
  box.setAttribute('aria-hidden', 'true');
  const text = h('span', 'wb-check__text', label);
  input.addEventListener('change', () => {
    wbSet(chapter, key, input.checked);
    lab.classList.toggle('is-checked', input.checked);
    onChange?.(input.checked);
  });
  lab.classList.toggle('is-checked', input.checked);
  lab.append(input, box, text);
  return { el: lab, input };
}

/** Next element siblings until the next heading of the same level. */
function following(h3: Element, pred: (e: Element) => boolean): Element | null {
  let e = h3.nextElementSibling;
  while (e && e.tagName !== 'H3' && !e.classList.contains('part')) {
    if (pred(e)) return e;
    e = e.nextElementSibling;
  }
  return null;
}

function textOf(li: Element) {
  const c = li.cloneNode(true) as Element;
  c.querySelectorAll('.wb-field, .wb-check, .sr-only').forEach((x) => x.remove());
  return (c.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function enhanceChapter(root: HTMLElement, chapter: string, lang: Lang): () => void {
  const t = L[lang];
  const added: Element[] = [];
  const add = <T extends Element>(e: T) => {
    added.push(e);
    return e;
  };

  /* 1 · activities: done + timer ------------------------------------- */
  root.querySelectorAll<HTMLElement>('h3[data-activity]').forEach((h3) => {
    const id = h3.dataset.activity!;
    const bar = add(h('div', 'wb-activity'));
    const c = check(chapter, `act:${id}`, t.done, (v) => h3.classList.toggle('is-done', v), 'wb-check wb-check--activity');
    h3.classList.toggle('is-done', c.input.checked);
    bar.append(c.el);
    const minutes = Number(h3.dataset.minutes || 0);
    if (minutes > 0) {
      const b = h('button', 'wb-timer-btn');
      b.type = 'button';
      const icon = h('span', 'wb-timer-btn__icon');
      icon.setAttribute('aria-hidden', 'true');
      b.append(icon, document.createTextNode(t.timer(h3.dataset.time || `${minutes} min`)));
      b.addEventListener('click', () => focusTimer.start(chapter, (h3.textContent ?? '').trim(), minutes));
      bar.append(b);
    }
    h3.after(bar);
  });

  /* question texts (captured before any field is injected) */
  const preH3 = root.querySelector('h3[data-kind="pretest"]');
  const preList = preH3 ? (following(preH3, (e) => e.tagName === 'OL') as HTMLOListElement | null) : null;
  const questions = preList ? Array.from(preList.children).map(textOf) : [];

  /* 2 · pre-test answers --------------------------------------------- */
  if (preList) {
    preList.classList.add('wb-questions');
    Array.from(preList.children).forEach((li, i) => {
      li.append(add(field(chapter, `pre:${i}`, t.yourAnswer, { placeholder: t.answerHint })));
    });
  }

  /* 3 · learn resources ---------------------------------------------- */
  root.querySelectorAll<HTMLElement>('.resource').forEach((r, i) => {
    const row = add(h('div', 'wb-resource'));
    row.append(check(chapter, `res:${i}`, t.resourceDone, (v) => r.classList.toggle('is-read', v)).el);
    row.append(field(chapter, `say:${i}`, t.mySentence, { single: true }));
    r.classList.toggle('is-read', wbGet(chapter, `res:${i}`) === true);
    r.append(row);
  });

  /* 4 · practice experiments: three journal lines each ---------------- */
  root.querySelectorAll<HTMLElement>('.journal-wrap').forEach((jw) => {
    const labels = Array.from(jw.querySelectorAll('dt')).map((d) => (d.textContent ?? '').trim());
    const lineLabels = labels.length >= 4 ? labels.slice(1, 4) : labels.slice(-3);
    let steps = jw.nextElementSibling;
    while (steps && !steps.classList.contains('steps') && steps.tagName !== 'H3') steps = steps.nextElementSibling;
    if (!steps || !steps.classList.contains('steps')) return;
    steps.querySelectorAll(':scope > ol > li').forEach((li, i) => {
      const box = add(h('div', 'wb-journal'));
      lineLabels.forEach((lab, k) => box.append(field(chapter, `exp:${i}:${k}`, lab, { rows: 1 })));
      li.append(box);
    });
  });

  /* 5 · break / fix: cause + correction -------------------------------- */
  const bfH3 = root.querySelector('h3[data-kind="breakfix"]');
  const bfSteps = bfH3 ? following(bfH3, (e) => e.classList.contains('steps')) : null;
  bfSteps?.querySelectorAll(':scope > ol > li').forEach((li, i) => {
    const box = add(h('div', 'wb-journal wb-journal--two'));
    box.append(field(chapter, `fix:${i}:cause`, t.cause, { rows: 1 }), field(chapter, `fix:${i}:fix`, t.fix, { rows: 1 }));
    li.append(box);
  });

  /* 6 · blank eval sheets become fillable ------------------------------ */
  root.querySelectorAll('.kv').forEach((kv, ti) => {
    kv.querySelectorAll('.kv__row').forEach((row, ri) => {
      const dd = row.querySelector('dd');
      if (!dd || (dd.textContent ?? '').trim() !== '') return;
      const dt = row.querySelector('dt');
      const f = field(chapter, `kv:${ti}:${ri}`, `${(dt?.textContent ?? '').trim()} — ${t.fill}`, { rows: 1 });
      f.classList.add('wb-field--bare');
      dd.append(add(f));
    });
  });

  /* 7 · teach-back points become a checklist --------------------------- */
  const tbH3 = root.querySelector('h3[data-kind="teachback"]');
  const tbList = tbH3 ? following(tbH3, (e) => e.tagName === 'OL') : null;
  if (tbList) {
    tbList.classList.add('wb-ticklist');
    Array.from(tbList.children).forEach((li, i) => {
      const input = h('input', 'wb-tick');
      input.type = 'checkbox';
      input.checked = wbGet(chapter, `tb:${i}`) === true;
      input.setAttribute('aria-label', textOf(li));
      li.classList.toggle('is-checked', input.checked);
      input.addEventListener('change', () => {
        wbSet(chapter, `tb:${i}`, input.checked);
        li.classList.toggle('is-checked', input.checked);
      });
      li.prepend(add(input));
    });
  }

  /* 8 · review: the three lines ---------------------------------------- */
  const rvH3 = root.querySelector('h3[data-kind="review"]');
  const rvP = rvH3 ? following(rvH3, (e) => e.tagName === 'P') : null;
  if (rvP) {
    const box = add(h('div', 'wb-journal wb-journal--review'));
    t.reviewLabels.forEach((lab, k) => box.append(field(chapter, `rev:${k}`, lab, { rows: 1 })));
    rvP.after(box);
  }

  /* 9 · build notes ---------------------------------------------------- */
  root.querySelectorAll<HTMLElement>('h3[data-kind="build"]').forEach((b) => {
    const det = add(h('details', 'wb-notes'));
    const sum = h('summary', 'wb-notes__summary', t.notes);
    det.append(sum, field(chapter, `notes:${b.id}`, t.notes, { rows: 4 }));
    if (wbGet(chapter, `notes:${b.id}`)) det.open = true;
    // place it at the end of the build block (before the next h3)
    let e: Element | null = b.nextElementSibling;
    let last: Element = b;
    while (e && e.tagName !== 'H3' && !e.classList.contains('margin') && !e.classList.contains('part')) {
      last = e;
      e = e.nextElementSibling;
    }
    last.after(det);
  });

  /* 10 · final test sheet, scored against the answer key --------------- */
  const ftH3 = root.querySelector('h3[data-kind="finaltest"]');
  const ftP = ftH3 ? following(ftH3, (e) => e.tagName === 'P') : null;
  const keyItems = Array.from(root.querySelectorAll('.answers__item'));
  if (ftP && questions.length) {
    const sheet = add(h('div', 'wb-sheet'));
    sheet.append(h('p', 'wb-sheet__title', t.sheetTitle), h('p', 'wb-sheet__intro', t.sheetIntro));
    const ol = h('ol', 'wb-sheet__list');
    const compareBlocks: HTMLElement[] = [];
    const score = h('p', 'wb-sheet__score');
    score.setAttribute('aria-live', 'polite');
    const updateScore = () => {
      const n = questions.filter((_, i) => wbGet(chapter, `pt:${i}`) === true).length;
      score.textContent = t.score(n, questions.length);
    };
    questions.forEach((q, i) => {
      const li = h('li', 'wb-sheet__item');
      li.append(h('p', 'wb-sheet__q', q));
      li.append(field(chapter, `fin:${i}`, t.yourAnswer, { placeholder: t.answerHint }));
      const cmp = h('div', 'wb-compare');
      cmp.hidden = true;
      compareBlocks.push(cmp);
      li.append(cmp);
      ol.append(li);
    });
    const btn = h('button', 'btn btn--ghost-dark wb-sheet__btn', t.compare);
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? t.hide : t.compare;
      compareBlocks.forEach((cmp, i) => {
        cmp.hidden = !open;
        if (!open) return;
        cmp.replaceChildren();
        const row = (label: string, content: string | Node, cls: string) => {
          const r = h('div', `wb-compare__row ${cls}`);
          r.append(h('span', 'wb-compare__label', label));
          const body = h('div', 'wb-compare__body');
          if (typeof content === 'string') body.textContent = content;
          else body.append(content);
          r.append(body);
          return r;
        };
        const pre = wbGet(chapter, `pre:${i}`);
        const fin = wbGet(chapter, `fin:${i}`);
        cmp.append(row(t.pre, typeof pre === 'string' && pre ? pre : t.empty, 'is-pre'));
        cmp.append(row(t.final, typeof fin === 'string' && fin ? fin : t.empty, 'is-final'));
        const item = keyItems[i];
        if (item) {
          const c = (item.querySelector(':scope > div') ?? item).cloneNode(true) as HTMLElement;
          c.querySelector('.answers__q')?.remove();
          cmp.append(row(t.key, c, 'is-key'));
        }
        cmp.append(check(chapter, `pt:${i}`, t.point, updateScore).el);
      });
      updateScore();
    });
    updateScore();
    sheet.append(ol, btn, score);
    ftP.after(sheet);
  }

  return () => {
    added.forEach((e) => e.remove());
    root.querySelectorAll('.is-done, .is-read, .is-checked').forEach((e) => e.classList.remove('is-done', 'is-read', 'is-checked'));
  };
}
