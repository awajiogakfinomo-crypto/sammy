// Stock API Manager for Netlify Functions
// Coordinates Pexels, Pixabay, and Unsplash services

import { PexelsService } from './pexels';
import { PixabayService } from './pixabay';
import { UnsplashService } from './unsplash';
import type { SearchResult, ApiConfig, StockVideo, StockImage } from '../../utils/types';

export class StockApiManager {
  private pexels: PexelsService;
  private pixabay: PixabayService;
  private unsplash: UnsplashService;

  constructor(config: ApiConfig) {
    this.pexels = new PexelsService(config.pexels);
    this.pixabay = new PixabayService(config.pixabay);
    this.unsplash = new UnsplashService(config.unsplash);
  }

  async searchAll(query: string): Promise<SearchResult[]> {
    const results = await Promise.allSettled([
      this.pexels.search(query),
      this.pixabay.search(query),
      this.unsplash.search(query),
    ]);

    return results
      .filter((r): r is PromiseFulfilledResult<SearchResult> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  async searchVideos(query: string): Promise<StockVideo[]> {
    const results = await Promise.allSettled([
      this.pexels.searchVideos(query),
      this.pixabay.searchVideos(query),
    ]);

    return results
      .filter((r): r is PromiseFulfilledResult<StockVideo[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  async searchImages(query: string): Promise<StockImage[]> {
    const results = await Promise.allSettled([
      this.pexels.searchImages(query),
      this.pixabay.searchImages(query),
      this.unsplash.searchImages(query),
    ]);

    return results
      .filter((r): r is PromiseFulfilledResult<StockImage[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }
}