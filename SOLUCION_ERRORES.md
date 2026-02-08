# Solución de Errores de Configuración y Permisos

## Error 1: 404 - /api/config
```
🔄 Intentando cargar configuración desde /api/config...
Failed to load resource: the server responded with a status of 404
```

### Solución:
Este error ocurre porque el servidor no está sirviendo el endpoint `/api/config`. 

**Opción A: Si usas Wrangler (Cloudflare Workers)**
```bash
# En la raíz del proyecto
wrangler dev
# El servidor estará en http://localhost:8787
```

**Opción B: Si usas Node.js local**
```bash
node server.js
```

**Opción C: Si la aplicación está en producción**
El endpoint debe estar disponible en tu dominio. Si aún así falla, la app usará configuración por defecto (puedes ignorar este error).

---

## Error 2: "Missing or insufficient permissions"
```
Error buscando usuario por email: FirebaseError: Missing or insufficient permissions.
```

### Solución:
Las reglas de seguridad de Firestore no permiten que los usuarios escriban en la base de datos.

**Pasos para arreglarlo:**
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona el proyecto `devcenter-agent-48c86`
3. En el menú izquierdo, haz clic en **Firestore Database**
4. Ve a la pestaña **Rules**
5. Reemplaza TODO el contenido con las reglas que están en [FIRESTORE_RULES.txt](FIRESTORE_RULES.txt)
6. Haz clic en **Publish**

**Las reglas permiten:**
- ✅ Los usuarios autenticados leer/escribir en su propio documento `/users/{uid}`
- ✅ Los usuarios leer perfiles de otros usuarios
- ✅ Los usuarios crear/editar sus proyectos

---

## Error 3: COOP - Cross-Origin-Opener-Policy
```
Cross-Origin-Opener-Policy policy would block the window.closed call.
```

### Solución:
Ya fue resuelta agregando headers a `server.js`. Si aún ves el error:
- Limpia caché: `Ctrl+Shift+R`
- Abreel navegador en incógnito
- Desactiva extensiones que bloquean cookies

---

## Checklist Final

- [ ] 1. Actualiza las reglas de Firestore (Ver pasos arriba) ⭐ IMPORTANTE
- [ ] 2. Inicia el servidor local (Wrangler o Node.js)
- [ ] 3. Limpia caché del navegador (`Ctrl+Shift+R`)
- [ ] 4. Intenta crear una cuenta nueva
- [ ] 5. El onboarding debe aparecer y guardar correctamente

---

## Si persisten los errores:

1. **Verifica la consola del navegador (F12)**
   - Busca mensajes rojos (errores)
   - Copia el error completo

2. **Verifica Firestore**
   - Ve a Firebase Console
   - Abre la colección `users`
   - Deberías ver documentos con estructura: `{ uid, email, username, avatar, displayName, provider, ... }`

3. **Verifica que Firebase Auth está funcionando**
   - Intenta crear una cuenta con email/password
   - Deberías ver el usuario en Firebase Console > Authentication

---

## Notas Importantes

- ⭐ Las reglas de Firestore son CRÍTICAS - Sin ellas, los usuarios no pueden guardar datos
- El error 404 de `/api/config` NO es crítico - la app funciona sin él
- El error COOP puede ignorarse si el login funciona correctamente
