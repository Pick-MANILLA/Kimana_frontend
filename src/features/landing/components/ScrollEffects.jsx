'use client';

import { useEffect, useRef } from 'react';
import './ScrollEffects.css';

/*
 * Landing-page scroll effects, all driven from one place:
 *   - [data-reveal] elements animate in the first time they scroll into view
 *     (variants via the attribute value: "up" (default), "left", "right", "zoom";
 *     stagger with style={{ '--rv-i': n }})
 *   - a thin progress bar along the top tracks how far down the page you are
 *   - the hero exposes --hero-p (0 → 1 over its own height) for its parallax
 *
 * Content is only hidden once this has mounted (html.rv-ready), so nothing is
 * lost without JS, and prefers-reduced-motion skips the lot.
 */
export function ScrollEffects() {
  const barRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;

    // ---- Reveal on scroll ----
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    root.classList.add('rv-ready');

    // ---- Progress bar + hero parallax, one rAF per scroll burst ----
    const hero = document.querySelector('.hero-scene');
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      if (hero) {
        const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
        hero.style.setProperty('--hero-p', p.toFixed(4));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.classList.remove('rv-ready');
    };
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
