export interface StockVideo {
  id: string;
  source: 'pexels' | 'pixabay' | 'unsplash';
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  duration?: number;
  photographer: string;
  photographerUrl: string;
  tags: string[];
  downloadUrl: string;
  previewUrl?: string;
}

export interface StockImage {
  id: string;
  source: 'pexels' | 'pixabay' | 'unsplash';
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  tags: string[];
  downloadUrl: string;
}

export interface Scene {
  id: string;
  text: string;
  order: number;
  keywords: string[];
  searchQueries: string[];
  videos: StockVideo[];
  images: StockImage[];
  selectedVideoIds: string[];
  selectedImageIds: string[];
}

export interface ScriptAnalysisResult {
  scenes: Scene[];
  originalScript: string;
  totalScenes: number;
}