/**
 * API Route para integración con Google Gemini
 * TypeScript version para Vercel
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (request: VercelRequest, response: VercelResponse) => {
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
    
    if (!apiKey) {
      return response.status(500).json({ 
        error: 'GEMINI_API_KEY no está configurada' 
      });
    }

    const { message, conversationHistory = [] } = request.body;

    if (!message) {
      return response.status(400).json({ error: 'Mensaje requerido' });
    }

    console.log('[API] Mensaje recibido:', message.substring(0, 50));

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Preparar contenido
    const contents: any[] = [];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiRequest = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    console.log('[API] Llamando a Gemini...');

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    console.log('[API] Gemini respondió:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[API] Error de Gemini:', errorText);
      
      return response.status(geminiResponse.status).json({ 
        error: 'Error en Gemini API',
        details: errorText
      });
    }

    const data = await geminiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      console.error('[API] Sin respuesta de Gemini');
      return response.status(500).json({ error: 'Sin respuesta de Gemini' });
    }

    console.log('[API] ✅ Éxito!');

    return response.status(200).json({
      success: true,
      reply,
    });

  } catch (error: any) {
    console.error('[API] Error:', error.message);
    
    return response.status(500).json({ 
      error: error.message || 'Error desconocido'
    });
  }
};
