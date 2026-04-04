/**
 * SECURITY: This endpoint is DEPRECATED and disabled.
 * The Gemini API key must never be exposed via a public endpoint.
 * Use /api/gemini.js (server-side proxy) instead — it calls Gemini directly
 * using process.env.GEMINI_API_PG without ever sending the key to the client.
 */
export default function handler(req, res) {
  res.status(410).json({ error: 'Este endpoint fue deshabilitado por razones de seguridad. Usa /api/gemini directamente.' });
}
