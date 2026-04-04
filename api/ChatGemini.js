export default async function handler(request, response) {
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

  const apiKey = process.env.GEMINI_KEY_CHAT;

  if (!apiKey) {
    response.status(500).json({ error: 'GEMINI_KEY_CHAT no está configurada' });
    return;
  }

  const { url, payload, apiKey: overrideKey } = request.body || {};

  if (!url || typeof url !== 'string') {
    response.status(400).json({ error: 'Falta la URL del modelo' });
    return;
  }

  if (!payload || typeof payload !== 'object') {
    response.status(400).json({ error: 'Falta el payload con contents y generationConfig' });
    return;
  }

  let targetUrl;

  try {
    targetUrl = new URL(url);
  } catch (error) {
    response.status(400).json({ error: 'URL inválida' });
    return;
  }

  if (!targetUrl.hostname.endsWith('googleapis.com')) {
    response.status(400).json({ error: 'Host del modelo no permitido' });
    return;
  }

  targetUrl.searchParams.set('key', overrideKey || apiKey);

  try {
    const geminiResponse = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await geminiResponse.text();

    if (!geminiResponse.ok) {
      response.status(geminiResponse.status).json({ error: text || 'Error desde Gemini' });
      return;
    }

    try {
      const data = text ? JSON.parse(text) : {};
      response.status(200).json(data);
    } catch (parseError) {
      response.status(200).json({ result: text });
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
