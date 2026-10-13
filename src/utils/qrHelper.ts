import QRCode from 'qrcode';
import { QRConfig } from '../types';

/**
 * Generate QR code as Data URL (PNG)
 */
export async function generateQRDataUrl(
  text: string,
  options: Partial<QRConfig> = {}
): Promise<string> {
  const fgColor = options.fgColor || '#0f172a';
  const bgColor = options.bgColor === 'transparent' ? '#00000000' : (options.bgColor || '#ffffff');
  const level = options.errorCorrectionLevel || 'M';
  const width = options.size || 512;

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width,
      margin: 1.5,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: level,
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

/**
 * Generate QR Code as SVG String
 */
export async function generateQRSvg(
  text: string,
  options: Partial<QRConfig> = {}
): Promise<string> {
  const fgColor = options.fgColor || '#0f172a';
  const bgColor = options.bgColor === 'transparent' ? 'none' : (options.bgColor || '#ffffff');
  const level = options.errorCorrectionLevel || 'M';

  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: 1.5,
      color: {
        dark: fgColor,
        light: bgColor === 'none' ? '#00000000' : bgColor,
      },
      errorCorrectionLevel: level,
    });
    return svg;
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    throw err;
  }
}

/**
 * Render a complete styled QR card to a canvas (useful for exporting with frame/text/icon)
 */
export async function renderFramedQRCanvas(
  text: string,
  title: string,
  config: QRConfig,
  targetWidth: number = 800
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Compute heights based on frame style
  const isScanMe = config.frameStyle === 'scanme';
  const isCard = config.frameStyle === 'card';
  const isBadge = config.frameStyle === 'badge';

  const qrBaseSize = Math.floor(targetWidth * 0.72);
  const margin = Math.floor(targetWidth * 0.1);

  let totalHeight = targetWidth;
  if (isScanMe || isCard) {
    totalHeight = Math.floor(targetWidth * 1.25);
  } else if (isBadge) {
    totalHeight = Math.floor(targetWidth * 1.15);
  }

  canvas.width = targetWidth;
  canvas.height = totalHeight;

  // Background
  ctx.fillStyle = config.bgColor === 'transparent' ? '#ffffff' : config.bgColor;
  ctx.fillRect(0, 0, targetWidth, totalHeight);

  // Generate QR base
  const qrDataUrl = await QRCode.toDataURL(text, {
    width: qrBaseSize,
    margin: 1,
    color: {
      dark: config.fgColor,
      light: '#00000000', // transparent inside QR
    },
    errorCorrectionLevel: config.errorCorrectionLevel,
  });

  const qrImg = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  const qrX = Math.floor((targetWidth - qrBaseSize) / 2);
  let qrY = margin;

  if (isScanMe) {
    // Header Banner "ESCANÉAME"
    ctx.fillStyle = config.fgColor;
    const bannerH = Math.floor(targetWidth * 0.12);
    ctx.fillRect(0, 0, targetWidth, bannerH);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(targetWidth * 0.05)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.frameText || 'ESCANEA AQUÍ', targetWidth / 2, bannerH / 2);

    qrY = bannerH + Math.floor(targetWidth * 0.06);
  } else if (isCard) {
    // Top Title
    ctx.fillStyle = config.fgColor;
    ctx.font = `bold ${Math.floor(targetWidth * 0.045)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const displayTitle = title.length > 32 ? title.slice(0, 30) + '...' : title;
    ctx.fillText(displayTitle, targetWidth / 2, Math.floor(targetWidth * 0.07));

    qrY = Math.floor(targetWidth * 0.16);
  }

  // Draw QR Image
  ctx.drawImage(qrImg, qrX, qrY, qrBaseSize, qrBaseSize);

  // Bottom text if applicable
  if (isScanMe || isCard || isBadge || config.showUrl) {
    const bottomY = qrY + qrBaseSize + Math.floor(targetWidth * 0.04);
    ctx.fillStyle = config.fgColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (isScanMe) {
      ctx.font = `600 ${Math.floor(targetWidth * 0.038)}px "Plus Jakarta Sans", sans-serif`;
      const displayTitle = title.length > 30 ? title.slice(0, 28) + '...' : title;
      ctx.fillText(displayTitle, targetWidth / 2, bottomY);

      if (config.showUrl) {
        ctx.fillStyle = '#64748b';
        ctx.font = `400 ${Math.floor(targetWidth * 0.026)}px "JetBrains Mono", monospace`;
        const cleanUrl = text.replace(/^https?:\/\//i, '').slice(0, 38);
        ctx.fillText(cleanUrl, targetWidth / 2, bottomY + Math.floor(targetWidth * 0.05));
      }
    } else if (isCard && config.showUrl) {
      ctx.fillStyle = '#64748b';
      ctx.font = `400 ${Math.floor(targetWidth * 0.026)}px "JetBrains Mono", monospace`;
      const cleanUrl = text.replace(/^https?:\/\//i, '').slice(0, 38);
      ctx.fillText(cleanUrl, targetWidth / 2, bottomY);
    } else if (isBadge) {
      ctx.font = `700 ${Math.floor(targetWidth * 0.034)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(config.frameText || 'ACCESO DIRECTO', targetWidth / 2, bottomY);
    }
  }

  return canvas;
}

/**
 * Trigger download of image data
 */
export function downloadFile(content: string, filename: string, isBlob: boolean = false, mimeType: string = 'image/png') {
  const link = document.createElement('a');
  link.download = filename;

  if (isBlob) {
    const blob = new Blob([content], { type: mimeType });
    link.href = URL.createObjectURL(blob);
  } else {
    link.href = content;
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}

/**
 * Copy canvas/image to clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return await new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } catch (err) {
          console.warn('Clipboard write failed:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
