//====================================================== Configuración ======================================================
// CLAVE DE API ÚNICA PARA TODOS LOS MODELOS
// Todas las APIs de los modelos usarán esta clave. Simplifica la gestión al no tener que configurar cada modelo por separado.
const API_KEY = 'AIzaSyAKCtl0AmF0Vqjp_lJQdNVCPY92V4hF4QY';

// ================= URLs DE LOS MODELOS DE IA =======================
// URLs base para cada modelo de IA. Facilita la actualización si las URLs cambian en el futuro.
const MODEL_URLS = {
    program: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    memory: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    info: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    agent: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

// ================= CONFIGURACIÓN DE GENERACIÓN INTELIGENTE ================
// Ajusta la creatividad y diversidad de las respuestas de la IA.
// TEMPERATURE: Controla la aleatoriedad. Más alto = más creativo.
// TOP_K: Considera un número menor de tokens probables. Reduce la aleatoriedad.
// TOP_P: Selecciona tokens cuya probabilidad acumulada supera un umbral. Más diversidad.
let TEMPERATURE = 1.0;    // Máxima creatividad para respuestas únicas y variadas
let TOP_K = 50;           // Tokens candidatos amplios para mayor variación
let TOP_P = 0.95;         // Probabilidad alta para máxima diversidad

// ================= CONFIGURACIÓN DE TOKENS BASE POR MODO =======================
// Define la cantidad de tokens que cada modo puede usar como máximo en sus respuestas.
// Esto ayuda a controlar la longitud y el detalle de las respuestas según la tarea.
const BASE_TOKENS_BY_MODE = {
    info: 7000,      // Modo Información: Respuestas informativas normales.
    memory: 8000,    // Modo Memoria Extendida: Mayor capacidad para análisis con historial.
    program: 90000,  // Modo Programador: SÚPER ALTA CAPACIDAD para código extenso.
    agent: 7000      // Modo Agente: Balance general para tareas variadas.
};

// ================= CONFIGURACIÓN DE MODELOS POR MODO =======================
// Asigna URLs y límites de peticiones a cada modo de IA.
// rpm = Requests Per Minute (peticiones por minuto)
// tpm = Tokens Per Minute (tokens por minuto)
// rpd = Requests Per Day (peticiones por día)
const MODE_SPECIFIC_MODELS = {
    program: {
        url: MODEL_URLS.program,
        apiKey: API_KEY,
        rpm: 30, tpm: 1000000, rpd: 200
    },
    memory: {
        url: MODEL_URLS.memory,
        apiKey: API_KEY,
        rpm: 5, tpm: 125000, rpd: 100
    },
    info: {
        url: MODEL_URLS.info,
        apiKey: API_KEY,
        rpm: 15, tpm: 250000, rpd: 1000
    },
    agent: {
        url: MODEL_URLS.agent,
        apiKey: API_KEY,
        rpm: 15, tpm: 1000000, rpd: 200
    }
};
// ===========================================================================

// ================= LIMITE DE MESAJES Y TIEMPO POR CHAT =====================
let MAX_MESSAGES_PER_CHAT = 30; // <--- Cambia este valor para ajustar el límite
const RESET_LIMIT_MINUTES = 60; // Tiempo en minutos para restablecer el límite
// ===========================================================================

// ===========================================================================

// ================= SISTEMA DE MODO DE RESPUESTA ===========================
// Sistema de aumento de tokens de respuesta
// 'corta': tokens base del modo
// 'media': tokens base + 250 tokens adicionales
// 'larga': tokens base + 700 tokens adicionales
let responseMode = localStorage.getItem('responseMode') || 'corta'; // 'corta', 'media', 'larga'

// Función para calcular tokens finales según modo de respuesta
function getResponseModeMultiplier() {
    switch(responseMode) {
        case 'corta':
            return 0;      // Sin aumento adicional
        case 'media':
            return 250;    // +250 tokens
        case 'larga':
            return 700;    // +700 tokens
        default:
            return 0;
    }
}

// Función para obtener el límite máximo de tokens según modo activo y modo de respuesta
function getCurrentMaxTokens() {
    const baseTokens = BASE_TOKENS_BY_MODE[activeAbility] || BASE_TOKENS_BY_MODE.agent; // Fallback a agent
    const multiplier = getResponseModeMultiplier();
    return baseTokens + multiplier;
}
// ===========================================================================

// ================= CONFIGURACIÓN DE MODELOS POR MODO =======================

// ================= SISTEMA DE MEMORIA CONTEXTUAL AVANZADO =================
let contextualMemory = {
    userExpertise: null,          // Nivel de experiencia detectado del usuario
    conversationTheme: null,      // Tema principal de la conversación
    previousSolutions: [],        // Soluciones técnicas previas proporcionadas
    userPreferences: {},          // Preferencias de desarrollo detectadas
    projectContext: null,         // Contexto del proyecto en desarrollo
    lastCodeLanguage: null,       // Último lenguaje de programación utilizado
    complexityLevel: 'intermediate', // Nivel de complejidad detectado
    interactionPattern: 'mixed'   // Patrón de interacción: 'chat', 'web', 'mixed'
};

// Variables para el control de síntesis de voz
let currentSpeakingMessageId = null;  // ID del mensaje que se está reproduciendo
let currentUtterance = null;          // Referencia al utterance actual

// ================= CAPACIDADES DE ANÁLISIS INTELIGENTE ====================
let intelligentAnalysis = {
    detectUserLevel: function (message) {
        const basicKeywords = ['cómo', 'qué es', 'ayuda', 'básico', 'simple'];
        const advancedKeywords = ['optimización', 'arquitectura', 'refactoring', 'performance', 'escalabilidad'];
        const expertKeywords = ['algoritmo complejo', 'design patterns', 'microservicios', 'concurrencia'];

        if (expertKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return 'expert';
        } else if (advancedKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return 'advanced';
        } else if (basicKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return 'beginner';
        }
        return 'intermediate';
    },

    extractCodeLanguage: function (message) {
        const languages = ['javascript', 'python', 'java', 'react', 'vue', 'angular', 'node', 'css', 'html', 'typescript', 'php', 'c#', 'go', 'rust'];
        for (let lang of languages) {
            if (message.toLowerCase().includes(lang)) {
                return lang;
            }
        }
        return null;
    },

    detectProjectType: function (message) {
        const webKeywords = ['sitio web', 'página web', 'frontend', 'backend', 'fullstack'];
        const mobileKeywords = ['móvil', 'app', 'aplicación móvil', 'android', 'ios'];
        const desktopKeywords = ['escritorio', 'desktop', 'aplicación de escritorio'];

        if (webKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return 'web';
        } else if (mobileKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return 'mobile';
        } else if (desktopKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return 'desktop';
        }
        return 'general';
    }
};
// ===========================================================================

// ================= CONFIGURACIÓN DE IAs ====================================
let aiConfigs = [];
let selectedAiId = null;
let currentAiIndex = 0;  // Índice para rotación automática de IAs
let failedAiIds = new Set();  // IDs de IAs que fallaron recientemente
// ===========================================================================

// ================= SISTEMA DE FAILOVER AUTOMÁTICO =========================
// Función para obtener el modelo específico del modo activo
function getModeSpecificModel() {
    const modeModel = MODE_SPECIFIC_MODELS[activeAbility];
    if (modeModel) {
        // Si no tiene id o name, generarlos automáticamente
        const completeModel = { ...modeModel };
        if (!completeModel.id) {
            completeModel.id = `mode-${activeAbility}`;
        }
        if (!completeModel.name) {
            const modeNames = {
                program: 'Programador',
                memory: 'Memoria Extendida',
                info: 'Información',
                agent: 'Agente'
            };
            completeModel.name = `Modo ${modeNames[activeAbility] || activeAbility}`;
        }

        console.log(`🎯 Usando modelo específico para modo ${activeAbility}: ${completeModel.name}`);
        return completeModel;
    }
    return null;
}

function getNextAvailableAi() {
    // PRIMERO: Intentar usar el modelo específico del modo activo
    const modeModel = getModeSpecificModel();
    if (modeModel && !failedAiIds.has(modeModel.id)) {
        currentAiIndex++;
        return modeModel;
    }

    // SEGUNDO: Si el modelo específico falló o no existe, usar failover con modelos generales
    const availableAis = aiConfigs.filter(ai => !failedAiIds.has(ai.id));

    // Si todas han fallado, reseteamos la lista de fallidas y usamos todas
    if (availableAis.length === 0) {
        console.log('🔄 Todas las IAs fallaron, reseteando lista de fallidas...');
        failedAiIds.clear();
        const ai = aiConfigs[currentAiIndex % aiConfigs.length];
        currentAiIndex++;
        return ai;
    }

    // En el primer intento, preferir la IA seleccionada por el usuario si está disponible
    if (currentAiIndex === 0 && selectedAiId) {
        const selectedAi = availableAis.find(ai => ai.id === selectedAiId);
        if (selectedAi) {
            currentAiIndex++;
            console.log(`👤 Usando IA seleccionada: ${selectedAi.name} (${selectedAi.id})`);
            return selectedAi;
        }
    }

    // Rotamos entre las IAs disponibles
    const nextAi = availableAis[currentAiIndex % availableAis.length];
    currentAiIndex++;

    console.log(`🔀 Cambiando a: ${nextAi.name} (${nextAi.id})`);
    return nextAi;
}

function markAiAsFailed(aiId) {
    failedAiIds.add(aiId);
    console.log(`❌ IA marcada como fallida: ${aiId}`);

    // Limpiar la lista de fallidas después de 5 minutos
    setTimeout(() => {
        failedAiIds.delete(aiId);
        console.log(`✅ IA restaurada: ${aiId}`);
    }, 5 * 60 * 1000);
}

function isRetriableError(error) {
    // Solo marcar como fallida si es un error transitorio/de red
    const message = error.message.toLowerCase();
    const isNetworkError = message.includes('network') || message.includes('fetch') || message.includes('timeout');
    const isRateLimit = message.includes('429') || message.includes('quota') || message.includes('rate limit');
    const isServerError = message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504');

    return isNetworkError || isRateLimit || isServerError;
}

async function makeApiCallWithFailover(apiCall, maxRetries = 3) {
    let lastError = null;

    // Resetear el índice para cada nueva llamada para que empiece con selectedAiId
    currentAiIndex = 0;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const ai = getNextAvailableAi();
        try {
            console.log(`🔄 Intento ${attempt + 1}/${maxRetries} con ${ai.name}`);

            const result = await apiCall(ai);

            // Si llegamos aquí, la llamada fue exitosa
            console.log(`✅ Éxito con ${ai.name}`);
            
            // Guardar el modelo usado
            lastUsedAiModel = ai.name;

            // Notificación de IA desactivada por preferencia del usuario
            // if (isDevCenterUser()) {
            //     showAiNotification(ai.name);
            // }

            return result;

        } catch (error) {
            lastError = error;

            console.error(`❌ Error con ${ai.name}:`, error.message);

            // Solo marcar como fallida si es un error transitorio
            if (isRetriableError(error)) {
                markAiAsFailed(ai.id);
                console.log(`⚠️ Error transitorio, marcando ${ai.name} como fallida temporalmente`);
            } else {
                console.log(`🚫 Error de configuración/contenido, no rotando: ${error.message}`);
                // Para errores no transitorios, fallar inmediatamente
                throw error;
            }

            // Si es el último intento, lanzamos el error
            if (attempt === maxRetries - 1) {
                throw new Error(`Todas las IAs fallaron. Último error: ${error.message}`);
            }

            // Esperar un poco antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw lastError;
}
// ===========================================================================

// Estado global
let currentChatId = null;
let isGenerating = false;
let chats = [];
let userInfo = null;
let activeAbility = 'agent'; // Por defecto: Modo Agente
let lastUsedAiModel = null; // Rastrear el último modelo de IA usado

// ================= DETECCIÓN DE DISPOSITIVO Y CONTEXTO =================
function detectUserDevice() {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    let deviceType = 'desktop';
    let deviceDetails = '';
    let optimizationAdvice = '';
    
    if (/iPhone|iPad|iPod/i.test(ua)) {
        deviceType = 'mobile';
        deviceDetails = 'dispositivo iOS';
        optimizationAdvice = 'OPTIMIZACIÓN MÓVIL iOS: Usar -webkit-touch-callout, -webkit-user-select, touch-action, scroll-behavior smooth, font iOS optimizado, colores vibrantes, botones grandes táctiles, navegación inferior, scroll horizontal, gestos swipe.';
    } else if (/Android/i.test(ua)) {
        deviceType = 'mobile';
        deviceDetails = 'dispositivo Android';
        optimizationAdvice = 'OPTIMIZACIÓN MÓVIL ANDROID: Material Design principles, ripple effects, floating action buttons, colores Material, navegación con tabs, scroll snap, touch feedback, density-independent pixels.';
    } else if (/Mobi/i.test(ua) || (width <= 768 && hasTouch)) {
        deviceType = 'mobile';
        deviceDetails = 'dispositivo móvil';
        optimizationAdvice = 'OPTIMIZACIÓN MÓVIL GENERAL: Mobile-first design, thumb-friendly navigation, large touch targets (44px min), stack layouts verticalmente, ocultar elementos no esenciales, usar sticky headers, bottom navigation, hamburger menu.';
    } else if (/Tablet|iPad/i.test(ua) || (width > 768 && width <= 1024 && hasTouch)) {
        deviceType = 'tablet';
        deviceDetails = 'tablet';
        optimizationAdvice = 'OPTIMIZACIÓN TABLET: Hybrid desktop/mobile approach, aprovechar pantalla más grande, sidebar navigation, grid layouts, touch gestures, landscape/portrait adaptation, split views.';
    } else if (width > 1024) {
        deviceType = 'desktop';
        deviceDetails = 'computadora de escritorio';
        optimizationAdvice = 'OPTIMIZACIÓN DESKTOP: Hover effects, keyboard navigation, cursor interactions, wide layouts, sidebar navigation, multi-column layouts, parallax effects, video backgrounds, complex animations.';
    }
    
    return {
        type: deviceType,
        details: deviceDetails,
        screenWidth: width,
        screenHeight: height,
        hasTouch: hasTouch,
        optimizationAdvice: optimizationAdvice,
        devicePixelRatio: devicePixelRatio
    };
}

function getContextualInfo() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.toLocaleDateString('es-ES', { month: 'long' });
    const currentDay = now.getDate();
    const currentWeekDay = now.toLocaleDateString('es-ES', { weekday: 'long' });
    
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    
    let detectedTheme = 'claro';
    if (prefersDark || bodyBg.includes('rgb(0, 0, 0)') || bodyBg.includes('rgb(10, 13, 28)')) {
        detectedTheme = 'oscuro';
    }
    
    return {
        year: currentYear,
        month: currentMonth,
        day: currentDay,
        weekDay: currentWeekDay,
        theme: detectedTheme,
        season: getSeason(now.getMonth() + 1)
    };
}

function getSeason(month) {
    if (month >= 3 && month <= 5) return 'primavera';
    if (month >= 6 && month <= 8) return 'verano';
    if (month >= 9 && month <= 11) return 'otoño';
    return 'invierno';
}

// Elementos del DOM
const elements = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuBtn: document.getElementById('menuBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    sidebarContent: document.getElementById('sidebarContent'),
    messages: document.getElementById('messages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    suggestions: document.getElementById('suggestions'),
    previewModal: document.getElementById('previewModal'),
    backBtn: document.getElementById('backBtn'),
    previewFrame: document.getElementById('previewFrame'),
    downloadBtn: document.getElementById('downloadBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    fullscreenBackBtn: document.getElementById('fullscreenBackBtn'),
    shareBtn: document.getElementById('shareBtn'),
    loading: document.getElementById('loading'),
    previewSubtitle: document.getElementById('previewSubtitle'),
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadAiConfigs();
    loadChats();
    adjustTextareaHeight();
    handleInputChange();
    loadUserInfo();
    updateAiConfigBtnVisibility();
    
    // Cargar y activar modo guardado
    loadActiveAbility();

    // Mostrar el botón de copiar solo en escritorio
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) {
        function updateCopyBtnVisibility() {
            if (window.innerWidth >= 641) {
                copyBtn.style.display = 'flex';
            } else {
                copyBtn.style.display = 'none';
            }
        }
        updateCopyBtnVisibility();
        window.addEventListener('resize', updateCopyBtnVisibility);
    }

    // Manejar primer mensaje desde la página principal
    const firstMessage = localStorage.getItem('devcenter_first_message');
    if (firstMessage) {
        console.log('💬 Primer mensaje detectado, enviando automáticamente...');
        // Establecer el mensaje en el textarea
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = firstMessage;
            adjustTextareaHeight();
        }
        // Limpiar el localStorage
        localStorage.removeItem('devcenter_first_message');
        // Enviar el mensaje automáticamente después de un breve retraso
        setTimeout(() => {
            sendMessage(firstMessage);
        }, 500);
    }
});

function updateAiConfigBtnVisibility() {
    // El botón de configuración de IAs ahora siempre está visible
    // Ya no se necesita verificar si es usuario DevCenter
}

// Función para verificar si el usuario es DevCenter
function isDevCenterUser() {
    return userInfo &&
        typeof userInfo.custom === 'string' &&
        userInfo.custom.trim() === 'DevCenter';
}

// Configurar event listeners para herramientas DevCenter
function setupDevCenterToolsListeners() {
    const aiStatusBtn = document.getElementById('aiStatusBtn');
    const systemStatsBtn = document.getElementById('systemStatsBtn');

    if (aiStatusBtn) {
        aiStatusBtn.removeEventListener('click', showAiStatus);
        aiStatusBtn.addEventListener('click', showAiStatus);
    }

    if (systemStatsBtn) {
        systemStatsBtn.removeEventListener('click', showSystemStats);
        systemStatsBtn.addEventListener('click', showSystemStats);
    }
}

// Funciones para herramientas DevCenter
function showAiStatus() {
    loadAiConfigs();
    const currentAi = aiConfigs.find(ai => ai.id === selectedAiId) || aiConfigs[0];
    const availableAis = aiConfigs.filter(ai => !failedAiIds.has(ai.id));
    const failedCount = failedAiIds.size;

    let statusMessage = `🤖 Estado Actual de IA:\n\n`;
    statusMessage += `📍 IA Actual: ${currentAi.name}\n`;
    statusMessage += `✅ IAs Disponibles: ${availableAis.length}/${aiConfigs.length}\n`;
    statusMessage += `❌ IAs Fallidas: ${failedCount}\n\n`;

    if (failedCount > 0) {
        statusMessage += `IAs temporalmente no disponibles:\n`;
        failedAiIds.forEach(failedId => {
            const failedAi = aiConfigs.find(ai => ai.id === failedId);
            if (failedAi) {
                statusMessage += `• ${failedAi.name}\n`;
            }
        });
    }

    alert(statusMessage);
}

// Notificaciones desactivadas por solicitud del usuario

// Funciones para el modo de respuesta
function toggleResponseMode() {
    const modes = ['corta', 'media', 'larga'];
    const currentIndex = modes.indexOf(responseMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    responseMode = modes[nextIndex];
    localStorage.setItem('responseMode', responseMode);
    updateResponseModeIcon();
}

function updateResponseModeIcon() {
    const iconElement = document.getElementById('responseModeIcon');
    const btnElement = document.getElementById('responseModeBtn');
    if (!iconElement || !btnElement) return;

    // Remover clases de modo anteriores
    btnElement.classList.remove('mode-corta', 'mode-media', 'mode-larga');
    
    switch(responseMode) {
        case 'corta':
            iconElement.textContent = 'S';
            btnElement.title = 'Modo: Respuestas Cortas\n(Programador: 40k tokens - 950-1500 líneas - Código PRO)';
            btnElement.classList.add('mode-corta');
            break;
        case 'media':
            iconElement.textContent = 'M';
            btnElement.title = 'Modo: Respuestas Medias\n(Programador: 85k tokens - 1520-2400 líneas - VISUAL ÉPICO)';
            btnElement.classList.add('mode-media');
            break;
        case 'larga':
            iconElement.textContent = 'L';
            btnElement.title = 'Modo: Respuestas Largas\n(Programador: 150k tokens - 3800-6200 líneas - OBRA MAESTRA)';
            btnElement.classList.add('mode-larga');
            break;
    }
}

function getResponseModeInstructions() {
    // El modo programador tiene sus propias instrucciones
    if (activeAbility === 'program') {
        return getProgramModeInstructions();
    }

    switch(responseMode) {
        case 'corta':
            return `\n\n📏 MODO DE RESPUESTA: CORTA
- Sé directo y conciso
- Respuestas breves y al punto
- Evita introducciones largas o relleno innecesario
- Máximo 2-3 párrafos cortos
- Ejemplo: Si el usuario dice "Hola" responde "Hola ¿Cómo estás?"
`;
        case 'media':
            return `\n\n📏 MODO DE RESPUESTA: MEDIA
- Respuestas balanceadas con contexto adecuado
- Incluye detalles importantes pero sin excesos
- Máximo 4-5 párrafos moderados
- Ejemplo: Si el usuario dice "Hola" responde "Hola Justin, ¿cómo te ha ido hoy? ¿Qué has hecho?"
`;
        case 'larga':
            return `\n\n📏 MODO DE RESPUESTA: LARGA
- Respuestas completas y detalladas
- Incluye contexto amplio y explicaciones
- Puedes ser más expresivo y conversacional
- Ejemplo: Si el usuario dice "Hola" responde "¡Hola, Justin! ¡Qué gusto saludarte! Soy DevCenter IA, tu asistente especializado en todo lo relacionado con desarrollo, programación y tecnología. Es genial poder conversar contigo."
`;
        default:
            return '';
    }
}

// Función para obtener instrucciones específicas del modo programador según responseMode
function getProgramModeInstructions() {
    switch(responseMode) {
        case 'corta':
            return `\n\n💻 MODO PROGRAMADOR PRO - NIVEL COMPLETO (40,000 tokens)
📏 ENFOQUE: Código PROFESIONAL de ALTA CALIDAD

🚀 GENERA CÓDIGO PROFESIONAL Y COMPLETO:

1. **HTML (35% del código)**: Estructura PROFESIONAL y COMPLETA
   - 4-6 secciones bien diseñadas: Header, Hero/Intro, Features/Services, Testimonials/About, Contact, Footer
   - Elementos HTML5 semánticos perfectos (<header>, <nav>, <main>, <section>, <article>, <footer>)
   - ARIA labels para accesibilidad completa
   - Meta tags para SEO (description, keywords, og tags)
   - Estructura organizada con contenedores lógicos
   - Formularios con validación HTML5
   - Comentarios HTML explicativos
   - MÍNIMO 250-400 LÍNEAS de HTML

2. **CSS (45% del código)**: Estilos MODERNOS y AVANZADOS
   - Variables CSS para colores, fuentes, espaciados, sombras (20-30 variables)
   - Animaciones @keyframes profesionales (6-10 animaciones suaves)
   - Gradientes modernos y efectos glassmorphism
   - Grid y Flexbox para layouts profesionales
   - Media queries completas:
     * Mobile: 320px, 480px
     * Tablet: 768px
     * Desktop: 1024px, 1440px
   - Hover effects y transiciones en todos los elementos interactivos
   - Sombras suaves y efectos 3D (box-shadow, text-shadow)
   - Tipografía moderna con line-height y letter-spacing perfecto
   - Dark mode opcional con variables CSS
   - Scroll animations con CSS
   - Loading states y skeletons
   - Comentarios CSS bien organizados
   - MÍNIMO 500-750 LÍNEAS de CSS

3. **JavaScript (20% del código)**: Funcionalidad SÓLIDA y MODERNA
   - Menu toggle responsive con animación suave
   - Smooth scroll navigation con offset
   - Scroll animations con Intersection Observer
   - Form validation completa en tiempo real
   - Modal/Dialog system
   - Scroll-to-top button con progress indicator
   - Lazy loading de imágenes
   - Typing effect o contador animado
   - Event listeners organizados y optimizados
   - Código modular con funciones reutilizables
   - Error handling y fallbacks
   - Performance optimizado (debounce, throttle)
   - Comentarios JavaScript explicativos
   - MÍNIMO 200-350 LÍNEAS de JavaScript

🎯 CARACTERÍSTICAS PROFESIONALES OBLIGATORIAS:
✅ Diseño 100% Responsive (mobile-first approach)
✅ Animaciones suaves y profesionales (ease-in-out, cubic-bezier)
✅ Interactividad moderna y fluida
✅ Código limpio, organizado y MUY bien comentado
✅ Performance optimizado (CSS minimalista, JS eficiente)
✅ Accesibilidad completa (ARIA, contraste WCAG AA, keyboard navigation)
✅ Cross-browser compatible (webkit prefixes)
✅ SEO friendly (semantic HTML, meta tags)
✅ Loading states y feedback visual
✅ Micro-interactions en botones y cards

📊 TOTAL: 950-1500 LÍNEAS de código PROFESIONAL de ALTA CALIDAD
`;
        case 'media':
            return `\n\n💻 MODO PROGRAMADOR AVANZADO - NIVEL EXTENSO (85,000 tokens)
📏 ENFOQUE: MÁXIMO HTML/CSS ESPECTACULAR, JavaScript MODERADO

🚀 GENERA CÓDIGO MEGA EXTENSO Y VISUAL MENTE IMPRESIONANTE:
Este modo es 2X MÁS GRANDE que el corto - Enfoque en diseño visual ESPECTACULAR

1. **HTML (50% del código)**: Estructura MEGA COMPLETA Y DETALLADA
   - MÍNIMO 8-10 secciones COMPLETAS y MUY detalladas:
     * Header con logo, navegación completa, CTA buttons
     * Hero section con headlines, subtext, botones, imágenes decorativas
     * Features section con 6-9 features (iconos SVG, títulos, descripciones)
     * Services/Products section con cards detalladas (3-6 servicios)
     * About section con imagen, historia, misión/visión
     * Testimonials section con mínimo 6-8 testimonios (foto, nombre, cargo, quote)
     * Gallery/Portfolio con grid de imágenes/proyectos
     * Stats/Numbers section con contadores animables
     * Contact section con formulario COMPLETO (nombre, email, teléfono, mensaje)
     * Footer DETALLADO (links, social media, copyright, sitemap)
   
   - Cada sección con subsecciones y elementos múltiples
   - TODOS los elementos semánticos perfectos
   - ARIA labels EXTENSOS en absolutamente todo
   - Formularios con TODOS los tipos de inputs
   - Múltiples grids, cards, y componentes
   - SVG inline para iconos (NO imágenes externas)
   - Comentarios HTML MUY DETALLADOS en cada bloque
   - MÍNIMO 500-800 LÍNEAS DE HTML

2. **CSS (45% del código)**: Estilos ULTRA ELABORADOS Y MODERNOS
   - Variables CSS MASIVAS (40-60 variables):
     * Colores (primario, secundario, acentos, grises, success, error)
     * Fuentes (familias, tamaños, pesos)
     * Espaciados (margins, paddings, gaps)
     * Sombras (box-shadow múltiples niveles)
     * Transiciones (durations, timings)
     * Border-radius, z-index
   
   - Animaciones @keyframes PROFESIONALES (12-18 animaciones):
     * fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
     * slideIn variations
     * bounce, pulse, shake, wiggle
     * rotate, scale, flip
     * loading spinners, progress bars
     * gradient animations
   
   - Efectos visuales AVANZADOS en MUCHOS elementos:
     * Glassmorphism (backdrop-filter, blur)
     * Neumorphism en botones y cards
     * Gradientes complejos y animados
     * Sombras multicapa (3-4 niveles)
     * Efectos hover 3D (transform, perspective)
   
   - Sistema Grid COMPLEJO en todas las secciones
   - Flexbox AVANZADO en todo
   
   - Media queries ULTRA COMPLETAS:
     * Mobile small: 320px
     * Mobile: 480px, 576px
     * Tablet: 768px, 992px
     * Desktop: 1200px, 1400px, 1600px
   
   - Hover effects en ABSOLUTAMENTE TODO:
     * Botones (scale, shadow, gradient shift)
     * Cards (lift, glow, border animation)
     * Links (underline animation, color transition)
     * Imágenes (zoom, overlay, filters)
   
   - Estados visuales completos (hover, focus, active, disabled)
   - Dark mode con variables CSS
   - Loading states y skeleton screens
   - Scroll animations con CSS
   - Comentarios CSS MUY DETALLADOS
   - MÍNIMO 900-1400 LÍNEAS DE CSS

3. **JavaScript (5% del código)**: Funcionalidad BÁSICA PERO PULIDA
   - Menu toggle responsive con animación
   - Smooth scroll con easing
   - Intersection Observer para fade-in básico
   - Formulario con validación simple
   - Scroll-to-top button
   - Lazy loading básico
   - Event listeners organizados
   - Comentarios breves
   - MÍNIMO 120-200 LÍNEAS de JavaScript

🎯 OBJETIVO: Página WEB VISUALMENTE ESPECTACULAR
✅ Diseño IMPRESIONANTE y moderno
✅ Animaciones SUAVES por todas partes
✅ HTML/CSS de MÁXIMA calidad
✅ JavaScript funcional pero simple
✅ Código EXTENSO y bien comentado

📊 TOTAL: 1520-2400 LÍNEAS - Enfoque en DISEÑO VISUAL INCREÍBLE
`;
        case 'larga':
            return `\n\n💻 MODO PROGRAMADOR ÉLITE - NIVEL MASIVO (150,000 tokens)
📏 ENFOQUE: CÓDIGO ULTRA MASIVO Y COMPLETO - La OBRA MAESTRA

🔥🔥🔥 GENERA EL CÓDIGO MÁS IMPRESIONANTE, COMPLETO Y EXTENSO DEL MUNDO 🔥🔥🔥
Este modo es 3-4X MÁS GRANDE que el corto - CÓDIGO DE NIVEL ELITE

⚡⚡⚡ USA TODO EL LÍMITE DE TOKENS (150,000) - NO AHORRES NADA ⚡⚡⚡

1. **HTML (42% del código)**: ESTRUCTURA MEGA ULTRA MASIVA
   - MÍNIMO 15-20 SECCIONES SÚPER COMPLETAS Y DETALLADAS:
     ✦ Header COMPLETO (logo, nav multi-nivel, search bar, user menu, CTAs)
     ✦ Hero MASIVO (headline, subheadline, description, 2-3 CTAs, background animado, scroll indicator)
     ✦ Features section (9-12 features con iconos SVG, títulos, descripciones largas)
     ✦ About section EXTENSA (imagen, historia completa, misión, visión, valores)
     ✦ Services/Products (8-10 servicios con cards detalladas, iconos, precios, beneficios)
     ✦ How It Works/Process (4-6 pasos con números, iconos, descripciones)
     ✦ Portfolio/Gallery (12-16 proyectos con overlay, categorías, filtros)
     ✦ Testimonials (10-15 testimonios con foto, nombre, cargo, empresa, rating, quote larga)
     ✦ Team section (8-12 miembros con foto, nombre, rol, bio, social links)
     ✦ Pricing (3-5 planes con tabla comparativa, features list, CTA)
     ✦ Statistics/Numbers (6-10 contadores animados con iconos)
     ✦ FAQ (12-20 preguntas con accordion, categorías)
     ✦ Blog/News (6-9 artículos con imagen, título, excerpt, autor, fecha)
     ✦ Partners/Clients (logos, carrusel)
     ✦ Timeline/History section
     ✦ Video section (player, descripción)
     ✦ Newsletter (formulario, beneficios)
     ✦ Contact MASIVO (formulario completo, mapa, info de contacto, horarios, social)
     ✦ Footer MEGA DETALLADO (4-6 columnas, links, social, newsletter mini, copyright, terms)
   
   - Cada sección con MÚLTIPLES subsecciones
   - TODOS los elementos semánticos HTML5
   - ARIA labels COMPLETOS en TODO
   - Formularios con validación HTML5 completa
   - Schema.org markup para SEO
   - Open Graph y Twitter Cards
   - Microdata y JSON-LD
   - SVG inline para TODOS los iconos
   - Comentarios MEGA EXTENSOS
   - MÍNIMO 1000-1600 LÍNEAS DE HTML

2. **CSS (40% del código)**: ESTILOS ÉPICOS Y ULTRA ELABORADOS
   - Variables CSS ÉPICAS (80-120 variables):
     * Colores completos (primario + shades, secundario + shades, success, warning, danger, info, grises 10 niveles)
     * Tipografía (10+ font sizes, 5+ weights, line-heights, letter-spacings)
     * Espaciados (20+ spacing values)
     * Sombras (8-12 niveles de box-shadow)
     * Border-radius (6-8 valores)
     * Z-index system
     * Transiciones (durations, timings, delays)
     * Breakpoints
   
   - Animaciones @keyframes MASIVAS (25-40 animaciones):
     * Fade variations: fadeIn, fadeOut, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
     * Slide variations: slideInUp, slideInDown, slideInLeft, slideInRight
     * Zoom/Scale: zoomIn, zoomOut, scaleUp, scaleDown
     * Rotate: rotate360, rotateIn, rotateOut, flip, flipX, flipY
     * Bounce variations: bounce, bounceIn, bounceOut, bounceInUp, bounceInDown
     * Special: pulse, shake, wiggle, wobble, swing, tada, jello, heartBeat
     * Loading: spinner, dots, bars, waves
     * Gradient: gradientShift, gradientPulse
     * Complex: parallaxFloat, morphing, glitch
   
   - Efectos visuales EXTREMOS:
     * Glassmorphism AVANZADO (backdrop-filter, blur, transparency)
     * Neumorphism en MUCHOS elementos
     * Gradientes COMPLEJOS y ANIMADOS (linear, radial, conic)
     * Sombras multicapa (4-6 niveles de profundidad)
     * Efectos hover 3D (transform 3d, perspective, rotateX/Y)
     * Clip-path animations
     * Filter effects (hue-rotate, saturate, brightness)
     * Mix-blend-mode effects
   
   - Grid MEGA COMPLEJO en TODAS las secciones
   - Flexbox SUPER AVANZADO
   
   - Media queries ULTRA DETALLADAS:
     * 320px, 360px, 375px, 414px (mobile small/medium)
     * 480px, 576px, 640px (mobile large/phablet)
     * 768px, 834px, 992px (tablet portrait/landscape)
     * 1024px, 1200px, 1280px (laptop/desktop small)
     * 1440px, 1600px, 1920px (desktop medium/large)
     * 2560px, 3840px (4K/8K)
   
   - Hover/Focus/Active states en ABSOLUTAMENTE TODO
   - Dark mode COMPLETO con transiciones suaves
   - Multiple color themes
   - Print styles
   - Reduced motion support
   - High contrast mode
   - Loading screens y skeletons
   - Scroll-driven animations
   - Container queries
   - Comentarios CSS MEGA DETALLADOS
   - MÍNIMO 1800-2800 LÍNEAS DE CSS

3. **JavaScript (18% del código)**: CÓDIGO JAVASCRIPT ÉPICO
   
   🎯 NAVEGACIÓN AVANZADA:
     * Smooth scroll con easing personalizado
     * Scroll spy con highlighting dinámico
     * Sticky header con shrink effect
     * Mobile menu COMPLETO con overlay y animaciones
     * Mega menu para desktop
     * Breadcrumbs dinámicos
   
   🎯 ANIMACIONES SCROLL MASIVAS:
     * Intersection Observer para TODAS las secciones
     * Fade, slide, zoom, rotate variations
     * Stagger animations (elementos uno por uno)
     * Progress indicators
     * Parallax scrolling avanzado
     * Scroll-triggered timelines
   
   🎯 CARRUSELES/SLIDERS PROFESIONALES:
     * Testimonials slider (auto-play, pausa on hover, dots, arrows)
     * Portfolio gallery slider (thumbnails, lightbox)
     * Hero carousel con transiciones
     * Logo carousel infinite loop
     * Card carousel touch-enabled
   
   🎯 MODALES Y POPUPS COMPLETOS:
     * Image lightbox con zoom y navegación
     * Video modal responsive
     * Form modal con validación
     * Confirmation/Alert modals
     * Cookie consent banner
     * Exit-intent popup
   
   🎯 FORMULARIOS AVANZADOS:
     * Validación en tiempo real para TODOS los campos
     * Error/Success messages dinámicos
     * Field masking (teléfono, tarjeta, etc)
     * Auto-complete y suggestions
     * File upload con preview
     * Multi-step forms con progress
     * AJAX submission con loading states
   
   🎯 INTERACTIVIDAD MASIVA:
     * Filtrado avanzado (multi-categoría, tags)
     * Búsqueda en vivo con highlighting
     * Tabs system complejo con deep linking
     * Accordion con animaciones suaves
     * Tooltips dinámicos
     * Dropdown menus multi-nivel
     * Drag & drop si aplicable
     * Copy to clipboard
     * Share functionality (social, email, link)
   
   🎯 CONTADORES Y STATS:
     * Números animados con easing
     * Progress bars animadas
     * Circular progress indicators
     * Charts básicos con animaciones
   
   🎯 MANEJO DE DATOS:
     * localStorage para preferencias
     * sessionStorage para estado temporal
     * Cookies para configuración
     * JSON data handling
   
   🎯 EFECTOS ESPECIALES:
     * Typed text effect
     * Particles.js o canvas background
     * Tilt effect en cards
     * Infinite scroll pagination
     * Lazy loading progresivo
     * Image comparison slider
   
   🎯 SISTEMA DE TEMAS:
     * Dark/Light mode toggle con transición
     * Theme persistence
     * System preference detection
     * Multiple color themes
   
   🎯 UTILIDADES:
     * Back to top con smooth scroll
     * Reading progress bar
     * Loading screen profesional
     * Preloader con porcentaje
     * Toast notifications system
     * Cookie banner con preferencias
     * Print preparation
   
   🎯 PERFORMANCE Y OPTIMIZACIÓN:
     * Debounce y throttle functions
     * Lazy loading images/components
     * Code splitting virtual
     * Error handling robusto
     * Try-catch en todo
     * Fallbacks para features no soportadas
   
   - Event listeners organizados y optimizados
   - Funciones helper reutilizables
   - Código modular (IIFE o módulos)
   - Namespace para evitar conflictos
   - Comentarios MEGA DETALLADOS
   - MÍNIMO 1000-1800 LÍNEAS DE JAVASCRIPT

🎯 OBJETIVO FINAL - LA OBRA MAESTRA:
📊 MÍNIMO 3800-6200 LÍNEAS TOTALES DE CÓDIGO
🏗️ HTML ultra estructurado con 15-20 secciones completas
🎨 CSS épico con 25-40 animaciones y efectos visuales masivos
⚡ JavaScript repleto con 40-60 funciones avanzadas
📝 MILES de líneas de comentarios explicativos en español
🌟 La página web MÁS COMPLETA, IMPRESIONANTE y FUNCIONAL del universo

⚡⚡⚡ MANDATO ABSOLUTO:
✅ USA TODO EL LÍMITE DE 150,000 TOKENS
✅ HAZ QUE SEA 4X MÁS GRANDE que el modo corto
✅ AGREGA TODO lo que puedas imaginar
✅ Cada sección MEGA detallada con subsecciones
✅ LLENA TODO de animaciones, efectos y funciones
✅ NO DEJES NADA SIN COMENTAR
✅ Haz que sea la página más IMPRESIONANTE del mundo
`;
        default:
            return '';
    }
}

function setupEventListeners() {
    elements.menuBtn.addEventListener('click', openSidebar);
    elements.closeSidebarBtn.addEventListener('click', closeSidebar);
    elements.overlay.addEventListener('click', closeSidebar);
    elements.newChatBtn.addEventListener('click', () => createNewChat());

    // Botón de modo de respuesta
    const responseModeBtn = document.getElementById('responseModeBtn');
    if (responseModeBtn) {
        responseModeBtn.addEventListener('click', toggleResponseMode);
        updateResponseModeIcon(); // Inicializar icono
    }

    elements.messageInput.addEventListener('input', () => {
        adjustTextareaHeight();
        handleInputChange();
    });
    elements.messageInput.addEventListener('keydown', handleKeyDown);
    elements.sendBtn.addEventListener('click', sendMessage);



    elements.suggestions.addEventListener('click', handleSuggestionClick);

    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', closePreview);
    }
    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener('click', downloadCode);
    }
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', shareCode);
    }
    if (elements.fullscreenBtn) {
        elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    if (elements.fullscreenBackBtn) {
        elements.fullscreenBackBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Listener para detectar salida del fullscreen (ESC key)
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            // Se salió del fullscreen
            elements.previewModal.classList.remove('fullscreen');
            elements.fullscreenBackBtn.style.display = 'none';
            // Cambiar ícono a pantalla completa
            elements.fullscreenBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                </svg>
            `;
            elements.fullscreenBtn.title = 'Pantalla completa';
        }
    });
    // --- NUEVO: Copiar código en escritorio ---
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (!window.currentCode) return;
            try {
                await navigator.clipboard.writeText(window.currentCode);
                copyBtn.innerHTML = '✔️';
                setTimeout(() => {
                    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>`;
                }, 1200);
            } catch (e) {
                alert('No se pudo copiar el código');
            }
        });
    }

    // --- NUEVO: Botón de editar código (integrado) ---
    const editCodeBtn = document.getElementById('editCodeBtn');
    const codeEditorPanel = document.getElementById('codeEditorPanel');
    const codeEditorTextarea = document.getElementById('codeEditorTextarea');
    const applyChangesBtn = document.getElementById('applyChangesBtn');
    const closeEditorBtn = document.getElementById('closeEditorBtn');
    const previewFrame = document.getElementById('previewFrame');
    
    if (editCodeBtn && codeEditorPanel) {
        editCodeBtn.addEventListener('click', () => {
            if (!window.currentCode) return;
            
            // Mostrar el editor
            codeEditorPanel.style.display = 'flex';
            
            // NUEVO: Cargar versión guardada si existe
            const savedCode = window.currentCodeId ? localStorage.getItem('edited_code_' + window.currentCodeId) : null;
            codeEditorTextarea.value = savedCode || window.currentCode;
            
            // En móvil, ocultar el iframe
            if (window.innerWidth <= 768) {
                previewFrame.classList.add('editor-open');
            }
        });
    }
    
    // Aplicar cambios del editor
    if (applyChangesBtn) {
        applyChangesBtn.addEventListener('click', () => {
            const newCode = codeEditorTextarea.value;
            window.currentCode = newCode;
            
            // Actualizar el iframe con el nuevo código
            const frame = document.getElementById('previewFrame');
            if (frame) {
                frame.srcdoc = newCode;
            }
            
            // NUEVO: Guardar en localStorage para persistencia
            if (window.currentCodeId) {
                try {
                    localStorage.setItem('edited_code_' + window.currentCodeId, newCode);
                    console.log('💾 Cambios guardados en memoria');
                } catch (e) {
                    console.error('Error al guardar en localStorage:', e);
                }
            }
            
            // Notificar al usuario
            applyChangesBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ✓ Guardado`;
            setTimeout(() => {
                applyChangesBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Aplicar`;
            }, 2000);
        });
    }
    
    // Cerrar editor
    if (closeEditorBtn) {
        closeEditorBtn.addEventListener('click', () => {
            codeEditorPanel.style.display = 'none';
            previewFrame.classList.remove('editor-open');
        });
    }

    // --- NUEVO: Menú móvil de vista previa ---
    const previewMenuBtn = document.getElementById('previewMenuBtn');
    const previewMenu = document.getElementById('previewMenu');
    
    if (previewMenuBtn && previewMenu) {
        previewMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            previewMenu.style.display = previewMenu.style.display === 'none' ? 'block' : 'none';
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!previewMenu.contains(e.target) && !previewMenuBtn.contains(e.target)) {
                previewMenu.style.display = 'none';
            }
        });
    }

    // --- NUEVO: Botones del menú móvil (solo Ver/Editar y Compartir) ---
    const mobileEditCodeBtn = document.getElementById('mobileEditCodeBtn');
    const mobileShareBtn = document.getElementById('mobileShareBtn');

    if (mobileEditCodeBtn) {
        mobileEditCodeBtn.addEventListener('click', () => {
            if (previewMenu) previewMenu.style.display = 'none';
            if (editCodeBtn) editCodeBtn.click();
        });
    }

    if (mobileShareBtn) {
        mobileShareBtn.addEventListener('click', () => {
            if (previewMenu) previewMenu.style.display = 'none';
            if (elements.shareBtn) elements.shareBtn.click();
        });
    }

    const userInfoBtn = document.getElementById('userInfoBtn');
    const userInfoModal = document.getElementById('userInfoModal');
    const closeUserInfoModal = document.getElementById('closeUserInfoModal');
    const userInfoForm = document.getElementById('userInfoForm');

    if (userInfoBtn) {
        userInfoBtn.addEventListener('click', () => {
            showUserInfoModal();
        });
    }
    if (closeUserInfoModal) {
        closeUserInfoModal.addEventListener('click', () => {
            hideUserInfoModal();
        });
    }
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserInfo();
            hideUserInfoModal();
            updateAiConfigBtnVisibility();
        });
    }

    const aiConfigBtn = document.getElementById('aiConfigBtn');
    const aiConfigModal = document.getElementById('aiConfigModal');
    const closeAiConfigModal = document.getElementById('closeAiConfigModal');
    const closeAiConfigModalX = document.getElementById('closeAiConfigModalX');
    const aiConfigOverlay = document.getElementById('aiConfigOverlay');
    const aiConfigForm = document.getElementById('aiConfigForm');
    const addAiBtn = document.getElementById('addAiBtn');

    if (aiConfigBtn) {
        aiConfigBtn.addEventListener('click', () => {
            loadUserInfo();
            showAiConfigModal();
        });
    }
    if (closeAiConfigModal) {
        closeAiConfigModal.addEventListener('click', hideAiConfigModal);
    }
    if (closeAiConfigModalX) {
        closeAiConfigModalX.addEventListener('click', hideAiConfigModal);
    }
    if (aiConfigOverlay) {
        aiConfigOverlay.addEventListener('click', hideAiConfigModal);
    }
    if (aiConfigForm) {
        aiConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAiConfigsFromForm();
            hideAiConfigModal();
        });
    }
    if (addAiBtn) {
        addAiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addAiConfig();
            renderAiConfigList();
        });
    }

    // Botón para cambiar modelo (abre modal de configuración) - INACTIVO
    // const modelChangeBtn = document.getElementById('modelChangeBtn');
    // if (modelChangeBtn) {
    //     modelChangeBtn.addEventListener('click', showSimpleConfigModal);
    // }

    // Event listeners para menú de habilidades (modos)
    const abilitiesMenuBtn = document.getElementById('abilitiesMenuBtn');
    const abilitiesMenu = document.getElementById('abilitiesMenu');
    
    if (abilitiesMenuBtn && abilitiesMenu) {
        abilitiesMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = abilitiesMenu.style.display === 'flex';
            abilitiesMenu.style.display = isVisible ? 'none' : 'flex';
            abilitiesMenuBtn.classList.toggle('active', !isVisible);
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!abilitiesMenu.contains(e.target) && !abilitiesMenuBtn.contains(e.target)) {
                abilitiesMenu.style.display = 'none';
                abilitiesMenuBtn.classList.remove('active');
            }
        });

        // Opciones del menú
        const abilityOptions = abilitiesMenu.querySelectorAll('.ability-option');
        abilityOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const ability = option.dataset.ability;
                applyAbility(ability);
                abilitiesMenu.style.display = 'none';
                abilitiesMenuBtn.classList.remove('active');
            });
        });
    }

    // Atajos de teclado desactivados para cambiar modo
    // Los usuarios pueden usar el dropdown de la izquierda para cambiar de modo
}


// Función para cargar el modo activo guardado
function loadActiveAbility() {
    // Cargar desde localStorage o usar 'agent' por defecto
    const savedAbility = localStorage.getItem('devCenter_activeAbility');
    activeAbility = savedAbility || 'agent';
    
    // Actualizar icono del botón
    updateModeIcon(activeAbility);
    
    // Activar visualmente la opción correspondiente
    const abilityOptions = document.querySelectorAll('.ability-option');
    abilityOptions.forEach(option => {
        if (option.dataset.ability === activeAbility) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Actualizar color de los tres puntitos según el modo
    const abilitiesMenuBtn = document.getElementById('abilitiesMenuBtn');
    if (abilitiesMenuBtn) {
        // Remover todas las clases de modo anteriores
        abilitiesMenuBtn.classList.remove('mode-agent', 'mode-info', 'mode-memory', 'mode-program');
        
        // Agregar la clase del modo actual para cambiar el color de los puntitos
        abilitiesMenuBtn.classList.add(`mode-${activeAbility}`);
    }
}

// Función para aplicar habilidades especiales
function updateModeIcon(ability) {
    // Buscar específicamente el SVG dentro del botón de abilities (en el input-container)
    const abilitiesMenuBtn = document.getElementById('abilitiesMenuBtn');
    const modeIcon = abilitiesMenuBtn ? abilitiesMenuBtn.querySelector('.mode-icon') : null;
    if (!modeIcon) return;
    
    // Iconos SVG para cada modo
    const icons = {
        agent: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
        info: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="13" x2="13" y2="13"/>',
        memory: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="13" cy="10" r="1" fill="currentColor"/><path d="M9 13.5s.8 1.5 2 1.5 2-1.5 2-1.5"/>',
        program: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="5" x2="12" y2="19" stroke-dasharray="2 2"/>'
    };
    
    // Asegurar atributos correctos para iconos stroke-based
    modeIcon.setAttribute('stroke-width', '1.75');
    modeIcon.setAttribute('stroke-linecap', 'round');
    modeIcon.setAttribute('stroke-linejoin', 'round');
    
    // Actualizar el contenido del SVG
    modeIcon.innerHTML = icons[ability] || icons.agent;
}

function applyAbility(ability) {
    // Cambiar el modo activo
    activeAbility = ability;
    
    // Actualizar icono del botón
    updateModeIcon(ability);
    
    // Actualizar estilos visuales
    const abilityOptions = document.querySelectorAll('.ability-option');
    abilityOptions.forEach(option => {
        if (option.dataset.ability === ability) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Actualizar color de los tres puntitos según el modo
    const abilitiesMenuBtn = document.getElementById('abilitiesMenuBtn');
    if (abilitiesMenuBtn) {
        // Remover todas las clases de modo anteriores
        abilitiesMenuBtn.classList.remove('mode-agent', 'mode-info', 'mode-memory', 'mode-program');
        
        // Agregar la clase del modo actual para cambiar el color de los puntitos
        abilitiesMenuBtn.classList.add(`mode-${ability}`);
    }
    
    // Guardar en localStorage
    localStorage.setItem('devCenter_activeAbility', ability);
}

// Notificaciones desactivadas por solicitud del usuario
function showModeChangeNotification(mode) {
    // Función desactivada - no mostrar notificaciones
    return;
}

// Función para obtener el prompt adicional según el modo activo
// 📋 MODO INFO: Notas + Información general (sin historial extendido)
// 🧠 MODO MEMORY: Notas + Análisis de historial de los últimos 5 chats + Información general
// 💻 MODO PROGRAM: Notas + Generación de código avanzada (sin historial extendido)
async function getActiveAbilityPrompt() {
    let additionalPrompt = '';
    
    try {
        switch(activeAbility) {
            case 'info':
                // MODO INFORMACIÓN: Solo información general de DevCenter
                // Incluye: Notas guardadas (se agregan automáticamente en el prompt principal)
                additionalPrompt = `[INSTRUCCIONES PARA MODO INFORMACIÓN:

Eres DevCenter, un asistente de información amigable y útil. Tu personalidad es:

- Amigable y accesible: Usa un tono conversacional, como si estuvieras charlando con un amigo
- Paciente y comprensivo: Nunca te impacientes, explica las cosas de manera clara
- Conocedor pero no arrogante: Comparte información precisa sin sonar pedante
- Adaptable: Ajusta tu nivel de detalle según el usuario (principiantes vs avanzados)
- Útil: Siempre busca formas de ayudar, incluso si la pregunta no es directa

COMPORTAMIENTO GENERAL:
- Responde en español a menos que el usuario pregunte específicamente en otro idioma
- Mantén respuestas concisas pero completas - no divagues
- Si no sabes algo, admítelo honestamente en lugar de inventar información
- Ofrece alternativas o sugerencias cuando sea apropiado
- Usa emojis ocasionalmente para hacer las respuestas más amigables (sin exagerar)

ESTRUCTURA DE RESPUESTAS:
- Para preguntas simples: Respuesta directa + explicación breve si es necesario
- Para preguntas complejas: Divide en secciones con encabezados claros
- Para tutoriales: Usa numeración o viñetas para pasos
- Para comparaciones: Usa tablas o listas paralelas cuando ayude

LIMITACIONES:
- No generes código a menos que sea específicamente solicitado
- No des consejos médicos, legales o financieros sin disclaimers claros
- No promuevas actividades ilegales o dañinas
- Mantén la neutralidad política y religiosa

INFORMACIÓN SOBRE DEVCENTER:
DevCenter es una plataforma integral de desarrollo que incluye:
- Chat inteligente con múltiples modos especializados
- Generador de aplicaciones web
- Herramientas de desarrollo colaborativo
- Sistema de gestión de proyectos
- Comunidad de desarrolladores

El usuario puede acceder a diferentes modos según sus necesidades:
- Modo Normal: Conversaciones generales
- Modo Información: Preguntas y respuestas (este modo)
- Modo Memoria: Análisis con contexto histórico
- Modo Programador: Desarrollo de código y aplicaciones

]\n\n`;
                break;
                
            case 'memory':
                // MODO MEMORIA EXTENDIDA: Análisis profundo con historial de conversaciones
                // Incluye: Notas guardadas + Historial de últimos 5 chats + Información general
                
                // Agregar historial de últimos 5 chats para análisis profundo
                const last5Chats = chats.slice(-5);
                if (last5Chats.length > 0) {
                    additionalPrompt = `[INSTRUCCIONES PARA MODO MEMORIA EXTENDIDA:

Eres DevCenter en modo Memoria Extendida, un analista inteligente que puede recordar y analizar conversaciones anteriores para proporcionar respuestas más contextuales y personalizadas.

CAPACIDADES ESPECIALES:
- Acceso completo al historial de conversaciones del usuario
- Análisis de patrones en preguntas y respuestas anteriores
- Recordar preferencias y contexto de conversaciones pasadas
- Proporcionar respuestas continuas basadas en interacciones previas
- Identificar temas recurrentes y conexiones entre conversaciones

COMPORTAMIENTO:
- Siempre menciona cuando estás usando información de conversaciones anteriores
- Explica cómo el contexto histórico mejora tu respuesta
- Mantén la coherencia con respuestas anteriores sobre los mismos temas
- Si hay contradicciones en el historial, acláralas y pregunta por confirmación
- Resume conversaciones largas para mantener el foco

ANÁLISIS DE HISTORIAL:
- Identifica patrones de aprendizaje del usuario
- Recuerda proyectos o temas de interés recurrentes
- Nota cambios en el nivel de conocimiento o experiencia
- Sugiere conexiones entre diferentes conversaciones
- Mantén la privacidad y confidencialidad de la información

ESTRUCTURA DE RESPUESTAS:
- Comienza mencionando el contexto histórico relevante
- Explica cómo usas la memoria para mejorar la respuesta
- Proporciona la información solicitada
- Ofrece insights basados en patrones identificados

LIMITACIONES:
- No reveles información sensible de conversaciones anteriores sin permiso
- Mantén el foco en el tema actual mientras usas contexto histórico
- Si el historial es limitado, no inventes conexiones que no existen

]\n\n[HISTORIAL DE ÚLTIMOS 5 CHATS]:\n`;
                    last5Chats.forEach((chat, index) => {
                        additionalPrompt += `\n--- Chat ${index + 1}: ${chat.name} ---\n`;
                        if (chat.messages && chat.messages.length > 0) {
                            chat.messages.forEach(msg => {
                                if (msg.type === 'user') {
                                    additionalPrompt += `Usuario: ${msg.content}\n`;
                                } else if (msg.type === 'ai') {
                                    additionalPrompt += `DevCenter: ${msg.content}\n`;
                                }
                            });
                        }
                    });
                    additionalPrompt += '\n[FIN DEL HISTORIAL]\n\n';
                } else {
                    additionalPrompt = `[INSTRUCCIONES PARA MODO MEMORIA EXTENDIDA:

Eres DevCenter en modo Memoria Extendida, un analista inteligente que puede recordar y analizar conversaciones anteriores.

CAPACIDADES ESPECIALES:
- Acceso completo al historial de conversaciones del usuario
- Análisis de patrones en preguntas y respuestas anteriores
- Recordar preferencias y contexto de conversaciones pasadas
- Proporcionar respuestas continuas basadas en interacciones previas

COMPORTAMIENTO:
- Siempre menciona cuando estás usando información de conversaciones anteriores
- Explica cómo el contexto histórico mejora tu respuesta
- Mantén la coherencia con respuestas anteriores sobre los mismos temas

]\n[No hay historial de chats previos]\n\n`;
                }
                break;
                
            case 'program':
                // MODO PROGRAMADOR: Generación de código y páginas web avanzadas
                // Incluye: Notas guardadas (se agregan automáticamente en el prompt principal)
                // NO incluye: Historial extendido (para mantener el foco en la programación)
                additionalPrompt = `[INSTRUCCIONES PARA MODO PROGRAMADOR:

Eres DevCenter, un desarrollador web experto y mentor de programación. Tu especialidad es crear aplicaciones web modernas, funcionales y bien estructuradas.

CAPACIDADES TÉCNICAS:
- Desarrollo full-stack: HTML, CSS, JavaScript, frameworks modernos
- Diseño responsive y accesible
- Optimización de rendimiento y mejores prácticas
- Integración de APIs y servicios externos
- Desarrollo de componentes reutilizables
- Manejo de estado y lógica de negocio

ESTÁNDARES DE CÓDIGO:
- Código limpio, legible y bien comentado
- Nombres descriptivos para variables y funciones
- Estructura modular y organizada
- Validación de HTML y accesibilidad
- Compatibilidad cross-browser
- Optimización para móviles

FRAMEWORKS Y HERRAMIENTAS:
- HTML5 semántico
- CSS3 con Grid y Flexbox
- JavaScript ES6+ (async/await, módulos, etc.)
- Frameworks: React, Vue, Angular (según necesidad)
- Preprocesadores: Sass/SCSS cuando sea beneficioso
- Herramientas de build: Webpack, Vite, etc.

PROCESO DE DESARROLLO:
1. ANÁLISIS: Entender los requisitos y alcance
2. PLANIFICACIÓN: Arquitectura y componentes necesarios
3. DESARROLLO: Código funcional con mejores prácticas
4. OPTIMIZACIÓN: Rendimiento, accesibilidad, SEO
5. TESTING: Validación en diferentes dispositivos/navegadores

REQUISITOS PARA SVG:
- Los SVG deben ser inline en el HTML
- Incluir atributos aria-label para accesibilidad
- Optimizar eliminando metadata innecesaria
- Usar viewBox para escalabilidad
- Colores consistentes con el tema de la aplicación

ESTRUCTURA DE RESPUESTAS:
- Explica el enfoque antes de mostrar código
- Proporciona código completo y funcional
- Incluye comentarios explicativos
- Sugiere mejoras o extensiones
- Menciona dependencias o requisitos

LIMITACIONES:
- No generes código malicioso o inseguro
- Siempre prioriza la seguridad y mejores prácticas
- Evita código obsoleto o deprecated
- Mantén la simplicidad cuando sea posible

]\n\n`;
                break;
        }
    } catch (error) {
        console.error('Error al procesar prompt:', error);
    }
    
    return additionalPrompt;
}

// --- IA Configuración: almacenamiento y UI ---
function loadAiConfigs() {
    try {
        const data = localStorage.getItem('devCenter_aiConfigs');
        aiConfigs = data ? JSON.parse(data) : [];

        // Agregar modelos específicos por modo si no están ya incluidos
        Object.entries(MODE_SPECIFIC_MODELS).forEach(([modeKey, modeModel]) => {
            const modelId = `mode-${modeKey}`;
            const exists = aiConfigs.some(ai => ai.id === modelId);
            if (!exists) {
                // Crear el modelo completo con id y name generados
                const completeModel = {
                    id: modelId,
                    name: `Modo ${modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}`,
                    ...modeModel
                };
                aiConfigs.push(completeModel);
            }
        });

        // Si no hay configuraciones, inicializar con modelos específicos
        if (!aiConfigs.length) {
            Object.entries(MODE_SPECIFIC_MODELS).forEach(([modeKey, modeModel]) => {
                const completeModel = {
                    id: `mode-${modeKey}`,
                    name: `Modo ${modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}`,
                    ...modeModel
                };
                aiConfigs.push(completeModel);
            });
        }

        selectedAiId = localStorage.getItem('devCenter_selectedAiId') || aiConfigs[0]?.id;
    } catch (e) {
        // En caso de error, inicializar con modelos específicos por modo
        aiConfigs = [];
        Object.entries(MODE_SPECIFIC_MODELS).forEach(([modeKey, modeModel]) => {
            const completeModel = {
                id: `mode-${modeKey}`,
                name: `Modo ${modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}`,
                ...modeModel
            };
            aiConfigs.push(completeModel);
        });
        selectedAiId = aiConfigs[0]?.id;
    }
}

function saveAiConfigs() {
    localStorage.setItem('devCenter_aiConfigs', JSON.stringify(aiConfigs));
    localStorage.setItem('devCenter_selectedAiId', selectedAiId);
}

function showAiConfigModal() {
    renderAiConfigList();
    renderAiConfigTypeSelector();
    renderAiConfigPanelByType();
    const modal = document.getElementById('aiConfigModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.focus && modal.focus();
    }
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
}
function hideAiConfigModal() {
    const modal = document.getElementById('aiConfigModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

function renderAiConfigList() {
    const container = document.getElementById('aiListContainer');
    if (!container) return;
    container.innerHTML = '';
    aiConfigs.forEach((ai, idx) => {
        const div = document.createElement('div');
        div.className = 'ai-item' + (ai.id === selectedAiId ? ' selected' : '');
        // Mostrar la API key oculta (solo los primeros 5 caracteres)
        const maskedKey = ai.apiKey
            ? ai.apiKey.slice(0, 5) + '*'.repeat(Math.max(0, ai.apiKey.length - 5))
            : '';
        // Generar información de limites si está disponible
        const limitsInfo = (ai.rpm || ai.tpm || ai.rpd) ?
            `<div class="ai-limits">
                <small>
                    ${ai.rpm ? `RPM: ${ai.rpm}` : ''} 
                    ${ai.tpm ? `• TPM: ${ai.tpm.toLocaleString()}` : ''} 
                    ${ai.rpd ? `• RPD: ${ai.rpd}` : ''}
                </small>
            </div>` : '';

        // Descripción desactivada por preferencia del usuario
        // const descriptionInfo = ai.description ?
        //     `<div class="ai-description">
        //         <small>${escapeHtml(ai.description)}</small>
        //     </div>` : '';
        const descriptionInfo = '';

        // Capacidades desactivadas por preferencia del usuario
        // const capabilitiesInfo = ai.capabilities && ai.capabilities.length > 0 ?
        //     `<div class="ai-capabilities">
        //         <small><strong>Capacidades:</strong> ${ai.capabilities.map(cap => `<span class="capability-tag">${escapeHtml(cap)}</span>`).join('')}</small>
        //     </div>` : '';

        div.innerHTML = `
            <div class="ai-item-header">
                <span class="ai-item-title">${escapeHtml(ai.name)}</span>
                <input type="radio" name="selectedAi" class="ai-item-select" value="${ai.id}" ${ai.id === selectedAiId ? 'checked' : ''} title="Seleccionar IA">
                <button type="button" class="ai-item-remove" data-idx="${idx}" title="Eliminar IA" ${aiConfigs.length === 1 ? 'disabled' : ''}>✕</button>
            </div>
            ${limitsInfo}
            ${descriptionInfo}
            <label>Nombre:
                <input type="text" class="ai-name" value="${escapeHtml(ai.name)}" data-idx="${idx}" autocomplete="off">
            </label>
            <label>URL:
                <input type="text" class="ai-url" value="${escapeHtml(ai.url)}" data-idx="${idx}" autocomplete="off">
            </label>
            <label>API Key:
                <input type="text" class="ai-key" value="${maskedKey}" data-idx="${idx}" autocomplete="off" readonly style="background:var(--bg-primary);cursor:pointer;">
            </label>
        `;
        container.appendChild(div);

        // Mostrar la API key oculta SIEMPRE, incluso al editar (no mostrar el valor real nunca)
        const keyInput = div.querySelector('.ai-key');
        if (keyInput) {
            keyInput.addEventListener('focus', function () {
                // No mostrar la real, solo permitir editar (campo vacío)
                keyInput.readOnly = false;
                keyInput.value = '';
            });
            keyInput.addEventListener('blur', function () {
                keyInput.readOnly = true;
                keyInput.value = ai.apiKey
                    ? ai.apiKey.slice(0, 5) + '*'.repeat(Math.max(0, ai.apiKey.length - 5))
                    : '';
            });
            // Al editar, guardar el valor ingresado como nueva apiKey
            keyInput.addEventListener('input', function () {
                aiConfigs[idx].apiKey = keyInput.value;
            });
        }
    });

    // Selección de IA
    container.querySelectorAll('.ai-item-select').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedAiId = e.target.value;
            renderAiConfigList();
        });
    });
    // Eliminar IA
    container.querySelectorAll('.ai-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (aiConfigs.length > 1) {
                if (aiConfigs[idx].id === selectedAiId) {
                    aiConfigs.splice(idx, 1);
                    selectedAiId = aiConfigs[0].id;
                } else {
                    aiConfigs.splice(idx, 1);
                }
                renderAiConfigList();
            }
        });
    });
    // Edición en vivo
    container.querySelectorAll('.ai-name').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(input.dataset.idx, 10);
            aiConfigs[idx].name = input.value;
        });
    });
    container.querySelectorAll('.ai-url').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(input.dataset.idx, 10);
            aiConfigs[idx].url = input.value;
        });
    });
}

function addAiConfig() {
    const newId = generateId();
    aiConfigs.push({
        id: newId,
        name: 'Nueva IA',
        url: '',
        apiKey: ''
    });
    selectedAiId = newId;
}

function saveAiConfigsFromForm() {
    // Ya se actualizan en vivo, solo guardar
    saveAiConfigs();
}

// --- FIN configuración IA ---

function loadChats() {
    try {
        const savedChats = localStorage.getItem('devCenter_chats');
        chats = savedChats ? JSON.parse(savedChats) : [];
        if (chats.length === 0) {
            createNewChat('Nuevo Chat');
        } else {
            if (!currentChatId || !chats.some(c => c.id === currentChatId)) {
                currentChatId = chats[0].id;
            }
            renderSidebar();
            loadCurrentChat();
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        chats = [];
        createNewChat('Nuevo Chat');
    }
}

function saveChats() {
    try {
        localStorage.setItem('devCenter_chats', JSON.stringify(chats));
    } catch (error) {
        console.error('Error saving chats:', error);
    }
}

function createNewChat(name = null) {
    const chatName = name || `Chat ${chats.length + 1}`;
    const newChat = {
        id: generateId(),
        name: chatName,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    chats.unshift(newChat);
    currentChatId = newChat.id;
    saveChats();
    renderSidebar();
    loadCurrentChat();
    closeSidebar();
}

function deleteChat(chatId) {
    if (chats.length <= 1) {
        alert('No puedes eliminar el último chat');
        return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
        const idx = chats.findIndex(c => c.id === chatId);
        chats = chats.filter(chat => chat.id !== chatId);
        // Corrige la selección del siguiente chat
        if (currentChatId === chatId) {
            if (chats[idx]) {
                currentChatId = chats[idx].id;
            } else if (chats[0]) {
                currentChatId = chats[0].id;
            } else {
                currentChatId = null;
            }
            loadCurrentChat();
        }
        saveChats();
        renderSidebar();
    }
}

function renameChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const newName = prompt('Nuevo nombre para el chat:', chat.name);
    if (newName && newName.trim() !== '') {
        chat.name = newName.trim();
        chat.updatedAt = new Date().toISOString();
        saveChats();
        renderSidebar();
    }
}

function switchChat(chatId) {
    if (currentChatId === chatId) return;
    currentChatId = chatId;
    loadCurrentChat();
    closeSidebar();
}

function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
}

function updateCurrentChat(updates) {
    const chat = getCurrentChat();
    if (chat) {
        Object.assign(chat, updates);
        chat.updatedAt = new Date().toISOString();
        saveChats();
    }
}

// Renderizado
function renderSidebar() {
    if (chats.length === 0) {
        elements.sidebarContent.innerHTML = `
            <div class="no-chats">
                <p>No hay chats aún</p>
                <small>Crea un nuevo chat para empezar</small>
            </div>
        `;
        return;
    }
    const chatItems = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        const date = new Date(chat.updatedAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
        return `
            <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="chat-item-content">
                    <div class="chat-item-name">${escapeHtml(chat.name)}</div>
                    <div class="chat-item-date">${date}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn" onclick="renameChat('${chat.id}')" title="Renombrar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="chat-action-btn" onclick="deleteChat('${chat.id}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0,0,1-2,2H7a2,2 0,0,1-2-2V6m3,0V4a2,2 0,0,1,2-2h4a2,2 0,0,1,2,2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    elements.sidebarContent.innerHTML = chatItems;
    elements.sidebarContent.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-action-btn')) {
                const chatId = item.dataset.chatId;
                switchChat(chatId);
            }
        });
    });
}

function loadCurrentChat() {
    const chat = getCurrentChat();
    if (!chat) return;
    clearMessages();
    if (chat.messages.length === 0) {
        showWelcomeMessage();
    } else {
        chat.messages.forEach(message => {
            if (message.type !== 'image') {
                addMessage(message.type, message.content, message.generatedCode, false, message.id, message.timestamp, null, message.aiModel, message.mode);
            }
        });
        scrollToBottom();
    }
}

function clearMessages() {
    elements.messages.innerHTML = '';
}

function showWelcomeMessage() {
    // Diferentes saludos
    const greetings = [
        "¡Hola! Soy DevCenter",
        "¡Bienvenido! Soy DevCenter",
        "¡Hey! Aquí DevCenter",
        "¡Saludos! Soy DevCenter",
        "¡Hola de nuevo! DevCenter aquí",
        "¡Qué tal! Soy DevCenter",
        "¡Un placer verte! Soy DevCenter",
        "¡Buenas! DevCenter por aquí",
        "¡Qué hay! Soy DevCenter",
        "¡Encantado! Aquí DevCenter",
        "¡Hola mundo! Soy DevCenter",
        "¡Presente! DevCenter a tu servicio",
        "¡Ey! DevCenter listo para ayudar",
        "¡Genial verte! Soy DevCenter",
        "¡Al fin! DevCenter reportándose",
        "¡Aquí estoy! DevCenter disponible",
        "¡Buenas vibras! Soy DevCenter",
        "¡Qué onda! Soy DevCenter",
        "¡Epa! DevCenter conectado",
        "¡Te estaba esperando! Soy DevCenter",
        "¡Perfecto timing! DevCenter aquí",
        "¡Arrancamos! Soy DevCenter",
        "¡Listo para crear! DevCenter disponible",
        "¡A trabajar! Aquí DevCenter"
    ];
    
    // Diferentes descripciones
    const descriptions = [
        "Tu asistente de IA. Puedo ayudarte a crear páginas web increíbles o responder tus preguntas.",
        "Estoy aquí para ayudarte. Pregúntame lo que quieras o pídeme que genere una página web.",
        "Tu compañero de desarrollo web. Puedo chatear contigo o crear sitios web completos.",
        "Asistente IA a tu servicio. Chatea conmigo o solicita que genere código web profesional.",
        "Listo para ayudarte. Puedes preguntarme cualquier cosa o pedirme que desarrolle una web.",
        "Tu desarrollador IA personal. Conversa conmigo o pídeme crear páginas web a medida.",
        "Aquí para asistirte. Hablemos o generemos juntos una increíble página web.",
        "Especialista en desarrollo web. Pregunta lo que necesites o pídeme crear tu sitio ideal.",
        "Tu aliado digital. Resuelvo dudas o construyo webs personalizadas para ti.",
        "Siempre disponible para ti. Chatea conmigo o solicita el diseño web que imaginas.",
        "Experto IA en webs. Cuéntame tus ideas o pregunta lo que sea, estoy para ayudarte.",
        "A tus órdenes. Puedo conversar sobre cualquier tema o desarrollar sitios web increíbles.",
        "Creador de experiencias web. Platica conmigo o déjame construir tu próxima página.",
        "Tu asistente web favorito. Pregunta, conversa o pídeme generar código HTML/CSS/JS.",
        "Maestro del código web. Consulta dudas o solicita que cree tu proyecto web soñado.",
        "Listo para la acción. Chateemos o creemos juntos una web espectacular.",
        "Programador IA 24/7. Conversa libremente o pídeme diseñar tu sitio perfecto.",
        "Tu socio tecnológico. Hablemos de lo que quieras o generemos páginas web profesionales.",
        "Asistente multitarea. Respondo preguntas o desarrollo sitios web completos al instante.",
        "IA creativa a tu alcance. Charlemos o construyamos la web de tus sueños juntos."
    ];
    
    // Seleccionar textos aleatorios
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    elements.messages.innerHTML = `
        <div class="welcome-message fade-in">
            <div class="welcome-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
            </div>
            <h3>${randomGreeting}</h3>
            <p>${randomDescription}</p>
        </div>
    `;
    
    // Generar solo el icono principal
    setTimeout(() => {
        generateCoolWelcomeIcon();
    }, 100);
}

function addMessage(type, content, generatedCode = null, save = true, messageId = null, timestamp = null, retryData = null, aiModel = null, messageMode = null) {
    messageId = messageId || generateId();
    const timeStr = timestamp
        ? new Date(timestamp).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })
        : new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    // SIEMPRE capturar el modelo y modo para mensajes de IA
    if (type === 'ai') {
        // Si no se proporciona el modelo, intentar obtenerlo de lastUsedAiModel o del AI seleccionado
        if (!aiModel) {
            if (lastUsedAiModel) {
                aiModel = lastUsedAiModel;
            } else {
                // Obtener del AI configurado actualmente
                const selectedAi = aiConfigs.find(ai => ai.id === selectedAiId);
                if (selectedAi) {
                    aiModel = selectedAi.name;
                    lastUsedAiModel = selectedAi.name;
                }
            }
        }
        
        // Si no se proporciona el modo, usar el activeAbility actual
        if (!messageMode) {
            messageMode = activeAbility;
        }
    }
    const messageElement = document.createElement('div');
    
    // Detectar si es un mensaje de carga especial
    const isImageGenerationMessage = type === 'ai' && typeof content === 'string' && 
        (content.includes('Generando descripción de la imagen') || content.includes('Generando imagen'));
    
    messageElement.className = `message ${type} fade-in ${isImageGenerationMessage ? 'image-generation-loading' : ''}`;

    // Detectar mensaje de error IA (ambos tipos)
    let isError = false;
    let retryHtml = '';
    if (
        type === 'ai' &&
        typeof content === 'string' &&
        (content.trim().startsWith('Lo siento, ha ocurrido un error al generar la página web') ||
            content.trim().startsWith('Lo siento, no pude procesar tu solicitud en este momento'))
    ) {
        isError = true;
        // retryData: { prompt }
        const lastUserMsg = retryData && retryData.prompt
            ? retryData.prompt
            : (getCurrentChat()?.messages?.slice().reverse().find(m => m.type === 'user')?.content || '');
        retryHtml = `
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="retry-error-btn" onclick="window.retryGenerateMessage('${messageId}')" title="Intentar nuevamente">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px; margin-right: 6px;">
                        <path d="M1 4v6h6M23 20v-6h-6"></path>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                    Reintentar
                </button>
            </div>
        `;
        // Guardar el prompt original en el DOM para el reintento
        messageElement.dataset.retryPrompt = lastUserMsg;
    }

    // Botones de acción para mensajes de IA
    let actionButtonsHtml = '';
    if (type === 'ai' && !isError) {
        actionButtonsHtml = `
            <div class="message-actions">
                <button class="message-action-btn copy-btn" onclick="copyMessage('${messageId}')" title="Copiar respuesta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="message-action-btn share-btn" onclick="shareMessage('${messageId}')" title="Compartir respuesta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                </button>
                <button class="message-action-btn listen-btn" onclick="listenMessage('${messageId}')" title="Escuchar respuesta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5,6 9,2 9,2 15,6 15,11 19,11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                </button>
                <button class="message-action-btn reload-btn" onclick="reloadMessage('${messageId}')" title="Recargar respuesta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
            </div>
        `;
    }

    // Crear etiqueta de modo para mensajes de IA (solo modo, sin modelo)
    let modeLabel = '';
    if (type === 'ai') {
        // Nombre del modo - siempre mostrar aunque sea desconocido
            const modeNames = {
                'agent': 'Agente',
                'info': 'Información',
                'memory': 'Memoria',
                'program': 'Programador',
                'create_prompt': 'Crear Prompts'
            };
        const modeName = modeNames[messageMode] || modeNames[activeAbility] || 'Agente';
        
        // Solo mostrar modo, sin modelo
        modeLabel = `<span class="mode-badge">${modeName}</span>`;
    }
    
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text">${type === 'ai' ? renderMarkdown(content) : escapeHtml(content)}</div>
            <div class="message-time">${timeStr} ${modeLabel}</div>
            ${actionButtonsHtml}
            ${generatedCode ? `
                <div class="message-preview">
                    <div class="preview-thumbnail">
                        <div class="preview-placeholder">
                            <div class="preview-placeholder-icon"></div>
                            <div class="preview-placeholder-text">Página Web Generada</div>
                        </div>
                    </div>
                    <button class="preview-btn" onclick="showPreview('${messageId}')">
                        Ver Vista Previa
                    </button>
                </div>
            ` : ''}
            ${isError ? retryHtml : ''}
        </div>
    `;
    elements.messages.appendChild(messageElement);
    
    // Detectar comandos especiales si es un mensaje de la IA
    if (type === 'ai' && !isError && save) {
        detectAndModifyPrompt(content);
    }
    
    if (save) {
        const chat = getCurrentChat();
        if (chat) {
            const message = {
                id: messageId,
                type,
                content,
                generatedCode,
                timestamp: timestamp || new Date().toISOString(),
                aiModel: type === 'ai' ? aiModel : undefined,
                mode: type === 'ai' ? messageMode : undefined
            };
            chat.messages.push(message);

            // Limitar mensajes por chat si está configurado
            const maxMsgs = getMaxMessagesPerChat();
            if (chat.messages.length > maxMsgs) {
                chat.messages = chat.messages.slice(chat.messages.length - maxMsgs);
            }

            updateCurrentChat({});
        }
    }
    scrollToBottom();
    return messageId;
}

// Función para actualizar el contenido de un mensaje existente
function updateMessageContent(messageId, newContent) {
    // Buscar el mensaje en el DOM
    const messages = document.querySelectorAll('.message.ai');
    let messageElement = null;
    
    for (const msg of messages) {
        const messageText = msg.querySelector('.message-text');
        if (messageText && msg.innerHTML.includes(messageId)) {
            messageElement = msg;
            break;
        }
    }
    
    if (!messageElement) {
        console.warn(`⚠️ No se encontró el mensaje con ID: ${messageId}`);
        return;
    }
    
    // Actualizar el contenido del mensaje en el DOM
    const messageTextElement = messageElement.querySelector('.message-text');
    if (messageTextElement) {
        messageTextElement.innerHTML = renderMarkdown(newContent);
        console.log('✅ Contenido del mensaje actualizado en el DOM');
    }
    
    // Actualizar el mensaje en localStorage
    const chat = getCurrentChat();
    if (chat && chat.messages) {
        const message = chat.messages.find(m => m.id === messageId);
        if (message) {
            message.content = newContent;
            updateCurrentChat({});
            console.log('✅ Contenido del mensaje actualizado en localStorage');
        }
    }
    
    // Detectar comandos especiales
    detectAndModifyPrompt(newContent);
}

// Función para agregar mensaje con efecto de escritura progresiva
function addMessageWithTyping(type, content, generatedCode = null) {
    // Si el contenido es muy largo (>500 caracteres), mostrar directamente sin efecto de escritura
    if (content && content.length > 500) {
        return addMessage(type, content, generatedCode);
    }
    
    const messageId = generateId();
    const timeStr = new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type} fade-in`;
    
    // Botones de acción para mensajes de IA
    const actionButtonsHtml = `
        <div class="message-actions">
            <button class="message-action-btn copy-btn" onclick="copyMessage('${messageId}')" title="Copiar respuesta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
            <button class="message-action-btn share-btn" onclick="shareMessage('${messageId}')" title="Compartir respuesta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
            </button>
            <button class="message-action-btn listen-btn" onclick="listenMessage('${messageId}')" title="Escuchar respuesta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5,6 9,2 9,2 15,6 15,11 19,11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            </button>
            <button class="message-action-btn reload-btn" onclick="reloadMessage('${messageId}')" title="Recargar respuesta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Crear el elemento con contenido vacío inicialmente
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text" id="msg-text-${messageId}"></div>
            <div class="message-time">${timeStr}</div>
            ${actionButtonsHtml}
        </div>
    `;
    
    elements.messages.appendChild(messageElement);
    
    // Efecto de escritura progresiva
    const messageTextElement = document.getElementById(`msg-text-${messageId}`);
    let currentText = '';
    let currentIndex = 0;
    
    // Dividir por palabras para efecto más fluido
    const words = content.split(' ');
    
    const typingInterval = setInterval(() => {
        if (currentIndex < words.length) {
            currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
            messageTextElement.innerHTML = renderMarkdown(currentText);
            currentIndex++;
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
            // Cuando termine, guardar el mensaje y detectar comandos especiales
            detectAndModifyPrompt(content);
            
            // Guardar en el chat
            const chat = getCurrentChat();
            if (chat) {
                const message = {
                    id: messageId,
                    type,
                    content,
                    generatedCode,
                    timestamp: new Date().toISOString()
                };
                chat.messages.push(message);
                
                // Limitar mensajes por chat
                const maxMsgs = getMaxMessagesPerChat();
                if (chat.messages.length > maxMsgs) {
                    chat.messages = chat.messages.slice(chat.messages.length - maxMsgs);
                }
                
                updateCurrentChat({});
            }
        }
    }, 30); // Velocidad de escritura: 30ms por palabra (ajustable)
    
    return messageId;
}

// --- Datos de usuario ---
function loadUserInfo() {
    try {
        const data = localStorage.getItem('devCenter_userInfo');
        userInfo = data ? JSON.parse(data) : {};
    } catch (e) {
        userInfo = {};
    }
    setUserInfoForm();
}
function setUserInfoForm() {
    if (!userInfo) return;
    const name = document.getElementById('userName');
    const birth = document.getElementById('userBirth');
    const email = document.getElementById('userEmail');
    const custom = document.getElementById('userCustom');

    // Nuevos campos de configuración de IA
    const aiResponseStyle = document.getElementById('aiResponseStyle');
    const detailLevel = document.getElementById('detailLevel');
    const projectType = document.getElementById('projectType');
    const codeStylePrefs = document.getElementById('codeStylePrefs');

    // Campos originales
    if (name) name.value = userInfo.name || '';
    if (birth) birth.value = userInfo.birth || '';
    if (email) email.value = userInfo.email || '';
    if (custom) custom.value = userInfo.custom || '';

    // Nuevos campos con valores por defecto
    if (aiResponseStyle) aiResponseStyle.value = userInfo.aiResponseStyle || 'balanced';
    if (detailLevel) detailLevel.value = userInfo.detailLevel || 'medium';
    if (projectType) projectType.value = userInfo.projectType || 'general';
    if (codeStylePrefs) codeStylePrefs.value = userInfo.codeStylePrefs || '';
}
function showUserInfoModal() {
    loadUserInfo();
    document.getElementById('userInfoModal').style.display = 'flex';
}
function hideUserInfoModal() {
    document.getElementById('userInfoModal').style.display = 'none';
}

// =================== FUNCIONES DE CONFIGURACIÓN SIMPLIFICADA ===================

// =================== FUNCIONES DE MODAL SIMPLE CONFIG (DESACTIVADAS) ===================
// Estas funciones fueron removidas según solicitud del usuario
// El cambio de modelo se realiza completamente a través del dropdown de modos

function saveUserInfo() {
    const name = document.getElementById('userName').value.trim();
    const birth = document.getElementById('userBirth').value;
    const email = document.getElementById('userEmail').value.trim();
    const custom = document.getElementById('userCustom').value.trim();

    // Nuevos campos de configuración de IA
    const aiResponseStyle = document.getElementById('aiResponseStyle')?.value || 'balanced';
    const detailLevel = document.getElementById('detailLevel')?.value || 'medium';
    const projectType = document.getElementById('projectType')?.value || 'general';
    const codeStylePrefs = document.getElementById('codeStylePrefs')?.value.trim() || '';

    userInfo = {
        name,
        birth,
        email,
        custom,
        aiResponseStyle,
        detailLevel,
        projectType,
        codeStylePrefs
    };
    localStorage.setItem('devCenter_userInfo', JSON.stringify(userInfo));
}

// Entrada y envío

// Función para detectar si el usuario pide generar una página web
function isWebGenerationRequest(prompt) {
    const lowerPrompt = prompt.toLowerCase();





    // Referencias a elementos
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');

    // Event listener para enviar mensaje
    sendBtn.addEventListener('click', async () => {
        const prompt = messageInput.value.trim(); // Tomar el texto del usuario
        if (prompt === '') return; // No hacer nada si está vacío

        // Limpiar el textarea inmediatamente
        messageInput.value = '';
        messageInput.style.height = 'auto'; // Opcional si usas auto-resize

        // Aquí llamas a tu función de generación de chat o página
        await generateChatResponse(prompt);
        // o si es generación de página:
        // await generateWebpage(prompt);
    });

    // ======================== Palabras clave específicas para generación web ====================================
    const webKeywords =
        [

            /* ================= 100 frases largas/naturales ================= */
            "quiero que crees una pagina web completa para mi proyecto",
            "necesito que me hagas un sitio web moderno y responsive",
            "ayudame a diseñar un portal profesional para mi empresa",
            "puedes construir una web interactiva para mi negocio",
            "deseo desarrollar una pagina web con diseño moderno",
            "crea una landing page profesional para promocionar mi producto",
            "genera un proyecto web completo con todas las secciones necesarias",
            "haz un sitio web moderno con diseño adaptativo",
            "diseña una web app interactiva para usuarios",
            "construye una pagina web profesional para mi startup",
            "elabora un portal web con múltiples funcionalidades",
            "arma una landing page completa para captar clientes",
            "prepara un sitio web moderno y responsive",
            "programa una web app profesional con login y registro",
            "monta un proyecto web interactivo y funcional",
            "diseña una plataforma web profesional para usuarios",
            "genera una pagina web con diseño innovador",
            "haz un portal web moderno y fácil de usar",
            "crea un sitio web completo con secciones de contacto y servicios",
            "elabora un proyecto web funcional y profesional",
            "arma una web app moderna y segura",
            "prepara una landing page interactiva y atractiva",
            "programa un sitio web con diseño responsivo",
            "monta una pagina web moderna con animaciones",
            "construye un portal profesional para mostrar productos",
            "genera una web interactiva para promocionar servicios",
            "haz un proyecto web con diseño limpio y profesional",
            "crea una pagina web profesional con blog integrado",
            "diseña un sitio web moderno con secciones animadas",
            "elabora un portal web profesional con formulario de contacto",
            "arma una landing page atractiva y responsiva",
            "prepara un proyecto web con diseño creativo",
            "programa una web app moderna con dashboard",
            "monta un sitio web profesional con secciones informativas",
            "genera una pagina web para mostrar portafolio",
            "haz un portal web completo con galeria de imágenes",
            "crea una web app con login, registro y perfil de usuario",
            "diseña una landing page profesional para venta de productos",
            "elabora un proyecto web moderno con diseño interactivo",
            "arma una pagina web con secciones de contacto y servicios",
            "prepara un sitio web profesional con diseño responsive",
            "programa una plataforma web moderna y funcional",
            "monta un proyecto web interactivo con animaciones",
            "genera un portal web completo con menú y secciones",
            "haz un sitio web profesional con formulario de contacto",
            "crea una pagina web moderna con diseño llamativo",
            "diseña una web app profesional con secciones interactivas",
            "elabora un portal web moderno para empresa",
            "arma una landing page profesional y responsiva",
            "prepara un proyecto web completo con todas las secciones",
            "programa un sitio web interactivo con diseño moderno",
            "monta una pagina web profesional y atractiva",
            "genera una web app moderna con funcionalidades básicas",
            "haz un portal web moderno y responsive",
            "crea un proyecto web con diseño limpio y profesional",
            "diseña una pagina web con blog y secciones informativas",
            "elabora una web app profesional con login y registro",
            "arma un portal web completo con galeria y contacto",
            "prepara una landing page moderna y funcional",
            "programa una pagina web con diseño creativo",
            "monta un sitio web interactivo y profesional",
            "genera un proyecto web moderno con animaciones",
            "haz una web app profesional para usuarios",
            "crea un portal web completo y responsivo",
            "diseña un proyecto web moderno y funcional",
            "elabora una landing page profesional con secciones atractivas",
            "arma una pagina web moderna con diseño responsivo",
            "prepara un sitio web profesional con animaciones",
            "programa un portal web moderno con funcionalidades",
            "monta un proyecto web profesional con secciones interactivas",
            "genera una pagina web profesional con blog integrado",
            "haz un sitio web moderno con diseño responsivo",
            "crea una web app profesional con dashboard",
            "diseña un portal web profesional y moderno",
            "elabora un proyecto web completo con secciones informativas",
            "arma una landing page profesional con animaciones",
            "prepara una pagina web moderna y funcional",
            "programa un sitio web profesional con login y registro",
            "monta un portal web moderno y atractivo",
            "genera una web app profesional y responsiva",
            "haz un proyecto web completo con diseño profesional",
            "crea una pagina web moderna con galeria de imágenes",
            "diseña un sitio web profesional con secciones interactivas",
            "elabora un portal web moderno y responsivo",
            "arma un proyecto web completo con diseño creativo",
            "prepara una landing page profesional con todas las secciones",
            "programa una web app moderna con funciones básicas",
            "monta una pagina web profesional y atractiva",
            "genera un portal web moderno con animaciones",
            "haz un sitio web profesional y responsivo",
            "crea un proyecto web moderno con diseño interactivo",
            "diseña una pagina web profesional y moderna",
            "elabora una web app completa con login y registro",
            "arma un portal web moderno con galeria y contacto",
            "prepara una landing page moderna y profesional",
            "programa una pagina web interactiva y funcional",
            "monta un sitio web profesional con secciones animadas",
            "genera un proyecto web moderno y responsivo",
            "haz una web app profesional con dashboard",
            "crea un portal web completo y moderno",
            "diseña un proyecto web profesional y funcional",
            "elabora una landing page moderna y atractiva",
            "arma una pagina web profesional y creativa",
            "prepara un sitio web moderno con diseño responsivo",
            "programa un portal web profesional con funcionalidades",
            "monta un proyecto web completo y moderno",
            "genera una pagina web moderna y profesional",
            "haz un sitio web interactivo y atractivo",
            "crea una web app profesional y responsiva",
            "diseña un portal web moderno y funcional",
            "elabora un proyecto web completo con animaciones",
            "arma una landing page profesional y moderna",
            "prepara una pagina web profesional con todas las secciones",
            "programa una pagina web profesional con animaciones",
            "monta un sitio web moderno y completo",

            /* ================= 100 frases mal escritas/informales ================= */
            "crea pag web",
            "has",
            "crea",
            "cera",
            "as",
            "az",
            "haz pag",
            "genera web",
            "diseña sitio",
            "arma web",
            "monta pag",
            "prepara web",
            "programa sitio",
            "crea un portal",
            "haz web",
            "genera pag",
            "c web",
            "pagina web",
            "sitio web",
            "web app",
            "landing",
            "haz portal",
            "crea pagina",
            "diseña web",
            "arma sitio",
            "monta web app",
            "prepara pagina",
            "programa web",
            "haz pagina",
            "genera sitio",
            "crea web app",
            "pag web",
            "portal web",
            "sitio moderno",
            "web profesional",
            "landing page",
            "web app pro",
            "pagina pro",
            "haz landing",
            "crea web pro",
            "monta portal",
            "arma landing",
            "web interactiva",
            "sitio interactivo",
            "pagina interactiva",
            "crea landing",
            "haz web pro",
            "programa landing",
            "prepara portal",
            "arma web",
            "monta pag web",
            "pagina site",
            "web moderna",
            "crea pag",
            "haz web app",
            "genera portal",
            "diseña landing",
            "c web app",
            "web pagina",
            "haz proyecto",
            "arma sitio web",
            "monta pagina",
            "prepara web app",
            "programa portal",
            "crea web app pro",
            "haz landing page",
            "genera pag web",
            "diseña web app",
            "c portal",
            "pagina interactiva pro",
            "arma web app",
            "monta sitio pro",
            "prepara landing",
            "programa web app",
            "haz portal pro",
            "crea pag interactiva",
            "genera web pro",
            "diseña pagina pro",
            "arma portal web",
            "monta landing page",
            "prepara sitio web",
            "programa web pro",
            "haz pagina interactiva",
            "crea web interactiva",
            "genera portal web",
            "diseña landing pro",
            "arma pagina web",
            "monta web interactiva",
            "prepara portal pro",
            "programa pag",
            "haz web interactiva",
            "crea landing pro",
            "genera proyecto web",
            "diseña web moderna",
            "arma pagina interactiva",
            "monta proyecto web",
            "prepara pagina pro",
            "programa sitio pro",
            "haz portal interactiva",
            "crea web pro",
            "genera landing interactiva",
            "diseña pagina interactiva",
            "arma web moderna",
            "monta sitio interactivo",
            "prepara web interactiva",
            "programa landing pro",
            "haz pagina pro",

            /* ================= 100 frases súper cortas ================= */
            "web",
            "juego",

            "pagina",
            "sitio",
            "portal",
            "landing",
            "web app",
            "pag web",
            "has web",
            "crea web",
            "diseña web",
            "arma web",
            "monta web",
            "prepara web",
            "programa web",
            "web pro",
            "web interactiva",
            "sitio web",
            "pagina pro",
            "web app pro",
            "landing pro",
            "pag",
            "web app",
            "c web",
            "portal web",
            "pagina",
            "site",
            "web moderna",
            "web interactiva",
            "landing",
            "pro web",
            "app web",
            "web pagina",
            "pagina web",
            "haz pag",
            "crea pag",
            "diseña pagina",
            "arma sitio",
            "monta pag",
            "prepara pag",
            "programa sitio",
            "web app pro",
            "web pro",

            "pag pro",
            "web pro",
            "pagina interactiva",
            "portal",
            "app",
            "web app",
            "pagia",
            "web app pro",
            "landing",
            "web",
            "pagina",
            "sitio",
            "portal",
            "landing page",
            "app web",
            "web pro",
            "web",
            "pag",
            "c web",
            "pagina web",
            "web app",
            "landing",
            "web app pro",
            "pag web",
            "web interactiva",
            "pagina pro",
            "web moderna",
            "landing pro",
            "portal",

            "pagina",
            "site",
            "web",
            "web app pro",
            "pagina",
            "web pro",
            "landing page",

            "app"























        ];
















    // Palabras clave técnicas
    const techKeywords = ['html', 'css', 'javascript', 'landing page', 'portfolio', 'dashboard',
        'aplicacion', 'app', 'formulario', 'calculadora', 'juego', 'quiz', 'encuesta', 'galeria', 'slider', 'carrusel',
        'login', 'registro', 'chat', 'calendario', 'reloj', 'contador', 'cronometro', 'timer', 'todolist', 'lista de tareas',
        'blog', 'navbar', 'menu', 'modal', 'popup', 'accordion', 'tabs', 'cards', 'grid', 'tabla', 'chart', 'grafico',
        'mapa', 'video', 'audio', 'slideshow', 'testimonios', 'pricing', 'contacto', 'bootstrap', 'react', 'vue',
        'sistema', 'plataforma', 'herramienta', 'utilidad', 'generador', 'convertidor', 'editor', 'visualizador'];

    // Verificar si contiene frases específicas de generación web
    const hasWebPhrase = webKeywords.some(phrase => lowerPrompt.includes(phrase));

    // Verificar si contiene palabras técnicas en contexto de creación
    const hasTechKeyword = techKeywords.some(keyword => {
        const index = lowerPrompt.indexOf(keyword);
        if (index === -1) return false;

        // Verificar contexto: si está precedido por palabras de creación
        const beforeKeyword = lowerPrompt.substring(Math.max(0, index - 20), index);
        return beforeKeyword.includes('crea') || beforeKeyword.includes('haz') || beforeKeyword.includes('genera') || beforeKeyword.includes('diseña');
    });

    return hasWebPhrase || hasTechKeyword;
}

function handleInputChange() {
    const hasText = elements.messageInput.value.trim().length > 0;
    elements.sendBtn.disabled = !hasText || isGenerating;
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!elements.sendBtn.disabled) {
            sendMessage();
        }
    }
}

function adjustTextareaHeight() {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
}

function clearMessageInput() {
    // Función robusta para limpiar el input sin importar el contexto
    if (elements.messageInput) {
        elements.messageInput.value = '';
        elements.messageInput.style.height = 'auto';
        handleInputChange();
    }
}

function handleSuggestionClick(e) {
    if (e.target.classList.contains('suggestion-btn')) {
        const template = e.target.dataset.template;
        if (templates[template]) {
            elements.messageInput.value = templates[template];
            handleInputChange();
            elements.messageInput.focus();
        }
    }
}

// ================= MODO AGENTE: DECISIÓN AUTOMÁTICA DE MODO =================
async function decideAgentMode(userPrompt, chatHistory = []) {
    try {
        // Cargar configuraciones de IA
        loadAiConfigs();
        
        // Obtener la IA seleccionada por el usuario (o la primera disponible)
        const selectedAi = aiConfigs.find(ai => ai.id === selectedAiId) || aiConfigs[0];
        
        if (!selectedAi) {
            console.error('❌ No hay IA configurada');
            return 'info';
        }
        
        // Usar la URL y API Key de la IA seleccionada
        const url = selectedAi.url;
        const apiKey = selectedAi.apiKey;
        
        console.log(`🤖 Modo Agente usando: ${selectedAi.name}`);

        // Construir contexto del historial del chat (últimos 10 mensajes para no exceder límites)
        let historyContext = '';
        if (chatHistory && chatHistory.length > 0) {
            const recentMessages = chatHistory.slice(-10);
            historyContext = '\n\nHISTORIAL DE CONVERSACIÓN:\n';
            historyContext += recentMessages
                .map(m => {
                    if (m.type === 'user') {
                        return `Usuario: ${m.content}`;
                    } else if (m.type === 'ai') {
                        return `DevCenter: ${m.content}`;
                    }
                    return '';
                })
                .filter(Boolean)
                .join('\n');
        }

        // PROMPT SÚPER INTELIGENTE - Máxima precisión en clasificación
        
        const decisionPrompt = `Eres un clasificador experto y flexible.
Tu función es entender la intención real del mensaje, no solo las palabras exactas.
Tu misión: responder solo con el número del modo correcto (1, 2 o 3).
No te tomes las reglas literalmente: usa sentido común y contexto.
Aunque el texto esté mal escrito o tenga errores, interpreta lo que el usuario realmente quiso decir.

MENSAJE:
${userPrompt}

HISTORIAL:
${historyContext}

🧭 MODOS

1️⃣ — INFO → Conversaciones normales, saludos, dudas o explicaciones sin generación.
2️⃣ — MEMORIA → Referencias a conversaciones pasadas (“recuerdas”, “antes dijiste”, etc.).
3️⃣ — PROGRAM → Solicitudes para crear, generar o mostrar páginas, sitios o HTML/CSS/JS, prototipos o funciones nuevas.

🎯 LÓGICA DE CLASIFICACIÓN
Paso 1 — Intención programadora (modo 3)
Si el mensaje pide crear o generar páginas web, aplicaciones, código, estructuras HTML, CSS o JavaScript, responde con 3 incluso si el texto está mal escrito.

Paso 2 — Referencias pasadas (modo 2)
Si menciona conversaciones anteriores, responde con 2.

Paso 3 — Conversación general (modo 1)
Usa 1 cuando no se pida crear nada y se trate de saludos, dudas o explicaciones.

⚡ PRIORIDAD DE INTENCIÓN
Si detectas intención programadora → 3
Si detectas referencia al pasado → 2
Si ninguna aplica → 1

🛡 PRINCIPIOS DE ESTABILIDAD
Si el texto es confuso, interpreta lo más probable.
No te dejes llevar por palabras sueltas: analiza el mensaje completo.
Si hay “sin” o “no” en la descripción, verifica si niega la acción principal antes de cambiar el modo.

📚 EJEMPLOS INTELIGENTES
“hola” → 1
“cómo estás” → 1
“crea html simple de hola mundo” → 3
“recuerdas lo que dijiste antes” → 2
“no quiero que generes código” → 1

RESPUESTA FINAL:
Devuelve solo el número del modo correcto:
1, 2 o 3`;

const requestBody = {
            contents: [{
                parts: [{
                    text: decisionPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 10,
                topK: 3,
                topP: 0.2
            }
        };

        const response = await fetch(`${url}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        const decision = data.candidates[0].content.parts[0].text.trim();
        
        // Extraer el número de la respuesta
        const modeNumber = parseInt(decision.match(/\d+/)?.[0]);
        
        // Mapear número a modo
        const modeMap = {
            1: 'info',
            2: 'memory',
            3: 'program'
        };

        const selectedMode = modeMap[modeNumber] || 'info'; // Por defecto info si no reconoce
        
        console.log(`🤖 Agente decidió: Modo ${modeNumber} (${selectedMode}) usando ${selectedAi.name}`);
        
        return selectedMode;
        
    } catch (error) {
        console.error('❌ Error en decisión del agente:', error);
        // En caso de error, usar modo información por defecto
        return 'info';
    }
}
// ================= FIN MODO AGENTE =================

// Envío de mensajes
async function sendMessage(customPrompt) {
    // --- NUEVO: Bloquea si se alcanza el límite de mensajes y muestra tiempo restante ---
    if (!canSendMessage()) {
        // Calcular tiempo restante
        const chat = getCurrentChat();
        let timeMsg = '';
        if (chat && chat.messages && chat.messages.length > 0) {
            const firstMsgTime = new Date(chat.messages[0].timestamp || chat.messages[0].createdAt || chat.createdAt);
            const now = new Date();
            const diffMs = now - firstMsgTime;
            const diffMinutes = diffMs / (1000 * 60);
            const remaining = Math.max(0, RESET_LIMIT_MINUTES - diffMinutes);
            const min = Math.floor(remaining);
            const sec = Math.floor((remaining - min) * 60);
            timeMsg = ` Intenta de nuevo en ${min}m ${sec < 10 ? '0' : ''}${sec}s.`;
        }
        alert('Has alcanzado el límite de mensajes permitidos en esta conversación.' + timeMsg);
        return;
    }
    const content = typeof customPrompt === 'string'
        ? customPrompt
        : elements.messageInput.value.trim();
    if (!content || isGenerating) return;

    // SIEMPRE limpiar el input sin importar si es customPrompt o no
    clearMessageInput();

    const welcomeMessage = elements.messages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }


    // Añadir mensaje al chat actual
    let chat = getCurrentChat();
    if (!chat) {
        createNewChat(generateChatName(content));
        chat = getCurrentChat();
    }

    addMessage('user', content);

    // Renombrar el chat cada 10 mensajes usando el mensaje actual
    chat = getCurrentChat();
    if (chat.messages.length === 1 || chat.messages.length % 10 === 1) {
        chat.name = generateChatName(content);
        updateCurrentChat({});
        renderSidebar();
    }

    // ================= MODO AGENTE: DECISIÓN AUTOMÁTICA =================
    let originalAbility = activeAbility;
    if (activeAbility === 'agent') {
        console.log('🤖 Modo Agente activado - Decidiendo modo automáticamente...');
        
        // Obtener el historial del chat para contexto
        const chatHistory = chat && chat.messages ? chat.messages : [];
        
        // Decidir automáticamente el modo usando la IA seleccionada CON historial completo
        const decidedMode = await decideAgentMode(content, chatHistory);
        
        // Cambiar temporalmente el modo activo
        activeAbility = decidedMode;
        
        console.log(`🤖 Agente decidió usar el modo: ${decidedMode}`);
        
        // Notificación desactivada por solicitud del usuario
    }
    // ================= FIN MODO AGENTE =================

    // Verificar si el prompt es para generar una página web Y está en modo programar
    if (isWebGenerationRequest(content) && activeAbility === 'program') {
        // Generar página web
        showLoading();
        isGenerating = true;
        handleInputChange();

        try {
            const result = await generateWebpage(content);
            hideLoading();
            const messageId = addMessage('ai', result.message, result.code);

            // Actualizar el nombre del chat si es el primer mensaje real
            const chat = getCurrentChat();
            if (chat && chat.messages.length <= 2) {
                const newName = generateChatName(content);
                chat.name = newName;
                updateCurrentChat({});
                renderSidebar();
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
            // Pasar el prompt original para el botón de reintentar
            addMessage('ai', 'Lo siento, ha ocurrido un error al generar la página web. Por favor, inténtalo de nuevo.', null, true, null, null, { prompt: content });
        }

        isGenerating = false;
        handleInputChange();
    } else {
        // Generar respuesta de chat
        showLoading();
        isGenerating = true;
        handleInputChange();

        try {
            const response = await generateChatResponse(content);
            hideLoading();
            // Usar efecto de escritura progresiva
            addMessageWithTyping('ai', response);
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
            // Pasar el prompt original para el botón de reintentar
            const errorMessage = error.message || 'Lo siento, no pude procesar tu solicitud en este momento.';
            addMessage('ai', errorMessage, null, true, null, null, { prompt: content });
        }

        isGenerating = false;
        handleInputChange();
    }
}

// IA y generación de código
async function generateWebpage(prompt) {
    // Siempre recarga userInfo antes de generar el prompt
    loadUserInfo();

    // Ya no necesitamos obtener IA específica aquí, el failover lo maneja
    loadAiConfigs();

    // Obtener historial de mensajes del chat current (solo texto, sin código generado)
    const chat = getCurrentChat();
    let historyText = '';
    if (chat && chat.messages && chat.messages.length > 0) {
        historyText = chat.messages
            .filter(m => m.type === 'user' || m.type === 'ai')
            .map(m => {
                if (m.type === 'user') {
                    return `Usuario: ${m.content}`;
                } else if (m.type === 'ai') {
                    // Solo incluir el mensaje, no el código generado
                    return `DevCenter: ${m.content}`;
                }
                return '';
            })
            .join('\n');
    }

    // Información del usuario para IA
    let userInfoText = '';
    if (userInfo && (userInfo.name || userInfo.birth || userInfo.email || userInfo.custom || userInfo.aiResponseStyle || userInfo.detailLevel || userInfo.projectType || userInfo.codeStylePrefs)) {
        userInfoText = [
            userInfo.name ? `Nombre: ${userInfo.name}` : '',
            userInfo.birth ? `Fecha de nacimiento: ${userInfo.birth}` : '',
            userInfo.email ? `Correo: ${userInfo.email}` : '',
            userInfo.custom ? `Información personalizada: ${userInfo.custom}` : '',
            '',
            '=== CONFIGURACIONES DE IA ===',
            userInfo.aiResponseStyle ? `Estilo de respuesta preferido: ${userInfo.aiResponseStyle}` : '',
            userInfo.detailLevel ? `Nivel de detalle: ${userInfo.detailLevel}` : '',
            userInfo.projectType ? `Tipo de proyectos: ${userInfo.projectType}` : '',
            userInfo.codeStylePrefs ? `Estilo de código: ${userInfo.codeStylePrefs}` : ''
        ].filter(Boolean).join('\n');
    }

    // ============= ANÁLISIS INTELIGENTE Y MEMORIA CONTEXTUAL (WEB) =============
    const detectedLevel = intelligentAnalysis.detectUserLevel(prompt);
    const detectedLanguage = intelligentAnalysis.extractCodeLanguage(prompt);
    const detectedProjectType = intelligentAnalysis.detectProjectType(prompt);

    // Actualizar memoria contextual
    if (detectedLevel && detectedLevel !== 'intermediate') {
        contextualMemory.userExpertise = detectedLevel;
        contextualMemory.complexityLevel = detectedLevel;
    }

    if (detectedLanguage) {
        contextualMemory.lastCodeLanguage = detectedLanguage;
        if (!contextualMemory.userPreferences.languages) contextualMemory.userPreferences.languages = [];
        if (!contextualMemory.userPreferences.languages.includes(detectedLanguage)) {
            contextualMemory.userPreferences.languages.push(detectedLanguage);
        }
    }

    if (detectedProjectType && detectedProjectType !== 'general') {
        contextualMemory.projectContext = detectedProjectType;
    }

    // Detectar tema web específico
    const webKeywords = ['página web', 'sitio web', 'landing', 'frontend', 'responsive'];
    const ecommerceKeywords = ['tienda', 'ecommerce', 'producto', 'venta', 'carrito'];
    const dashboardKeywords = ['dashboard', 'panel', 'administración', 'estadísticas'];

    if (webKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        contextualMemory.conversationTheme = 'web_development';
    } else if (ecommerceKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        contextualMemory.conversationTheme = 'ecommerce';
    } else if (dashboardKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        contextualMemory.conversationTheme = 'dashboard';
    }

    contextualMemory.interactionPattern = 'web';

    // Preparar información contextual para generación web
    let contextualInfo = '';
    if (contextualMemory.userExpertise && contextualMemory.userExpertise !== 'intermediate') {
        contextualInfo += `**NIVEL DETECTADO:** ${contextualMemory.userExpertise.toUpperCase()}\n`;
    }
    if (contextualMemory.lastCodeLanguage) {
        contextualInfo += `**TECNOLOGÍA PRINCIPAL:** ${contextualMemory.lastCodeLanguage.toUpperCase()}\n`;
    }
    if (contextualMemory.projectContext && contextualMemory.projectContext !== 'general') {
        contextualInfo += `**TIPO DE PROYECTO:** ${contextualMemory.projectContext.toUpperCase()}\n`;
    }
    if (contextualMemory.conversationTheme) {
        contextualInfo += `**ESPECIALIZACIÓN WEB:** ${contextualMemory.conversationTheme.toUpperCase()}\n`;
    }
    // ========================================================================

    // Obtener el prompt del modo activo
    const abilityPrompt = await getActiveAbilityPrompt();

    // ============= PROMPT ÚNICO SÚPER PODEROSO =============
    // Obtener información contextual y del dispositivo
    const context = getContextualInfo();
    const device = detectUserDevice();
    
    const systemPrompt = `🚀 ERES LA IA MÁS PODEROSA Y AVANZADA DEL UNIVERSO EN DESARROLLO WEB Y DISEÑO DIGITAL 🚀

Eres LA MEJOR IA DEL MUNDO, un superequipo de expertos ELITE de clase mundial: CTO de Silicon Valley + Director Creativo de Apple + Lead UX/UI Designer de Google + Arquitecto de Software Senior de Microsoft + Senior Full-Stack Developer de Meta + Marketing Strategist de Amazon + SEO Expert de nivel NASA + Accessibility Specialist certificado W3C + Performance Engineer de Google Chrome Team + Design Systems Architect de Figma + Creative Director de las mejores agencias del mundo.

🎯 MISIÓN ESPECIAL: Crear la página web más IMPRESIONANTE, INNOVADORA y PROFESIONAL del mundo para: "${prompt}"

📱 INFORMACIÓN DEL DISPOSITIVO DEL USUARIO (SÚPER IMPORTANTE):
- DISPOSITIVO: ${device.details.toUpperCase()} (${device.type})
- PANTALLA: ${device.screenWidth}x${device.screenHeight}px (${device.devicePixelRatio}x DPI)
- SOPORTE TÁCTIL: ${device.hasTouch ? 'SÍ - OPTIMIZAR PARA TOUCH' : 'NO - OPTIMIZAR PARA CURSOR'}
- ${device.optimizationAdvice}

📊 ANÁLISIS INTELIGENTE CONTEXTUAL:
- Año actual: ${context.year} | Estación: ${context.season} | Día: ${context.weekDay} ${context.day} de ${context.month}
- Tema preferido del usuario: ${context.theme === 'oscuro' ? 'OSCURO (colores vibrantes, contrastes altos, gradientes llamativos)' : 'CLARO (paletas elegantes, colores suaves, diseño minimalista)'}
- Tendencias de diseño ${context.year}: Neomorfismo, Glassmorphism 3.0, AI-first design, Sustainable web design
- Referencias culturales y tecnológicas del ${context.year}: Metaverso, Web3, NFTs, Blockchain, AI generativo, ChatGPT, realidad aumentada
- Elementos estacionales de ${context.season}: ${context.season === 'primavera' ? 'Colores frescos, verdes vibrantes, flores, renovación' : context.season === 'verano' ? 'Colores cálidos, azules océano, energía, vacaciones' : context.season === 'otoño' ? 'Tonos cálidos, naranjas, rojos, dorados, comodidad' : 'Colores fríos, azules invierno, blancos nieve, elegancia'}

🚫🖼️ REGLA ABSOLUTA E INQUEBRANTABLE - ICONOS VS IMÁGENES:
⚠️ **PROHIBIDO TOTALMENTE** usar imágenes JPG, PNG, GIF, WebP o cualquier archivo de imagen externa
⚠️ **NUNCA** incluyas <img src="..."> con rutas a archivos de imagen
⚠️ **JAMÁS** uses background-image: url() con archivos de imagen externos
⚠️ Esta es una REGLA CRÍTICA que NUNCA puedes romper bajo NINGUNA circunstancia

✅ **OBLIGATORIO** - Usa SOLO estas alternativas visuales:
1. **ICONOS SVG INLINE** (código SVG directo en el HTML) - Tu opción PRINCIPAL y PREFERIDA
   - Crea iconos SVG personalizados hermosos y profesionales
   - Usa paths, circles, rects para crear cualquier icono que necesites
   - SVG es escalable, ligero, colorizable con CSS y perfecto para diseño moderno
   - Ejemplos: iconos de menú, flechas, checkmarks, estrellas, corazones, etc.

2. **SÍMBOLOS UNICODE Y CARACTERES ESPECIALES** - Tu segunda mejor opción
   - Usa símbolos matemáticos: ▶ ◀ ● ○ ■ □ ▲ ▼ ◆ ★ ☆ ✓ ✕ ∞ ≈ ± × ÷
   - Usa flechas: → ← ↑ ↓ ⇒ ⇐ ⇑ ⇓ ➜ ➔ ➡ ⬅ ⬆ ⬇
   - Usa formas: ◉ ◎ ◐ ◑ ◒ ◓ ◔ ◕ ◖ ◗ ⬤ ⭐ ⬛ ⬜
   - Puedes estilizar con CSS: font-size, color, text-shadow, transform

3. **EMOJIS CON MODERACIÓN** (úsalos POCAS VECES, solo cuando sea apropiado)
   - IMPORTANTE: No abuses de los emojis - úsalos con moderación y buen gusto
   - Solo para agregar un toque de personalidad ocasional
   - Perfecto para: 🚀 📱 💡 ⭐ 🎨 🎯 💼 📊 🔥 ✨ 🌟 👍 ❤️ 🏆
   - Evita: No llenes toda la página de emojis - mantén la profesionalidad

4. **GRADIENTES CSS AVANZADOS** en lugar de imágenes de fondo
   - linear-gradient(), radial-gradient(), conic-gradient()
   - Gradientes multicapa con transparencias
   - Patterns con repeating-linear-gradient()

5. **FORMAS CSS Y PSEUDO-ELEMENTOS** para decoración visual
   - Usa ::before y ::after con content para crear formas
   - border-radius extremo para círculos y formas orgánicas
   - clip-path para formas geométricas complejas
   - box-shadow múltiples para efectos de profundidad

6. **EFECTOS VISUALES CON CSS PURO**
   - backdrop-filter para glassmorphism
   - filter: blur(), contrast(), saturate() para efectos
   - transform 3D para profundidad y dinamismo
   - Animaciones CSS para movimiento

**EJEMPLOS PRÁCTICOS DE ICONOS SVG QUE DEBES CREAR:**
- Menú hamburguesa: 3 líneas horizontales con SVG <line>
- Icono de búsqueda: círculo + línea diagonal con SVG
- Flechas de navegación: polígonos con SVG <polygon>
- Iconos de redes sociales: paths SVG personalizados
- Checkmarks: paths SVG en forma de ✓
- Estrellas: polígonos SVG de 5 puntas
- Corazones: bezier curves con SVG <path>

**BENEFICIOS DE ESTA REGLA:**
✅ Carga instantánea - Sin esperar descargas de imágenes
✅ Peso mínimo - Página ultra-ligera y rápida
✅ Escalabilidad perfecta - SVG se ve perfecto en cualquier tamaño
✅ Personalizable - Puedes cambiar colores con CSS
✅ Responsive automático - Se adapta a cualquier pantalla
✅ SEO mejorado - Código limpio sin dependencias externas
✅ Mantenimiento fácil - Todo está en un solo archivo
✅ Accesibilidad - Compatible con screen readers

**RECUERDA:** Esta regla es ABSOLUTA e INQUEBRANTABLE. Si necesitas mostrar algo visual:
- Productos → Usa SVG illustrations hermosas
- Personas → Usa SVG avatares o iniciales estilizadas
- Fotografías → Usa gradientes coloridos + iconos SVG creativos
- Logos → Crea versiones SVG inline
- Decoración → Usa gradientes CSS + formas CSS + pseudo-elementos

La creatividad con SVG, Unicode y CSS es INFINITA. Demuestra tu maestría creando diseños ESPECTACULARES sin una sola imagen externa.

⚠️ IMPORTANTE - GENERACIÓN DIRECTA DE CÓDIGO:
- NO generes análisis previos, explicaciones o justificaciones
- Genera DIRECTAMENTE el código HTML completo y funcional
- El código debe estar listo para copiar y usar inmediatamente
- Enfócate SOLO en crear la página web solicitada

🏆 ARQUITECTURA TÉCNICA DE NIVEL MUNDIAL:
- HTML5 semántico perfeccionado con estructura de documento científica
- Meta tags estratégicos optimizados para conversión y SEO técnico avanzado
- Structured data tipo Schema.org ultra-específico para la industria
- JSON-LD con datos ricos para Google Knowledge Graph
- OpenGraph + Twitter Cards + LinkedIn optimizados para viralidad
- PWA-ready con manifest.json y service worker preparation
- Core Web Vitals optimizado: LCP <2.5s, FID <100ms, CLS <0.1
- Performance Budget: Crítico <30KB, Total <100KB, Time to Interactive <3s

💎 CSS NEXT-GENERATION Y ULTRA-MODERNO:
- CSS Grid 3.0 con subgrid masonry layouts y container grid templates
- Flexbox optimizado con gap, align-content, flex-basis, order inteligente
- Variables CSS dinámicas con calc(), clamp(), min(), max() combinados
- Container queries para componentes ultra-responsivos independientes del viewport
- CSS Cascade Layers (@layer) para arquitectura CSS escalable y mantenible
- Custom properties avanzadas con tokens de diseño y color-mix()
- Scroll-driven animations con animation-timeline y view-timeline
- CSS Houdini effects simulados: paint worklets, layout worklets
- CSS Logical properties completas: margin-block, padding-inline, border-block
- Gradientes mesh complejos con color interpolation y color spaces
- Sombras múltiples con box-shadow, drop-shadow, text-shadow layering
- Animaciones de física realistas: spring(), bounce(), elastic easing
- Transform 3D cinematográficos: perspective, matrix3d, rotate3d avanzado
- CSS Filters como Photoshop: blur, contrast, saturate, hue-rotate, drop-shadow
- Backdrop-filter multicapa para glassmorphism auténtico y blur stacking
- CSS Masks complejas con SVG masks, clip-path orgánico, mask-composite
- Breakpoints científicos: 320px, 375px, 768px, 1024px, 1440px, 1920px, 2560px
- Feature queries (@supports) para progressive enhancement avanzado
- Media queries nivel 5: prefers-reduced-motion, prefers-contrast, forced-colors

🚫 REGLAS CSS ANTI-OVERFLOW OBLIGATORIAS (NUNCA SE DEBE SALIR DE LA PANTALLA):
SEMPRE debes incluir estas reglas fundamentales al inicio del CSS:

* { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; }
img, video, iframe { max-width: 100%; height: auto; }
.container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 clamp(15px, 4vw, 40px); }

📱 LAYOUTS ANTI-DESBORDAMIENTO:
- Grid responsivo: display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: clamp(15px, 3vw, 30px);
- Flex responsivo: display: flex; flex-wrap: wrap; gap: clamp(10px, 2vw, 20px);
- Cards: width: 100%; max-width: 350px; min-width: 0;
- Texto seguro: font-size: clamp(14px, 4vw, 18px); word-wrap: break-word; hyphens: auto;
- Imágenes: width: 100%; height: auto; object-fit: cover; max-width: 100%;
- Videos: width: 100%; height: auto; aspect-ratio: 16/9; max-width: 100%;

🔧 TÉCNICAS AVANZADAS RESPONSIVAS:
- Anchos seguros: width: min(90vw, 600px); max-width: 100%;
- Alturas fluidas: height: clamp(300px, 50vh, 600px);
- Padding responsivo: padding: clamp(20px, 5vw, 60px);
- Margin inteligente: margin: clamp(10px, 3vw, 40px) auto;
- Text overflow: overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
- Scroll horizontal controlado: overflow-x: auto; scrollbar-width: thin;

📏 MEDIDAS RESPONSIVAS OBLIGATORIAS:
- Para contenedores: width: 100%; max-width: [valor]; margin: 0 auto;
- Para elementos hijos: width: 100%; max-width: 100%; min-width: 0;
- Para texto largo: word-wrap: break-word; overflow-wrap: break-word;
- Para inputs: width: 100%; max-width: 100%; box-sizing: border-box;
- Para tablas: width: 100%; overflow-x: auto; display: block; white-space: nowrap;

🎯 VIEWPORT META OBLIGATORIO:
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">

⚡ MEDIA QUERIES ANTI-OVERFLOW:
@media (max-width: 768px) {
  .hide-mobile { display: none !important; }
  .full-width-mobile { width: 100% !important; margin: 0 !important; }
  .stack-mobile { flex-direction: column !important; }
}

@media (max-width: 480px) {
  .container { padding: 0 15px; }
  h1 { font-size: clamp(24px, 8vw, 36px); }
  .button { width: 100%; margin: 10px 0; }
}

🎨 DISEÑO VISUAL NEXT-LEVEL - INSPIRADO EN APPLE, TESLA, OPENAI:
- Sistema de color científico con 12-shade palettes y semantic colors
- Tipografía variable con weight, width, optical-size axes optimizadas
- Micro-tipografía perfecta: kerning, tracking, leading, orphans/widows
- Spacing system matemático: 4px/8px base con golden ratio proportions
- Design tokens complejos: semantic naming, multi-brand theming support
- Motion design cinematográfico: easing curves naturales, coordinated timing
- Glassmorphism 3.0: multicapa blur, transparency, light simulation
- Neomorphism sutil: soft shadows, light source consistency, depth hierarchy
- AI-generated patterns: noise textures, organic shapes, procedural backgrounds
- Color psychology avanzada por industria: tech (azules), health (verdes), luxury (dorados)
- Accessibility-first: 4.5:1 contrast minimum, focus indicators, color-blind friendly
- Dark/Light mode científico: LAB color space, perceptual lightness matching

📱 RESPONSIVE DESIGN REVOLUTIONARY:
- Mobile-first atomic design methodology con component libraries
- Progressive Web App arquitectura: app shell, offline-first, push notifications
- Touch-first interactions: swipe gestures, pinch zoom, haptic feedback simulation
- Adaptive layouts que cambian estructura según device capabilities
- Performance budgets por device: 3G throttling considerations, battery awareness
- Cross-platform compatibility: iOS Safari, Android Chrome, desktop optimization
- Responsive images avanzadas: art direction, density descriptors, lazy loading
- Viewport meta optimization para diferentes screen densities y orientations

♿ ACCESIBILIDAD WCAG 2.2 AAA PLUS:
- Screen reader optimization con semantic HTML y ARIA best practices
- Keyboard navigation perfecto: focus traps, skip links, roving tabindex
- Visual accessibility: contrast 7:1+, focus indicators, reduced motion support
- Cognitive accessibility: clear navigation, consistent UI patterns, error prevention
- Motor accessibility: large click targets, no hover dependencies, timeout extensions
- Multi-sensory design: visual + auditory + haptic feedback where appropriate
- Inclusive language y cultural sensitivity en todo el contenido

⚡ PERFORMANCE ENGINEERING EXTREME:
- Critical CSS inlined con automated above-fold detection
- Resource optimization: HTTP/2 push simulation, preload strategic resources
- Image optimization: next-gen formats (WebP, AVIF), responsive images, lazy loading
- Font loading estratégico: font-display swap, subset fonts, WOFF2 compression
- Code splitting simulation: critical path optimization, non-blocking resources
- Performance metrics targeting: FCP <1.2s, LCP <2.5s, FID <100ms, CLS <0.1
- Bundle size optimization: tree shaking simulation, dead code elimination
- Caching strategies: service worker preparation, static asset versioning

🔍 SEO & MARKETING INTELLIGENCE AVANZADO:
- Technical SEO perfecto: crawl optimization, indexation signals, site architecture
- Content SEO estratégico: keyword research simulation, semantic search optimization
- Local SEO para negocios físicos: NAP consistency, local schema markup
- E-A-T signals: expertise demonstration, authoritativeness, trustworthiness
- Core Web Vitals como ranking factor: user experience optimization
- Social SEO: Open Graph optimization, Twitter Cards, social sharing buttons
- Voice search optimization: conversational keywords, featured snippets targeting
- International SEO: hreflang implementation, geo-targeting, cultural adaptation

🚀 FUNCIONALIDADES ENTERPRISE ULTRA-AVANZADAS:
- AI-powered personalization: content adaptation, user behavior prediction
- Advanced analytics preparation: conversion funnels, heatmaps, A/B testing hooks
- Marketing automation ready: lead scoring, customer journey mapping, retention optimization
- E-commerce optimization: shopping cart psychology, checkout optimization, trust signals
- Security implementation: CSP headers, HTTPS enforcement, data protection compliance
- Internationalization: multi-language support, currency handling, cultural adaptation
- Integration readiness: CRM connectivity, payment gateways, third-party services
- Scalability architecture: microservices preparation, API-first design, cloud optimization

🎯 CONVERSION RATE OPTIMIZATION SCIENCE:
- Psychology-based design: scarcity, social proof, authority, reciprocity principles
- Persuasive copywriting: benefit-focused headlines, action-oriented CTAs, objection handling
- User flow optimization: friction reduction, form optimization, checkout streamlining
- Trust signal placement: testimonials, certifications, security badges, guarantees
- Urgency and scarcity tactics: limited time offers, stock counters, exclusive access
- Social proof integration: customer reviews, usage statistics, media mentions
- Risk reversal: money-back guarantees, free trials, no-commitment options
- Conversion tracking preparation: goal setup, funnel analysis, attribution modeling

⚠️ RESTRICCIONES Y MEJORES PRÁCTICAS:
- Un solo archivo HTML autosuficiente y perfectamente organizado
- NO header sticky/fixed - navegación estática que fluye naturalmente
- Progressive enhancement obligatorio - funciona sin JavaScript
- Graceful degradation para todas las features avanzadas
- Sustainable web design - carbon footprint consideration
- Ethical design principles - no dark patterns, respeto al usuario
- GDPR compliance - privacy by design, minimal data collection
- Cross-browser compatibility - fallbacks para features no soportadas

🎭 CREATIVIDAD E INNOVACIÓN DISRUPTIVA:
- Storytelling visual: narrative flow, emotional journey, brand personality
- Unique value proposition highlight: diferenciación clara de competencia
- Innovation showcase: cutting-edge features, future-ready architecture
- Brand personality expression: tone of voice, visual language, user experience
- Emotional design: mood boards, aesthetic appeal, psychological impact
- Cultural relevance: local customs, trends, generational preferences
- Surprise and delight moments: easter eggs, microinteractions, unexpected elements
- Memorable experience creation: brand recall, word-of-mouth optimization

🚀 FUNCIONALIDADES ULTRA-AVANZADAS OBLIGATORIAS:
- Formularios inteligentes con validación en tiempo real y autocompletado
- Modales y overlays con animaciones cinematográficas
- Carrusels touch-enabled con momentum scrolling y autoplay
- Galerías de imágenes con zoom, lightbox y navegación por teclado
- Sistemas de búsqueda con filtros en tiempo real y sugerencias
- Acordeones y tabs con transiciones suaves
- Contadores animados que se activan al hacer scroll
- Progress bars circulares y lineales con SVG animations
- Calendarios interactivos y date pickers
- Mapas integrados con marcadores personalizados
- Sistemas de rating y reviews con estrellas animadas
- Chat widgets y sistemas de notificaciones
- Shopping carts y e-commerce functionality
- Timeline interactiva con scroll-triggered animations
- Drag & drop interfaces donde sea apropiado
- Copy-to-clipboard con feedback visual
- Dark/Light mode toggle funcional
- Language selector con banderas
- Social sharing buttons optimizados
- Video players con controles personalizados
- Audio players para podcasts/música
- Print-friendly layouts optimizados
- Infinite scroll o pagination inteligente
- Loading skeletons y progressive loading
- Error states y empty states creativos
- Success states con celebración visual
- Tooltips informativos y contextual help
- Breadcrumbs navigation avanzada
- Sticky elements que aparecen al hacer scroll
- Parallax multicapa pero sutil
- Particle systems con CSS puro
- 3D card flip effects y hover transformations
- Magnetic buttons que siguen el cursor
- Text typing animations y reveal effects
- Smooth scrolling con offset para navegación
- Intersection Observer para lazy loading
- Performance monitoring y optimization
- Service worker preparation para PWA
- Responsive images con art direction
- Advanced CSS Grid layouts con named lines
- Custom scroll bars y scroll indicators
- Multi-step wizards con progress tracking
- Advanced form validation con regex patterns
- File upload con drag & drop y preview
- Real-time search con debounce optimization
- Cookie consent banners GDPR compliant
- Accessibility features nivel enterprise
- Keyboard navigation shortcuts
- Screen reader optimizations
- High contrast mode support
- Reduced motion preferences respect
- Focus management avanzado
- Skip links y landmarks ARIA

⚡ JAVASCRIPT FUNCIONAL AVANZADO:
- Event delegation optimizado
- Debounce y throttle para performance
- Intersection Observer API para reveals
- Local Storage para preferencias usuario
- Session Storage para estado temporal
- URL manipulation para deep linking
- History API para navegación SPA-like
- Fetch API para formularios
- Error handling robusto
- Performance timing y metrics
- Progressive enhancement layers
- Feature detection con fallbacks
- Touch gesture support
- Keyboard event handling
- Window resize optimization
- Scroll performance optimization
- Animation frame optimization
- Memory leak prevention
- Clean event listener management
- Modular code organization
- ES6+ features con transpilation fallbacks

🎯 TIPOS DE PÁGINAS SÚPER FUNCIONALES QUE DEBES CREAR:
- E-commerce con carrito completo y checkout
- Portfolios interactivos con filtros avanzados
- Dashboards con gráficos y métricas en vivo
- Landing pages con A/B testing ready
- Blogs con sistema de comentarios
- Restaurantes con menús interactivos y reservas
- Agencias creativas con showcases dinámicos
- Startups tech con demos interactivos
- SaaS platforms con pricing calculators
- Educación online con progress tracking
- Real estate con tours virtuales
- Healthcare con appointment booking
- Fitness con workout trackers
- Finance con calculadoras avanzadas
- Travel con booking systems
- Music/Entertainment con players
- News/Media con content filtering
- Corporate con team directories
- Non-profit con donation systems
- Gaming con leaderboards

El resultado debe ser una obra maestra digital que combine la elegancia de Apple, la innovación de Tesla, la funcionalidad de Google, la creatividad de las mejores agencias del mundo, Y LA FUNCIONALIDAD AVANZADA DE LAS MEJORES APLICACIONES WEB.

🎯 FORMATO DE RESPUESTA OBLIGATORIO:
1. Descripción breve (máximo 25 palabras) de lo que creaste
2. Una línea completamente en blanco
3. SOLO el código HTML completo - SIN markdown, SIN texto adicional
`;
    
    // Usamos el sistema de failover para hacer la llamada a la API
    const apiCall = async (ai) => {
        console.log(`🌐 Llamando a API generateWebpage: ${ai.name}`);

        const response = await fetch(`${ai.url}?key=${ai.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: systemPrompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: TEMPERATURE,
                    topK: TOP_K,
                    topP: TOP_P,
                    maxOutputTokens: getCurrentMaxTokens(), // Tokens dinámicos según modo activo
                }





















            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const code = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!code) {
            throw new Error('No se pudo generar código HTML');
        }

        const cleanCode = code.replace(/```html|```/g, '').trim();

        // Validación mejorada para HTML funcional
        if (cleanCode.length < 30) {
            throw new Error(`Respuesta muy corta (${cleanCode.length} caracteres). La IA debe generar más contenido.`);
        }

        if (!cleanCode.toLowerCase().includes('<html')) {
            throw new Error('HTML inválido: Falta etiqueta <html> en la respuesta.');
        }

        if (!cleanCode.toLowerCase().includes('<head') || !cleanCode.toLowerCase().includes('<body')) {
            throw new Error('HTML incompleto: Faltan etiquetas <head> y/o <body> necesarias.');
        }

        // Verificar que tenga contenido real en el body
        const bodyMatch = cleanCode.match(/<body[^>]*>(.*?)<\/body>/is);
        if (!bodyMatch || bodyMatch[1].trim().length < 15) {
            throw new Error('HTML sin contenido: El <body> está vacío o tiene muy poco contenido.');
        }

        // Extrae la primera línea como mensaje corto, el resto como código
        const lines = cleanCode.split('\n');
        let firstLine = lines[0] || 'Página web generada';
        let codeHtml = '';

        if (lines.length > 1) {
            // Respuesta multilínea: primera línea = mensaje, resto = código
            codeHtml = lines.slice(1).join('\n').trim();
        } else {
            // Respuesta de una sola línea: verificar si es solo código HTML
            if (cleanCode.toLowerCase().includes('<html')) {
                firstLine = 'Página web generada';
                codeHtml = cleanCode;
            } else {
                throw new Error(`Respuesta inválida: no se pudo extraer código HTML válido`);
            }
        }

        // Verificar que el código extraído sea funcional
        if (!codeHtml || codeHtml.length < 30) {
            throw new Error('Código HTML extraído insuficiente: Necesita más contenido para ser funcional.');
        }

        // Verificar estructura HTML básica
        if (!codeHtml.toLowerCase().includes('<html') || !codeHtml.toLowerCase().includes('</html>')) {
            throw new Error('Estructura HTML incompleta: Faltan etiquetas de apertura/cierre <html>.');
        }

        return {
            code: codeHtml,
            message: firstLine.trim()
        };
    };

    // Llamar al sistema de failover
    return await makeApiCallWithFailover(apiCall, 3);
}

// Función para generar respuesta de chat normal
async function generateChatResponse(prompt) {
    loadUserInfo();

    loadAiConfigs();

    const chat = getCurrentChat();
    let historyText = '';
    if (chat && chat.messages && chat.messages.length > 0) {
        historyText = chat.messages
            .filter(m => m.type === 'user' || m.type === 'ai')
            .map(m => {
                if (m.type === 'user') {
                    return `Usuario: ${m.content}`;
                } else if (m.type === 'ai') {
                    return `DevCenter: ${m.content}`;
                }
                return '';
            })
            .join('\n');
    }

    let userInfoText = '';
    if (userInfo && (userInfo.name || userInfo.birth || userInfo.email || userInfo.custom || userInfo.aiResponseStyle || userInfo.detailLevel || userInfo.projectType || userInfo.codeStylePrefs)) {
        userInfoText = [
            userInfo.name ? `Nombre: ${userInfo.name}` : '',
            userInfo.birth ? `Fecha de nacimiento: ${userInfo.birth}` : '',
            userInfo.email ? `Correo: ${userInfo.email}` : '',
            userInfo.custom ? `Información personalizada: ${userInfo.custom}` : '',
            '',
            '=== CONFIGURACIONES DE IA ===',
            userInfo.aiResponseStyle ? `Estilo de respuesta preferido: ${userInfo.aiResponseStyle}` : '',
            userInfo.detailLevel ? `Nivel de detalle: ${userInfo.detailLevel}` : '',
            userInfo.projectType ? `Tipo de proyectos: ${userInfo.projectType}` : '',
            userInfo.codeStylePrefs ? `Estilo de código: ${userInfo.codeStylePrefs}` : ''
        ].filter(Boolean).join('\n');
    }

    // ============= ANÁLISIS INTELIGENTE Y MEMORIA CONTEXTUAL =================
    const detectedLevel = intelligentAnalysis.detectUserLevel(prompt);
    const detectedLanguage = intelligentAnalysis.extractCodeLanguage(prompt);
    const detectedProjectType = intelligentAnalysis.detectProjectType(prompt);

    // Actualizar memoria contextual
    if (detectedLevel && detectedLevel !== 'intermediate') {
        contextualMemory.userExpertise = detectedLevel;
        contextualMemory.complexityLevel = detectedLevel;
    }

    if (detectedLanguage) {
        contextualMemory.lastCodeLanguage = detectedLanguage;
        if (!contextualMemory.userPreferences.languages) contextualMemory.userPreferences.languages = [];
        if (!contextualMemory.userPreferences.languages.includes(detectedLanguage)) {
            contextualMemory.userPreferences.languages.push(detectedLanguage);
        }
    }

    if (detectedProjectType && detectedProjectType !== 'general') {
        contextualMemory.projectContext = detectedProjectType;
    }

    // Detectar tema conversacional
    const techKeywords = ['código', 'programación', 'algoritmo', 'debug', 'error', 'función'];
    const designKeywords = ['diseño', 'interfaz', 'ui', 'ux', 'css', 'responsive'];
    const architectureKeywords = ['arquitectura', 'patrón', 'estructura', 'escalabilidad'];

    if (techKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        contextualMemory.conversationTheme = 'programming';
    } else if (designKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        contextualMemory.conversationTheme = 'design';
    } else if (architectureKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        contextualMemory.conversationTheme = 'architecture';
    }

    contextualMemory.interactionPattern = 'chat';

    // Preparar información contextual para el prompt
    let contextualInfo = '';
    if (contextualMemory.userExpertise && contextualMemory.userExpertise !== 'intermediate') {
        contextualInfo += `**NIVEL DETECTADO:** ${contextualMemory.userExpertise.toUpperCase()}\n`;
    }
    if (contextualMemory.lastCodeLanguage) {
        contextualInfo += `**LENGUAJE DETECTADO:** ${contextualMemory.lastCodeLanguage.toUpperCase()}\n`;
    }
    if (contextualMemory.projectContext && contextualMemory.projectContext !== 'general') {
        contextualInfo += `**TIPO DE PROYECTO:** ${contextualMemory.projectContext.toUpperCase()}\n`;
    }

    // Obtener el prompt del modo activo para chat
    const abilityPrompt = await getActiveAbilityPrompt();

    // Construir systemPrompt para respuesta de chat
    const systemPrompt = `Eres DevCenter, un asistente de IA experto y amigable.

${abilityPrompt}

CONTEXTO DE LA CONVERSACIÓN:
${contextualInfo}

INFORMACIÓN DEL USUARIO:
${userInfoText}

HISTORIAL DE MENSACIÓN:
${historyText}

Responde de manera:
- Accesible y comprensible para el nivel detectado
- Adaptada al contexto de la conversación
- Útil y directa
- En español
- Sin markdown innecesario, solo usa formatos básicos si es necesario`;

    // Definir función apiCall para failover
    const apiCall = async (ai) => {
        console.log(`🌐 Llamando a API generateChatResponse: ${ai.name}`);

        const response = await fetch(`${ai.url}?key=${ai.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: systemPrompt + `\n\nMensaje del usuario: ${prompt}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: TEMPERATURE,
                    topK: TOP_K,
                    topP: TOP_P,
                    maxOutputTokens: getCurrentMaxTokens(),
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const message = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!message) {
            throw new Error('No se pudo generar respuesta');
        }

        return message;
    };

    // Llamar al sistema de failover
    return await makeApiCallWithFailover(apiCall, 3);
}

// Preview
function showPreview(messageId) {
    const chat = getCurrentChat();
    if (!chat) return;
    const message = chat.messages.find(m => m.id === messageId);
    if (!message || !message.generatedCode) return;
    if (!elements.previewModal || !elements.previewFrame || !elements.previewSubtitle) return;
    elements.previewModal.classList.add('show');
    elements.previewSubtitle.textContent = 'Página Generada';
    const iframe = elements.previewFrame;
    
    // NUEVO: Crear ID único para este código y guardar para ediciones
    window.currentCodeId = messageId;
    
    // NUEVO: Verificar si hay una versión editada guardada en localStorage
    let codeToShow = message.generatedCode;
    const savedEditedCode = localStorage.getItem('edited_code_' + messageId);
    if (savedEditedCode) {
        codeToShow = savedEditedCode;
        console.log('✅ Cargando versión editada guardada');
        elements.previewSubtitle.textContent = 'Página Generada (Editada)';
    }
    
    iframe.srcdoc = codeToShow;
    window.currentCode = codeToShow;
}

function closePreview() {
    elements.previewModal.classList.remove('show');
}

function downloadCode() {
    if (!window.currentCode) return;
    const blob = new Blob([window.currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DevCenter-4.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function shareCode() {
    if (!window.currentCode) return;
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Página Web Generada por DevCenter',
                text: 'Mira esta página web que creé con DevCenter AI',
                files: [new File([window.currentCode], 'DevCenter-4.html', { type: 'text/html' })]
            });
        } else {
            await navigator.clipboard.writeText(window.currentCode);
            alert('Código copiado al portapapeles');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        try {
            await navigator.clipboard.writeText(window.currentCode);
            alert('Código copiado al portapapeles');
        } catch (clipboardError) {
            console.error('Error copying to clipboard:', clipboardError);
        }
    }
}

// Función para alternar pantalla completa
function toggleFullscreen() {
    const modal = elements.previewModal;
    
    // Verificar si ya estamos en fullscreen del navegador
    if (document.fullscreenElement) {
        // Salir del fullscreen del navegador
        document.exitFullscreen().then(() => {
            modal.classList.remove('fullscreen');
            elements.fullscreenBackBtn.style.display = 'none';
            // Cambiar ícono a pantalla completa
            elements.fullscreenBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                </svg>
            `;
            elements.fullscreenBtn.title = 'Pantalla completa';
        }).catch(console.error);
    } else {
        // Entrar en fullscreen del navegador
        document.documentElement.requestFullscreen().then(() => {
            modal.classList.add('fullscreen');
            elements.fullscreenBackBtn.style.display = 'flex';
            // Cambiar ícono a salir de pantalla completa
            elements.fullscreenBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 3H3v6M21 3v6h-6M3 21h6v-6M21 21v-6h-6"></path>
                </svg>
            `;
            elements.fullscreenBtn.title = 'Salir de pantalla completa';
        }).catch(console.error);
    }
}

// Sidebar
function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Loading Mejorado
// Variables para animación de loading
let loadingMessageId = null;
let loadingInterval = null;

const loadingTexts = [
    "Pensando",
    "Procesando",
    "Analizando",
    "Buscando la mejor respuesta",
    "Organizando ideas",
    "Preparando la información",
    "Revisando detalles",
    "Calculando",
    "Verificando datos",
    "Comprobando",
    "Generando contenido",
    "Consultando conocimientos",
    "Evaluando opciones",
    "Estructurando respuesta",
    "Optimizando resultado",
    "Refinando detalles",
    "Casi listo",
    "Creando respuesta",
    "Trabajando en ello",
    "Dame un segundo",
    "Armando todo",
];

const loadingTextsImage = [
    "🎨 Generando imagen",
    "🖼️ Creando arte con IA",
    "✨ Dibujando con píxeles",
    "🌈 Pintando con colores",
    "🎭 Dando vida a tu idea",
    "🖌️ Aplicando detalles",
    "💫 Refinando la imagen",
    "🎪 Ajustando composición",
    "🌟 Optimizando calidad",
    "🎨 Casi lista tu imagen",
    "✨ Finalizando obra maestra",
    "🖼️ Puliendo detalles finales",
];

function showLoading(isImage = false) {
    // Crear mensaje temporal de "pensando" en el chat
    const messageId = generateId();
    loadingMessageId = messageId;
    
    const textsToUse = isImage ? loadingTextsImage : loadingTexts;
    
    const timeStr = new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
    const messageElement = document.createElement('div');
    messageElement.className = `message ai loading-message ${isImage ? 'loading-image' : ''} fade-in`;
    messageElement.id = `loading-msg-${messageId}`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text" id="loading-text-${messageId}">
                <span id="loading-base-text-${messageId}">${textsToUse[0]}</span><span class="loading-dots"></span>
            </div>
            <div class="message-time">${timeStr}</div>
        </div>
    `;
    
    elements.messages.appendChild(messageElement);
    scrollToBottom();
    
    // Cambiar el texto base cada 1.5 segundos (más rápido para imágenes)
    let textIndex = 0;
    const intervalTime = isImage ? 1500 : 2000;
    
    loadingInterval = setInterval(() => {
        textIndex = (textIndex + 1) % textsToUse.length;
        const loadingBaseTextEl = document.getElementById(`loading-base-text-${messageId}`);
        if (loadingBaseTextEl) {
            loadingBaseTextEl.textContent = textsToUse[textIndex];
        }
    }, intervalTime);
}

function hideLoading() {
    // Eliminar mensaje temporal de "pensando"
    if (loadingMessageId) {
        const loadingMsg = document.getElementById(`loading-msg-${loadingMessageId}`);
        if (loadingMsg) {
            loadingMsg.remove();
        }
        loadingMessageId = null;
    }
    
    // Limpiar intervalo
    if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
    }
}

// Utilidades
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para mostrar notificaciones tipo toast
function showNotification(message, duration = 3000, type = 'info') {
    const notifId = 'notif-' + generateId();
    const notif = document.createElement('div');
    notif.id = notifId;
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(26, 31, 58, 0.95);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: var(--color-text-primary);
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        max-width: 90vw;
        backdrop-filter: blur(10px);
        z-index: 99999;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    // Colores según tipo
    if (type === 'success') {
        notif.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        notif.style.background = 'rgba(16, 185, 129, 0.1)';
    } else if (type === 'error') {
        notif.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        notif.style.background = 'rgba(239, 68, 68, 0.1)';
    }
    
    notif.textContent = message;
    document.body.appendChild(notif);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 300);
    }, duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderMarkdown(text) {
    if (!text) return '';

    let html = text.toString();
    
    // PASO 0: Eliminar marcadores {GUARDAR: ...} y {MODIFICAR_PROMPT: ...} antes de renderizar (son invisibles para el usuario)
    html = html.replace(/\{GUARDAR:\s*([^}]+)\}/gi, '');
    html = html.replace(/\{MODIFICAR_PROMPT:\s*([^}]+)\}/gi, '');

    // PASO 1: Proteger bloques de código con marcadores
    const codeBlocks = [];
    html = html.replace(/```(\w+)?([\s\S]*?)```/g, (match, language, code) => {
        const cleanCode = code.trim();
        const codeId = 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const detectedLanguage = language || 'code';
        
        // Crear un elemento temporal para almacenar el código sin escapar
        const tempCode = document.createElement('code');
        tempCode.textContent = cleanCode;
        const safeCode = tempCode.innerHTML;
        
        const blockHtml = `<div class="code-block-wrapper">
            <div class="code-language-badge">${detectedLanguage}</div>
            <button class="copy-code-btn" onclick="copyCodeToClipboard('${codeId}', this)" title="Copiar código al portapapeles">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copiar código</span>
            </button>
            <pre><code id="${codeId}">${safeCode}</code></pre>
        </div>`;
        
        const index = codeBlocks.length;
        codeBlocks.push(blockHtml);
        return `\n\n###CODEBLOCK${index}###\n\n`;
    });

    // Código inline ` con botón de copiar
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        const codeId = 'inline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        return `<code id="${codeId}" class="inline-code-copyable" onclick="copyInlineCode('${codeId}')" title="Clic para copiar">${escapeHtml(code)}<svg class="inline-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></code>`;
    });

    // Paso temporal: marcar URLs de imagen para procesamiento posterior
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'svg', 'eps', 'pdf', 'ico', 'apng', 'jfif', 'pjpeg'];

    imageExtensions.forEach(ext => {
        const imageUrlPattern = new RegExp(`(https://[^\\s<>"'\\[\\]()\\n\\r]+\\.${ext})`, 'gi');
        html = html.replace(imageUrlPattern, (match) => {
            return `__IMAGEN_AUTO_${btoa(match)}_IMAGEN_AUTO__`;
        });
    });

    // PASO 2: Escapar HTML restante (después del código)
    const tempDiv = document.createElement('div');
    const parts = html.split(/(###CODEBLOCK\d+###|<code[^>]*>.*?<\/code>|__IMAGEN_AUTO_[A-Za-z0-9+/=]+_IMAGEN_AUTO__)/);

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part.startsWith('###CODEBLOCK') && !part.startsWith('<code') && !part.startsWith('__IMAGEN_AUTO_')) {
            tempDiv.textContent = part;
            parts[i] = tempDiv.innerHTML;
        }
    }
    html = parts.join('');

    // PASO 3: Procesar elementos de Markdown

    // Líneas horizontales PRIMERO
    html = html.replace(/^(---|___)\s*$/gim, '<hr>');
    html = html.replace(/^\*\*\*\s*$/gim, '<hr>');

    // (URLs de imagen ya procesadas antes del escape HTML)

    // Enlaces e imágenes de Markdown  
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');
    html = html.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Encabezados
    html = html.replace(/^######\s+(.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.*$)/gim, '<h1>$1</h1>');

    // Formato de texto (orden específico)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Citas
    html = html.replace(/^>\s+(.*$)/gim, '<blockquote>$1</blockquote>');

    // PASO 4: Listas simplificadas pero robustas
    const lines = html.split('\n');
    const result = [];
    let listStack = []; // Seguir el estado de las listas

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (/^[\-\*]\s+/.test(line)) {
            // Lista desordenada
            if (listStack.length === 0 || listStack[listStack.length - 1] !== 'ul') {
                // Cerrar lista ordenada si existe
                if (listStack.length > 0 && listStack[listStack.length - 1] === 'ol') {
                    result.push('</ol>');
                    listStack.pop();
                }
                result.push('<ul>');
                listStack.push('ul');
            }
            result.push('<li>' + line.replace(/^[\-\*]\s+/, '') + '</li>');
        }
        else if (/^\d+\.\s+/.test(line)) {
            // Lista ordenada
            if (listStack.length === 0 || listStack[listStack.length - 1] !== 'ol') {
                // Cerrar lista desordenada si existe
                if (listStack.length > 0 && listStack[listStack.length - 1] === 'ul') {
                    result.push('</ul>');
                    listStack.pop();
                }
                result.push('<ol>');
                listStack.push('ol');
            }
            result.push('<li>' + line.replace(/^\d+\.\s+/, '') + '</li>');
        }
        else {
            // Cerrar cualquier lista abierta
            while (listStack.length > 0) {
                const listType = listStack.pop();
                result.push(`</${listType}>`);
            }
            result.push(line);
        }
    }

    // Cerrar listas restantes
    while (listStack.length > 0) {
        const listType = listStack.pop();
        result.push(`</${listType}>`);
    }

    html = result.join('\n');

    // PASO 5: Párrafos
    const blocks = html.split(/\n\s*\n/);
    const finalBlocks = blocks.map(block => {
        block = block.trim();
        if (!block) return '';

        // No envolver elementos de bloque
        if (/^<(h[1-6]|blockquote|ul|ol|pre|hr|div)/.test(block)) {
            return block.replace(/\n/g, '<br>');
        }

        // Envolver texto en párrafos
        return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
    });

    html = finalBlocks.filter(block => block).join('\n\n');

    // Restaurar bloques de código
    html = html.replace(/###CODEBLOCK(\d+)###/g, (match, index) => {
        return codeBlocks[parseInt(index)] || '';
    });

    // PASO FINAL: Convertir marcadores de imagen de vuelta a elementos HTML
    html = html.replace(/__IMAGEN_AUTO_([A-Za-z0-9+/=]+)_IMAGEN_AUTO__/g, (match, base64Url) => {
        try {
            const url = atob(base64Url);
            return `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block;">`;
        } catch (e) {
            return match; // Si hay error, devolver el marcador original
        }
    });

    // Limpieza final
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
}

function generateChatName(prompt) {
    const words = prompt.split(' ').slice(0, 3);
    return words.map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function scrollToBottom() {
    setTimeout(() => {
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }, 100);
}

// --- NUEVO: Tipos de configuración en el panel 🔧 ---
let aiConfigType = 'APIs'; // Valor por defecto

function renderAiConfigTypeSelector() {
    // Elimina el selector de tipo de configuración del panel 🔧 (no hace nada)
    const modalContent = document.querySelector('.ai-config-modal-content');
    if (!modalContent) return;
    // Si existe el selector, elimínalo
    const oldSelectorDiv = modalContent.querySelector('#aiConfigTypeSelector')?.parentElement;
    if (oldSelectorDiv) oldSelectorDiv.remove();
    // No agregues ningún selector ni input aquí
}

function renderAiConfigPanelByType() {
    // Mostrar/ocultar APIs
    const aiListContainer = document.getElementById('aiListContainer');
    const addAiBtn = document.getElementById('addAiBtn');
    let mensajesPanel = document.getElementById('mensajesConfigPanel');

    if (aiConfigType === 'APIs') {
        if (aiListContainer) aiListContainer.style.display = '';
        if (addAiBtn) addAiBtn.style.display = '';
        if (mensajesPanel) mensajesPanel.style.display = 'none';
        // Sincronizar input de mensajes con el valor real
        const maxInput = document.getElementById('maxMessagesInput');
        if (maxInput) maxInput.value = getMaxMessagesPerChat();
    } else {
        if (aiListContainer) aiListContainer.style.display = 'none';
        if (addAiBtn) addAiBtn.style.display = 'none';
        // Panel de mensajes por chat
        if (!mensajesPanel) {
            mensajesPanel = document.createElement('div');
            mensajesPanel.id = 'mensajesConfigPanel';
            mensajesPanel.style.background = 'linear-gradient(135deg, #1a237e 0%, #0ff1ce 100%)';
            mensajesPanel.style.border = '2px solid var(--accent)';
            mensajesPanel.style.borderRadius = '12px';
            mensajesPanel.style.padding = '1.2rem 1rem 1rem 1rem';
            mensajesPanel.style.marginBottom = '1.2rem';
            mensajesPanel.style.color = '#fff';
            mensajesPanel.style.boxShadow = '0 2px 16px 0 rgba(59,130,246,0.13)';
            mensajesPanel.innerHTML = `
                <h4 style="margin-bottom:0.7rem;color:#fff;font-size:1.12em;text-shadow:0 0 8px #0ff1ce;">💬 Configuración de mensajes por chat</h4>
                <div style="display:flex;align-items:center;gap:0.7em;">
                <label for="maxMessagesPerChat" style="color:#e0e0e0;font-size:1em;font-weight:500;">
                        Máximo de mensajes por chat:
                    </label>
                    <input type="number" id="maxMessagesPerChat" min="1" max="1000" value="${getMaxMessagesPerChat()}" style="border-radius:8px;border:1.5px solid #0ff1ce;padding:0.4em 0.8em;width:90px;font-size:1em;background:#101c2c;color:#0ff1ce;font-weight:bold;box-shadow:0 0 8px #0ff1ce44;">
                </div>
                <div id="mensajesConfigInfo" style="margin-top:0.7em;font-size:0.97em;color:#e0e0e0;opacity:0.85;">
                    Limita la cantidad de mensajes visibles por chat. Los mensajes más antiguos se ocultarán automáticamente.
                </div>
            `;
            const modalContent = document.querySelector('.ai-config-modal-content');
            modalContent.insertBefore(mensajesPanel, document.getElementById('aiListContainer'));
            mensajesPanel.querySelector('#maxMessagesPerChat').addEventListener('input', function () {
                setMaxMessagesPerChat(this.value);
                // Sincronizar input de mensajes en APIs panel si existe
                const maxInput = document.getElementById('maxMessagesInput');
                if (maxInput) maxInput.value = this.value;
            });
        } else {
            mensajesPanel.style.display = '';
            mensajesPanel.querySelector('#maxMessagesPerChat').value = getMaxMessagesPerChat();
        }
    }
}

// --- Sincronización de input de mensajes eliminada para evitar duplicación ---
// El código de sincronización se maneja directamente en showAiConfigModal()

// Utilidades para mensajes por chat
function getMaxMessagesPerChat() {
    return MAX_MESSAGES_PER_CHAT;
}
function setMaxMessagesPerChat(val) {
    MAX_MESSAGES_PER_CHAT = parseInt(val, 10) || 20;
}

// --- APLICAR LÍMITE DE MENSAJES POR CHAT Y BLOQUEO DE ENVÍO ---
function canSendMessage() {
    const chat = getCurrentChat();
    if (!chat) return true;

    // --- NUEVO: Restablecer límite si han pasado más de 30 minutos desde el primer mensaje ---
    if (chat.messages && chat.messages.length > 0) {
        const firstMsgTime = new Date(chat.messages[0].timestamp || chat.messages[0].createdAt || chat.createdAt);
        const now = new Date();
        const diffMinutes = (now - firstMsgTime) / (1000 * 60);
        if (diffMinutes >= RESET_LIMIT_MINUTES) {
            chat.messages = [];
            updateCurrentChat({});
            saveChats();
            return true;
        }
    }

    const maxMsgs = getMaxMessagesPerChat();
    const realMsgs = chat.messages.filter(m => m.type === 'user' || m.type === 'ai');
    return realMsgs.length < maxMsgs;
}

window.retryGenerateMessage = async function (messageId) {
    const chat = getCurrentChat();
    if (!chat) return;
    const msg = chat.messages.find(m => m.id === messageId);
    if (!msg) return;
    // Recupera el prompt original del mensaje de error
    const prompt = document.querySelector(`[data-retry-prompt]`)?.dataset?.retryPrompt || '';
    if (prompt) {
        await sendMessage(prompt);
    }
};


// --- Corrige la sincronización del input de mensajes por chat (el input no existe en el HTML) ---
// Puedes eliminar el bloque que sincroniza el input 'maxMessagesInput' o agregar el input en el HTML si lo necesitas.
// Si decides eliminarlo, borra este bloque:
/*
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    // Sincronizar input de mensajes por chat en el panel de APIs
    const maxInput = document.getElementById('maxMessagesInput');
    if (maxInput) {
        maxInput.value = getMaxMessagesPerChat();
        maxInput.addEventListener('input', function () {
            setMaxMessagesPerChat(this.value);
            // Si está abierto el panel de mensajes, sincroniza también
            const mensajesInput = document.getElementById('maxMessagesPerChat');
            if (mensajesInput) mensajesInput.value = this.value;
        });
    }
});
*/

// Función duplicada eliminada - usando la función original arriba (línea 1916)

// =================== FUNCIONES DE BOTONES DE ACCIÓN DE MENSAJES ===================

// Función para copiar mensaje al portapapeles
async function copyMessage(messageId) {
    const chat = getCurrentChat();
    if (!chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    try {
        // Convertir markdown a texto plano para copiar
        const textContent = message.content.replace(/\*\*(.*?)\*\*/g, '$1') // Negritas
            .replace(/\*(.*?)\*/g, '$1')     // Cursivas
            .replace(/`(.*?)`/g, '$1')       // Código inline
            .replace(/```[\s\S]*?```/g, '[Código]') // Bloques de código
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Enlaces
            .replace(/#+\s/g, '')            // Títulos
            .replace(/\n\s*\n/g, '\n')       // Espacios extra
            .trim();

        await navigator.clipboard.writeText(textContent);

        // Feedback visual
        const button = document.querySelector(`[onclick="copyMessage('${messageId}')"]`);
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;
            button.style.color = '#22c55e';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.color = '';
            }, 1500);
        }
    } catch (error) {
        console.error('Error copiando mensaje:', error);
        alert('No se pudo copiar el mensaje');
    }
}

// Función para copiar código inline
window.copyInlineCode = async function(codeId) {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;

    try {
        const codeText = codeElement.textContent.trim();
        await navigator.clipboard.writeText(codeText);
        
        // Feedback visual
        const originalBg = codeElement.style.background;
        codeElement.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        codeElement.style.color = 'white';
        
        setTimeout(() => {
            codeElement.style.background = originalBg;
            codeElement.style.color = '';
        }, 1000);
    } catch (error) {
        console.error('Error copiando código:', error);
    }
}

// Función para copiar código de un bloque específico
window.copyCodeToClipboard = async function(codeId, button) {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;

    try {
        const codeText = codeElement.textContent;
        await navigator.clipboard.writeText(codeText);

        // Feedback visual
        const span = button.querySelector('span');
        const svg = button.querySelector('svg');
        const originalText = span ? span.textContent : '';
        
        if (span) span.textContent = '¡Copiado!';
        button.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        if (svg) svg.innerHTML = '<polyline points="20,6 9,17 4,12"></polyline>';
        
        setTimeout(() => {
            if (span) span.textContent = originalText;
            button.style.background = '';
            if (svg) svg.innerHTML = '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path>';
        }, 2000);
    } catch (error) {
        console.error('Error copiando código:', error);
        const span = button.querySelector('span');
        if (span) {
            span.textContent = 'Error al copiar';
            setTimeout(() => {
                span.textContent = 'Copiar código';
            }, 2000);
        }
    }
}

// Función para compartir mensaje
async function shareMessage(messageId) {
    const chat = getCurrentChat();
    if (!chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    try {
        // Convertir markdown a texto plano para compartir
        const textContent = message.content.replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/```[\s\S]*?```/g, '[Código]')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/#+\s/g, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        const shareText = `Respuesta de DevCenter IA:\n\n${textContent}\n\n--- Generado con DevCenter IA ---`;

        if (navigator.share) {
            await navigator.share({
                title: 'Respuesta de DevCenter IA',
                text: shareText
            });
        } else {
            // Fallback: copiar al portapapeles
            await navigator.clipboard.writeText(shareText);
            alert('Texto copiado al portapapeles para compartir');
        }

        // Feedback visual
        const button = document.querySelector(`[onclick="shareMessage('${messageId}')"]`);
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;
            button.style.color = '#3b82f6';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.color = '';
            }, 1500);
        }
    } catch (error) {
        console.error('Error compartiendo mensaje:', error);
        alert('No se pudo compartir el mensaje');
    }
}

// Función para escuchar mensaje (text-to-speech)
async function listenMessage(messageId) {
    const chat = getCurrentChat();
    if (!chat) return;

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) return;

    try {
        // Verificar soporte de speech synthesis
        if (!('speechSynthesis' in window)) {
            alert('Tu navegador no soporta la síntesis de voz');
            return;
        }

        const button = document.querySelector(`[onclick="listenMessage('${messageId}')"]`);
        if (!button) return;

        // Si ya está reproduciendo este mensaje, detener
        if (currentSpeakingMessageId === messageId && currentUtterance) {
            window.speechSynthesis.cancel();
            currentSpeakingMessageId = null;
            currentUtterance = null;

            // Restaurar botón a estado original (escuchar)
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <path d="M12 19v4"></path>
                    <path d="M8 23h8"></path>
                </svg>
            `;
            button.style.color = '';
            return;
        }

        // Parar cualquier reproducción de otros mensajes
        if (currentSpeakingMessageId && currentSpeakingMessageId !== messageId) {
            window.speechSynthesis.cancel();
            // Restaurar botón del mensaje anterior
            const prevButton = document.querySelector(`[onclick="listenMessage('${currentSpeakingMessageId}')"]`);
            if (prevButton) {
                prevButton.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <path d="M12 19v4"></path>
                        <path d="M8 23h8"></path>
                    </svg>
                `;
                prevButton.style.color = '';
            }
        }

        // Convertir markdown a texto plano para lectura
        const textToSpeak = message.content.replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/```[\s\S]*?```/g, 'Código de programación')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/#+\s/g, '')
            .replace(/\n\s*\n/g, '. ')
            .replace(/\n/g, '. ')
            .trim();

        if (!textToSpeak) {
            alert('No hay texto para reproducir');
            return;
        }

        // Crear utterance
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'es-ES';
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        utterance.volume = 1.4;

        // Actualizar estado global
        currentSpeakingMessageId = messageId;
        currentUtterance = utterance;

        // 🔹 Función para mostrar/ocultar el botón de stop
        function toggleStopButton(button) {
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                button.style.display = "inline-block"; // mostrar si hay algo hablando
            } else {
                button.style.display = "none"; // ocultar si no hay nada
            }
        }

        // Cambiar botón a "parar"
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        `;
        button.style.color = '#ef4444';

        // 🔹 mostrar stop al iniciar
        toggleStopButton(button);

        // Manejar eventos de finalización
        utterance.onend = () => {
            currentSpeakingMessageId = null;
            currentUtterance = null;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <path d="M12 19v4"></path>
                    <path d="M8 23h8"></path>
                </svg>
            `;
            button.style.color = '';

            // 🔹 ocultar stop al terminar
            toggleStopButton(button);
        };

        utterance.onerror = (event) => {
            currentSpeakingMessageId = null;
            currentUtterance = null;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <path d="M12 19v4"></path>
                    <path d="M8 23h8"></path>
                </svg>
            `;
            button.style.color = '';
            console.error('Error en síntesis de voz:', event.error || event.type || 'Error desconocido');

            // 🔹 ocultar stop si hubo error
            toggleStopButton(button);
        };

        // Reproducir
        window.speechSynthesis.speak(utterance);

        // 🔹 asegurar estado inicial correcto
        toggleStopButton(button);

    } catch (error) {
        console.error('Error reproduciendo mensaje:', error);

        // Limpiar estado en caso de error
        currentSpeakingMessageId = null;
        currentUtterance = null;

        // 🔹 ocultar stop en caso de fallo
        toggleStopButton(button);
    }
}

// Función global para detener la reproducción de voz
window.stopSpeech = function (button) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        // 🔹 ocultar stop cuando se cancela manualmente
        toggleStopButton(button);






    }
}





// Función global para detener la reproducción de voz
window.stopSpeech = function () {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// Función para recargar/regenerar respuesta - MEJORADA Y OPTIMIZADA
async function reloadMessage(messageId) {
    const chat = getCurrentChat();
    if (!chat) {
        console.error('No hay chat activo');
        return;
    }
    
    // Encontrar el mensaje de IA actual
    const messageIndex = chat.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
        console.error('No se encontró el mensaje con ID:', messageId);
        return;
    }
    
    // Encontrar el mensaje del usuario anterior
    let userMessage = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
        if (chat.messages[i].type === 'user') {
            userMessage = chat.messages[i];
            break;
        }
    }
    
    if (!userMessage) {
        alert('No se encontró el mensaje del usuario para recargar');
        return;
    }
    
    // Guardar el prompt del usuario
    const userPrompt = userMessage.content;
    
    // Resetear el índice de failover para intentar con todas las IAs disponibles
    currentAiIndex = 0;
    failedAiIds.clear();
    
    // Eliminar SOLO el mensaje de IA actual (no el del usuario)
    chat.messages.splice(messageIndex, 1);
    saveChats();
    
    // Recargar la vista del chat sin el mensaje eliminado
    loadCurrentChat();
    
    // Esperar un momento para que el DOM se actualice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mostrar indicador de escritura
    const thinkingMsg = addMessage('ai', 'Regenerando respuesta...', null, false);
    
    try {
        // Determinar si es generación de web o chat SEGÚN EL MODO ACTIVO
        if (isWebGenerationRequest(userPrompt) && activeAbility === 'program') {
            console.log('🔄 Regenerando página web...');
            
            // Generar página web
            const result = await generateWebpage(userPrompt);
            
            // Eliminar mensaje de "Regenerando..."
            const currentChat = getCurrentChat();
            if (currentChat && currentChat.messages.length > 0) {
                const lastMessage = currentChat.messages[currentChat.messages.length - 1];
                if (lastMessage.content === 'Regenerando respuesta...') {
                    currentChat.messages.pop();
                    saveChats();
                }
            }
            
            // Eliminar del DOM también
            const lastMsg = elements.messages.lastElementChild;
            if (lastMsg && lastMsg.textContent.includes('Regenerando respuesta...')) {
                lastMsg.remove();
            }
            
            // Agregar respuesta con código - CORREGIDO: usar result.code no result completo
            const confirmationMessage = result.message || `Página web regenerada exitosamente. Puedes ver la vista previa haciendo clic en el botón de abajo.`;
            addMessage('ai', confirmationMessage, result.code, true);
            
            console.log('✅ Página web regenerada correctamente');
        } else {
            console.log('🔄 Regenerando respuesta de chat según modo activo:', activeAbility);
            
            // Generar respuesta de chat usando el modo activo actual
            const response = await generateChatResponse(userPrompt);
            
            // Eliminar mensaje de "Regenerando..." del almacenamiento
            const currentChat = getCurrentChat();
            if (currentChat && currentChat.messages.length > 0) {
                const lastMessage = currentChat.messages[currentChat.messages.length - 1];
                if (lastMessage.content === 'Regenerando respuesta...') {
                    currentChat.messages.pop();
                    saveChats();
                }
            }
            
            // Eliminar del DOM también
            const lastMsg = elements.messages.lastElementChild;
            if (lastMsg && lastMsg.textContent.includes('Regenerando respuesta...')) {
                lastMsg.remove();
            }
            
            // Agregar respuesta regenerada
            addMessage('ai', response, null, true);
            
            console.log('✅ Respuesta regenerada correctamente con modo:', activeAbility);
        }
    } catch (error) {
        console.error('❌ Error al regenerar:', error);
        
        // Eliminar mensaje de "Regenerando..." del almacenamiento
        const currentChat = getCurrentChat();
        if (currentChat && currentChat.messages.length > 0) {
            const lastMessage = currentChat.messages[currentChat.messages.length - 1];
            if (lastMessage.content === 'Regenerando respuesta...') {
                currentChat.messages.pop();
                saveChats();
            }
        }
        
        // Eliminar del DOM también
        const lastMsg = elements.messages.lastElementChild;
        if (lastMsg && lastMsg.textContent.includes('Regenerando respuesta...')) {
            lastMsg.remove();
        }
        
        // Mostrar error detallado
        const errorMessage = error.message || 'Error desconocido';
        addMessage('ai', `Lo siento, ocurrió un error al regenerar la respuesta: ${errorMessage}. Por favor, intenta nuevamente.`, null, true);
    }
    
    // Hacer scroll al final
    scrollToBottom();
}

// Hacer la función global para que se pueda llamar desde onclick
window.reloadMessage = reloadMessage;

// 🚨 Nuevo: Detener cualquier voz cuando se recargue o cierre la página
window.addEventListener("beforeunload", () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
});

// 🚨 Opcional: También detener por si al cargar aún hay voces pendientes
window.addEventListener("load", () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
});

// =================== SISTEMA DE NOTAS GUARDADAS AUTOMÁTICAMENTE ===================

// Cargar notas guardadas del localStorage
function loadSavedNotes() {
    try {
        const data = localStorage.getItem('devCenter_savedNotes');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error cargando notas:', e);
        return [];
    }
}

// Guardar notas en localStorage
function saveSavedNotes(notes) {
    try {
        localStorage.setItem('devCenter_savedNotes', JSON.stringify(notes));
    } catch (e) {
        console.error('Error guardando notas:', e);
    }
}

// Validar si una nota contiene información útil
// ACTUALIZADO: Ahora acepta CASI TODO para no perder información
function isUsefulNote(noteContent) {
    if (!noteContent) return false;
    
    const content = noteContent.toLowerCase().trim();
    
    // Solo rechazar lo MUY obvio y completamente inútil
    const uselessPatterns = [
        /^(ok|okay|vale|sí|si|no|nel)$/i,
        /^(hola|hi|hey)$/i,
        /^(gracias|thanks)$/i,
        /^.{1,2}$/,
        /^\s*$/
    ];
    
    // Verificar si es completamente inútil
    for (const pattern of uselessPatterns) {
        if (pattern.test(content)) {
            console.log('⚠️ Nota descartada (demasiado simple):', noteContent);
            return false;
        }
    }
    
    // Si tiene más de 3 palabras, guardarla
    const wordCount = noteContent.trim().split(/\s+/).length;
    if (wordCount >= 3) {
        console.log('✅ Nota aceptada (tiene suficiente contenido):', noteContent);
        return true;
    }
    
    // Lista AMPLIA de indicadores de contenido valioso
    const valuableIndicators = [
        'gusta', 'prefiere', 'quiere', 'necesita', 'trabaja', 'proyecto',
        'favorito', 'mejor', 'usar', 'utiliza', 'adora', 'le gusta',
        'juega', 'juega a', 'disfruta', 'le encanta', 'su',
        'api', 'key', 'clave', 'configuración', 'desarrollando',
        'tecnología', 'framework', 'librería', 'biblioteca',
        'estilo', 'diseño', 'color', 'tema', 'lenguaje',
        'base de datos', 'servidor', 'puerto', 'url', 'dominio',
        'email', 'teléfono', 'dirección', 'nombre',
        'idea', 'plan', 'objetivo', 'meta', 'requisito',
        'minecraft', 'call of duty', 'brawl stars', 'fortnite', 'roblox',
        'juego', 'app', 'aplicación', 'programa', 'código', 'stars'
    ];
    
    // Si contiene CUALQUIER palabra indicadora, guardarla
    const hasValuableContent = valuableIndicators.some(keyword => 
        content.includes(keyword.toLowerCase())
    );
    
    // FILOSOFÍA: "Mejor guardar de más que perder información"
    const result = hasValuableContent || wordCount >= 2;
    
    if (result) {
        console.log('✅ Nota aceptada:', noteContent);
    } else {
        console.log('⚠️ Nota rechazada:', noteContent);
    }
    
    return result;
}

// Detectar y extraer información marcada con {GUARDAR: ...} y {MODIFICAR_PROMPT: ...}
function detectAndSaveNotes(content) {
    if (!content || typeof content !== 'string') return;
    
    // Patrón para detectar {GUARDAR: información}
    const savePattern = /\{GUARDAR:\s*([^}]+)\}/gi;
    const matches = [...content.matchAll(savePattern)];
    
    if (matches.length > 0) {
        const notes = loadSavedNotes();
        let savedCount = 0;
        
        matches.forEach(match => {
            const noteContent = match[1].trim();
            
            // Validar si la nota es útil antes de guardarla
            if (noteContent && isUsefulNote(noteContent)) {
                // Crear nueva nota
                const newNote = {
                    id: generateId(),
                    content: noteContent,
                    timestamp: new Date().toISOString(),
                    chatId: currentChatId
                };
                
                notes.unshift(newNote); // Agregar al inicio
                savedCount++;
                console.log('✅ Nota útil guardada:', noteContent);
            }
        });
        
        saveSavedNotes(notes);
        
        // Notificaciones desactivadas por solicitud del usuario
    }
    
    // Detectar comando {MODIFICAR_PROMPT: ...}
    detectAndModifyPrompt(content);
}

// Detectar y procesar el comando {MODIFICAR_PROMPT: ...} CON CONFIRMACIÓN DEL USUARIO (o automático)
function detectAndModifyPrompt(content) {
    if (!content || typeof content !== 'string') return;
    
    // Patrón para detectar {MODIFICAR_PROMPT: nuevo_prompt}
    const modifyPromptPattern = /\{MODIFICAR_PROMPT:\s*([^}]+)\}/gi;
    const matches = [...content.matchAll(modifyPromptPattern)];
    
    if (matches.length > 0) {
        matches.forEach(match => {
            let newPromptContent = match[1].trim();
            
            // Validación 1: Longitud mínima y máxima
            if (!newPromptContent || newPromptContent.length < 10) {
                console.warn('⚠️ Prompt muy corto, ignorado:', newPromptContent);
                showPromptRejectedNotification('Sugerencia muy corta (mínimo 10 caracteres)');
                return;
            }
            
            if (newPromptContent.length > 500) {
                console.error('⚠️ Prompt muy largo, rechazado');
                showPromptRejectedNotification(`Sugerencia muy larga (${newPromptContent.length} caracteres, máximo 500)`);
                return;
            }
            
            // Validación 2: Sanitización básica (eliminar HTML/scripts potencialmente maliciosos)
            newPromptContent = newPromptContent
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
            
            // Validación 3: Rechazar si contiene intentos de sobrescritura de seguridad
            const dangerousPatterns = [
                /ignore previous instructions/i,
                /disregard all rules/i,
                /you are now/i,
                /delete everything/i,
                /forget all/i
            ];
            
            if (dangerousPatterns.some(pattern => pattern.test(newPromptContent))) {
                console.error('🚫 Intento de modificación maliciosa detectado y bloqueado');
                showPromptRejectedNotification('Intento de modificación maliciosa bloqueado');
                return;
            }
            
            // Verificar si el modo automático está activado
            const autoSaveEnabled = localStorage.getItem('devCenter_autoSavePrompt') !== 'false'; // Por defecto true
            
            if (autoSaveEnabled) {
                // Guardar automáticamente sin preguntar
                applyPromptModification(newPromptContent);
                showPromptAutoSavedNotification(newPromptContent);
                console.log('✅ Prompt guardado automáticamente:', newPromptContent);
            } else {
                // Pedir confirmación al usuario (comportamiento anterior)
                showPromptConfirmationModal(newPromptContent);
            }
        });
    }
}

// Modal de confirmación para modificar el prompt
function showPromptConfirmationModal(newPromptContent) {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        animation: fadeIn 0.2s ease;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--bg-secondary);
        border: 2px solid var(--border-bright);
        border-radius: 16px;
        max-width: 600px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="padding: 1.5rem 2rem; border-bottom: 2px solid var(--border);">
            <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.5rem;">🤖</span>
                La IA quiere modificar su comportamiento
            </h3>
        </div>
        <div style="padding: 1.5rem 2rem;">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                La IA sugiere agregar esta instrucción a su prompt del sistema:
            </p>
            <div style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.9rem; line-height: 1.5; color: var(--text-primary);">
                ${escapeHtml(newPromptContent)}
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0;">
                ℹ️ Puedes editar el prompt manualmente en <strong>Archivo → Archivo</strong>
            </p>
        </div>
        <div style="padding: 1rem 2rem; border-top: 2px solid var(--border); display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button id="cancelPromptBtn" style="background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                Cancelar
            </button>
            <button id="acceptPromptBtn" style="background: var(--accent); border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                Aceptar y aplicar
            </button>
        </div>
    `;
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Eventos
    const cancelBtn = modal.querySelector('#cancelPromptBtn');
    const acceptBtn = modal.querySelector('#acceptPromptBtn');
    
    cancelBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    acceptBtn.addEventListener('click', () => {
        applyPromptModification(newPromptContent);
        modalOverlay.remove();
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// Aplicar la modificación del prompt después de confirmación
function applyPromptModification(newPromptContent) {
    // Obtener el prompt actual
    const currentPrompt = localStorage.getItem('devCenter_systemPrompt') || '';
    
    // Validar que el prompt total no exceda 5000 caracteres
    const totalLength = currentPrompt.length + newPromptContent.length + 2;
    if (totalLength > 5000) {
        showPromptRejectedNotification('Prompt demasiado largo. Limpia el prompt actual primero.');
        return;
    }
    
    // Guardar en historial antes de modificar
    savePromptHistory(currentPrompt);
    
    // Actualizar el prompt del sistema
    const updatedPrompt = currentPrompt 
        ? `${currentPrompt}\n\n${newPromptContent}` 
        : newPromptContent;
    
    localStorage.setItem('devCenter_systemPrompt', updatedPrompt);
    
    console.log('✅ Prompt del sistema actualizado por la IA:', newPromptContent);
    
    // Mostrar notificación de éxito
    showPromptModifiedNotification(newPromptContent);
}

// Guardar historial de prompts para permitir revertir
function savePromptHistory(currentPrompt) {
    try {
        const history = JSON.parse(localStorage.getItem('devCenter_promptHistory') || '[]');
        
        // Agregar el prompt actual al historial con timestamp
        history.unshift({
            prompt: currentPrompt,
            timestamp: new Date().toISOString()
        });
        
        // Mantener solo los últimos 10 cambios
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('devCenter_promptHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Error al guardar historial de prompts:', e);
    }
}

// Mostrar notificación de prompt rechazado
function showPromptRejectedNotification(reason) {
    // Notificaciones desactivadas por solicitud del usuario
    return;
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
        z-index: 10000;
        font-weight: 600;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">🚫</div>
            <div>
                <div style="font-weight: 700; margin-bottom: 0.25rem;">Modificación rechazada</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">${escapeHtml(reason)}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Mostrar notificación cuando la IA modifica el prompt del sistema
function showPromptModifiedNotification(promptContent) {
    // Notificaciones desactivadas por solicitud del usuario
    return;
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8b5cf6, #667eea);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        z-index: 10000;
        font-weight: 600;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const preview = promptContent.length > 100 
        ? promptContent.substring(0, 100) + '...' 
        : promptContent;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">🤖</div>
            <div>
                <div style="font-weight: 700; margin-bottom: 0.25rem;">IA actualizó el prompt del sistema</div>
                <div style="font-size: 0.85rem; opacity: 0.9; line-height: 1.4;">${escapeHtml(preview)}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Mostrar notificación cuando se guarda automáticamente un prompt
function showPromptAutoSavedNotification(promptContent) {
    // Notificaciones desactivadas por solicitud del usuario
    return;
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        font-weight: 600;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const preview = promptContent.length > 80 
        ? promptContent.substring(0, 80) + '...' 
        : promptContent;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">⚡</div>
            <div>
                <div style="font-weight: 700; margin-bottom: 0.25rem;">Prompt guardado automáticamente</div>
                <div style="font-size: 0.85rem; opacity: 0.9; line-height: 1.4;">${escapeHtml(preview)}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Notificaciones desactivadas por solicitud del usuario

// Mostrar modal de notas guardadas
function showSavedNotesModal() {
    const modal = document.getElementById('savedNotesModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        renderSavedNotes();
    }
}

// Ocultar modal de notas guardadas
function hideSavedNotesModal() {
    const modal = document.getElementById('savedNotesModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Renderizar notas guardadas
function renderSavedNotes() {
    const notesBody = document.getElementById('savedNotesBody');
    if (!notesBody) return;
    
    const notes = loadSavedNotes();
    
    if (notes.length === 0) {
        notesBody.innerHTML = `
            <div class="no-notes">
                <div class="no-notes-icon">📭</div>
                <p>No hay notas guardadas aún</p>
                <small>Cuando la IA guarde información importante usando {GUARDAR: ...}, aparecerá aquí</small>
            </div>
        `;
        return;
    }
    
    notesBody.innerHTML = notes.map(note => {
        const date = new Date(note.timestamp).toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isManual = note.type === 'manual';
        const badgeText = isManual ? 'Manual' : 'Auto';
        const badgeClass = isManual ? 'manual' : 'auto';
        
        return `
            <div class="saved-note-item" data-note-id="${note.id}">
                <div class="note-header">
                    <div class="note-title">
                        Nota guardada
                        <span class="saved-note-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="note-date">${date}</div>
                </div>
                <div class="note-content">${escapeHtml(note.content)}</div>
                <div class="note-actions">
                    <button class="note-action-btn" onclick="copyNote('${note.id}')" title="Copiar al portapapeles">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    ${isManual ? `
                    <button class="note-action-btn" onclick="editNote('${note.id}')" title="Editar nota">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button class="note-action-btn delete" onclick="deleteNote('${note.id}')" title="Eliminar nota">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Copiar nota al portapapeles
window.copyNote = function(noteId) {
    const notes = loadSavedNotes();
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        navigator.clipboard.writeText(note.content).then(() => {
            // Nota copiada (notificaciones desactivadas)
        }).catch(err => {
            console.error('Error copiando nota:', err);
        });
    }
};

// Eliminar nota
window.deleteNote = function(noteId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;
    
    let notes = loadSavedNotes();
    notes = notes.filter(n => n.id !== noteId);
    saveSavedNotes(notes);
    renderSavedNotes();
    // Notificaciones desactivadas
};

// Variables para edición de notas
let currentEditingNoteId = null;

// Mostrar modal para añadir/editar nota
function showNoteEditModal(noteId = null) {
    const modal = document.getElementById('noteEditModal');
    const title = document.getElementById('noteEditTitle');
    const textarea = document.getElementById('noteEditTextarea');
    
    if (!modal || !title || !textarea) return;
    
    currentEditingNoteId = noteId;
    
    if (noteId) {
        // Modo edición
        const notes = loadSavedNotes();
        const note = notes.find(n => n.id === noteId);
        if (note) {
            title.textContent = '✏️ Editar Nota';
            textarea.value = note.content;
        }
    } else {
        // Modo nueva nota
        title.textContent = '✏️ Nueva Nota';
        textarea.value = '';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => textarea.focus(), 100);
}

// Ocultar modal de edición
function hideNoteEditModal() {
    const modal = document.getElementById('noteEditModal');
    if (modal) {
        modal.style.display = 'none';
        currentEditingNoteId = null;
    }
}

// Guardar nota (nueva o editada)
function saveNote() {
    const textarea = document.getElementById('noteEditTextarea');
    if (!textarea) return;
    
    const content = textarea.value.trim();
    if (!content) {
        alert('Por favor escribe algo en la nota');
        return;
    }
    
    let notes = loadSavedNotes();
    
    if (currentEditingNoteId) {
        // Editar nota existente
        const noteIndex = notes.findIndex(n => n.id === currentEditingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex].content = content;
            notes[noteIndex].timestamp = new Date().toISOString();
            // Notificaciones desactivadas
        }
    } else {
        // Crear nueva nota
        const newNote = {
            id: generateId(),
            content: content,
            timestamp: new Date().toISOString(),
            type: 'manual'
        };
        notes.unshift(newNote); // Añadir al principio
        // Notificaciones desactivadas
    }
    
    saveSavedNotes(notes);
    renderSavedNotes();
    hideNoteEditModal();
}

// Editar nota existente
window.editNote = function(noteId) {
    showNoteEditModal(noteId);
};

// Event listeners para el modal de notas guardadas
document.addEventListener('DOMContentLoaded', () => {
    const savedNotesBtn = document.getElementById('savedNotesBtn');
    const savedNotesClose = document.getElementById('savedNotesClose');
    const savedNotesOverlay = document.getElementById('savedNotesOverlay');
    const addNoteBtn = document.getElementById('addNoteBtn');
    
    // Modal de notas guardadas
    if (savedNotesBtn) {
        savedNotesBtn.addEventListener('click', showSavedNotesModal);
    }
    
    if (savedNotesClose) {
        savedNotesClose.addEventListener('click', hideSavedNotesModal);
    }
    
    if (savedNotesOverlay) {
        savedNotesOverlay.addEventListener('click', hideSavedNotesModal);
    }
    
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => showNoteEditModal());
    }
    
    // Modal de edición de notas
    const noteEditClose = document.getElementById('noteEditClose');
    const noteEditOverlay = document.getElementById('noteEditOverlay');
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    
    if (noteEditClose) {
        noteEditClose.addEventListener('click', hideNoteEditModal);
    }
    
    if (noteEditOverlay) {
        noteEditOverlay.addEventListener('click', hideNoteEditModal);
    }
    
    if (cancelNoteBtn) {
        cancelNoteBtn.addEventListener('click', hideNoteEditModal);
    }
    
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveNote);
    }
    
    // Enter con Ctrl para guardar
    const textarea = document.getElementById('noteEditTextarea');
    if (textarea) {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                saveNote();
            }
        });
    }
});


// =================== MENÚ DESPLEGABLE DEL HEADER ===================
const headerMenuBtn = document.getElementById('headerMenuBtn');
const headerDropdownMenu = document.getElementById('headerDropdownMenu');
const notasMenuOption = document.getElementById('notasMenuOption');
const archivoMenuOption = document.getElementById('archivoMenuOption');

// Toggle menú desplegable
if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = headerDropdownMenu.style.display === 'block';
        headerDropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
}

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    if (headerDropdownMenu && !headerMenuBtn.contains(e.target) && !headerDropdownMenu.contains(e.target)) {
        headerDropdownMenu.style.display = 'none';
    }
});

// Opción de Notas
if (notasMenuOption) {
    notasMenuOption.addEventListener('click', () => {
        headerDropdownMenu.style.display = 'none';
        showSavedNotesModal();
    });
}

// Opción de Archivo
if (archivoMenuOption) {
    archivoMenuOption.addEventListener('click', () => {
        headerDropdownMenu.style.display = 'none';
        showArchivoModal();
    });
}

// =================== MODAL DE ARCHIVO ===================
const archivoModal = document.getElementById('archivoModal');
const archivoOverlay = document.getElementById('archivoOverlay');
const archivoClose = document.getElementById('archivoClose');
const systemPromptTextarea = document.getElementById('systemPromptTextarea');
const promptCharCount = document.getElementById('promptCharCount');
const clearPromptBtn = document.getElementById('clearPromptBtn');
const savePromptBtn = document.getElementById('savePromptBtn');

// Cargar prompt guardado
function loadSystemPrompt() {
    const savedPrompt = localStorage.getItem('devCenter_systemPrompt');
    if (savedPrompt && systemPromptTextarea) {
        systemPromptTextarea.value = savedPrompt;
        updateCharCount();
    }
    
    // Cargar estado del toggle de guardado automático (por defecto true)
    const autoSaveToggle = document.getElementById('autoSavePromptToggle');
    if (autoSaveToggle) {
        const autoSaveEnabled = localStorage.getItem('devCenter_autoSavePrompt') !== 'false'; // Por defecto true
        autoSaveToggle.checked = autoSaveEnabled;
    }
}

// Actualizar contador de caracteres
function updateCharCount() {
    if (systemPromptTextarea && promptCharCount) {
        promptCharCount.textContent = systemPromptTextarea.value.length;
    }
}

// Mostrar modal de archivo
function showArchivoModal() {
    if (archivoModal) {
        loadSystemPrompt();
        archivoModal.style.display = 'flex';
        archivoModal.classList.add('active');
    }
}

// Ocultar modal de archivo
function hideArchivoModal() {
    if (archivoModal) {
        archivoModal.style.display = 'none';
        archivoModal.classList.remove('active');
    }
}

// Eventos del modal de archivo
if (archivoClose) {
    archivoClose.addEventListener('click', hideArchivoModal);
}

if (archivoOverlay) {
    archivoOverlay.addEventListener('click', hideArchivoModal);
}

if (systemPromptTextarea) {
    systemPromptTextarea.addEventListener('input', updateCharCount);
}

if (clearPromptBtn) {
    clearPromptBtn.addEventListener('click', () => {
        if (systemPromptTextarea) {
            systemPromptTextarea.value = '';
            updateCharCount();
        }
    });
}

if (savePromptBtn) {
    savePromptBtn.addEventListener('click', () => {
        if (systemPromptTextarea) {
            const promptText = systemPromptTextarea.value.trim();
            localStorage.setItem('devCenter_systemPrompt', promptText);
            
            // Notificación desactivada por solicitud del usuario
            
            hideArchivoModal();
        }
    });
}

// Manejar toggle de guardado automático de prompts
const autoSavePromptToggle = document.getElementById('autoSavePromptToggle');
if (autoSavePromptToggle) {
    autoSavePromptToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        localStorage.setItem('devCenter_autoSavePrompt', isEnabled.toString());
        console.log(`⚡ Guardado automático de prompts ${isEnabled ? 'activado' : 'desactivado'}`);
        
        // Notificación desactivada por solicitud del usuario
    });
}

// =================== GENERADOR DE ICONOS ALEATORIOS ===================
function generateRandomFavicon() {
    const colors = [
        ['#5865f2', '#764ba2'],
        ['#10b981', '#059669'],
        ['#f59e0b', '#dc2626'],
        ['#8b5cf6', '#ec4899'],
        ['#06b6d4', '#3b82f6'],
        ['#ef4444', '#f97316'],
        ['#14b8a6', '#0891b2'],
        ['#a855f7', '#d946ef'],
        ['#f43f5e', '#be123c'],
        ['#22c55e', '#16a34a']
    ];
    
    const iconTypes = [
        // Círculo con borde
        (c1, c2) => `
            <circle cx="16" cy="16" r="12" fill="url(#grad)" stroke="${c1}" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="${c1}"/>
        `,
        // Cuadrado rotado (diamante)
        (c1, c2) => `
            <rect x="8" y="8" width="16" height="16" fill="url(#grad)" transform="rotate(45 16 16)"/>
            <rect x="12" y="12" width="8" height="8" fill="${c1}" transform="rotate(45 16 16)"/>
        `,
        // Triángulo
        (c1, c2) => `
            <polygon points="16,4 28,26 4,26" fill="url(#grad)" stroke="${c1}" stroke-width="2"/>
            <circle cx="16" cy="18" r="3" fill="${c1}"/>
        `,
        // Estrella
        (c1, c2) => `
            <polygon points="16,2 20,12 30,12 22,18 26,28 16,22 6,28 10,18 2,12 12,12" fill="url(#grad)" stroke="${c1}" stroke-width="1.5"/>
        `,
        // Hexágono
        (c1, c2) => `
            <polygon points="16,4 26,10 26,22 16,28 6,22 6,10" fill="url(#grad)" stroke="${c1}" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="${c1}"/>
        `,
        // Anillos concéntricos
        (c1, c2) => `
            <circle cx="16" cy="16" r="13" fill="none" stroke="${c1}" stroke-width="3"/>
            <circle cx="16" cy="16" r="8" fill="url(#grad)"/>
            <circle cx="16" cy="16" r="3" fill="${c2}"/>
        `,
        // Rayos solares
        (c1, c2) => `
            <circle cx="16" cy="16" r="7" fill="url(#grad)"/>
            <line x1="16" y1="2" x2="16" y2="8" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="16" y1="24" x2="16" y2="30" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="2" y1="16" x2="8" y2="16" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="24" y1="16" x2="30" y2="16" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="6" y1="6" x2="10" y2="10" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="22" y1="22" x2="26" y2="26" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="6" y1="26" x2="10" y2="22" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
            <line x1="22" y1="10" x2="26" y2="6" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>
        `,
        // Código/desarrollo
        (c1, c2) => `
            <rect x="4" y="4" width="24" height="24" rx="4" fill="url(#grad)"/>
            <polyline points="10,12 8,16 10,20" stroke="${c2}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <polyline points="22,12 24,16 22,20" stroke="${c2}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <line x1="18" y1="10" x2="14" y2="22" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
        `
    ];
    
    const randomColorPair = colors[Math.floor(Math.random() * colors.length)];
    const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];
    
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${randomColorPair[0]};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${randomColorPair[1]};stop-opacity:1" />
                </linearGradient>
            </defs>
            ${randomIconType(randomColorPair[0], randomColorPair[1])}
        </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        document.head.appendChild(link);
    }
    link.href = url;
}

// Generar favicon aleatorio al cargar la página
generateRandomFavicon();

// =================== GENERADOR DE ICONOS ÉPICOS E IMPRESIONANTES ===================
function generateFloatingBackgroundIcons() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (!welcomeMessage) return;
    
    // Verificar si ya existe el contenedor
    let container = welcomeMessage.querySelector('.floating-icons-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'floating-icons-container';
        welcomeMessage.insertBefore(container, welcomeMessage.firstChild);
    }
    
    const colors = [
        { primary: '#5865f2', secondary: '#764ba2', accent: '#f093fb', glow: '#c7d2fe' },
        { primary: '#10b981', secondary: '#059669', accent: '#34d399', glow: '#6ee7b7' },
        { primary: '#f59e0b', secondary: '#dc2626', accent: '#fbbf24', glow: '#fcd34d' },
        { primary: '#8b5cf6', secondary: '#ec4899', accent: '#c084fc', glow: '#e9d5ff' },
        { primary: '#06b6d4', secondary: '#3b82f6', accent: '#38bdf8', glow: '#7dd3fc' }
    ];
    
    const simpleIcons = [
        (c) => `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${c.primary}"/>`,
        (c) => `<circle cx="12" cy="12" r="10" fill="none" stroke="${c.primary}" stroke-width="2"/>`,
        (c) => `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="${c.primary}" stroke-width="2"/>`,
        (c) => `<polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" fill="${c.primary}"/>`,
        (c) => `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="${c.primary}" stroke-width="2"/>`
    ];
    
    const positions = [
        { left: '10%', top: '20%' },
        { left: '80%', top: '15%' },
        { left: '15%', top: '70%' },
        { left: '85%', top: '65%' },
        { left: '50%', top: '10%' }
    ];
    
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const color = colors[i % colors.length];
        const icon = simpleIcons[i % simpleIcons.length];
        const pos = positions[i];
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'floating-icon';
        iconDiv.style.left = pos.left;
        iconDiv.style.top = pos.top;
        iconDiv.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${icon(color)}</svg>`;
        
        container.appendChild(iconDiv);
    }
}

function generateCoolWelcomeIcon() {
    const colors = [
        { primary: '#5865f2', secondary: '#764ba2', accent: '#f093fb', glow: '#c7d2fe' },
        { primary: '#10b981', secondary: '#059669', accent: '#34d399', glow: '#6ee7b7' },
        { primary: '#f59e0b', secondary: '#dc2626', accent: '#fbbf24', glow: '#fcd34d' },
        { primary: '#8b5cf6', secondary: '#ec4899', accent: '#c084fc', glow: '#e9d5ff' },
        { primary: '#06b6d4', secondary: '#3b82f6', accent: '#38bdf8', glow: '#7dd3fc' },
        { primary: '#ef4444', secondary: '#f97316', accent: '#fb923c', glow: '#fca5a5' },
        { primary: '#14b8a6', secondary: '#0891b2', accent: '#5eead4', glow: '#99f6e4' },
        { primary: '#a855f7', secondary: '#d946ef', accent: '#e879f9', glow: '#f0abfc' }
    ];
    
    const epicIcons = [
        // Portal interdimensional con partículas
        (c) => `
            <defs>
                <radialGradient id="portalGrad">
                    <stop offset="0%" style="stop-color:${c.accent};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${c.primary};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:${c.secondary};stop-opacity:0.3" />
                </radialGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#portalGrad)" filter="url(#glow)">
                <animate attributeName="r" values="10;11;10" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="12" cy="12" r="7" fill="none" stroke="${c.primary}" stroke-width="0.5" opacity="0.6">
                <animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="12" cy="12" r="4" fill="none" stroke="${c.accent}" stroke-width="0.5" opacity="0.8">
                <animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            ${[0, 45, 90, 135, 180, 225, 270, 315].map(angle => `
                <circle cx="${12 + 6 * Math.cos(angle * Math.PI / 180)}" cy="${12 + 6 * Math.sin(angle * Math.PI / 180)}" r="0.8" fill="${c.glow}">
                    <animateTransform attributeName="transform" type="rotate" from="${angle} 12 12" to="${angle + 360} 12 12" dur="4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
                </circle>
            `).join('')}
        `,
        // Cohete futurista con estela
        (c) => `
            <defs>
                <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${c.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${c.secondary};stop-opacity:1" />
                </linearGradient>
            </defs>
            <g transform="translate(12,12)">
                <polygon points="0,-8 -3,-2 3,-2" fill="url(#rocketGrad)"/>
                <polygon points="-3,-2 -2,4 2,4 3,-2" fill="${c.accent}"/>
                <circle cx="0" cy="0" r="1.5" fill="${c.glow}">
                    <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <polygon points="-4,-1 -5,3 -3,2" fill="${c.secondary}" opacity="0.8"/>
                <polygon points="4,-1 5,3 3,2" fill="${c.secondary}" opacity="0.8"/>
                ${[0, 1, 2, 3, 4].map(i => `
                    <circle cx="0" cy="${6 + i * 2}" r="${0.5 + i * 0.2}" fill="${c.primary}" opacity="${0.6 - i * 0.1}">
                        <animate attributeName="cy" values="${6 + i * 2};${8 + i * 2};${6 + i * 2}" dur="1s" begin="${i * 0.1}s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="${0.6 - i * 0.1};0;${0.6 - i * 0.1}" dur="1s" begin="${i * 0.1}s" repeatCount="indefinite"/>
                    </circle>
                `).join('')}
                <animateTransform attributeName="transform" type="translate" values="12,12; 12,10; 12,12" dur="2s" repeatCount="indefinite"/>
            </g>
        `,
        // Cerebro digital con sinapsis
        (c) => `
            <defs>
                <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${c.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${c.accent};stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M 12,4 Q 8,4 6,6 Q 4,8 4,12 Q 4,16 6,18 Q 8,20 12,20 Q 16,20 18,18 Q 20,16 20,12 Q 20,8 18,6 Q 16,4 12,4" fill="url(#brainGrad)" opacity="0.3"/>
            <path d="M 8,7 Q 9,5 12,5 Q 15,5 16,7" fill="none" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </path>
            <path d="M 6,10 Q 7,8 9,9" fill="none" stroke="${c.secondary}" stroke-width="1.2" stroke-linecap="round">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="0.3s" repeatCount="indefinite"/>
            </path>
            <path d="M 15,9 Q 17,8 18,10" fill="none" stroke="${c.secondary}" stroke-width="1.2" stroke-linecap="round">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="0.6s" repeatCount="indefinite"/>
            </path>
            <path d="M 8,15 Q 10,13 12,14 Q 14,13 16,15" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-linecap="round">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.9s" repeatCount="indefinite"/>
            </path>
            <circle cx="9" cy="9" r="1" fill="${c.primary}"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>
            <circle cx="15" cy="9" r="1" fill="${c.primary}"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>
            <circle cx="12" cy="12" r="1.5" fill="${c.accent}"><animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/></circle>
            <circle cx="8" cy="15" r="0.8" fill="${c.secondary}"><animate attributeName="opacity" values="1;0.3;1" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
            <circle cx="16" cy="15" r="0.8" fill="${c.secondary}"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
        `,
        // ADN helicoidal
        (c) => `
            <defs>
                <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${c.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${c.accent};stop-opacity:1" />
                </linearGradient>
            </defs>
            <g opacity="0.9">
                <path d="M 8,2 Q 10,6 8,10 Q 6,14 8,18 Q 10,22 8,24" fill="none" stroke="url(#dnaGrad1)" stroke-width="2">
                    <animate attributeName="d" values="M 8,2 Q 10,6 8,10 Q 6,14 8,18 Q 10,22 8,24; M 8,2 Q 6,6 8,10 Q 10,14 8,18 Q 6,22 8,24; M 8,2 Q 10,6 8,10 Q 6,14 8,18 Q 10,22 8,24" dur="4s" repeatCount="indefinite"/>
                </path>
                <path d="M 16,2 Q 14,6 16,10 Q 18,14 16,18 Q 14,22 16,24" fill="none" stroke="${c.secondary}" stroke-width="2">
                    <animate attributeName="d" values="M 16,2 Q 14,6 16,10 Q 18,14 16,18 Q 14,22 16,24; M 16,2 Q 18,6 16,10 Q 14,14 16,18 Q 18,22 16,24; M 16,2 Q 14,6 16,10 Q 18,14 16,18 Q 14,22 16,24" dur="4s" repeatCount="indefinite"/>
                </path>
                ${[4, 8, 12, 16, 20].map(y => `
                    <line x1="8" y1="${y}" x2="16" y2="${y}" stroke="${c.accent}" stroke-width="1" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="${y * 0.1}s" repeatCount="indefinite"/>
                    </line>
                    <circle cx="8" cy="${y}" r="1.2" fill="${c.primary}">
                        <animate attributeName="r" values="1.2;1.5;1.2" dur="2s" begin="${y * 0.1}s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="16" cy="${y}" r="1.2" fill="${c.secondary}">
                        <animate attributeName="r" values="1.2;1.5;1.2" dur="2s" begin="${y * 0.1}s" repeatCount="indefinite"/>
                    </circle>
                `).join('')}
            </g>
        `,
        // Galaxia espiral
        (c) => `
            <defs>
                <radialGradient id="galaxyGrad">
                    <stop offset="0%" style="stop-color:${c.accent};stop-opacity:1" />
                    <stop offset="70%" style="stop-color:${c.primary};stop-opacity:0.5" />
                    <stop offset="100%" style="stop-color:${c.secondary};stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="8" fill="url(#galaxyGrad)" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="20s" repeatCount="indefinite"/>
            </circle>
            ${[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const spiralPoints = [];
                for(let j = 0; j < 5; j++) {
                    const dist = 2 + j * 1.5;
                    const a = (angle + j * 30) * Math.PI / 180;
                    spiralPoints.push(`${12 + dist * Math.cos(a)},${12 + dist * Math.sin(a)}`);
                }
                return `
                    <polyline points="${spiralPoints.join(' ')}" fill="none" stroke="${i % 2 === 0 ? c.primary : c.secondary}" stroke-width="1" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate" from="${angle} 12 12" to="${angle + 360} 12 12" dur="20s" repeatCount="indefinite"/>
                    </polyline>
                `;
            }).join('')}
            <circle cx="12" cy="12" r="2" fill="${c.accent}">
                <animate attributeName="r" values="2;2.5;2" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite"/>
            </circle>
            ${[...Array(12)].map((_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const dist = 4 + Math.random() * 4;
                return `
                    <circle cx="${12 + dist * Math.cos(angle)}" cy="${12 + dist * Math.sin(angle)}" r="${0.3 + Math.random() * 0.5}" fill="${c.glow}">
                        <animate attributeName="opacity" values="1;0.3;1" dur="${2 + Math.random() * 2}s" repeatCount="indefinite"/>
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="20s" repeatCount="indefinite"/>
                    </circle>
                `;
            }).join('')}
        `,
        // Energía plasmática
        (c) => `
            <defs>
                <radialGradient id="plasmaCore">
                    <stop offset="0%" style="stop-color:${c.accent};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${c.primary};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="6" fill="url(#plasmaCore)">
                <animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite"/>
            </circle>
            ${[0, 72, 144, 216, 288].map((angle, i) => `
                <g>
                    <path d="M 12,12 Q ${12 + 5 * Math.cos(angle * Math.PI / 180)},${12 + 5 * Math.sin(angle * Math.PI / 180)} ${12 + 9 * Math.cos(angle * Math.PI / 180)},${12 + 9 * Math.sin(angle * Math.PI / 180)}" fill="none" stroke="${c.primary}" stroke-width="2" opacity="0.6">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" begin="${i * 0.3}s" repeatCount="indefinite"/>
                        <animateTransform attributeName="transform" type="rotate" from="${angle} 12 12" to="${angle + 360} 12 12" dur="8s" repeatCount="indefinite"/>
                    </path>
                    <circle cx="${12 + 9 * Math.cos(angle * Math.PI / 180)}" cy="${12 + 9 * Math.sin(angle * Math.PI / 180)}" r="1.5" fill="${c.accent}">
                        <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" begin="${i * 0.3}s" repeatCount="indefinite"/>
                        <animateTransform attributeName="transform" type="rotate" from="${angle} 12 12" to="${angle + 360} 12 12" dur="8s" repeatCount="indefinite"/>
                    </circle>
                </g>
            `).join('')}
        `,
        // Nodo cuántico
        (c) => `
            <defs>
                <linearGradient id="quantumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${c.primary};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${c.accent};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${c.secondary};stop-opacity:1" />
                </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="8" fill="none" stroke="url(#quantumGrad)" stroke-width="0.5" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="10s" repeatCount="indefinite"/>
            </circle>
            ${[...Array(8)].map((_, i) => {
                const angle = (i * 45) * Math.PI / 180;
                return `
                    <g>
                        <line x1="12" y1="12" x2="${12 + 6 * Math.cos(angle)}" y2="${12 + 6 * Math.sin(angle)}" stroke="${c.primary}" stroke-width="0.5" opacity="0.3">
                            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" begin="${i * 0.25}s" repeatCount="indefinite"/>
                        </line>
                        <circle cx="${12 + 6 * Math.cos(angle)}" cy="${12 + 6 * Math.sin(angle)}" r="1.5" fill="${c.accent}">
                            <animate attributeName="r" values="1.5;2;1.5" dur="2s" begin="${i * 0.25}s" repeatCount="indefinite"/>
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="8s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                `;
            }).join('')}
            <circle cx="12" cy="12" r="3" fill="url(#quantumGrad)">
                <animate attributeName="r" values="3;3.5;3" dur="2s" repeatCount="indefinite"/>
            </circle>
        `,
        // Teletransportador
        (c) => `
            <defs>
                <linearGradient id="teleportGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${c.accent};stop-opacity:0.2" />
                    <stop offset="50%" style="stop-color:${c.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${c.accent};stop-opacity:0.2" />
                </linearGradient>
            </defs>
            ${[...Array(6)].map((_, i) => `
                <rect x="${6 + i * 2.5}" y="4" width="1.5" height="16" fill="url(#teleportGrad)" opacity="0.6">
                    <animate attributeName="y" values="4;0;4" dur="1.5s" begin="${i * 0.15}s" repeatCount="indefinite"/>
                    <animate attributeName="height" values="16;24;16" dur="1.5s" begin="${i * 0.15}s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" begin="${i * 0.15}s" repeatCount="indefinite"/>
                </rect>
            `).join('')}
            <circle cx="12" cy="12" r="4" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5">
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="12" cy="12" r="2" fill="${c.primary}">
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
            </circle>
        `
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = epicIcons[Math.floor(Math.random() * epicIcons.length)];
    
    const svg = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            ${randomIcon(randomColor)}
        </svg>
    `;
    
    const welcomeIcon = document.querySelector('.welcome-icon');
    if (welcomeIcon) {
        welcomeIcon.innerHTML = svg;
    }
}

// Generar icono épico al cargar la página
generateCoolWelcomeIcon();
// 6266
