// ==================== AI PROMPTS Y FUNCIONALIDADES ====================
// Sistema de prompts integrados del Replit para mejorar las respuestas de la IA

const AI_SYSTEM_PROMPTS = {
  main: 'Eres DevCenterX IA, un asistente de programación experto. Tu rol es asistir a usuarios con tareas de codificación.',
  webGeneration: 'Eres un EXPERTO EN DESARROLLO WEB. Genera código HTML, CSS y JavaScript completo, semánticamente correcto,responsivo y optimizado.',
  debugging: 'Eres un experto en debugging. Analiza código, identifica problemas, proporciona soluciones específicas y explica por qué ocurren los errores.',
  optimization: 'Eres especialista en optimización web. Mejora performance, tamaño, accesibilidad, SEO y legibilidad del código.',
  education: 'Eres profesor experto en programación. Explica conceptos de forma clara, con ejemplos prácticos, paso a paso.',
  refactoring: 'Eres experto en refactorización. Mejora estructura del código manteniendo funcionalidad, reduce complejidad, aplica patrones de diseño.'
};

const AI_TOOLS = {
  webGeneration: {
    name: 'Generación Web',
    description: 'Genera código HTML, CSS y JavaScript completo',
    capabilities: ['HTML5', 'CSS responsive', 'JavaScript', 'Optimización', 'Diseño moderno']
  },
  debugging: {
    name: 'Debugging',
    description: 'Ayuda a identificar y resolver errores',
    capabilities: ['Identificar bugs', 'Soluciones', 'Root causes', 'Mejoras', 'Testing']
  },
  optimization: {
    name: 'Optimización',
    description: 'Optimiza código existente',
    capabilities: ['Performance', 'Size reduction', 'Load time', 'Memory', 'SEO']
  },
  refactoring: {
    name: 'Refactorización',
    description: 'Mejora estructura del código',
    capabilities: ['Organization', 'Patterns', 'Complexity', 'Maintainability', 'Testing']
  },
  education: {
    name: 'Educación',
    description: 'Explicaciones y enseñanzas',
    capabilities: ['Conceptos', 'Ejemplos', 'Pasos', 'Recursos', 'Claridad']
  },
  documentation: {
    name: 'Documentación',
    description: 'Genera documentación de código',
    capabilities: ['Comments', 'Docs', 'README', 'API docs', 'Type hints']
  }
};

function buildAIPrompt(promptType, context) {
  context = context || {};
  let prompt = AI_SYSTEM_PROMPTS[promptType] || AI_SYSTEM_PROMPTS.main;
  
  const variables = {
    device: context.device || 'desktop',
    screenSize: context.screenSize || '1920x1080',
    optimization: context.optimization || 'general',
    theme: context.theme || 'light',
    dateContext: context.dateContext || 'current',
    language: context.language || 'es'
  };
  
  for (const key in variables) {
    const regex = new RegExp('{' + key + '}', 'g');
    prompt = prompt.replace(regex, variables[key]);
  }
  
  return prompt;
}

function enhancePromptWithContext(userPrompt, projectContext) {
  projectContext = projectContext || {};
  return '\n## CONTEXTO DEL PROYECTO:\n' +
    '- Proyecto: ' + (projectContext.title || 'Sin título') + '\n' +
    '- Descripción: ' + (projectContext.description || '') + '\n' +
    '- Dispositivo: ' + (projectContext.device || 'desktop') + '\n\n' +
    '## SOLICITUD:\n' + userPrompt;
}

function selectPromptType(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  const keywords = {
    webGeneration: ['genera', 'crea', 'página', 'sitio', 'web'],
    debugging: ['error', 'bug', 'falla', 'problema'],
    optimization: ['optimiz', 'lento', 'performance'],
    refactoring: ['refactor', 'limpia', 'reorganiz'],
    education: ['explica', 'cómo', 'qué es']
  };
  
  for (const type in keywords) {
    const words = keywords[type];
    for (let i = 0; i < words.length; i++) {
      if (lowerMsg.indexOf(words[i]) !== -1) {
        return type;
      }
    }
  }
  
  return 'main';
}

function generateOptimizedPrompt(userMessage, context) {
  context = context || {};
  const promptType = selectPromptType(userMessage);
  const systemPrompt = buildAIPrompt(promptType, context);
  const enhancedMessage = enhancePromptWithContext(userMessage, context.projectContext);
  
  return {
    systemPrompt: systemPrompt,
    enhancedMessage: enhancedMessage,
    promptType: promptType,
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
