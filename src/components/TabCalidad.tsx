// TabCalidad.tsx - Integrated Lote column & print sizing adjustments
import React from 'react';
import { Plus, Trash2, ShieldAlert, AlertTriangle, MessageSquare } from 'lucide-react';
import { ProductoObservacion, DesviacionSinRetencion, ObservacionGeneral } from '../types';
import ExpandableCell from './ExpandableCell';
import { CATALOGO_PRODUCTOS_PBO } from './TabPBO';

interface TabCalidadProps {
  observaciones: ProductoObservacion[];
  onChangeObservaciones: (obs: ProductoObservacion[]) => void;
  desviaciones: DesviacionSinRetencion[];
  onChangeDesviaciones: (desv: DesviacionSinRetencion[]) => void;
  generales: ObservacionGeneral[];
  onChangeGenerales: (gen: ObservacionGeneral[]) => void;
  editable: boolean;
}

export default function TabCalidad({
  observaciones,
  onChangeObservaciones,
  desviaciones,
  onChangeDesviaciones,
  generales,
  onChangeGenerales,
  editable
}: TabCalidadProps) {

  // --- Producto bajo observación ---
  const addObsRow = () => {
    if (!editable) return;
    onChangeObservaciones([
      ...observaciones,
      { codigo_sap: '', descripcion: '', orden: '', lote: '', defecto: '', ticket: '', nca: '', causa_raiz: '', acciones: '', obs: '' }
    ]);
  };

  const removeObsRow = (index: number) => {
    if (!editable) return;
    const updated = [...observaciones];
    updated.splice(index, 1);
    onChangeObservaciones(updated);
  };

  const updateObsCell = (index: number, key: keyof ProductoObservacion, value: string) => {
    if (!editable) return;
    const updated = [...observaciones];
    let updatedRow = { ...updated[index], [key]: value };
    if (key === 'codigo_sap') {
      const matched = CATALOGO_PRODUCTOS_PBO.find(p => p.codigo.toLowerCase() === value.toLowerCase().trim());
      if (matched) {
        updatedRow.descripcion = matched.nombre;
      }
    }
    updated[index] = updatedRow;
    onChangeObservaciones(updated);
  };

  // --- Desviaciones sin retención ---
  const addDesvRow = () => {
    if (!editable) return;
    onChangeDesviaciones([
      ...desviaciones,
      { hora: '', codigo_sap: '', descripcion: '', lote: '', tipo: '', defecto: '', nca: '', paletas_afectadas: '', pruebas_funcionales: '', observaciones: '' }
    ]);
  };

  const removeDesvRow = (index: number) => {
    if (!editable) return;
    const updated = [...desviaciones];
    updated.splice(index, 1);
    onChangeDesviaciones(updated);
  };

  const updateDesvCell = (index: number, key: keyof DesviacionSinRetencion, value: string) => {
    if (!editable) return;
    const updated = [...desviaciones];
    let updatedRow = { ...updated[index], [key]: value };
    if (key === 'codigo_sap') {
      const matched = CATALOGO_PRODUCTOS_PBO.find(p => p.codigo.toLowerCase() === value.toLowerCase().trim());
      if (matched) {
        updatedRow.descripcion = matched.nombre;
      }
    }
    updated[index] = updatedRow;
    onChangeDesviaciones(updated);
  };

  // --- Observaciones generales ---
  const addGenRow = () => {
    if (!editable) return;
    onChangeGenerales([
      ...generales,
      { tipo_evento: '', descripcion: '' }
    ]);
  };

  const removeGenRow = (index: number) => {
    if (!editable) return;
    const updated = [...generales];
    updated.splice(index, 1);
    onChangeGenerales(updated);
  };

  const updateGenCell = (index: number, key: keyof ObservacionGeneral, value: string) => {
    if (!editable) return;
    const updated = [...generales];
    updated[index] = { ...updated[index], [key]: value };
    onChangeGenerales(updated);
  };

  return (
    <div className="space-y-8">
      {/* 2. DESVIACIONES SIN RETENCION */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Desviaciones Detectadas sin Retención</h2>
              <p className="text-xs text-slate-500">Incidentes o defectos menores identificados que no ameritaron retención física de producto.</p>
            </div>
          </div>
          {editable && (
            <button
              onClick={addDesvRow}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Añadir Desviación
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-4 w-[10%]">Cód SAP</th>
                <th className="py-3 px-4 w-[24%]">Descripción</th>
                <th className="py-3 px-4 w-[12%]">Lote</th>
                <th className="py-3 px-4 w-[16%]">Defecto</th>
                <th className="py-3 px-4 w-[8%]">NCA</th>
                <th className="py-3 px-4 w-[11%]">Tickets Afect.</th>
                <th className="py-3 px-4 w-[11%]">Pruebas Func.</th>
                <th className="py-3 px-4 w-[14%]">Observaciones</th>
                {editable && <th className="py-3 px-4 w-[4%] text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {desviaciones.length === 0 ? (
                <tr>
                  <td colSpan={editable ? 9 : 8} className="py-8 text-center text-slate-400 font-medium bg-slate-50/40">
                    No se reportaron desviaciones menores sin retención.
                  </td>
                </tr>
              ) : (
                desviaciones.map((desv, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/10 transition-all">
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.codigo_sap}
                        onChange={(val) => updateDesvCell(idx, 'codigo_sap', val)}
                        placeholder="SAP"
                        label="Código SAP"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.descripcion}
                        onChange={(val) => updateDesvCell(idx, 'descripcion', val)}
                        placeholder="Descripción"
                        label="Descripción del Producto"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.lote}
                        onChange={(val) => updateDesvCell(idx, 'lote', val)}
                        placeholder="Lote"
                        label="Lote del Producto"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.defecto}
                        onChange={(val) => updateDesvCell(idx, 'defecto', val)}
                        placeholder="Defecto"
                        label="Defecto Detectado"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.nca}
                        onChange={(val) => updateDesvCell(idx, 'nca', val)}
                        placeholder="NCA"
                        label="Nivel de Calidad Aceptable (NCA)"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.paletas_afectadas}
                        onChange={(val) => updateDesvCell(idx, 'paletas_afectadas', val)}
                        placeholder="Cant. tickets"
                        label="Tickets Afectados"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.pruebas_funcionales}
                        onChange={(val) => updateDesvCell(idx, 'pruebas_funcionales', val)}
                        placeholder="Ok / Falló / N/A"
                        label="Pruebas Funcionales Realizadas"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={desv.observaciones}
                        onChange={(val) => updateDesvCell(idx, 'observaciones', val)}
                        placeholder="..."
                        label="Observaciones Adicionales"
                      />
                    </td>
                    {editable && (
                      <td className="text-center py-1 px-1.5">
                        <button
                          onClick={() => removeDesvRow(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
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

      {/* 3. OBSERVACIONES GENERALES */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Observaciones Generales</h2>
              <p className="text-xs text-slate-500">Eventos de mantenimiento, paradas de línea o cualquier otra novedad operativa relevante.</p>
            </div>
          </div>
          {editable && (
            <button
              onClick={addGenRow}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Nueva Observación
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-4 w-[25%]">Tipo de Evento</th>
                <th className="py-3 px-4 w-[70%]">Descripción de la Novedad</th>
                {editable && <th className="py-3 px-4 w-[5%] text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {generales.length === 0 ? (
                <tr>
                  <td colSpan={editable ? 3 : 2} className="py-8 text-center text-slate-400 font-medium bg-slate-50/40">
                    No se registraron observaciones adicionales.
                  </td>
                </tr>
              ) : (
                generales.map((gen, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/5 transition-all">
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={gen.tipo_evento}
                        onChange={(val) => updateGenCell(idx, 'tipo_evento', val)}
                        placeholder="Ej. Parada de Planta, Almuerzo, Auditoría..."
                        label="Tipo de Evento"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={gen.descripcion}
                        onChange={(val) => updateGenCell(idx, 'descripcion', val)}
                        placeholder="Describa a detalle lo acontecido..."
                        label="Descripción de la Novedad"
                      />
                    </td>
                    {editable && (
                      <td className="text-center py-1 px-1.5">
                        <button
                          onClick={() => removeGenRow(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
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
