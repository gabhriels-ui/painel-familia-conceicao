import { useEffect } from 'react';

function resetCardTilt(card: HTMLElement | null) {
  if (!card) return;
  card.removeAttribute('data-tilting');
  card.style.setProperty('--tilt-rx', '0deg');
  card.style.setProperty('--tilt-ry', '0deg');
  card.style.setProperty('--tilt-shadow-x', '0px');
  card.style.setProperty('--tilt-shadow-y', '20px');
  card.style.setProperty('--glare-x', '50%');
  card.style.setProperty('--glare-y', '12%');
  card.style.setProperty('--glare-opacity', '0.11');
  card.style.setProperty('--rim-glow', '0.12');
}

function applyCardTilt(card: HTMLElement, clientX: number, clientY: number) {
  const rect = card.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const rawNx = (clientX - rect.left) / rect.width - 0.5;
  const rawNy = (clientY - rect.top) / rect.height - 0.5;
  const nx = Math.max(-0.5, Math.min(0.5, rawNx));
  const ny = Math.max(-0.5, Math.min(0.5, rawNy));

  const isSubtle = card.dataset.tiltSubtle === 'true';
  const maxDeg = isSubtle
    ? 2.6
    : Math.min(9.5, Math.max(3.6, 2600 / Math.max(rect.width, rect.height)));

  const rx = (-ny * 2 * maxDeg).toFixed(2);
  const ry = (nx * 2 * maxDeg).toFixed(2);

  // Sombra tridimensional oposta ao ângulo da luz de tocha dourada (#eab308)
  const shadowX = (-nx * 28).toFixed(1);
  const shadowY = (20 - ny * 22).toFixed(1);

  const glareX = ((nx + 0.5) * 100).toFixed(1);
  const glareY = ((ny + 0.5) * 100).toFixed(1);

  card.setAttribute('data-tilting', 'true');
  card.style.setProperty('--tilt-rx', `${rx}deg`);
  card.style.setProperty('--tilt-ry', `${ry}deg`);
  card.style.setProperty('--tilt-shadow-x', `${shadowX}px`);
  card.style.setProperty('--tilt-shadow-y', `${shadowY}px`);
  card.style.setProperty('--glare-x', `${glareX}%`);
  card.style.setProperty('--glare-y', `${glareY}%`);
  card.style.setProperty('--glare-opacity', isSubtle ? '0.15' : '0.24');
  card.style.setProperty('--rim-glow', isSubtle ? '0.18' : '0.28');
}

export function useGlobalTilt3D() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let activeCard: HTMLElement | null = null;
    let rafId: number | null = null;
    let pendingCard: HTMLElement | null = null;
    let pendingX = 0;
    let pendingY = 0;

    const flush = () => {
      rafId = null;
      if (activeCard && activeCard !== pendingCard) {
        resetCardTilt(activeCard);
      }
      if (pendingCard) {
        activeCard = pendingCard;
        applyCardTilt(pendingCard, pendingX, pendingY);
      } else {
        activeCard = null;
      }
    };

    const scheduleUpdate = (card: HTMLElement | null, x: number, y: number) => {
      pendingCard = card;
      pendingX = x;
      pendingY = y;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(flush);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'CANVAS') {
        if (activeCard) scheduleUpdate(null, 0, 0);
        return;
      }
      const card = target?.closest('.state-card') as HTMLElement | null;
      if (!card) {
        if (activeCard) scheduleUpdate(null, 0, 0);
        return;
      }
      scheduleUpdate(card, e.clientX, e.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'CANVAS') {
        if (activeCard) scheduleUpdate(null, 0, 0);
        return;
      }
      const card = target?.closest('.state-card') as HTMLElement | null;
      if (card) {
        scheduleUpdate(card, e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
      if (el?.tagName === 'CANVAS') {
        if (activeCard) scheduleUpdate(null, 0, 0);
        return;
      }
      const card = el?.closest('.state-card') as HTMLElement | null;
      if (!card) {
        if (activeCard) scheduleUpdate(null, 0, 0);
        return;
      }
      scheduleUpdate(card, touch.clientX, touch.clientY);
    };

    const handleRelease = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      pendingCard = null;
      resetCardTilt(activeCard);
      activeCard = null;
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        handleRelease();
      }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('pointerup', handleRelease, { passive: true });
    document.addEventListener('pointercancel', handleRelease, { passive: true });
    document.addEventListener('touchend', handleRelease, { passive: true });
    document.addEventListener('touchcancel', handleRelease, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('blur', handleRelease);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('pointerup', handleRelease);
      document.removeEventListener('pointercancel', handleRelease);
      document.removeEventListener('touchend', handleRelease);
      document.removeEventListener('touchcancel', handleRelease);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('blur', handleRelease);
      resetCardTilt(activeCard);
    };
  }, []);
}
