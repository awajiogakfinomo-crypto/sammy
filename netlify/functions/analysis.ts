// Netlify Function: GET /api/analysis
// Get current analysis (in serverless, this is passed from frontend)

import type { NetlifyEvent, NetlifyResponse } from './utils/types';
import { jsonResponse, errorResponse, handleOptions } from './utils/helpers';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  // In serverless, we don't have persistent state
  // The frontend should pass the analysis in the request or store it locally
  // This endpoint exists for API compatibility but returns a message
  return jsonResponse({
    message: 'In serverless mode, analysis state is managed client-side. Use the analyze endpoint to get fresh analysis.',
    analysis: null,
  });
}