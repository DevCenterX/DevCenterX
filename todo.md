# Estructura de Firebase Firestore - DevCenterX
Web: https://devcenterx.vercel.app
.

Tu base de datos Firebase (`devcenter-agent-48c86`) tiene 3 colecciones principales:


firestore (devcenter-agent-48c86)

├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── username: string
│       ├── avatar: string
│       ├── provider: "email" | "google" | "github"
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       ├── plan: string (muestra el plan de usuario al crearse se pone como {Normal})
│       └── limit: number (muestar los limetes de uso del agente al inio es {0})
│      
│       
│
├── proyectos/
│   └── {uid}/
│       ├── uid: string
│       ├── proyectos: array
│       └── createdAt: timestamp
│ 
│ 
│ 
├── proyectos-publicos/  (muestra los proyectos ya publicados en la secion de apps)
│   └── {uid}/
│       ├── uid: string
│       ├── proyectos: array
│       ├── cometarios: array
│       ├── likes: number
│       ├── visitas: number
│       └── createdAt: timestamp





 ---------------------- Extra ----------------------

Planes existentes: Normal, Premium, Pro
Limite de apps segun plan: Normal (10 apps), Premium (15 apps), Pro (30 apps)



// 3 Claves en localStorage
  localStorage.setItem('devcenter_user_id', user.uid);
  localStorage.setItem('devcenter_isLoggedIn', 'true');
  localStorage.setItem('devcenter_user_name', user.displayName || user.email?.split('@')[0] || 'Usuario');





 ---------------------- Cuenta nueva  ----------------------


/**
 * Save user data in Firestore
 */
async function saveUserData(user, provider) {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email || '',
    username: user.displayName || user.email?.split('@')[0] || 'user_' + user.uid.substring(0, 8),
    avatar: user.photoURL || '',
    provider: provider,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    plan: 'Normal',
    limit: '0'
  });

  // Guardar SOLO 3 claves en localStorage
  localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
    localStorage.setItem('devcenter_user_name', user.displayName || user.email?.split('@')[0] || 'Usuario');
  }







---------------------- Integrar  ----------------------


<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
    authDomain: "devcenter-agent-48c86.firebaseapp.com",
    projectId: "devcenter-agent-48c86",
    storageBucket: "devcenter-agent-48c86.firebasestorage.app",
    messagingSenderId: "911929994293",
    appId: "1:911929994293:web:1d08f68b4c507ee162557c",
    measurementId: "G-S5GTYBRVK8"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

---

## ✅ MEJORAS COMPLETADAS EN CHAT - MARZO 2026

### 🎯 Optimización del Sistema de Prompts
- **Eliminadas dependencias externas**: Removidos archivos .txt (prompt-*.txt) que se cargaban con fetch()
- **Prompts embebidos**: Todo el contenido de prompts ahora está directamente en `chat/script.js`
- **Mejora de rendimiento**: Eliminada latencia de carga de archivos externos
- **Mayor confiabilidad**: No más errores por archivos faltantes o rutas incorrectas

### 📝 Prompts Embebidos:
1. **Modo Información** (`info`): Asistente amigable y útil para preguntas generales
2. **Modo Memoria Extendida** (`memory`): Análisis con contexto histórico de conversaciones
3. **Modo Programador** (`program`): Desarrollo web avanzado con mejores prácticas
4. **Modo Generar Imágenes** (`image`): Creación de descripciones detalladas para IA
5. **Guía de Prompt Engineering**: Ayuda automática cuando se detectan solicitudes de prompts

### 🔧 Cambios Técnicos:
- Modificada función `getActiveAbilityPrompt()` para incluir prompts inline
- Actualizada detección de solicitudes de ayuda con prompts
- Respaldados archivos originales en `chat/backup_prompts/`
- Verificada sintaxis y funcionalidad del código

### 🚀 Beneficios:
- ✅ Carga más rápida del chat
- ✅ Menos archivos externos que mantener
- ✅ Mayor estabilidad y confiabilidad
- ✅ Despliegue más simple (sin archivos .txt)
- ✅ Mejor experiencia de usuario

**Archivos afectados**: `chat/script.js`
**Estado**: ✅ COMPLETADO Y VERIFICADO

---

## ✅ **REORGANIZACIÓN DE CONFIGURACIONES - MARZO 2026**

### 🎯 **Reorganización del Sistema de Configuración**
- **Configuración de imágenes al inicio**: Movida la sección de generación de imágenes al principio del archivo
- **Modelos específicos por modo**: Implementado sistema de modelos optimizados para cada modo de chat
- **Sistema de failover mejorado**: Prioriza modelos específicos del modo antes de usar modelos generales

### 📋 **Modelos Específicos por Modo:**
1. **Modo Programador** → Gemini 2.0 Flash-Lite
   - `rpm: 30` - Alta frecuencia para desarrollo rápido
   - `tpm: 1000000` - Capacidad masiva para código extenso
   - `rpd: 200` - Suficiente para desarrollo intensivo

2. **Modo Memoria Extendida** → Gemini 2.5 Pro
   - `rpm: 5` - Más preciso para análisis profundo
   - `tpm: 125000` - Alto para análisis contextual detallado
   - `rpd: 100` - Moderado para análisis profundos

3. **Modo Información** → Gemini 2.5 Flash-Lite
   - `rpm: 15` - Buen balance velocidad/precisión
   - `tpm: 250000` - Suficiente para respuestas informativas
   - `rpd: 1000` - Alto volumen para consultas generales

4. **Modo Generar Imágenes** → Gemini 2.5 Flash
   - `rpm: 10` - Moderado para generación creativa
   - `tpm: 250000` - Bueno para descripciones detalladas
   - `rpd: 250` - Suficiente para generación de imágenes

5. **Modo Agente (default)** → Gemini 2.0 Flash
   - `rpm: 15` - Buen balance general
   - `tpm: 1000000` - Alta capacidad
   - `rpd: 200` - Suficiente para uso general

### 🔧 **Cambios Técnicos:**
- Nueva constante `MODE_SPECIFIC_MODELS` con configuraciones por modo
- Función `getModeSpecificModel()` para seleccionar modelo según modo activo
- Modificación de `getNextAvailableAi()` para priorizar modelos específicos
- Actualización de `loadAiConfigs()` para incluir modelos específicos automáticamente
- Documentación completa de `rpm`, `tpm`, `rpd` para cada modelo

### 🚀 **Beneficios Obtenidos:**
- **Optimización por tarea**: Cada modo usa el modelo más adecuado para su función
- **Mejor rendimiento**: Modelos específicos optimizados para casos de uso particulares
- **Configuración clara**: Explicaciones detalladas de límites y capacidades
- **Failover inteligente**: Sistema que mantiene funcionalidad si un modelo falla
- **Organización mejorada**: Configuraciones críticas al inicio del archivo

**Archivos afectados**: `chat/script.js`
**Estado**: ✅ COMPLETADO Y FUNCIONANDO

---

## ✅ **ELIMINACIÓN DE CONFIGURACIÓN DUPLICADA - MARZO 2026**

### 🗑️ **Eliminación de CONFIGURACIÓN POR DEFECTO DE IAs**
- **Sección eliminada**: `DEFAULT_AI_CONFIGS` completa (~50 líneas de código)
- **Motivo**: Redundante con `MODE_SPECIFIC_MODELS` que ya configura todos los modelos necesarios
- **Referencias eliminadas**: Todas las llamadas a `DEFAULT_AI_CONFIGS.slice()` en `loadAiConfigs()`

### 🔄 **Actualización de loadAiConfigs()**
- **Nueva lógica**: Inicializa directamente con modelos específicos por modo
- **Eliminadas dependencias**: No más respaldo a configuraciones por defecto duplicadas
- **Simplificación**: Código más directo y mantenible

### 📋 **Estructura Final de Configuración:**
```
1. CONFIGURACIÓN DE GENERACIÓN DE IMÁGENES
2. CONFIGURACIÓN DE MODELOS POR MODO (única fuente de verdad)
3. CONFIGURACIÓN DE IAs (variables de estado)
4. loadAiConfigs() (inicializa con modelos específicos)
```

### 🚀 **Beneficios Obtenidos:**
- **Eliminación de duplicación**: Un solo lugar para configurar modelos
- **Código más limpio**: ~50 líneas eliminadas
- **Mantenimiento simplificado**: Una sola configuración que mantener
- **Consistencia garantizada**: Modelos específicos por modo como fuente única de verdad
- **Inicialización automática**: Los modelos se generan automáticamente al cargar

**Archivos afectados**: `chat/script.js`
**Estado**: ✅ COMPLETADO Y VERIFICADO

---

## ✅ **LIMPIEZA Y SIMPLIFICACIÓN - MARZO 2026**

### 🧹 **Eliminación Completa del SISTEMA DE AVISOS**
- **Funciones eliminadas**: `mostrarAviso()`, `cerrarAviso()`, `debesMostrarAviso()`, `incrementarContadorAviso()`, `resetearContadorAviso()`
- **Constantes eliminadas**: `AVISO_ACTIVO`, `AVISO_TITULO`, `AVISO_DESCRIPCION`, `AVISO_VECES_MOSTRADAS`
- **Llamadas removidas**: Eliminada la llamada a `mostrarAviso()` en `DOMContentLoaded`
- **Código limpio**: Removidas todas las referencias a localStorage de avisos

### 🔧 **Simplificación de CONFIGURACIÓN DE MODELOS POR MODO**
- **Configuración directa**: Eliminados `id:` y `name:` manuales de cada modelo
- **Generación automática**: `getModeSpecificModel()` ahora genera `id` y `name` automáticamente
- **Sintaxis simplificada**: Solo `url`, `apiKey`, `rpm`, `tpm`, `rpd` por modelo
- **Compatibilidad mantenida**: Sistema de failover sigue funcionando correctamente

### 📋 **Estructura Simplificada de Modelos:**
```javascript
MODE_SPECIFIC_MODELS = {
    program: {
        url: 'https://...',
        apiKey: '...',
        rpm: 30, tpm: 1000000, rpd: 200
    },
    // ... sin id: ni name: manuales
}
```

### 🔄 **Sistema de Generación Automática:**
- **ID automático**: `mode-${activeAbility}` (ej: `mode-program`)
- **Nombre automático**: `Modo ${modeName}` (ej: `Modo Programador`)
- **Mapeo inteligente**: Conversión automática de claves a nombres legibles

### 🚀 **Beneficios Obtenidos:**
- **Código más limpio**: Eliminadas ~100 líneas de código innecesario
- **Mantenimiento reducido**: Una sola configuración por modelo
- **Flexibilidad**: Fácil agregar nuevos modos sin código adicional
- **Consistencia**: Nombres generados automáticamente y uniformes
- **Rendimiento**: Menos código = carga más rápida

**Archivos afectados**: `chat/script.js`
**Estado**: ✅ COMPLETADO Y VERIFICADO
</script>