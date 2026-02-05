export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      // Intenta servir el archivo estático desde la carpeta public
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Archivo no encontrado", { status: 404 });
    }
  },
};
