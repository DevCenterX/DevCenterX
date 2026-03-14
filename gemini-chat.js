
// ==================== GEMINI AI CHAT INTEGRATION ====================
document.addEventListener('DOMContentLoaded', () => {
  const startChatBtn = document.getElementById('startChatBtn');
  const searchBox = document.getElementById('searchBox');

  if (startChatBtn) {
    startChatBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const prompt = searchBox ? searchBox.value.trim() : '';
      
      if (!prompt) {
        alert('Por favor, describe tu idea de aplicación primero');
        return;
      }

      if (!window.GEMINI_API_KEY || !window.GEMINI_API_URL) {
        console.error('API keys no cargadas');
        alert('Error: API keys no configuradas. Recarga la página.');
        return;
      }

      startChatBtn.disabled = true;
      startChatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';

      try {
        const response = await fetch(`${window.GEMINI_API_URL}?key=${window.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Create a complete responsive web app for: "${prompt}". Return only valid JSON with { "html": "complete html code", "css": "all styles", "js": "all javascript" }`
              }]
            }],
            generationConfig: {
              temperature: 1,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  html: { type: "string" },
                  css: { type: "string" },
                  js: { type: "string" }
                },
                required: ["html", "css", "js"]
              }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
          throw new Error('Invalid API response');
        }

        const codeData = JSON.parse(data.candidates[0].content.parts[0].text);

        // Guardar código generado en sessionStorage
        sessionStorage.setItem('generatedCode', JSON.stringify({
          html: codeData.html || '',
          css: codeData.css || '',
          js: codeData.js || '',
          prompt: prompt,
          timestamp: new Date().toISOString()
        }));

        // Redirigir a Programar
        window.location.href = '/Programar?mode=generated';

      } catch (error) {
        console.error('❌ Error generando código:', error);
        alert('Error al generar código: ' + error.message);
        startChatBtn.disabled = false;
        startChatBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg> Iniciar chat';
      }
    });
  }
});
