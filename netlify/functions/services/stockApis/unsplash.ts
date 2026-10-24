// Unsplash API Service for Netlify Functions

import axios from 'axios';
import type { StockImage, SearchResult, ApiConfig } from '../../utils/types';

// Unsplash API response types
interface UnsplashPhoto {
  id: string;
  links: { html: string };
  urls: { small: string; raw: string };
  width: number;
  height: number;
  user: { name: string; links: { html: string } };
  tags?: Array<{ title: string }>;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

export class UnsplashService {
  private accessKey: string;
  private baseUrl: string;

  constructor(config: ApiConfig['unsplash']) {
    this.accessKey = config.accessKey;
    this.baseUrl = config.baseUrl;
  }

  async searchImages(query: string, perPage = 10): Promise<StockImage[]> {
    if (!this.accessKey) return [];

    try {
      const response = await axios.get<UnsplashSearchResponse>(`${this.baseUrl}/search/photos`, {
        headers: { Authorization: `Client-ID ${this.accessKey}` },
        params: { query, per_page: perPage, orientation: 'landscape' },
      });

      return response.data.results.map((photo: UnsplashPhoto) => ({
        id: `unsplash-image-${photo.id}`,
        source: 'unsplash' as const,
        url: photo.links.html,
        thumbnail: photo.urls.small,
        width: photo.width,
        height: photo.height,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        tags: photo.tags?.map((t) => t.title) || [],
        downloadUrl: photo.urls.raw + '&force=true',
      }));
    } catch (error) {
      console.error('Unsplash image search error:', error);
      return [];
    }
  }

  async search(query: string): Promise<SearchResult> {
    const images = await this.searchImages(query);
    return { videos: [], images, query, source: 'unsplash' };
  }
}