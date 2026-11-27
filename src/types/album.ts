export interface PhotoPage {
  id: string;
  src: string;
  fileName: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
  isObjectUrl?: boolean;
}

export type PdfOrientation = 'portrait' | 'landscape';

export type AlbumFont = 'gothic' | 'myeongjo' | 'handwriting';

export interface AlbumFontSpec {
  id: AlbumFont;
  label: string;
  className: string;
  canvasFamily: string;
  preloadFamily: string;
  titleWeight: string;
  bodyWeight: string;
  scale: number;
}

export const ALBUM_FONT_CONFIG: Record<AlbumFont, AlbumFontSpec> = {
  gothic: {
    id: 'gothic',
    label: '고딕',
    className: 'album-font-gothic',
    canvasFamily: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif',
    preloadFamily: 'Noto Sans KR',
    titleWeight: '700',
    bodyWeight: '400',
    scale: 1,
  },
  myeongjo: {
    id: 'myeongjo',
    label: '명조',
    className: 'album-font-myeongjo',
    canvasFamily: '"Playfair Display", "Noto Serif KR", Georgia, serif',
    preloadFamily: 'Noto Serif KR',
    titleWeight: '700',
    bodyWeight: '400',
    scale: 1,
  },
  handwriting: {
    id: 'handwriting',
    label: '손글씨',
    className: 'album-font-handwriting',
    canvasFamily: '"Nanum Pen Script", "Plus Jakarta Sans", cursive',
    preloadFamily: 'Nanum Pen Script',
    titleWeight: '400',
    bodyWeight: '400',
    scale: 1.24,
  },
};

export interface AlbumCoverData {
  title: string;
  subtitle: string;
  author: string;
  date: string;
}

export const SAMPLE_COVER: AlbumCoverData = {
  title: '가을 산책의 기록',
  subtitle: '천천히 걸으며 담아낸 빛과 계절의 조각들',
  author: '김서연',
  date: '2026. 11. 26',
};

export const SAMPLE_CLOSING_MESSAGE =
  '잠시 멈춰 서서 바라본 풍경들이 오래도록 따뜻한 기억으로 남기를 바랍니다. 함께 걸어준 모든 시간에 고마운 마음을 전합니다.';

export const SAMPLE_PAGES: Omit<PhotoPage, 'id'>[] = [
  {
    src: '/src/assets/images/sample_morning_cafe_1795738772093.jpg',
    fileName: 'morning_cafe.jpg',
    title: '창가의 첫 번째 커피',
    description:
      '아침 햇살이 나무 창살을 넘어 노트 위로 길게 내려앉던 시간. 따뜻한 도자기 잔에서 피어오르는 향기와 함께 하루의 첫 문장을 적었다.',
    isObjectUrl: false,
  },
  {
    src: '/src/assets/images/sample_coastal_walk_1795738772309.jpg',
    fileName: 'coastal_walk.jpg',
    title: '노을을 따라 걷는 해안 산책로',
    description:
      '수평선 너머로 천천히 번지는 주홍빛과 잔잔한 파도 소리. 바람이 잠잠해진 오후 늦게, 바다 끝까지 이어진 나무 데크를 홀로 걸었다.',
    isObjectUrl: false,
  },
  {
    src: '/src/assets/images/sample_autumn_alley_1795738772919.jpg',
    fileName: 'autumn_alley.jpg',
    title: '은행잎이 내려앉은 돌담 골목',
    description:
      '발걸음마다 바스락거리는 노란 잎들과 오래된 돌벽 사이의 긴 그림자. 계절이 깊어질수록 골목의 시간도 느리게 흐르는 듯했다.',
    isObjectUrl: false,
  },
];
