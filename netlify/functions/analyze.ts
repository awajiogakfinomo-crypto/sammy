// Netlify Function: POST /api/analyze
// Analyze script text and return scene breakdown

import type { NetlifyEvent, NetlifyResponse } from './utils/types';
import { scriptAnalysisService } from './services/scriptAnalysis';
import { jsonResponse, errorResponse, handleOptions, parseBody } from './utils/helpers';

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
    const { script } = body;

    if (!script || typeof script !== 'string') {
      return errorResponse('Script is required', 400);
    }

    const analysis = scriptAnalysisService.analyze(script);
    return jsonResponse(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return errorResponse('Failed to analyze script', 500);
  }
}