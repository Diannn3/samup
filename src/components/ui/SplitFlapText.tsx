import React, { useEffect, useMemo, useRef, useState } from 'react';

// Source inspiration:
// @url:`https://reactbits.dev/text-animations/split-flap-text`
// Repository:
// @url:`https://github.com/DavidHDev/react-bits`
// Adapted for SAM-UP; preserve applicable license notice.
// React Bits is MIT + Commons Clause licensed — free for use inside applications
// (https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md).
// Adaptations for SAM-UP:
//   - TypeScript conversion, Tailwind-free scoped CSS (global.css `.split-flap-text`)
//   - SSR-safe: server render outputs the settled first phrase; animation is
//     client-only and never required to read the content
//   - prefers-reduced-motion / touch devices: static settled text, no RAF loop

interface SplitFlapTextProps {
  phrases: string[];
  flipDuration?: number;
  stagger?: number;
  cycleDelay?: number;
  charset?: 'alpha' | 'alphanumeric' | 'numeric' | string;
  flipsPerChar?: number;
  fontSize?: number;
  loop?: boolean;
  padTo?: number;
  className?: string;
  'aria-label'?: string;
}

const CHARSETS: Record<string, string> = {
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  numeric: '0123456789'
};

const normalizePhrase = (phrase: string, width: number) =>
  String(phrase ?? '').padEnd(width, ' ').slice(0, width);

interface Tile {
  current: string;
  next: string;
  flipping: boolean;
  tick: number;
}

const createTiles = (phrase: string): Tile[] =>
  phrase.split('').map((char) => ({
    current: char,
    next: char,
    flipping: false,
    tick: 0
  }));

const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
};

export const SplitFlapText: React.FC<SplitFlapTextProps> = ({
  phrases,
  flipDuration = 0.12,
  stagger = 0.06,
  cycleDelay = 2600,
  charset = 'numeric',
  flipsPerChar = 6,
  fontSize = 22,
  loop = true,
  padTo = 0,
  className = '',
  'aria-label': ariaLabel
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const currentRef = useRef('');

  const width = useMemo(() => {
    const longest = phrases.reduce((m, p) => Math.max(m, p.length), 1);
    return Math.max(1, padTo, longest);
  }, [phrases, padTo]);

  const normalized = useMemo(
    () => phrases.map((p) => normalizePhrase(p, width)),
    [phrases, width]
  );

  // SSR + first paint: settled tiles of the first phrase — the readable fallback.
  const [tiles, setTiles] = useState<Tile[]>(() => createTiles(normalized[0] ?? ''));

  useEffect(() => {
    const clear = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      rafRef.current = null;
      timerRef.current = null;
    };

    clear();
    const first = normalized[0] ?? '';
    currentRef.current = first;
    setTiles(createTiles(first));

    if (normalized.length <= 1 || typeof window === 'undefined' || prefersReducedMotion) {
      return clear;
    }

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) return clear;

    let phraseIndex = 0;
    let cancelled = false;

    const flipMs = Math.max(40, flipDuration * 1000);
    const staggerMs = Math.max(0, stagger * 1000);
    const cycleMs = Math.max(1200, cycleDelay);
    const flips = Math.max(0, Math.floor(flipsPerChar));
    const activeCharset = CHARSETS[charset] ?? charset;

    const animateTo = (target: string): number => {
      const from = normalizePhrase(currentRef.current, width);
      const plans = target
        .split('')
        .map((targetChar, i) => {
          const fromChar = from[i] ?? ' ';
          if (fromChar === targetChar) return null;
          const sequence: string[] = [];
          for (let k = 0; k < flips; k += 1) {
            sequence.push(activeCharset.charAt(Math.floor(Math.random() * activeCharset.length)) ?? ' ');
          }
          sequence.push(targetChar);
          return { index: i, from: fromChar, target: targetChar, sequence, start: i * staggerMs, step: -1, done: false };
        })
        .filter(Boolean) as Array<{ index: number; from: string; target: string; sequence: string[]; start: number; step: number; done: boolean }>;

      if (!plans.length) {
        currentRef.current = target;
        setTiles(createTiles(target));
        return 0;
      }

      const startedAt = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startedAt;
        const updates: Array<{ index: number; current: string; next: string; done: boolean }> = [];
        let shouldContinue = false;

        plans.forEach((plan) => {
          const local = elapsed - plan.start;
          if (local < 0) { shouldContinue = true; return; }
          const step = Math.floor(local / flipMs);
          if (step < plan.sequence.length) {
            shouldContinue = true;
            if (step !== plan.step) {
              plan.step = step;
              updates.push({
                index: plan.index,
                current: step === 0 ? plan.from : plan.sequence[step - 1],
                next: plan.sequence[step],
                done: false
              });
            }
          } else if (!plan.done) {
            plan.done = true;
            updates.push({ index: plan.index, current: plan.target, next: plan.target, done: true });
          }
        });

        if (updates.length) {
          setTiles((prev) => {
            const next = [...prev];
            updates.forEach((u) => {
              const tile = next[u.index];
              if (tile) next[u.index] = { current: u.current, next: u.next, flipping: !u.done, tick: tile.tick + 1 };
            });
            return next;
          });
        }

        if (shouldContinue) rafRef.current = requestAnimationFrame(tick);
        else { currentRef.current = target; rafRef.current = null; }
      };

      rafRef.current = requestAnimationFrame(tick);
      return plans.reduce((m, p) => Math.max(m, p.start + p.sequence.length * flipMs), 0);
    };

    const scheduleNext = (delay: number) => {
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        const nextIndex = phraseIndex + 1;
        if (nextIndex >= normalized.length && !loop) return;
        phraseIndex = nextIndex % normalized.length;
        const dur = animateTo(normalized[phraseIndex]);
        scheduleNext(cycleMs + dur);
      }, delay);
    };

    scheduleNext(cycleMs);

    return () => { cancelled = true; clear(); };
  }, [normalized, width, loop, cycleDelay, flipDuration, stagger, flipsPerChar, charset, prefersReducedMotion]);

  const settled = tiles.map((t) => t.current).join('').trimEnd();

  return (
    <span
      className={`split-flap-text ${className}`.trim()}
      style={{ '--split-flap-font-size': `${fontSize}px` } as React.CSSProperties}
      role="text"
      aria-label={ariaLabel ?? settled}
    >
      {tiles.map((tile, i) => (
        <span className="split-flap-text__tile" aria-hidden="true" key={`${i}-${tiles.length}`}>
          <span className="split-flap-text__half split-flap-text__half--top">
            <span className="split-flap-text__char">{tile.current === ' ' ? '\u00A0' : tile.current}</span>
          </span>
          <span className="split-flap-text__half split-flap-text__half--bottom">
            <span className="split-flap-text__char">{tile.flipping ? tile.next : tile.current}</span>
          </span>
          {tile.flipping && (
            <>
              <span className="split-flap-text__flap split-flap-text__flap--front" key={`f-${i}-${tile.tick}`}>
                <span className="split-flap-text__char">{tile.current === ' ' ? '\u00A0' : tile.current}</span>
              </span>
              <span className="split-flap-text__flap split-flap-text__flap--back" key={`b-${i}-${tile.tick}`}>
                <span className="split-flap-text__char">{tile.next === ' ' ? '\u00A0' : tile.next}</span>
              </span>
            </>
          )}
        </span>
      ))}
    </span>
  );
};
