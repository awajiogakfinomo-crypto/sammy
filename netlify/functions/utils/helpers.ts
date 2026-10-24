// Shared helper functions for Netlify Functions

import type { NetlifyResponse, NetlifyEvent } from './types';

/**
 * Standard CORS headers for all API responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptions(): NetlifyResponse {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: '',
  };
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(data: unknown, statusCode = 200): NetlifyResponse {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data),
  };
}

/**
 * Create an error response with CORS headers
 */
export function errorResponse(message: string, statusCode = 500): NetlifyResponse {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ error: message }),
  };
}

/**
 * Parse JSON body from event
 */
export function parseBody(event: NetlifyEvent): Record<string, unknown> {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

/**
 * Get API configuration from environment variables
 */
export function getApiConfig() {
  return {
    pexels: {
      apiKey: process.env.PEXELS_API_KEY || '',
      baseUrl: 'https://api.pexels.com',
    },
    pixabay: {
      apiKey: process.env.PIXABAY_API_KEY || '',
      baseUrl: 'https://pixabay.com/api',
    },
    unsplash: {
      accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
      baseUrl: 'https://api.unsplash.com',
    },
  };
}

/**
 * Validate that at least one API key is configured
 */
export function validateApiKeys(): string[] {
  const config = getApiConfig();
  const missing: string[] = [];
  if (!config.pexels.apiKey) missing.push('PEXELS_API_KEY');
  if (!config.pixabay.apiKey) missing.push('PIXABAY_API_KEY');
  if (!config.unsplash.accessKey) missing.push('UNSPLASH_ACCESS_KEY');
  return missing;
}

/**
 * Extract path parameters from Netlify event path
 * e.g., /api/download/file/abc.zip -> { filename: 'abc.zip' }
 */
export function extractPathParams(path: string, pattern: string): Record<string, string> {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = pathParts[i] || '';
    }
  }

  return params;
}