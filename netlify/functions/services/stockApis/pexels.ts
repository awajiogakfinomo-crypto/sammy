// Pexels API Service for Netlify Functions

import axios from 'axios';
import type { StockVideo, StockImage, SearchResult, ApiConfig } from '../../../utils/types';

export class PexelsService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ApiConfig['pexels']) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async searchVideos(query: string, perPage = 10): Promise<StockVideo[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/videos/search`, {
        headers: { Authorization: this.apiKey },
        params: { query, per_page: perPage, orientation: 'landscape' },
      });

      return response.data.videos.map((video: any) => ({
        id: `pexels-video-${video.id}`,
        source: 'pexels' as const,
        url: video.url,
        thumbnail: video.image,
        width: video.width,
        height: video.height,
        duration: video.duration,
        photographer: video.user.name,
        photographerUrl: video.user.url,
        tags: video.tags.map((t: any) => t.name),
        downloadUrl: video.video_files
          .sort((a: any, b: any) => b.width - a.width)[0]?.link || '',
        previewUrl: video.video_files
          .find((f: any) => f.quality === 'hd')?.link ||
          video.video_files[0]?.link,
      }));
    } catch (error) {
      console.error('Pexels video search error:', error);
      return [];
    }
  }

  async searchImages(query: string, perPage = 10): Promise<StockImage[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: { Authorization: this.apiKey },
        params: { query, per_page: perPage, orientation: 'landscape' },
      });

      return response.data.photos.map((photo: any) => ({
        id: `pexels-image-${photo.id}`,
        source: 'pexels' as const,
        url: photo.url,
        thumbnail: photo.src.medium,
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        tags: photo.tags?.map((t: any) => t.name) || [],
        downloadUrl: photo.src.original,
      }));
    } catch (error) {
      console.error('Pexels image search error:', error);
      return [];
    }
  }

  async search(query: string): Promise<SearchResult> {
    const [videos, images] = await Promise.all([
      this.searchVideos(query),
      this.searchImages(query),
    ]);
    return { videos, images, query, source: 'pexels' };
  }
}