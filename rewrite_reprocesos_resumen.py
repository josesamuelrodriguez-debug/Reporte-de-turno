import re

with open('src/components/TabResumen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "          {/* 7. Reprocesos realizados durante el turno */}"
end_str = "          {/* 8. Colores de Rociadoras Activas */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = '''          {/* 7. Reprocesos realizados durante el turno */}
          {matchingReprocesos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 border-b pb-0.5">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                7. Reprocesos realizados durante el turno
              </h3>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-indigo-50/50 text-indigo-800 font-bold border-b border-indigo-100">
                    <tr>
                      <th className="py-1.5 px-2.5">Código SAP</th>
                      <th className="py-1.5 px-2.5">Orden</th>
                      <th className="py-1.5 px-2.5">Lote</th>
                      <th className="py-1.5 px-2.5">Tickets Reprocesados (Nuevos)</th>
                      <th className="py-1.5 px-2.5">Total Generado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(() => {
                      // Group by PBO (which gives us SAP, Orden, Lote)
                      const groupedRepros: Record<string, {
                        sap: string;
                        orden: string;
                        lote: string;
                        tickets: string[];
                        paletas: number;
                        camadas: number;
                      }> = {};

                      matchingReprocesos.forEach(r => {
                        const pboInfo = pboLotes.find(l => l.id_pbo === r.id_pbo);
                        if (!pboInfo) return;
                        
                        const catalogItem = CATALOGO_PRODUCTOS_PBO.find(c => c.nombre.toUpperCase() === pboInfo.producto.toUpperCase());
                        const codigoSap = catalogItem ? catalogItem.codigo : 'N/D';
                        const key = `${codigoSap}-${pboInfo.orden}-${pboInfo.lote}`;

                        if (!groupedRepros[key]) {
                          groupedRepros[key] = {
                            sap: codigoSap,
                            orden: pboInfo.orden,
                            lote: pboInfo.lote,
                            tickets: [],
                            paletas: 0,
                            camadas: 0
                          };
                        }

                        if (r.nuevo_ticket_reprocesado && r.nuevo_ticket_reprocesado !== 'N/A') {
                           groupedRepros[key].tickets.push(r.nuevo_ticket_reprocesado);
                           groupedRepros[key].paletas += 1;
                        }
                        if (r.camadas_sueltas > 0) {
                           groupedRepros[key].camadas += r.camadas_sueltas;
                        }
                      });

                      return Object.values(groupedRepros).map((group, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/20">
                          <td className="py-1.5 px-2.5 font-bold font-mono">{group.sap}</td>
                          <td className="py-1.5 px-2.5 font-mono">{group.orden}</td>
                          <td className="py-1.5 px-2.5 font-mono">{group.lote}</td>
                          <td className="py-1.5 px-2.5 font-mono text-indigo-700 font-semibold">{group.tickets.join(', ') || 'N/A'}</td>
                          <td className="py-1.5 px-2.5 font-semibold text-slate-800">
                            {group.paletas} Paletas, {group.camadas} Camadas
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

'''
    final_str = content[:start_idx] + new_content + content[end_idx:]
    with open('src/components/TabResumen.tsx', 'w', encoding='utf-8') as f:
        f.write(final_str)
    print("Success")
else:
    print("Could not find boundaries")
