import React from 'react';
import { Plus, Trash2, Calendar, Users, ShieldAlert, Zap, Layers, Activity, CheckSquare, Sliders } from 'lucide-react';
import { ReporteTurno, ProductoTurno } from '../types';
import ExpandableCell from './ExpandableCell';
import { CATALOGO_PRODUCTOS_PBO } from './TabPBO';

interface TabGeneralProps {
  cabecera: ReporteTurno;
  onChangeCabecera: (newCab: Partial<ReporteTurno>) => void;
  productos: ProductoTurno[];
  onChangeProductos: (newProds: ProductoTurno[]) => void;
  analistas: string[];
  editable: boolean;
}

export default function TabGeneral({
  cabecera,
  onChangeCabecera,
  productos,
  onChangeProductos,
  analistas,
  editable
}: TabGeneralProps) {

  const addProductoRow = () => {
    if (!editable) return;
    onChangeProductos([
      ...productos,
      { codigo_sap: '', descripcion: '', orden: '', lote: '', paletas: '', camadas: '', obs: '' }
    ]);
  };

  const removeProductoRow = (index: number) => {
    if (!editable) return;
    const updated = [...productos];
    updated.splice(index, 1);
    onChangeProductos(updated);
  };

  const updateProductoCell = (index: number, key: keyof ProductoTurno, value: string) => {
    if (!editable) return;
    const updated = [...productos];
    let updatedRow = { ...updated[index], [key]: value };
    if (key === 'codigo_sap') {
      const matched = CATALOGO_PRODUCTOS_PBO.find(p => p.codigo.toLowerCase() === value.toLowerCase().trim());
      if (matched) {
        updatedRow.descripcion = matched.nombre;
      }
    }
    updated[index] = updatedRow;
    onChangeProductos(updated);
  };

  return (
    <div className="space-y-6">
      {/* SECCION CABECERA */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-800">Datos Principales del Turno</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
            <input
              type="date"
              disabled={!editable}
              value={cabecera.fecha}
              onChange={(e) => onChangeCabecera({ fecha: e.target.value })}
              className="w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-sm transition-all outline-hidden"
            />
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Grupo</label>
            <select
              disabled={!editable}
              value={cabecera.grupo}
              onChange={(e) => onChangeCabecera({ grupo: e.target.value })}
              className="w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-sm transition-all outline-hidden"
            >
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
              <option value="C">Grupo C</option>
            </select>
          </div>

          {/* Analista */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Analista de Turno</label>
            <select
              disabled={!editable}
              value={cabecera.analista}
              onChange={(e) => onChangeCabecera({ analista: e.target.value })}
              className="w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-sm transition-all outline-hidden"
            >
              <option value="">-- Seleccionar Analista --</option>
              {analistas.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Turno</label>
            <select
              disabled={!editable}
              value={cabecera.turno}
              onChange={(e) => onChangeCabecera({ turno: parseInt(e.target.value, 10) })}
              className="w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-sm transition-all outline-hidden"
            >
              <option value={1}>Turno 1 (Día)</option>
              <option value={2}>Turno 2 (Noche)</option>
            </select>
          </div>
        </div>

        {/* Equipos de Medición & Start Quality & PIE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-6 pt-5 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Caídas de Tensión
            </label>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="caida_tension_radio"
                    disabled={!editable}
                    checked={cabecera.caida_tension === 'No' || cabecera.caida_tension === 'Sin caídas de tensión' || !cabecera.caida_tension}
                    onChange={() => onChangeCabecera({ caida_tension: 'No' })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  No
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="caida_tension_radio"
                    disabled={!editable}
                    checked={cabecera.caida_tension !== 'No' && cabecera.caida_tension !== 'Sin caídas de tensión' && !!cabecera.caida_tension}
                    onChange={() => onChangeCabecera({ caida_tension: 'Sí (00:00 - 00:00)' })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  Sí
                </label>
              </div>

              {cabecera.caida_tension !== 'No' && cabecera.caida_tension !== 'Sin caídas de tensión' && !!cabecera.caida_tension && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="time"
                    disabled={!editable}
                    value={cabecera.caida_tension.match(/Sí \((.*?) -/)?.[1] || ''}
                    onChange={(e) => {
                      const fin = cabecera.caida_tension.match(/- (.*?)\)/)?.[1] || '';
                      onChangeCabecera({ caida_tension: `Sí (${e.target.value} - ${fin})` });
                    }}
                    className="w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 text-xs transition-all outline-hidden"
                  />
                  <span className="text-slate-400 text-xs font-medium">a</span>
                  <input
                    type="time"
                    disabled={!editable}
                    value={cabecera.caida_tension.match(/- (.*?)\)/)?.[1] || ''}
                    onChange={(e) => {
                      const ini = cabecera.caida_tension.match(/Sí \((.*?) -/)?.[1] || '';
                      onChangeCabecera({ caida_tension: `Sí (${ini} - ${e.target.value})` });
                    }}
                    className="w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 text-xs transition-all outline-hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Star Quality
            </span>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  disabled={!editable}
                  checked={cabecera.temp_cumple !== false} // default to true
                  onChange={(e) => {
                    onChangeCabecera({ temp_cumple: e.target.checked });
                  }}
                  className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                />
                <span className={cabecera.temp_cumple !== false ? "text-emerald-600 font-extrabold" : "text-red-500 font-extrabold"}>
                  {cabecera.temp_cumple !== false ? "✅ Cumple" : "❌ No Cumple"}
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Equipos de Medición
            </span>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  disabled={!editable}
                  checked={cabecera.hum_cumple !== false} // default to true
                  onChange={(e) => {
                    onChangeCabecera({ hum_cumple: e.target.checked });
                  }}
                  className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                />
                <span className={cabecera.hum_cumple !== false ? "text-emerald-600 font-extrabold" : "text-red-500 font-extrabold"}>
                  {cabecera.hum_cumple !== false ? "✅ Cumple" : "❌ No Cumple"}
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> PIE de Calidad
            </span>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  disabled={!editable}
                  checked={cabecera.pie_calidad_cumple !== false} // default to true
                  onChange={(e) => {
                    onChangeCabecera({ pie_calidad_cumple: e.target.checked });
                  }}
                  className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                />
                <span className={cabecera.pie_calidad_cumple !== false ? "text-emerald-600 font-extrabold" : "text-red-500 font-extrabold"}>
                  {cabecera.pie_calidad_cumple !== false ? "✅ Cumple" : "❌ No Cumple"}
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-500" /> PIE de Operaciones
            </span>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  disabled={!editable}
                  checked={cabecera.pie_operaciones_cumple !== false} // default to true
                  onChange={(e) => {
                    onChangeCabecera({ pie_operaciones_cumple: e.target.checked });
                  }}
                  className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                />
                <span className={cabecera.pie_operaciones_cumple !== false ? "text-emerald-600 font-extrabold" : "text-red-500 font-extrabold"}>
                  {cabecera.pie_operaciones_cumple !== false ? "✅ Cumple" : "❌ No Cumple"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Condicional Observaciones No Cumple */}
        {(cabecera.temp_cumple === false || cabecera.hum_cumple === false) && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-150">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              Observaciones Desviación Star Quality / Equipos <span className="text-red-500 font-bold">* Requerido</span>
            </label>
            <input
              type="text"
              disabled={!editable}
              value={cabecera.observaciones_ambiente || ''}
              onChange={(e) => onChangeCabecera({ observaciones_ambiente: e.target.value })}
              placeholder="Detallar el motivo del no cumplimiento en Star Quality o Equipos de Medición..."
              className={`w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border rounded-lg p-2.5 text-sm transition-all outline-hidden ${
                !cabecera.observaciones_ambiente
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
          </div>
        )}

        {cabecera.pie_calidad_cumple === false && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-150">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              Observaciones PIE de Calidad (No Cumple) <span className="text-red-500 font-bold">* Requerido</span>
            </label>
            <input
              type="text"
              disabled={!editable}
              value={cabecera.observacion_pie_calidad || ''}
              onChange={(e) => onChangeCabecera({ observacion_pie_calidad: e.target.value })}
              placeholder="Detallar el motivo del no cumplimiento en PIE de Calidad..."
              className={`w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border rounded-lg p-2.5 text-sm transition-all outline-hidden ${
                !cabecera.observacion_pie_calidad
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
          </div>
        )}

        {cabecera.pie_operaciones_cumple === false && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-150">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              Observaciones PIE de Operaciones (No Cumple) <span className="text-red-500 font-bold">* Requerido</span>
            </label>
            <input
              type="text"
              disabled={!editable}
              value={cabecera.observacion_pie_operaciones || ''}
              onChange={(e) => onChangeCabecera({ observacion_pie_operaciones: e.target.value })}
              placeholder="Detallar el motivo del no cumplimiento en PIE de Operaciones..."
              className={`w-full bg-slate-50 disabled:bg-slate-100/60 disabled:text-slate-400 border rounded-lg p-2.5 text-sm transition-all outline-hidden ${
                !cabecera.observacion_pie_operaciones
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
          </div>
        )}
      </div>


      {/* SECCION PRODUCTOS */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-150 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">Productos del Turno</h2>
          </div>
          {editable && (
            <button
              onClick={addProductoRow}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Añadir Producto
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-3 w-[14%]">Código SAP</th>
                <th className="py-3 px-3 w-[32%]">Descripción del Producto</th>
                <th className="py-3 px-3 w-[16%]">Orden</th>
                <th className="py-3 px-3 w-[14%]">Lote</th>
                <th className="py-3 px-3 w-[10%]">Paletas</th>
                <th className="py-3 px-3 w-[10%]">Camadas</th>
                {editable && <th className="py-3 px-3 w-[4%] text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={editable ? 7 : 6} className="py-8 text-center text-slate-400 font-medium bg-slate-50/40">
                    No hay productos agregados en este turno.
                  </td>
                </tr>
              ) : (
                productos.map((prod, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-all">
                    {/* SAP */}
                    <td className="py-1 px-1">
                      <ExpandableCell
                        disabled={!editable}
                        value={prod.codigo_sap}
                        onChange={(val) => updateProductoCell(index, 'codigo_sap', val)}
                        placeholder="Y000xx"
                        label="Código SAP del Producto"
                      />
                    </td>
                    {/* Descripcion */}
                    <td className="py-1 px-1">
                      <ExpandableCell
                        disabled={!editable}
                        value={prod.descripcion}
                        onChange={(val) => updateProductoCell(index, 'descripcion', val)}
                        placeholder="Descripción automática..."
                        label="Descripción del Producto"
                      />
                    </td>
                    {/* Orden */}
                    <td className="py-1 px-1">
                      <ExpandableCell
                        disabled={!editable}
                        value={prod.orden || ''}
                        onChange={(val) => updateProductoCell(index, 'orden', val)}
                        placeholder="Orden"
                        label="Orden"
                      />
                    </td>
                    {/* Lote */}
                    <td className="py-1 px-1">
                      <ExpandableCell
                        disabled={!editable}
                        value={prod.lote}
                        onChange={(val) => updateProductoCell(index, 'lote', val)}
                        placeholder="Ej. NR6J"
                        label="Lote de Producción"
                      />
                    </td>
                    {/* Paletas */}
                    <td className="py-1 px-1">
                      <ExpandableCell
                        disabled={!editable}
                        value={prod.paletas || ''}
                        onChange={(val) => updateProductoCell(index, 'paletas', val)}
                        placeholder="Paletas"
                        label="Paletas"
                      />
                    </td>
                    {/* Camadas */}
                    <td className="py-1 px-1">
                      <ExpandableCell
                        disabled={!editable}
                        value={prod.camadas || ''}
                        onChange={(val) => updateProductoCell(index, 'camadas', val)}
                        placeholder="Camadas"
                        label="Camadas"
                      />
                    </td>
                    {/* Acciones */}
                    {editable && (
                      <td className="py-1 px-1 text-center">
                        <button
                          onClick={() => removeProductoRow(index)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
