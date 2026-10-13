import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Sliders,
  Palette,
  FileCode,
  Share2,
  Sparkles,
} from 'lucide-react';
import { QRConfig, SavedLink } from '../types';
import {
  generateQRDataUrl,
  generateQRSvg,
  renderFramedQRCanvas,
  downloadFile,
  copyCanvasToClipboard,
} from '../utils/qrHelper';

interface QRStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: SavedLink | { url: string; title: string; id?: string };
  onUpdateLinkConfig?: (
    id: string,
    config: { customColor?: string; frameStyle?: QRConfig['frameStyle'] }
  ) => void;
}

export const QRStudioModal: React.FC<QRStudioModalProps> = ({
  isOpen,
  onClose,
  link,
  onUpdateLinkConfig,
}) => {
  const [config, setConfig] = useState<QRConfig>({
    fgColor: (link as SavedLink).customColor || '#0f172a',
    bgColor: (link as SavedLink).customBg || '#ffffff',
    errorCorrectionLevel: 'M',
    frameStyle: (link as SavedLink).frameStyle || 'scanme',
    frameText: 'ESCANEA AQUÍ',
    showUrl: true,
    size: 512,
    iconType: 'none',
  });

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [copiedState, setCopiedState] = useState(false);
  const [downloadResolution, setDownloadResolution] = useState<512 | 1024 | 2048>(1024);
  const [isExporting, setIsExporting] = useState(false);

  // Re-generate preview when config or link changes
  useEffect(() => {
    if (!isOpen || !link.url) return;

    let isCancelled = false;

    renderFramedQRCanvas(link.url, link.title, config, 600)
      .then((canvas) => {
        if (!isCancelled) {
          setPreviewDataUrl(canvas.toDataURL('image/png'));
        }
      })
      .catch((err) => {
        console.error('Render error:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, link.url, link.title, config]);

  if (!isOpen) return null;

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderFramedQRCanvas(link.url, link.title, config, downloadResolution);
      const dataUrl = canvas.toDataURL('image/png');
      const safeTitle = link.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'qr_codigo';
      downloadFile(dataUrl, `qr_${safeTitle}_${downloadResolution}px.png`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await generateQRSvg(link.url, config);
      const safeTitle = link.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'qr_codigo';
      downloadFile(svgString, `qr_${safeTitle}.svg`, true, 'image/svg+xml');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = await renderFramedQRCanvas(link.url, link.title, config, 800);
      const success = await copyCanvasToClipboard(canvas);
      if (success) {
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir QR - ${link.title}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
              color: #000;
            }
            .card {
              border: 1px dashed #94a3b8;
              padding: 32px;
              border-radius: 16px;
              text-align: center;
              max-width: 480px;
            }
            img {
              max-width: 320px;
              height: auto;
            }
            h2 {
              margin: 12px 0 6px 0;
              font-size: 22px;
            }
            p {
              margin: 4px 0 0 0;
              font-size: 13px;
              color: #475569;
              word-break: break-all;
            }
            @media print {
              .card { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${previewDataUrl}" alt="Código QR" />
            <h2>${link.title}</h2>
            <p>${link.url}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const colorPalettes = [
    { label: 'McLaren Papaya', fg: '#FF8000', bg: '#ffffff' },
    { label: 'Velocity Blue', fg: '#00A3E0', bg: '#ffffff' },
    { label: 'Carbon Stealth', fg: '#14171A', bg: '#ffffff' },
    { label: 'Fluro Papaya', fg: '#FF5500', bg: '#ffffff' },
    { label: 'Titanium Gray', fg: '#333945', bg: '#ffffff' },
    { label: 'Negro Puro', fg: '#000000', bg: '#ffffff' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#13171f] text-white rounded-3xl shadow-2xl border border-[#232936] max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Live Styled Canvas Preview */}
        <div className="w-full md:w-1/2 bg-[#0e1117] p-6 md:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#232936] overflow-y-auto">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4">
            <span className="font-bold uppercase tracking-wider text-[#FF8000]">
              Estudio de Código QR
            </span>
            <span className="font-mono text-slate-500">{downloadResolution}px alta resolución</span>
          </div>

          {/* QR Display */}
          <div className="w-full flex-1 flex items-center justify-center py-4">
            <div className="bg-white p-3 rounded-2xl shadow-xl border border-[#232936] max-w-[340px] w-full flex items-center justify-center">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt={`QR de ${link.title}`}
                  className="max-h-[360px] w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                  Generando visualización...
                </div>
              )}
            </div>
          </div>

          {/* Quick Direct Link Access */}
          <div className="w-full mt-4 pt-3 border-t border-[#232936] flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 truncate font-mono max-w-[200px]">
              {link.url.replace(/^https?:\/\//i, '')}
            </span>

            {!link.url.startsWith('WIFI:') && (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-bold text-[#00A3E0] hover:text-[#52c8f8] transition-colors whitespace-nowrap"
              >
                <span>Acceso Directo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Customization Controls & Download Studio */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6 bg-[#13171f]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Personalizar & Descargar
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ajusta el marco, color y resolución para impresión física o uso digital.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#181d26] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customization Options */}
          <div className="space-y-5">
            {/* 1. Frame Style Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Estilo de Presentación
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'scanme', label: 'Banner "Escanea Aquí"', desc: 'Ideal para mesas' },
                  { id: 'card', label: 'Tarjeta con Título', desc: 'Para catálogos' },
                  { id: 'badge', label: 'Insignia Acceso', desc: 'Para vidrieras' },
                  { id: 'clean', label: 'Solo QR (Limpio)', desc: 'Para diseño gráfico' },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        frameStyle: style.id as QRConfig['frameStyle'],
                      }))
                    }
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      config.frameStyle === style.id
                        ? 'border-[#FF8000] bg-[#FF8000]/10 text-white font-bold shadow-sm'
                        : 'border-[#232936] hover:border-[#384357] text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{style.label}</div>
                    <div className="text-[10px] text-slate-400">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Palettes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Paleta de Color McLaren F1
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {colorPalettes.map((pal) => (
                  <button
                    key={pal.label}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, fgColor: pal.fg, bgColor: pal.bg }))
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                      config.fgColor === pal.fg
                        ? 'border-[#FF8000] bg-[#FF8000]/20 text-white font-bold'
                        : 'border-[#232936] hover:border-[#384357] text-slate-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                      style={{ backgroundColor: pal.fg }}
                    />
                    <span>{pal.label}</span>
                  </button>
                ))}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1">
                  <span>Custom:</span>
                  <input
                    type="color"
                    value={config.fgColor}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, fgColor: e.target.value }))
                    }
                    className="w-6 h-6 rounded cursor-pointer border border-[#232936] p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 3. Toggles: Error correction & Show URL */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Corrección de Error
                </label>
                <select
                  value={config.errorCorrectionLevel}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H',
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#0e1117] border border-[#283040] rounded-lg text-xs font-medium text-white"
                >
                  <option value="L">L (7% - Más denso)</option>
                  <option value="M">M (15% - Equilibrado)</option>
                  <option value="Q">Q (25% - Alta fiabilidad)</option>
                  <option value="H">H (30% - Máxima lectura)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resolución de Descarga
                </label>
                <select
                  value={downloadResolution}
                  onChange={(e) =>
                    setDownloadResolution(Number(e.target.value) as 512 | 1024 | 2048)
                  }
                  className="w-full px-2.5 py-1.5 bg-[#0e1117] border border-[#283040] rounded-lg text-xs font-medium text-white"
                >
                  <option value={512}>512 x 512 px (Web / Móvil)</option>
                  <option value={1024}>1024 x 1024 px (Estándar)</option>
                  <option value={2048}>2048 x 2048 px (Imprenta Ultra)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Actions Bar */}
          <div className="pt-4 border-t border-[#232936] space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF8000] hover:bg-[#FFA033] text-black rounded-xl text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4 stroke-[3]" />
                <span>Descargar PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181d26] hover:bg-[#202734] border border-[#2b3342] text-white rounded-xl text-xs font-bold transition-colors"
              >
                <FileCode className="w-4 h-4 text-slate-400" />
                <span>Descargar SVG</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#181d26] hover:bg-[#202734] border border-[#2b3342] text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                {copiedState ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar Imagen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#181d26] hover:bg-[#202734] border border-[#2b3342] text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Imprimir Tarjeta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
