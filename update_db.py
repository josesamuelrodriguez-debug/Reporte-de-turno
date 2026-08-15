import re

with open('src/db.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "export const getRocePruebas" not in content:
    imports_end = content.find("export interface Cabecera")
    if imports_end != -1:
        # Check if RocePrueba is imported
        if "RocePrueba" not in content:
            content = content.replace("Trazabilidad,", "Trazabilidad, RocePrueba,")
            
    # Append the DB functions
    db_funcs = """
export const getRocePruebas = async (): Promise<RocePrueba[]> => {
  if (import.meta.env.VITE_USE_SUPABASE === 'true' && supabase) {
    try {
      const { data, error } = await supabase.from('roce_pruebas').select('*').order('creado_el', { ascending: false });
      if (error) throw error;
      return data as RocePrueba[];
    } catch (e) {
      console.error("Supabase RocePruebas error", e);
    }
  }
  return getLocalData('roce_pruebas');
};

export const saveRocePrueba = async (prueba: RocePrueba): Promise<void> => {
  if (import.meta.env.VITE_USE_SUPABASE === 'true' && supabase) {
    try {
      const { error } = await supabase.from('roce_pruebas').upsert([prueba]);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Supabase Save RocePrueba error", e);
    }
  }
  const pruebas = getLocalData('roce_pruebas');
  const index = pruebas.findIndex((p: RocePrueba) => p.id === prueba.id);
  if (index >= 0) pruebas[index] = prueba;
  else pruebas.push(prueba);
  setLocalData('roce_pruebas', pruebas);
};

export const deleteRocePrueba = async (id: string): Promise<void> => {
  if (import.meta.env.VITE_USE_SUPABASE === 'true' && supabase) {
    try {
      const { error } = await supabase.from('roce_pruebas').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Supabase Delete RocePrueba error", e);
    }
  }
  let pruebas = getLocalData('roce_pruebas');
  pruebas = pruebas.filter((p: RocePrueba) => p.id !== id);
  setLocalData('roce_pruebas', pruebas);
};
"""
    content += db_funcs

with open('src/db.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
