// Netlify Function: GET /health
// Health check endpoint

import type { NetlifyEvent, NetlifyResponse } from './utils/types';
import { jsonResponse, handleOptions, getApiConfig } from './utils/helpers';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const config = getApiConfig();

  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeys: {
      pexels: config.pexels.apiKey ? 'configured' : 'not set',
      pixabay: config.pixabay.apiKey ? 'configured' : 'not set',
      unsplash: config.unsplash.accessKey ? 'configured' : 'not set',
    },
  });
}