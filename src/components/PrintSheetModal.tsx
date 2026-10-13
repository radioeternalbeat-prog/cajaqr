import React, { useState, useEffect } from 'react';
import { X, Printer, CheckSquare, Square, Download } from 'lucide-react';
import { SavedLink } from '../types';
import { generateQRDataUrl } from '../utils/qrHelper';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: SavedLink[];
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  links,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(links.map((l) => l.id));
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [columns, setColumns] = useState<2 | 3>(3);
  const [showUrls, setShowUrls] = useState<boolean>(true);

  // Generate QR data URLs for selected links
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const generateAll = async () => {
      const results: Record<string, string> = {};
      for (const link of links) {
        try {
          const dataUrl = await generateQRDataUrl(link.url, {
            fgColor: link.customColor || '#0f172a',
            size: 400,
          });
          results[link.id] = dataUrl;
        } catch {
          // continue
        }
      }
      if (isMounted) {
        setQrMap(results);
      }
    };

    generateAll();
    return () => {
      isMounted = false;
    };
  }, [isOpen, links]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(links.map((l) => l.id));
  const deselectAll = () => setSelectedIds([]);

  const handlePrint = () => {
    window.print();
  };

  const selectedLinks = links.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container - hide during print outside of the printable card sheet */}
      <div className="bg-[#13171f] text-white rounded-3xl shadow-2xl border border-[#232936] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print p-6 border-b border-[#232936] flex items-center justify-between gap-4 bg-[#13171f]">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Plantilla de Impresión de Códigos QR
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura tus tarjetas para imprimir en papel, cartulina o etiquetas adhesivas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={selectedLinks.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8000] hover:bg-[#FFA033] text-black rounded-xl text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir Documento</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#181d26] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (no-print) */}
        <div className="no-print bg-[#0e1117] px-6 py-3 border-b border-[#232936] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-[#FF8000] font-bold hover:underline"
            >
              Seleccionar todos
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={deselectAll}
              className="text-slate-400 hover:text-white hover:underline"
            >
              Deseleccionar todos
            </button>
            <span className="text-slate-500 font-mono">
              ({selectedLinks.length} seleccionados)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Columnas por página:</span>
              <button
                onClick={() => setColumns(2)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                  columns === 2 ? 'bg-[#FF8000] text-black shadow-sm' : 'bg-[#181d26] border border-[#2b3342] text-slate-300'
                }`}
              >
                2 (Tarjetas Grandes)
              </button>
              <button
                onClick={() => setColumns(3)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                  columns === 3 ? 'bg-[#FF8000] text-black shadow-sm' : 'bg-[#181d26] border border-[#2b3342] text-slate-300'
                }`}
              >
                3 (Etiquetas Medianas)
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={showUrls}
                onChange={(e) => setShowUrls(e.target.checked)}
                className="rounded border-[#2b3342] bg-[#0e1117] text-[#FF8000] focus:ring-[#FF8000]"
              />
              <span>Mostrar URL textual</span>
            </label>
          </div>
        </div>

        {/* Printable Grid Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white text-black">
          <div
            className={`grid gap-6 ${
              columns === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
            }`}
          >
            {links.map((link) => {
              const isSelected = selectedIds.includes(link.id);
              const qr = qrMap[link.id];

              return (
                <div
                  key={link.id}
                  onClick={() => toggleSelect(link.id)}
                  className={`border-2 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-[#FF8000] bg-white shadow-md'
                      : 'border-dashed border-slate-300 opacity-40 hover:opacity-70 bg-slate-50'
                  }`}
                >
                  {/* Select check badge (no-print) */}
                  <div className="no-print absolute top-3 right-3 text-[#FF8000]">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 fill-[#FF8000]/10" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Header scan callout */}
                  <div className="w-full bg-black text-[#FF8000] py-1 px-3 rounded-md text-[11px] font-black uppercase tracking-wider mb-3">
                    ESCANEA AQUÍ
                  </div>

                  {/* QR Image */}
                  <div className="w-36 h-36 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg">
                    {qr ? (
                      <img src={qr} alt={link.title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-[10px] text-slate-400">Cargando QR...</div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-sm text-slate-900 mt-3 line-clamp-1">
                    {link.title}
                  </h4>

                  {/* URL */}
                  {showUrls && (
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5 break-all line-clamp-1 max-w-[200px]">
                      {link.url.replace(/^https?:\/\//i, '')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
