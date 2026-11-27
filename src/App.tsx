import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, LayoutGrid, CheckCircle2, AlertCircle, ImageDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { AlbumCoverSheet } from './components/AlbumCoverSheet';
import { AlbumPageSheet } from './components/AlbumPageSheet';
import { AlbumClosingSheet } from './components/AlbumClosingSheet';
import { FilmstripBar } from './components/FilmstripBar';
import { OverviewModal } from './components/OverviewModal';
import { exportAlbumToPdf, exportCurrentPageToPng } from './utils/pdfExport';
import { capturePreviewElementToPng } from './utils/pngExport';
import {
  ALBUM_FONT_CONFIG,
  SAMPLE_CLOSING_MESSAGE,
  SAMPLE_COVER,
  SAMPLE_PAGES,
  type AlbumCoverData,
  type AlbumFont,
  type PdfOrientation,
  type PhotoPage,
} from './types/album';

const createPageId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `page_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getTodayFormatted = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${d}`;
};

const createInitialCover = (): AlbumCoverData => ({
  title: '나의 포토 앨범',
  subtitle: '',
  author: '',
  date: getTodayFormatted(),
});

const FONT_OPTIONS: AlbumFont[] = ['gothic', 'myeongjo', 'handwriting'];

export default function App() {
  const [cover, setCover] = useState<AlbumCoverData>(createInitialCover);
  const [pages, setPages] = useState<PhotoPage[]>([]);
  const [closingMessage, setClosingMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [orientation, setOrientation] = useState<PdfOrientation>('portrait');
  const [albumFont, setAlbumFont] = useState<AlbumFont>('myeongjo');
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isCapturingPng, setIsCapturingPng] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDraggingWorkspace, setIsDraggingWorkspace] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewSheetRef = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<PhotoPage[]>(pages);
  pagesRef.current = pages;

  const shouldReduceMotion = useReducedMotion();

  const totalPages = pages.length > 0 ? pages.length + 2 : 0;

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      for (const p of pagesRef.current) {
        if (p.isObjectUrl) {
          URL.revokeObjectURL(p.src);
        }
      }
    };
  }, []);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpdateCover = useCallback((patch: Partial<AlbumCoverData>) => {
    setCover((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleFilesSelected = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );

    if (incoming.length === 0) {
      setToast({
        type: 'error',
        message: '이미지 파일(JPG, PNG, WEBP 등)만 앨범에 올릴 수 있습니다.',
      });
      return;
    }

    const newPages: PhotoPage[] = incoming.map((file) => {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      return {
        id: createPageId(),
        src: URL.createObjectURL(file),
        fileName: file.name,
        title: baseName,
        description: '',
        isObjectUrl: true,
      };
    });

    setPages((prev) => {
      const next = [...prev, ...newPages];
      setDirection(1);
      setCurrentIndex(prev.length === 0 ? 0 : prev.length + 1);
      return next;
    });

    setToast({
      type: 'success',
      message: `${newPages.length}장의 사진이 앨범에 추가되었습니다.`,
    });
  }, []);

  const handleLoadSample = useCallback(() => {
    setPages((prev) => {
      for (const p of prev) {
        if (p.isObjectUrl) URL.revokeObjectURL(p.src);
      }
      return SAMPLE_PAGES.map((sample) => ({
        ...sample,
        id: createPageId(),
      }));
    });
    setCover({ ...SAMPLE_COVER });
    setClosingMessage(SAMPLE_CLOSING_MESSAGE);
    setCurrentIndex(0);
    setDirection(1);
    setToast({
      type: 'success',
      message: '샘플 사진 3장으로 앨범을 구성했습니다.',
    });
  }, []);

  const handleResetAlbum = useCallback(() => {
    setPages((prev) => {
      for (const p of prev) {
        if (p.isObjectUrl) URL.revokeObjectURL(p.src);
      }
      return [];
    });
    setCurrentIndex(0);
    setCover(createInitialCover());
    setClosingMessage('');
    setIsOverviewOpen(false);
  }, []);

  const handleUpdatePage = useCallback(
    (id: string, patch: Partial<Pick<PhotoPage, 'title' | 'description'>>) => {
      setPages((prev) =>
        prev.map((page) => (page.id === id ? { ...page, ...patch } : page))
      );
    },
    []
  );

  const handleSelectPage = useCallback(
    (nextIdx: number) => {
      if (nextIdx < 0 || nextIdx >= totalPages || nextIdx === currentIndex) return;
      setDirection(nextIdx > currentIndex ? 1 : -1);
      setCurrentIndex(nextIdx);
    },
    [currentIndex, totalPages]
  );

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalPages - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, totalPages]);

  const handleMovePhoto = useCallback(
    (fromPhotoIndex: number, toPhotoIndex: number) => {
      if (
        toPhotoIndex < 0 ||
        toPhotoIndex >= pages.length ||
        fromPhotoIndex === toPhotoIndex
      ) {
        return;
      }
      setPages((prev) => {
        const copy = [...prev];
        const [moved] = copy.splice(fromPhotoIndex, 1);
        copy.splice(toPhotoIndex, 0, moved);
        return copy;
      });
      const fromPageIndex = fromPhotoIndex + 1;
      const toPageIndex = toPhotoIndex + 1;
      if (currentIndex === fromPageIndex) {
        setCurrentIndex(toPageIndex);
      } else if (currentIndex === toPageIndex) {
        setCurrentIndex(fromPageIndex);
      }
    },
    [currentIndex, pages.length]
  );

  const handleDeletePhoto = useCallback(
    (photoIndexToDelete: number) => {
      setPages((prev) => {
        const target = prev[photoIndexToDelete];
        if (target?.isObjectUrl) {
          URL.revokeObjectURL(target.src);
        }
        const next = prev.filter((_, idx) => idx !== photoIndexToDelete);
        const deletedAlbumIndex = photoIndexToDelete + 1;
        setCurrentIndex((curr) => {
          if (next.length === 0) return 0;
          const nextTotal = next.length + 2;
          if (curr >= nextTotal) return nextTotal - 1;
          if (deletedAlbumIndex < curr) return curr - 1;
          if (deletedAlbumIndex === curr && curr > next.length) return next.length;
          return curr;
        });
        return next;
      });
    },
    []
  );

  const handleExportPdf = useCallback(async () => {
    if (pages.length === 0 || isExporting) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: totalPages });
    try {
      await exportAlbumToPdf({
        cover,
        pages,
        closingMessage,
        orientation,
        albumFont,
        onProgress: (current, total) => setExportProgress({ current, total }),
      });
      setToast({
        type: 'success',
        message: 'PDF 파일이 저장되었습니다.',
      });
    } catch (err) {
      setToast({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'PDF 생성 중 오류가 발생했습니다.',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [albumFont, closingMessage, cover, isExporting, orientation, pages, totalPages]);

  const handleExportPng = useCallback(async () => {
    if (pages.length === 0 || isExportingPng) return;
    setIsExportingPng(true);
    setIsCapturingPng(true);
    try {
      // Wait two animation frames so inputs swap cleanly to static text nodes matching exact preview styling
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const sheetEl =
        (previewSheetRef.current?.firstElementChild as HTMLElement | null) ??
        previewSheetRef.current;

      if (sheetEl) {
        try {
          await capturePreviewElementToPng({
            element: sheetEl,
            albumTitle: cover.title,
            pageIndex: currentIndex,
            albumFont,
          });
        } catch {
          await exportCurrentPageToPng({
            pageIndex: currentIndex,
            cover,
            pages,
            closingMessage,
            orientation,
            albumFont,
          });
        }
      } else {
        await exportCurrentPageToPng({
          pageIndex: currentIndex,
          cover,
          pages,
          closingMessage,
          orientation,
          albumFont,
        });
      }

      setToast({
        type: 'success',
        message: `${currentIndex + 1}쪽 PNG 이미지가 저장되었습니다.`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'PNG 저장 중 오류가 발생했습니다.',
      });
    } finally {
      setIsCapturingPng(false);
      setIsExportingPng(false);
    }
  }, [albumFont, closingMessage, cover, currentIndex, isExportingPng, orientation, pages]);

  // Keyboard arrow navigation when not typing in an input or textarea
  useEffect(() => {
    if (pages.length === 0 || isOverviewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, isOverviewOpen, pages.length]);

  const isCoverPage = currentIndex === 0;
  const isClosingPage = pages.length > 0 && currentIndex === totalPages - 1;
  const activePhoto =
    currentIndex >= 1 && currentIndex <= pages.length
      ? pages[currentIndex - 1]
      : null;

  const activeMotionKey = isCoverPage
    ? 'cover-page'
    : isClosingPage
    ? 'closing-page'
    : activePhoto?.id ?? 'empty';

  const currentPageRoleLabel = isCoverPage
    ? '표지'
    : isClosingPage
    ? '마무리'
    : '한 쪽에 한 장씩 보기';

  const activeFontClass = ALBUM_FONT_CONFIG[albumFont].className;

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-[#F7F6F2] text-zinc-900"
      onDragOver={(e) => {
        if (pages.length === 0) return;
        e.preventDefault();
        if (!isDraggingWorkspace) setIsDraggingWorkspace(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setIsDraggingWorkspace(false);
        }
      }}
      onDrop={(e) => {
        if (pages.length === 0) return;
        e.preventDefault();
        setIsDraggingWorkspace(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFilesSelected(e.dataTransfer.files);
        }
      }}
    >
      {/* Hidden multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
          }
          e.target.value = '';
        }}
      />

      <Header
        hasPages={pages.length > 0}
        isExporting={isExporting}
        exportProgress={exportProgress}
        onAddPhotos={openFilePicker}
        onOpenOverview={() => setIsOverviewOpen(true)}
        onLoadSample={handleLoadSample}
        onResetAlbum={handleResetAlbum}
        onExportPdf={handleExportPdf}
      />

      <main className="flex-1 w-full pb-16">
        {pages.length === 0 ? (
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            onOpenFilePicker={openFilePicker}
            onLoadSample={handleLoadSample}
          />
        ) : (
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
            {/* Workspace Toolbar */}
            <div className="max-w-[900px] mx-auto mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
              <div className="flex-1 min-w-0">
                <label htmlFor="album-title-input" className="sr-only">
                  앨범 제목
                </label>
                <input
                  id="album-title-input"
                  type="text"
                  value={cover.title}
                  onChange={(e) => handleUpdateCover({ title: e.target.value })}
                  placeholder="앨범 제목을 입력하세요"
                  maxLength={80}
                  className={`w-full max-w-md ${activeFontClass} text-lg sm:text-xl font-bold text-zinc-900 bg-transparent border border-transparent hover:border-zinc-300 focus:border-blue-600 focus:bg-white rounded-md px-2.5 py-1 -mx-2.5 transition-colors focus:outline-none`}
                />
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span className="tabular-nums">총 {totalPages}쪽 (사진 {pages.length}장)</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">현재 {currentIndex + 1}쪽</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentPageRoleLabel}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Mobile quick actions */}
                <div className="flex md:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer whitespace-nowrap"
                  >
                    <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>사진 추가</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOverviewOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer whitespace-nowrap"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>전체 보기</span>
                  </button>
                </div>

                {/* 3 Font Selection Buttons: 고딕 / 명조 / 손글씨 */}
                <div
                  role="group"
                  aria-label="글꼴 선택"
                  className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
                >
                  {FONT_OPTIONS.map((fontKey) => {
                    const spec = ALBUM_FONT_CONFIG[fontKey];
                    const isActive = albumFont === fontKey;
                    return (
                      <button
                        key={fontKey}
                        type="button"
                        onClick={() => setAlbumFont(fontKey)}
                        aria-pressed={isActive}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          spec.className
                        } ${
                          isActive
                            ? 'bg-white text-zinc-900 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {spec.label}
                      </button>
                    );
                  })}
                </div>

                {/* PDF Page Orientation Segmented Control */}
                <div
                  role="group"
                  aria-label="용지 방향"
                  className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      orientation === 'portrait'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    세로 A4
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      orientation === 'landscape'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    가로 A4
                  </button>
                </div>

                {/* Export current page as PNG */}
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={isExportingPng}
                  title="현재 보고 있는 쪽을 미리보기 그대로 PNG 그림 파일로 저장"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <ImageDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{isExportingPng ? 'PNG 저장 중...' : '현재 쪽 PNG 저장'}</span>
                </button>
              </div>
            </div>

            {/* Single-Page Album Viewer + Previous / Next Buttons */}
            <div className="relative flex items-center justify-center gap-4 lg:gap-8">
              {/* Desktop Previous Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="이전 페이지"
                className="hidden lg:inline-flex flex-col items-center justify-center gap-1.5 w-20 py-4 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-400 hover:shadow-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                <span className="text-xs font-medium whitespace-nowrap">이전</span>
              </button>

              {/* Active Page Sheet with crisp 160ms transition */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    ref={previewSheetRef}
                    key={activeMotionKey}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: direction * 18 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: direction * -18 }
                    }
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {isCoverPage ? (
                      <AlbumCoverSheet
                        cover={cover}
                        totalPages={totalPages}
                        photoCount={pages.length}
                        orientation={orientation}
                        albumFont={albumFont}
                        isCapturing={isCapturingPng}
                        onUpdateCover={handleUpdateCover}
                      />
                    ) : isClosingPage ? (
                      <AlbumClosingSheet
                        closingMessage={closingMessage}
                        cover={cover}
                        pageIndex={currentIndex}
                        totalPages={totalPages}
                        orientation={orientation}
                        albumFont={albumFont}
                        isCapturing={isCapturingPng}
                        onUpdateClosingMessage={setClosingMessage}
                      />
                    ) : (
                      activePhoto && (
                        <AlbumPageSheet
                          page={activePhoto}
                          pageIndex={currentIndex}
                          totalPages={totalPages}
                          albumTitle={cover.title}
                          orientation={orientation}
                          albumFont={albumFont}
                          isCapturing={isCapturingPng}
                          onUpdatePage={handleUpdatePage}
                        />
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop Next Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= totalPages - 1}
                aria-label="다음 페이지"
                className="hidden lg:inline-flex flex-col items-center justify-center gap-1.5 w-20 py-4 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-400 hover:shadow-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
                <span className="text-xs font-medium whitespace-nowrap">다음</span>
              </button>
            </div>

            {/* Bottom Previous / Next Bar */}
            <div className="max-w-[680px] mx-auto mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>이전</span>
              </button>

              <div className="text-sm font-medium text-zinc-600 tabular-nums">
                {currentIndex + 1} / {totalPages}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= totalPages - 1}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span>다음</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Filmstrip / Thumbnail Navigation */}
            <FilmstripBar
              cover={cover}
              pages={pages}
              closingMessage={closingMessage}
              currentIndex={currentIndex}
              onSelectPage={handleSelectPage}
              onMovePhoto={handleMovePhoto}
              onDeletePhoto={handleDeletePhoto}
              onAddPhotos={openFilePicker}
            />
          </div>
        )}
      </main>

      {/* Drag-and-drop overlay when dragging additional photos onto workspace */}
      {isDraggingWorkspace && pages.length > 0 && (
        <div className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white border-2 border-dashed border-blue-600 rounded-xl px-10 py-8 text-center shadow-lg space-y-2">
            <ImagePlus className="w-8 h-8 text-blue-600 mx-auto" aria-hidden="true" />
            <p className="font-editorial text-lg font-bold text-zinc-900">
              여기에 사진을 놓아 앨범에 추가하세요
            </p>
            <p className="text-sm text-zinc-500">
              올린 사진들은 새 페이지로 순서대로 추가됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Contact-Sheet Overview Modal */}
      <OverviewModal
        isOpen={isOverviewOpen}
        cover={cover}
        pages={pages}
        closingMessage={closingMessage}
        currentIndex={currentIndex}
        albumFont={albumFont}
        onClose={() => setIsOverviewOpen(false)}
        onSelectPage={handleSelectPage}
        onMovePhoto={handleMovePhoto}
        onDeletePhoto={handleDeletePhoto}
        onAddPhotos={openFilePicker}
      />

      {/* Non-blocking status toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-zinc-900 text-white border-zinc-800'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
