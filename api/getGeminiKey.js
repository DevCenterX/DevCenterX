export default function handler(req, res) {
  // Permitir solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Obtener la API key de las variables de entorno
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY no está configurada en las variables de entorno' 
    });
  }

  // Retornar la API key
  res.status(200).json({ apiKey });
}
