import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-black px-3.5 py-2 text-xs font-bold shadow-2xl backdrop-blur-md animate-pulse border border-amber-300">
      <WifiOff className="h-4 w-4 shrink-0 text-black" />
      <span>Modo sin conexión — BOXQr funciona con tus enlaces guardados localmente.</span>
    </div>
  );
};
