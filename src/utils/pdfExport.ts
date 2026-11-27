import { jsPDF } from 'jspdf';
import {
  ALBUM_FONT_CONFIG,
  type AlbumCoverData,
  type AlbumFont,
  type PdfOrientation,
  type PhotoPage,
} from '../types/album';

interface ExportPdfOptions {
  cover: AlbumCoverData;
  pages: PhotoPage[];
  closingMessage: string;
  orientation: PdfOrientation;
  albumFont: AlbumFont;
  onProgress?: (current: number, total: number) => void;
}

interface ExportPngOptions {
  pageIndex: number;
  cover: AlbumCoverData;
  pages: PhotoPage[];
  closingMessage: string;
  orientation: PdfOrientation;
  albumFont: AlbumFont;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

const ensureFontsLoaded = async (albumFont: AlbumFont) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  await document.fonts.ready;
  const spec = ALBUM_FONT_CONFIG[albumFont];
  await Promise.all([
    document.fonts.load(`${spec.titleWeight} 48px "${spec.preloadFamily}"`).catch(() => {}),
    document.fonts.load(`${spec.bodyWeight} 28px "${spec.preloadFamily}"`).catch(() => {}),
    document.fonts.load(`400 24px "Noto Sans KR"`).catch(() => {}),
  ]);
};

const wrapCanvasText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  if (!text.trim()) return [];
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }

    let currentLine = '';
    const tokens = paragraph.split(/(\s+)/);

    for (const token of tokens) {
      const testLine = currentLine + token;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine.trim().length > 0) {
          lines.push(currentLine.trimEnd());
          currentLine = '';
        }

        const trimmedToken = token.trimStart();
        if (ctx.measureText(trimmedToken).width <= maxWidth) {
          currentLine = trimmedToken;
        } else {
          for (const char of trimmedToken) {
            const charTest = currentLine + char;
            if (ctx.measureText(charTest).width > maxWidth && currentLine.length > 0) {
              lines.push(currentLine);
              currentLine = char;
            } else {
              currentLine = charTest;
            }
          }
        }
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.trimEnd());
    }
  }

  return lines;
};

const getCanvasDimensions = (orientation: PdfOrientation) => {
  const isLandscape = orientation === 'landscape';
  return {
    isLandscape,
    mmWidth: isLandscape ? 297 : 210,
    mmHeight: isLandscape ? 210 : 297,
    canvasWidth: isLandscape ? 2339 : 1654,
    canvasHeight: isLandscape ? 1654 : 2339,
  };
};

const renderCoverPage = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  isLandscape: boolean,
  cover: AlbumCoverData,
  photoCount: number,
  albumFont: AlbumFont
) => {
  const fontSpec = ALBUM_FONT_CONFIG[albumFont];
  const cleanAlbumTitle = cover.title.trim() || '포토 앨범';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const coverFrameInset = isLandscape ? 110 : 100;
  ctx.fillStyle = '#FDFCFA';
  ctx.fillRect(
    coverFrameInset,
    coverFrameInset,
    canvasWidth - coverFrameInset * 2,
    canvasHeight - coverFrameInset * 2
  );
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    coverFrameInset,
    coverFrameInset,
    canvasWidth - coverFrameInset * 2,
    canvasHeight - coverFrameInset * 2
  );

  const coverMaxWidth = canvasWidth - (coverFrameInset + 140) * 2;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 24px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  ctx.fillText(`사진 ${photoCount}장 수록`, canvasWidth / 2, coverFrameInset + 105);

  const titleSize = Math.round((isLandscape ? 82 : 88) * fontSpec.scale);
  const titleLineHeight = Math.round(titleSize * 1.36);
  ctx.font = `${fontSpec.titleWeight} ${titleSize}px ${fontSpec.canvasFamily}`;
  const coverTitleLines = wrapCanvasText(ctx, cleanAlbumTitle, coverMaxWidth).slice(0, 3);

  const subtitleSize = Math.round((isLandscape ? 34 : 38) * fontSpec.scale);
  const subtitleLineHeight = Math.round(subtitleSize * 1.5);
  ctx.font = `${fontSpec.bodyWeight} ${subtitleSize}px ${fontSpec.canvasFamily}`;
  const subtitleLines = cover.subtitle.trim()
    ? wrapCanvasText(ctx, cover.subtitle.trim(), coverMaxWidth).slice(0, 3)
    : [];

  const blockHeight =
    coverTitleLines.length * titleLineHeight +
    (subtitleLines.length > 0 ? 36 + subtitleLines.length * subtitleLineHeight : 0);

  let coverY = (canvasHeight - blockHeight) / 2 + (isLandscape ? 24 : 14);

  ctx.fillStyle = '#18181B';
  ctx.font = `${fontSpec.titleWeight} ${titleSize}px ${fontSpec.canvasFamily}`;
  for (const line of coverTitleLines) {
    ctx.fillText(line, canvasWidth / 2, coverY);
    coverY += titleLineHeight;
  }

  if (subtitleLines.length > 0) {
    coverY += 24;
    ctx.fillStyle = '#52525B';
    ctx.font = `${fontSpec.bodyWeight} ${subtitleSize}px ${fontSpec.canvasFamily}`;
    for (const line of subtitleLines) {
      ctx.fillText(line, canvasWidth / 2, coverY);
      coverY += subtitleLineHeight;
    }
  }

  const authorText = cover.author.trim();
  const dateText = cover.date.trim();
  if (authorText || dateText) {
    const metaLineY = canvasHeight - coverFrameInset - 125;
    ctx.strokeStyle = '#D4D4D8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 - 140, metaLineY - 70);
    ctx.lineTo(canvasWidth / 2 + 140, metaLineY - 70);
    ctx.stroke();

    const metaSize = Math.round(38 * fontSpec.scale);
    ctx.fillStyle = '#18181B';
    ctx.font = `${fontSpec.titleWeight} ${metaSize}px ${fontSpec.canvasFamily}`;
    const metaCombined = [authorText, dateText].filter(Boolean).join('   ·   ');
    ctx.fillText(metaCombined, canvasWidth / 2, metaLineY);
  }
};

const renderPhotoPage = async (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  isLandscape: boolean,
  cover: AlbumCoverData,
  page: PhotoPage,
  pageNum: number,
  totalPdfPages: number,
  albumFont: AlbumFont
) => {
  const fontSpec = ALBUM_FONT_CONFIG[albumFont];
  const cleanAlbumTitle = cover.title.trim() || '포토 앨범';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const marginX = isLandscape ? 150 : 130;
  const topHeaderY = 92;
  const footerY = canvasHeight - 72;
  const contentWidth = canvasWidth - marginX * 2;

  ctx.fillStyle = '#71717A';
  ctx.font = `${fontSpec.bodyWeight} ${Math.round(24 * fontSpec.scale)}px ${fontSpec.canvasFamily}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(cleanAlbumTitle, marginX, topHeaderY);

  ctx.textAlign = 'right';
  ctx.font = '500 24px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  const pageBadge = `${String(pageNum).padStart(2, '0')} / ${String(totalPdfPages).padStart(2, '0')}`;
  ctx.fillText(pageBadge, canvasWidth - marginX, topHeaderY);

  ctx.strokeStyle = '#F4F4F5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, topHeaderY + 24);
  ctx.lineTo(canvasWidth - marginX, topHeaderY + 24);
  ctx.stroke();

  const photoAreaTop = topHeaderY + 64;
  const hasTitle = page.title.trim().length > 0;
  const hasDesc = page.description.trim().length > 0;
  const captionReserveHeight =
    hasTitle || hasDesc
      ? isLandscape
        ? 350
        : 450
      : 80;

  const photoAreaHeight = footerY - 64 - captionReserveHeight - photoAreaTop;

  try {
    const img = await loadImage(page.src);
    const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
    const boxRatio = contentWidth / Math.max(1, photoAreaHeight);

    let drawW = contentWidth;
    let drawH = photoAreaHeight;
    if (imgRatio > boxRatio) {
      drawW = contentWidth;
      drawH = contentWidth / imgRatio;
    } else {
      drawH = photoAreaHeight;
      drawW = photoAreaHeight * imgRatio;
    }

    const drawX = marginX + (contentWidth - drawW) / 2;
    const drawY = photoAreaTop + (photoAreaHeight - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, drawW, drawH);
  } catch {
    ctx.fillStyle = '#F4F4F5';
    ctx.fillRect(marginX, photoAreaTop, contentWidth, photoAreaHeight);
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 2;
    ctx.strokeRect(marginX, photoAreaTop, contentWidth, photoAreaHeight);
    ctx.fillStyle = '#71717A';
    ctx.font = '500 28px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      page.fileName || '이미지를 불러올 수 없습니다',
      canvasWidth / 2,
      photoAreaTop + photoAreaHeight / 2
    );
  }

  let cursorY = photoAreaTop + photoAreaHeight + 54;

  if (hasTitle || hasDesc) {
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginX, cursorY);
    ctx.lineTo(canvasWidth - marginX, cursorY);
    ctx.stroke();

    cursorY += 68;
    ctx.textAlign = 'left';

    if (hasTitle) {
      const photoTitleSize = Math.round(44 * fontSpec.scale);
      const photoTitleLineH = Math.round(photoTitleSize * 1.4);
      ctx.fillStyle = '#18181B';
      ctx.font = `${fontSpec.titleWeight} ${photoTitleSize}px ${fontSpec.canvasFamily}`;
      const titleLines = wrapCanvasText(ctx, page.title.trim(), contentWidth);
      const maxTitleLines = 2;
      for (let i = 0; i < Math.min(titleLines.length, maxTitleLines); i++) {
        ctx.fillText(titleLines[i], marginX, cursorY);
        cursorY += photoTitleLineH;
      }
      if (hasDesc) {
        cursorY += 12;
      }
    }

    if (hasDesc) {
      const descSize = Math.round(28 * fontSpec.scale);
      const lineHeight = Math.round(descSize * 1.62);
      ctx.fillStyle = '#52525B';
      ctx.font = `${fontSpec.bodyWeight} ${descSize}px ${fontSpec.canvasFamily}`;
      const descLines = wrapCanvasText(ctx, page.description.trim(), contentWidth);
      for (const line of descLines) {
        if (cursorY + lineHeight > footerY - 24) break;
        ctx.fillText(line, marginX, cursorY);
        cursorY += lineHeight;
      }
    }
  }

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '400 22px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${pageNum} —`, canvasWidth / 2, footerY);
};

const renderClosingPage = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  isLandscape: boolean,
  cover: AlbumCoverData,
  closingMessage: string,
  totalPdfPages: number,
  albumFont: AlbumFont
) => {
  const fontSpec = ALBUM_FONT_CONFIG[albumFont];
  const cleanAlbumTitle = cover.title.trim() || '포토 앨범';
  const authorText = cover.author.trim();
  const dateText = cover.date.trim();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const marginX = isLandscape ? 150 : 130;
  const topHeaderY = 92;
  const footerY = canvasHeight - 72;

  ctx.fillStyle = '#71717A';
  ctx.font = `${fontSpec.bodyWeight} ${Math.round(24 * fontSpec.scale)}px ${fontSpec.canvasFamily}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(cleanAlbumTitle, marginX, topHeaderY);

  ctx.textAlign = 'right';
  ctx.font = '500 24px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  const lastBadge = `${String(totalPdfPages).padStart(2, '0')} / ${String(totalPdfPages).padStart(2, '0')}`;
  ctx.fillText(lastBadge, canvasWidth - marginX, topHeaderY);

  ctx.strokeStyle = '#F4F4F5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, topHeaderY + 24);
  ctx.lineTo(canvasWidth - marginX, topHeaderY + 24);
  ctx.stroke();

  const closingBoxTop = topHeaderY + 80;
  const closingBoxHeight = footerY - 80 - closingBoxTop;
  ctx.fillStyle = '#FDFCFA';
  ctx.fillRect(marginX, closingBoxTop, canvasWidth - marginX * 2, closingBoxHeight);
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 2;
  ctx.strokeRect(marginX, closingBoxTop, canvasWidth - marginX * 2, closingBoxHeight);

  const closingMaxWidth = canvasWidth - (marginX + 140) * 2;
  ctx.textAlign = 'center';

  const cleanClosing = closingMessage.trim();
  if (cleanClosing) {
    const closingSize = Math.round(38 * fontSpec.scale);
    const lineH = Math.round(closingSize * 1.7);
    ctx.font = `${fontSpec.bodyWeight} ${closingSize}px ${fontSpec.canvasFamily}`;
    const closingLines = wrapCanvasText(ctx, cleanClosing, closingMaxWidth).slice(0, 10);
    const totalTextH = closingLines.length * lineH;
    let textY = closingBoxTop + (closingBoxHeight - totalTextH) / 2;

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 24px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
    ctx.fillText('마무리 문구', canvasWidth / 2, textY - 64);

    ctx.fillStyle = '#18181B';
    ctx.font = `${fontSpec.bodyWeight} ${closingSize}px ${fontSpec.canvasFamily}`;
    for (const line of closingLines) {
      ctx.fillText(line, canvasWidth / 2, textY);
      textY += lineH;
    }

    if (authorText || dateText) {
      const sigY = textY + 48;
      ctx.strokeStyle = '#D4D4D8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2 - 80, sigY - 36);
      ctx.lineTo(canvasWidth / 2 + 80, sigY - 36);
      ctx.stroke();

      ctx.fillStyle = '#71717A';
      ctx.font = `${fontSpec.bodyWeight} ${Math.round(26 * fontSpec.scale)}px ${fontSpec.canvasFamily}`;
      ctx.fillText([authorText, dateText].filter(Boolean).join(' · '), canvasWidth / 2, sigY + 12);
    }
  } else if (authorText || dateText) {
    ctx.fillStyle = '#71717A';
    ctx.font = `${fontSpec.bodyWeight} ${Math.round(28 * fontSpec.scale)}px ${fontSpec.canvasFamily}`;
    ctx.fillText(
      [authorText, dateText].filter(Boolean).join(' · '),
      canvasWidth / 2,
      closingBoxTop + closingBoxHeight / 2
    );
  }

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '400 22px "Plus Jakarta Sans", "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${totalPdfPages} —`, canvasWidth / 2, footerY);
};

export async function exportAlbumToPdf({
  cover,
  pages,
  closingMessage,
  orientation,
  albumFont,
  onProgress,
}: ExportPdfOptions): Promise<void> {
  if (pages.length === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  await ensureFontsLoaded(albumFont);

  const { isLandscape, mmWidth, mmHeight, canvasWidth, canvasHeight } =
    getCanvasDimensions(orientation);

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('PDF 렌더링 컨텍스트를 초기화할 수 없습니다.');
  }

  const totalPdfPages = pages.length + 2;

  // 1. Cover page
  onProgress?.(1, totalPdfPages);
  renderCoverPage(ctx, canvasWidth, canvasHeight, isLandscape, cover, pages.length, albumFont);
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
  await new Promise((r) => setTimeout(r, 15));

  // 2. Photo pages
  for (let index = 0; index < pages.length; index++) {
    const currentPdfPageNum = index + 2;
    onProgress?.(currentPdfPageNum, totalPdfPages);
    await renderPhotoPage(
      ctx,
      canvasWidth,
      canvasHeight,
      isLandscape,
      cover,
      pages[index],
      currentPdfPageNum,
      totalPdfPages,
      albumFont
    );
    pdf.addPage([mmWidth, mmHeight], isLandscape ? 'landscape' : 'portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
    await new Promise((r) => setTimeout(r, 15));
  }

  // 3. Closing page
  onProgress?.(totalPdfPages, totalPdfPages);
  renderClosingPage(
    ctx,
    canvasWidth,
    canvasHeight,
    isLandscape,
    cover,
    closingMessage,
    totalPdfPages,
    albumFont
  );
  pdf.addPage([mmWidth, mmHeight], isLandscape ? 'landscape' : 'portrait');
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');

  const safeFileBase = (cover.title.trim() || '모노그래프_포토앨범')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 80);

  pdf.save(`${safeFileBase}.pdf`);
}

export async function exportCurrentPageToPng({
  pageIndex,
  cover,
  pages,
  closingMessage,
  orientation,
  albumFont,
}: ExportPngOptions): Promise<void> {
  if (pages.length === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  await ensureFontsLoaded(albumFont);

  const { isLandscape, canvasWidth, canvasHeight } = getCanvasDimensions(orientation);
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('PNG 렌더링 컨텍스트를 초기화할 수 없습니다.');
  }

  const totalPages = pages.length + 2;

  if (pageIndex === 0) {
    renderCoverPage(ctx, canvasWidth, canvasHeight, isLandscape, cover, pages.length, albumFont);
  } else if (pageIndex === totalPages - 1) {
    renderClosingPage(
      ctx,
      canvasWidth,
      canvasHeight,
      isLandscape,
      cover,
      closingMessage,
      totalPages,
      albumFont
    );
  } else {
    const photoPage = pages[pageIndex - 1];
    if (!photoPage) {
      throw new Error('해당 페이지를 찾을 수 없습니다.');
    }
    await renderPhotoPage(
      ctx,
      canvasWidth,
      canvasHeight,
      isLandscape,
      cover,
      photoPage,
      pageIndex + 1,
      totalPages,
      albumFont
    );
  }

  const safeFileBase = (cover.title.trim() || '모노그래프_포토앨범')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 60);
  const pageTag = String(pageIndex + 1).padStart(2, '0');
  const fileName = `${safeFileBase}_${pageTag}쪽.png`;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((result) => resolve(result), 'image/png')
  );

  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
