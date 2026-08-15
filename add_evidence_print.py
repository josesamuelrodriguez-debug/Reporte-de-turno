import re

with open('src/components/TabResumen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

evidence_section = """          {rociadoras.length > 0 && (
"""

new_section = """          {/* EVIDENCIAS (FOTOS) */}
          {cabecera.evidencias && cabecera.evidencias.length > 0 && (
            <div className="space-y-1.5 pt-1 break-inside-avoid">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 border-b pb-0.5">
                <Image className="w-3.5 h-3.5 text-indigo-600" />
                9. Evidencias Fotográficas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {cabecera.evidencias.map((imgBase64, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                    <img src={imgBase64} alt={`Evidencia ${idx + 1}`} className="object-contain w-full max-h-40 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {rociadoras.length > 0 && ("""

content = content.replace(evidence_section, new_section)

with open('src/components/TabResumen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
