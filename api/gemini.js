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

    const { message, mode, conversationHistory = [], schema } = request.body;

    if (!message) {
      response.status(400).json({ error: 'message required' });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Determinar si el mensaje requiere instrucciones de código basándose en el modo
    const requiresCode = mode === 'programar';

    const systemMessage = requiresCode ? `
IMPORTANTE PARA RESPUESTAS CON CÓDIGO: 
- Incluye HTML, CSS y JavaScript separados
- El HTML debe estar dentro de un bloque \`\`\`html ... \`\`\`
- El CSS debe estar dentro de un bloque \`\`\`css ... \`\`\`
- El JavaScript debe estar dentro de un bloque \`\`\`javascript ... \`\`\`
- Usa emojis y colores vibrantes
- Hazlo completamente funcional
- No expliques nada, solo genera el código con esos 3 bloques
    ` : '';

    // Build conversation history
    const contents = [];
    
    // Add previous messages if in chat mode
    if (mode === 'chat' && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: systemMessage + message }]
    });

    const generationConfig = {
      temperature: 0.9,
      maxOutputTokens: 4096,
    };

    if (schema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = schema;
    }

    const payload = {
      contents,
      generationConfig,
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
