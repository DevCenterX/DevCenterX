/**
 * API Route para integración con Google Gemini
 * Endpoint: /api/gemini
 * Variable de entorno: GEMINI_API_KEY
 */

module.exports = async (request, response) => {
  // Configurar CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Solo POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Solo se acepta POST' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('[API] Request received');

    if (!apiKey) {
      console.error('[API] GEMINI_API_KEY not configured');
      return response.status(500).json({ 
        error: 'API key no configurada' 
      });
    }

    const { message, conversationHistory = [] } = request.body || {};

    if (!message) {
      return response.status(400).json({ error: 'Mensaje requerido' });
    }

    console.log('[API] Processing message:', message.substring(0, 50));

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const contents = [];
    
    // Agregar historial
    for (const msg of conversationHistory) {
      if (msg.role && msg.content) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Mensaje actual
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiRequest = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    console.log('[API] Calling Gemini...');

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    console.log('[API] Gemini response:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[API] Gemini error:', errorText);
      
      return response.status(geminiResponse.status).json({ 
        error: 'Error en Gemini API',
        status: geminiResponse.status
      });
    }

    const data = await geminiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      console.error('[API] No reply from Gemini');
      return response.status(500).json({ error: 'Sin respuesta de Gemini' });
    }

    console.log('[API] Success! Reply:', reply.substring(0, 50));

    return response.status(200).json({
      success: true,
      reply: reply,
    });

  } catch (error) {
    console.error('[API] Error:', error.message);
    
    return response.status(500).json({ 
      error: error.message
    });
  }
};
