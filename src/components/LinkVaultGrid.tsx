import React, { useState } from 'react';
import {
  Search,
  Star,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  QrCode,
  ArrowUpDown,
  Download,
  Wifi,
  Globe,
  MessageCircle,
  FileText,
  Sliders,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { SavedLink, LinkCategory } from '../types';

interface LinkVaultGridProps {
  links: SavedLink[];
  onOpenQRStudio: (link: SavedLink) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementClicks: (id: string) => void;
  onDeleteLink: (id: string) => void;
  onPrintSelection: (links: SavedLink[]) => void;
}

export const LinkVaultGrid: React.FC<LinkVaultGridProps> = ({
  links,
  onOpenQRStudio,
  onToggleFavorite,
  onIncrementClicks,
  onDeleteLink,
  onPrintSelection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<LinkCategory>('todos');
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'alpha'>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('cajaqr_view_mode');
      if (saved === 'list' || saved === 'grid') return saved;
    } catch {
      // fallback
    }
    return 'grid';
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('cajaqr_view_mode', viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  // Category filters setup
  const categories: { key: LinkCategory; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'favoritos', label: 'Favoritos' },
    { key: 'comercio', label: 'Comercio & Menús' },
    { key: 'redes', label: 'Redes Sociales' },
    { key: 'documentos', label: 'Documentos' },
    { key: 'wifi', label: 'Wi-Fi' },
    { key: 'trabajo', label: 'Trabajo' },
    { key: 'personal', label: 'Personal' },
  ];

  // Filtering
  const filteredLinks = links.filter((link) => {
    // Category match
    if (activeCategory === 'favoritos' && !link.isFavorite) return false;
    if (activeCategory !== 'todos' && activeCategory !== 'favoritos' && link.category !== activeCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = link.title.toLowerCase().includes(q);
      const matchUrl = link.url.toLowerCase().includes(q);
      const matchNotes = link.notes?.toLowerCase().includes(q) || false;
      return matchTitle || matchUrl || matchNotes;
    }
    return true;
  });

  // Sorting
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (sortBy === 'clicks') return b.clicks - a.clicks;
    if (sortBy === 'alpha') return a.title.localeCompare(b.title);
    // recent
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCopyLink = async (link: SavedLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDirectAccess = (link: SavedLink) => {
    onIncrementClicks(link.id);
    if (!link.url.startsWith('WIFI:')) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getCategoryIcon = (category: LinkCategory) => {
    switch (category) {
      case 'wifi':
        return <Wifi className="w-3.5 h-3.5 text-blue-600" />;
      case 'comercio':
        return <Globe className="w-3.5 h-3.5 text-amber-600" />;
      case 'redes':
        return <MessageCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'documentos':
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <section className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, URL o nota..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#13171f] border border-[#232936] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF8000] shadow-sm transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Right side controls: Sorting, View Switcher & Batch print */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#0e1117] border border-[#232936] rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
              aria-label="Vista en cuadrícula"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-[#FF8000] text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Vista en lista compacta"
              aria-label="Vista en lista compacta"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-[#FF8000] text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista compacta</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-[#13171f] border border-[#232936] px-3 py-1.5 rounded-xl shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'clicks' | 'alpha')}
              className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-[#13171f] text-white">Más recientes</option>
              <option value="clicks" className="bg-[#13171f] text-white">Más visitados (clics)</option>
              <option value="alpha" className="bg-[#13171f] text-white">Alfabético (A-Z)</option>
            </select>
          </div>

          <button
            onClick={() => onPrintSelection(sortedLinks)}
            disabled={sortedLinks.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-[#13171f] hover:bg-[#1a202c] border border-[#232936] rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-[#FF8000]" />
            <span>Imprimir Vista ({sortedLinks.length})</span>
          </button>
        </div>
      </div>

      {/* Segmented Category Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#0e1117] border border-[#232936] rounded-xl overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const count =
            cat.key === 'todos'
              ? links.length
              : cat.key === 'favoritos'
              ? links.filter((l) => l.isFavorite).length
              : links.filter((l) => l.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-[#FF8000] text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`font-mono text-[11px] tabular-nums ${activeCategory === cat.key ? 'text-black/80' : 'text-slate-500'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Links Content: Grid vs Compact List */}
      {sortedLinks.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedLinks.map((link) => (
              <div
                key={link.id}
                className="bg-[#13171f] border border-[#232936] hover:border-[#FF8000]/60 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                {/* Card Top Row: Category unboxed metadata & Star Favorite */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {getCategoryIcon(link.category)}
                      <span className="capitalize font-medium text-slate-300">
                        {link.category}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="font-mono tabular-nums text-slate-400">
                        {link.clicks} {link.clicks === 1 ? 'visita' : 'visitas'}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(link.id)}
                      className={`p-1 rounded-md transition-colors ${
                        link.isFavorite
                          ? 'text-[#FF8000] hover:text-[#FFA033]'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={link.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <Star
                        className={`w-4 h-4 ${link.isFavorite ? 'fill-[#FF8000]' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Card Middle: Title and Clean URL */}
                  <div className="space-y-1.5 mb-4">
                    <h3 className="text-base font-black text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#FF8000] transition-colors">
                      {link.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-mono text-slate-400 truncate max-w-[220px]">
                        {link.url.replace(/^https?:\/\//i, '')}
                      </span>
                      <button
                        onClick={() => handleCopyLink(link)}
                        className="text-slate-500 hover:text-white transition-colors p-0.5"
                        title="Copiar enlace"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {link.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2 pt-1">
                        {link.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom: QR Preview button & Direct Access CTA */}
                <div className="pt-3 border-t border-[#1e2533] flex items-center justify-between gap-3">
                  {/* QR mini button */}
                  <button
                    onClick={() => onOpenQRStudio(link)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-300 bg-[#1a202c] hover:bg-[#252e3d] rounded-lg transition-colors whitespace-nowrap"
                    title="Ver código QR y opciones de descarga"
                  >
                    <QrCode className="w-4 h-4 text-[#FF8000]" />
                    <span>Código QR</span>
                  </button>

                  {/* Direct Access Action */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDirectAccess(link)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-black bg-[#FF8000] hover:bg-[#FFA033] rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                    >
                      <span>{link.url.startsWith('WIFI:') ? 'Ver Red' : 'Abrir Link'}</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Eliminar de la caja"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Compact List View */
          <div className="bg-[#13171f] border border-[#232936] rounded-2xl overflow-hidden shadow-lg divide-y divide-[#1e2533]">
            {sortedLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 sm:py-3 hover:bg-[#181e28] transition-colors gap-3 group"
              >
                {/* Left side: Star, QR Icon button, Title & URL */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleFavorite(link.id)}
                    className={`p-1 rounded-md transition-colors shrink-0 ${
                      link.isFavorite
                        ? 'text-[#FF8000] hover:text-[#FFA033]'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={link.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Star
                      className={`w-4 h-4 ${link.isFavorite ? 'fill-[#FF8000]' : ''}`}
                    />
                  </button>

                  {/* Quick QR Icon trigger */}
                  <button
                    onClick={() => onOpenQRStudio(link)}
                    className="w-8 h-8 rounded-lg bg-[#1a202c] group-hover:bg-[#FF8000] text-slate-300 group-hover:text-black flex items-center justify-center shrink-0 transition-colors"
                    title="Abrir estudio QR de este enlace"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  {/* Title & URL inline */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white group-hover:text-[#FF8000] transition-colors truncate max-w-xs md:max-w-md">
                        {link.title}
                      </span>
                      {link.notes && (
                        <span className="text-[11px] text-slate-400 hidden lg:inline truncate max-w-xs">
                          ({link.notes})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                        {link.url.replace(/^https?:\/\//i, '')}
                      </span>
                      <button
                        onClick={() => handleCopyLink(link)}
                        className="text-slate-500 hover:text-white transition-colors p-0.5"
                        title="Copiar enlace"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Category, Visits, and Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1e2533]">
                  {/* Category & Clicks */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="hidden md:flex items-center gap-1.5">
                      {getCategoryIcon(link.category)}
                      <span className="capitalize text-slate-300 font-medium">
                        {link.category}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-slate-400">
                      {link.clicks} {link.clicks === 1 ? 'visita' : 'visitas'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenQRStudio(link)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-300 bg-[#1a202c] hover:bg-[#252e3d] rounded-lg transition-colors whitespace-nowrap hidden sm:inline-flex items-center gap-1"
                      title="Ver y descargar código QR"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#FF8000]" />
                      <span>QR</span>
                    </button>

                    <button
                      onClick={() => handleDirectAccess(link)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black text-black bg-[#FF8000] hover:bg-[#FFA033] rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                    >
                      <span>{link.url.startsWith('WIFI:') ? 'Ver Red' : 'Abrir'}</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Eliminar de la caja"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-[#13171f] border border-[#232936] rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-[#0e1117] text-[#FF8000] rounded-xl flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6 stroke-1" />
          </div>
          <h4 className="text-base font-bold text-white">
            No se encontraron enlaces en esta vista
          </h4>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No hay enlaces que coincidan con "${searchQuery}". Intenta con otro término o limpia la búsqueda.`
              : 'Agrega tu primer enlace usando la caja de arriba para generar su código QR de acceso directo.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-[#FF8000] hover:underline"
            >
              Restablecer búsqueda
            </button>
          )}
        </div>
      )}
    </section>
  );
};
