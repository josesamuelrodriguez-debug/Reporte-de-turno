import React, { useState, useEffect } from 'react';
import { RocePrueba } from '../types';
import { getRocePruebas, saveRocePrueba, deleteRocePrueba } from '../db';
import { Trash2, Save, Activity, Search, FileSpreadsheet } from 'lucide-react';
import { CATALOGO_PRODUCTOS_PBO } from './TabPBO';
import * as XLSX from 'xlsx';

interface TabRoceProps {
  cabeceraFecha: string;
  cabeceraTurno: number;
  usuarioRegistro: string;
}

export function TabRoce({ cabeceraFecha, cabeceraTurno, usuarioRegistro }: TabRoceProps) {
  const [pruebas, setPruebas] = useState<RocePrueba[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [codigoSap, setCodigoSap] = useState('');
  const [producto, setProducto] = useState('');
  const [lote, setLote] = useState('');
  const [loteBe, setLoteBe] = useState('');
  const [pesoBe, setPesoBe] = useState('');
  const [distribucionBe, setDistribucionBe] = useState('');
  const [viscosidadBe, setViscosidadBe] = useState('');
  const [resultados, setResultados] = useState<Record<number, string>>({});

  useEffect(() => {
    loadPruebas();
  }, []);

  const loadPruebas = async () => {
    const data = await getRocePruebas();
    setPruebas(data);
  };

  const handleSapChange = (val: string) => {
    setCodigoSap(val);
    const found = CATALOGO_PRODUCTOS_PBO.find(c => c.codigo.toUpperCase() === val.toUpperCase());
    if (found) {
      setProducto(found.nombre);
    } else {
      setProducto('');
    }
  };

  const handleResultadoChange = (minuto: number, val: string) => {
    setResultados(prev => ({
      ...prev,
      [minuto]: val
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoSap || !producto || !lote) {
      alert("Por favor complete Código SAP, Producto y Lote.");
      return;
    }
    
    const newPrueba: RocePrueba = {
      id: `ROCE-${Date.now()}`,
      fecha: cabeceraFecha || new Date().toISOString().split('T')[0],
      turno: cabeceraTurno || 1,
      codigo_sap: codigoSap,
      producto,
      lote: lote.toUpperCase(),
      lote_be: loteBe,
      peso_be: pesoBe,
      distribucion_be: distribucionBe,
      viscosidad_be: viscosidadBe,
      resultados,
      usuario: usuarioRegistro || 'Usuario',
      creado_el: new Date().toISOString()
    };

    try {
      await saveRocePrueba(newPrueba);
      setCodigoSap('');
      setProducto('');
      setLote('');
      setLoteBe('');
      setPesoBe('');
      setDistribucionBe('');
      setViscosidadBe('');
      setResultados({});
      loadPruebas();
      alert("¡Prueba de Roce guardada con éxito!");
    } catch (e) {
      console.error(e);
      alert("Error al guardar prueba.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta prueba de roce?")) {
      await deleteRocePrueba(id);
      loadPruebas();
    }
  };

  const handleExportExcel = () => {
    if (filteredPruebas.length === 0) {
      alert("No hay datos de roce para exportar.");
      return;
    }

    const excelData = filteredPruebas.map(p => ({
      'Fecha': p.fecha,
      'Turno': p.turno,
      'Código SAP': p.codigo_sap,
      'Producto': p.producto,
      'Lote': p.lote,
      'Lote de BE': p.lote_be || '',
      'Peso de BE': p.peso_be || '',
      'Distribución de BE': p.distribucion_be || '',
      'Viscosidad de BE': p.viscosidad_be || '',
      'Min 1': p.resultados[1] || '',
      'Min 2': p.resultados[2] || '',
      'Min 3': p.resultados[3] || '',
      'Min 4': p.resultados[4] || '',
      'Min 5': p.resultados[5] || '',
      'Min 6': p.resultados[6] || '',
      'Min 7': p.resultados[7] || '',
      'Min 8': p.resultados[8] || '',
      'Min 9': p.resultados[9] || '',
      'Min 10': p.resultados[10] || '',
      'Min 11': p.resultados[11] || '',
      'Min 12': p.resultados[12] || '',
      'Usuario': p.usuario
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pruebas de Roce");
    XLSX.writeFile(workbook, `Pruebas_Roce_${cabeceraFecha || 'general'}_T${cabeceraTurno || 1}.xlsx`);
  };

  // Only show tests for current shift/date or all if we search
  const filteredPruebas = pruebas.filter(p => {
    if (searchTerm) {
      return p.lote.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.codigo_sap.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (p.lote_be && p.lote_be.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return p.fecha === cabeceraFecha && p.turno === cabeceraTurno;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Activity className="w-5 h-5 text-indigo-600" /> Nueva Prueba de Roce
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Código SAP</label>
              <input
                type="text"
                required
                value={codigoSap}
                onChange={(e) => handleSapChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm p-2 font-mono focus:outline-hidden text-slate-800"
                placeholder="Ej: Y00001"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Producto</label>
              <input
                type="text"
                required
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm p-2 font-bold focus:outline-hidden text-slate-800"
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lote</label>
              <input
                type="text"
                required
                value={lote}
                onChange={(e) => setLote(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm p-2 font-mono focus:outline-hidden text-slate-800"
                placeholder="Ej: L-1234"
              />
            </div>
          </div>

          {/* BE Parameters Section */}
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
              <span>🧪</span> Parámetros BE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lote de BE</label>
                <input
                  type="text"
                  value={loteBe}
                  onChange={(e) => setLoteBe(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-medium"
                  placeholder="Ej: BE-882"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Peso de BE</label>
                <input
                  type="text"
                  value={pesoBe}
                  onChange={(e) => setPesoBe(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-medium"
                  placeholder="Ej: 15.2 g"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Distribución de BE</label>
                <input
                  type="text"
                  value={distribucionBe}
                  onChange={(e) => setDistribucionBe(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-medium"
                  placeholder="Ej: Homogénea / Uniforme"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Viscosidad de BE</label>
                <input
                  type="text"
                  value={viscosidadBe}
                  onChange={(e) => setViscosidadBe(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-medium"
                  placeholder="Ej: 24 cPs"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase mb-3">Registro minuto a minuto</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(minuto => (
                <div key={minuto} className="bg-indigo-50/30 border border-indigo-100 p-2.5 rounded-xl">
                  <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Minuto {minuto}</label>
                  <select
                    value={resultados[minuto] || ''}
                    onChange={(e) => handleResultadoChange(minuto, e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded text-[11px] p-1.5 font-semibold text-slate-700"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="Sin roce">✅ Sin roce</option>
                    <option value="Muy leve">🟡 Muy leve</option>
                    <option value="Leve">🟠 Leve</option>
                    <option value="Moderado">🔴 Moderado</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar Prueba
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            Pruebas Registradas
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por lote, SAP, BE o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs pl-9 pr-3 py-2 focus:outline-hidden text-slate-800"
              />
            </div>
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Exportar listado a Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden xs:inline">Exportar Excel</span>
            </button>
          </div>
        </div>

        {filteredPruebas.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-medium text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {searchTerm ? "No se encontraron pruebas de roce." : "No hay pruebas de roce registradas para este turno."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Fecha/Turno</th>
                  <th className="py-2.5 px-3">SAP / Producto</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3">Parámetros BE</th>
                  <th className="py-2.5 px-3 text-center">Resultados (M1 - M12)</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPruebas.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="font-bold">{p.fecha}</div>
                      <div className="text-slate-400 text-[9px]">Turno {p.turno}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-mono font-bold text-slate-900">{p.codigo_sap}</div>
                      <div className="font-semibold text-[10px]">{p.producto}</div>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                      {p.lote}
                    </td>
                    <td className="py-2 px-3 text-[10px]">
                      {(p.lote_be || p.peso_be || p.distribucion_be || p.viscosidad_be) ? (
                        <div className="space-y-0.5">
                          {p.lote_be && <div><span className="font-bold text-slate-500">Lote:</span> {p.lote_be}</div>}
                          {p.peso_be && <div><span className="font-bold text-slate-500">Peso:</span> {p.peso_be}</div>}
                          {p.distribucion_be && <div><span className="font-bold text-slate-500">Dist:</span> {p.distribucion_be}</div>}
                          {p.viscosidad_be && <div><span className="font-bold text-slate-500">Visc:</span> {p.viscosidad_be}</div>}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                          const val = p.resultados[m];
                          if (!val) return null;
                          const colorClass = 
                            val === 'Sin roce' ? 'bg-emerald-100 text-emerald-800' :
                            val === 'Muy leve' ? 'bg-yellow-100 text-yellow-800' :
                            val === 'Leve' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800';
                          return (
                            <span key={m} className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${colorClass}`} title={`Minuto ${m}`}>
                              M{m}: {val}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
