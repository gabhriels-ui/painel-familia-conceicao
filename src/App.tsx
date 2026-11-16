import { useCallback, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { ArenaGateTransition, type ArenaGateStage } from './components/ArenaGateTransition';
import { ChariotTab } from './components/ChariotTab';
import { CommandHud } from './components/CommandHud';
import { CostWatchBanner } from './components/CostWatchBanner';
import { SvgDefs } from './components/Crests';
import { EmberCanvas } from './components/EmberCanvas';
import { Footer } from './components/Footer';
import { IronSparkOverlay } from './components/IronSparkOverlay';
import { MapTab } from './components/MapTab';
import {
  ArenaModal,
  CockpitModal,
  ResetModal,
  VictoryModal,
} from './components/Modals';
import { ProviderTab } from './components/ProviderTab';
import { RewardJuiceOverlay, type RewardBurstItem } from './components/RewardJuiceOverlay';
import { SanctuaryTab } from './components/SanctuaryTab';
import { ToastContainer } from './components/ToastContainer';
import { TopBar, type CloudSyncStatus } from './components/TopBar';
import { TreasureTab } from './components/TreasureTab';
import { WeatherAtmosphereOverlay } from './components/WeatherAtmosphereOverlay';
import { auth, googleProvider } from './firebase';
import {
  addCloudLetter,
  addCloudMarriageCouple,
  addCloudMedicalExam,
  addCloudMissionEntry,
  addCloudReadingLog,
  addCloudRecurringCost,
  addCloudSpiritualLog,
  addCloudTacticalExpense,
  addCloudTransaction,
  deleteCloudLetter,
  deleteCloudMarriageCouple,
  deleteCloudMedicalExam,
  deleteCloudMissionEntry,
  deleteCloudReadingLog,
  deleteCloudRecurringCost,
  deleteCloudSpiritualLog,
  deleteCloudTacticalExpense,
  deleteCloudTransaction,
  ensureInitialCloudFortress,
  replaceCloudFortress,
  sanitizeSpiritualState,
  sanitizeVocationalState,
  subscribeFortressCloud,
  syncFortressFields,
  toggleCloudMissionEntry,
  toggleCloudRecurringCost,
  updateCloudMarriageCouple,
  updateCloudMedicalExam,
  updateCloudReadingLog,
} from './services/fortressSync';
import {
  DEFAULT_STATE,
  LEGACY_STORAGE_KEY,
  ORACLE_QUOTES,
  PM_EQUIPMENT_ITEMS,
  PROVIDER_TASKS,
  REAL_EXAMS_SEEDED_KEY,
  REAL_INITIAL_MEDICAL_EXAMS,
  RELICS,
  STORAGE_KEY,
  TCC_STAGES,
  VAULTS,
} from './data/chroniclesData';
import type {
  AppState,
  EnemyConfig,
  FeudChecklistState,
  LedgerEntry,
  MarriageCouple,
  MarriageCoupleStatus,
  MedicalExamEntry,
  MedicalExamStatus,
  MedicalExamType,
  MissionEntry,
  MissionEntryModule,
  ProviderFocusSection,
  ReadingCategory,
  ReadingLog,
  RecurringCost,
  SpiritualActType,
  SpiritualLog,
  SpiritualState,
  TabId,
  TacticalExpenseEntry,
  ToastItem,
  TransactionEntry,
  VaultId,
  VictoryModalData,
  VocationalState,
} from './types/chronicles';
import { detectCoupleScheduleConflicts, formatDateBr } from './utils/scheduleConflicts';
import {
  evaluateArca1CostRisk,
  formatBRL,
  getConqueredFeudsCount,
  recordDailyXp,
} from './utils/formatters';
import {
  computeSpiritualMultiplier,
  diffDaysIso,
  evaluateSoulWatchAlert,
  getEffectiveSpiritualDailyGoals,
  getLocalDateStr,
  getSpiritualActDefinition,
} from './utils/spiritual';
import { fetchLocalWeather, resolveEffectiveWeather } from './services/weatherService';
import type {
  GeolocationStatus,
  LiveWeatherReading,
  WeatherMode,
} from './types/weather';
import { soundFx } from './utils/sound';
import { useGlobalTilt3D } from './utils/tilt3d';

function resolveXpHistory(parsed: Partial<AppState>): Record<string, number> {
  if (parsed.xpHistory && typeof parsed.xpHistory === 'object') {
    const clean: Record<string, number> = {};
    Object.entries(parsed.xpHistory).forEach(([k, v]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
        const val = Math.max(0, Math.round(Number(v) || 0));
        if (val > 0) clean[k] = val;
      }
    });
    return clean;
  }

  let seeded: Record<string, number> = {};
  if (Array.isArray(parsed.transactions)) {
    for (const tx of parsed.transactions) {
      const txDate = new Date(tx.dateIso);
      if (!Number.isNaN(txDate.getTime())) {
        seeded = recordDailyXp(seeded, tx.vaultId === 'cdi' ? 100 : 80, txDate);
      }
    }
  }
  return seeded;
}

function loadInitialState(): AppState {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      providerDuties: parsed.providerDuties || {},
      letters: Array.isArray(parsed.letters) ? parsed.letters : [],
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      recurringCosts: Array.isArray(parsed.recurringCosts) ? parsed.recurringCosts : [],
      tacticalExpenses: Array.isArray(parsed.tacticalExpenses) ? parsed.tacticalExpenses : [],
      unlockedMilestones: parsed.unlockedMilestones || {},
      xpHistory: resolveXpHistory(parsed),
      feudChecklist: {
        ...DEFAULT_STATE.feudChecklist,
        ...(parsed.feudChecklist || {}),
      },
      spiritual: sanitizeSpiritualState(parsed.spiritual),
      spiritualLogs: Array.isArray(parsed.spiritualLogs) ? parsed.spiritualLogs : [],
      vocational: sanitizeVocationalState(parsed.vocational),
      missionEntries: Array.isArray(parsed.missionEntries) ? parsed.missionEntries : [],
      marriageCouples: Array.isArray(parsed.marriageCouples) ? parsed.marriageCouples : [],
      readingLogs: Array.isArray(parsed.readingLogs) ? parsed.readingLogs : [],
      medicalExams: (() => {
        const existing = Array.isArray(parsed.medicalExams) ? parsed.medicalExams : [];
        if (existing.length > 0) return existing;
        try {
          if (localStorage.getItem(REAL_EXAMS_SEEDED_KEY) !== '1') {
            localStorage.setItem(REAL_EXAMS_SEEDED_KEY, '1');
            return structuredClone(REAL_INITIAL_MEDICAL_EXAMS);
          }
        } catch {
          return structuredClone(REAL_INITIAL_MEDICAL_EXAMS);
        }
        return existing;
      })(),
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export default function App() {
  useGlobalTilt3D();
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [victoryModal, setVictoryModal] = useState<VictoryModalData | null>(null);
  const [arenaOpen, setArenaOpen] = useState(false);
  const [arenaGateStage, setArenaGateStage] = useState<ArenaGateStage | null>(null);
  const [cockpitOpen, setCockpitOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [shieldSecondsLeft, setShieldSecondsLeft] = useState<number | null>(null);
  const [rewardBursts, setRewardBursts] = useState<RewardBurstItem[]>([]);
  const [costBannerDismissed, setCostBannerDismissed] = useState(false);
  const [enemyFrontAlert, setEnemyFrontAlert] = useState<TacticalExpenseEntry | null>(null);
  const [enemyFrontVignette, setEnemyFrontVignette] = useState(false);
  const [providerFocus, setProviderFocus] = useState<ProviderFocusSection>('all');
  const enemyFrontTimerRef = useRef<number | null>(null);
  const arenaGateTimersRef = useRef<number[]>([]);

  const [weatherMode, setWeatherMode] = useState<WeatherMode>(() => {
    try {
      const saved = localStorage.getItem('fortaleza_weather_mode');
      if (
        saved === 'auto' ||
        saved === 'clear' ||
        saved === 'rain' ||
        saved === 'snow' ||
        saved === 'mist'
      ) {
        return saved;
      }
    } catch {
      // Ignore storage read errors
    }
    return 'auto';
  });
  const [liveWeather, setLiveWeather] = useState<LiveWeatherReading | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle');
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('local');

  const stateRef = useRef(state);
  stateRef.current = state;
  const userRef = useRef<User | null>(null);
  userRef.current = user;
  const soundEnabledRef = useRef(state.soundEnabled);
  soundEnabledRef.current = state.soundEnabled;

  useEffect(() => {
    const onQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', onQuota);
      if (enemyFrontTimerRef.current !== null) {
        window.clearTimeout(enemyFrontTimerRef.current);
      }
      arenaGateTimersRef.current.forEach((id) => window.clearTimeout(id));
      arenaGateTimersRef.current = [];
    };
  }, []);

  const triggerRewardBurst = useCallback(
    (label: string, tone: 'gold' | 'emerald' = 'gold', coinCount = 14) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const coins = Array.from({ length: coinCount }, (_, i) => ({
        key: `${id}_${i}`,
        leftPct: 30 + Math.random() * 40,
        topPct: 28 + Math.random() * 18,
        dxMid: Math.round((Math.random() - 0.5) * 140),
        dxEnd: Math.round((Math.random() - 0.5) * 240),
        delayMs: Math.round(Math.random() * 160),
      }));
      setRewardBursts((prev) => [...prev.slice(-2), { id, label, tone, coins }]);
      window.setTimeout(() => {
        setRewardBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1350);
    },
    []
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message: string, tone: ToastItem['tone'] = 'gold') => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, tone }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 3800);
    },
    [dismissToast]
  );

  const requestGeolocationWeather = useCallback(
    (silent = false) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        setGeoStatus('unavailable');
        if (!silent) {
          showToast(
            'Geolocalização Indisponível',
            'Este navegador não oferece suporte ao GPS local.',
            'red'
          );
        }
        return;
      }

      setGeoStatus('locating');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const reading = await fetchLocalWeather(
              pos.coords.latitude,
              pos.coords.longitude
            );
            setLiveWeather(reading);
            setGeoStatus('ready');
            if (!silent) {
              soundFx.chime(soundEnabledRef.current);
              showToast(
                'Clima Local Sincronizado',
                `${reading.locationLabel}: ${reading.description}${
                  reading.temperatureC !== null ? ` (${reading.temperatureC}°C)` : ''
                }.`,
                'emerald'
              );
            }
          } catch (err: unknown) {
            setGeoStatus('error');
            if (!silent) {
              showToast(
                'Falha Climática',
                err instanceof Error
                  ? err.message
                  : 'Não foi possível carregar a previsão local.',
                'red'
              );
            }
          }
        },
        (err) => {
          const denied = err.code === err.PERMISSION_DENIED;
          setGeoStatus(denied ? 'denied' : 'error');
          if (!silent) {
            showToast(
              denied ? 'Permissão de GPS Negada' : 'Sinal de GPS Indisponível',
              denied
                ? 'Libere o acesso à localização no navegador ou escolha o clima manualmente.'
                : 'Não foi possível obter suas coordenadas agora.',
              'gold'
            );
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    },
    [showToast]
  );

  useEffect(() => {
    requestGeolocationWeather(true);
  }, [requestGeolocationWeather]);

  const handleChangeWeatherMode = useCallback((nextMode: WeatherMode) => {
    setWeatherMode(nextMode);
    try {
      localStorage.setItem('fortaleza_weather_mode', nextMode);
    } catch {
      // Ignore storage errors
    }
    soundFx.chime(soundEnabledRef.current);
  }, []);

  const celebrateRelicUnlocks = useCallback(
    (
      prevState: AppState,
      nextState: AppState,
      baseVictoryModal?: VictoryModalData
    ): boolean => {
      const newlyUnlocked = RELICS.filter(
        (relic) => !relic.isUnlocked(prevState) && relic.isUnlocked(nextState)
      );

      if (baseVictoryModal) {
        setVictoryModal(
          newlyUnlocked.length > 0
            ? {
                ...baseVictoryModal,
                celebration: 'divine-confetti',
                unlockedRelics: newlyUnlocked.map((r) => ({ id: r.id, name: r.name })),
              }
            : baseVictoryModal
        );
        return newlyUnlocked.length > 0;
      }

      if (newlyUnlocked.length === 0) return false;

      const primary = newlyUnlocked[0];
      soundFx.victory(nextState.soundEnabled);
      setVictoryModal({
        kicker:
          newlyUnlocked.length > 1
            ? 'RELÍQUIAS FORJADAS NA SALA DE TROFÉUS'
            : 'NOVA RELÍQUIA FORJADA',
        title:
          newlyUnlocked.length > 1
            ? `${newlyUnlocked.length} Relíquias Desbloqueadas!`
            : primary.name,
        description:
          newlyUnlocked.length > 1
            ? `Sua constância desbloqueou novas relíquias na Sala de Troféus: ${newlyUnlocked
                .map((r) => r.name)
                .join(' · ')}.`
            : `${primary.requirement} — Honra eterna registrada na Sala de Troféus!`,
        celebration: 'divine-confetti',
        relicId: primary.id,
        unlockedRelics: newlyUnlocked.map((r) => ({ id: r.id, name: r.name })),
      });
      return true;
    },
    []
  );

  const runCloudSync = useCallback(
    async (task: (uid: string) => Promise<void>) => {
      const currentUser = userRef.current;
      if (!currentUser) return;
      setSyncStatus('syncing');
      try {
        await task(currentUser.uid);
        setSyncStatus('synced');
      } catch {
        setSyncStatus('error');
        showToast(
          'Falha na Nuvem',
          'Alteração salva localmente, mas não sincronizada com o servidor.',
          'red'
        );
      }
    },
    [showToast]
  );

  useEffect(() => {
    let active = true;
    let unsubCloud: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (nextUser) => {
      if (unsubCloud) {
        unsubCloud();
        unsubCloud = null;
      }

      if (!active) return;
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        setSyncStatus('local');
        return;
      }

      setSyncStatus('syncing');
      try {
        await ensureInitialCloudFortress(nextUser.uid, stateRef.current);
        if (!active) return;

        unsubCloud = subscribeFortressCloud(nextUser.uid, {
          onFortressData: (partial) => {
            setState((prev) => ({ ...prev, ...partial }));
            setSyncStatus('synced');
          },
          onTransactionsData: (transactions) => {
            setState((prev) => ({ ...prev, transactions }));
          },
          onLettersData: (letters) => {
            setState((prev) => ({ ...prev, letters }));
          },
          onRecurringCostsData: (recurringCosts) => {
            setState((prev) => ({ ...prev, recurringCosts }));
          },
          onTacticalExpensesData: (tacticalExpenses) => {
            setState((prev) => ({ ...prev, tacticalExpenses }));
          },
          onMissionEntriesData: (missionEntries) => {
            setState((prev) => ({ ...prev, missionEntries }));
          },
          onMarriageCouplesData: (marriageCouples) => {
            setState((prev) => ({ ...prev, marriageCouples }));
          },
          onReadingLogsData: (readingLogs) => {
            setState((prev) => ({ ...prev, readingLogs }));
          },
          onMedicalExamsData: (medicalExams) => {
            if (medicalExams.length === 0) {
              let alreadySeeded = false;
              try {
                alreadySeeded = localStorage.getItem(REAL_EXAMS_SEEDED_KEY) === '1';
                if (!alreadySeeded) {
                  localStorage.setItem(REAL_EXAMS_SEEDED_KEY, '1');
                }
              } catch {
                // Ignore storage errors
              }
              if (!alreadySeeded) {
                const seeded = structuredClone(REAL_INITIAL_MEDICAL_EXAMS);
                setState((prev) => ({ ...prev, medicalExams: seeded }));
                void Promise.all(
                  seeded.map((exam) => addCloudMedicalExam(nextUser.uid, exam))
                );
                return;
              }
            }
            setState((prev) => ({ ...prev, medicalExams }));
          },
          onSpiritualLogsData: (spiritualLogs) => {
            setState((prev) => ({ ...prev, spiritualLogs }));
          },
        });
      } catch {
        if (active) {
          setSyncStatus('error');
          showToast(
            'Erro na Sincronização',
            'Não foi possível conectar à fortaleza na nuvem.',
            'red'
          );
        }
      }
    });

    return () => {
      active = false;
      unsubAuth();
      if (unsubCloud) unsubCloud();
    };
  }, [showToast]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      soundFx.chime(stateRef.current.soundEnabled);
      showToast(
        'Sincronização Ativa',
        'Fortaleza conectada à nuvem com sua conta Google.',
        'emerald'
      );
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      showToast(
        'Erro ao Entrar',
        'Não foi possível autenticar com o Google neste momento.',
        'red'
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast(
        'Desconectado da Nuvem',
        'Seu progresso permanece salvo localmente neste dispositivo.',
        'gold'
      );
    } catch {
      showToast('Erro ao Sair', 'Não foi possível encerrar a sessão.', 'red');
    }
  };

  // 60-second Impulse Shield countdown timer
  useEffect(() => {
    if (shieldSecondsLeft === null) return;
    if (shieldSecondsLeft <= 0) {
      setShieldSecondsLeft(null);
      const cur = stateRef.current;
      const nextState: AppState = {
        ...cur,
        xp: cur.xp + 100,
        xpHistory: recordDailyXp(cur.xpHistory, 100),
        streak: (cur.streak || 0) + 1,
      };
      setState(nextState);
      void runCloudSync((uid) => syncFortressFields(uid, nextState));
      soundFx.shield(soundEnabledRef.current);
      triggerRewardBurst('+100 XP · Escudo Vitorioso!', 'emerald', 12);
      celebrateRelicUnlocks(cur, nextState);
      showToast(
        'Tentação Derrotada!',
        'Escudo mantido por 60 segundos em oração (+100 XP).',
        'emerald'
      );
      return;
    }

    if (shieldSecondsLeft <= 5) {
      soundFx.tick(soundEnabledRef.current);
    }

    const timer = window.setTimeout(() => {
      setShieldSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [shieldSecondsLeft, showToast, triggerRewardBurst, runCloudSync, celebrateRelicUnlocks]);

  // Vigília da Alma: decaimento diário idempotente se passar dias sem registrar oração
  useEffect(() => {
    if (!authReady) return;
    const todayStr = getLocalDateStr();
    const cur = stateRef.current;
    const evalWatch = evaluateSoulWatchAlert(
      cur.spiritual,
      cur.spiritualLogs || [],
      todayStr
    );
    if (evalWatch.pendingDecayXp <= 0) return;

    const currentSpiritual = sanitizeSpiritualState(cur.spiritual);
    const nextSpiritual: SpiritualState = {
      ...currentSpiritual,
      spiritualXp: Math.max(0, currentSpiritual.spiritualXp - evalWatch.pendingDecayXp),
      lastDecayDate: todayStr,
      decayedXpTotal: (currentSpiritual.decayedXpTotal || 0) + evalWatch.pendingDecayXp,
    };

    const nextState: AppState = {
      ...cur,
      spiritual: nextSpiritual,
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    showToast(
      'Vigília da Alma · Chamado à Oração',
      `${evalWatch.daysInactive} dia(s) sem registro de oração (-${evalWatch.pendingDecayXp} XP Espiritual). Reze hoje para restaurar sua luz.`,
      'red'
    );
  }, [
    authReady,
    state.spiritual?.lastPrayerDate,
    state.spiritual?.lastDecayDate,
    state.spiritual?.pmDutyDate,
    runCloudSync,
    showToast,
  ]);

  const handleSelectTab = (tab: TabId) => {
    const nextState: AppState = { ...stateRef.current, activeTab: tab };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
  };

  const handlePrevQuote = (poolLength = ORACLE_QUOTES.length) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      oracleIdx: (cur.oracleIdx - 1 + poolLength) % poolLength,
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
  };

  const handleNextQuote = (poolLength = ORACLE_QUOTES.length) => {
    const cur = stateRef.current;
    soundFx.chime(cur.soundEnabled);
    const nextState: AppState = {
      ...cur,
      oracleIdx: (cur.oracleIdx + 1) % poolLength,
      xp: cur.xp + 50,
      xpHistory: recordDailyXp(cur.xpHistory, 50),
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    triggerRewardBurst('+50 XP · Sabedoria', 'gold', 8);
    showToast(
      'Sabedoria Adquirida',
      '+50 XP pela meditação nas palavras dos santos.',
      'gold'
    );
  };

  const handleStartShield = () => {
    soundFx.shield(stateRef.current.soundEnabled);
    setShieldSecondsLeft(60);
    showToast(
      'Escudo Erguido',
      'Permaneça em vigília e reze durante 60 segundos.',
      'gold'
    );
  };

  const handleCancelShield = () => {
    setShieldSecondsLeft(null);
    showToast('Vigília Interrompida', 'O escudo foi recolhido.', 'red');
  };

  const handleUpdateVault = (
    vaultId: VaultId,
    amount: number,
    mode: 'deposit' | 'set'
  ) => {
    const vaultCfg = VAULTS.find((v) => v.id === vaultId)!;
    const key = `box${vaultId}` as 'box1' | 'box2' | 'box3' | 'box4';
    const currentVal = state[key] || 0;
    const nextVal = mode === 'deposit' ? currentVal + amount : amount;
    const diff = Math.round((nextVal - currentVal) * 100) / 100;
    const nowIso = new Date().toISOString();

    const milestoneKey = `vault_${vaultId}_complete`;
    const reachedNow =
      nextVal >= vaultCfg.target && !state.unlockedMilestones[milestoneKey];

    const entryId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newEntry: LedgerEntry = {
      id: entryId,
      vaultId,
      label: `${vaultCfg.roman} · ${vaultCfg.title}`,
      amount,
      mode,
      dateIso: nowIso,
    };

    const newTransaction: TransactionEntry = {
      id: entryId,
      vaultId,
      vaultName: `${vaultCfg.roman} · ${vaultCfg.title}`,
      previousValue: currentVal,
      newValue: nextVal,
      difference: diff,
      dateIso: nowIso,
    };

    const cur = stateRef.current;
    const xpGain = 80 + (reachedNow ? 300 : 0);
    const nextState: AppState = {
      ...cur,
      [key]: nextVal,
      xp: cur.xp + xpGain,
      xpHistory: recordDailyXp(cur.xpHistory, xpGain),
      ledger: [newEntry, ...(cur.ledger || [])].slice(0, 60),
      transactions: [newTransaction, ...(cur.transactions || [])].slice(0, 100),
      unlockedMilestones: reachedNow
        ? { ...cur.unlockedMilestones, [milestoneKey]: true }
        : cur.unlockedMilestones,
    };
    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        syncFortressFields(uid, nextState),
        addCloudTransaction(uid, newTransaction),
      ]);
    });

    if (reachedNow) {
      soundFx.victory(cur.soundEnabled);
      triggerRewardBurst(`+380 XP · ${vaultCfg.roman} Concluída!`, 'emerald', 22);
      celebrateRelicUnlocks(cur, nextState, {
        kicker: `${vaultCfg.roman.toUpperCase()} CONCLUÍDA`,
        title: vaultCfg.title,
        description: `Você atingiu a meta de ${formatBRL(
          vaultCfg.target
        )} com disciplina e honra (+380 XP)!`,
      });
    } else {
      soundFx.coins(cur.soundEnabled);
      triggerRewardBurst(
        `${diff >= 0 ? '+' : ''}${formatBRL(diff)} · +80 XP`,
        'gold',
        16
      );
      celebrateRelicUnlocks(cur, nextState);
      showToast(
        'Tesouro Atualizado',
        `${vaultCfg.roman} ajustada para ${formatBRL(nextVal)} (+80 XP).`,
        'emerald'
      );
    }
  };

  const handleHarvestCdi = (amount: number) => {
    const cur = stateRef.current;
    const prevBox2 = cur.box2 || 0;
    const nextBox2 = prevBox2 + amount;
    const nowIso = new Date().toISOString();
    const milestoneKey = 'vault_2_complete';
    const reachedNow =
      nextBox2 >= 12000 && !cur.unlockedMilestones[milestoneKey];

    const entryId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newEntry: LedgerEntry = {
      id: entryId,
      vaultId: 'cdi',
      label: 'Colheita CDI → Muralha da Família',
      amount,
      mode: 'cdi',
      dateIso: nowIso,
    };

    const newTransaction: TransactionEntry = {
      id: entryId,
      vaultId: 'cdi',
      vaultName: 'Colheita CDI → Arca II (Muralha)',
      previousValue: prevBox2,
      newValue: nextBox2,
      difference: amount,
      dateIso: nowIso,
    };

    const cdiXpGain = 100 + (reachedNow ? 300 : 0);
    const nextState: AppState = {
      ...cur,
      cdiTotal: (cur.cdiTotal || 0) + amount,
      box2: (cur.box2 || 0) + amount,
      xp: cur.xp + cdiXpGain,
      xpHistory: recordDailyXp(cur.xpHistory, cdiXpGain),
      ledger: [newEntry, ...(cur.ledger || [])].slice(0, 60),
      transactions: [newTransaction, ...(cur.transactions || [])].slice(0, 100),
      unlockedMilestones: reachedNow
        ? { ...cur.unlockedMilestones, [milestoneKey]: true }
        : cur.unlockedMilestones,
    };
    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        syncFortressFields(uid, nextState),
        addCloudTransaction(uid, newTransaction),
      ]);
    });

    if (reachedNow) {
      soundFx.victory(cur.soundEnabled);
      triggerRewardBurst(`+${formatBRL(amount)} · +400 XP`, 'emerald', 22);
      celebrateRelicUnlocks(cur, nextState, {
        kicker: 'MURALHA ERGUIDA',
        title: 'Cidadela de São José Conquistada',
        description:
          'Com os rendimentos colhidos, a Muralha da Família atingiu 100% da meta de R$ 12.000,00!',
      });
    } else {
      soundFx.coins(cur.soundEnabled);
      triggerRewardBurst(`+${formatBRL(amount)} CDI · +100 XP`, 'gold', 16);
      celebrateRelicUnlocks(cur, nextState);
      showToast(
        'Ouro Colhido',
        `+${formatBRL(amount)} somados à Muralha da Família (+100 XP).`,
        'gold'
      );
    }
  };

  const handleDeleteTransaction = (entryId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      ledger: (cur.ledger || []).filter((e) => e.id !== entryId),
      transactions: (cur.transactions || []).filter((t) => t.id !== entryId),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudTransaction(uid, entryId));
    showToast('Registro Removido', 'Linha excluída do extrato de movimentações.', 'gold');
  };

  const handleAddRecurringCost = (costData: Omit<RecurringCost, 'id'>) => {
    const cur = stateRef.current;
    const newCost: RecurringCost = {
      ...costData,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    const nextCosts = [newCost, ...(cur.recurringCosts || [])].slice(0, 50);
    const nextState: AppState = { ...cur, recurringCosts: nextCosts };
    setState(nextState);
    setCostBannerDismissed(false);
    void runCloudSync((uid) => addCloudRecurringCost(uid, newCost));

    const nextRisk = evaluateArca1CostRisk(nextState.box1 || 0, nextCosts);
    if (nextRisk.level !== 'safe') {
      soundFx.shield(cur.soundEnabled);
      showToast(
        'Vigília em Alerta',
        `${newCost.name} (${formatBRL(newCost.amount)}) aproxima os custos da meta da Arca I.`,
        'red'
      );
    } else {
      soundFx.chime(cur.soundEnabled);
      showToast(
        'Custo em Vigília',
        `${newCost.name} (${formatBRL(newCost.amount)}/mês) registrado no radar.`,
        'gold'
      );
    }
  };

  const handleToggleRecurringCost = (costId: string) => {
    const cur = stateRef.current;
    const target = (cur.recurringCosts || []).find((c) => c.id === costId);
    if (!target) return;
    const nextActive = !target.active;
    const nextCosts = (cur.recurringCosts || []).map((c) =>
      c.id === costId ? { ...c, active: nextActive } : c
    );
    setState({ ...cur, recurringCosts: nextCosts });
    setCostBannerDismissed(false);
    void runCloudSync((uid) => toggleCloudRecurringCost(uid, costId, nextActive));
    soundFx.chime(cur.soundEnabled);
  };

  const handleDeleteRecurringCost = (costId: string) => {
    const cur = stateRef.current;
    const nextCosts = (cur.recurringCosts || []).filter((c) => c.id !== costId);
    setState({ ...cur, recurringCosts: nextCosts });
    setCostBannerDismissed(false);
    void runCloudSync((uid) => deleteCloudRecurringCost(uid, costId));
    showToast('Custo Removido', 'Despesa recorrente retirada da vigília.', 'gold');
  };

  const handleRecordTacticalExpense = (entry: TacticalExpenseEntry) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      xp: Math.max(0, cur.xp + entry.xpDelta),
      xpHistory: recordDailyXp(cur.xpHistory, entry.xpDelta),
      streak: entry.streakReset ? 0 : cur.streak,
      tacticalExpenses: [entry, ...(cur.tacticalExpenses || [])].slice(0, 40),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        syncFortressFields(uid, nextState),
        addCloudTacticalExpense(uid, entry),
      ]);
    });

    if (entry.classification === 'impulso') {
      soundFx.warDrums(cur.soundEnabled);
      setEnemyFrontAlert(entry);
      setEnemyFrontVignette(true);
      if (enemyFrontTimerRef.current !== null) {
        window.clearTimeout(enemyFrontTimerRef.current);
      }
      enemyFrontTimerRef.current = window.setTimeout(() => {
        setEnemyFrontVignette(false);
      }, 4500);

      showToast(
        'Inimigo no Front!',
        `${entry.xpDelta} XP · Sequência de dias invictos zerada por gasto fora do plano.`,
        'red'
      );
      return;
    }

    if (entry.classification === 'suprimento') {
      soundFx.coins(cur.soundEnabled);
      triggerRewardBurst(`+${entry.xpDelta} XP · Suprimento Previsto`, 'emerald', 12);
      celebrateRelicUnlocks(cur, nextState);
      showToast(
        'Suprimento Confirmado',
        `Disciplina da tropa reforçada (+${entry.xpDelta} XP).`,
        'emerald'
      );
      return;
    }

    soundFx.chime(cur.soundEnabled);
    triggerRewardBurst(`+${entry.xpDelta} XP · Conta Operacional`, 'gold', 6);
    celebrateRelicUnlocks(cur, nextState);
    showToast(
      'Lançamento Operacional',
      `Impacto registrado na conta operacional (+${entry.xpDelta} XP).`,
      'gold'
    );
  };

  const handleDeleteTacticalExpense = (expenseId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      tacticalExpenses: (cur.tacticalExpenses || []).filter((e) => e.id !== expenseId),
    };
    setState(nextState);
    setEnemyFrontAlert((prev) => (prev?.id === expenseId ? null : prev));
    void runCloudSync((uid) => deleteCloudTacticalExpense(uid, expenseId));
    showToast('Relatório Removido', 'Registro excluído do diário tático.', 'gold');
  };

  const handleUpdateCarValue = (value: number) => {
    const cur = stateRef.current;
    const nextState: AppState = { ...cur, currentCarValue: value };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    soundFx.chime(cur.soundEnabled);
    showToast(
      'Montaria Atualizada',
      `Valor base do veículo atual ajustado para ${formatBRL(value)}.`,
      'gold'
    );
  };

  const handleToggleDuty = (index: number) => {
    const cur = stateRef.current;
    const wasDone = !!cur.providerDuties[index];
    const nextDone = !wasDone;
    soundFx.chime(cur.soundEnabled);
    const dutyDelta = nextDone ? 120 : -120;
    const nextState: AppState = {
      ...cur,
      providerDuties: { ...cur.providerDuties, [index]: nextDone },
      xp: Math.max(0, cur.xp + dutyDelta),
      xpHistory: recordDailyXp(cur.xpHistory, dutyDelta),
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    if (nextDone) {
      celebrateRelicUnlocks(cur, nextState);
      showToast(
        'Honra de São José',
        `${PROVIDER_TASKS[index].title} concluído (+120 XP).`,
        'emerald'
      );
    }
  };

  const handleResetMonthlyDuties = () => {
    const nextState: AppState = { ...stateRef.current, providerDuties: {} };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    showToast(
      'Novo Ciclo Mensal',
      'Os 6 deveres de São José foram abertos para o novo mês.',
      'gold'
    );
  };

  const buildSpiritualProgression = (
    cur: AppState,
    actType: SpiritualActType,
    dateStr: string,
    notes: string
  ): {
    nextSpiritual: SpiritualState;
    newLog: SpiritualLog;
    xpGranted: number;
    multiplierApplied: number;
    unlockedSealNow: boolean;
  } => {
    const todayStr = getLocalDateStr();
    const cleanDate = dateStr || todayStr;
    const curSpiritual = sanitizeSpiritualState(cur.spiritual);
    const def = getSpiritualActDefinition(actType);

    const prevGoalsToday = getEffectiveSpiritualDailyGoals(curSpiritual, todayStr);
    const hadSealBefore = (Object.values(prevGoalsToday) as boolean[]).every(Boolean);

    const nextGoalsToday = { ...prevGoalsToday };
    if (cleanDate === todayStr && def.goalKey) {
      nextGoalsToday[def.goalKey] = true;
    }
    const hasSealNow = (Object.values(nextGoalsToday) as boolean[]).every(Boolean);
    const unlockedSealNow = !hadSealBefore && hasSealNow && cleanDate === todayStr;

    const previewSpiritualForMult: SpiritualState = {
      ...curSpiritual,
      dailyGoalDate: cleanDate === todayStr ? todayStr : curSpiritual.dailyGoalDate,
      dailyGoals: cleanDate === todayStr ? nextGoalsToday : curSpiritual.dailyGoals,
    };
    const tempLog: SpiritualLog = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      actType,
      actLabel: def.label,
      dateStr: cleanDate,
      notes: notes.trim(),
      baseXp: def.baseXp,
      multiplierApplied: 1,
      xpGranted: def.baseXp,
      createdAtIso: new Date().toISOString(),
    };
    const multEval = computeSpiritualMultiplier(
      previewSpiritualForMult,
      [tempLog, ...(cur.spiritualLogs || [])],
      cleanDate
    );

    const xpGranted = Math.round(def.baseXp * multEval.multiplier);
    const finalLog: SpiritualLog = {
      ...tempLog,
      multiplierApplied: multEval.multiplier,
      xpGranted,
    };

    let nextNovenaStreak = curSpiritual.novenaStreak || 0;
    let nextNovenaLastDate = curSpiritual.novenaLastDate || '';
    if (actType === 'novena_sao_jose') {
      if (!nextNovenaLastDate) {
        nextNovenaStreak = 1;
        nextNovenaLastDate = cleanDate;
      } else if (cleanDate > nextNovenaLastDate) {
        const gap = diffDaysIso(nextNovenaLastDate, cleanDate);
        nextNovenaStreak = gap <= 1 ? nextNovenaStreak + 1 : 1;
        nextNovenaLastDate = cleanDate;
      }
    }

    const nextLastPrayerDate =
      !curSpiritual.lastPrayerDate || cleanDate > curSpiritual.lastPrayerDate
        ? cleanDate
        : curSpiritual.lastPrayerDate;

    const nextSpiritual: SpiritualState = {
      ...curSpiritual,
      spiritualXp: Math.min(100_000_000, curSpiritual.spiritualXp + xpGranted),
      lastPrayerDate: nextLastPrayerDate,
      novenaStreak: nextNovenaStreak,
      novenaLastDate: nextNovenaLastDate,
      dailyGoalDate: todayStr,
      dailyGoals: nextGoalsToday,
    };

    return {
      nextSpiritual,
      newLog: finalLog,
      xpGranted,
      multiplierApplied: multEval.multiplier,
      unlockedSealNow,
    };
  };

  const handleLogSpiritualAct = (data: {
    actType: SpiritualActType;
    dateStr: string;
    notes: string;
  }) => {
    const cur = stateRef.current;
    const prog = buildSpiritualProgression(cur, data.actType, data.dateStr, data.notes);
    const nextState: AppState = {
      ...cur,
      xp: cur.xp + prog.xpGranted,
      xpHistory: recordDailyXp(cur.xpHistory, prog.xpGranted),
      spiritual: prog.nextSpiritual,
      spiritualLogs: [prog.newLog, ...(cur.spiritualLogs || [])].slice(0, 120),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        syncFortressFields(uid, nextState),
        addCloudSpiritualLog(uid, prog.newLog),
      ]);
    });

    if (prog.unlockedSealNow) {
      soundFx.victory(cur.soundEnabled);
      triggerRewardBurst(
        `+${prog.xpGranted} XP · Selo de Comunhão Ativo!`,
        'emerald',
        18
      );
      showToast(
        'Selo de Comunhão com Deus!',
        `Metas diárias cumpridas! Multiplicador espiritual elevado para ${prog.multiplierApplied.toFixed(1)}x.`,
        'emerald'
      );
      return;
    }

    soundFx.rosary(cur.soundEnabled);
    triggerRewardBurst(
      `+${prog.xpGranted} XP Espiritual (${prog.multiplierApplied.toFixed(1)}x)`,
      'gold',
      10
    );
    showToast(
      prog.newLog.actLabel,
      `+${prog.xpGranted} XP Espiritual registrado na Vigília da Alma.`,
      'emerald'
    );
  };

  const handleDeleteSpiritualLog = (logId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      spiritualLogs: (cur.spiritualLogs || []).filter((l) => l.id !== logId),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudSpiritualLog(uid, logId));
    showToast('Registro Removido', 'Ato excluído do Diário Espiritual.', 'gold');
  };

  const handleTogglePmDutyMode = () => {
    const cur = stateRef.current;
    const todayStr = getLocalDateStr();
    const curSpiritual = sanitizeSpiritualState(cur.spiritual);
    const wasActive = curSpiritual.pmDutyDate === todayStr;
    const nextPmDutyDate = wasActive ? '' : todayStr;
    const nextState: AppState = {
      ...cur,
      spiritual: {
        ...curSpiritual,
        pmDutyDate: nextPmDutyDate,
      },
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    if (!wasActive) {
      soundFx.shield(cur.soundEnabled);
      showToast(
        'Fortitude no Plantão (24h) Ativada!',
        'Modo Plantão PMSE ativo hoje: todas as orações e devoções recebem XP Espiritual dobrado (2x).',
        'emerald'
      );
    } else {
      soundFx.chime(cur.soundEnabled);
      showToast(
        'Modo Plantão PMSE Encerrado',
        'Multiplicador espiritual retornou ao regime normal fora de escala.',
        'gold'
      );
    }
  };

  const handlePrayDecade = () => {
    const cur = stateRef.current;
    const currentDecades = cur.rosaryDecades || 0;
    const todayStr = getLocalDateStr();
    if (currentDecades >= 4) {
      const prog = buildSpiritualProgression(
        cur,
        'terco_completo',
        todayStr,
        `Santo Terço #${(cur.rosaryCompleted || 0) + 1} pela família`
      );
      soundFx.victory(cur.soundEnabled);
      const nextState: AppState = {
        ...cur,
        rosaryDecades: 0,
        rosaryCompleted: (cur.rosaryCompleted || 0) + 1,
        xp: cur.xp + 240,
        xpHistory: recordDailyXp(cur.xpHistory, 240),
        spiritual: prog.nextSpiritual,
        spiritualLogs: [prog.newLog, ...(cur.spiritualLogs || [])].slice(0, 120),
      };
      setState(nextState);
      void runCloudSync(async (uid) => {
        await Promise.all([
          syncFortressFields(uid, nextState),
          addCloudSpiritualLog(uid, prog.newLog),
        ]);
      });
      triggerRewardBurst('+240 XP · Terço Completo!', 'emerald', 16);
      celebrateRelicUnlocks(cur, nextState);
      showToast(
        'Terço Concluído!',
        `Terço #${(cur.rosaryCompleted || 0) + 1} ofertado pela família (+240 XP · +${prog.xpGranted} XP Espiritual).`,
        'emerald'
      );
    } else {
      const prog = buildSpiritualProgression(
        cur,
        'dezena',
        todayStr,
        `Mistério ${currentDecades + 1}/5 do Santo Terço`
      );
      soundFx.rosary(cur.soundEnabled);
      const nextState: AppState = {
        ...cur,
        rosaryDecades: currentDecades + 1,
        xp: cur.xp + 40,
        xpHistory: recordDailyXp(cur.xpHistory, 40),
        spiritual: prog.nextSpiritual,
        spiritualLogs: [prog.newLog, ...(cur.spiritualLogs || [])].slice(0, 120),
      };
      setState(nextState);
      void runCloudSync(async (uid) => {
        await Promise.all([
          syncFortressFields(uid, nextState),
          addCloudSpiritualLog(uid, prog.newLog),
        ]);
      });
      triggerRewardBurst('+40 XP · Dezena', 'gold', 6);
      showToast(
        'Dezena Meditada',
        `Mistério ${currentDecades + 1}/5 concluído (+40 XP · +${prog.xpGranted} XP Espiritual).`,
        'gold'
      );
    }
  };

  const handleSaveLetter = (title: string, body: string) => {
    const cur = stateRef.current;
    soundFx.chime(cur.soundEnabled);
    const newLetter = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      body,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    const nextState: AppState = {
      ...cur,
      letters: [newLetter, ...(cur.letters || [])],
      xp: cur.xp + 150,
      xpHistory: recordDailyXp(cur.xpHistory, 150),
    };
    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        syncFortressFields(uid, nextState),
        addCloudLetter(uid, newLetter),
      ]);
    });
    celebrateRelicUnlocks(cur, nextState);
    showToast(
      'Pergaminho Lacrado',
      'Carta selada na cápsula do tempo para 2027 (+150 XP).',
      'gold'
    );
  };

  const handleDeleteLetter = (id: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      letters: (cur.letters || []).filter((l) => l.id !== id),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudLetter(uid, id));
    showToast('Pergaminho Removido', 'Carta excluída da cápsula.', 'gold');
  };

  const handleToggleChecklist = (key: keyof FeudChecklistState) => {
    const cur = stateRef.current;
    const wasChecked = !!cur.feudChecklist[key];
    const nextChecked = !wasChecked;
    soundFx.chime(cur.soundEnabled);
    const checkDelta = nextChecked ? 150 : -150;
    const nextState: AppState = {
      ...cur,
      feudChecklist: { ...cur.feudChecklist, [key]: nextChecked },
      xp: Math.max(0, cur.xp + checkDelta),
      xpHistory: recordDailyXp(cur.xpHistory, checkDelta),
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    if (nextChecked) {
      showToast('Marco Territorial', 'Etapa de feudo conquistada (+150 XP).', 'emerald');
    }
  };

  const updateVocational = (
    updater: (prev: VocationalState) => VocationalState,
    xpDelta = 0,
    toastInfo?: { title: string; message: string; tone?: ToastItem['tone'] },
    burstLabel?: string
  ) => {
    const cur = stateRef.current;
    const nextVocational = updater(cur.vocational || DEFAULT_STATE.vocational);
    const nextState: AppState = {
      ...cur,
      vocational: nextVocational,
      xp: Math.max(0, cur.xp + xpDelta),
      xpHistory: xpDelta !== 0 ? recordDailyXp(cur.xpHistory, xpDelta) : cur.xpHistory,
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    if (xpDelta > 0) {
      soundFx.chime(cur.soundEnabled);
      if (burstLabel) triggerRewardBurst(burstLabel, 'emerald', 10);
    } else {
      soundFx.chime(cur.soundEnabled);
    }
    if (toastInfo) {
      showToast(toastInfo.title, toastInfo.message, toastInfo.tone ?? 'emerald');
    }
  };

  const handleSaveTccTheme = (theme: string) => {
    updateVocational(
      (v) => ({ ...v, tccTheme: theme }),
      0,
      {
        title: 'Tema do TCC Atualizado',
        message: 'Monografia de Segurança Pública (8º Período AGES) salva.',
        tone: 'gold',
      }
    );
  };

  const handleToggleTccStage = (stageKey: string) => {
    const curV = stateRef.current.vocational || DEFAULT_STATE.vocational;
    const nextDone = !curV.tccStages?.[stageKey];
    const stageInfo = TCC_STAGES.find((s) => s.key === stageKey);
    const delta = nextDone ? 120 : -120;
    const brainDelta = nextDone ? 60 : -60;
    updateVocational(
      (v) => ({
        ...v,
        tccStages: { ...v.tccStages, [stageKey]: nextDone },
        academicXp: Math.max(0, (v.academicXp || 0) + delta),
        brainXp: Math.max(0, (v.brainXp || 0) + brainDelta),
      }),
      delta,
      nextDone
        ? {
            title: 'Etapa do TCC Concluída',
            message: `${stageInfo?.title || 'Etapa'} (+120 XP Acadêmico · +60 XP Cerebral).`,
            tone: 'emerald',
          }
        : undefined,
      nextDone ? '+120 XP · TCC AGES' : undefined
    );
  };

  const handleToggleEquipment = (eqKey: string) => {
    const curV = stateRef.current.vocational || DEFAULT_STATE.vocational;
    const nextDone = !curV.pmEquipment?.[eqKey];
    const eqItem = PM_EQUIPMENT_ITEMS.find((i) => i.key === eqKey);
    updateVocational(
      (v) => ({
        ...v,
        pmEquipment: { ...v.pmEquipment, [eqKey]: nextDone },
      }),
      0,
      nextDone
        ? {
            title: 'Apronto Conferido',
            message: `${eqItem?.title || 'Equipamento'} pronto para o serviço.`,
            tone: 'gold',
          }
        : undefined
    );
  };

  const handleResetEquipment = () => {
    updateVocational(
      (v) => ({
        ...v,
        pmEquipment: { ...DEFAULT_STATE.vocational.pmEquipment },
      }),
      0,
      {
        title: 'Checklist Reiniciado',
        message: 'Equipamentos da 2ª Cia prontos para nova inspeção.',
        tone: 'gold',
      }
    );
  };

  const handleAddStudyHour = (track: 'cfo' | 'prf' | 'pf', label: string) => {
    updateVocational(
      (v) => ({
        ...v,
        brainXp: Math.min(100_000_000, (v.brainXp || 0) + 40),
        studyHours: {
          ...v.studyHours,
          [track]: Math.min(50000, (v.studyHours?.[track] || 0) + 1),
        },
      }),
      60,
      {
        title: `Estudo · ${label}`,
        message: '+1h acumulada na trilha de alta patente (+60 XP · +40 XP Cerebral).',
        tone: 'emerald',
      },
      `+60 XP · ${label}`
    );
  };

  const handleUpdatePullupTarget = (delta: number) => {
    updateVocational((v) => ({
      ...v,
      pullupTarget: Math.max(1, Math.min(100, (v.pullupTarget || 15) + delta)),
    }));
  };

  const handleTakeCreatineDose = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const curV = stateRef.current.vocational || DEFAULT_STATE.vocational;
    const dose = curV.creatineDailyDoseGrams || 5;
    if (curV.creatineLastTakenDate === todayIso || (curV.creatineStockGrams || 0) < dose) {
      return;
    }
    updateVocational(
      (v) => ({
        ...v,
        bodyXp: Math.min(100_000_000, (v.bodyXp || 0) + 25),
        creatineStockGrams: Math.max(0, Math.round((v.creatineStockGrams - dose) * 100) / 100),
        creatineLastTakenDate: todayIso,
      }),
      25,
      {
        title: 'Creatina Monohydrate',
        message: `Dose diária de ${dose}g registrada (+25 XP Corporal). Hidrate-se!`,
        tone: 'emerald',
      },
      '+25 XP · Creatina'
    );
  };

  const handleRefillCreatine = (grams: number) => {
    updateVocational(
      (v) => ({
        ...v,
        creatineStockGrams: Math.min(50000, (v.creatineStockGrams || 0) + grams),
      }),
      0,
      {
        title: 'Estoque Reabastecido',
        message: `+${grams}g de Creatina Monohydrate adicionados à Fortaleza Corporal.`,
        tone: 'gold',
      }
    );
  };

  const handleChangeCreatineDose = (doseGrams: number) => {
    updateVocational((v) => ({
      ...v,
      creatineDailyDoseGrams: doseGrams,
    }));
  };

  const handleToggleHealthCheck = (key: string) => {
    const curV = stateRef.current.vocational || DEFAULT_STATE.vocational;
    const nextDone = !curV.healthChecks?.[key];
    const bodyDelta = nextDone ? 20 : -20;
    updateVocational(
      (v) => ({
        ...v,
        bodyXp: Math.max(0, (v.bodyXp || 0) + bodyDelta),
        healthChecks: { ...v.healthChecks, [key]: nextDone },
      }),
      bodyDelta
    );
  };

  const handleAddMissionEntry = (
    module: MissionEntryModule,
    data: { title: string; detail: string; dateStr: string; timeStr: string },
    xpDelta = 0
  ) => {
    const cur = stateRef.current;
    const entry: MissionEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      module,
      title: data.title,
      detail: data.detail,
      dateStr: data.dateStr,
      timeStr: data.timeStr,
      completed: false,
      createdAtIso: new Date().toISOString(),
    };

    const nextState: AppState = {
      ...cur,
      xp: Math.max(0, cur.xp + xpDelta),
      xpHistory: xpDelta !== 0 ? recordDailyXp(cur.xpHistory, xpDelta) : cur.xpHistory,
      missionEntries: [entry, ...(cur.missionEntries || [])].slice(0, 80),
    };
    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        addCloudMissionEntry(uid, entry),
        ...(xpDelta !== 0 ? [syncFortressFields(uid, nextState)] : []),
      ]);
    });
    soundFx.chime(cur.soundEnabled);
    showToast('Registro Agendado', `${data.title} adicionado com sucesso.`, 'gold');
  };

  const handleLogWorkout = (data: {
    pullups: number;
    pushups: number;
    dips: number;
    dateStr: string;
  }) => {
    const cur = stateRef.current;
    const curV = cur.vocational || DEFAULT_STATE.vocational;
    const isNewRecord = data.pullups > (curV.pullupBest || 0);
    const entry: MissionEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      module: 'workout',
      title: `Calistenia: ${data.pullups} Barra · ${data.pushups} Flexões`,
      detail: `${data.dips} Paralelas${isNewRecord ? ' · Novo Recorde!' : ''}`,
      dateStr: data.dateStr,
      timeStr: new Date().toTimeString().slice(0, 5),
      completed: true,
      createdAtIso: new Date().toISOString(),
    };

    const xpGain = 75 + (isNewRecord ? 50 : 0);
    const nextState: AppState = {
      ...cur,
      xp: cur.xp + xpGain,
      xpHistory: recordDailyXp(cur.xpHistory, xpGain),
      vocational: {
        ...curV,
        bodyXp: Math.min(100_000_000, (curV.bodyXp || 0) + xpGain),
        pullupBest: Math.max(curV.pullupBest || 0, data.pullups),
        workoutsTotal: (curV.workoutsTotal || 0) + 1,
      },
      missionEntries: [entry, ...(cur.missionEntries || [])].slice(0, 80),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        syncFortressFields(uid, nextState),
        addCloudMissionEntry(uid, entry),
      ]);
    });

    soundFx.victory(cur.soundEnabled);
    triggerRewardBurst(
      isNewRecord ? `+${xpGain} XP · Novo Recorde na Barra!` : '+75 XP · Treino Concluído',
      'emerald',
      isNewRecord ? 16 : 10
    );
    showToast(
      isNewRecord ? 'Novo Recorde Pessoal!' : 'Treino Registrado',
      isNewRecord
        ? `${data.pullups} repetições na barra fixa! (+${xpGain} XP)`
        : `Sessão de calistenia registrada (+${xpGain} XP).`,
      'emerald'
    );
  };

  const handleToggleMissionEntry = (entryId: string, xpReward: number) => {
    const cur = stateRef.current;
    const target = (cur.missionEntries || []).find((e) => e.id === entryId);
    if (!target) return;
    const nextCompleted = !target.completed;
    const delta = nextCompleted ? xpReward : -xpReward;
    const curV = cur.vocational || DEFAULT_STATE.vocational;
    const academicDelta = target.module === 'exam' ? delta : 0;

    const nextEntries = (cur.missionEntries || []).map((e) =>
      e.id === entryId ? { ...e, completed: nextCompleted } : e
    );
    const nextState: AppState = {
      ...cur,
      xp: Math.max(0, cur.xp + delta),
      xpHistory: recordDailyXp(cur.xpHistory, delta),
      vocational:
        academicDelta !== 0
          ? {
              ...curV,
              academicXp: Math.max(0, (curV.academicXp || 0) + academicDelta),
            }
          : curV,
      missionEntries: nextEntries,
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        toggleCloudMissionEntry(uid, entryId, nextCompleted),
        syncFortressFields(uid, nextState),
      ]);
    });

    soundFx.chime(cur.soundEnabled);
    if (nextCompleted) {
      triggerRewardBurst(`+${xpReward} XP`, 'emerald', 10);
      showToast(
        'Missão Cumprida',
        `${target.title} concluída (+${xpReward} XP).`,
        'emerald'
      );
    }
  };

  const handleDeleteMissionEntry = (entryId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      missionEntries: (cur.missionEntries || []).filter((e) => e.id !== entryId),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudMissionEntry(uid, entryId));
    showToast('Registro Removido', 'Item excluído com sucesso.', 'gold');
  };

  const handleAddMarriageCouple = (data: {
    coupleNames: string;
    scheduledDate: string;
    scheduledTime: string;
    topic: string;
    notes: string;
    status: MarriageCoupleStatus;
  }) => {
    const cur = stateRef.current;
    const nowIso = new Date().toISOString();
    const couple: MarriageCouple = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      coupleNames: data.coupleNames.trim(),
      scheduledDate: data.scheduledDate.trim(),
      scheduledTime: data.scheduledTime.trim(),
      topic: data.topic.trim(),
      notes: data.notes.trim(),
      status: data.status,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    const xpDelta = couple.status === 'encontro_concluido' ? 90 : 0;
    const nextState: AppState = {
      ...cur,
      xp: Math.max(0, cur.xp + xpDelta),
      xpHistory: xpDelta !== 0 ? recordDailyXp(cur.xpHistory, xpDelta) : cur.xpHistory,
      marriageCouples: [couple, ...(cur.marriageCouples || [])].slice(0, 60),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        addCloudMarriageCouple(uid, couple),
        ...(xpDelta !== 0 ? [syncFortressFields(uid, nextState)] : []),
      ]);
    });

    const conflicts = detectCoupleScheduleConflicts(
      couple.scheduledDate,
      couple.scheduledTime,
      cur.missionEntries || []
    );

    soundFx.chime(cur.soundEnabled);
    if (xpDelta > 0) {
      triggerRewardBurst('+90 XP · Pastoral de Casais!', 'emerald', 10);
    }

    if (conflicts.length > 0) {
      showToast(
        'Atenção de Horário no Calendário',
        `${couple.coupleNames} (${formatDateBr(couple.scheduledDate)}): ${conflicts[0].reason}`,
        'gold'
      );
    } else {
      showToast(
        'Casal Registrado na Pastoral',
        `${couple.coupleNames} sincronizado com o Calendário Tático.`,
        'emerald'
      );
    }
  };

  const handleUpdateMarriageCouple = (
    coupleId: string,
    updates: {
      coupleNames: string;
      scheduledDate: string;
      scheduledTime: string;
      topic: string;
      notes: string;
      status: MarriageCoupleStatus;
    }
  ) => {
    const cur = stateRef.current;
    const existing = (cur.marriageCouples || []).find((c) => c.id === coupleId);
    if (!existing) return;

    const nowIso = new Date().toISOString();
    const updatedCouple: MarriageCouple = {
      ...existing,
      coupleNames: updates.coupleNames.trim() || existing.coupleNames,
      scheduledDate: updates.scheduledDate.trim(),
      scheduledTime: updates.scheduledTime.trim(),
      topic: updates.topic.trim(),
      notes: updates.notes.trim(),
      status: updates.status,
      updatedAtIso: nowIso,
    };

    const newlyCompleted =
      existing.status !== 'encontro_concluido' &&
      updatedCouple.status === 'encontro_concluido';
    const xpDelta = newlyCompleted ? 90 : 0;

    const nextState: AppState = {
      ...cur,
      xp: Math.max(0, cur.xp + xpDelta),
      xpHistory: xpDelta !== 0 ? recordDailyXp(cur.xpHistory, xpDelta) : cur.xpHistory,
      marriageCouples: (cur.marriageCouples || []).map((c) =>
        c.id === coupleId ? updatedCouple : c
      ),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        updateCloudMarriageCouple(uid, updatedCouple),
        ...(xpDelta !== 0 ? [syncFortressFields(uid, nextState)] : []),
      ]);
    });

    const conflicts = detectCoupleScheduleConflicts(
      updatedCouple.scheduledDate,
      updatedCouple.scheduledTime,
      cur.missionEntries || []
    );

    soundFx.chime(cur.soundEnabled);
    if (newlyCompleted) {
      triggerRewardBurst('+90 XP · Encontro Concluído!', 'emerald', 12);
    }

    if (conflicts.length > 0) {
      showToast(
        'Choque Detectado no Calendário',
        `${updatedCouple.coupleNames} (${formatDateBr(updatedCouple.scheduledDate)}): ${conflicts[0].reason}`,
        'gold'
      );
    } else {
      showToast(
        'Acompanhamento Atualizado',
        `${updatedCouple.coupleNames} atualizado e sincronizado no Calendário.`,
        'emerald'
      );
    }
  };

  const handleDeleteMarriageCouple = (coupleId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      marriageCouples: (cur.marriageCouples || []).filter((c) => c.id !== coupleId),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudMarriageCouple(uid, coupleId));
    showToast('Casal Removido', 'Registro pastoral excluído com sucesso.', 'gold');
  };

  const handleAddReadingLog = (data: {
    category: ReadingCategory;
    title: string;
    authorOrSource: string;
    pagesOrMinutes: number;
    notes: string;
    dateStr: string;
    completed: boolean;
  }) => {
    const cur = stateRef.current;
    const curV = cur.vocational || DEFAULT_STATE.vocational;
    const xpGain = data.completed ? 90 : 45;
    const log: ReadingLog = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category: data.category,
      title: data.title,
      authorOrSource: data.authorOrSource,
      pagesOrMinutes: data.pagesOrMinutes,
      notes: data.notes,
      dateStr: data.dateStr,
      completed: data.completed,
      xpGranted: xpGain,
      createdAtIso: new Date().toISOString(),
    };

    const nextState: AppState = {
      ...cur,
      xp: cur.xp + xpGain,
      xpHistory: recordDailyXp(cur.xpHistory, xpGain),
      vocational: {
        ...curV,
        brainXp: Math.min(100_000_000, (curV.brainXp || 0) + xpGain),
      },
      readingLogs: [log, ...(cur.readingLogs || [])].slice(0, 100),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        addCloudReadingLog(uid, log),
        syncFortressFields(uid, nextState),
      ]);
    });

    soundFx.chime(cur.soundEnabled);
    triggerRewardBurst(`+${xpGain} XP Cerebral · Sinapse Ativa`, 'emerald', 12);
    showToast(
      'Leitura Registrada',
      `${log.title} fortaleceu suas conexões cerebrais (+${xpGain} XP).`,
      'emerald'
    );
  };

  const handleToggleReadingComplete = (logId: string) => {
    const cur = stateRef.current;
    const curV = cur.vocational || DEFAULT_STATE.vocational;
    const target = (cur.readingLogs || []).find((l) => l.id === logId);
    if (!target) return;

    const nextCompleted = !target.completed;
    const bonusDelta = nextCompleted ? 45 : -45;
    const updatedLog: ReadingLog = {
      ...target,
      completed: nextCompleted,
      xpGranted: Math.max(0, (target.xpGranted || 45) + bonusDelta),
    };

    const nextState: AppState = {
      ...cur,
      xp: Math.max(0, cur.xp + bonusDelta),
      xpHistory: recordDailyXp(cur.xpHistory, bonusDelta),
      vocational: {
        ...curV,
        brainXp: Math.max(0, (curV.brainXp || 0) + bonusDelta),
      },
      readingLogs: (cur.readingLogs || []).map((l) =>
        l.id === logId ? updatedLog : l
      ),
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        updateCloudReadingLog(uid, updatedLog),
        syncFortressFields(uid, nextState),
      ]);
    });

    soundFx.chime(cur.soundEnabled);
    if (nextCompleted) {
      triggerRewardBurst('+45 XP Cerebral · Obra Concluída!', 'emerald', 10);
      showToast(
        'Leitura Concluída',
        `${target.title} finalizada (+45 XP cerebral extra).`,
        'emerald'
      );
    }
  };

  const handleDeleteReadingLog = (logId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      readingLogs: (cur.readingLogs || []).filter((l) => l.id !== logId),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudReadingLog(uid, logId));
    showToast('Registro Removido', 'Leitura excluída do módulo Mente & Conexões.', 'gold');
  };

  const handleAddMedicalExam = (data: {
    examType: MedicalExamType;
    examLabel: string;
    examDate: string;
    resultSummary: string;
    metricsDetail: string;
    status: MedicalExamStatus;
    notes: string;
  }) => {
    const cur = stateRef.current;
    const curV = cur.vocational || DEFAULT_STATE.vocational;
    const xpGain = 60;
    const exam: MedicalExamEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      examType: data.examType,
      examLabel: data.examLabel,
      examDate: data.examDate,
      resultSummary: data.resultSummary,
      metricsDetail: data.metricsDetail,
      status: data.status,
      notes: data.notes,
      createdAtIso: new Date().toISOString(),
    };

    const nextExams = [exam, ...(cur.medicalExams || [])]
      .sort((a, b) => (b.examDate || '').localeCompare(a.examDate || ''))
      .slice(0, 80);

    const nextState: AppState = {
      ...cur,
      xp: cur.xp + xpGain,
      xpHistory: recordDailyXp(cur.xpHistory, xpGain),
      vocational: {
        ...curV,
        bodyXp: Math.min(100_000_000, (curV.bodyXp || 0) + xpGain),
      },
      medicalExams: nextExams,
    };

    setState(nextState);
    void runCloudSync(async (uid) => {
      await Promise.all([
        addCloudMedicalExam(uid, exam),
        syncFortressFields(uid, nextState),
      ]);
    });

    soundFx.chime(cur.soundEnabled);
    triggerRewardBurst('+60 XP Corporal · Check-up Clínico', 'emerald', 10);
    showToast(
      'Exame Clínico Registrado',
      `${exam.examLabel} (${formatDateBr(exam.examDate)}) salvo na Fortaleza Corporal (+60 XP).`,
      'emerald'
    );
  };

  const handleCycleExamStatus = (examId: string) => {
    const cur = stateRef.current;
    const target = (cur.medicalExams || []).find((e) => e.id === examId);
    if (!target) return;

    const order: MedicalExamStatus[] = ['otimo', 'acompanhar', 'atencao'];
    const nextStatus = order[(order.indexOf(target.status) + 1) % order.length];
    const updatedExam: MedicalExamEntry = {
      ...target,
      status: nextStatus,
    };

    const nextState: AppState = {
      ...cur,
      medicalExams: (cur.medicalExams || []).map((e) =>
        e.id === examId ? updatedExam : e
      ),
    };
    setState(nextState);
    void runCloudSync((uid) => updateCloudMedicalExam(uid, updatedExam));
    soundFx.chime(cur.soundEnabled);
  };

  const handleDeleteMedicalExam = (examId: string) => {
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      medicalExams: (cur.medicalExams || []).filter((e) => e.id !== examId),
    };
    setState(nextState);
    void runCloudSync((uid) => deleteCloudMedicalExam(uid, examId));
    showToast('Exame Removido', 'Registro clínico excluído com sucesso.', 'gold');
  };

  const handleOpenOperationalCalendar = () => {
    handleSelectTab('comando');
    window.setTimeout(() => {
      document.getElementById('calendario-tatico')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 90);
  };

  const handleOpenProviderFocus = (focus: ProviderFocusSection) => {
    setProviderFocus(focus);
    handleSelectTab('provedor');
  };

  const handleWinBattle = (enemy: EnemyConfig) => {
    setArenaOpen(false);
    const cur = stateRef.current;
    const nextState: AppState = {
      ...cur,
      xp: cur.xp + enemy.xpReward,
      xpHistory: recordDailyXp(cur.xpHistory, enemy.xpReward),
      arenaWins: (cur.arenaWins || 0) + 1,
    };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
    triggerRewardBurst(`+${enemy.xpReward} XP · Vitória na Arena!`, 'emerald', 22);
    celebrateRelicUnlocks(cur, nextState, {
      kicker: 'GLÓRIA NO CAMPO DE BATALHA',
      title: `${enemy.name.toUpperCase()} ABATIDO!`,
      description: `Você superou ${enemy.title} com disciplina financeira, temperança e oração (+${enemy.xpReward} XP).`,
    });
  };

  const handleToggleSound = () => {
    const cur = stateRef.current;
    const nextState: AppState = { ...cur, soundEnabled: !cur.soundEnabled };
    setState(nextState);
    void runCloudSync((uid) => syncFortressFields(uid, nextState));
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronicas_familia_conceicao_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    soundFx.chime(state.soundEnabled);
    showToast(
      'Pergaminho Exportado',
      'Cópia de segurança em JSON salva com sucesso.',
      'emerald'
    );
  };

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppState>;
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.xp !== 'number') {
        showToast(
          'Arquivo Inválido',
          'O pergaminho selecionado não corresponde ao formato da fortaleza.',
          'red'
        );
        return;
      }
      const restoredState: AppState = {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        providerDuties: parsed.providerDuties || {},
        letters: Array.isArray(parsed.letters) ? parsed.letters : [],
        ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        recurringCosts: Array.isArray(parsed.recurringCosts) ? parsed.recurringCosts : [],
        tacticalExpenses: Array.isArray(parsed.tacticalExpenses) ? parsed.tacticalExpenses : [],
        unlockedMilestones: parsed.unlockedMilestones || {},
        xpHistory: resolveXpHistory(parsed),
        feudChecklist: {
          ...DEFAULT_STATE.feudChecklist,
          ...(parsed.feudChecklist || {}),
        },
        spiritual: sanitizeSpiritualState(parsed.spiritual),
        spiritualLogs: Array.isArray(parsed.spiritualLogs) ? parsed.spiritualLogs : [],
        vocational: sanitizeVocationalState(parsed.vocational),
        missionEntries: Array.isArray(parsed.missionEntries) ? parsed.missionEntries : [],
        marriageCouples: Array.isArray(parsed.marriageCouples) ? parsed.marriageCouples : [],
        readingLogs: Array.isArray(parsed.readingLogs) ? parsed.readingLogs : [],
        medicalExams: Array.isArray(parsed.medicalExams) ? parsed.medicalExams : [],
      };
      setState(restoredState);
      void runCloudSync((uid) => replaceCloudFortress(uid, restoredState));
      soundFx.victory(restoredState.soundEnabled);
      showToast(
        'Pergaminho Restaurado',
        'Todos os saldos, XP e cartas foram restaurados com sucesso.',
        'emerald'
      );
    } catch {
      showToast(
        'Erro na Leitura',
        'Não foi possível ler o arquivo JSON selecionado.',
        'red'
      );
    }
  };

  const handleConfirmReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const freshState = structuredClone(DEFAULT_STATE);
    setState(freshState);
    void runCloudSync((uid) => replaceCloudFortress(uid, freshState));
    setShieldSecondsLeft(null);
    setEnemyFrontAlert(null);
    setEnemyFrontVignette(false);
    setResetOpen(false);
    showToast(
      'Fortaleza Reiniciada',
      'Todos os registros foram limpos deste dispositivo.',
      'gold'
    );
  };

  const handleOpenArena = () => {
    if (arenaOpen || arenaGateStage !== null) return;

    arenaGateTimersRef.current.forEach((id) => window.clearTimeout(id));
    arenaGateTimersRef.current = [];

    const soundOn = stateRef.current.soundEnabled;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    soundFx.ironGateOpen(soundOn);

    if (prefersReducedMotion) {
      setArenaGateStage('fade-black');
      const tOpen = window.setTimeout(() => {
        soundFx.warDrums(soundEnabledRef.current);
        setArenaOpen(true);
        setArenaGateStage('reveal');
      }, 220);
      const tDone = window.setTimeout(() => {
        setArenaGateStage(null);
      }, 480);
      arenaGateTimersRef.current = [tOpen, tDone];
      return;
    }

    setArenaGateStage('fade-black');

    const tPartGates = window.setTimeout(() => {
      setArenaGateStage('part-gates');
    }, 340);

    const tDrums = window.setTimeout(() => {
      soundFx.warDrums(soundEnabledRef.current);
    }, 480);

    const tMountArena = window.setTimeout(() => {
      setArenaOpen(true);
      setArenaGateStage('reveal');
    }, 820);

    const tCleanup = window.setTimeout(() => {
      setArenaGateStage(null);
      arenaGateTimersRef.current = [];
    }, 1220);

    arenaGateTimersRef.current = [tPartGates, tDrums, tMountArena, tCleanup];
  };

  const handleInspectRecurringCosts = () => {
    handleSelectTab('rota');
    window.setTimeout(() => {
      document.getElementById('vigilia-de-custos')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 90);
  };

  const isShieldVigilActive = shieldSecondsLeft !== null && shieldSecondsLeft > 0;
  const arca1CostRisk = evaluateArca1CostRisk(state.box1 || 0, state.recurringCosts || []);
  const { count: feudsConqueredCount } = getConqueredFeudsCount(state);
  const weatherResolution = resolveEffectiveWeather({
    weatherMode,
    liveWeather,
    isShieldVigilActive,
    enemyFrontActive: enemyFrontVignette,
    arenaOpen,
    victoryModalOpen: victoryModal !== null,
    activeTab: state.activeTab,
    feudsConquered: feudsConqueredCount,
    arca1CostRiskLevel: arca1CostRisk.level,
  });

  return (
    <div className="min-h-screen flex flex-col relative">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <EmberCanvas />
      <WeatherAtmosphereOverlay condition={weatherResolution.effectiveCondition} />
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 war-vignette" />
      {isShieldVigilActive && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-30 siege-watch-vignette"
        />
      )}
      {enemyFrontVignette && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-30 enemy-front-vignette"
        />
      )}
      <SvgDefs />
      <IronSparkOverlay />
      <RewardJuiceOverlay bursts={rewardBursts} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <VictoryModal data={victoryModal} onClose={() => setVictoryModal(null)} />
      <ArenaModal
        isOpen={arenaOpen}
        soundEnabled={state.soundEnabled}
        onClose={() => setArenaOpen(false)}
        onWinBattle={handleWinBattle}
      />
      {arenaGateStage && <ArenaGateTransition stage={arenaGateStage} />}
      <CockpitModal
        isOpen={cockpitOpen}
        soundEnabled={state.soundEnabled}
        onClose={() => setCockpitOpen(false)}
      />
      <ResetModal
        isOpen={resetOpen}
        onCancel={() => setResetOpen(false)}
        onConfirm={handleConfirmReset}
      />

      <TopBar
        activeTab={state.activeTab}
        onSelectTab={handleSelectTab}
        onOpenArena={handleOpenArena}
        user={user}
        authReady={authReady}
        syncStatus={syncStatus}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="hud-3d-stage relative z-10 flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-6">
        {!costBannerDismissed && arca1CostRisk.level !== 'safe' && (
          <CostWatchBanner
            risk={arca1CostRisk}
            onInspectCosts={handleInspectRecurringCosts}
            onDismiss={() => setCostBannerDismissed(true)}
          />
        )}

        <CommandHud
          state={state}
          weatherMode={weatherMode}
          weatherResolution={weatherResolution}
          liveWeather={liveWeather}
          geoStatus={geoStatus}
          onChangeWeatherMode={handleChangeWeatherMode}
          onRequestGeolocation={() => requestGeolocationWeather(false)}
          onToggleSound={handleToggleSound}
          onNavigateTab={handleSelectTab}
          onOpenArena={handleOpenArena}
        />

        <div key={state.activeTab} className="tab-fade-slide">
          {state.activeTab === 'comando' && (
            <SanctuaryTab
              state={state}
              shieldSecondsLeft={shieldSecondsLeft}
              enemyFrontBanner={enemyFrontAlert}
              onDismissEnemyFront={() => {
                setEnemyFrontAlert(null);
                setEnemyFrontVignette(false);
              }}
              onRecordTacticalExpense={handleRecordTacticalExpense}
              onDeleteTacticalExpense={handleDeleteTacticalExpense}
              onPrevQuote={handlePrevQuote}
              onNextQuote={handleNextQuote}
              onStartShield={handleStartShield}
              onCancelShield={handleCancelShield}
              onOpenArena={handleOpenArena}
              onNavigateTab={handleSelectTab}
              onOpenProviderFocus={handleOpenProviderFocus}
              onAddMescShift={(data) => handleAddMissionEntry('mesc_shift', data)}
              onToggleMescShift={handleToggleMissionEntry}
            />
          )}

          {state.activeTab === 'rota' && (
            <TreasureTab
              state={state}
              onUpdateVault={handleUpdateVault}
              onHarvestCdi={handleHarvestCdi}
              onDeleteTransaction={handleDeleteTransaction}
              onAddRecurringCost={handleAddRecurringCost}
              onToggleRecurringCost={handleToggleRecurringCost}
              onDeleteRecurringCost={handleDeleteRecurringCost}
            />
          )}

          {state.activeTab === 'corolla' && (
            <ChariotTab
              state={state}
              onOpenCockpit={() => setCockpitOpen(true)}
              onUpdateCarValue={handleUpdateCarValue}
              onNavigateTab={handleSelectTab}
            />
          )}

          {state.activeTab === 'provedor' && (
            <ProviderTab
              state={state}
              focusSection={providerFocus}
              onChangeFocusSection={setProviderFocus}
              onToggleDuty={handleToggleDuty}
              onResetMonthlyDuties={handleResetMonthlyDuties}
              onPrayDecade={handlePrayDecade}
              onSaveLetter={handleSaveLetter}
              onDeleteLetter={handleDeleteLetter}
              onSaveTccTheme={handleSaveTccTheme}
              onToggleTccStage={handleToggleTccStage}
              onToggleEquipment={handleToggleEquipment}
              onResetEquipment={handleResetEquipment}
              onAddStudyHour={handleAddStudyHour}
              onLogWorkout={handleLogWorkout}
              onUpdatePullupTarget={handleUpdatePullupTarget}
              onTakeCreatineDose={handleTakeCreatineDose}
              onRefillCreatine={handleRefillCreatine}
              onChangeCreatineDose={handleChangeCreatineDose}
              onToggleHealthCheck={handleToggleHealthCheck}
              onAddMissionEntry={handleAddMissionEntry}
              onToggleMissionEntry={handleToggleMissionEntry}
              onDeleteMissionEntry={handleDeleteMissionEntry}
              onAddMarriageCouple={handleAddMarriageCouple}
              onUpdateMarriageCouple={handleUpdateMarriageCouple}
              onDeleteMarriageCouple={handleDeleteMarriageCouple}
              onAddReadingLog={handleAddReadingLog}
              onToggleReadingComplete={handleToggleReadingComplete}
              onDeleteReadingLog={handleDeleteReadingLog}
              onAddMedicalExam={handleAddMedicalExam}
              onCycleExamStatus={handleCycleExamStatus}
              onDeleteMedicalExam={handleDeleteMedicalExam}
              onLogSpiritualAct={handleLogSpiritualAct}
              onDeleteSpiritualLog={handleDeleteSpiritualLog}
              onTogglePmDutyMode={handleTogglePmDutyMode}
              onOpenCalendar={handleOpenOperationalCalendar}
            />
          )}

          {state.activeTab === 'cronicas' && (
            <MapTab
              state={state}
              onToggleChecklist={handleToggleChecklist}
              onNavigateTab={handleSelectTab}
            />
          )}
        </div>
      </main>

      <Footer
        soundEnabled={state.soundEnabled}
        onToggleSound={handleToggleSound}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onRequestReset={() => setResetOpen(true)}
      />
    </div>
  );
}
