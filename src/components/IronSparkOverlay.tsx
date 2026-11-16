import { useEffect, useState, type CSSProperties } from 'react';

interface SparkBurst {
  id: string;
  x: number;
  y: number;
  sparks: {
    key: string;
    angle: number;
    distance: number;
    length: number;
  }[];
}

export function IronSparkOverlay() {
  const [bursts, setBursts] = useState<SparkBurst[]>([]);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button');
      if (!btn || (btn as HTMLButtonElement).disabled) return;

      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const count = 8;
      const sparks = Array.from({ length: count }, (_, i) => {
        const baseAngle = (Math.PI * 2 * i) / count;
        return {
          key: `${id}_${i}`,
          angle: baseAngle + (Math.random() - 0.5) * 0.45,
          distance: 18 + Math.random() * 24,
          length: 6 + Math.random() * 6,
        };
      });

      setBursts((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY, sparks }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 420);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          style={{ left: burst.x, top: burst.y }}
          className="fixed -translate-x-1/2 -translate-y-1/2"
        >
          {burst.sparks.map((s) => {
            const dx = Math.round(Math.cos(s.angle) * s.distance);
            const dy = Math.round(Math.sin(s.angle) * s.distance);
            const deg = Math.round((s.angle * 180) / Math.PI);
            const style = {
              '--spark-dx': `${dx}px`,
              '--spark-dy': `${dy}px`,
              '--spark-rot': `${deg}deg`,
              width: `${s.length}px`,
            } as CSSProperties;

            return (
              <span
                key={s.key}
                style={style}
                className="iron-spark-fly absolute left-0 top-0 h-[2px] rounded-full bg-gradient-to-r from-[#fff3b8] via-[#d4af37] to-[#ea580c] shadow-[0_0_6px_rgba(234,88,12,0.85)]"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
