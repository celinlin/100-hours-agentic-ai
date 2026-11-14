'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onVeil, prefersReducedMotion } from '../lib/transition';

/**
 * Full-screen layer used for the two signature transitions:
 *  - entering a chapter: warm light grows from the clicked window into the paper of the reading room;
 *  - leaving a chapter: a brief dusk veil before the façade reappears.
 * Pages call revealPage() when mounted; a safety timer always lifts the veil.
 */
export default function Veil() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let safety: ReturnType<typeof setTimeout> | undefined;
    let navTimer: ReturnType<typeof setTimeout> | undefined;
    const el = ref.current!;

    const lift = () => {
      if (!el.classList.contains('is-on')) return;
      el.classList.add('is-lifting');
      setTimeout(() => {
        el.className = 'veil';
        el.style.transform = '';
      }, 420);
    };

    const off = onVeil((cmd) => {
      clearTimeout(safety);
      if (cmd.type === 'reveal') {
        // let the new page paint once before lifting
        requestAnimationFrame(() => requestAnimationFrame(lift));
        return;
      }
      if (prefersReducedMotion()) {
        router.push(cmd.href);
        return;
      }
      if (cmd.type === 'enter') {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const r = cmd.rect ?? new DOMRect(vw / 2 - 40, vh / 2 - 40, 80, 80);
        el.className = 'veil veil--light is-on is-start';
        el.style.transform = `translate(${r.left}px, ${r.top}px) scale(${r.width / vw}, ${r.height / vh})`;
        // force layout, then expand
        void el.offsetWidth;
        el.classList.remove('is-start');
        el.style.transform = 'translate(0px, 0px) scale(1, 1)';
        navTimer = setTimeout(() => router.push(cmd.href), 330);
      } else {
        el.className = 'veil veil--dusk is-on is-start';
        el.style.transform = '';
        void el.offsetWidth;
        el.classList.remove('is-start');
        navTimer = setTimeout(() => router.push(cmd.href), 220);
      }
      safety = setTimeout(lift, 2600);
    });
    return () => {
      off();
      clearTimeout(safety);
      clearTimeout(navTimer);
    };
  }, [router]);

  return <div ref={ref} className="veil" aria-hidden="true" />;
}
