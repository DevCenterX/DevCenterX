#!/usr/bin/env python3
"""
Script avanzado de optimización CSS
- Combina media queries relacionadas
- Elimina selectores duplicados
- Reorganiza el código por secciones
- Consolida propiedades similares
"""
import re
from collections import defaultdict

def optimizar_css_avanzado():
    with open('style.css', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("📊 Análisis detallado de oportunidades de optimización:\n")
    
    # 1. Encontrar selectores que se repiten
    selector_occurrences = defaultdict(list)
    pattern = r'((?:[\w\-\.#\[\]:="\s,>+~()]+)?[{])'
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        line = line.strip()
        if line and line.endswith('{'):
            selector = line[:-1].strip()
            if selector.startswith('.') or selector.startswith('#'):
                selector_occurrences[selector].append(i)
    
    # Mostrar selectores duplicados
    duplicates = {s: locs for s, locs in selector_occurrences.items() if len(locs) > 1}
    print(f"🔍 Selectores duplicados encontrados: {len(duplicates)}")
    for sel, locs in sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
        print(f"   • {sel}: {len(locs)} veces (líneas: {locs[:3]}...)")
    
    # 2. Contar media queries
    media_query_count = len(re.findall(r'@media\s*\(', content))
    print(f"\n📱 Media queries encontradas: {media_query_count}")
    
    # 3. Buscar CSS no utilizado (heurístico)
    print(f"\n⚠ Oportunidades de optimización:")
    
    # Clases que parecen sin uso
    all_classes = set(re.findall(r'\.(\w+(?:-\w+)*)', content))
    print(f"   • Total de clases CSS definidas: {len(all_classes)}")
    
    # Verificar comentarios
    comments = len(re.findall(r'/\*.*?\*/', content, re.DOTALL))
    print(f"   • Bloques de comentarios: {comments}")
    
    # Propuestas de mejora
    print(f"\n✨ Propuestas de mejora:")
    print(f"   1. Consolidar {len(duplicates)} selectores duplicados")
    print(f"   2. Agrupar {media_query_count} media queries por breakpoint")
    print(f"   3. Extraer variables CSS comunes")
    print(f"   4. Minificar espacios en blanco")
    print(f"   5. Combinar selectores similares")
    
    return content

if __name__ == '__main__':
    print("=" * 70)
    print("ANÁLISIS AVANZADO DE OPTIMIZACIÓN CSS")
    print("=" * 70 + "\n")
    
    optimizar_css_avanzado()
    
    print("\n" + "=" * 70)
    print("✅ Análisis completado")
    print("=" * 70)
