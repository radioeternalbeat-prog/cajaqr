import React, { useState, useEffect } from 'react';
import {
  Link2,
  QrCode,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Wifi,
  Globe,
  Tag,
  Check,
  Sliders,
} from 'lucide-react';
import { LinkCategory, SavedLink, QRConfig } from '../types';
import { generateQRDataUrl } from '../utils/qrHelper';

interface SmartAddBoxProps {
  onSaveLink: (link: Omit<SavedLink, 'id' | 'createdAt' | 'updatedAt' | 'clicks'>) => void;
  onOpenStudioWithData: (url: string, title: string) => void;
  activeSpecialMode?: 'vault' | 'wifi' | 'whatsapp';
  onResetSpecialMode?: () => void;
}

export const SmartAddBox: React.FC<SmartAddBoxProps> = ({
  onSaveLink,
  onOpenStudioWithData,
  activeSpecialMode = 'vault',
  onResetSpecialMode,
}) => {
  // Mode selection: 'url' | 'whatsapp' | 'wifi'
  const [mode, setMode] = useState<'url' | 'whatsapp' | 'wifi'>('url');

  // URL mode fields
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [category, setCategory] = useState<LinkCategory>('comercio');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0f172a');

  // WhatsApp mode fields
  const [waCountryCode, setWaCountryCode] = useState('+54');
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('Hola, quisiera información sobre sus servicios');

  // Wi-Fi mode fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Live QR Preview
  const [previewQr, setPreviewQr] = useState<string>('');
  const [computedUrl, setComputedUrl] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync mode with activeSpecialMode from header
  useEffect(() => {
    if (activeSpecialMode === 'whatsapp') {
      setMode('whatsapp');
    } else if (activeSpecialMode === 'wifi') {
      setMode('wifi');
    }
  }, [activeSpecialMode]);

  // Compute final URL based on current mode
  useEffect(() => {
    let finalUrl = '';
    if (mode === 'url') {
      let raw = urlInput.trim();
      if (raw) {
        if (!/^https?:\/\//i.test(raw) && !/^mailto:/i.test(raw) && !/^tel:/i.test(raw) && !/^wifi:/i.test(raw)) {
          finalUrl = 'https://' + raw;
        } else {
          finalUrl = raw;
        }
      }
    } else if (mode === 'whatsapp') {
      const cleanPhone = (waCountryCode + waPhone).replace(/[^\d+]/g, '').replace(/^\+/, '');
      if (cleanPhone) {
        const textParam = waMessage.trim() ? `?text=${encodeURIComponent(waMessage.trim())}` : '';
        finalUrl = `https://wa.me/${cleanPhone}${textParam}`;
      }
    } else if (mode === 'wifi') {
      if (wifiSsid.trim()) {
        const t = wifiEncryption;
        const s = wifiSsid.trim();
        const p = wifiPassword.trim();
        const h = wifiHidden ? 'true' : 'false';
        finalUrl = `WIFI:T:${t};S:${s};P:${p};H:${h};;`;
      }
    }

    setComputedUrl(finalUrl);

    if (finalUrl) {
      generateQRDataUrl(finalUrl, { fgColor: selectedColor, size: 280 })
        .then((data) => setPreviewQr(data))
        .catch(() => setPreviewQr(''));
    } else {
      setPreviewQr('');
    }
  }, [
    mode,
    urlInput,
    waCountryCode,
    waPhone,
    waMessage,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    selectedColor,
  ]);

  // Auto-fill suggested title and category from URL
  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    if (!titleInput || titleInput === 'Nuevo Enlace') {
      try {
        const cleaned = val.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
        const host = cleaned.split('/')[0];
        if (host.includes('instagram.com')) {
          setTitleInput('Perfil de Instagram');
          setCategory('redes');
        } else if (host.includes('wa.me') || host.includes('whatsapp.com')) {
          setTitleInput('WhatsApp Contacto');
          setCategory('comercio');
        } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
          setTitleInput('Canal de YouTube');
          setCategory('redes');
        } else if (host.includes('drive.google.com') || host.includes('dropbox.com')) {
          setTitleInput('Archivo en la Nube');
          setCategory('documentos');
        } else if (host.length > 3) {
          const capitalized = host.charAt(0).toUpperCase() + host.slice(1);
          setTitleInput(capitalized);
        }
      } catch {
        // ignore parsing
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!computedUrl) return;

    let finalTitle = titleInput.trim();
    if (!finalTitle) {
      if (mode === 'whatsapp') {
        finalTitle = `WhatsApp (${waPhone || 'Contacto'})`;
      } else if (mode === 'wifi') {
        finalTitle = `Wi-Fi ${wifiSsid || 'Red'}`;
      } else {
        finalTitle = computedUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'Enlace Guardado';
      }
    }

    const assignedCategory: LinkCategory =
      mode === 'wifi' ? 'wifi' : mode === 'whatsapp' ? 'comercio' : category;

    onSaveLink({
      title: finalTitle,
      url: computedUrl,
      category: assignedCategory,
      notes: notes.trim(),
      isFavorite: false,
      customColor: selectedColor,
      frameStyle: mode === 'whatsapp' ? 'scanme' : mode === 'wifi' ? 'badge' : 'card',
      iconType: mode === 'whatsapp' ? 'whatsapp' : mode === 'wifi' ? 'wifi' : 'globe',
    });

    // Reset fields
    setUrlInput('');
    setTitleInput('');
    setNotes('');
    if (mode === 'whatsapp') setWaPhone('');
    if (mode === 'wifi') {
      setWifiSsid('');
      setWifiPassword('');
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    if (onResetSpecialMode) {
      onResetSpecialMode();
    }
  };

  const colorPresets = [
    { label: 'McLaren Papaya', color: '#FF8000' },
    { label: 'Velocity Blue', color: '#00A3E0' },
    { label: 'Carbon Stealth', color: '#14171A' },
    { label: 'Fluro Papaya', color: '#FF5500' },
    { label: 'Titanium Gunmetal', color: '#333945' },
  ];

  return (
    <section className="bg-[#13171f] border border-[#232936] rounded-2xl shadow-xl p-6 md:p-8 transition-all">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left column: Input Form & Mode Switcher */}
        <div className="flex-1 w-full space-y-6">
          {/* Section Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF8000] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8000]" />
              <span>Caja de Enlaces & Creación de QR</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Coloca aquí tu enlace para generar acceso directo instantáneo
            </h2>
            <p className="text-sm text-slate-400">
              Ingresa una dirección web, número de WhatsApp o red Wi-Fi para obtener tu código QR listo para escanear, descargar e imprimir.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b0e14] border border-[#232936] rounded-xl max-w-fit">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'url'
                  ? 'bg-[#FF8000] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${mode === 'url' ? 'text-black' : 'text-[#FF8000]'}`} />
              <span>Enlace Web URL</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('whatsapp')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'whatsapp'
                  ? 'bg-[#FF8000] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle className={`w-3.5 h-3.5 ${mode === 'whatsapp' ? 'text-black' : 'text-emerald-400'}`} />
              <span>WhatsApp Directo</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('wifi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'wifi'
                  ? 'bg-[#00A3E0] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className={`w-3.5 h-3.5 ${mode === 'wifi' ? 'text-black' : 'text-[#00A3E0]'}`} />
              <span>Red Wi-Fi</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Mode: Standard URL */}
            {mode === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Dirección URL o Enlace del Sitio / Documento *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={urlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://ejemplo.com/menu-digital o instagram.com/tu_cuenta"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF8000] focus:border-[#FF8000] font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre o Título Descriptivo
                    </label>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="Ej. Menú Principal, Telemetría F1"
                      className="w-full px-3.5 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF8000] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Categoría / Carpeta
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as LinkCategory)}
                        className="w-full px-3.5 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FF8000] appearance-none transition-colors"
                      >
                        <option value="comercio">Comercio / Menús / Tienda</option>
                        <option value="redes">Redes Sociales & Perfiles</option>
                        <option value="documentos">Documentos / PDFs / Drive</option>
                        <option value="trabajo">Trabajo & Reuniones</option>
                        <option value="personal">Personal & Favoritos</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode: WhatsApp Direct */}
            {mode === 'whatsapp' && (
              <div className="space-y-4 bg-[#091510] p-4 rounded-xl border border-[#16422b]">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Código País
                    </label>
                    <input
                      type="text"
                      value={waCountryCode}
                      onChange={(e) => setWaCountryCode(e.target.value)}
                      placeholder="+54"
                      className="w-full px-3 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Número Telefónico *
                    </label>
                    <input
                      type="tel"
                      required
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="91123456789 (sin ceros ni guiones)"
                      className="w-full px-3 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mensaje Inicial Predefinido (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Hola, me comunico a través del código QR..."
                    className="w-full px-3 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Título en la Caja
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="WhatsApp Atención al Cliente"
                    className="w-full px-3 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Mode: Wi-Fi Quick Access */}
            {mode === 'wifi' && (
              <div className="space-y-4 bg-[#07131e] p-4 rounded-xl border border-[#123652]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre de la Red Wi-Fi (SSID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="McLaren_Pitlane_5G"
                      className="w-full px-3 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Contraseña Wi-Fi
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="papaya2026"
                      className="w-full px-3 py-2 text-sm bg-[#0e1117] border border-[#283040] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0] font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-300">Seguridad:</span>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                      className="px-2 py-1 bg-[#0e1117] border border-[#283040] text-white rounded-md text-xs font-medium"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Estándar)</option>
                      <option value="WEP">WEP (Antigua)</option>
                      <option value="nopass">Sin Contraseña (Abierta)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded border-[#283040] bg-[#0e1117] text-[#00A3E0] focus:ring-[#00A3E0]"
                    />
                    <span>Red oculta</span>
                  </label>
                </div>
              </div>
            )}

            {/* Quick Color Selection */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Color del QR:</span>
                <div className="flex items-center gap-1.5">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setSelectedColor(preset.color)}
                      style={{ backgroundColor: preset.color }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        selectedColor === preset.color ? 'ring-2 ring-offset-2 ring-offset-[#13171f] ring-[#FF8000] scale-110' : 'hover:scale-105'
                      }`}
                      title={preset.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    title="Color personalizado"
                    className="w-5 h-5 rounded cursor-pointer border border-[#283040] p-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!computedUrl}
                  onClick={() => onOpenStudioWithData(computedUrl, titleInput || 'Mi Enlace')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#181d26] hover:bg-[#202734] border border-[#2b3342] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#FF8000]" />
                  <span>Estudio QR & Descarga</span>
                </button>

                <button
                  type="submit"
                  disabled={!computedUrl}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black text-black bg-[#FF8000] hover:bg-[#FFA033] rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-black stroke-[3]" />
                      <span>¡Guardado en la Caja!</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 stroke-[2.5]" />
                      <span>Guardar en la Caja</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right column: Interactive Live QR Box Preview */}
        <div className="w-full lg:w-72 shrink-0 bg-[#0e1117] border border-[#232936] rounded-2xl p-5 flex flex-col items-center justify-between min-h-[300px]">
          <div className="w-full text-center space-y-1 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF8000]">
              Vista Previa en Vivo
            </span>
            <p className="text-xs font-bold text-slate-200 truncate max-w-full">
              {titleInput || (computedUrl ? 'Enlace Directo' : 'Esperando enlace...')}
            </p>
          </div>

          {/* QR Display Card */}
          <div className="w-48 h-48 bg-white border border-[#232936] rounded-xl shadow-lg p-3 flex items-center justify-center relative group">
            {previewQr ? (
              <img
                src={previewQr}
                alt="Código QR preliminar"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4 text-slate-400 space-y-2">
                <QrCode className="w-12 h-12 mx-auto stroke-1 opacity-50 text-slate-400" />
                <p className="text-xs">Escribe un enlace para ver el código QR</p>
              </div>
            )}
          </div>

          {/* URL snippet & Test button */}
          <div className="w-full mt-4 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 bg-[#141820] px-2.5 py-1.5 rounded-lg border border-[#232936] truncate text-center">
              {computedUrl ? computedUrl.replace(/^https?:\/\//i, '') : 'https://...'}
            </div>

            {computedUrl && !computedUrl.startsWith('WIFI:') && (
              <a
                href={computedUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#00A3E0] hover:text-[#52c8f8] transition-colors py-1"
              >
                <span>Probar Acceso Directo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
