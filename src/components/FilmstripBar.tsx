import React from 'react';
import { Plus, ArrowLeft, ArrowRight, Trash2, BookOpen, Feather } from 'lucide-react';
import type { AlbumCoverData, PhotoPage } from '../types/album';

interface FilmstripBarProps {
  cover: AlbumCoverData;
  pages: PhotoPage[];
  closingMessage: string;
  currentIndex: number;
  onSelectPage: (index: number) => void;
  onMovePhoto: (fromPhotoIndex: number, toPhotoIndex: number) => void;
  onDeletePhoto: (photoIndex: number) => void;
  onAddPhotos: () => void;
}

export const FilmstripBar: React.FC<FilmstripBarProps> = ({
  cover,
  pages,
  closingMessage,
  currentIndex,
  onSelectPage,
  onMovePhoto,
  onDeletePhoto,
  onAddPhotos,
}) => {
  const totalPages = pages.length + 2;
  const isPhotoSelected = currentIndex >= 1 && currentIndex <= pages.length;
  const photoIndex = currentIndex - 1;
  const canMoveLeft = isPhotoSelected && photoIndex > 0;
  const canMoveRight = isPhotoSelected && photoIndex < pages.length - 1;

  const currentLabel =
    currentIndex === 0
      ? '표지 (1쪽)'
      : currentIndex === totalPages - 1
      ? `마무리 (${totalPages}쪽)`
      : `사진 ${photoIndex + 1} (${currentIndex + 1}쪽)`;

  return (
    <section
      aria-label="페이지 목록 및 순서 관리"
      className="max-w-[900px] mx-auto mt-8 bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="font-medium text-zinc-800">페이지 구성</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">총 {totalPages}쪽 (표지 + 사진 {pages.length}장 + 마무리)</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums text-zinc-700 font-medium">{currentLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMovePhoto(photoIndex, photoIndex - 1)}
            disabled={!canMoveLeft}
            title="현재 사진을 앞으로 이동"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>앞으로</span>
          </button>

          <button
            type="button"
            onClick={() => onMovePhoto(photoIndex, photoIndex + 1)}
            disabled={!canMoveRight}
            title="현재 사진을 뒤로 이동"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>뒤로</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDeletePhoto(photoIndex)}
            disabled={!isPhotoSelected}
            title="현재 사진 페이지 삭제"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50/70 border border-red-200 rounded-md hover:bg-red-100/70 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>삭제</span>
          </button>
        </div>
      </div>

      {/* Horizontal thumbnail filmstrip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
        {/* Cover tile (Index 0) */}
        <button
          type="button"
          onClick={() => onSelectPage(0)}
          aria-label="1쪽 표지 보기"
          aria-current={currentIndex === 0 ? 'page' : undefined}
          className={`relative shrink-0 w-20 h-20 rounded-lg border bg-[#FDFCFA] p-2 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            currentIndex === 0
              ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1'
              : 'border-zinc-200 hover:border-zinc-400 opacity-85 hover:opacity-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-zinc-700 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-medium text-zinc-800 truncate w-full">
            {cover.title.trim() || '표지'}
          </span>
          <span
            className={`absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${
              currentIndex === 0
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            표지
          </span>
        </button>

        {/* Photo page tiles (Indices 1..N) */}
        {pages.map((page, idx) => {
          const pageNumberIndex = idx + 1;
          const isActive = pageNumberIndex === currentIndex;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onSelectPage(pageNumberIndex)}
              aria-label={`${pageNumberIndex + 1}쪽${page.title ? ` (${page.title})` : ''} 보기`}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1'
                  : 'border-zinc-200 hover:border-zinc-400 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={page.src}
                alt={page.title || `${idx + 1}번 썸네일`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute bottom-1 right-1 px-1.5 py-0.5 text-[11px] font-medium tabular-nums rounded ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900/75 text-white'
                }`}
              >
                {pageNumberIndex + 1}
              </span>
            </button>
          );
        })}

        {/* Closing tile (Index N + 1) */}
        <button
          type="button"
          onClick={() => onSelectPage(totalPages - 1)}
          aria-label={`${totalPages}쪽 마무리 페이지 보기`}
          aria-current={currentIndex === totalPages - 1 ? 'page' : undefined}
          className={`relative shrink-0 w-20 h-20 rounded-lg border bg-[#FDFCFA] p-2 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            currentIndex === totalPages - 1
              ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1'
              : 'border-zinc-200 hover:border-zinc-400 opacity-85 hover:opacity-100'
          }`}
        >
          <Feather className="w-4 h-4 text-zinc-700 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-medium text-zinc-800 truncate w-full">
            {closingMessage.trim() ? '마무리 글' : '마무리'}
          </span>
          <span
            className={`absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium tabular-nums rounded ${
              currentIndex === totalPages - 1
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            끝
          </span>
        </button>

        {/* Add photos tile */}
        <button
          type="button"
          onClick={onAddPhotos}
          className="shrink-0 w-20 h-20 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-500 bg-zinc-50 hover:bg-zinc-100 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px] font-medium whitespace-nowrap">사진 추가</span>
        </button>
      </div>
    </section>
  );
};
