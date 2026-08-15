import re

with open('src/components/TabPBO.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = r"\{\/\* Reprocess list: Historial \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*\}\)\s*\}\s*<\/div>\s*<\/div>\s*\} \/\* End of PBO detail panel)"

# Let's search by string split to be safe
start_str = "{/* Reprocess list: Historial */}"
end_str = "                    </div>\n                  )}\n"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = '''{/* Reprocess list: Historial */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Material reprocesado</h3>
                        {activeLoteRepros.length === 0 ? (
                          <div className="text-slate-400 text-xs font-semibold py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                            Ningún lote ha ingresado a reprocesamiento secundario aún.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                                  <th className="py-2.5 px-3">Tickets Generados</th>
                                  <th className="py-2.5 px-3 text-center">Camadas Generadas</th>
                                  <th className="py-2.5 px-3">Tickets Originales Consumidos</th>
                                  <th className="py-2.5 px-3">Status Calidad</th>
                                  <th className="py-2.5 px-3">Status Logística</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {activeLoteRepros.map(r => (
                                  <tr key={r.id} className="hover:bg-slate-50/50">
                                    <td className="py-2 px-3 font-mono font-bold text-indigo-700">{r.nuevo_ticket_reprocesado}</td>
                                    <td className="py-2 px-3 text-center font-semibold">{r.camadas_sueltas || '0'}</td>
                                    <td className="py-2 px-3 font-mono text-slate-500">{r.tickets_originales_consumidos}</td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        r.estatus_calidad === 'Aprobado' || r.estatus_calidad === 'Chequeado por Calidad'
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : r.estatus_calidad === 'Rechazado' 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {r.estatus_calidad}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        r.estatus_logistica === 'Confirmado' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : r.estatus_logistica === 'Inconsistencia' 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {r.estatus_logistica}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
'''
    final_str = content[:start_idx] + new_content + content[end_idx:]
    with open('src/components/TabPBO.tsx', 'w', encoding='utf-8') as f:
        f.write(final_str)
    print("Success")
else:
    print("Could not find boundaries")
