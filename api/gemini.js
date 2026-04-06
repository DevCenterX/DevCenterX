export default async function handler(request, response) {
  // ── Origin restriction ─────────────────────────────────────────────────────
  const allowedOrigins = [
    'https://devcenterx.vercel.app',
    'https://devcenterx.com',
  ];
  const origin = request.headers.origin || request.headers.referer || '';
  const allowed = allowedOrigins.some(o => origin.startsWith(o));

  response.setHeader('Access-Control-Allow-Origin', allowed ? origin : allowedOrigins[0]);
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Vary', 'Origin');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'POST only' });
    return;
  }
  if (!allowed) {
    response.status(403).json({ error: 'Forbidden' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_PG;

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

    const requiresCode = mode === 'programar';

    const systemMessage = requiresCode ? `
Eres un experto generador de apps web. Debes responder ÚNICAMENTE con JSON válido (sin markdown, sin backticks, sin explicaciones).
El JSON debe tener exactamente esta estructura:
{
  "html": "código HTML del body (sin <!DOCTYPE>, sin <html>, sin <head>, solo el contenido del body)",
  "css": "código CSS completo",
  "js": "código JavaScript completo",
  "message": "breve descripción de lo que generaste (máx 100 caracteres)",
  "svgIcon": "un SVG compacto (viewBox='0 0 64 64') que represente visualmente la app, con colores vibrantes",
  "appName": "nombre corto y creativo para la app (máx 20 caracteres)"
}
Reglas:
- Usa emojis, colores vibrantes y gradientes en el CSS
- El HTML no debe incluir <html>, <head> ni <body>
- El CSS debe ser completo e independiente (sin imports externos)
- El JS debe ser funcional y no depender de librerías externas salvo las que cargues vía CDN en el HTML
- El SVG del icono debe ser simple, moderno, con colores que representen la app
- SOLO JSON puro, sin texto adicional
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
      maxOutputTokens: requiresCode ? 8192 : 4096,
    };

    if (requiresCode) {
      // Force JSON output for programar mode — eliminates parsing errors
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = {
        type: 'object',
        properties: {
          html:     { type: 'string' },
          css:      { type: 'string' },
          js:       { type: 'string' },
          message:  { type: 'string' },
          svgIcon:  { type: 'string' },
          appName:  { type: 'string' },
        },
        required: ['html', 'css', 'js', 'message', 'svgIcon', 'appName'],
      };
    } else if (schema) {
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
