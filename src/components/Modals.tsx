import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Flame, Gauge, Power, Shield, Swords, Zap } from 'lucide-react';
import { ARENA_ENEMIES } from '../data/chroniclesData';
import type { EnemyConfig, VictoryModalData } from '../types/chronicles';
import { soundFx } from '../utils/sound';
import {
  CommanderBattleCrest,
  CorollaSilhouetteSvg,
  DemonBossCrest,
  RelicIconSvg,
  VictoryCrownCrest,
} from './Crests';

interface VictoryModalProps {
  data: VictoryModalData | null;
  onClose: () => void;
}

const DIVINE_BEAMS: {
  left: string;
  width: string;
  rotate: string;
  delay: string;
  dur: string;
}[] = [
  { left: '6%', width: '72px', rotate: '-9deg', delay: '0s', dur: '3.2s' },
  { left: '20%', width: '108px', rotate: '-5deg', delay: '0.5s', dur: '4.0s' },
  { left: '35%', width: '88px', rotate: '-2deg', delay: '0.2s', dur: '3.5s' },
  { left: '49%', width: '140px', rotate: '0deg', delay: '0.8s', dur: '3.8s' },
  { left: '64%', width: '92px', rotate: '3deg', delay: '0.35s', dur: '3.4s' },
  { left: '79%', width: '110px', rotate: '6deg', delay: '0.95s', dur: '4.1s' },
  { left: '91%', width: '68px', rotate: '9deg', delay: '0.15s', dur: '3.3s' },
];

const GOLDEN_CONFETTI_COLORS = [
  '#f5dfa0',
  '#e4c770',
  '#c59b27',
  '#fde047',
  '#d4af37',
  '#34d399',
];

const GOLDEN_CONFETTI: {
  id: number;
  left: string;
  width: string;
  height: string;
  sway: string;
  dur: string;
  delay: string;
  color: string;
  diamond: boolean;
}[] = Array.from({ length: 36 }, (_, i) => {
  const leftPct = 2 + ((i * 29 + (i % 5) * 7) % 96);
  const swayPx = ((i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 9));
  const durSec = (2.5 + (i % 7) * 0.28).toFixed(2);
  const delaySec = (-2.6 + (i % 12) * 0.32).toFixed(2);
  const isSmall = i % 3 === 0;
  return {
    id: i,
    left: `${leftPct}%`,
    width: isSmall ? '6px' : '9px',
    height: isSmall ? '6px' : '14px',
    sway: `${swayPx}px`,
    dur: `${durSec}s`,
    delay: `${delaySec}s`,
    color: GOLDEN_CONFETTI_COLORS[i % GOLDEN_CONFETTI_COLORS.length],
    diamond: i % 4 === 0,
  };
});

export function VictoryModal({ data, onClose }: VictoryModalProps) {
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, onClose]);

  if (!data) return null;

  const isRelicCelebration =
    data.celebration === 'divine-confetti' ||
    Boolean(data.relicId) ||
    Boolean(data.unlockedRelics && data.unlockedRelics.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#070708]/92 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Chuva de Luz Divina + Confete Dourado em todo o contêiner do modal */}
      {isRelicCelebration && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
          {/* Clarão celestial central */}
          <div
            className="divine-aura-bloom absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[780px] h-[90vw] max-h-[780px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(245, 223, 160, 0.28) 0%, rgba(197, 155, 39, 0.12) 38%, transparent 70%)',
            }}
          />

          {/* Raios verticais/diagonais de luz divina cruzando toda a tela */}
          {DIVINE_BEAMS.map((beam, idx) => (
            <div
              key={idx}
              className="divine-light-beam absolute -top-[16%] h-[136%] -translate-x-1/2"
              style={{
                left: beam.left,
                width: beam.width,
                transform: `rotate(${beam.rotate})`,
                animationDelay: beam.delay,
                animationDuration: beam.dur,
                background:
                  'linear-gradient(180deg, rgba(254, 240, 138, 0.26) 0%, rgba(228, 199, 112, 0.11) 48%, rgba(197, 155, 39, 0) 100%)',
              }}
            />
          ))}

          {/* Chuva contínua de confete metálico dourado */}
          {GOLDEN_CONFETTI.map((piece) => {
            const style = {
              left: piece.left,
              top: '-10vh',
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              boxShadow: '0 0 8px rgba(228, 199, 112, 0.55)',
              borderRadius: piece.diamond ? '2px' : '1.5px',
              '--confetti-sway': piece.sway,
              '--confetti-dur': piece.dur,
              '--confetti-delay': piece.delay,
            } as CSSProperties;

            return (
              <span
                key={piece.id}
                style={style}
                className="golden-confetti-piece absolute block"
              />
            );
          })}
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 rpg-panel border-[#c59b27] max-w-md w-full p-6 text-center space-y-5 ${
          isRelicCelebration ? 'shadow-[0_0_60px_rgba(197,155,39,0.28)]' : ''
        }`}
      >
        <div className="flex justify-center">
          {data.relicId ? (
            <RelicIconSvg
              relicId={data.relicId}
              unlocked
              className="w-20 h-20 sacred-glow"
            />
          ) : (
            <VictoryCrownCrest className="w-20 h-20 sacred-glow" />
          )}
        </div>
        <div className="space-y-2">
          <div className="text-xs font-epic tracking-widest text-[#c59b27]">
            {data.kicker}
          </div>
          <h3 id="victory-modal-title" className="text-2xl font-epic text-[#f3ead6] text-balance">
            {data.title}
          </h3>
          <p className="text-base text-[#d5c7b0] leading-relaxed">
            {data.description}
          </p>
          {data.unlockedRelics && data.unlockedRelics.length > 0 && !data.relicId && (
            <div className="pt-2 border-t border-white/10 text-xs font-semibold text-[#e4c770]">
              Relíquia desbloqueada na Sala de Troféus:{' '}
              {data.unlockedRelics.map((r) => r.name).join(' · ')}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded rpg-btn-gold font-epic text-sm cursor-pointer min-h-[44px]"
        >
          Prosseguir na Cruzada
        </button>
      </div>
    </div>
  );
}

interface ArenaModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onClose: () => void;
  onWinBattle: (enemy: EnemyConfig) => void;
}

const BLOOD_SPLATS: { id: number; dx: string; dy: string; size: string }[] = [
  { id: 1, dx: '-34px', dy: '-24px', size: 'w-2.5 h-2.5' },
  { id: 2, dx: '38px', dy: '-18px', size: 'w-2 h-2' },
  { id: 3, dx: '-22px', dy: '26px', size: 'w-2 h-2' },
  { id: 4, dx: '28px', dy: '24px', size: 'w-3 h-3' },
  { id: 5, dx: '0px', dy: '-38px', size: 'w-2 h-2' },
  { id: 6, dx: '42px', dy: '6px', size: 'w-2.5 h-2.5' },
];

export function ArenaModal({
  isOpen,
  soundEnabled,
  onClose,
  onWinBattle,
}: ArenaModalProps) {
  const [selectedEnemyId, setSelectedEnemyId] = useState<EnemyConfig['id']>(
    ARENA_ENEMIES[0].id
  );
  const [heroHp, setHeroHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(ARENA_ENEMIES[0].maxHp);
  const [guardActive, setGuardActive] = useState(false);
  const [enemyCharging, setEnemyCharging] = useState(false);
  const [specialCooldown, setSpecialCooldown] = useState(0);
  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [bossHitEffect, setBossHitEffect] = useState<{
    key: number;
    dmg: number;
    slash: boolean;
    critical: boolean;
  } | null>(null);
  const [shieldWaveKey, setShieldWaveKey] = useState(0);
  const [battleLog, setBattleLog] = useState(
    'Escolha seu adversário e desfira o golpe da disciplina!'
  );
  const timerRef = useRef<number | null>(null);

  const enemy =
    ARENA_ENEMIES.find((e) => e.id === selectedEnemyId) || ARENA_ENEMIES[0];

  useEffect(() => {
    if (!isOpen) return;
    setHeroHp(100);
    setEnemyHp(enemy.maxHp);
    setGuardActive(false);
    setEnemyCharging(false);
    setSpecialCooldown(0);
    setIsEnemyTurn(false);
    setBossHitEffect(null);
    setShieldWaveKey(0);
    setBattleLog(`${enemy.name} avança sobre o tesouro da família!`);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isOpen, enemy.id, enemy.maxHp, enemy.name]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetBattle = (nextEnemy?: EnemyConfig) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const target = nextEnemy || enemy;
    setHeroHp(100);
    setEnemyHp(target.maxHp);
    setGuardActive(false);
    setEnemyCharging(false);
    setSpecialCooldown(0);
    setIsEnemyTurn(false);
    setBossHitEffect(null);
    setShieldWaveKey(0);
    setBattleLog(`${target.name} entra na arena. Firmeza e oração!`);
  };

  const handleAction = (kind: 'sword' | 'shield' | 'special') => {
    if (isEnemyTurn || heroHp <= 0 || enemyHp <= 0) return;

    let dmg = 0;
    let nextGuard = false;
    let nextHeroHp = heroHp;
    let nextCooldown = Math.max(0, specialCooldown - 1);
    let actionMsg = '';

    if (kind === 'sword') {
      dmg = 30 + Math.floor(Math.random() * 8);
      soundFx.strike(soundEnabled);
      actionMsg = `Espada Templária! Você causou ${dmg} de dano em ${enemy.name}.`;
    } else if (kind === 'shield') {
      dmg = 18;
      nextGuard = true;
      nextHeroHp = Math.min(100, heroHp + 14);
      setShieldWaveKey((k) => k + 1);
      soundFx.shield(soundEnabled);
      actionMsg = `Muralha de Escudos fechada! +14% de vigor, bloqueio de 75% ativado e ${dmg} de contra-ataque.`;
    } else {
      if (specialCooldown > 0) return;
      dmg = 54 + Math.floor(Math.random() * 10);
      nextCooldown = 2;
      soundFx.strike(soundEnabled);
      actionMsg = `Golpe de São Miguel! Impacto crítico de ${dmg} de dano!`;
    }

    setBossHitEffect({
      key: Date.now(),
      dmg,
      slash: kind === 'sword' || kind === 'special',
      critical: kind === 'special',
    });

    const updatedEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(updatedEnemyHp);
    setHeroHp(nextHeroHp);
    setGuardActive(nextGuard);
    setSpecialCooldown(nextCooldown);
    setBattleLog(actionMsg);

    if (updatedEnemyHp <= 0) {
      soundFx.victory(soundEnabled);
      onWinBattle(enemy);
      return;
    }

    const wasCharging = enemyCharging;
    setIsEnemyTurn(true);
    timerRef.current = window.setTimeout(() => {
      const baseAttack = wasCharging
        ? enemy.heavyAttackPower
        : enemy.attackPower + Math.floor(Math.random() * 5);
      const attackTitle = wasCharging ? enemy.heavyAttackName : enemy.attackName;
      const mitigated = nextGuard
        ? Math.max(3, Math.round(baseAttack * 0.25))
        : baseAttack;
      const willChargeNext = !wasCharging && Math.random() < 0.48;

      setHeroHp((prev) => {
        const afterHit = Math.max(0, prev - mitigated);
        if (afterHit <= 0) {
          setBattleLog(
            `${enemy.name} desferiu "${attackTitle}" (${mitigated}%) e rompeu sua guarda! Recupere o fôlego e tente novamente.`
          );
        } else if (willChargeNext) {
          setBattleLog(
            `${enemy.name} usou "${attackTitle}" (${mitigated}% de desgaste). ATENÇÃO: O chefe prepara "${enemy.heavyAttackName}"! Use o Escudo da Fé!`
          );
        } else {
          setBattleLog(
            nextGuard
              ? `Muralha de Escudos bloqueou "${attackTitle}" para apenas ${mitigated}% de dano!`
              : `${enemy.name} atacou com "${attackTitle}", causando ${mitigated}% de desgaste!`
          );
        }
        return afterHit;
      });

      setEnemyCharging(willChargeNext);
      setGuardActive(false);
      setIsEnemyTurn(false);
    }, 550);
  };

  const enemyPct = Math.round((enemyHp / enemy.maxHp) * 100);
  const isDefeated = heroHp <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#070708]/92 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        key={bossHitEffect?.slash ? `shake-${bossHitEffect.key}` : 'arena-box'}
        onClick={(e) => e.stopPropagation()}
        className={`rpg-panel border-[#7f1d1d] max-w-2xl w-full p-5 sm:p-6 space-y-5 my-auto relative overflow-hidden ${
          bossHitEffect?.slash ? 'arena-screen-shake' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#3a3f45] pb-3.5">
          <div>
            <span className="text-xs font-epic text-[#dc2626]">
              Arena de Combate em Turnos
            </span>
            <h3 id="arena-modal-title" className="text-lg sm:text-xl font-epic text-[#f3ead6]">
              Duelo Contra as Tentações da Dívida
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded rpg-btn-iron text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
          >
            Recuar
          </button>
        </div>

        <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-[#0e1013] border border-white/10">
          {ARENA_ENEMIES.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={isEnemyTurn}
              onClick={() => {
                setSelectedEnemyId(item.id);
                resetBattle(item);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors min-h-[38px] whitespace-nowrap shrink-0 ${
                item.id === enemy.id
                  ? 'bg-[#881b1b] text-[#f3ead6] border border-[#dc2626]/70 shadow-sm'
                  : 'text-[#9e9380] hover:text-white'
              }`}
            >
              {item.name} (+{item.xpReward} XP)
            </button>
          ))}
        </div>

        <div className="parchment-box p-4 sm:p-5 space-y-4 relative overflow-hidden">
          <div className="grid grid-cols-2 gap-4 items-center text-center">
            {/* Comandante Gabriel + Muralha de Escudos de Ferro */}
            <div className="flex flex-col items-center relative">
              <div className="text-xs font-epic text-emerald-400 mb-2">
                Comandante Gabriel {guardActive ? '· Muralha Erguida' : ''}
              </div>
              <div className="relative flex items-center justify-center w-28 h-28">
                {shieldWaveKey > 0 && (
                  <>
                    <div
                      key={`wave-${shieldWaveKey}`}
                      className="shield-aura-burst absolute inset-1 rounded-full border-2 border-[#dfc168] bg-[#c59b27]/20 pointer-events-none"
                    />
                    <div
                      key={`wall-l-${shieldWaveKey}`}
                      className="shield-wall-left absolute left-0 top-2 bottom-2 w-1/2 rounded-l border-2 border-[#cbd5e1]/80 bg-gradient-to-r from-[#232629]/90 to-[#474d56]/80 pointer-events-none z-10 flex items-center justify-center"
                    >
                      <span className="text-xs font-epic text-[#dfc168]">✠</span>
                    </div>
                    <div
                      key={`wall-r-${shieldWaveKey}`}
                      className="shield-wall-right absolute right-0 top-2 bottom-2 w-1/2 rounded-r border-2 border-[#cbd5e1]/80 bg-gradient-to-l from-[#232629]/90 to-[#474d56]/80 pointer-events-none z-10 flex items-center justify-center"
                    >
                      <span className="text-xs font-epic text-[#dfc168]">✠</span>
                    </div>
                  </>
                )}
                <CommanderBattleCrest className="w-24 h-24 sm:w-28 sm:h-28 sacred-glow" />
              </div>
              <div className="w-full h-2.5 bg-[#0f1012] rounded-sm overflow-hidden border border-[#3a3f45] mt-3">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${heroHp}%` }}
                />
              </div>
              <div className="text-xs font-mono-num text-emerald-300 mt-1">
                Vigor: {heroHp}%
              </div>
            </div>

            {/* Inimigo + Rasgo de Aço + Respingos de Impacto + Dano de Guerra */}
            <div
              key={bossHitEffect ? bossHitEffect.key : 'boss-idle'}
              className={`flex flex-col items-center relative rounded p-1 ${
                bossHitEffect ? 'arena-shake arena-flash' : ''
              }`}
            >
              <div className="text-xs font-epic text-red-400 mb-2">
                {enemy.name}
              </div>
              <div className="relative flex items-center justify-center w-28 h-28">
                <DemonBossCrest
                  variant={enemy.id}
                  className="w-20 h-20 sm:w-24 sm:h-24 demon-anim"
                />

                {bossHitEffect && bossHitEffect.slash && (
                  <>
                    <svg
                      viewBox="0 0 120 120"
                      className="slash-effect absolute inset-0 w-full h-full pointer-events-none z-20"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 108 Q60 44 112 10"
                        fill="none"
                        stroke="#f8fafc"
                        strokeWidth="6.5"
                        strokeLinecap="round"
                        filter="url(#goldShadow)"
                      />
                      <path
                        d="M16 112 Q62 50 114 18"
                        fill="none"
                        stroke="#dfc168"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {BLOOD_SPLATS.map((splat) => {
                      const style = {
                        '--splat-x': splat.dx,
                        '--splat-y': splat.dy,
                      } as CSSProperties;
                      return (
                        <span
                          key={splat.id}
                          style={style}
                          className={`blood-splat-particle absolute left-1/2 top-1/2 ${splat.size} rounded-full bg-[#dc2626] shadow-[0_0_8px_rgba(220,38,38,0.9)] pointer-events-none z-20`}
                        />
                      );
                    })}
                  </>
                )}

                {bossHitEffect && (
                  <div
                    className={`damage-float absolute left-1/2 -top-1 font-epic font-black whitespace-nowrap drop-shadow-[0_3px_8px_rgba(0,0,0,0.98)] pointer-events-none z-30 ${
                      bossHitEffect.critical
                        ? 'text-2xl sm:text-3xl text-[#fde047]'
                        : 'text-xl sm:text-2xl text-[#f87171]'
                    }`}
                  >
                    {bossHitEffect.critical ? 'CRÍTICO ' : ''}-{bossHitEffect.dmg} HP!
                  </div>
                )}
              </div>
              <div className="w-full h-2.5 bg-[#0f1012] rounded-sm overflow-hidden border border-[#3a3f45] mt-3">
                <div
                  className="h-full bg-[#991b1b] transition-all duration-300"
                  style={{ width: `${enemyPct}%` }}
                />
              </div>
              <div className="text-xs font-mono-num text-red-300 mt-1">
                HP: {enemyHp} / {enemy.maxHp} ({enemyPct}%)
              </div>
            </div>
          </div>

          <div className="bg-[#111214]/90 border border-[#3a3f45] rounded px-3.5 py-2.5 text-sm text-[#dfc168] text-center">
            {battleLog}
          </div>
        </div>

        {isDefeated ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 parchment-box p-4 border-[#7f1d1d]">
            <div className="text-sm text-red-200">
              Seu vigor esgotou nesta investida. Reze, recupere o fôlego e retome o combate!
            </div>
            <button
              type="button"
              onClick={() => resetBattle()}
              className="rpg-btn-gold px-4 py-2.5 rounded text-xs sm:text-sm font-epic whitespace-nowrap shrink-0 cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={isEnemyTurn}
              onClick={() => handleAction('sword')}
              className="rpg-btn-gold py-3 px-3 rounded text-left flex items-center gap-2.5 cursor-pointer disabled:opacity-50 min-h-[52px]"
            >
              <Swords className="w-5 h-5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-epic">Espada Templária</div>
                <div className="text-xs opacity-85">Rasgo de Aço</div>
              </div>
            </button>

            <button
              type="button"
              disabled={isEnemyTurn}
              onClick={() => handleAction('shield')}
              className="rpg-btn-iron py-3 px-3 rounded text-left flex items-center gap-2.5 cursor-pointer disabled:opacity-50 min-h-[52px]"
            >
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-epic text-[#f3ead6]">Escudo da Fé</div>
                <div className="text-xs text-[#a69982]">Muralha & Vigor</div>
              </div>
            </button>

            <button
              type="button"
              disabled={isEnemyTurn || specialCooldown > 0}
              onClick={() => handleAction('special')}
              className="rpg-btn-crimson py-3 px-3 rounded text-left flex items-center gap-2.5 cursor-pointer disabled:opacity-50 min-h-[52px]"
            >
              <Flame className="w-5 h-5 text-[#dfc168] shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-epic">Golpe de São Miguel</div>
                <div className="text-xs text-red-100">
                  {specialCooldown > 0
                    ? `Recarga (${specialCooldown} turno${specialCooldown > 1 ? 's' : ''})`
                    : 'Impacto Crítico'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface CockpitModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onClose: () => void;
}

export function CockpitModal({
  isOpen,
  soundEnabled,
  onClose,
}: CockpitModalProps) {
  const [engineOn, setEngineOn] = useState(true);
  const [sportMode, setSportMode] = useState(false);
  const [isRevving, setIsRevving] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(800);
  const [gear, setGear] = useState('P · PRONTO');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleIgnition = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setIsRevving(false);
    if (engineOn) {
      setEngineOn(false);
      setSpeed(0);
      setRpm(0);
      setGear('DESLIGADO');
    } else {
      setEngineOn(true);
      setSpeed(0);
      setRpm(800);
      setGear('P · PRONTO');
      soundFx.chime(soundEnabled);
    }
  };

  const handleRev = () => {
    if (!engineOn) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setIsRevving(true);
    setSpeed(sportMode ? 148 : 125);
    setRpm(sportMode ? 6200 : 5200);
    setGear(sportMode ? 'S4 · SPORT' : 'D7 · CRUZEIRO');
    soundFx.engineRev(soundEnabled);

    timerRef.current = window.setTimeout(() => {
      setIsRevving(false);
      setSpeed(0);
      setRpm(800);
      setGear('P · PRONTO');
    }, 2200);
  };

  const rpmPct = Math.min(100, Math.round((rpm / 7000) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cockpit-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#070708]/92 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rpg-panel border-[#7d5d28] max-w-xl w-full p-5 sm:p-6 space-y-5 ${
          isRevving ? 'engine-vibrate' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#3a3f45] pb-3.5">
          <div>
            <span className="text-xs font-epic text-[#c59b27]">
              Engenharia Tática · Painel Optitron
            </span>
            <h3 id="cockpit-modal-title" className="text-lg font-epic text-[#f3ead6]">
              Biga de Aço · Toyota Corolla XEi 2017
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rpg-btn-iron px-3.5 py-2 rounded text-xs font-semibold cursor-pointer"
          >
            Sair
          </button>
        </div>

        <div className="parchment-box p-3 flex justify-center relative overflow-hidden">
          <CorollaSilhouetteSvg
            className="w-full max-w-sm h-28"
            revving={isRevving}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="parchment-box p-4 text-center">
            <div className="text-xs text-[#a69982]">Velocidade</div>
            <div className="font-mono-num text-2xl font-bold text-[#f3ead6] mt-1">
              {speed} km/h
            </div>
          </div>

          <div className="parchment-box p-4 text-center">
            <div className="text-xs text-[#a69982]">Força 2.0 Dual VVT-i</div>
            <div className="font-mono-num text-2xl font-bold text-[#dfc168] mt-1">
              {rpm.toLocaleString('pt-BR')} RPM
            </div>
          </div>

          <div className="parchment-box p-4 text-center">
            <div className="text-xs text-[#a69982]">Marcha</div>
            <div className="font-mono-num text-lg font-bold text-emerald-400 mt-1.5">
              {gear}
            </div>
          </div>
        </div>

        <div className="parchment-box p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-[#a69982]">Conta-giros (0 – 7.000 RPM)</span>
            <span className="text-[#dfc168]">{rpmPct}%</span>
          </div>
          <div className="w-full h-3 bg-[#111214] rounded-sm overflow-hidden border border-[#3a3f45]">
            <div
              className={`h-full transition-all duration-500 ${
                rpm >= 5500
                  ? 'bg-gradient-to-r from-[#c59b27] to-[#dc2626]'
                  : 'bg-gradient-to-r from-emerald-600 to-[#dfc168]'
              }`}
              style={{ width: `${rpmPct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleIgnition}
            className="rpg-btn-iron px-4 py-2.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Power
              className={`w-4 h-4 ${engineOn ? 'text-emerald-400' : 'text-red-400'}`}
              aria-hidden="true"
            />
            <span>{engineOn ? 'Desligar Motor' : 'Ligar Ignição'}</span>
          </button>

          <button
            type="button"
            disabled={!engineOn}
            onClick={() => setSportMode((s) => !s)}
            className={`px-4 py-2.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer min-h-[44px] border transition-colors disabled:opacity-40 ${
              sportMode
                ? 'bg-[#7f1d1d]/75 border-[#dc2626] text-red-100'
                : 'rpg-btn-iron'
            }`}
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span>{sportMode ? 'Modo Sport Ativo' : 'Ativar Modo Sport'}</span>
          </button>

          <button
            type="button"
            disabled={!engineOn || isRevving}
            onClick={handleRev}
            className="rpg-btn-gold flex-1 px-4 py-2.5 rounded text-xs sm:text-sm font-epic flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Gauge className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {isRevving ? 'Acelerando 154 CV...' : 'Despertar Motor 154 Cavalos'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ResetModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetModal({ isOpen, onCancel, onConfirm }: ResetModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-[#070708]/92 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rpg-panel border-[#7f1d1d] max-w-md w-full p-6 space-y-4"
      >
        <h3 id="reset-modal-title" className="font-epic text-xl text-[#f3ead6]">
          Apagar Registros da Fortaleza?
        </h3>
        <p className="text-sm sm:text-base text-[#d5c7b0] leading-relaxed">
          Todos os saldos das arcas, XP acumulado, conquistas de feudos e cartas lacradas serão zerados neste navegador. Recomendamos exportar seu backup antes.
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rpg-btn-iron px-4 py-2.5 rounded text-sm font-semibold cursor-pointer min-h-[42px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rpg-btn-crimson px-4 py-2.5 rounded text-sm font-semibold cursor-pointer min-h-[42px]"
          >
            Confirmar Reset
          </button>
        </div>
      </div>
    </div>
  );
}
