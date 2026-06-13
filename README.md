# DevCenterX

Panel web completo para crear, editar, publicar y gestionar aplicaciones web con IA.

## Descripción

DevCenterX es un dashboard de desarrollo diseñado como una plataforma de creación de aplicaciones con inteligencia artificial. Incluye un entorno de administración, páginas específicas para creación de apps, publicación, estadísticas, acceso y páginas legales.

## Estructura principal del proyecto

- `index.html`: página principal del dashboard.
- `style.css`: estilos globales del sitio.
- `script.js`: lógica general de la plataforma, navegación, menú lateral, temas y control de sesión.
- `agent.html`, `agent.js`, `agent.css`: pantalla de acceso / agente inicial.
- `metadata.json`: metadatos del proyecto principal y configuración del prompt.
- `package.json`: dependencias y scripts de desarrollo.
- `vercel.json`: reglas de despliegue, encabezados y reescrituras para Vercel.
- `tailwind-input.css` y `tailwind.config.js`: configuración y entrada de Tailwind para generar estilos en `docs/assets/tailwind.css`.

## Carpetas importantes

- `api/`: endpoints y utilidades del lado servidor.
  - `ChatGemini.js`: integración con Gemini.
  - `delete-project.js`: borrado de proyectos.
  - `deploy.js`: despliegue y publicación.
  - `gemini.js`: funciones relacionadas con Gemini.
  - `getGeminiKey.js`: obtención de claves de API.

- `Apps/`: sección de gestión de aplicaciones.
- `Programar/`: flujo principal de creación de apps, incluyendo `Programar/crear-app`.
- `Published-apps/`: página para apps publicadas.
- `Usage/`: panel de uso o tutoriales.
- `Ajustes/`: configuración de la plataforma.
- `login/`: lógica y páginas de inicio de sesión.
- `account/`: página de cuenta de usuario.
- `chat/`: sistema de chat y prompts con respaldo en `backup_prompts/`.
- `docs/`: documentación interna y generador de documentos.
- `public/`: recursos estáticos como `robots.txt` y `sitemap.xml`.

## Dependencias y tecnología

- Framework: HTML, CSS, JavaScript vanilla.
- Build / dev:
  - `vite`
  - `typescript`
  - `tailwindcss`
- Dependencias runtime:
  - `lit`
  - `@google/genai`
- Librerías de cliente incluidas via CDN:
  - `Font Awesome`
  - `Chart.js`
  - `ExcelJS`
  - `JSZip`
  - `PptxGenJS`
  - `docx`

## Uso local

1. Abrir `index.html` o `agent.html` en el navegador.
2. Si se requiere un servidor local, usar un servidor estático o Vite para desarrollo.
3. La página principal revisa `localStorage` para verificar la sesión y redirige a `agent.html` si no hay inicio de sesión válido.

## Scripts disponibles

- `npm run dev`: inicia el servidor de desarrollo de Vite.
- `npm run build`: construye el proyecto con Vite.
- `npm run preview`: vista previa local de la aplicación construida.
- `npm run build:tailwind`: genera `docs/assets/tailwind.css` desde `tailwind-input.css`.

## Despliegue

El proyecto está preparado para Vercel:

- `vercel.json` define los encabezados de seguridad y CORS para rutas importantes.
- Reescribe `Programar/crear-app` a `Programar/crear-app/index.html`.
- Configura `Cache-Control`, `X-Content-Type-Options`, `Referrer-Policy`, y políticas de contenido para carpetas como `/api/`, `/create/`, `/Programar/`, y `/login/`.

## Funcionalidades clave

- Dashboard principal con navegación lateral.
- Creación y gestión de apps en `Programar/crear-app`.
- Publicación de aplicaciones en `Published-apps/`.
- Estadísticas y uso en `Usage/`.
- Login y cuenta de usuario en `login/` y `account/`.
- Documentación interna en `docs/`.
- Chat y prompts guardados en `chat/`.
- Páginas legales en `politica-de-privacidad/` y `terminos-de-servicio/`.

## Notas adicionales

- La carpeta `dist/` parece contener archivos generados de compilación.
- `todo.md` incluye ideas y tareas pendientes del proyecto.
- Mantén la estructura de carpetas tal como está para que las rutas estén correctas.
- `metadata.json` puede usarse para configurar títulos y permisos de aplicaciones adicionales.

## Recomendaciones

- Probar en dispositivos móviles y escritorio.
- Revisar `vercel.json` si el proyecto se despliega desde un dominio distinto.
- Actualizar dependencias en `package.json` según sea necesario.
