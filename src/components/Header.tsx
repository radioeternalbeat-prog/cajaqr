import React from 'react';
import { QrCode, Plus, Camera, Printer, FileDown } from 'lucide-react';

interface HeaderProps {
  onNewLink: () => void;
  onOpenScanner: () => void;
  onOpenPrintSheet: () => void;
  onExportBackup: () => void;
  activeTab: 'vault' | 'wifi' | 'whatsapp';
  setActiveTab: (tab: 'vault' | 'wifi' | 'whatsapp') => void;
  totalLinksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewLink,
  onOpenScanner,
  onOpenPrintSheet,
  onExportBackup,
  activeTab,
  setActiveTab,
  totalLinksCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-[#0e1117]/95 backdrop-blur-md border-b border-[#232936] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Strict single element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#FF8000] flex items-center justify-center text-black font-black shadow-sm">
            <QrCode className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-tight text-white whitespace-nowrap">
            BOX<span className="text-[#FF8000]">Qr</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('vault')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'vault'
                ? 'text-[#FF8000] font-bold border-b-2 border-[#FF8000]'
                : 'hover:text-slate-100'
            }`}
          >
            Bóveda de Enlaces ({totalLinksCount})
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'whatsapp'
                ? 'text-[#FF8000] font-bold border-b-2 border-[#FF8000]'
                : 'hover:text-slate-100'
            }`}
          >
            QR WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('wifi')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'wifi'
                ? 'text-[#00A3E0] font-bold border-b-2 border-[#00A3E0]'
                : 'hover:text-slate-100'
            }`}
          >
            QR Wi-Fi
          </button>
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-slate-400 hover:text-slate-100 transition-colors py-1"
          >
            <Camera className="w-4 h-4 text-slate-500" />
            Escanear QR
          </button>
          <button
            onClick={onOpenPrintSheet}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-slate-400 hover:text-slate-100 transition-colors py-1"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimir Tarjetas
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onExportBackup}
            title="Exportar respaldo de enlaces"
            className="hidden sm:inline-flex p-2 text-slate-400 hover:text-white hover:bg-[#181d26] rounded-xl transition-colors border border-[#232936]"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            onClick={onNewLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-black text-black bg-[#FF8000] hover:bg-[#FFA033] rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Enlace</span>
          </button>
        </div>
      </div>
    </header>
  );
};
