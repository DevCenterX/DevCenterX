// ==========================================
// API KEYS - TODAS LAS CLAVES DEL PROYECTO
// Cargar desde .env al inicio
// ==========================================

// Función para obtener variables de entorno (desde .env o valores por defecto)
// En un entorno real, estos valores vendrían del servidor
function getEnvVar(key, defaultValue = '') {
  // Intenta obtener del servidor primero
  if (window.__ENV_VARS && window.__ENV_VARS[key]) {
    return window.__ENV_VARS[key];
  }
  // Fallback a valores hardcodeados (para desarrollo local)
  return defaultValue;
}

// Google Gemini AI
window.GEMINI_API_KEY = getEnvVar(
  'GEMINI_API_KEY',
  'AIzaSyBSSc8rYJV4al0D1EBzgVyWmqhc3WiyFhY'
);
window.GEMINI_API_URL = getEnvVar(
  'GEMINI_API_URL',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
);

// Supabase
window.SUPABASE_URL = getEnvVar(
  'SUPABASE_URL',
  'https://sgqnjgfkycfzsrtwzdfq.supabase.co'
);
window.SUPABASE_ANON_KEY = getEnvVar(
  'SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncW5qZ2ZreWNmenNydHd6ZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTkwMzMsImV4cCI6MjA3Nzg3NTAzM30.xEVn6iuos-l241hlrwHWpoz3q4seQHzDeXpzdhDoPNs'
);

// GitHub
window.GITHUB_TOKEN = getEnvVar(
  'GITHUB_TOKEN',
  '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'
);
window.GITHUB_API_URL = getEnvVar(
  'GITHUB_API_URL',
  'https://api.github.com'
);

// ==========================================
// INTEGRACIÓN CON SISTEMA DE PROMPTS
// Carga los prompts mejorados del Replit
// ==========================================

// Cargar configuración de prompts cuando esté disponible
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

// Inicializar con configuración por defecto
window.loadAIPromptsConfig();
