# DevCenterX Docs - Configuración en Vercel

## 🚀 Pasos para desplegar en Vercel

### 1. **Variables de Entorno**
En tu proyecto de Vercel, debes agregar la siguiente variable de entorno:

```
GEMINI_API_KEY=tu-clave-api-aqui
```

**Cómo hacerlo:**
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega una nueva variable con:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Tu clave de API de Google Gemini
5. Deploy

### 2. **Estructura del Proyecto**

```
/docs          → Frontend (HTML + JS que accede a la API)
/api           → API routes de Vercel
  └─ getGeminiKey.js → Endpoint que sirve la API key
```

### 3. **Cómo Funciona**

1. El usuario carga la página en `/docs`
2. Al cargar, la aplicación hace una llamada a `/api/getGeminiKey`
3. El servidor obtiene `GEMINI_API_KEY` de las variables de entorno
4. La aplicación recibe la clave y la usa para llamar a Gemini API

### 4. **Obtener tu API Key de Gemini**

1. Ir a [Google AI Studio](https://aistudio.google.com/apikey)
2. Crear una nueva clave de API
3. Copiarla
4. Agregarla en Vercel como se describe arriba

### 5. **Prueba Local**

Para probar localmente con variables de entorno:

```bash
# Crear archivo .env.local
cp docs/.env.example .env.local
# Editar .env.local y agregar tu GEMINI_API_KEY
```

Luego ejecutar:
```bash
vercel dev
```

### 6. **Deploy**

```bash
vercel
```

La aplicación estará disponible en tu dominio de Vercel.

---

## 🔒 Seguridad

La API key se almacena **únicamente en las variables de entorno de Vercel**, nunca se expone en el código del cliente. El usuario siempre interactúa a través del endpoint `/api/getGeminiKey` que obtiene la clave de forma segura desde el servidor.
