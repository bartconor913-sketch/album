import React, { useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Trash2, Plus } from 'lucide-react';
import { ALBUM_FONT_CONFIG, type AlbumCoverData, type AlbumFont, type PhotoPage } from '../types/album';

interface OverviewModalProps {
  isOpen: boolean;
  cover: AlbumCoverData;
  pages: PhotoPage[];
  closingMessage: string;
  currentIndex: number;
  albumFont: AlbumFont;
  onClose: () => void;
  onSelectPage: (index: number) => void;
  onMovePhoto: (fromPhotoIndex: number, toPhotoIndex: number) => void;
  onDeletePhoto: (photoIndex: number) => void;
  onAddPhotos: () => void;
}

export const OverviewModal: React.FC<OverviewModalProps> = ({
  isOpen,
  cover,
  pages,
  closingMessage,
  currentIndex,
  albumFont,
  onClose,
  onSelectPage,
  onMovePhoto,
  onDeletePhoto,
  onAddPhotos,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalPages = pages.length + 2;
  const fontClass = ALBUM_FONT_CONFIG[albumFont].className;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="전체 앨범 페이지 보기"
      className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[88vh] bg-[#F7F6F2] border border-zinc-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-editorial text-lg font-bold text-zinc-900">
              전체 페이지 보기
            </h2>
            <span className="text-xs text-zinc-500 tabular-nums">
              · 총 {totalPages}쪽 (표지 + 사진 {pages.length}장 + 마무리)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAddPhotos}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>사진 추가</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="전체 보기 닫기"
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Contact Sheet Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cover Card (Index 0) */}
          <div
            className={`bg-white rounded-lg border p-4 flex flex-col justify-between gap-3 transition-shadow ${
              currentIndex === 0
                ? 'border-blue-600 ring-1 ring-blue-600'
                : 'border-zinc-200 hover:shadow-sm'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectPage(0);
                onClose();
              }}
              className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded flex-1 flex flex-col"
            >
              <div className="w-full h-44 bg-[#FDFCFA] border border-zinc-200/80 rounded flex flex-col items-center justify-center p-4 text-center mb-3">
                <p className={`${fontClass} text-base font-bold text-zinc-900 line-clamp-2`}>
                  {cover.title.trim() || '앨범 제목'}
                </p>
                {cover.subtitle.trim() && (
                  <p className={`${fontClass} text-xs text-zinc-500 line-clamp-2 mt-1.5`}>
                    {cover.subtitle}
                  </p>
                )}
                {(cover.author.trim() || cover.date.trim()) && (
                  <p className={`${fontClass} text-[11px] text-zinc-400 mt-3 pt-2 border-t border-zinc-200`}>
                    {[cover.author.trim(), cover.date.trim()].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 mb-1">
                <span className="tabular-nums font-medium text-zinc-600">01쪽 · 표지</span>
                <span>첫 쪽</span>
              </div>
              <p className={`${fontClass} text-sm font-semibold text-zinc-900 truncate`}>
                {cover.title.trim() || '제목 없음'}
              </p>
              <p className={`${fontClass} text-xs text-zinc-500 truncate mt-1`}>
                {cover.subtitle.trim() || '부제, 이름, 날짜를 표지에 입력할 수 있습니다.'}
              </p>
            </button>
          </div>

          {/* Photo Cards (Indices 1..N) */}
          {pages.map((page, idx) => {
            const albumPageIndex = idx + 1;
            const isActive = albumPageIndex === currentIndex;
            return (
              <div
                key={page.id}
                className={`bg-white rounded-lg border p-4 flex flex-col justify-between gap-3 transition-shadow ${
                  isActive
                    ? 'border-blue-600 ring-1 ring-blue-600'
                    : 'border-zinc-200 hover:shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectPage(albumPageIndex);
                    onClose();
                  }}
                  className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                >
                  <div className="w-full h-44 bg-zinc-50 border border-zinc-100 rounded flex items-center justify-center overflow-hidden p-2 mb-3">
                    <img
                      src={page.src}
                      alt={page.title || `${idx + 1}번 사진`}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform duration-150"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 mb-1">
                    <span className="tabular-nums font-medium text-zinc-600">
                      {String(albumPageIndex + 1).padStart(2, '0')}쪽
                    </span>
                    <span className="truncate">{page.fileName}</span>
                  </div>
                  <p className={`${fontClass} text-sm font-semibold text-zinc-900 truncate`}>
                    {page.title.trim() || '제목 없음'}
                  </p>
                  <p className={`${fontClass} text-xs text-zinc-500 line-clamp-2 mt-1 min-h-[2rem]`}>
                    {page.description.trim() || '설명이 아직 작성되지 않았습니다.'}
                  </p>
                </button>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label={`${albumPageIndex + 1}쪽 앞으로 이동`}
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, idx + 1)}
                      disabled={idx === pages.length - 1}
                      aria-label={`${albumPageIndex + 1}쪽 뒤로 이동`}
                      className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePhoto(idx)}
                    aria-label={`${albumPageIndex + 1}쪽 삭제`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Closing Card (Index N + 1) */}
          <div
            className={`bg-white rounded-lg border p-4 flex flex-col justify-between gap-3 transition-shadow ${
              currentIndex === totalPages - 1
                ? 'border-blue-600 ring-1 ring-blue-600'
                : 'border-zinc-200 hover:shadow-sm'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectPage(totalPages - 1);
                onClose();
              }}
              className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded flex-1 flex flex-col"
            >
              <div className="w-full h-44 bg-[#FDFCFA] border border-zinc-200/80 rounded flex flex-col items-center justify-center p-5 text-center mb-3">
                <span className="text-[11px] text-zinc-400 mb-2">마무리 문구</span>
                <p className={`${fontClass} text-sm text-zinc-700 line-clamp-4 leading-relaxed`}>
                  {closingMessage.trim() || '마지막 쪽에 마무리 문구를 적어보세요.'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 mb-1">
                <span className="tabular-nums font-medium text-zinc-600">
                  {String(totalPages).padStart(2, '0')}쪽 · 마무리
                </span>
                <span>마지막 쪽</span>
              </div>
              <p className={`${fontClass} text-sm font-semibold text-zinc-900 truncate`}>
                마무리 페이지
              </p>
              <p className={`${fontClass} text-xs text-zinc-500 line-clamp-2 mt-1 min-h-[2rem]`}>
                {closingMessage.trim() || '작성된 마무리 문구가 없습니다.'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
