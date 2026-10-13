import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Link2,
  Check,
  ExternalLink,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { decodeQRFromFile, decodeQRFromVideo } from '../utils/qrScannerHelper';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScannedUrl: (url: string, suggestedTitle: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onAddScannedUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedResult(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);

        const scanFrame = () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const result = decodeQRFromVideo(videoRef.current);
            if (result) {
              handleFoundResult(result);
              stopCamera();
              return;
            }
          }
          animationFrameId.current = requestAnimationFrame(scanFrame);
        };
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('No se pudo acceder a la cámara. Asegúrate de otorgar permisos o utiliza la carga de imagen.');
      setIsCameraActive(false);
    }
  };

  const handleFoundResult = (rawUrl: string) => {
    setScannedResult(rawUrl);
    setErrorMessage(null);

    // Generate nice title
    try {
      if (rawUrl.startsWith('WIFI:')) {
        setSuggestedTitle('Red Wi-Fi Escaneada');
      } else {
        const cleaned = rawUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
        const host = cleaned.split('/')[0];
        setSuggestedTitle(`Enlace de ${host}`);
      }
    } catch {
      setSuggestedTitle('Enlace Escaneado');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      const result = await decodeQRFromFile(file);
      if (result) {
        handleFoundResult(result);
      } else {
        setErrorMessage('No se detectó ningún código QR legible en esta imagen. Prueba con otra imagen con buena iluminación.');
      }
    } catch (err) {
      setErrorMessage('Error al procesar la imagen.');
    }
  };

  const handleSaveToVault = () => {
    if (!scannedResult) return;
    onAddScannedUrl(scannedResult, suggestedTitle || 'Enlace Escaneado');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#13171f] text-white rounded-3xl shadow-2xl border border-[#232936] max-w-lg w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF8000]/20 text-[#FF8000] flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Escanear Código QR</h3>
              <p className="text-xs text-slate-400">Decodifica un QR para guardarlo en tu caja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#181d26] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0e1117] border border-[#232936] rounded-xl">
          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'upload'
                ? 'bg-[#FF8000] text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Imagen / Foto</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'camera'
                ? 'bg-[#FF8000] text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Cámara Web</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'upload' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#283040] hover:border-[#FF8000] bg-[#0e1117] rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-3 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 bg-[#1a202c] rounded-full shadow-sm flex items-center justify-center mx-auto text-[#FF8000] group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Haz clic para subir o arrastra una imagen aquí
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG o captura de pantalla con código QR
              </p>
            </div>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-[#232936]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                autoPlay
                playsInline
              />
              <div className="absolute inset-0 border-2 border-[#FF8000]/70 m-8 rounded-xl pointer-events-none animate-pulse" />
            </div>
            <p className="text-xs text-center text-slate-400">
              Apunta la cámara hacia el código QR para leerlo automáticamente.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 bg-rose-950/40 border border-rose-900 rounded-xl text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scanned Result Card */}
        {scannedResult && (
          <div className="bg-[#091510] border border-[#16422b] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Código QR Decodificado con Éxito</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Título Sugerido
                </label>
                <input
                  type="text"
                  value={suggestedTitle}
                  onChange={(e) => setSuggestedTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0e1117] border border-[#283040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF8000]"
                />
              </div>

              <div className="p-2.5 bg-[#0e1117] rounded-lg border border-[#232936] font-mono text-xs break-all text-slate-200">
                {scannedResult}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {!scannedResult.startsWith('WIFI:') && (
                <a
                  href={scannedResult}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#181d26] hover:bg-[#202735] border border-[#2b3342] rounded-lg transition-colors"
                >
                  <span>Probar Link</span>
                  <ExternalLink className="w-3 h-3 text-[#00A3E0]" />
                </a>
              )}
              <button
                onClick={handleSaveToVault}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black text-black bg-[#FF8000] hover:bg-[#FFA033] rounded-lg transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Guardar en Mi Caja</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
