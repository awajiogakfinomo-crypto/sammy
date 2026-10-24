// Netlify Function: POST /api/search-all
// Search footage for all scenes

import type { NetlifyEvent, NetlifyResponse, Scene, SearchResult } from './utils/types';
import { StockApiManager } from './services/stockApis';
import { getApiConfig, jsonResponse, errorResponse, handleOptions, parseBody } from './utils/helpers';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = parseBody(event);
    const { scenes } = body;

    if (!scenes || !Array.isArray(scenes)) {
      return errorResponse('Scenes array is required', 400);
    }

    const config = getApiConfig();
    const stockApiManager = new StockApiManager(config);

    const results = await Promise.all(
      scenes.map(async (scene: Scene) => {
        const allResults: SearchResult[] = [];
        for (const query of scene.searchQueries) {
          const results = await stockApiManager.searchAll(query);
          allResults.push(...results);
        }

        const videoMap = new Map<string, any>();
        const imageMap = new Map<string, any>();

        for (const result of allResults) {
          for (const video of result.videos) {
            if (!videoMap.has(video.id)) videoMap.set(video.id, video);
          }
          for (const image of result.images) {
            if (!imageMap.has(image.id)) imageMap.set(image.id, image);
          }
        }

        return {
          sceneId: scene.id,
          videos: Array.from(videoMap.values()),
          images: Array.from(imageMap.values()),
          videoCount: videoMap.size,
          imageCount: imageMap.size,
        };
      })
    );

    // Merge results back into scenes
    const updatedScenes = scenes.map((scene: Scene) => {
      const result = results.find(r => r.sceneId === scene.id);
      if (result) {
        return {
          ...scene,
          videos: result.videos,
          images: result.images,
        };
      }
      return scene;
    });

    return jsonResponse({ scenes: updatedScenes, results });
  } catch (error) {
    console.error('Search all error:', error);
    return errorResponse('Failed to search footage for all scenes', 500);
  }
}