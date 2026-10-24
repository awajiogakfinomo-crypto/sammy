// Pixabay API Service for Netlify Functions

import axios from 'axios';
import type { StockVideo, StockImage, SearchResult, ApiConfig } from '../../utils/types';

// Pixabay API response types
interface PixabayVideoFile {
  width: number;
  height: number;
  url: string;
}

interface PixabayVideoFiles {
  large?: PixabayVideoFile;
  medium?: PixabayVideoFile;
  small?: PixabayVideoFile;
  tiny?: PixabayVideoFile;
}

interface PixabayVideo {
  id: number;
  pageURL: string;
  picture_id?: string;
  user: string;
  userImageURL: string;
  tags: string;
  duration: number;
  videos: PixabayVideoFiles;
}

interface PixabayPhoto {
  id: number;
  pageURL: string;
  webformatURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  userImageURL: string;
  tags: string;
  largeImageURL: string;
}

interface PixabayVideoResponse {
  hits: PixabayVideo[];
}

interface PixabayPhotoResponse {
  hits: PixabayPhoto[];
}

export class PixabayService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ApiConfig['pixabay']) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async searchVideos(query: string, perPage = 10): Promise<StockVideo[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get<PixabayVideoResponse>(`${this.baseUrl}/videos/`, {
        params: {
          key: this.apiKey,
          q: query,
          per_page: perPage,
          video_type: 'film',
          safesearch: 'true',
        },
      });

      return response.data.hits.map((video: PixabayVideo) => {
        const videoFiles = video.videos;
        const bestQuality = videoFiles.large || videoFiles.medium || videoFiles.small || videoFiles.tiny;

        return {
          id: `pixabay-video-${video.id}`,
          source: 'pixabay' as const,
          url: video.pageURL,
          thumbnail: video.picture_id ? `https://i.vimeocdn.com/video/${video.picture_id}_640.jpg` : video.userImageURL,
          width: bestQuality?.width || 1920,
          height: bestQuality?.height || 1080,
          duration: video.duration,
          photographer: video.user,
          photographerUrl: video.userImageURL,
          tags: video.tags.split(', '),
          downloadUrl: bestQuality?.url || '',
          previewUrl: videoFiles.medium?.url || videoFiles.small?.url,
        };
      });
    } catch (error) {
      console.error('Pixabay video search error:', error);
      return [];
    }
  }

  async searchImages(query: string, perPage = 10): Promise<StockImage[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get<PixabayPhotoResponse>(`${this.baseUrl}/`, {
        params: {
          key: this.apiKey,
          q: query,
          per_page: perPage,
          image_type: 'photo',
          safesearch: 'true',
        },
      });

      return response.data.hits.map((photo: PixabayPhoto) => ({
        id: `pixabay-image-${photo.id}`,
        source: 'pixabay' as const,
        url: photo.pageURL,
        thumbnail: photo.webformatURL,
        width: photo.imageWidth,
        height: photo.imageHeight,
        photographer: photo.user,
        photographerUrl: photo.userImageURL,
        tags: photo.tags.split(', '),
        downloadUrl: photo.largeImageURL,
      }));
    } catch (error) {
      console.error('Pixabay image search error:', error);
      return [];
    }
  }

  async search(query: string): Promise<SearchResult> {
    const [videos, images] = await Promise.all([
      this.searchVideos(query),
      this.searchImages(query),
    ]);
    return { videos, images, query, source: 'pixabay' };
  }
}