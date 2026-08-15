import re

with open('src/components/TabResumen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "          {/* 2. Movimientos de Producto Bajo Observación (PBO) del Turno */}"
end_str = "          {/* 3. Desviaciones Sin Retención */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = '''          {/* 2. Movimientos de Producto Bajo Observación (PBO) del Turno */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1 border-b pb-0.5">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              2. PRODUCTO BAJO OBSERVACIÓN (PBO)
            </h3>
            {matchingPboLotes.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-[11px] text-slate-400 font-bold italic text-center">
                ✓ No se registraron folios de Producto Bajo Observación (PBO) creados durante el turno actual.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-orange-50/50 text-orange-800 font-bold border-b border-orange-100">
                    <tr>
                      <th className="py-1.5 px-2.5">Código SAP</th>
                      <th className="py-1.5 px-2.5">Descripción</th>
                      <th className="py-1.5 px-2.5">Lote</th>
                      <th className="py-1.5 px-2.5">Orden</th>
                      <th className="py-1.5 px-2.5">Paletas</th>
                      <th className="py-1.5 px-2.5">Camadas</th>
                      <th className="py-1.5 px-2.5">Defecto General</th>
                      <th className="py-1.5 px-2.5">NCA General</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {matchingPboLotes.map(l => {
                      const lotePalets = pboPaletas.filter(p => p.id_pbo === l.id_pbo);
                      const paletasCompletas = lotePalets.filter(p => p.camadas_sueltas === 0).length;
                      const camadasSueltasTotal = lotePalets.reduce((acc, p) => acc + p.camadas_sueltas, 0);
                      
                      // Intentar encontrar el código SAP basado en el nombre del producto
                      // (asumiendo que CATALOGO_PRODUCTOS_PBO existe, pero aquí no tenemos acceso directo, 
                      // así que dejaremos un placeholder o intentaremos importarlo si podemos.
                      // Lo dejaremos como "N/D" o extraeremos si es posible)
                      
                      return (
                        <tr key={l.id_pbo} className="hover:bg-orange-50/20">
                          <td className="py-1.5 px-2.5 font-bold font-mono">N/D</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{l.producto}</td>
                          <td className="py-1.5 px-2.5 font-mono text-slate-600">{l.lote}</td>
                          <td className="py-1.5 px-2.5 font-mono text-slate-600">{l.orden}</td>
                          <td className="py-1.5 px-2.5 font-semibold text-center">{paletasCompletas}</td>
                          <td className="py-1.5 px-2.5 font-semibold text-center">{camadasSueltasTotal}</td>
                          <td className="py-1.5 px-2.5 italic text-slate-600">{l.defecto_general}</td>
                          <td className="py-1.5 px-2.5 font-bold text-center">
                            {lotePalets.length > 0 ? lotePalets[0].nca : 'N/D'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
'''
    final_str = content[:start_idx] + new_content + content[end_idx:]
    with open('src/components/TabResumen.tsx', 'w', encoding='utf-8') as f:
        f.write(final_str)
    print("Success")
else:
    print("Could not find boundaries")
