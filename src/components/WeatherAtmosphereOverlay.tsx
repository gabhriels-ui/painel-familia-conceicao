import { useMemo, type CSSProperties } from 'react';
import type { WeatherCondition } from '../types/weather';

interface WeatherAtmosphereOverlayProps {
  condition: WeatherCondition;
}

interface SnowFlakeSpec {
  id: number;
  leftPct: number;
  sizePx: number;
  opacity: number;
  durationSec: number;
  delaySec: number;
  driftPx: number;
}

export function WeatherAtmosphereOverlay({ condition }: WeatherAtmosphereOverlayProps) {
  const snowFlakes = useMemo<SnowFlakeSpec[]>(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const seedA = ((i * 37 + 13) % 100) / 100;
      const seedB = ((i * 53 + 29) % 100) / 100;
      const seedC = ((i * 71 + 7) % 100) / 100;
      return {
        id: i,
        leftPct: Math.round((seedA * 96 + 2) * 10) / 10,
        sizePx: 2.5 + (i % 4) * 1.1,
        opacity: 0.42 + seedB * 0.45,
        durationSec: 7.5 + seedC * 6.5,
        delaySec: -(seedB * 11),
        driftPx: Math.round((seedA - 0.5) * 90),
      };
    });
  }, []);

  const isRain = condition === 'rain';
  const isSnow = condition === 'snow';
  const isMist = condition === 'mist';
  const isClear = condition === 'clear';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[15] overflow-hidden"
    >
      {/* Brisa Dourada · Céu Limpo */}
      <div
        className={`weather-layer-fade weather-clear-glow absolute inset-0 ${
          isClear ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Chuva Tática / Tempestade (camadas CSS em parallax GPU) */}
      <div
        className={`weather-layer-fade absolute inset-0 ${
          isRain ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="weather-rain-tint absolute inset-0" />
        <div className="weather-rain-tilt-frame">
          <div className="weather-rain-sheet-far" />
          <div className="weather-rain-sheet-near" />
        </div>
      </div>

      {/* Névoa de Cerco (bancos de névoa em radial-gradient com translate3d) */}
      <div
        className={`weather-layer-fade absolute inset-0 ${
          isMist ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="weather-mist-tint absolute inset-0" />
        <div className="weather-mist-bank weather-mist-bank-1" />
        <div className="weather-mist-bank weather-mist-bank-2" />
        <div className="weather-mist-bank weather-mist-bank-3" />
      </div>

      {/* Neve das Terras Altas (partículas GPU transform/opacity) */}
      <div
        className={`weather-layer-fade absolute inset-0 ${
          isSnow ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="weather-snow-tint absolute inset-0" />
        {snowFlakes.map((flake) => (
          <span
            key={flake.id}
            className="weather-snow-flake"
            style={
              {
                left: `${flake.leftPct}%`,
                width: `${flake.sizePx}px`,
                height: `${flake.sizePx}px`,
                '--snow-opacity': flake.opacity,
                '--snow-dur': `${flake.durationSec}s`,
                '--snow-delay': `${flake.delaySec}s`,
                '--snow-dx': `${flake.driftPx}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
