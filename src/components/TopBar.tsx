import type { User } from 'firebase/auth';
import {
  Car,
  Church,
  Cloud,
  CloudOff,
  Coins,
  LogIn,
  LogOut,
  Map,
  RefreshCw,
  ShieldCheck,
  Swords,
} from 'lucide-react';
import type { TabId } from '../types/chronicles';
import { PWAInstallButton } from './PWAInstallButton';

export type CloudSyncStatus = 'local' | 'syncing' | 'synced' | 'error';

interface TopBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenArena: () => void;
  user: User | null;
  authReady: boolean;
  syncStatus: CloudSyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
}

const NAV_ITEMS: {
  id: TabId;
  label: string;
  mobileLabel: string;
  Icon: typeof Church;
}[] = [
  { id: 'comando', label: 'Santuário', mobileLabel: 'Santuário', Icon: Church },
  { id: 'rota', label: 'Tesouro', mobileLabel: 'Tesouro', Icon: Coins },
  { id: 'corolla', label: 'Biga de Aço', mobileLabel: 'Biga', Icon: Car },
  { id: 'provedor', label: 'Provedor', mobileLabel: 'Provedor', Icon: ShieldCheck },
  { id: 'cronicas', label: 'Mapa', mobileLabel: 'Mapa', Icon: Map },
];

export function TopBar({
  activeTab,
  onSelectTab,
  onOpenArena,
  user,
  authReady,
  syncStatus,
  onSignIn,
  onSignOut,
}: TopBarProps) {
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || 'Comandante';

  return (
    <>
      <header className="relative z-20 border-b border-[#eab308]/25 bg-gradient-to-b from-[#1a130e]/95 via-[#141110]/95 to-[#0d0c0b]/95 backdrop-blur-md shadow-[0_10px_32px_rgba(0,0,0,0.82)]">
        {/* Linha sutil superior em ouro envelhecido (#eab308) */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#eab308]/65 to-transparent"
        />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zona 1: Marca do Comandante (linha única) */}
          <button
            type="button"
            onClick={() => onSelectTab('comando')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308] rounded-md px-1 py-1 min-h-[40px]"
          >
            <span
              aria-hidden="true"
              className="war-banner-crest w-7 h-8 bg-gradient-to-b from-[#991b1b] to-[#3f0909] border border-[#eab308]/80 flex items-center justify-center shadow-md shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  d="M12 4 V18 M7 10 H17"
                  stroke="#fde047"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="font-epic text-sm sm:text-base text-[#eab308] tracking-wider uppercase">
              Crônicas Conceição
            </span>
          </button>

          {/* Zona 2: Navegação Desktop moderna com estandarte militar ativo */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-stretch gap-1.5 lg:gap-2 h-full"
          >
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectTab(id)}
                  className={`relative px-3 lg:px-3.5 flex items-center gap-2 text-xs lg:text-sm font-epic tracking-wide whitespace-nowrap shrink-0 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308] ${
                    isActive
                      ? 'war-banner-tab bg-gradient-to-b from-[#881b1b] via-[#5e1010] to-[#2e0707] text-[#fde047] border-x border-dashed border-[#eab308]/60 pb-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.75)]'
                      : 'text-[#a89982] hover:text-[#efe3c8] hover:bg-white/[0.04] rounded-md my-2'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-[#eab308]' : 'text-[#a89982]'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zona 3: Sincronia, Instalação PWA & Ação Principal (Arena) */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            {!authReady ? (
              <span
                className="px-2.5 py-2 rounded-lg border border-white/10 bg-[#181b20] text-xs text-[#9e9380] flex items-center gap-1.5 min-h-[40px]"
                title="Verificando conexão com a nuvem"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c59b27]" aria-hidden="true" />
                <span className="hidden sm:inline">Nuvem...</span>
              </span>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <div
                  className={`px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 min-h-[40px] ${
                    syncStatus === 'error'
                      ? 'border-[#881b1b] bg-[#2a1212] text-[#fca5a5]'
                      : syncStatus === 'syncing'
                      ? 'border-[#7d5d28] bg-[#211911] text-[#e4c770]'
                      : 'border-emerald-700/50 bg-[#0f2117] text-[#8de0b0]'
                  }`}
                  title={
                    syncStatus === 'error'
                      ? 'Erro ao sincronizar com a nuvem'
                      : syncStatus === 'syncing'
                      ? 'Sincronizando fortaleza na nuvem...'
                      : `Sincronizado na nuvem (${user.email || firstName})`
                  }
                >
                  {syncStatus === 'error' ? (
                    <CloudOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  ) : syncStatus === 'syncing' ? (
                    <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="hidden lg:inline max-w-[96px] truncate">
                    {syncStatus === 'syncing' ? 'Salvando...' : firstName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  aria-label="Sair da conta Google"
                  title="Desconectar da nuvem"
                  className="rpg-btn-iron px-2.5 py-2 rounded-lg text-[#9e9380] hover:text-[#e4c770] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27]"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                title="Entrar com Google para sincronizar entre dispositivos"
                className="rpg-btn-iron px-3 py-2 rounded-lg text-xs font-semibold text-[#e4c770] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27]"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Nuvem · Entrar</span>
                <span className="sm:hidden">Nuvem</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenArena}
              className="rpg-btn-crimson px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-epic flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c770]"
            >
              <Swords className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Enfrentar Chefe</span>
              <span className="sm:hidden">Arena</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegação Mobile Inferior (Thumb-Zone Ergonomics · < 9% viewport height) */}
      <nav
        aria-label="Menu inferior de comando"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111317]/95 backdrop-blur-md border-t border-[#c59b27]/35 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
      >
        <div className="grid grid-cols-5 items-stretch h-[60px] px-1">
          {NAV_ITEMS.map(({ id, mobileLabel, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c59b27] ${
                  isActive
                    ? 'text-[#e4c770]'
                    : 'text-[#9e9380] hover:text-[#e7dcc6]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 inset-x-2 h-[3px] rounded-b bg-gradient-to-r from-[#881b1b] via-[#c59b27] to-[#881b1b]"
                  />
                )}
                <Icon
                  className={`w-[19px] h-[19px] shrink-0 transition-transform ${
                    isActive ? 'scale-110 text-[#e4c770]' : ''
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap truncate max-w-full">
                  {mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
