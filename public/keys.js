// ==========================================
// API KEYS - CARGADAS DESDE EL SERVIDOR
// Firebase config está en new.html (inline script)
// ==========================================

// Función para cargar configuración desde el servidor
async function loadConfigFromServer() {
  try {
    const response = await fetch('/api/config', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const config = await response.json();
      
      // Asignar GEMINI_API_KEY (la única clave pública)
      window.GEMINI_API_KEY = config.GEMINI_API_KEY || '';
      
      // URLs públicas (no confidenciales)
      window.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
      window.GITHUB_API_URL = 'https://api.github.com';
      
      // Firebase config se carga desde new.html inline script
      // (ya está en window.firebaseApp, window.firebaseAuth, window.firebaseDB)
      
      window.loadAIPromptsConfig();
      return true;
    }
  } catch (error) {
    // Silenciar errores de red en producción - fallback a defaults
  }
  
  // Configuración default (fallback)
  window.GEMINI_API_KEY = '';
  window.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  window.GITHUB_API_URL = 'https://api.github.com';
  
  window.loadAIPromptsConfig();
  return false;
}

// Configuración por defecto (solo para desarrollo local)
window.loadAIPromptsConfig = function(config = {}) {
  window.AI_CONFIG = {
    enableAdvancedPrompts: config.enableAdvancedPrompts !== false,
    useContextualPromppts: config.useContextualPromppts !== false,
    modelName: config.modelName || 'gemini-1.5-flash',
    temperature: config.temperature || 1,
    maxTokens: config.maxTokens || 8192,
    language: config.language || 'es',
    ...config
  };
  console.log('✅ AI Config loaded:', window.AI_CONFIG);
};

// Cargar configuración al abrir la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadConfigFromServer);
} else {
  loadConfigFromServer();
}
