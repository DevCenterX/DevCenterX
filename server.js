export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Endpoint para obtener configuración pública (solo claves públicas)
    if (url.pathname === '/api/config') {
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
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'require-corp'
          }
        }
      );
    }
    
    try {
      // Intenta servir el archivo estático desde la carpeta public
      let response = await env.ASSETS.fetch(request);
      
      // Agregar headers COOP a todas las respuestas
      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
    } catch (e) {
      return new Response("Archivo no encontrado", { status: 404 });
    }
  },
};
