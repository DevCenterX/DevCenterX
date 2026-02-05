export default {
  async fetch(request, env) {
    // Esto intenta servir el archivo desde la carpeta de activos (assets)
    const response = await env.ASSETS.fetch(request);

    // Si el archivo existe, lo devuelve; si no, devuelve un 404
    if (response.status === 404) {
      return new Response("Archivo no encontrado en DevCenterX", { status: 404 });
    }

    return response;
  },
};
