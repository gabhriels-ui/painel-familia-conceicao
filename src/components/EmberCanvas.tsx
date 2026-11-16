import { useEffect, useRef } from 'react';

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hot: boolean;
  phase: number;
}

interface SmokePlume {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

interface DistantFire {
  xFrac: number;
  yFrac: number;
  baseRadius: number;
  phase: number;
  speed: number;
}

export function EmberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const emberCount = width < 640 ? 26 : 48;
    const embers: EmberParticle[] = Array.from({ length: emberCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0.25 + Math.random() * 0.45,
      vy: -(0.4 + Math.random() * 0.95),
      size: 1.0 + Math.random() * 2.2,
      alpha: 0.2 + Math.random() * 0.55,
      hot: Math.random() > 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const smokeCount = width < 640 ? 7 : 12;
    const smokes: SmokePlume[] = Array.from({ length: smokeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0.08 + Math.random() * 0.14,
      vy: -(0.12 + Math.random() * 0.2),
      radius: 75 + Math.random() * 110,
      alpha: 0.03 + Math.random() * 0.045,
      phase: Math.random() * Math.PI * 2,
    }));

    const fires: DistantFire[] = [
      { xFrac: 0.14, yFrac: 0.92, baseRadius: 180, phase: 0.2, speed: 0.045 },
      { xFrac: 0.52, yFrac: 0.96, baseRadius: 230, phase: 2.1, speed: 0.032 },
      { xFrac: 0.86, yFrac: 0.9, baseRadius: 190, phase: 4.4, speed: 0.052 },
    ];

    let windTime = 0;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      windTime += 0.012;
      const windGust = Math.sin(windTime) * 0.32 + 0.22;

      // 1. Clarões distantes de tochas e fogo de cerco no horizonte
      for (const f of fires) {
        f.phase += f.speed;
        const pulse = 0.72 + Math.sin(f.phase) * 0.18 + Math.sin(f.phase * 2.7) * 0.1;
        const fx = width * f.xFrac;
        const fy = height * f.yFrac;
        const r = f.baseRadius * pulse;
        const grad = ctx.createRadialGradient(fx, fy, 4, fx, fy, r);
        grad.addColorStop(0, `rgba(185, 65, 18, ${(0.16 * pulse).toFixed(3)})`);
        grad.addColorStop(0.45, `rgba(127, 29, 29, ${(0.09 * pulse).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(20, 21, 23, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Fumaça densa de cerco subindo lentamente
      for (const s of smokes) {
        s.phase += 0.008;
        s.x += s.vx + windGust * 0.35;
        s.y += s.vy;

        if (s.y < -s.radius) {
          s.y = height + s.radius;
          s.x = Math.random() * width;
        }
        if (s.x > width + s.radius) s.x = -s.radius;

        const grad = ctx.createRadialGradient(s.x, s.y, s.radius * 0.1, s.x, s.y, s.radius);
        grad.addColorStop(0, `rgba(38, 40, 44, ${s.alpha.toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(24, 24, 27, ${(s.alpha * 0.55).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(20, 21, 23, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Brasas incandescentes levadas pelo vento com rastro sutil
      for (const p of embers) {
        p.phase += 0.035;
        const dx = p.vx + windGust + Math.sin(p.phase) * 0.25;
        const dy = p.vy;
        const prevX = p.x;
        const prevY = p.y;
        p.x += dx;
        p.y += dy;

        if (p.y < -16) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -16) p.x = width + 12;
        if (p.x > width + 16) p.x = -12;

        const flicker = 0.65 + Math.sin(p.phase * 2.1) * 0.35;
        const alpha = p.alpha * flicker;

        ctx.strokeStyle = p.hot
          ? `rgba(234, 88, 12, ${(alpha * 0.65).toFixed(3)})`
          : `rgba(197, 155, 39, ${(alpha * 0.55).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.8, p.size * 0.7);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x - dx * 2.2, p.y - dy * 2.2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.hot
          ? `rgba(251, 146, 60, ${alpha.toFixed(3)})`
          : `rgba(223, 193, 104, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      animId = window.requestAnimationFrame(tick);
    };

    animId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
