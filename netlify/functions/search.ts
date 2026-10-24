// Netlify Function: POST /api/search
// Search footage for a specific scene

import type { NetlifyEvent, NetlifyResponse, Scene, SearchResult } from './utils/types';
import { StockApiManager } from './services/stockApis';
import { getApiConfig, jsonResponse, errorResponse, handleOptions, parseBody } from './utils/helpers';

interface SearchBody {
  sceneId: string;
  queries?: string[];
  scenes: Scene[];
}

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
    const body = parseBody(event) as SearchBody;
    const { sceneId, queries, scenes } = body;

    if (!scenes || !Array.isArray(scenes)) {
      return errorResponse('Scenes array is required', 400);
    }

    const scene = scenes.find((s: Scene) => s.id === sceneId);
    if (!scene) {
      return errorResponse('Scene not found', 404);
    }

    const searchQueries = queries || scene.searchQueries;
    const config = getApiConfig();
    const stockApiManager = new StockApiManager(config);

    const allResults: SearchResult[] = [];

    for (const query of searchQueries) {
      const results = await stockApiManager.searchAll(query);
      allResults.push(...results);
    }

    // Deduplicate by ID
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

    const updatedScene: Scene = {
      ...scene,
      videos: Array.from(videoMap.values()),
      images: Array.from(imageMap.values()),
    };

    return jsonResponse({ scene: updatedScene });
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse('Failed to search footage', 500);
  }
}