/**
 * Vercel Edge Function para integración con Google Gemini
 * Endpoint: /api/gemini
 * Usa la variable de entorno: GEMINI_API_KEY
 */

export default async function handler(request) {
  // Solo aceptar POST requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido. Usa POST.' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Obtener la API key desde variables de entorno
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'API key no configurada. Asegúrate de configurar GEMINI_API_KEY en Vercel.' 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'El mensaje es requerido' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // URL del API de Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    // Preparar el contenido para Gemini
    const contents = [];
    
    // Agregar historial anterior
    for (const msg of conversationHistory) {
      if (msg.role && msg.content) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Agregar mensaje actual del usuario
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Preparar la solicitud a Gemini
    const geminiRequest = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      systemInstruction: {
        parts: [{
          text: `Eres un asistente IA experto en desarrollo de aplicaciones web. Ayudas a los usuarios a:
1. Definir y refinar sus ideas de aplicaciones
2. Proporcionar recomendaciones técnicas
3. Explicar conceptos de programación
4. Guiar en el proceso de creación de apps

Cuando el usuario escriba "/PROGRAMAR " seguido de una descripción, debes:
- Confirmar que entendiste la idea
- Sugerir tecnologías recomendadas
- Enumeración paso a paso para implementarla
- Ofrecer ayuda para crear la app

Sé conciso, profesional y enfocado en ayudar a crear aplicaciones de calidad.`
        }],
      },
    };

    // Hacer la solicitud a Gemini
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Error de Gemini:', errorData);
      
      return new Response(
        JSON.stringify({ 
          error: 'Error al comunicarse con Gemini API',
          details: errorData 
        }),
        {
          status: geminiResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const data = await geminiResponse.json();

    // Extraer la respuesta
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      return new Response(
        JSON.stringify({ 
          error: 'No se obtuvo respuesta de Gemini' 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Retornar la respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        reply: reply,
        messageId: Date.now(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error en handler:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
