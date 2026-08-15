import re

with open('src/components/TabResumen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "    // --- REPROCESOS PBO ---"
end_str = "    // --- ROCIADORAS ---"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = '''    // --- REPROCESOS PBO ---
    text += `🔄 *7. REPROCESOS REALIZADOS DURANTE EL TURNO*\n`;
    if (matchingReprocesos.length > 0) {
      const groupedRepros: Record<string, { sap: string; orden: string; lote: string; tickets: string[]; paletas: number; camadas: number; }> = {};
      matchingReprocesos.forEach(r => {
        const pboInfo = pboLotes.find(l => l.id_pbo === r.id_pbo);
        if (!pboInfo) return;
        const catalogItem = CATALOGO_PRODUCTOS_PBO.find(c => c.nombre.toUpperCase() === pboInfo.producto.toUpperCase());
        const codigoSap = catalogItem ? catalogItem.codigo : 'N/D';
        const key = `${codigoSap}-${pboInfo.orden}-${pboInfo.lote}`;
        if (!groupedRepros[key]) {
          groupedRepros[key] = { sap: codigoSap, orden: pboInfo.orden, lote: pboInfo.lote, tickets: [], paletas: 0, camadas: 0 };
        }
        if (r.nuevo_ticket_reprocesado && r.nuevo_ticket_reprocesado !== 'N/A') {
           groupedRepros[key].tickets.push(r.nuevo_ticket_reprocesado);
           groupedRepros[key].paletas += 1;
        }
        if (r.camadas_sueltas > 0) {
           groupedRepros[key].camadas += r.camadas_sueltas;
        }
      });
      
      const groups = Object.values(groupedRepros);
      text += `⚠️ *Total:* ${groups.length} código(s) SAP con reproceso(s):\n`;
      groups.forEach(group => {
        text += `• *SAP:* ${group.sap} | *Lote:* ${group.lote} | *Orden:* ${group.orden}\n`;
        text += `  - *Tickets Reprocesados:* ${group.tickets.join(', ') || 'N/A'}\n`;
        text += `  - *Total Generado:* ${group.paletas} Paletas, ${group.camadas} Camadas\n`;
      });
    } else {
      text += `✅ No se registraron reprocesos de PBO en este turno.\n`;
    }
    text += `\n------------------------------------\n\n`;

'''
    final_str = content[:start_idx] + new_content + content[end_idx:]
    with open('src/components/TabResumen.tsx', 'w', encoding='utf-8') as f:
        f.write(final_str)
    print("Success")
else:
    print("Could not find boundaries")
