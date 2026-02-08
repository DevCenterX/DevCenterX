/**
 * Cloudflare Workers entrypoint
 * Handles API routes and serves static assets
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
          'Cross-Origin-Embedder-Policy': 'require-corp'
        }
      });
    }
    
    // Handle /api/config endpoint (returns environment configuration)
    if (url.pathname === '/api/config' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          GEMINI_API_KEY: env.GEMINI_API_KEY || '',
          GEMINI_API_URL: env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
          SUPABASE_URL: env.SUPABASE_URL || '',
          SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',
          GITHUB_API_URL: env.GITHUB_API_URL || 'https://api.github.com'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Cache-Control': 'public, max-age=3600',
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'require-corp'
          }
        }
      );
    }

    // Serve static assets from the /public directory
    if (!url.pathname.startsWith('/api')) {
      const assetRequest = new Request(new URL(url.pathname, request.url).toString(), request);
      let response = await env.ASSETS.fetch(assetRequest);
      
      // If asset not found, serve index.html (SPA fallback)
      if (response.status === 404) {
        response = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url).toString(), request));
      }

      // Add security headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
      
      return newResponse;
    }

    // 404 for unknown API endpoints
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

