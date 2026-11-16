import { X } from 'lucide-react';
import type { ToastItem } from '../types/chronicles';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs sm:max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const toneClasses =
          t.tone === 'emerald'
            ? 'border-emerald-600/60 text-emerald-300'
            : t.tone === 'red'
            ? 'border-[#991b1b] text-red-300'
            : 'border-[#c59b27]/70 text-[#dfc168]';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto bg-[#141517]/95 backdrop-blur-md border ${toneClasses} rounded p-3.5 shadow-2xl flex items-start justify-between gap-3`}
          >
            <div className="min-w-0">
              <div className="font-epic text-xs tracking-wide">{t.title}</div>
              <p className="text-sm text-[#e4d7be] mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Fechar notificação"
              className="text-[#a69982] hover:text-white p-0.5 rounded cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
