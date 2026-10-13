export type LinkCategory = 
  | 'todos'
  | 'favoritos'
  | 'trabajo'
  | 'redes'
  | 'comercio'
  | 'documentos'
  | 'wifi'
  | 'personal';

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  category: LinkCategory;
  notes?: string;
  isFavorite: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  customColor?: string;
  customBg?: string;
  frameStyle?: 'clean' | 'card' | 'badge' | 'scanme';
  iconType?: 'none' | 'link' | 'globe' | 'whatsapp' | 'wifi' | 'star' | 'file';
}

export interface QRConfig {
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  frameStyle: 'clean' | 'card' | 'badge' | 'scanme';
  frameText: string;
  showUrl: boolean;
  size: number;
  iconType: 'none' | 'link' | 'globe' | 'whatsapp' | 'wifi' | 'star' | 'file';
}
