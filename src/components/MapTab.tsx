import { useState } from 'react';
import { Award, Check, Flag, Lock, Maximize2 } from 'lucide-react';
import { RELICS } from '../data/chroniclesData';
import type { AppState, FeudChecklistState, TabId } from '../types/chronicles';
import { formatBRL, getConqueredFeudsCount } from '../utils/formatters';
import { soundFx } from '../utils/sound';
import { RelicIconSvg } from './Crests';
import { TacticalCampaignMap } from './TacticalCampaignMap';
import { WarRoomModal, type WarRoomFeudItem } from './WarRoomModal';

interface MapTabProps {
  state: AppState;
  onToggleChecklist: (key: keyof FeudChecklistState) => void;
  onNavigateTab?: (tab: TabId) => void;
}

export function MapTab({ state, onToggleChecklist, onNavigateTab }: MapTabProps) {
  const [warRoomOpen, setWarRoomOpen] = useState(false);
  const { conquered, count } = getConqueredFeudsCount(state);
  const unlockedRelicsCount = RELICS.filter((r) => r.isUnlocked(state)).length;

  const box1Val = state.box1 || 0;
  const box2Val = state.box2 || 0;
  const box3Val = state.box3 || 0;
  const box4Val = state.box4 || 0;

  const box1Pct = Math.min(100, Math.round((box1Val / 6829) * 100));
  const box2Pct = Math.min(100, Math.round((box2Val / 12000) * 100));
  const box3Pct = Math.min(100, Math.round((box3Val / 45000) * 100));
  const box4Pct = Math.min(100, Math.round((box4Val / 50000) * 100));

  const corollaPhase =
    box3Pct >= 81 ? 5 : box3Pct >= 61 ? 4 : box3Pct >= 41 ? 3 : box3Pct >= 21 ? 2 : 1;

  const feud3Pct =
    (state.feudChecklist?.feudo_3_enxoval ? 50 : 0) +
    (state.feudChecklist?.feudo_3_nascimento ? 50 : 0);
  const feud4Pct =
    (state.feudChecklist?.feudo_4_ipva ? 50 : 0) +
    (state.feudChecklist?.feudo_4_emprestimo ? 50 : 0);
  const feud6Pct =
    (state.feudChecklist?.feudo_6_investimentos ? 50 : 0) +
    (state.feudChecklist?.feudo_6_quitacao_casa ? 50 : 0);

  const box1Missing = Math.max(0, 6829 - box1Val);
  const box2Missing = Math.max(0, 12000 - box2Val);
  const box3Missing = Math.max(0, 45000 - box3Val);

  const feuds: WarRoomFeudItem[] = [
    {
      id: 1,
      roman: 'I',
      name: 'Portão do Crédito',
      shortName: 'Portão Crédito',
      description:
        'Bloquear o cartão Mercado Pago e completar 100% da Arca I (R$ 6.829,00).',
      progressLabel: `${formatBRL(box1Val)} / R$ 6.829,00`,
      progressPct: box1Pct,
      elevation: '210m',
      terrainType: 'Desfiladeiro Oeste',
      planPhase: 'Plano Diretor · Fase 1 (2026)',
      planLinkLabel:
        'Preencher integralmente a Caixinha 1 (Arca I · Cartão Mercado Pago) para eliminar o risco de juros rotativos.',
      remainingText:
        box1Missing === 0 ? 'Meta alcançada' : `Faltam ${formatBRL(box1Missing)}`,
      linkedTab: 'rota',
      linkedActionLabel: 'Aportar na Caixinha 1',
    },
    {
      id: 2,
      roman: 'II',
      name: 'Cidadela de São José',
      shortName: 'Cidadela S. José',
      description:
        'Erguer integralmente a Muralha de Emergência da família (R$ 12.000,00).',
      progressLabel: `${formatBRL(box2Val)} / R$ 12.000,00`,
      progressPct: box2Pct,
      elevation: '540m',
      terrainType: 'Planalto Fortificado',
      planPhase: 'Plano Diretor · Fase 1–2 (2026–2027)',
      planLinkLabel:
        'Preenchimento total da Caixinha 2 (Arca II · Reserva de Emergência) somado aos rendimentos colhidos do CDI.',
      remainingText:
        box2Missing === 0 ? 'Muralha erguida' : `Faltam ${formatBRL(box2Missing)}`,
      linkedTab: 'rota',
      linkedActionLabel: 'Reforçar Caixinha 2',
    },
    {
      id: 3,
      roman: 'III',
      name: 'Vale da Manjedoura',
      shortName: 'Manjedoura',
      description:
        'Preparação integral e nascimento abençoado do Herdeiro(a) em 30/06/2027.',
      progressLabel: `${feud3Pct}% · Marcos da Chegada`,
      progressPct: feud3Pct,
      elevation: '140m',
      terrainType: 'Vale Fluvial',
      planPhase: 'Plano Diretor · Marco 30/06/2027',
      planLinkLabel:
        'Proteção do parto e enxoval completo do Herdeiro(a) com orçamento planejado sem endividamento.',
      remainingText: `${Math.round(feud3Pct / 50)} / 2 marcos`,
      checklist: [
        {
          key: 'feudo_3_enxoval',
          label: 'Enxoval, quarto e reserva do parto prontos',
          checked: !!state.feudChecklist?.feudo_3_enxoval,
        },
        {
          key: 'feudo_3_nascimento',
          label: 'Nascimento abençoado do Herdeiro(a)',
          checked: !!state.feudChecklist?.feudo_3_nascimento,
        },
      ],
    },
    {
      id: 4,
      roman: 'IV',
      name: 'Planície da Honra',
      shortName: 'Planície Honra',
      description:
        'Quitação integral das pendências de honra: IPVA e empréstimo familiar.',
      progressLabel: `${feud4Pct}% · Deveres de Honra`,
      progressPct: feud4Pct,
      elevation: '380m',
      terrainType: 'Chapada Estratégica',
      planPhase: 'Plano Diretor · Saneamento (2026–2027)',
      planLinkLabel:
        'Liquidação definitiva do IPVA e do empréstimo familiar antes de avançar para a troca da montaria.',
      remainingText: `${Math.round(feud4Pct / 50)} / 2 deveres`,
      checklist: [
        {
          key: 'feudo_4_ipva',
          label: 'IPVA quitado integralmente',
          checked: !!state.feudChecklist?.feudo_4_ipva,
        },
        {
          key: 'feudo_4_emprestimo',
          label: 'Empréstimo familiar quitado com honra',
          checked: !!state.feudChecklist?.feudo_4_emprestimo,
        },
      ],
    },
    {
      id: 5,
      roman: 'V',
      name: 'Bastião Corolla XEi',
      shortName: 'Bastião Corolla',
      description:
        'Acumular R$ 45.000,00 na Arca III para conquistar o Corolla XEi 2017 à vista.',
      progressLabel: `${formatBRL(box3Val)} / R$ 45.000,00`,
      progressPct: box3Pct,
      elevation: '460m',
      terrainType: 'Crista Sudeste',
      planPhase: 'Plano Diretor · Fase 2 (2027–2028)',
      planLinkLabel: `Preencher 100% da Caixinha 3 (Arca III · Corolla XEi 2017) + valor da montaria atual para compra à vista (Montagem real: Fase ${corollaPhase}/5).`,
      remainingText:
        box3Missing === 0 ? 'Pronto para compra à vista' : `Faltam ${formatBRL(box3Missing)}`,
      linkedTab: 'rota',
      linkedActionLabel: 'Aportar na Caixinha 3',
    },
    {
      id: 6,
      roman: 'VI',
      name: 'Monte do Legado',
      shortName: 'Monte Legado',
      description:
        'Construção patrimonial sólida em Tesouro IPCA+ e quitação da casa própria.',
      progressLabel: `Arca IV: ${formatBRL(box4Val)} · ${feud6Pct}%`,
      progressPct: feud6Pct,
      elevation: '1.280m',
      terrainType: 'Maciço Alpino',
      planPhase: 'Plano Diretor · Fase 3 (2028+)',
      planLinkLabel: `Consolidar aportes em Tesouro IPCA+ na Caixinha 4 (Arca IV · ${box4Pct}% de R$ 50.000,00) e quitar integralmente a habitação na Caixa.`,
      remainingText: `${Math.round(feud6Pct / 50)} / 2 pilares`,
      linkedTab: 'rota',
      linkedActionLabel: 'Gerenciar Caixinha 4',
      checklist: [
        {
          key: 'feudo_6_investimentos',
          label: 'Aportes recorrentes em Tesouro IPCA+ consolidados',
          checked: !!state.feudChecklist?.feudo_6_investimentos,
        },
        {
          key: 'feudo_6_quitacao_casa',
          label: 'Financiamento da casa própria 100% quitado',
          checked: !!state.feudChecklist?.feudo_6_quitacao_casa,
        },
      ],
    },
  ];

  const defaultSelected = feuds.find((f) => !conquered[f.id])?.id ?? 1;
  const [selectedFeudId, setSelectedFeudId] = useState<number>(defaultSelected);

  const handleSelectFeud = (feudId: number, scrollToCard = false) => {
    setSelectedFeudId(feudId);
    if (scrollToCard) {
      window.setTimeout(() => {
        document.getElementById(`feud-card-${feudId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 40);
    }
  };

  const handleOpenWarRoom = () => {
    soundFx.chime(state.soundEnabled);
    setWarRoomOpen(true);
  };

  return (
    <div className="space-y-6">
      <WarRoomModal
        isOpen={warRoomOpen}
        state={state}
        feuds={feuds}
        conquered={conquered}
        conqueredCount={count}
        unlockedRelicsCount={unlockedRelicsCount}
        totalRelicsCount={RELICS.length}
        selectedFeudId={selectedFeudId}
        onSelectFeud={(feudId) => setSelectedFeudId(feudId)}
        onToggleChecklist={onToggleChecklist}
        onNavigateTab={onNavigateTab}
        onClose={() => setWarRoomOpen(false)}
      />

      <section className="rpg-panel p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#3a3f45] pb-4">
          <div>
            <span className="text-xs font-epic text-[#c59b27]">
              Mapa Topográfico de Campanha Militar
            </span>
            <h2 className="font-epic text-xl sm:text-2xl text-[#f3ead6]">
              Os 6 Feudos da Família Conceição
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="font-mono-num text-sm font-bold text-[#dfc168]">
              {count} / 6 Territórios Conquistados
            </div>

            <button
              type="button"
              onClick={handleOpenWarRoom}
              className="rpg-btn-gold px-4 py-2.5 rounded-lg text-xs sm:text-sm font-epic inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <span aria-hidden="true">🗺️</span>
              <span>Sala de Guerra (Tela Cheia)</span>
              <Maximize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        <TacticalCampaignMap
          feuds={feuds}
          conquered={conquered}
          selectedFeudId={selectedFeudId}
          soundEnabled={state.soundEnabled}
          onSelectFeud={handleSelectFeud}
          svgIdPrefix="inline-"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feuds.map((feud) => {
            const isConquered = !!conquered[feud.id];
            const isSelected = selectedFeudId === feud.id;
            return (
              <article
                id={`feud-card-${feud.id}`}
                key={feud.id}
                onClick={() => setSelectedFeudId(feud.id)}
                className={`parchment-box state-card p-5 flex flex-col justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? isConquered
                      ? 'border-emerald-400 bg-emerald-950/20'
                      : 'border-[#e4c770]'
                    : isConquered
                      ? 'border-emerald-600/60 bg-emerald-950/15'
                      : 'border-[#3a3f45]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="depth-layer-1 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="font-epic text-[#c59b27]">
                      Feudo {feud.roman} · {feud.elevation}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        isConquered ? 'text-emerald-400' : 'text-[#a69982]'
                      }`}
                    >
                      {isConquered ? (
                        <>
                          <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Conquistado</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Em Campanha</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="depth-layer-3 font-epic text-lg text-[#f3ead6]">
                    {feud.roman}. {feud.name}
                  </h3>
                  <p className="depth-layer-2 text-sm text-[#c7b8a0] leading-relaxed">
                    {feud.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[#7d5d28]/30">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono-num">
                    <span className="text-[#dfc168]">{feud.progressLabel}</span>
                    <span className={isConquered ? 'text-emerald-400' : 'text-[#a69982]'}>
                      {feud.progressPct}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-[#101215] overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isConquered ? 'bg-emerald-500' : 'bg-[#c59b27]'
                      }`}
                      style={{ width: `${feud.progressPct}%` }}
                    />
                  </div>

                  {feud.checklist && (
                    <div className="space-y-2 pt-1">
                      {feud.checklist.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFeudId(feud.id);
                            onToggleChecklist(item.key);
                          }}
                          aria-pressed={item.checked}
                          className="w-full flex items-center gap-3 text-left text-xs py-2.5 px-3 rounded-lg bg-[#101215]/85 border border-white/10 hover:border-[#c59b27]/70 active:scale-[0.99] cursor-pointer transition-all min-h-[44px]"
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                              item.checked
                                ? 'bg-emerald-700 border-emerald-400 text-white'
                                : 'border-[#525861] text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                          <span
                            className={
                              item.checked ? 'text-emerald-300 font-semibold' : 'text-[#d5c7b0]'
                            }
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SALA DE TROFÉUS E RELÍQUIAS */}
      <section className="rpg-panel p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#3a3f45] pb-4">
          <div>
            <span className="text-xs font-epic text-[#c59b27] flex items-center gap-1.5">
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>Sala de Troféus e Relíquias</span>
            </span>
            <h2 className="font-epic text-xl sm:text-2xl text-[#f3ead6] mt-0.5">
              Conquistas da Fortaleza
            </h2>
          </div>

          <div className="font-mono-num text-sm font-bold text-[#dfc168]">
            {unlockedRelicsCount} / {RELICS.length} Desbloqueadas
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RELICS.map((relic) => {
            const unlocked = relic.isUnlocked(state);
            return (
              <article
                key={relic.id}
                className={`parchment-box state-card p-4 flex flex-col items-center text-center gap-3 ${
                  unlocked
                    ? 'border-[#c59b27] bg-[#241c13]'
                    : 'border-[#3a3f45] opacity-75'
                }`}
              >
                <div className={`depth-layer-3 ${unlocked ? 'sacred-glow' : 'opacity-60'}`}>
                  <RelicIconSvg
                    relicId={relic.id}
                    unlocked={unlocked}
                    className="w-14 h-14"
                  />
                </div>
                <div className="space-y-1">
                  <div
                    className={`depth-layer-1 text-xs font-semibold ${
                      unlocked ? 'text-[#dfc168]' : 'text-[#848890]'
                    }`}
                  >
                    {unlocked ? 'Relíquia Forjada' : 'Bloqueada'}
                  </div>
                  <h3 className="depth-layer-2 font-epic text-sm text-[#f3ead6]">{relic.name}</h3>
                  <p className="depth-layer-1 text-xs text-[#a69982] leading-snug">
                    {relic.requirement}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
