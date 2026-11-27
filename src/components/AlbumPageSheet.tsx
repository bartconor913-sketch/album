import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { ALBUM_FONT_CONFIG, type AlbumFont, type PdfOrientation, type PhotoPage } from '../types/album';

interface AlbumPageSheetProps {
  page: PhotoPage;
  pageIndex: number;
  totalPages: number;
  albumTitle: string;
  orientation: PdfOrientation;
  albumFont: AlbumFont;
  isCapturing?: boolean;
  onUpdatePage: (id: string, patch: Partial<Pick<PhotoPage, 'title' | 'description'>>) => void;
}

export const AlbumPageSheet: React.FC<AlbumPageSheetProps> = ({
  page,
  pageIndex,
  totalPages,
  albumTitle,
  orientation,
  albumFont,
  isCapturing = false,
  onUpdatePage,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [page.id, page.src]);

  const isLandscape = orientation === 'landscape';
  const fontClass = ALBUM_FONT_CONFIG[albumFont].className;
  const isHandwriting = albumFont === 'handwriting';

  return (
    <article
      aria-label={`${pageIndex + 1}쪽 앨범 페이지`}
      className={`w-full mx-auto bg-white border border-zinc-200 rounded-lg shadow-sm transition-all duration-200 ${
        isLandscape ? 'max-w-[900px]' : 'max-w-[680px]'
      }`}
    >
      <div className="p-6 sm:p-10 md:p-12 flex flex-col">
        {/* Quiet top editorial header matching PDF export layout */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-100 text-xs text-zinc-400">
          <span className={`truncate max-w-[65%] ${fontClass}`}>
            {albumTitle.trim() || '포토 앨범'}
          </span>
          <span className="tabular-nums shrink-0">
            {String(pageIndex + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
        </div>

        {/* Single Photo Gallery Mat Frame */}
        <div
          className={`mt-6 w-full bg-zinc-50 border border-zinc-100 rounded-md flex items-center justify-center overflow-hidden p-3 sm:p-5 ${
            isLandscape
              ? 'h-[300px] sm:h-[380px] md:h-[420px]'
              : 'h-[320px] sm:h-[420px] md:h-[470px]'
          }`}
        >
          {imgError ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 p-6 text-zinc-400">
              <ImageOff className="w-8 h-8" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-600">
                  사진을 표시할 수 없습니다
                </p>
                <p className="text-xs text-zinc-400">{page.fileName}</p>
              </div>
            </div>
          ) : (
            <img
              src={page.src}
              alt={page.title.trim() || page.fileName || `${pageIndex + 1}번 사진`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="max-w-full max-h-full w-auto h-auto object-contain shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            />
          )}
        </div>

        {/* Hairline separator & Per-photo Title + Description Editor */}
        {(!isCapturing || page.title.trim().length > 0 || page.description.trim().length > 0) && (
          <div className="mt-7 pt-6 border-t border-zinc-200/80 space-y-3">
            {(!isCapturing || page.title.trim().length > 0) && (
              <div>
                <label htmlFor={`photo-title-${page.id}`} className="sr-only">
                  사진 제목
                </label>
                {isCapturing ? (
                  <div
                    className={`w-full ${fontClass} ${
                      isHandwriting
                        ? 'text-2xl sm:text-3xl font-normal'
                        : 'text-xl sm:text-2xl font-bold'
                    } text-zinc-900 px-2.5 py-1.5 -mx-2.5 whitespace-pre-wrap break-words`}
                  >
                    {page.title}
                  </div>
                ) : (
                  <input
                    id={`photo-title-${page.id}`}
                    type="text"
                    value={page.title}
                    onChange={(e) => onUpdatePage(page.id, { title: e.target.value })}
                    placeholder="사진 제목을 입력하세요"
                    maxLength={120}
                    className={`w-full ${fontClass} ${
                      isHandwriting
                        ? 'text-2xl sm:text-3xl font-normal'
                        : 'text-xl sm:text-2xl font-bold'
                    } text-zinc-900 placeholder:text-zinc-300 bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-600 focus:bg-zinc-50/40 rounded-md px-2.5 py-1.5 -mx-2.5 transition-colors focus:outline-none`}
                  />
                )}
              </div>
            )}

            {(!isCapturing || page.description.trim().length > 0) && (
              <div>
                <label htmlFor={`photo-desc-${page.id}`} className="sr-only">
                  사진 설명
                </label>
                {isCapturing ? (
                  <div
                    className={`w-full ${fontClass} ${
                      isHandwriting
                        ? 'text-lg sm:text-xl leading-relaxed'
                        : 'text-[15px] leading-relaxed'
                    } text-zinc-700 px-2.5 py-2 -mx-2.5 whitespace-pre-wrap break-words`}
                  >
                    {page.description}
                  </div>
                ) : (
                  <textarea
                    id={`photo-desc-${page.id}`}
                    value={page.description}
                    onChange={(e) => onUpdatePage(page.id, { description: e.target.value })}
                    placeholder="이 사진에 대한 설명이나 기억을 자유롭게 적어보세요..."
                    rows={3}
                    maxLength={600}
                    className={`w-full ${fontClass} ${
                      isHandwriting
                        ? 'text-lg sm:text-xl leading-relaxed'
                        : 'text-[15px] leading-relaxed'
                    } text-zinc-700 placeholder:text-zinc-300 bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-600 focus:bg-zinc-50/40 rounded-md px-2.5 py-2 -mx-2.5 resize-none transition-colors focus:outline-none`}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Quiet page footer */}
        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-zinc-400">
          <span className="truncate max-w-[240px]">{page.fileName}</span>
          <span className="tabular-nums shrink-0">— {pageIndex + 1} —</span>
        </div>
      </div>
    </article>
  );
};
