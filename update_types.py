import re

with open('src/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("camadas_sueltas: number;", "camadas_sueltas: number;\n  paletas_nuevas?: number;")

if "export interface RocePrueba" not in content:
    content += """
export interface RocePrueba {
  id: string;
  fecha: string;
  turno: number;
  codigo_sap: string;
  producto: string;
  lote: string;
  resultados: Record<number, string>; // { 1: 'Sin roce', 2: 'Leve', ..., 12: 'Moderado' }
  usuario: string;
  creado_el: string;
}
"""

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
