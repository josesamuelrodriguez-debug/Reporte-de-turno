import re

with open('src/components/TabGeneral.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Create the section for images
images_section = """
      {/* SECCION EVIDENCIAS (FOTOS) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-150 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">Evidencias Fotográficas</h2>
          </div>
          {editable && (
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                id="evidencia-upload"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  const newEvidencias = cabecera.evidencias ? [...cabecera.evidencias] : [];
                  
                  Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      newEvidencias.push(reader.result as string);
                      onChangeCabecera({ evidencias: newEvidencias });
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
              <label
                htmlFor="evidencia-upload"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-100"
              >
                <Plus className="w-4 h-4" />
                Añadir Foto
              </label>
            </div>
          )}
        </div>
        
        {(!cabecera.evidencias || cabecera.evidencias.length === 0) ? (
          <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 font-medium">
            No hay imágenes adjuntas.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cabecera.evidencias.map((imgBase64, idx) => (
              <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-square flex items-center justify-center">
                <img src={imgBase64} alt={`Evidencia ${idx + 1}`} className="object-cover w-full h-full" />
                {editable && (
                  <button
                    onClick={() => {
                      const newEvidencias = [...cabecera.evidencias!];
                      newEvidencias.splice(idx, 1);
                      onChangeCabecera({ evidencias: newEvidencias });
                    }}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Eliminar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
"""

content = content.replace("      {/* SECCION PRODUCTOS */}", images_section + "\n      {/* SECCION PRODUCTOS */}")

with open('src/components/TabGeneral.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
