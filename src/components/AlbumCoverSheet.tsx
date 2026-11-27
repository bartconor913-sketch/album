import React from 'react';
import { ALBUM_FONT_CONFIG, type AlbumCoverData, type AlbumFont, type PdfOrientation } from '../types/album';

interface AlbumCoverSheetProps {
  cover: AlbumCoverData;
  totalPages: number;
  photoCount: number;
  orientation: PdfOrientation;
  albumFont: AlbumFont;
  isCapturing?: boolean;
  onUpdateCover: (patch: Partial<AlbumCoverData>) => void;
}

export const AlbumCoverSheet: React.FC<AlbumCoverSheetProps> = ({
  cover,
  totalPages,
  photoCount,
  orientation,
  albumFont,
  isCapturing = false,
  onUpdateCover,
}) => {
  const isLandscape = orientation === 'landscape';
  const fontClass = ALBUM_FONT_CONFIG[albumFont].className;
  const isHandwriting = albumFont === 'handwriting';

  return (
    <article
      aria-label="1쪽 앨범 표지"
      className={`w-full mx-auto bg-white border border-zinc-200 rounded-lg shadow-sm transition-all duration-200 ${
        isLandscape ? 'max-w-[900px]' : 'max-w-[680px]'
      }`}
    >
      <div className="p-6 sm:p-10 md:p-12 flex flex-col">
        {/* Quiet top editorial header */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-100 text-xs text-zinc-400">
          <span>표지</span>
          <span className="tabular-nums shrink-0">
            01 / {String(totalPages).padStart(2, '0')}
          </span>
        </div>

        {/* Fine-press centered cover frame */}
        <div
          className={`mt-6 border border-zinc-200/80 rounded-md px-6 sm:px-12 py-10 sm:py-14 flex flex-col items-center justify-between text-center bg-[#FDFCFA] ${
            isLandscape
              ? 'min-h-[420px] sm:min-h-[480px]'
              : 'min-h-[480px] sm:min-h-[580px]'
          }`}
        >
          <p className="text-xs tracking-widest text-zinc-400 tabular-nums">
            사진 {photoCount}장 수록
          </p>

          {/* Main prominent Title + Subtitle */}
          <div className="w-full max-w-xl my-auto py-8 space-y-5">
            <div>
              <label htmlFor="cover-title-input" className="sr-only">
                표지 제목
              </label>
              {isCapturing ? (
                <div
                  className={`w-full ${fontClass} ${
                    isHandwriting
                      ? 'text-4xl sm:text-5xl md:text-[3.5rem] font-normal'
                      : 'text-3xl sm:text-4xl md:text-[2.75rem] font-bold'
                  } leading-tight text-zinc-900 text-center px-3 py-2 whitespace-pre-wrap break-words`}
                >
                  {cover.title.trim() || '포토 앨범'}
                </div>
              ) : (
                <textarea
                  id="cover-title-input"
                  value={cover.title}
                  onChange={(e) => onUpdateCover({ title: e.target.value })}
                  placeholder="앨범 제목을 입력하세요"
                  rows={2}
                  maxLength={80}
                  className={`w-full ${fontClass} ${
                    isHandwriting
                      ? 'text-4xl sm:text-5xl md:text-[3.5rem] font-normal'
                      : 'text-3xl sm:text-4xl md:text-[2.75rem] font-bold'
                  } leading-tight text-zinc-900 placeholder:text-zinc-300 text-center bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-600 focus:bg-white rounded-md px-3 py-2 resize-none transition-colors focus:outline-none`}
                />
              )}
            </div>

            {(!isCapturing || cover.subtitle.trim().length > 0) && (
              <div>
                <label htmlFor="cover-subtitle-input" className="sr-only">
                  표지 부제
                </label>
                {isCapturing ? (
                  <div
                    className={`w-full ${fontClass} ${
                      isHandwriting
                        ? 'text-xl sm:text-2xl'
                        : 'text-base sm:text-xl'
                    } leading-relaxed text-zinc-600 text-center px-3 py-1.5 whitespace-pre-wrap break-words`}
                  >
                    {cover.subtitle}
                  </div>
                ) : (
                  <textarea
                    id="cover-subtitle-input"
                    value={cover.subtitle}
                    onChange={(e) => onUpdateCover({ subtitle: e.target.value })}
                    placeholder="부제를 입력하세요"
                    rows={2}
                    maxLength={120}
                    className={`w-full ${fontClass} ${
                      isHandwriting
                        ? 'text-xl sm:text-2xl'
                        : 'text-base sm:text-xl'
                    } leading-relaxed text-zinc-600 placeholder:text-zinc-300 text-center bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-600 focus:bg-white rounded-md px-3 py-1.5 resize-none transition-colors focus:outline-none`}
                  />
                )}
              </div>
            )}
          </div>

          {/* Author & Date prominently displayed at cover foot */}
          {(!isCapturing || cover.author.trim().length > 0 || cover.date.trim().length > 0) && (
            <div className="w-full max-w-md pt-6 border-t border-zinc-200 space-y-3">
              {isCapturing ? (
                <div
                  className={`w-full ${fontClass} ${
                    isHandwriting
                      ? 'text-2xl font-normal'
                      : 'text-lg sm:text-xl font-semibold'
                  } text-zinc-900 text-center py-1.5`}
                >
                  {[cover.author.trim(), cover.date.trim()].filter(Boolean).join('   ·   ')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cover-author-input" className="block text-[11px] text-zinc-400 mb-1">
                      이름
                    </label>
                    <input
                      id="cover-author-input"
                      type="text"
                      value={cover.author}
                      onChange={(e) => onUpdateCover({ author: e.target.value })}
                      placeholder="이름 입력"
                      maxLength={40}
                      className={`w-full ${fontClass} ${
                        isHandwriting
                          ? 'text-2xl font-normal'
                          : 'text-lg sm:text-xl font-semibold'
                      } text-zinc-900 placeholder:text-zinc-300 text-center bg-transparent border border-zinc-200/70 hover:border-zinc-300 focus:border-blue-600 focus:bg-white rounded-md px-3 py-1.5 transition-colors focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label htmlFor="cover-date-input" className="block text-[11px] text-zinc-400 mb-1">
                      날짜
                    </label>
                    <input
                      id="cover-date-input"
                      type="text"
                      value={cover.date}
                      onChange={(e) => onUpdateCover({ date: e.target.value })}
                      placeholder="예: 2026. 11. 26"
                      maxLength={40}
                      className={`w-full ${fontClass} ${
                        isHandwriting
                          ? 'text-2xl font-normal'
                          : 'text-lg sm:text-xl font-semibold'
                      } text-zinc-900 placeholder:text-zinc-300 text-center tabular-nums bg-transparent border border-zinc-200/70 hover:border-zinc-300 focus:border-blue-600 focus:bg-white rounded-md px-3 py-1.5 transition-colors focus:outline-none`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quiet page footer */}
        <div className="mt-5 pt-3 flex items-center justify-between text-xs text-zinc-400">
          <span>첫 쪽 · 표지</span>
          <span className="tabular-nums shrink-0">— 1 —</span>
        </div>
      </div>
    </article>
  );
};
