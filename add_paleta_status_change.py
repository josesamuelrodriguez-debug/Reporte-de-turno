import re

with open('src/components/TabPBO.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find handleUpdatePaletas
target = "  // Mass save individual palets"
new_func = """  // Handle Paleta Status Change
  const handlePaletaStatusChange = async (paleta: Paleta, newEstatus: string) => {
    if (paleta.estatus === 'Reprocesado' && newEstatus === 'Sin reprocesar') {
        const confirmMsg = "Advertencia: Cambiar el estatus de una paleta reprocesada a 'Sin reprocesar' eliminará el ticket de reproceso asociado y revertirá todas las paletas involucradas. ¿Desea continuar?";
        if (!window.confirm(confirmMsg)) return;

        const targetRepro = reprocesos.find(r => r.id_pbo === paleta.id_pbo && r.tickets_originales_consumidos.includes(paleta.nro_ticket));
        
        if (targetRepro) {
            const ticketsToRevert = targetRepro.tickets_originales_consumidos.split(',').map(t => t.trim().toUpperCase());
            
            const updatedPaletas = paletas.map(p2 => {
               if (p2.id_pbo === paleta.id_pbo && ticketsToRevert.includes(p2.nro_ticket.toUpperCase())) {
                   return { ...p2, estatus: 'Sin reprocesar' as any };
               }
               return p2;
            });
            
            setPaletas(updatedPaletas);
            
            try {
                await deleteReprocesoPBO(targetRepro.id);
                setReprocesos(prev => prev.filter(r => r.id !== targetRepro.id));
                alert("El ticket de reproceso asociado ha sido eliminado y las paletas revertidas a 'Sin reprocesar'. Recuerde hacer clic en 'Actualizar Datos Quirúrgicos' para guardar los cambios de las paletas.");
            } catch (e) {
                console.error(e);
            }
            return;
        }
    }
    
    // Normal change
    const updated = [...paletas];
    const pi = updated.findIndex(item => item.id === paleta.id);
    if (pi !== -1) {
        updated[pi].estatus = newEstatus as any;
        setPaletas(updated);
    }
  };

"""

content = content.replace(target, new_func + target)

# Now replace the inline onChange with a call to handlePaletaStatusChange
old_on_change = """                                    onChange={(e) => {
                                      const updated = [...paletas];
                                      const pi = updated.findIndex(item => item.id === p.id);
                                      if (pi !== -1) {
                                        updated[pi].estatus = e.target.value as any;
                                        setPaletas(updated);
                                      }
                                    }}"""

new_on_change = "                                    onChange={(e) => handlePaletaStatusChange(p, e.target.value)}"

content = content.replace(old_on_change, new_on_change)

with open('src/components/TabPBO.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
