# Reglas de Desarrollo - DevCenter Agent

## 1. Gestión de Archivos

### 1.1 Creación de Archivos - PROHIBIDO
- **NO crear nuevos archivos** a menos que sea absolutamente necesario
- Solo se permiten archivos HTML, CSS (style.css) y JavaScript (script.js)
- No crear archivos temporales, backups o archivos de prueba
- Ejemplos prohibidos: `.tmp`, `.bak`, `index.html.tmp`, `tmpclaude-*`
- Mantener la estructura limpia y minimal del proyecto

### 1.2 Modificación de Archivos Existentes
- Solo se permite editar archivos que ya existen en el proyecto
- Antes de modificar, verificar que el archivo existe usando las herramientas de lectura
- Mantener la estructura y organización actual del código

## 2. Gestión de API Keys y Seguridad

### 2.1 keys.js - Archivo de Claves
- **Única fuente de verdad** para todas las API keys del proyecto
- Solo puede modificarse cuando sea absolutamente necesario
- Únicamente se permite agregar o actualizar claves (keys)
- **PROHIBIDO** incluir:
  - Funciones
  - Lógica adicional
  - Configuraciones externas
  - Imports de otros módulos

### 2.2 Seguridad de API Keys
- No agregar medidas de seguridad adicionales (cifrado, protecciones automáticas, etc.)
- Las claves deben funcionar exactamente como están configuradas
- Todas las claves deben cargarse exclusivamente desde `.env`
- **PROHIBIDO** definir o importar keys en cualquier otro archivo

## 3. Estilo Visual y Diseño

### 3.1 Estética General
- Seguir el estilo tipo Replit: limpio, moderno y minimalista
- Mantener coherencia visual en todos los componentes
- Usar CSS custom properties (variables CSS) para temas

### 3.2 Iconos y Símbolos
- **PROHIBIDO** el uso de emojis en cualquier parte del código o interfaz
- Solo se permiten:
  - Iconos SVG
  - Librerías de iconos aprobadas: Lucide, FontAwesome
- Los iconos deben ser coherentes con el estilo general

### 3.3 Diseño Responsivo
- Todo diseño y componente debe ser completamente ajustable y adaptable
- Debe verse bien en cualquier tamaño de pantalla (desktop, tablet, mobile)
- Debe funcionar en cualquier forma de contenedor
- **PROHIBIDO**:
  - Desbordes de contenido
  - Deformaciones visuales
  - Elementos que rompan el layout
- Usar unidades flexibles (%, rem, vh, vw) en lugar de píxeles fijos cuando sea apropiado


## 5. Código y Prácticas de Desarrollo

### 5.1 Calidad de Código
- Código limpio y bien comentado 
- Nombres de variables y funciones descriptivos
- Evitar duplicación de código
- Seguir los patrones existentes en el proyecto

### 5.2 JavaScript
- Usar JavaScript moderno (ES6+)
- Preferir `async/await` sobre callbacks
- Manejar errores con try/catch
- Usar destructuring cuando sea apropiado

### 5.3 Funciones y Lógica
- Funciones pequeñas y con una sola responsabilidad
- Evitar funciones que hagan demasiadas cosas
- Documentar funciones complejas

## 6. Integración con APIs Externas

### 6.1 Google Gemini AI
- Usar para generación de código (HTML/CSS/JS)
- Mantener el modelo configurado: `gemini-2.5-pro`
- Optimizar prompts para mejores resultados

### 6.2 GitHub API
- Usar API REST v3 para operaciones de repositorio
- Implementar manejo de rate limits




### 7.2 Renderizado
- Optimizar renderizado de listas largas
- Usar lazy loading cuando sea apropiado
- Evitar re-renders innecesarios
- Evita poner codigos respetidos o insesarios


## 9. Prohibiciones Absolutas

- Crear nuevos archivos (usa lo exitentes)
- Usar emojis en código o interfaz
- Definir API keys fuera de .env
- Generar datos simulados o aleatorios para la interfaz
- Romper el diseño responsivo
- Ignorar errores de base de datos
- Usar localStorage para datos que deben persistir

## 10. Orden de Prioridades


2. **No Romper**: No romper funcionalidad existente
3. **Coherencia**: Mantener coherencia con el código existente
4. **Performance**: Optimizar para rendimiento
5. **UX/UI**: Mantener experiencia de usuario fluida

## 11. Sistema de Prompts Replit Integrado

### 11.1 Funcionalidad
- **Archivo**: `ai-prompts.js` - Sistema de prompts mejorados del Replit
- **Ubicación**: `/public/ai-prompts.js`
- **Funciones Globales**:
  - `window.generateOptimizedPrompt()` - Genera prompts optimizados con contexto
  - `window.selectPromptType()` - Detecta tipo de solicitud automáticamente
  - `window.buildAIPrompt()` - Construye prompts mejorados
  - `window.enhancePromptWithContext()` - Agrega contexto del proyecto

### 11.2 Tipos de Prompts Disponibles
1. **main** - Prompt principal del asistente DevCenterX
2. **webGeneration** - Generación de código HTML/CSS/JS
3. **debugging** - Debugging y resolución de errores
4. **optimization** - Optimización de código
5. **refactoring** - Refactorización y reestructuración
6. **education** - Explicaciones conceptuales

### 11.3 Herramientas Integradas
Sistema automático de detección de herramientas:
- **Generación Web** - Genera código completo
- **Análisis de Código** - Detecta errores y mejoras
- **Debugging** - Identifica y resuelve bugs
- **Optimización** - Mejora performance
- **Refactorización** - Reestructura código
- **Documentación** - Genera documentación

### 11.4 Configuración con .env
- **GEMINI_API_KEY** - Clave para Gemini
- **GEMINI_API_URL** - URL de API Gemini
- **SUPABASE_URL** - URL de Supabase
- **SUPABASE_ANON_KEY** - Clave anónima Supabase
- **GITHUB_TOKEN** - Token de GitHub
- **GITHUB_API_URL** - URL de GitHub API

### 11.5 Uso en Desarrollo
```javascript
// Generar prompt optimizado automáticamente
const optimizedPrompt = window.generateOptimizedPrompt(userMessage, {
  device: 'desktop',
  screenSize: '1920x1080',
  theme: 'dark',
  projectContext: currentProject
});

// Usar en llamada a API
const response = await fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: optimizedPrompt.enhancedMessage }] }],
    generationConfig: {
      temperature: window.AI_CONFIG?.temperature || 1,
      maxOutputTokens: window.AI_CONFIG?.maxTokens || 8192
    }
  })
});
```
