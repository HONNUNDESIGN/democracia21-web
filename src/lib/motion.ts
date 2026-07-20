/**
 * Sistema de motion D21 — Lenis + GSAP compartidos por toda la home.
 * Se inicializa una vez desde Layout.astro. Los componentes se cuelgan
 * de `window.__d21` o importan estas funciones en sus <script>.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

export function initMotion(): { lenis: Lenis | null } {
  if (prefersReducedMotion()) {
    // Sin smooth scroll; ScrollTrigger funciona con scroll nativo.
    ScrollTrigger.refresh();
    return { lenis: null };
  }
  if (lenis) return { lenis };

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Lenis ↔ ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return { lenis };
}

export function scrollTo(target: string | number) {
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else if (typeof target === 'string')
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

export function stopScroll() {
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}

export function startScroll() {
  lenis?.start();
  document.documentElement.style.overflow = '';
}

/**
 * SplitText casero (evita plugin de pago): divide un elemento en
 * <span class="line"><span class="word">…</span></span> por palabras,
 * agrupadas en líneas medidas tras el layout.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? '';
  const words = text.split(/\s+/).filter(Boolean);
  el.textContent = '';
  const wordEls = words.map((w) => {
    const span = document.createElement('span');
    span.className = 'inline-block will-change-transform';
    span.textContent = w;
    el.appendChild(span);
    el.appendChild(document.createTextNode(' '));
    return span;
  });
  // Agrupa por offsetTop en "líneas" para stagger por línea
  const lines: HTMLElement[][] = [];
  let currentTop: number | null = null;
  for (const w of wordEls) {
    if (w.offsetTop !== currentTop) {
      currentTop = w.offsetTop;
      lines.push([]);
    }
    lines[lines.length - 1].push(w);
  }
  return lines.map((lineWords) => {
    // wrapper virtual: devolvemos el primer word como ancla; los staggers
    // se hacen sobre los words con gsap.utils
    const marker = lineWords[0];
    marker.dataset.line = 'true';
    return marker;
  });
}

export { gsap, ScrollTrigger };
