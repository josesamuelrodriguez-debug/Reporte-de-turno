import re

with open('src/db.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "export const deleteReprocesoPBO" not in content:
    db_funcs = """
export const deleteReprocesoPBO = async (id: string): Promise<void> => {
  if (import.meta.env.VITE_USE_SUPABASE === 'true' && supabase) {
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
"""
    content += db_funcs
    with open('src/db.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Already exists")
