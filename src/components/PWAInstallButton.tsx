import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running standalone, hide the prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar BOXQr como App nativa en tu teléfono o PC"
        className={`inline-flex items-center gap-2 rounded-xl font-bold transition-all shadow-sm ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-[#FF8000]/15 text-[#FF8000] border border-[#FF8000]/40 hover:bg-[#FF8000] hover:text-black'
            : 'px-3 py-2 text-xs md:text-sm bg-gradient-to-r from-[#FF8000] to-[#FF6600] text-black hover:brightness-110 active:scale-95 shadow-[#FF8000]/20'
        }`}
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {/* Guidance modal for iOS or manual install */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#141820] border border-[#232936] p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF8000] flex items-center justify-center text-black font-black shadow-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Instalar BOXQr en tu móvil</h3>
                <p className="text-xs text-slate-400">Accede como una App nativa sin ocupar espacio</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-4 my-5 bg-[#0c0e12] p-4 rounded-xl border border-slate-800 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <p className="text-slate-300">
                    Pulsa el botón <strong>Compartir</strong> <Share className="w-4 h-4 inline text-[#FF8000]" /> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <p className="text-slate-300">
                    Desplaza hacia abajo y selecciona <strong>Añadir a pantalla de inicio</strong> <PlusSquare className="w-4 h-4 inline text-[#FF8000]" />.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <p className="text-slate-300">
                    Presiona <strong>Añadir</strong> en la esquina superior derecha. ¡Listo!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 my-5 bg-[#0c0e12] p-4 rounded-xl border border-slate-800 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <p className="text-slate-300">
                    Abre el menú de opciones de tu navegador Chrome o Edge (tres puntos <strong className="text-[#FF8000]">⋮</strong> en la esquina superior).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <p className="text-slate-300">
                    Toca en <strong>Instalar aplicación</strong> o <strong>Agregar a la pantalla principal</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <p className="text-slate-300">
                    Confirma la instalación para disfrutar de pantalla completa, acceso veloz y funcionamiento sin conexión.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Success notification */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FF8000] text-black px-4 py-3 rounded-xl shadow-xl font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>¡BOXQr instalado exitosamente!</span>
        </div>
      )}
    </>
  );
};
