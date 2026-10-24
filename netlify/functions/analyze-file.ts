// Netlify Function: POST /api/analyze-file
// Analyze uploaded script file (multipart/form-data)

import type { NetlifyEvent, NetlifyResponse } from './utils/types';
import { scriptAnalysisService } from './services/scriptAnalysis';
import { jsonResponse, errorResponse, handleOptions } from './utils/helpers';

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
    // For file uploads, we need to handle multipart/form-data
    // Netlify Functions receive the raw body, we need to parse it
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      return errorResponse('Expected multipart/form-data', 400);
    }

    // Parse multipart form data
    // Note: In production, you might want to use a library like 'busboy' or 'formidable'
    // For simplicity, we'll do basic parsing here
    if (!event.body) {
      return errorResponse('No file uploaded', 400);
    }

    // Since the body might be base64 encoded
    let body = event.body;
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }

    // Simple multipart parsing (for text files only)
    // In a real app, use a proper multipart parser
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      return errorResponse('Invalid multipart format', 400);
    }
    const boundary = boundaryMatch[1];

    const parts = body.split(`--${boundary}`);
    let scriptContent = '';

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data') && part.includes('name="script"')) {
        // Extract the file content
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          scriptContent = part.slice(contentStart + 4).trim();
          // Remove trailing boundary markers
          scriptContent = scriptContent.replace(/\r\n--$/, '').trim();
        }
        break;
      }
    }

    if (!scriptContent) {
      return errorResponse('No script file content found', 400);
    }

    const analysis = scriptAnalysisService.analyze(scriptContent);
    return jsonResponse(analysis);
  } catch (error) {
    console.error('File analysis error:', error);
    return errorResponse('Failed to analyze script file', 500);
  }
}