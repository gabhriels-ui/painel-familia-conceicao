import { useRef } from 'react';
import { Download, RotateCcw, Upload, Volume2, VolumeX } from 'lucide-react';

interface FooterProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onRequestReset: () => void;
}

export function Footer({
  soundEnabled,
  onToggleSound,
  onExportBackup,
  onImportBackup,
  onRequestReset,
}: FooterProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#121418]/92 mt-10 pt-6 pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-epic text-sm text-[#dfc168]">
            Fortaleza Família Conceição · Comandante Gabriel
          </div>
          <p className="text-xs text-[#a69982] mt-0.5">
            Salvamento automático no dispositivo e sincronia em nuvem opcional. Exporte seu pergaminho periodicamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSound}
            className="rpg-btn-iron px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px]"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#c59b27]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#a69982]" aria-hidden="true" />
            )}
            <span>{soundEnabled ? 'Som Ativo' : 'Som Mudo'}</span>
          </button>

          <button
            type="button"
            onClick={onExportBackup}
            className="rpg-btn-gold px-3.5 py-2 rounded text-xs font-epic flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Exportar Backup</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportBackup(file);
              }
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rpg-btn-iron px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px]"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Importar Backup</span>
          </button>

          <button
            type="button"
            onClick={onRequestReset}
            className="rpg-btn-crimson px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[40px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Resetar</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
