import { Download, Share, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label="Instalar aplicativo no dispositivo"
        title="Instalar Crônicas Conceição como aplicativo no Android ou desktop"
        className="rpg-btn-iron px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold text-[#fde047] border border-[#eab308]/45 hover:border-[#eab308]/80 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308]"
      >
        <Download className="w-3.5 h-3.5 shrink-0 text-[#eab308]" aria-hidden="true" />
        <span className="hidden md:inline">Instalar App</span>
        <span className="hidden min-[400px]:inline md:hidden">App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Como instalar no iPhone ou iPad"
          title="Instalar na Tela de Início do iOS"
          className="rpg-btn-iron px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold text-[#fde047] border border-[#eab308]/45 hover:border-[#eab308]/80 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eab308]"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0 text-[#eab308]" aria-hidden="true" />
          <span className="hidden md:inline">Instalar iOS</span>
          <span className="hidden min-[400px]:inline md:hidden">App</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-ios-guide-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          >
            <div className="rpg-panel w-full max-w-sm p-6 border border-[#eab308]/45 text-[#efe3c8]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-[#241810] border border-[#eab308]/50 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4 text-[#fde047]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3
                      id="pwa-ios-guide-title"
                      className="font-epic text-base text-[#fde047] tracking-wide uppercase"
                    >
                      Instalar no iPhone / iPad
                    </h3>
                    <p className="text-xs text-[#a89982]">
                      Acesso em tela cheia e dados salvos no aparelho
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Fechar guia de instalação"
                  className="p-1.5 rounded-md text-[#a89982] hover:text-[#efe3c8] hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <ol className="mt-4 space-y-2.5 text-sm text-[#efe3c8]/90">
                <li className="flex items-start gap-2.5 rounded-lg bg-black/30 border border-white/10 p-2.5">
                  <span className="font-mono-num text-xs font-bold text-[#eab308] mt-0.5">
                    1.
                  </span>
                  <span>
                    Toque no botão{' '}
                    <strong className="inline-flex items-center gap-1 text-[#fde047]">
                      <Share className="w-3.5 h-3.5" aria-hidden="true" />
                      Compartilhar
                    </strong>{' '}
                    na barra do Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-lg bg-black/30 border border-white/10 p-2.5">
                  <span className="font-mono-num text-xs font-bold text-[#eab308] mt-0.5">
                    2.
                  </span>
                  <span>
                    Role as opções e toque em{' '}
                    <strong className="text-[#fde047]">
                      Adicionar à Tela de Início
                    </strong>
                    .
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="rpg-btn-iron mt-5 w-full py-2.5 rounded-lg text-xs font-epic uppercase tracking-wider text-[#fde047] border border-[#eab308]/45 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
