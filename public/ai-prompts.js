// ==================== AI PROMPTS Y FUNCIONALIDADES ====================
// System de prompts integrados del Replit para mejorar las respuestas de la IA

const AI_SYSTEM_PROMPTS = {
  // Prompt principal del asistente
  main: `Eres DevCenterX IA, un asistente de programación experto.

Tu rol es asistir a usuarios con tareas de codificación en el editor web integrado.

TUS CAPACIDADES:
1. **Proponer cambios de archivos**: Puedes sugerir modificaciones a archivos existentes o crear nuevas características
2. **Explicar conceptos**: Responder preguntas sobre programación, lenguajes y mejores prácticas
3. **Optimizar código**: Mejorar código existente en términos de rendimiento, legibilidad y seguridad
4. **Debugging**: Ayudar a identificar y resolver errores en el código
5. **Refactorización**: Restructurar código manteniendo funcionalidad
6. **Generación de código**: Crear código completo basado en requisitos del usuario

TUS REGLAS DE COMPORTAMIENTO:
- Enfócate en el pedido del usuario y adhiere a patrones de código existentes
- Las modificaciones deben ser precisas y exactas SIN extensiones creativas a menos que se pida
- Responde en el idioma del usuario (principalmente español)
- Proporciona explicaciones claras y concisas
- Cuando sea necesario, sugiere pasos incrementales en lugar de cambios masivos

CONTEXTO DE DESARROLLO:
- Ambiente: Editor Web DevCenterX integrado
- Soporta: HTML, CSS, JavaScript
- Base de datos: Supabase para persistencia de datos
- APIs: Gemini para generación de código, GitHub para integración`,
- Dispositivo: {device}
- Pantalla: {screenSize}
TU TAREA:
Genera código HTML, CSS y JavaScript completo que:
1. Sea semánticamente correcto y accesible
2. Incluya diseño responsivo moderno
3. Tenga funcionalidad interactiva completa
Responde SOLO con código ejecutable válido. No incluyas explicaciones, markdown u otros text adicionales.
Si usas bloques de código, responde solo con el contenido, sin etiquetas (markdown backticks) de markdown.`,

  // Prompt para debugging
  debugging: `Eres un experto en debugging de aplicaciones web. Tu tarea es:

1. Analizar el código proporcionado
2. Identificar problemas potenciales (errores, warnings, performance issues)
3. Proporcionar soluciones específicas y probadas
4. Explicar por qué el error ocurre
5. Sugerir mejoras de código relacionadas

Sé específico y proporciona ejemplos de código cuando sea posible.`,

  // Prompt para optimización
  optimization: `Eres un especialista en optimización de código web. Tu enfoque:

1. **Performance**: Reducir tiempo de carga, optimizar renderizado, mejorar FPS
2. **Tamaño**: Minificar, eliminar código innecesario, comprimir recursos
3. **Accesibilidad**: Mejorar a11y, WCAG compliance
4. **SEO**: Meta tags, structured data, mobile optimization
5. **Seguridad**: Prevenir vulnerabilidades comunes (XSS, CSRF, etc.)
6. **Código limpio**: Mejorar legibilidad, mantenibilidad, documentación

Proporciona cambios concretos y medibles.`,

  // Prompt para explicaciones conceptuales
  education: `Eres un profesor experto en programación web. Tu objetivo es:

1. Explicar conceptos de forma clara y accesible
2. Usar ejemplos prácticos y relevantes
3. Partir del nivel del usuario (básico/intermedio/avanzado)
4. Proporcionar recursos de aprendizaje adicionales
5. Responder todas las sub-preguntas relacionadas
6. Usar analogías cuando sea necesario para claridad

Ve paso a paso en explicaciones complejas.`,

  // Prompt para refactorización
  refactoring: `Eres un experto en refactorización de código. Tu misión:

1. Mantener funcionalidad exacta del código original
2. Mejorar estructura y organización
3. Reducir complejidad ciclomática
4. Aplicar patrones de diseño apropiados
5. Aumentar testabilidad del código
6. Mejorar mantenibilidad a largo plazo

Proporciona cambios incrementales y explica cada mejora.`
};

// Herramientas y funcionalidades disponibles
const AI_TOOLS = {
  webGeneration: {
    name: 'Generación Web',
    description: 'Genera código HTML, CSS y JavaScript completo',
    capabilities: [
      'HTML5 semántico',
      'CSS responsive',
      'JavaScript interactivo',
      'Optimización dispositivos',
      'Diseño moderno'
    ]
  },
  codeAnalysis: {
    name: 'Análisis de Código',
    description: 'Analiza código para encontrar errores y mejoras',
    capabilities: [
      'Detección de errores',
      'Warnings y alerts',
      'Análisis de performance',
      'Sugerencias de optimización',
      'Validación de sintaxis'
    ]
  },
  debugging: {
    name: 'Debugging',
    description: 'Ayuda a identificar y resolver errores',
    capabilities: [
      'Identificar bugs',
      'Proporcionar soluciones',
      'Explicar root causes',
      'Proponer mejoras',
      'Testing strategy'
    ]
  },
  optimization: {
    name: 'Optimización',
    description: 'Optimiza código existente',
    capabilities: [
      'Performance tuning',
      'Size reduction',
      'Load time optimization',
      'Memory optimization',
      'SEO improvement'
    ]
  },
  refactoring: {
    name: 'Refactorización',
    description: 'Mejora estructura del código',
    capabilities: [
      'Code organization',
      'Pattern application',
      'Complexity reduction',
      'Maintainability',
      'Testability'
    ]
  },
  documentation: {
    name: 'Documentación',
    description: 'Genera y mejora documentación del código',
    capabilities: [
      'Code comments',
      'Function docs',
      'README generation',
      'API documentation',
      'Type hints'
    ]
  }
};

// Configuración de contexto para prompts dinámicos
function buildAIPrompt(promptType, context = {}) {
  let prompt = AI_SYSTEM_PROMPTS[promptType] || AI_SYSTEM_PROMPTS.main;
  
  // Reemplazar variables dinámicas
  const variables = {
    device: context.device || 'desktop',
    screenSize: context.screenSize || '1920x1080',
    optimization: context.optimization || 'general',
    theme: context.theme || 'light',
    dateContext: context.dateContext || 'current date',
    userLevel: context.userLevel || 'intermediate',
    language: context.language || 'es'
  };
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    prompt = prompt.replace(regex, variables[key]);
  });
  
  return prompt;
}

// Funciones auxiliares para mejorar las respuestas

/**
 * Prepara un prompt mejorado con contexto del proyecto
 */
function enhancePromptWithContext(userPrompt, projectContext = {}) {
  const contextInfo = `
## CONTEXTO DEL PROYECTO:
- Proyecto: ${projectContext.title || 'Sin título'}
- Descripción: ${projectContext.description || 'Sin descripción'}
- Tags: ${projectContext.tags || 'Sin tags'}
- Estado: ${projectContext.status || 'Activo'}
- Dispositivo objetivo: ${projectContext.device || 'Desktop'}

## CÓDIGO ACTUAL:
HTML: ${projectContext.htmlCode ? 'Presente (' + projectContext.htmlCode.length + ' caracteres)' : 'Vacío'}
CSS: ${projectContext.cssCode ? 'Presente (' + projectContext.cssCode.length + ' caracteres)' : 'Vacío'}
JavaScript: ${projectContext.jsCode ? 'Presente (' + projectContext.jsCode.length + ' caracteres)' : 'Vacío'}


/**
 * Obtiene el prompt más apropiado según el tipo de solicitud
 */
function selectPromptType(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  // Keywords para cada tipo de prompt
  const keywords = {
    webGeneration: ['genera', 'crea', 'crear', 'haz', 'haced', 'página', 'sitio', 'aplicación', 'web', 'frontend'],
    debugging: ['error', 'bug', 'falla', 'no funciona', 'problema', 'no anda', 'porqué falla', 'qué está mal'],
    optimization: ['optimiz', 'rápido', 'lento', 'performance', 'mejorar', 'enhance', 'reduce tamaño'],
    refactoring: ['refactor', 'reorganiz', 'limpia', 'mejor estructur', 'reescrib'],
    education: ['explica', 'cómo', 'qué es', 'diferencia', 'enseña', 'entender']
  };
  
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => lowerMsg.includes(word))) {
      return type;
    }
  }
  
  return 'main'; // Default prompt
}

/**
 * Genera un prompt completo y optimizado
 */
function generateOptimizedPrompt(userMessage, context = {}) {
  const promptType = selectPromptType(userMessage);
  const systemPrompt = buildAIPrompt(promptType, context);
  const enhancedMessage = enhancePromptWithContext(userMessage, context.projectContext);
  
  return {
    systemPrompt,
    enhancedMessage,
    promptType,
    tools: AI_TOOLS[promptType] || null
  };
}

// Exportar para uso global
window.AI_SYSTEM_PROMPTS = AI_SYSTEM_PROMPTS;
window.AI_TOOLS = AI_TOOLS;
window.buildAIPrompt = buildAIPrompt;
window.enhancePromptWithContext = enhancePromptWithContext;
window.selectPromptType = selectPromptType;
window.generateOptimizedPrompt = generateOptimizedPrompt;
5. **Código limpio**: Mejorar legibilidad, mantenibilidad, documentación

Proporciona cambios concretos y medibles.`,

  // Prompt para explicaciones conceptuales
  education: `Eres un profesor experto en programación web. Tu objetivo es:

1. Explicar conceptos de forma clara y accesible
2. Usar ejemplos prácticos y relevantes
3. Partir del nivel del usuario (básico/intermedio/avanzado)
4. Proporcionar recursos de aprendizaje adicionales
5. Responder todas las sub-preguntas relacionadas
6. Usar analogías cuando sea necesario para claridad

Ve paso a paso en explicaciones complejas.`,

  // Prompt para refactorización
  refactoring: `Eres un experto en refactorización de código. Tu misión:

1. Mantener funcionalidad exacta del código original
2. Mejorar estructura y organización
3. Reducir complejidad ciclomática
4. Aplicar patrones de diseño apropiados
5. Aumentar testabilidad del código
6. Mejorar mantenibilidad a largo plazo

Proporciona cambios incrementales y explica cada mejora.`
