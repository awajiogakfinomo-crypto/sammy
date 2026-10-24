// Shared types for Netlify Functions

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

export interface SearchResult {
  videos: StockVideo[];
  images: StockImage[];
  query: string;
  source: string;
}

export interface ApiConfig {
  pexels: { apiKey: string; baseUrl: string };
  pixabay: { apiKey: string; baseUrl: string };
  unsplash: { accessKey: string; baseUrl: string };
}

export interface DownloadRequest {
  sceneId: string;
  videoIds: string[];
  imageIds: string[];
}

export interface DownloadResult {
  downloadUrl: string;
  filename: string;
  size: number;
}

// Netlify Function event types
export interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string> | null;
  body: string | null;
  isBase64Encoded: boolean;
  path: string;
}

export interface NetlifyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}