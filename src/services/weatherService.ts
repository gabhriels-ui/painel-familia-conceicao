import type { TabId } from '../types/chronicles';
import type {
  LiveWeatherReading,
  StrategicWeatherResolution,
  WeatherCondition,
  WeatherMode,
} from '../types/weather';
import type { Arca1CostRisk } from '../utils/formatters';

export interface StrategicWeatherContext {
  weatherMode: WeatherMode;
  liveWeather: LiveWeatherReading | null;
  isShieldVigilActive: boolean;
  enemyFrontActive: boolean;
  arenaOpen: boolean;
  victoryModalOpen: boolean;
  activeTab: TabId;
  feudsConquered: number;
  arca1CostRiskLevel: Arca1CostRisk['level'];
}

export async function fetchLocalWeather(
  lat: number,
  lon: number
): Promise<LiveWeatherReading> {
  const res = await fetch(
    `/api/weather?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`
  );
  const data = (await res.json().catch(() => ({}))) as LiveWeatherReading & {
    error?: string | { status?: string; message?: string };
  };

  if (
    res.status === 429 ||
    (typeof data.error === 'object' && data.error?.status === 'RESOURCE_EXHAUSTED')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    throw new Error('Cota da Google Maps Platform atingida no momento.');
  }

  if (!res.ok) {
    const errText =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message || 'Não foi possível obter os dados climáticos.';
    throw new Error(errText);
  }

  return data;
}

export function getWeatherConditionTitle(condition: WeatherCondition): string {
  switch (condition) {
    case 'rain':
      return 'Chuva Tática';
    case 'snow':
      return 'Neve da Vigília';
    case 'mist':
      return 'Névoa de Cerco';
    default:
      return 'Céu Limpo';
  }
}

export function resolveEffectiveWeather(
  ctx: StrategicWeatherContext
): StrategicWeatherResolution {
  // Seleção manual direta pelo Comandante
  if (ctx.weatherMode !== 'auto') {
    const labels: Record<WeatherCondition, { badge: string; detail: string }> = {
      clear: {
        badge: 'Céu Limpo (Manual)',
        detail: 'Atmosfera serena ativada pelo Comandante.',
      },
      mist: {
        badge: 'Névoa de Cerco (Manual)',
        detail: 'Neblina nas muralhas ativada manualmente.',
      },
      rain: {
        badge: 'Chuva de Campanha (Manual)',
        detail: 'Tempestade tática ativada manualmente.',
      },
      snow: {
        badge: 'Neve das Terras Altas (Manual)',
        detail: 'Clima invernal ativado manualmente.',
      },
    };
    const info = labels[ctx.weatherMode];
    return {
      effectiveCondition: ctx.weatherMode,
      origin: 'manual',
      badgeLabel: info.badge,
      detailLabel: info.detail,
    };
  }

  // Evento estratégico 1: Celebração de Vitória abre os céus
  if (ctx.victoryModalOpen) {
    return {
      effectiveCondition: 'clear',
      origin: 'strategic-event',
      badgeLabel: 'Sol da Vitória',
      detailLabel: 'A conquista dispersou as nuvens sobre o reino.',
    };
  }

  // Evento estratégico 2: Inimigo no Front / Risco Crítico / Arena de Combate -> Chuva / Tempestade
  if (ctx.enemyFrontActive) {
    return {
      effectiveCondition: 'rain',
      origin: 'strategic-event',
      badgeLabel: 'Tempestade · Inimigo no Front',
      detailLabel: 'Gasto fora do plano detectado — vigília sob chuva fechada.',
    };
  }

  if (ctx.arenaOpen) {
    return {
      effectiveCondition: 'rain',
      origin: 'strategic-event',
      badgeLabel: 'Tormenta na Arena',
      detailLabel: 'Combate ativo contra os chefes da tentação financeira.',
    };
  }

  if (ctx.arca1CostRiskLevel === 'critical') {
    return {
      effectiveCondition: 'rain',
      origin: 'strategic-event',
      badgeLabel: 'Chuva · Pressão na Arca I',
      detailLabel: 'Custos mensais críticos exigem contenção imediata.',
    };
  }

  // Evento estratégico 3: Escudo de Oração 60s -> Névoa de Vigília
  if (ctx.isShieldVigilActive) {
    return {
      effectiveCondition: 'mist',
      origin: 'strategic-event',
      badgeLabel: 'Névoa de Vigília (60s)',
      detailLabel: 'Escudo erguido nas muralhas contra o impulso.',
    };
  }

  // Dados reais da geolocalização
  if (ctx.liveWeather) {
    const tempPart =
      ctx.liveWeather.temperatureC !== null ? ` · ${ctx.liveWeather.temperatureC}°C` : '';
    return {
      effectiveCondition: ctx.liveWeather.condition,
      origin: 'geolocation',
      badgeLabel: `${ctx.liveWeather.description}${tempPart}`,
      detailLabel: `Clima real em ${ctx.liveWeather.locationLabel}`,
    };
  }

  // Eventos atmosféricos secundários enquanto aguarda GPS
  if (ctx.activeTab === 'cronicas' && ctx.feudsConquered < 2) {
    return {
      effectiveCondition: 'mist',
      origin: 'strategic-event',
      badgeLabel: 'Névoa de Reconhecimento',
      detailLabel: 'Territórios iniciais sob neblina tática no mapa.',
    };
  }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    return {
      effectiveCondition: 'snow',
      origin: 'strategic-event',
      badgeLabel: 'Sereno da Madrugada',
      detailLabel: 'Turno noturno na tenda do Comandante.',
    };
  }

  return {
    effectiveCondition: 'clear',
    origin: 'default',
    badgeLabel: 'Vigília Estável',
    detailLabel: 'Ative o GPS para sincronizar o clima real da sua região.',
  };
}
