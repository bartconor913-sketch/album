import React, { useState } from 'react';
import { ImagePlus, BookOpen } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onOpenFilePicker: () => void;
  onLoadSample: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  onOpenFilePicker,
  onLoadSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <section className="max-w-[1040px] mx-auto px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left column: Editorial intro & value proposition */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-wide text-zinc-500">
              한 쪽에 한 장씩 · 포토북 스튜디오
            </p>
            <h1 className="font-editorial text-3xl md:text-4xl font-bold text-zinc-900 leading-tight [text-wrap:balance]">
              사진 여러 장을 올려 한 장씩 넘겨보는 앨범을 만들어보세요
            </h1>
            <p className="text-[15px] leading-relaxed text-zinc-600">
              올린 사진은 한 페이지에 한 장씩 깔끔하게 배치됩니다. 각 사진마다 제목과 설명을 직접 작성하고, 완성된 앨범은 그대로 PDF 파일로 저장할 수 있습니다.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenFilePicker}
              className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <ImagePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>사진 여러 장 올리기</span>
            </button>

            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>샘플 앨범 미리보기</span>
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex items-center gap-4 text-xs text-zinc-500">
            <span>JPG · PNG · WEBP 지원</span>
            <span aria-hidden="true">·</span>
            <span>이전 · 다음 넘기기</span>
            <span aria-hidden="true">·</span>
            <span>A4 고화질 PDF 저장</span>
          </div>
        </div>

        {/* Right column: Tactile Drag-and-Drop Sheet */}
        <div className="lg:col-span-7 flex">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={onOpenFilePicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenFilePicker();
              }
            }}
            aria-label="사진 파일 여러 장을 끌어다 놓거나 클릭하여 선택하세요"
            className={`w-full min-h-[380px] lg:h-full bg-white rounded-xl border transition-all duration-150 flex flex-col items-center justify-center p-10 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isDragging
                ? 'border-blue-600 bg-blue-50/40 shadow-md'
                : 'border-zinc-200 shadow-sm hover:border-zinc-400'
            }`}
          >
            <div className="w-full h-full border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center p-8 space-y-5">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isDragging
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <ImagePlus className="w-6 h-6" aria-hidden="true" />
              </div>

              <div className="space-y-2 max-w-sm">
                <p className="font-editorial text-xl font-semibold text-zinc-900">
                  {isDragging
                    ? '여기에 놓으면 앨범에 추가됩니다'
                    : '이곳에 사진 여러 장을 끌어다 놓으세요'}
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  또는 영역을 클릭하여 기기에 있는 사진들을 한 번에 선택할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
