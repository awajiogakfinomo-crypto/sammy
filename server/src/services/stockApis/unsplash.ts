import axios from 'axios';
import { StockImage, SearchResult, ApiConfig } from '../../types';

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
      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        headers: { Authorization: `Client-ID ${this.accessKey}` },
        params: { query, per_page: perPage, orientation: 'landscape' },
      });

      return response.data.results.map((photo: any) => ({
        id: `unsplash-image-${photo.id}`,
        source: 'unsplash' as const,
        url: photo.links.html,
        thumbnail: photo.urls.small,
        width: photo.width,
        height: photo.height,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        tags: photo.tags?.map((t: any) => t.title) || [],
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