import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  hasPages: boolean;
  isExporting: boolean;
  exportProgress: { current: number; total: number } | null;
  onAddPhotos: () => void;
  onOpenOverview: () => void;
  onLoadSample: () => void;
  onResetAlbum: () => void;
  onExportPdf: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasPages,
  isExporting,
  exportProgress,
  onAddPhotos,
  onOpenOverview,
  onLoadSample,
  onResetAlbum,
  onExportPdf,
}) => {
  return (
    <header className="w-full border-b border-zinc-200/80 bg-[#F7F6F2]/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-editorial text-lg font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          모노그래프 앨범
        </a>

        {/* Zone 2: 4 clean single-line text links */}
        <nav
          aria-label="앨범 작업 메뉴"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
        >
          <button
            type="button"
            onClick={onAddPhotos}
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            사진 추가
          </button>
          <button
            type="button"
            onClick={onOpenOverview}
            disabled={!hasPages}
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            전체 보기
          </button>
          <button
            type="button"
            onClick={onLoadSample}
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            샘플 불러오기
          </button>
          <button
            type="button"
            onClick={onResetAlbum}
            disabled={!hasPages}
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            새 앨범
          </button>
        </nav>

        {/* Zone 3: 1 primary action CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportPdf}
            disabled={!hasPages || isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {isExporting && exportProgress
                ? `PDF 생성 중 (${exportProgress.current}/${exportProgress.total})`
                : 'PDF로 저장'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
