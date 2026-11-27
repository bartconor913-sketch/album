import { toBlob } from 'html-to-image';
import { ALBUM_FONT_CONFIG, type AlbumFont } from '../types/album';

interface CapturePreviewPngOptions {
  element: HTMLElement;
  albumTitle: string;
  pageIndex: number;
  albumFont: AlbumFont;
}

export async function capturePreviewElementToPng({
  element,
  albumTitle,
  pageIndex,
  albumFont,
}: CapturePreviewPngOptions): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
    const spec = ALBUM_FONT_CONFIG[albumFont];
    await Promise.all([
      document.fonts.load(`${spec.titleWeight} 40px "${spec.preloadFamily}"`).catch(() => {}),
      document.fonts.load(`${spec.bodyWeight} 20px "${spec.preloadFamily}"`).catch(() => {}),
      document.fonts.load(`400 16px "Noto Sans KR"`).catch(() => {}),
    ]);
  }

  // Ensure all images inside the preview card are fully decoded
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) =>
      typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve()
    )
  );

  const blob = await toBlob(element, {
    pixelRatio: 2,
    cacheBust: false,
    backgroundColor: '#FFFFFF',
    skipAutoScale: true,
  });

  if (!blob) {
    throw new Error('PNG 이미지를 생성하지 못했습니다.');
  }

  const safeFileBase = (albumTitle.trim() || '모노그래프_포토앨범')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 60);
  const pageTag = String(pageIndex + 1).padStart(2, '0');
  const fileName = `${safeFileBase}_${pageTag}쪽.png`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
