#!/usr/bin/env python3
"""
Script para limpiar y optimizar CSS
Elimina duplicaciones de keyframes y clases
"""
import re
from collections import Counter

# Leer el archivo
with open('style.css', 'r', encoding='utf-8') as f:
    content = f.read()

print("=" * 60)
print("ANÁLISIS DE CSS - BÚSQUEDA DE DUPLICACIONES")
print("=" * 60)

# 1. Encontrar keyframes duplicados
keyframes = re.findall(r'@keyframes\s+(\w+)\s*{', content)
print(f"\n✓ Total de keyframes: {len(keyframes)}")
print(f"✓ Keyframes únicos: {len(set(keyframes))}")

# Mostrar duplicados
kf_counter = Counter(keyframes)
duplicates = {k: v for k, v in kf_counter.items() if v > 1}
if duplicates:
    print(f"\n⚠ KEYFRAMES DUPLICADOS:")
    for kf, count in duplicates.items():
        print(f"  • @keyframes {kf}: aparece {count} veces")

# 2. Encontrar selectores duplicados
selectors = re.findall(r'^(\.\w+(?:-\w+)*|\w+)\s*{', content, re.MULTILINE)
print(f"\n✓ Total de selectores: {len(selectors)}")
print(f"✓ Selectores únicos: {len(set(selectors))}")

sel_counter = Counter(selectors)
sel_duplicates = {k: v for k, v in sel_counter.items() if v > 1}
if sel_duplicates:
    print(f"\n⚠ SELECTORES DUPLICADOS (Top 15):")
    for sel, count in sorted(sel_duplicates.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"  • {sel}: aparece {count} veces")

# 3. Análisis de tamaño
lines = content.count('\n')
print(f"\n📊 ESTADÍSTICAS:")
print(f"  • Líneas: {lines}")
print(f"  • Caracteres: {len(content):,}")
print(f"  • Kb: {len(content) / 1024:.2f}")

print("\n" + "=" * 60)
print("MEJORAS RECOMENDADAS:")
print("=" * 60)
print("""
1. ✓ Centralizar keyframes duplicados
2. ✓ Consolidar .back-btn, .user-info-btn (definidas 2+ veces)
3. ✓ Agrupar media queries relacionadas
4. ✓ Eliminar comentarios duplicados
5. ✓ Optimizar nombres de variables
6. ✓ Organizar por secciones (layout, componentes, responsive)
""")
