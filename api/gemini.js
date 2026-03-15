export default async function handler(request, response) {
  // CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'POST only' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      response.status(500).json({ error: 'API_KEY missing' });
      return;
    }

    const { message } = request.body;

    if (!message) {
      response.status(400).json({ error: 'message required' });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Genera un código HTML5 completo y listo para usar basado en esto: "${message}". 
          
          IMPORTANTE: 
          - Incluye HTML, CSS y JavaScript en un solo archivo
          - El HTML debe estar dentro de un bloque \`\`\`html
          - El CSS debe estar dentro de un bloque \`\`\`css
          - El JavaScript debe estar dentro de un bloque \`\`\`javascript
          - Usa emojis y colores vibrantes
          - Hazlo completamente funcional
          - No expliques nada, solo genera el código
          
          Ejemplo de formato:
          \`\`\`html
          <!DOCTYPE html>
          <html>
          ...
          </html>
          \`\`\`
          
          \`\`\`css
          /* estilos aquí */
          \`\`\`
          
          \`\`\`javascript
          // código aquí
          \`\`\`
          ` }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 4096,
      },
    };

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      response.status(geminiRes.status).json({ error: err });
      return;
    }

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      response.status(500).json({ error: 'no reply' });
      return;
    }

    response.status(200).json({ success: true, reply });
  } catch (e) {
    response.status(500).json({ error: e.message });
  }
}
