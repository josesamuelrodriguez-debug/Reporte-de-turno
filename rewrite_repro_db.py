with open('src/db.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find `export const getReproceso, RocePruebasPBO` and everything below it
# and replace it with proper functions.
start_idx = content.find("export const getReproceso")
if start_idx != -1:
    content = content[:start_idx]

content += """
export const getReprocesosPBO = async (): Promise<Reproceso[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pbo_reprocesos').select('*');
      if (!error && data) return data;
    } catch (e) {
      console.error("Supabase PBO Reproceso error", e);
    }
  }
  return getLocalData('pbo_reprocesos');
};

export const saveReprocesoPBO = async (reproceso: Reproceso): Promise<void> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('pbo_reprocesos').upsert(reproceso);
      if (!error) return;
    } catch (e) {
      console.error("Supabase Save Reproceso PBO error", e);
    }
  }
  const reprocesos: Reproceso[] = getLocalData('pbo_reprocesos');
  const index = reprocesos.findIndex(r => r.id === reproceso.id);
  if (index !== -1) {
    reprocesos[index] = reproceso;
  } else {
    reprocesos.push(reproceso);
  }
  setLocalData('pbo_reprocesos', reprocesos);
};

export const deleteReprocesoPBO = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('pbo_reprocesos').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Supabase Delete Reproceso PBO error", e);
    }
  }
  let reprocesos = getLocalData('pbo_reprocesos');
  reprocesos = reprocesos.filter((r: Reproceso) => r.id !== id);
  setLocalData('pbo_reprocesos', reprocesos);
};

export const getRocePruebas = async (): Promise<RocePrueba[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
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
  const supabase = getSupabaseClient();
  if (supabase) {
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
  const supabase = getSupabaseClient();
  if (supabase) {
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
with open('src/db.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
