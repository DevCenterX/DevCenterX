// ==========================================
// API KEYS - CARGADAS DESDE EL SERVIDOR
// NO contiene secretos hardcodeados
// ==========================================

// Función para cargar configuración desde el servidor
async function loadConfigFromServer() {
  console.log('🔄 Intentando cargar configuración desde /api/config...');
  try {
    const response = await fetch('/api/config', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Respuesta del servidor: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const config = await response.json();
    
    // Asignar variables globales
    window.GEMINI_API_KEY = config.GEMINI_API_KEY || '';
    window.GEMINI_API_URL = config.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    window.SUPABASE_URL = config.SUPABASE_URL || '';
    window.SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY || '';
    window.GITHUB_API_URL = config.GITHUB_API_URL || 'https://api.github.com';
    
    // Cargar configuración de AI
    window.loadAIPromptsConfig();
    
    console.log('✅ Configuración cargada desde servidor');
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo cargar configuración desde servidor:', error.message);
    console.log('📋 Usando configuración por defecto (desarrollo local)');
    
    // Configuración default
    window.GEMINI_API_KEY = '';
    window.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    window.SUPABASE_URL = '';
    window.SUPABASE_ANON_KEY = '';
    window.GITHUB_API_URL = 'https://api.github.com';
    
    window.loadAIPromptsConfig();
  }
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
