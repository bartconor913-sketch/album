import React from 'react';
import { ALBUM_FONT_CONFIG, type AlbumCoverData, type AlbumFont, type PdfOrientation } from '../types/album';

interface AlbumClosingSheetProps {
  closingMessage: string;
  cover: AlbumCoverData;
  pageIndex: number;
  totalPages: number;
  orientation: PdfOrientation;
  albumFont: AlbumFont;
  isCapturing?: boolean;
  onUpdateClosingMessage: (value: string) => void;
}

export const AlbumClosingSheet: React.FC<AlbumClosingSheetProps> = ({
  closingMessage,
  cover,
  pageIndex,
  totalPages,
  orientation,
  albumFont,
  isCapturing = false,
  onUpdateClosingMessage,
}) => {
  const isLandscape = orientation === 'landscape';
  const signatureParts = [cover.author.trim(), cover.date.trim()].filter(Boolean);
  const fontClass = ALBUM_FONT_CONFIG[albumFont].className;
  const isHandwriting = albumFont === 'handwriting';

  return (
    <article
      aria-label={`${pageIndex + 1}쪽 마무리 페이지`}
      className={`w-full mx-auto bg-white border border-zinc-200 rounded-lg shadow-sm transition-all duration-200 ${
        isLandscape ? 'max-w-[900px]' : 'max-w-[680px]'
      }`}
    >
      <div className="p-6 sm:p-10 md:p-12 flex flex-col">
        {/* Quiet top editorial header */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-100 text-xs text-zinc-400">
          <span className={`truncate max-w-[65%] ${fontClass}`}>
            {cover.title.trim() || '포토 앨범'}
          </span>
          <span className="tabular-nums shrink-0">
            {String(pageIndex + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
        </div>

        {/* Centered closing reflection page */}
        <div
          className={`mt-6 border border-zinc-100 rounded-md px-6 sm:px-12 py-12 flex flex-col items-center justify-center text-center bg-[#FDFCFA] ${
            isLandscape
              ? 'min-h-[420px] sm:min-h-[480px]'
              : 'min-h-[480px] sm:min-h-[580px]'
          }`}
        >
          <p className="text-xs font-medium tracking-wider text-zinc-400 mb-6">
            마무리 문구
          </p>

          <div className="w-full max-w-lg">
            <label htmlFor="closing-message-input" className="sr-only">
              앨범 마무리 문구
            </label>
            {isCapturing ? (
              <div
                className={`w-full ${fontClass} ${
                  isHandwriting
                    ? 'text-2xl sm:text-3xl leading-relaxed'
                    : 'text-lg sm:text-2xl leading-relaxed'
                } text-zinc-800 text-center px-4 py-3 whitespace-pre-wrap break-words`}
              >
                {closingMessage}
              </div>
            ) : (
              <textarea
                id="closing-message-input"
                value={closingMessage}
                onChange={(e) => onUpdateClosingMessage(e.target.value)}
                placeholder="앨범 마지막 쪽에 남길 마무리 문구를 작성해 보세요..."
                rows={6}
                maxLength={800}
                className={`w-full ${fontClass} ${
                  isHandwriting
                    ? 'text-2xl sm:text-3xl leading-relaxed'
                    : 'text-lg sm:text-2xl leading-relaxed'
                } text-zinc-800 placeholder:text-zinc-300 text-center bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-600 focus:bg-white rounded-md px-4 py-3 resize-none transition-colors focus:outline-none`}
              />
            )}
          </div>

          {signatureParts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-200 w-40">
              <p className={`text-xs text-zinc-500 whitespace-nowrap ${fontClass}`}>
                {signatureParts.join(' · ')}
              </p>
            </div>
          )}
        </div>

        {/* Quiet page footer */}
        <div className="mt-5 pt-3 flex items-center justify-between text-xs text-zinc-400">
          <span>마지막 쪽 · 마무리</span>
          <span className="tabular-nums shrink-0">— {pageIndex + 1} —</span>
        </div>
      </div>
    </article>
  );
};
