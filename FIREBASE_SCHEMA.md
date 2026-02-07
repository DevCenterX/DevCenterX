# Estructura de Firebase Firestore - DevCenterX



Tu base de datos Firebase (`devcenter-agent-48c86`) tiene 2 colecciones principales:


firestore (devcenter-agent-48c86)

├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── username: string
│       ├── displayName: string
│       ├── avatar: string
│       ├── provider: "email" | "google" | "github"
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       ├── plan: string ( muestar que plan tiene el usuario )
│       └── limit: string (muestar los limetes de uso del agente )
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
│
│

---

## Funciones de Cierre de Sesión y Limpieza de Almacenamiento

### `clearClientStorage()`
Borra completamente el almacenamiento cliente:
- `localStorage` — datos del usuario, preferencias, sesión
- `sessionStorage` — datos temporales
- **Cookies** — todas las cookies del dominio
- **CacheStorage** — cachés de service worker
- **IndexedDB** — bases de datos indexadas

```javascript
await window.clearClientStorage();
```

### `performSignOutAndRedirect()`
Función completa de cierre de sesión:
1. Confirma al usuario con `confirm()`
2. Limpia todo el cliente con `clearClientStorage()`
3. Cierra sesión en Firebase o Supabase (si están disponibles)
4. Redirige a `/new.html`

```javascript
await window.performSignOutAndRedirect();
```

**Uso en onclick:**
```html
<button onclick="window.performSignOutAndRedirect()">Cerrar sesión</button>
```

### Integración
- **index.html**: funciones disponibles globalmente en los menús de navegación
- **new.html**: funciones también disponibles para botones de logout en formularios de login
- Ambas páginas comparten la misma lógica de limpieza

---