import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  CloudFog,
  CloudRain,
  CloudSnow,
  Crown,
  Flame,
  MapPin,
  RefreshCw,
  Shield,
  Sprout,
  Sun,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HEIR_DUE_DATE_ISO } from '../data/chroniclesData';
import type { AppState, TabId } from '../types/chronicles';
import type {
  GeolocationStatus,
  LiveWeatherReading,
  StrategicWeatherResolution,
  WeatherMode,
} from '../types/weather';
import {
  calculateCountdown,
  formatBRL,
  getConqueredFeudsCount,
  getLevelInfo,
} from '../utils/formatters';
import { soundFx } from '../utils/sound';
import commanderGabrielImg from '../assets/images/commander_gabriel_medallion_1794834113992.jpg';
import commanderWifeImg from '../assets/images/commander_wife_medallion_1794834105307.jpg';
import { CommanderShieldCrest, VaultChestSvg } from './Crests';
import { SoldierBattlefieldWidget } from './SoldierBattlefieldWidget';

interface CommandHudProps {
  state: AppState;
  weatherMode: WeatherMode;
  weatherResolution: StrategicWeatherResolution;
  liveWeather: LiveWeatherReading | null;
  geoStatus: GeolocationStatus;
  onChangeWeatherMode: (mode: WeatherMode) => void;
  onRequestGeolocation: () => void;
  onToggleSound: () => void;
  onNavigateTab: (tab: TabId) => void;
  onOpenArena: () => void;
}

type HudDrawerKey = 'soldiers' | 'feuds' | 'cdi' | 'victories' | null;

const WEATHER_MODE_OPTIONS: Array<{ id: WeatherMode; label: string }> = [
  { id: 'auto', label: 'Auto' },
  { id: 'clear', label: 'Limpo' },
  { id: 'mist', label: 'Névoa' },
  { id: 'rain', label: 'Chuva' },
  { id: 'snow', label: 'Neve' },
];

export function CommandHud({
  state,
  weatherMode,
  weatherResolution,
  liveWeather,
  geoStatus,
  onChangeWeatherMode,
  onRequestGeolocation,
  onToggleSound,
  onNavigateTab,
  onOpenArena,
}: CommandHudProps) {
  const [nowText, setNowText] = useState<string>(() =>
    new Date().toLocaleTimeString('pt-BR')
  );
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(HEIR_DUE_DATE_ISO)
  );
  const [activeDrawer, setActiveDrawer] = useState<HudDrawerKey>(null);
  const [gabrielImgError, setGabrielImgError] = useState(false);
  const [wifeImgError, setWifeImgError] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowText(new Date().toLocaleTimeString('pt-BR'));
      setCountdown(calculateCountdown(HEIR_DUE_DATE_ISO));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const levelInfo = getLevelInfo(state.xp);
  const totalWealth =
    (state.box1 || 0) + (state.box2 || 0) + (state.box3 || 0) + (state.box4 || 0);
  const soldiers = Math.floor(totalWealth / 100);
  const passiveCdiSoldiers = Math.floor((state.cdiTotal || 0) / 100);
  const { count: feudsConquered, conquered } = getConqueredFeudsCount(state);
  const totalTemptationsWon = (state.streak || 0) + (state.arenaWins || 0);

  const toggleDrawer = (key: Exclude<HudDrawerKey, null>) => {
    setActiveDrawer((prev) => {
      const next = prev === key ? null : key;
      if (next === 'soldiers') {
        soundFx.strike(state.soundEnabled);
      } else if (next !== null) {
        soundFx.chime(state.soundEnabled);
      }
      return next;
    });
  };

  const renderWeatherIcon = () => {
    switch (weatherResolution.effectiveCondition) {
      case 'rain':
        return <CloudRain className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4 text-cyan-200 shrink-0" aria-hidden="true" />;
      case 'mist':
        return <CloudFog className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />;
      default:
        return <Sun className="w-4 h-4 text-[#eab308] shrink-0" aria-hidden="true" />;
    }
  };

  const gpsButtonLabel =
    geoStatus === 'locating'
      ? 'Localizando...'
      : geoStatus === 'ready'
      ? 'Atualizar GPS'
      : geoStatus === 'denied'
      ? 'Reativar GPS'
      : 'Sincronizar GPS';

  return (
    <section aria-label="Painel do Comandante" className="space-y-4">
      <div className="rpg-panel state-card p-5 sm:p-6" data-tilt-subtle="true">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6">
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            <div className="depth-layer-3 shrink-0 hidden sm:block">
              <CommanderShieldCrest className="w-16 h-16 sm:w-20 sm:h-20 sacred-glow" />
            </div>
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="depth-layer-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#c59b27] font-semibold">
                <span className="font-mono-num">Nível {levelInfo.level}</span>
                <span aria-hidden="true">·</span>
                <span>{levelInfo.rank}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9e9380]">Comandante Gabriel (PM)</span>
                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-label={
                    state.soundEnabled
                      ? 'Silenciar efeitos sonoros'
                      : 'Ativar efeitos sonoros'
                  }
                  title={
                    state.soundEnabled
                      ? 'Efeitos sonoros ativados (clique para mutar)'
                      : 'Efeitos sonoros mutados (clique para ativar)'
                  }
                  className="ml-0.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121418] border border-white/10 hover:border-[#c59b27]/70 text-[#e7dcc6] cursor-pointer transition-colors min-h-[30px]"
                >
                  {state.soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#c59b27]" aria-hidden="true" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[#7a7d84]" aria-hidden="true" />
                  )}
                  <span className="text-[11px] font-medium">
                    {state.soundEnabled ? 'Som' : 'Mudo'}
                  </span>
                </button>
              </div>

              <h1 className="depth-layer-2 font-epic text-xl sm:text-2xl text-[#f3ead6] tracking-wide text-balance">
                Fortaleza da Família Conceição
              </h1>

              <div className="depth-layer-2 pt-1 max-w-md">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1.5">
                  <span className="font-mono-num text-[#e4c770]">
                    {state.xp.toLocaleString('pt-BR')} XP acumulados
                  </span>
                  <span className="font-mono-num text-[#9e9380]">
                    Faltam {levelInfo.xpToNext} XP · Nível {levelInfo.level + 1}
                  </span>
                </div>
                <div
                  className="w-full h-2.5 bg-[#0e1013] rounded-sm overflow-hidden border border-white/10"
                  role="progressbar"
                  aria-valuenow={levelInfo.xpPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso de experiência do nível atual"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#7d5d28] via-[#c59b27] to-[#e4c770] transition-all duration-300 progress-sheen"
                    style={{ width: `${levelInfo.xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:items-center gap-4 shrink-0">
            {/* Medalhões do Casal (Ferro Batido 3D) */}
            <button
              type="button"
              onClick={() => {
                soundFx.chime(state.soundEnabled);
                onNavigateTab('provedor');
              }}
              title="Aliança do Casal · Abrir Altar do Provedor e Cápsula do Tempo"
              aria-label="Medalhões do Comandante Gabriel e sua esposa — abrir Altar da Família"
              className="state-card parchment-box px-3.5 py-2.5 flex items-center gap-3 cursor-pointer hover:border-[#eab308]/60 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308]"
            >
              <div className="depth-layer-3 flex items-center -space-x-3 shrink-0">
                <div className="couple-medallion-frame w-12 h-12 sm:w-14 sm:h-14 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <div className="couple-medallion-inner w-full h-full flex items-center justify-center">
                    {!gabrielImgError ? (
                      <img
                        src={commanderGabrielImg}
                        alt="Retrato do Comandante Gabriel"
                        referrerPolicy="no-referrer"
                        onError={() => setGabrielImgError(true)}
                        className="w-full h-full object-cover object-top scale-[1.08]"
                      />
                    ) : (
                      <span className="font-epic text-sm text-[#fde047]">G</span>
                    )}
                  </div>
                </div>

                <div className="couple-medallion-frame w-12 h-12 sm:w-14 sm:h-14 relative z-20 transition-transform duration-200 group-hover:-translate-y-0.5">
                  <div className="couple-medallion-inner w-full h-full flex items-center justify-center">
                    {!wifeImgError ? (
                      <img
                        src={commanderWifeImg}
                        alt="Retrato da Esposa, Rainha do Lar Conceição"
                        referrerPolicy="no-referrer"
                        onError={() => setWifeImgError(true)}
                        className="w-full h-full object-cover object-top scale-[1.18]"
                      />
                    ) : (
                      <span className="font-epic text-sm text-[#fde047]">E</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="depth-layer-2 text-left min-w-0">
                <div className="text-[11px] font-epic text-[#eab308] tracking-wider whitespace-nowrap">
                  Aliança do Comando
                </div>
                <div className="text-xs font-semibold text-[#f3ead6] whitespace-nowrap">
                  Gabriel &amp; Esposa
                </div>
                <div className="text-[11px] text-[#9e9380] whitespace-nowrap">
                  Guardiões do Lar
                </div>
              </div>
            </button>

            <div className="depth-layer-3 parchment-box px-4 py-3.5 lg:text-right shrink-0">
              <div className="text-xs text-[#c59b27] font-semibold">
                Chegada do Herdeiro(a) · 30/06/2027
              </div>
              <div className="font-mono-num text-xl sm:text-2xl text-[#f3ead6] font-bold mt-1">
                {countdown.isArrived
                  ? 'Dia da Bênção Chegou!'
                  : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`}
              </div>
              <div className="text-xs font-mono-num text-[#9e9380] mt-1">
                Relógio da Vigília · {nowText}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Clima Dinâmico (Geolocalização Real + Eventos Estratégicos) */}
        <div className="depth-layer-1 mt-4 pt-3.5 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0 text-xs">
            {renderWeatherIcon()}
            <span className="font-semibold text-[#f3ead6]">
              {weatherResolution.badgeLabel}
            </span>
            <span className="text-[#9e9380] truncate">
              — {weatherResolution.detailLabel}
              {liveWeather &&
                weatherResolution.origin === 'geolocation' &&
                liveWeather.humidityPct !== null && (
                  <span className="font-mono-num text-[#a89982]">
                    {' '}
                    · Umidade {liveWeather.humidityPct}%
                    {liveWeather.windKmh !== null ? ` · Vento ${liveWeather.windKmh} km/h` : ''}
                  </span>
                )}
            </span>
            <button
              type="button"
              onClick={onRequestGeolocation}
              disabled={geoStatus === 'locating'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#121418] border border-white/10 hover:border-[#eab308]/60 text-[#e4c770] text-[11px] font-medium cursor-pointer transition-colors min-h-[28px] disabled:opacity-60"
            >
              {geoStatus === 'locating' ? (
                <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />
              ) : (
                <MapPin className="w-3 h-3" aria-hidden="true" />
              )}
              <span>{gpsButtonLabel}</span>
            </button>
          </div>

          <div
            role="group"
            aria-label="Modo de clima tático"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0e1013] border border-white/10 self-start md:self-auto"
          >
            {WEATHER_MODE_OPTIONS.map((opt) => {
              const active = weatherMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeWeatherMode(opt.id)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer min-h-[28px] ${
                    active
                      ? 'bg-[#eab308]/20 text-[#fde047] border border-[#eab308]/45'
                      : 'text-[#9e9380] hover:text-[#f3ead6] border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPIs Interativos — Toque em qualquer bloco para expandir detalhes imersivos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => toggleDrawer('soldiers')}
          aria-expanded={activeDrawer === 'soldiers'}
          className={`rpg-panel state-card p-4 text-left cursor-pointer hover:border-[#c59b27]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27] ${
            activeDrawer === 'soldiers' ? 'border-[#c59b27] ring-1 ring-[#c59b27]/40' : ''
          }`}
        >
          <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#9e9380]">
            <span className="truncate">Saldo · Guarnição</span>
            <span className="flex items-center gap-1 text-[#c59b27] shrink-0">
              <Swords className="w-3.5 h-3.5" aria-hidden="true" />
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDrawer === 'soldiers' ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </span>
          </div>
          <div className="depth-layer-3 flex items-center justify-between gap-2 mt-1">
            <div className="font-mono-num text-lg sm:text-xl font-bold text-[#f3ead6] truncate">
              {soldiers.toLocaleString('pt-BR')} {soldiers === 1 ? 'Soldado' : 'Soldados'}
            </div>
            <div className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
              {([1, 2, 3, 4] as const).map((id) => (
                <VaultChestSvg
                  key={id}
                  vaultId={id}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  breatheDelayMs={(id - 1) * 420}
                />
              ))}
            </div>
          </div>
          <div className="depth-layer-2 flex items-center justify-between gap-2 text-xs font-mono-num text-[#c59b27] mt-1">
            <span className="truncate">{formatBRL(totalWealth)}</span>
            <span className="text-[11px] font-sans text-[#9e9380] hidden sm:inline shrink-0">
              {activeDrawer === 'soldiers' ? 'Ocultar' : 'Ver batalha'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleDrawer('feuds')}
          aria-expanded={activeDrawer === 'feuds'}
          className={`rpg-panel state-card p-4 text-left cursor-pointer hover:border-[#c59b27]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27] ${
            activeDrawer === 'feuds' ? 'border-[#c59b27] ring-1 ring-[#c59b27]/40' : ''
          }`}
        >
          <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#9e9380]">
            <span className="truncate">Domínios Conquistados</span>
            <span className="flex items-center gap-1 text-[#c59b27] shrink-0">
              <Crown className="w-3.5 h-3.5" aria-hidden="true" />
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDrawer === 'feuds' ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </span>
          </div>
          <div className="depth-layer-3 font-mono-num text-lg sm:text-xl font-bold text-[#f3ead6] mt-1">
            {feudsConquered} / 6 Feudos
          </div>
          <div className="depth-layer-2 text-xs text-[#9e9380] mt-1 truncate">
            {feudsConquered === 6 ? 'Reino consolidado' : 'Avanço territorial ativo'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleDrawer('cdi')}
          aria-expanded={activeDrawer === 'cdi'}
          className={`rpg-panel state-card p-4 text-left cursor-pointer hover:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27] ${
            activeDrawer === 'cdi' ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' : ''
          }`}
        >
          <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#9e9380]">
            <span className="truncate">Colheita de Ouro (CDI)</span>
            <span className="flex items-center gap-1 text-emerald-400 shrink-0">
              <Sprout className="w-3.5 h-3.5" aria-hidden="true" />
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDrawer === 'cdi' ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </span>
          </div>
          <div className="depth-layer-3 font-mono-num text-lg sm:text-xl font-bold text-emerald-400 mt-1">
            {formatBRL(state.cdiTotal || 0)}
          </div>
          <div className="depth-layer-2 text-xs text-[#9e9380] mt-1 truncate">
            Reinvestido na Muralha
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleDrawer('victories')}
          aria-expanded={activeDrawer === 'victories'}
          className={`rpg-panel state-card p-4 text-left cursor-pointer hover:border-[#c59b27]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27] ${
            activeDrawer === 'victories' ? 'border-[#c59b27] ring-1 ring-[#c59b27]/40' : ''
          }`}
        >
          <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs text-[#9e9380]">
            <span className="truncate">Tentações Derrotadas</span>
            <span className="flex items-center gap-1 text-[#e4c770] shrink-0">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDrawer === 'victories' ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </span>
          </div>
          <div className="depth-layer-3 font-mono-num text-lg sm:text-xl font-bold text-[#e4c770] mt-1">
            {totalTemptationsWon} {totalTemptationsWon === 1 ? 'Vitória' : 'Vitórias'}
          </div>
          <div className="depth-layer-2 text-xs font-mono-num text-[#9e9380] mt-1 truncate">
            {state.streak || 0} vigílias · {state.arenaWins || 0} duelos
          </div>
        </button>
      </div>

      {/* Painel Expansível ao Toque */}
      {activeDrawer === 'soldiers' && (
        <SoldierBattlefieldWidget
          state={state}
          soldiers={soldiers}
          totalWealth={totalWealth}
          onClose={() => setActiveDrawer(null)}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeDrawer === 'feuds' && (
        <div className="drawer-expand rpg-panel border-[#c59b27]/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-epic text-[#c59b27]">
              Conselho Territorial · 6 Feudos
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
              {[
                { id: 1, label: 'I. Portão do Crédito' },
                { id: 2, label: 'II. Cidadela' },
                { id: 3, label: 'III. Manjedoura' },
                { id: 4, label: 'IV. Planície' },
                { id: 5, label: 'V. Bastião Corolla' },
                { id: 6, label: 'VI. Monte do Legado' },
              ].map((f) => {
                const done = !!conquered[f.id];
                return (
                  <span
                    key={f.id}
                    className={`font-medium ${done ? 'text-emerald-400' : 'text-[#9e9380]'}`}
                  >
                    {done ? '✠' : '○'} {f.label}
                  </span>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveDrawer(null);
              onNavigateTab('cronicas');
            }}
            className="rpg-btn-gold px-4 py-2.5 rounded-lg text-xs font-epic flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
          >
            <span>Abrir Mapa Militar</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {activeDrawer === 'cdi' && (
        <div className="drawer-expand rpg-panel border-emerald-600/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-epic text-emerald-400">
              Forja Passiva de Juros Compostos
            </div>
            <p className="text-sm text-[#e7dcc6]">
              Sua colheita acumulada de <strong className="font-mono-num text-emerald-300">{formatBRL(state.cdiTotal || 0)}</strong> já recrutou{' '}
              <strong className="font-mono-num text-[#e4c770]">{passiveCdiSoldiers} soldados passivos</strong> diretamente para a Arca II (Muralha).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveDrawer(null);
              onNavigateTab('rota');
            }}
            className="rpg-btn-gold px-4 py-2.5 rounded-lg text-xs font-epic flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
          >
            <span>Colher no Tesouro</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {activeDrawer === 'victories' && (
        <div className="drawer-expand rpg-panel border-[#881b1b]/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-epic text-[#e4c770] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              <span>Registro Marcial da Vigília</span>
            </div>
            <p className="text-sm text-[#e7dcc6]">
              <strong className="font-mono-num text-[#f3ead6]">{state.streak || 0}</strong> cercos de 60s vencidos em oração e{' '}
              <strong className="font-mono-num text-red-300">{state.arenaWins || 0}</strong> chefes da dívida abatidos na Arena.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveDrawer(null);
              onOpenArena();
            }}
            className="rpg-btn-crimson px-4 py-2.5 rounded-lg text-xs font-epic flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[42px]"
          >
            <Swords className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Entrar na Arena</span>
          </button>
        </div>
      )}
    </section>
  );
}
