// Netlify Function: POST /api/select
// Update scene selections (selected videos/images)

import type { NetlifyEvent, NetlifyResponse, Scene } from './utils/types';
import { jsonResponse, errorResponse, handleOptions, parseBody } from './utils/helpers';

interface SelectBody {
  sceneId: string;
  videoIds?: string[];
  imageIds?: string[];
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
    const body = parseBody(event) as SelectBody;
    const { sceneId, videoIds, imageIds, scenes } = body;

    if (!scenes || !Array.isArray(scenes)) {
      return errorResponse('Scenes array is required', 400);
    }

    const scene = scenes.find((s: Scene) => s.id === sceneId);
    if (!scene) {
      return errorResponse('Scene not found', 404);
    }

    const updatedScene: Scene = {
      ...scene,
      selectedVideoIds: videoIds || [],
      selectedImageIds: imageIds || [],
    };

    return jsonResponse({ scene: updatedScene });
  } catch (error) {
    console.error('Selection error:', error);
    return errorResponse('Failed to update selection', 500);
  }
}