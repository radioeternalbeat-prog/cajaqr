import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SmartAddBox } from './components/SmartAddBox';
import { LinkVaultGrid } from './components/LinkVaultGrid';
import { QRStudioModal } from './components/QRStudioModal';
import { QRScannerModal } from './components/QRScannerModal';
import { PrintSheetModal } from './components/PrintSheetModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { INITIAL_LINKS } from './utils/defaultLinks';
import { SavedLink, QRConfig } from './types';
import {
  QrCode,
  Link2,
  ExternalLink,
  Sparkles,
  FileDown,
  FileUp,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function App() {
  const [links, setLinks] = useState<SavedLink[]>(() => {
    try {
      const stored = localStorage.getItem('cajaqr_links_vault');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load from storage:', e);
    }
    return INITIAL_LINKS;
  });

  // Modals state
  const [studioLink, setStudioLink] = useState<SavedLink | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
  const [printSelectionLinks, setPrintSelectionLinks] = useState<SavedLink[]>([]);
  const [activeSpecialMode, setActiveSpecialMode] = useState<'vault' | 'wifi' | 'whatsapp'>('vault');

  const addBoxRef = useRef<HTMLDivElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('cajaqr_links_vault', JSON.stringify(links));
    } catch (e) {
      console.warn('Failed to save to storage:', e);
    }
  }, [links]);

  // Handle adding new link
  const handleSaveLink = (newLinkData: Omit<SavedLink, 'id' | 'createdAt' | 'updatedAt' | 'clicks'>) => {
    const newEntry: SavedLink = {
      ...newLinkData,
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLinks((prev) => [newEntry, ...prev]);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    );
  };

  // Increment clicks
  const handleIncrementClicks = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l))
    );
  };

  // Delete link
  const handleDeleteLink = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este enlace de tu caja?')) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // Open Studio with existing link
  const handleOpenQRStudio = (link: SavedLink) => {
    setStudioLink(link);
    setIsStudioOpen(true);
  };

  // Open Studio with freshly typed or temporary data
  const handleOpenStudioWithData = (url: string, title: string) => {
    const tempLink: SavedLink = {
      id: 'temp-preview',
      title: title || 'Enlace Directo',
      url,
      category: 'comercio',
      isFavorite: false,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customColor: '#0f172a',
      frameStyle: 'scanme',
    };
    setStudioLink(tempLink);
    setIsStudioOpen(true);
  };

  // Scanned QR result integration
  const handleAddScannedUrl = (url: string, title: string) => {
    handleSaveLink({
      title,
      url,
      category: url.startsWith('WIFI:') ? 'wifi' : 'comercio',
      notes: 'Importado mediante escaneo de código QR.',
      isFavorite: false,
      customColor: '#0f172a',
      frameStyle: 'card',
      iconType: url.startsWith('WIFI:') ? 'wifi' : 'globe',
    });
  };

  // Print selection handler
  const handlePrintSelection = (selectedList: SavedLink[]) => {
    setPrintSelectionLinks(selectedList.length > 0 ? selectedList : links);
    setIsPrintSheetOpen(true);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(links, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cajaqr_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLinks(parsed);
          alert(`¡Se importaron ${parsed.length} enlaces a tu caja correctamente!`);
        } else {
          alert('El archivo no tiene el formato de respaldo correcto.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default seed links
  const handleResetDefaults = () => {
    if (confirm('¿Deseas restablecer los enlaces de ejemplo iniciales?')) {
      setLinks(INITIAL_LINKS);
    }
  };

  // Total metrics
  const totalClicks = links.reduce((acc, curr) => acc + curr.clicks, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 selection:bg-[#FF8000] selection:text-black">
      {/* Hidden file input for importing backup */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Top Header */}
      <Header
        onNewLink={() => {
          addBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenPrintSheet={() => handlePrintSelection(links)}
        onExportBackup={handleExportBackup}
        activeTab={activeSpecialMode}
        setActiveTab={(tab) => {
          setActiveSpecialMode(tab);
          addBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        totalLinksCount={links.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome & Value strip (Unboxed, clean, strict 60-30-10) */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#232936]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              BOX<span className="text-[#FF8000]">Qr</span> — Bóveda de Enlaces & Códigos QR
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Almacena tus enlaces clave y genera códigos QR optimizados para acceso directo desde teléfonos móviles, carteles, menús y redes.
            </p>
          </div>

          {/* Quick Metrics unboxed text with tabular numerals */}
          <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
            <div>
              <span className="font-mono font-bold text-white tabular-nums text-sm">
                {links.length}
              </span>{' '}
              enlaces en caja
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <div>
              <span className="font-mono font-bold text-[#FF8000] tabular-nums text-sm">
                {totalClicks}
              </span>{' '}
              accesos directos
            </div>
          </div>
        </section>

        {/* 1. Smart Add Box (La Caja de Enlaces) */}
        <div ref={addBoxRef}>
          <SmartAddBox
            onSaveLink={handleSaveLink}
            onOpenStudioWithData={handleOpenStudioWithData}
            activeSpecialMode={activeSpecialMode}
            onResetSpecialMode={() => setActiveSpecialMode('vault')}
          />
        </div>

        {/* 2. Link Vault Grid & Filters */}
        <LinkVaultGrid
          links={links}
          onOpenQRStudio={handleOpenQRStudio}
          onToggleFavorite={handleToggleFavorite}
          onIncrementClicks={handleIncrementClicks}
          onDeleteLink={handleDeleteLink}
          onPrintSelection={handlePrintSelection}
        />

        {/* Vault Utility Tools Strip */}
        <section className="bg-[#13171f] border border-[#232936] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a202c] flex items-center justify-center text-[#FF8000] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Respaldo Local & Portabilidad
              </h4>
              <p className="text-xs text-slate-400">
                Tus enlaces se guardan automáticamente en tu navegador. Puedes exportar o importar cuando desees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#181d26] hover:bg-[#202735] border border-[#2b3342] rounded-xl transition-colors"
            >
              <FileUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Importar Respaldo</span>
            </button>
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#181d26] hover:bg-[#202735] border border-[#2b3342] rounded-xl transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Descargar Copia</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Restablecer enlaces de ejemplo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print bg-[#0e1117] border-t border-[#232936] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#FF8000]" />
            <span className="font-bold text-white">BOX<span className="text-[#FF8000]">Qr</span></span>
            <span>— Bóveda de enlaces & generador de códigos QR para acceso directo</span>
          </div>
          <div>
            <span>Inspirado en la ingeniería McLaren F1: Papaya Orange & Stealth Carbon</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isStudioOpen && studioLink && (
        <QRStudioModal
          isOpen={isStudioOpen}
          onClose={() => {
            setIsStudioOpen(false);
            setStudioLink(null);
          }}
          link={studioLink}
        />
      )}

      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onAddScannedUrl={handleAddScannedUrl}
        />
      )}

      {isPrintSheetOpen && (
        <PrintSheetModal
          isOpen={isPrintSheetOpen}
          onClose={() => setIsPrintSheetOpen(false)}
          links={printSelectionLinks.length > 0 ? printSelectionLinks : links}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
