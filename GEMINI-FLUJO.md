# 🤖 Integración de Gemini con DevCenterX - Guía Rápida

## 📋 ¿Qué se ha configurado?

Se ha integrado el modelo **Gemini 3.1 Flash Lite** en DevCenterX para que los usuarios puedan:
1. **Chatear con IA** para obtener ayuda en la descripción de proyectos
2. **Crear apps automaticamente** con el comando `/PROGRAMAR`

---

## 🎯 Flujo de Uso

### 1️⃣ Usuario abre el dashboard (`/`)

El usuario ve un chat flotante en la esquina inferior derecha.

```
┌─────────────────────────────────────┐
│   Dashboard Principal               │
│                                     │
│                         ┌─────────┐ │
│                         │💬 Chat  │ │
│                         └─────────┘ │
└─────────────────────────────────────┘
```

### 2️⃣ Usuario inicia conversación con IA

- **Opción A:** Click en el ícono de chat flotante
- **Opción B:** Click en botón "Iniciar chat"
- **Opción C:** Click en el campo de búsqueda

El chat aparece con las opciones para charlar con Gemini.

### 3️⃣ Usuario escribe `/PROGRAMAR` para crear app

**Ejemplo de comandos válidos:**

```
/PROGRAMAR un blog con sistema de comentarios

/PROGRAMAR una aplicación para gestionar tareas con base de datos en tiempo real

/PROGRAMAR un juego de mesa tipo ajedrez
```

### 4️⃣ Sistema procesa la idea

```
┌────────────────────────────────────┐
│ Usuario escribe: /PROGRAMAR idea   │
│                                    │
│ ↓ gemini-chat.js detecta comando   │
│                                    │
│ ↓ Guarda idea en localStorage      │
│ ↓ Redirige a /Programar/crear-app  │
└────────────────────────────────────┘
```

### 5️⃣ Página de crear app recibe la idea

La descripción se carga automáticamente en el formulario:

```
┌───────────────────────────────────────┐
│ Crear Aplicación                      │
│                                       │
│ Nombre: [                         ]   │
│                                       │
│ Descripción: [Tu idea aquí          ] │ ← Cargada automáticamente
│                                       │
│ Tags: [...                          ] │
│                                       │
│ [Crear App] [Cancelar]               │
└───────────────────────────────────────┘
```

---

## 🔧 Arquitectura Técnica

### Archivos Principales

```
DevCenterX/
├── index.html              ← Página principal con formulario y chat
├── gemini-chat.js          ← Lógica del chat (UI + comunicación)
├── style.css               ← Estilos base
│
├── api/
│   └── gemini.js           ← Edge Function de Vercel para Gemini API
│
├── Programar/crear-app/
│   ├── index.html          ← Página de creación de apps
│   └── script.js           ← Lógica para recibir la idea del chat
│
└── vercel.json             ← Configuración de Vercel
```

### Flujo de Datos

```
┌──────────────────┐
│  Usuario en chat │
│  escribe: /PROG  │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│   gemini-chat.js                 │
│   - Detecta comando /PROGRAMAR    │
│   - Guarda idea en localStorage   │
│   - Redirige a crear-app          │
└────────┬─────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│  crear-app/script.js               │
│  - Recupera idea de localStorage   │
│  - Carga en formulario             │
│  - Muestra notificación visual     │
└────────────────────────────────────┘
```

---

## 🔌 Integración con Gemini API

### Endpoint: `/api/gemini`

**Solicitud:**
```json
{
  "message": "Ayúdame a crear un blog",
  "conversationHistory": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "reply": "Un blog es una excelente idea...",
  "messageId": 1234567890
}
```

### Variables de Entorno

```bash
# En Vercel Settings → Environment Variables
GEMINI_API_KEY=tu_api_key_de_google
```

---

## 🚀 Cómo Configurar en Vercel

### Paso 1: Obtener API Key
1. Ve a https://aistudio.google.com/app/apikey
2. Click en "Create API Key"
3. Copia la key

### Paso 2: Agregar a Vercel
1. Dashboard de Vercel → Proyecto DevCenterX
2. Settings → Environment Variables
3. Add: `GEMINI_API_KEY=<tu_key>`
4. Aplica a: Production, Preview, Development

### Paso 3: Deploy
```bash
git add .
git commit -m "Agregar integración Gemini"
git push origin main
```

---

## 🎨 UI del Chat

### Características
✅ Interfaz moderna con gradientes  
✅ Animaciones suaves  
✅ Responsive (funciona en móvil)  
✅ Historial de conversación  
✅ Indicador de carga animado  
✅ Función de scroll automático  

### Ubicación
- **Botón flotante:** Esquina inferior derecha
- **Ventana de chat:** Se abre al lado del botón
- **Tamaño:** 380px de ancho, 500px alto (adaptable a móvil)

---

## 📱 Comandos Especiales

### `/PROGRAMAR <descripción>`

Gatilla la creación automatizada de aplicaciones.

**Qué hace:**
1. Confirma al usuario que entendió la idea
2. Guarda la descripción
3. Redirige a `/Programar/crear-app?idea=<description>`
4. Pre-carga el formulario con la idea

**Ejemplos válidos:**
- `/PROGRAMAR un gestor de tareas`
- `/PROGRAMAR una tienda online con carrito`
- `/PROGRAMAR un diccionario visual`

---

## 🔒 Seguridad

| Aspecto | Medida |
|---------|--------|
| **API Key** | Almacenada en Vercel (lado servidor) |
| **Solicitudes** | Solo POST a `/api/gemini` |
| **CORS** | Configurado correctamente |
| **Exposición** | La key NUNCA se expone en el cliente |

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Chat no aparece | Verifica que `gemini-chat.js` esté en `index.html` |
| Error "API key no configurada" | Agrega `GEMINI_API_KEY` en Vercel Settings |
| No funciona `/PROGRAMAR` | Verifica que gemini-chat.js esté cargado (F12 Console) |
| Idea no se carga | Comprueba que `creator-app/script.js` está actualizado |

---

## 📊 Modelo Usado

- **Modelo:** Gemini 3.1 Flash Lite
- **API:** Google Generative AI
- **Temperatura:** 0.7 (creativo pero consistente)
- **Max Tokens:** 1024 por respuesta

---

## 📞 Contacto

Si tienes preguntas sobre la integración, revisa:
1. [SETUP-GEMINI.md](./SETUP-GEMINI.md) - Guía de configuración
2. Consola del navegador (F12) - Ver errores
3. Logs de Vercel - Ver errores del servidor

---

**Última actualización:** Marzo 2025
**Versión:** 1.0
