// Netlify Function: POST /api/download
// Create ZIP download for selected footage (returns base64 encoded ZIP)

import type { NetlifyEvent, NetlifyResponse, Scene, DownloadRequest, DownloadResult } from './utils/types';
import { downloadService } from './services/download';
import { jsonResponse, errorResponse, handleOptions, parseBody } from './utils/helpers';

interface DownloadBody {
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
    const body = parseBody(event) as DownloadBody;
    const { sceneId, videoIds, imageIds, scenes } = body;

    if (!scenes || !Array.isArray(scenes)) {
      return errorResponse('Scenes array is required', 400);
    }

    const request: DownloadRequest = {
      sceneId,
      videoIds: videoIds || [],
      imageIds: imageIds || [],
    };

    const result: DownloadResult = await downloadService.createZip(request, scenes);

    return jsonResponse(result);
  } catch (error) {
    console.error('Download error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Failed to create download', 500);
  }
}