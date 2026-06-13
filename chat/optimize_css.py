#!/usr/bin/env python3
"""
Script para limpiar CSS eliminando duplicaciones
Genera un archivo optimizado sin keyframes ni selectores duplicados
"""
import re

def limpiar_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. ELIMINAR ESPACIOS EN BLANCO EXCESIVOS
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # 2. CENTRALIZAR KEYFRAMES
    # Extraer todas las keyframes
    keyframes_dict = {}
    keyframes_pattern = r'@keyframes\s+(\w+)\s*\{[^}]*\}(?:\s*\n)?'
    
    for match in re.finditer(keyframes_pattern, content, re.DOTALL):
        name = match.group(1)
        keyframe = match.group(0)
        if name not in keyframes_dict:
            keyframes_dict[name] = keyframe
    
    # Reemplazar todas las keyframes con versión centralizada
    for match in re.finditer(r'@keyframes\s+\w+\s*\{[^}]*\}(?:\s*\n)?', content, re.DOTALL):
        full_kf = match.group(0)
        name = re.search(r'@keyframes\s+(\w+)', full_kf).group(1)
        if keyframes_dict.get(name):
            content = content.replace(full_kf, '')
    
    # Agregar keyframes centralizadas al inicio (después de :root)
    keyframes_text = '\n\n'.join(keyframes_dict.values())
    root_end = content.find(':root {')
    root_close = content.find('}', root_end) + 1
    
    # Insertar después de :root
    content = content[:root_close] + '\n\n/* ===== KEYFRAMES CENTRALIZADAS ===== */\n' + keyframes_text + content[root_close:]
    
    # Limpiar duplicados restantes (por si hay)
    content = re.sub(r'(@keyframes\s+\w+\s*\{[^}]*\})\s*\1+', r'\1', content, flags=re.DOTALL)
    
    # 3. ELIMINAR COMENTARIOS DUPLICADOS
    content = re.sub(r'(\/\*.*?\*\/)\s*\1+', r'\1', content, flags=re.DOTALL)
    
    # 4. LIMPIAR ESPACIOS EN BLANCO EXTRA AL FIN DE LÍNEA
    content = re.sub(r' +\n', '\n', content)
    
    return content

try:
    print("🔧 Limpiando CSS...")
    cleaned = limpiar_css()
    
    # Guardar archivo optimizado
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(cleaned)
    
    # Estadísticas
    original_size = len(open('style.css.backup', 'rb').read())
    new_size = len(cleaned.encode('utf-8'))
    reduction = ((original_size - new_size) / original_size) * 100
    
    print(f"✓ Limpieza completada")
    print(f"  • Tamaño original: {original_size / 1024:.2f} KB")
    print(f"  • Tamaño nuevo: {new_size / 1024:.2f} KB")
    print(f"  • Reducción: {reduction:.1f}%")
    print(f"  • Guardado en: style.css")
    
except Exception as e:
    print(f"✗ Error: {e}")
