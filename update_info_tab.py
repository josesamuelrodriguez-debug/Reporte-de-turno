import re

with open('src/components/TabPBO.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to compute these values in TabPBO inside the component render.
# Where should we compute? Maybe right after `activeLoteRepros` is defined.
# Let's find where activeLotePaletas and activeLoteRepros are defined.
target_search = "const activeLoteRepros = reprocesos.filter(r => r.id_pbo === activeLote.id_pbo);"

calculations = """
                    const materialReprocesado = activeLotePaletas.filter(p => p.estatus === 'Reprocesado').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const materialSalidaReproceso = activeLoteRepros.reduce((acc, r) => acc + ((r.paletas_nuevas || 0) * getCansPerPallet(activeLote.formato)) + ((r.camadas_sueltas || 0) * getCansPerCamada()), 0);
                    const materialBriqueta = activeLotePaletas.filter(p => p.estatus === 'Briqueta' || p.estatus === 'Desecho').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const diferenciaReproceso = Math.max(0, materialReprocesado - materialSalidaReproceso);
                    const materialNoConforme = materialBriqueta + diferenciaReproceso;
                    const materialNoReprocesado = activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar' || p.estatus === 'En proceso' || p.estatus === 'Aceptado Con desviacion' || p.estatus === 'Liberado Directo').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
"""

# Let's find where this is rendered
# The render block starts with:
#                   {/* TAB 1: GENERAL INFO */}
#                   {pboTabActive === 'info' && (

render_target = """                  {/* TAB 1: GENERAL INFO */}
                  {pboTabActive === 'info' && ("""

new_render = """                  {/* TAB 1: GENERAL INFO */}
                  {pboTabActive === 'info' && (() => {
                    const materialReprocesado = activeLotePaletas.filter(p => p.estatus === 'Reprocesado').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const materialSalidaReproceso = activeLoteRepros.reduce((acc, r) => acc + ((r.paletas_nuevas || 0) * getCansPerPallet(activeLote.formato)) + ((r.camadas_sueltas || 0) * getCansPerCamada()), 0);
                    const materialBriqueta = activeLotePaletas.filter(p => p.estatus === 'Briqueta' || p.estatus === 'Desecho').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const diferenciaReproceso = Math.max(0, materialReprocesado - materialSalidaReproceso);
                    const materialNoConforme = materialBriqueta + diferenciaReproceso;
                    const materialNoReprocesado = activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar' || p.estatus === 'En proceso' || p.estatus === 'Aceptado Con desviacion' || p.estatus === 'Liberado Directo').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);

                    return (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Lote de Envase</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.lote}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Orden de Fabricación</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.orden}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Presentación</span>
                          <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.formato}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Volumen total latas</span>
                          <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.cantidad_total_latas.toLocaleString()} latas</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                          <span className="text-blue-600 block font-bold uppercase text-[9px] tracking-wider">Material Reprocesado</span>
                          <span className="font-bold text-blue-800 text-sm mt-0.5 block">{materialReprocesado.toLocaleString()} latas</span>
                        </div>
                        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                          <span className="text-amber-600 block font-bold uppercase text-[9px] tracking-wider">Material No Reprocesado</span>
                          <span className="font-bold text-amber-800 text-sm mt-0.5 block">{materialNoReprocesado.toLocaleString()} latas</span>
                        </div>
                        <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                          <span className="text-red-600 block font-bold uppercase text-[9px] tracking-wider">Material No Conforme</span>
                          <span className="font-bold text-red-800 text-sm mt-0.5 block">{materialNoConforme.toLocaleString()} latas</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider mb-1">Defecto Inicial Reportado</span>
                        <span className="font-bold text-slate-700 leading-relaxed block">{activeLote.defecto_general}</span>
                      </div>
                      <div className="flex gap-4 text-[11px] text-slate-400">
                        <span>Creado el: <strong>{new Date(activeLote.creado_el).toLocaleDateString()}</strong></span>
                        <span>Registrado por: <strong>{activeLote.usuario_registro}</strong></span>
                      </div>
                    </div>
                  )})()
                  }"""

# Actually, replacing that entire block is a bit risky. Let's just do a regex replace from:
#                  {/* TAB 1: GENERAL INFO */}
#                  {pboTabActive === 'info' && (
#                    <div className="space-y-4 text-xs">
# to:
#                      <div className="flex gap-4 text-[11px] text-slate-400">

# I'll just use string find and replace.

start_str = "                  {/* TAB 1: GENERAL INFO */}\n                  {pboTabActive === 'info' && ("
end_str = "                  {/* TAB 2: PALETAS RETENIDAS */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    final_str = content[:start_idx] + new_render + "\n" + content[end_idx:]
    with open('src/components/TabPBO.tsx', 'w', encoding='utf-8') as f:
        f.write(final_str)
    print("Success")
else:
    print("Could not find boundaries")

