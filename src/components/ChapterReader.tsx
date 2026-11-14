'use client';

import Link from 'next/link';
import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import { dict, routes, type Lang } from '../lib/i18n';
import type { TocEntry } from '../lib/markdown';
import { useProgress, useHydrated, statusOf, setStatus, visitChapter, saveScroll, getProgress, nav } from '../lib/progress';
import { leaveToHotel, enterChapter, isPlainClick, revealPage } from '../lib/transition';
import { enhanceChapter } from '../lib/enhance';
import { useWorkbookVersion, wbGet } from '../lib/workbook';
import FocusTimer from './FocusTimer';

const RL = {
  fr: {
    focus: 'Mode focus',
    focusOff: 'Tout afficher',
    prevPart: 'Partie précédente',
    nextPart: 'Partie suivante',
    activities: (d: number, t: number) => `${d} / ${t} activités faites`,
    allDone: 'Toutes les activités de l’étape sont faites. Tu peux la marquer comme terminée.',
  },
  en: {
    focus: 'Focus mode',
    focusOff: 'Show everything',
    prevPart: 'Previous part',
    nextPart: 'Next part',
    activities: (d: number, t: number) => `${d} / ${t} activities done`,
    allDone: 'Every activity in this step is done. You can mark it as completed.',
  },
};

export interface ReaderChapter {
  id: string;
  title: string;
  block: string;
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
  minutes: number;
}

interface Neighbour {
  id: string;
  title: string;
}

export default function ChapterReader({
  lang,
  chapter,
  prev,
  next,
  total,
}: {
  lang: Lang;
  chapter: ReaderChapter;
  prev: Neighbour | null;
  next: Neighbour | null;
  total: number;
}) {
  const t = dict[lang];
  const progress = useProgress();
  const hydrated = useHydrated();
  const status = hydrated ? statusOf(progress, chapter.id) : 'not_started';
  const articleRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const tocDialog = useRef<HTMLDialogElement>(null);
  const r = RL[lang];
  useWorkbookVersion();
  const [focusPart, setFocusPart] = useState<string | null>(null);
  const parts = chapter.toc.filter((e) => e.depth === 2);
  const activities = chapter.toc.filter((e) => e.activity);
  const isActDone = (id: string) => hydrated && wbGet(chapter.id, `act:${id}`) === true;
  const actDone = activities.filter((a) => isActDone(a.activity!)).length;
  const partOf = (id: string) => {
    let cur: string | null = null;
    for (const e of chapter.toc) {
      if (e.depth === 2) cur = e.id;
      if (e.id === id) return cur;
    }
    return cur;
  };
  const partStats = (pid: string) => {
    let inPart = false;
    let total = 0;
    let done = 0;
    for (const e of chapter.toc) {
      if (e.depth === 2) inPart = e.id === pid;
      else if (inPart && e.activity) {
        total++;
        if (isActDone(e.activity)) done++;
      }
    }
    return { total, done };
  };

  // workbook: input fields woven into the chapter
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    return enhanceChapter(root, chapter.id, lang);
  }, [chapter.id, lang]);

  // focus mode: show one part at a time
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    root.classList.toggle('is-focus', !!focusPart);
    root.querySelectorAll<HTMLElement>('.part-section').forEach((sec) => {
      sec.classList.toggle('is-current', sec.dataset.part === focusPart);
    });
  }, [focusPart]);

  const goPart = (pid: string) => {
    setFocusPart(pid);
    requestAnimationFrame(() => document.getElementById(pid)?.scrollIntoView({ block: 'start' }));
  };
  const toggleFocus = () => {
    if (focusPart) {
      const id = focusPart;
      setFocusPart(null);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    } else {
      goPart(partOf(activeId) ?? parts[0]?.id ?? 'plan');
    }
  };
  const focusIdx = focusPart ? parts.findIndex((p) => p.id === focusPart) : -1;

  // arrival: record the visit, restore position, lift the veil
  useEffect(() => {
    visitChapter(chapter.id);
    const resume = nav.takeResume();
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const h = document.documentElement;
    if (hash && document.getElementById(hash)) {
      document.getElementById(hash)!.scrollIntoView({ block: 'start' });
    } else if (resume === chapter.id) {
      const r = getProgress().chapters[chapter.id]?.scroll ?? 0;
      window.scrollTo({ top: r * (h.scrollHeight - h.clientHeight), behavior: 'instant' as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    revealPage();
  }, [chapter.id]);

  // reading progress + save position
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const ratio = Math.min(1, Math.max(0, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)));
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
      saveScroll(chapter.id, ratio);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [chapter.id]);

  // active section in the table of contents
  useEffect(() => {
    const ids = chapter.toc.map((e) => e.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      () => {
        // the last heading above 30% of the viewport is the current one
        const line = window.innerHeight * 0.3;
        let cur = els[0].id;
        for (const el of els) {
          if (el.getBoundingClientRect().top <= line) cur = el.id;
          else break;
        }
        setActiveId(cur);
      },
      { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapter.toc]);

  // copy buttons + gentle reveal of blocks
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.js-copy');
      if (!btn) return;
      const box = btn.closest('.code, .prompt');
      const target = box?.querySelector(btn.dataset.copyTarget || 'pre') as HTMLElement | null;
      if (!target) return;
      const text = target.innerText.replace(/\n{3,}/g, '\n\n').trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      const label = btn.textContent;
      btn.textContent = t.copied;
      btn.classList.add('is-done');
      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove('is-done');
      }, 1600);
    };
    root.addEventListener('click', onClick);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io: IntersectionObserver | null = null;
    if (!reduce && 'IntersectionObserver' in window) {
      const blocks = root.querySelectorAll<HTMLElement>('.part-section > *');
      const vh = window.innerHeight;
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('is-in');
              io?.unobserve(en.target);
            }
          }),
        { rootMargin: '0px 0px -6% 0px' },
      );
      blocks.forEach((b) => {
        if (b.getBoundingClientRect().top > vh) {
          b.classList.add('rv');
          io!.observe(b);
        }
      });
    }
    return () => {
      root.removeEventListener('click', onClick);
      io?.disconnect();
    };
  }, [chapter.id, t.copied]);

  useEffect(() => {
    const d = tocDialog.current;
    if (!d) return;
    if (tocOpen && !d.open) d.showModal();
    if (!tocOpen && d.open) d.close();
  }, [tocOpen]);

  const complete = () => {
    setStatus(chapter.id, 'completed');
    nav.setCelebrate(chapter.id);
    setJustDone(true);
  };
  const undo = () => {
    setStatus(chapter.id, 'in_progress');
    nav.setCelebrate(null);
    setJustDone(false);
  };

  const backToHotel = (e: React.MouseEvent) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    nav.setFocusWindow(chapter.id);
    leaveToHotel(routes.chapter(lang, chapter.id));
  };

  const goChapter = (e: React.MouseEvent, id: string) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    enterChapter(null, routes.chapter(lang, id));
  };

  const tocList = (onPick?: () => void) => (
    <ol className="toc__list">
      {chapter.toc.map((e) => (
        <li key={e.id} className={`toc__item toc__item--${e.depth}${activeId === e.id ? ' is-active' : ''}`}>
          <a
            href={`#${e.id}`}
            aria-current={activeId === e.id ? 'location' : undefined}
            onClick={() => {
              if (focusPart) {
                const p = partOf(e.id);
                if (p && p !== focusPart) setFocusPart(p);
              }
              onPick?.();
            }}
          >
            {e.depth === 2 && e.mark && <span className="toc__mark">{e.mark}</span>}
            {e.activity && <span className={`toc__tick${isActDone(e.activity) ? ' is-done' : ''}`} aria-hidden="true" />}
            <span className="toc__label">{e.title}</span>
            {e.depth === 2 && partStats(e.id).total > 0 && (
              <span className="toc__count">
                {partStats(e.id).done}/{partStats(e.id).total}
              </span>
            )}
          </a>
        </li>
      ))}
    </ol>
  );

  const completeButton = (compact = false) =>
    status === 'completed' ? (
      <div className={`done${compact ? ' done--compact' : ''}${justDone ? ' is-fresh' : ''}`} role="status">
        <span className="done__seal" aria-hidden="true" />
        <span className="done__text">
          <strong>{t.markedCompleted}</strong>
          {!compact && <span>{t.completedNote}</span>}
        </span>
        <button type="button" className="link-btn" onClick={undo}>
          {t.undoCompleted}
        </button>
      </div>
    ) : (
      <button type="button" className={`btn btn--brass${compact ? ' btn--small' : ''}`} onClick={complete}>
        {t.markCompleted}
      </button>
    );

  return (
    <div className="reader">
      <div className="reader__progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <div className="reader__bar">
        <Link href={routes.chapter(lang, chapter.id)} className="back-link" onClick={backToHotel}>
          <span className="back-link__arrow" aria-hidden="true" />
          {lang === 'fr' ? 'Retour à la pièce' : 'Back to the room'}
        </Link>
        <div className="reader__tools">
          <button type="button" className={`reader__focus-btn${focusPart ? ' is-on' : ''}`} aria-pressed={!!focusPart} onClick={toggleFocus}>
            {focusPart ? r.focusOff : r.focus}
          </button>
          <button type="button" className="reader__toc-btn" onClick={() => setTocOpen(true)} aria-haspopup="dialog">
            {t.contents}
          </button>
        </div>
      </div>

      <header className="cover">
        <div className="cover__inner">
          <p className="cover__kicker">
            <span className="cover__num">
              {t.chapter} {chapter.id}
            </span>
            <span className="cover__of">
              {t.of} {String(total).padStart(2, '0')}
            </span>
            <span className={`cover__status is-${status}`}>{t.status[status]}</span>
          </p>
          <h1 className="cover__title">{chapter.title}</h1>
          <p className="cover__block">
            <span>{chapter.block}.</span> <span dangerouslySetInnerHTML={{ __html: chapter.lede }} />
          </p>
          {chapter.questionHtml && (
            <p className="cover__question">
              <span dangerouslySetInnerHTML={{ __html: chapter.questionHtml }} />
            </p>
          )}
          <div className="cover__lists">
            <section>
              <h2 className="cover__list-title">{chapter.outcomesTitle}</h2>
              <ul>
                {chapter.outcomes.map((o, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: o }} />
                ))}
              </ul>
            </section>
            <section>
              <h2 className="cover__list-title">{chapter.needsTitle}</h2>
              <ul>
                {chapter.needs.map((o, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: o }} />
                ))}
              </ul>
            </section>
          </div>
          {chapter.minimum && <p className="box box--minimum cover__minimum" dangerouslySetInnerHTML={{ __html: chapter.minimum }} />}
          <div className="cover__foot">
            {chapter.footnote && <p dangerouslySetInnerHTML={{ __html: chapter.footnote }} />}
            {chapter.stats && <p className="cover__stats">{chapter.stats}</p>}
          </div>
        </div>
      </header>

      <div className="reader__layout">
        <div className="reader__main">
          <Article html={chapter.html} articleRef={articleRef} />
          {focusPart && (
            <nav className="focus-nav" aria-label={r.focus}>
              {focusIdx > 0 ? (
                <button type="button" className="focus-nav__btn" onClick={() => goPart(parts[focusIdx - 1].id)}>
                  <span className="focus-nav__dir">{r.prevPart}</span>
                  <span className="focus-nav__title">
                    {parts[focusIdx - 1].mark} · {parts[focusIdx - 1].title}
                  </span>
                </button>
              ) : (
                <span />
              )}
              {focusIdx < parts.length - 1 ? (
                <button type="button" className="focus-nav__btn focus-nav__btn--next" onClick={() => goPart(parts[focusIdx + 1].id)}>
                  <span className="focus-nav__dir">{r.nextPart}</span>
                  <span className="focus-nav__title">
                    {parts[focusIdx + 1].mark} · {parts[focusIdx + 1].title}
                  </span>
                </button>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
        <aside className="toc" aria-label={t.onThisPage}>
          <div className="toc__inner">
            <p className="toc__title">{t.onThisPage}</p>
            {activities.length > 0 && (
              <p className="toc__progress">
                <span className="toc__progress-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${actDone / activities.length})` }} />
                </span>
                {r.activities(actDone, activities.length)}
              </p>
            )}
            <nav aria-label={t.contents}>{tocList()}</nav>
            <div className="toc__complete">{completeButton(true)}</div>
          </div>
        </aside>
      </div>

      <section className="finale" aria-label={t.markCompleted}>
        <div className="finale__inner">
          {activities.length > 0 && actDone === activities.length && status !== 'completed' && <p className="finale__nudge">{r.allDone}</p>}
          <div className="finale__complete">{completeButton()}</div>
          <nav className="pager" aria-label={lang === 'fr' ? 'Étapes voisines' : 'Neighbouring steps'}>
            {prev ? (
              <Link href={routes.chapter(lang, prev.id)} className="pager__link pager__link--prev" onClick={(e) => goChapter(e, prev.id)}>
                <span className="pager__dir">{t.previous}</span>
                <span className="pager__title">
                  <span className="pager__num">{prev.id}</span> {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={routes.chapter(lang, next.id)} className="pager__link pager__link--next" onClick={(e) => goChapter(e, next.id)}>
                <span className="pager__dir">{t.next}</span>
                <span className="pager__title">
                  <span className="pager__num">{next.id}</span> {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
          <div className="finale__links">
            <Link href={routes.chapter(lang, chapter.id)} className="btn btn--ghost-dark" onClick={backToHotel}>
              {lang === 'fr' ? 'Retour à la pièce' : 'Back to the room'}
            </Link>
            <Link href={routes.progress(lang)} className="link-quiet">
              {t.myProgress}
            </Link>
          </div>
        </div>
      </section>

      <FocusTimer lang={lang} />

      <dialog
        ref={tocDialog}
        className="sheet sheet--paper"
        aria-label={t.contents}
        onClose={() => setTocOpen(false)}
        onClick={(e) => {
          if (e.target === tocDialog.current) setTocOpen(false);
        }}
      >
        <div className="sheet__head">
          <p className="sheet__title">
            {t.chapter} {chapter.id} · {t.contents}
          </p>
          <button type="button" className="sheet__close" onClick={() => setTocOpen(false)}>
            {t.close}
          </button>
        </div>
        <div className="sheet__body">
          <nav aria-label={t.contents}>{tocList(() => setTocOpen(false))}</nav>
          <div className="toc__complete">{completeButton(true)}</div>
        </div>
      </dialog>
    </div>
  );
}

/** The chapter body never re-renders: the workbook layer adds fields to its DOM. */
const Article = memo(function Article({ html, articleRef }: { html: string; articleRef: RefObject<HTMLElement | null> }) {
  return <article className="prose" ref={articleRef} id="main" tabIndex={-1} dangerouslySetInnerHTML={{ __html: html }} />;
});
