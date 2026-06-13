# DevCenterX Programar - Professional Code Editor

Una solución profesional de editor de código en línea con soporte para HTML, CSS, JavaScript y SVG. Construida con vanilla JavaScript, Firebase y Vercel para despliegue.

## ✨ Características Principales

### 🔧 Editor Profesional
- **Syntax Highlighting**: Resaltado de sintaxis en tiempo real para HTML, CSS y JavaScript
- **Line Numbers**: Números de línea con indicador de línea activa
- **Code Formatting**: Formateo automático de código con Ctrl+Shift+F
- **Live Preview**: Vista previa en vivo en iframe con inyección de CSS/JS
- **Multi-Language**: Soporte simultáneo para HTML, CSS, JS y SVG

### 💾 Persistencia de Datos
- **Auto-Save**: Guardado automático a Firebase cada 2 segundos de inactividad
- **Project Management**: Cambiar entre proyectos con el selector de proyectos
- **Deploy History**: Historial de despliegues en Vercel
- **Project Metadata**: Guardar nombre, descripción y tags de proyectos

### 🚀 Despliegue
- **Vercel Integration**: Publica tu app directamente a Vercel
- **Deploy Credits**: Sistema de créditos para limitar despliegues
- **Deploy URL**: Acceso rápido a URLs desplegadas
- **Historial**: Ver y gestionar despliegues anteriores

### 🎨 Interfaz Profesional
- **Dark Mode**: Tema oscuro optimizado para largas sesiones
- **Light Mode**: Tema claro para trabajo en ambientes iluminados
- **Responsive Design**: Funciona perfectamente en móviles, tablets y desktop
- **Modern UI**: Interfaz moderna con transiciones suaves y animaciones fluidas

### 📱 Responsivo
- **Desktop** (1024px+): Interfaz completa con todos los paneles
- **Tablet** (768px-1023px): Layout optimizado con sidebar colapsable
- **Mobile** (320px-767px): Interfaz compacta con navegación en drawer
- **5 Breakpoints**: Optimización en 1200px, 900px, 768px, 600px y 480px

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| **Ctrl+Shift+F** | Formatear código |
| **Ctrl+S** | Guardar (Auto-save siempre activo) |
| **Tab** en editor | Insertar tabulación |
| **Shift+Tab** en editor | Reducir indentación |

## 🎯 Cómo Usar

### 1. Crear un Nuevo Proyecto
```
1. Haz clic en "Crear App"
2. Ingresa nombre, descripción y tags
3. Presiona "Crear Proyecto"
```

### 2. Escribir Código
```
1. Selecciona la pestaña (HTML, CSS, JS, SVG)
2. Escribe tu código
3. La vista previa se actualiza automáticamente
```

### 3. Formatear Código
```
1. Método 1: Presiona Ctrl+Shift+F
2. Método 2: Haz clic en el botón de formato (icono de líneas)
```

### 4. Guardar y Desplegar
```
1. El código se guarda automáticamente cada 2 segundos
2. Para desplegar: Haz clic en "Publish"
3. Copia la URL y comparte tu proyecto
```

## 🛠️ Arquitectura Técnica

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Grid, Flexbox, Custom Properties, Media Queries
- **Vanilla JavaScript**: Sin dependencias externas (excepto Firebase)
- **Syntax Highlighting**: Tokenizer personalizado con reglas de lenguaje

### Backend
- **Firebase Firestore**: Persistencia de proyectos
- **Firebase Auth**: Autenticación de usuarios
- **Vercel API**: Despliegue de aplicaciones

### Performance
- **Debouncing**: Funciones debounceadas para evitar re-renders excesivos
  - Preview updates: máx 500ms
  - Syntax highlighting: máx 300ms
  - Auto-save: máx 2000ms (2 segundos)
- **Lazy Loading**: Componentes cargados bajo demanda
- **CSS Optimization**: Variables CSS para cambios de tema rápidos

## 📊 Sistema de Diseño

### Colores
```css
/* Light Mode (Default) */
--bg0: #fafbfc (Fondo principal)
--bg1: #f3f5f7 (Fondo secundario)
--bg2: #e7ebf0 (Fondo terciario)
--bg3: #d1dce6 (Fondo cuaternario)

/* Dark Mode */
--bg0: #0a0e1a (Fondo principal)
--bg1: #0f1420 (Fondo secundario)
--bg2: #17212e (Fondo terciario)
--bg3: #1f2a3c (Fondo cuaternario)

/* Acentos */
--accent: #6366f1 (Primario - Índigo)
--accent2: #22d3ee (Secundario - Cian)
--accent-green: #22c55e
--accent-red: #ef4444
```

### Tipografía
- **UI Font**: IBM Plex Sans (12px body, 14px headings)
- **Code Font**: JetBrains Mono (11.5px en desktop, 10.5px en móvil)

### Spacing
- **Padding Base**: 8px
- **Gap Base**: 8px
- **Border Radius**: 8-10px
- **Transiciones**: 0.2s-0.3s cubic-bezier(0.2, 0, 0, 1)

## 🔐 Seguridad

- **XSS Prevention**: Escape de HTML en output
- **CORS**: Restricción de orígenes en Firebase
- **Rate Limiting**: Límite de despliegues con sistema de créditos
- **Data Isolation**: Proyectos separados por usuario

## 📈 Optimizaciones Recientes

### Performance
- ✅ Debouncing en todos los event listeners
- ✅ Lazy loading de componentes
- ✅ CSS custom properties para cambios de tema sin repaint

### Visual
- ✅ Gradient gutter con 56px ancho
- ✅ Border-bottom tabs con colores por lenguaje
- ✅ Mejores sombras y transiciones
- ✅ Typography mejorada

### Mobile
- ✅ 5 breakpoints de responsividad
- ✅ Sidebar colapsable en móviles
- ✅ Interfaz compacta sin sacrificar funcionalidad
- ✅ Touch-friendly buttons (mín 44px)

## 📝 Notas de Desarrollo

### Para agregar un nuevo lenguaje:
1. Crear función `hl{Language}()` en script.js
2. Agregar reglas tokenizer en esa función
3. Crear CSS para nuevas clases (hl-xxx)
4. Agregar pestaña en HTML
5. Registrar en `currentFileType` y tabs

### Para personalizar temas:
1. Editar variables CSS en `:root`
2. Agregar overrides en `[data-theme="dark"]`
3. Probar en ambos modos

### Para agregar funcionalidades:
1. Mantener vanilla JavaScript (sin dependencies)
2. Usar debounce para operaciones frecuentes
3. Persistir a Firebase para sincronización
4. Probar en mobile (768px y menor)

## 🚢 Despliegue

```bash
# Deploy a Vercel
npm run deploy

# O manual:
vercel
```

## 📄 Licencia

Parte del proyecto DevCenterX. Todos los derechos reservados.

---

**Versión**: 2.0 (Profesional)  
**Última actualización**: 2024  
**Estado**: Production-Ready ✅
