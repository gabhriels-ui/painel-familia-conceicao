import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[72px] md:bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg border border-[#eab308]/45 bg-[#1a130e]/95 px-3 py-2 text-xs font-medium text-[#fde047] shadow-[0_8px_24px_rgba(0,0,0,0.8)] backdrop-blur-md"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0 text-[#eab308]" aria-hidden="true" />
      <span>Modo Offline · Dados salvos no dispositivo</span>
    </div>
  );
}
