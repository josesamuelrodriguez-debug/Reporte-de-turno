// TabSeguimiento.tsx - Restored Active Pending Tasks (Herencia)
import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, ClipboardList, Plus, Trash2, ArrowRightLeft, FileCheck } from 'lucide-react';
import { Trazabilidad, Pendiente } from '../types';
import { getTrazabilidadActiva, getPendientesActivos } from '../db';
import ExpandableCell from './ExpandableCell';
import { CATALOGO_PRODUCTOS_PBO } from './TabPBO';

interface TabSeguimientoProps {
  reporteId?: number;
  trazabilidadesNuevas: Trazabilidad[];
  onChangeTrazabilidadesNuevas: (traz: Trazabilidad[]) => void;
  trazabilidadesResueltas: number[]; // Array of trace IDs resolved in current report
  onChangeTrazabilidadesResueltas: (ids: number[]) => void;
  trazabilidadesResueltasObjetos?: Trazabilidad[];
  onChangeTrazabilidadesResueltasObjetos?: (traz: Trazabilidad[]) => void;
  trazabilidadesHeredadasModificadas?: Trazabilidad[];
  onChangeTrazabilidadesHeredadasModificadas?: (traz: Trazabilidad[]) => void;
  pendientesNuevos: Pendiente[];
  onChangePendientesNuevos: (pend: Pendiente[]) => void;
  pendientesResueltos: number[]; // Array of pending IDs resolved in current report
  onChangePendientesResueltos: (ids: number[]) => void;
  pendientesResueltosObjetos?: Pendiente[];
  onChangePendientesResueltosObjetos?: (pend: Pendiente[]) => void;
  editable: boolean;
  refreshTrigger?: number; // Trigger reload of DB active entries
}

export default function TabSeguimiento({
  reporteId,
  trazabilidadesNuevas,
  onChangeTrazabilidadesNuevas,
  trazabilidadesResueltas,
  onChangeTrazabilidadesResueltas,
  trazabilidadesResueltasObjetos = [],
  onChangeTrazabilidadesResueltasObjetos,
  trazabilidadesHeredadasModificadas,
  onChangeTrazabilidadesHeredadasModificadas,
  pendientesNuevos,
  onChangePendientesNuevos,
  pendientesResueltos,
  onChangePendientesResueltos,
  pendientesResueltosObjetos = [],
  onChangePendientesResueltosObjetos,
  editable,
  refreshTrigger = 0
}: TabSeguimientoProps) {
  const [dbTrazabilidades, setDbTrazabilidades] = useState<Trazabilidad[]>([]);
  const [dbPendientes, setDbPendientes] = useState<Pendiente[]>([]);
  const [loading, setLoading] = useState(false);

  // Load unresolved items from DB (prior completed shifts)
  useEffect(() => {
    let active = true;
    const loadActiveFromDb = async () => {
      setLoading(true);
      try {
        const [activeTraz, activePend] = await Promise.all([
          getTrazabilidadActiva(reporteId),
          getPendientesActivos(reporteId)
        ]);
        if (active) {
          setDbTrazabilidades(activeTraz);
          setDbPendientes(activePend);

          // Sync resolved objects if they match active loaded items
          if (onChangeTrazabilidadesResueltasObjetos && trazabilidadesResueltas.length > 0) {
            const matchedTraz = activeTraz.filter(t => t.id && trazabilidadesResueltas.includes(t.id));
            if (matchedTraz.length > 0) {
              onChangeTrazabilidadesResueltasObjetos(matchedTraz);
            }
          }
          if (onChangePendientesResueltosObjetos && pendientesResueltos.length > 0) {
            const matchedPend = activePend.filter(p => p.id && pendientesResueltos.includes(p.id));
            if (matchedPend.length > 0) {
              onChangePendientesResueltosObjetos(matchedPend);
            }
          }
        }
      } catch (err) {
        console.error("Error loading active handover items", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadActiveFromDb();
    return () => {
      active = false;
    };
  }, [refreshTrigger, reporteId]);

  // Handle editing inherited trazabilidades
  const handleEditHeredada = (id: number, field: keyof Trazabilidad, value: any) => {
    if (!editable) return;
    
    let updatedResolvedIds = [...trazabilidadesResueltas];
    let updatedResolvedObjs = [...trazabilidadesResueltasObjetos];

    setDbTrazabilidades(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        
        // Auto-resolve logic
        const bothChecked = Boolean(updated.hacia_adelante && updated.hacia_atras);
        updated.estado = bothChecked ? 'Finalizada' : 'Pendiente';
        const currentlyResolved = updatedResolvedIds.includes(id);
        
        if (bothChecked && !currentlyResolved) {
          updatedResolvedIds.push(id);
          updatedResolvedObjs.push(updated);
        } else if (!bothChecked && currentlyResolved) {
          updatedResolvedIds = updatedResolvedIds.filter(rid => rid !== id);
          updatedResolvedObjs = updatedResolvedObjs.filter(o => o.id !== id);
        } else if (bothChecked && currentlyResolved) {
          const idx = updatedResolvedObjs.findIndex(o => o.id === id);
          if (idx >= 0) updatedResolvedObjs[idx] = updated;
        }
        
        return updated;
      }
      return t;
    }));

    onChangeTrazabilidadesResueltas(updatedResolvedIds);
    if (onChangeTrazabilidadesResueltasObjetos) {
      onChangeTrazabilidadesResueltasObjetos(updatedResolvedObjs);
    }
    
    if (onChangeTrazabilidadesHeredadasModificadas && trazabilidadesHeredadasModificadas) {
      const existingIdx = trazabilidadesHeredadasModificadas.findIndex(t => t.id === id);
      const original = dbTrazabilidades.find(t => t.id === id);
      const baseItem = existingIdx >= 0 ? trazabilidadesHeredadasModificadas[existingIdx] : (original || {});
      const updatedItem = { ...baseItem, [field]: value };
      const bothChecked = Boolean(updatedItem.hacia_adelante && updatedItem.hacia_atras);
      updatedItem.estado = bothChecked ? 'Finalizada' : 'Pendiente';

      if (existingIdx >= 0) {
        const updatedList = [...trazabilidadesHeredadasModificadas];
        updatedList[existingIdx] = updatedItem as Trazabilidad;
        onChangeTrazabilidadesHeredadasModificadas(updatedList);
      } else {
        onChangeTrazabilidadesHeredadasModificadas([...trazabilidadesHeredadasModificadas, updatedItem as Trazabilidad]);
      }
    }
  };

  // Handle checking/unchecking a pending item
  const togglePendienteResuelto = (id: number) => {
    if (!editable) return;
    let updatedResolvedIds = [...pendientesResueltos];
    let updatedResolvedObjs = [...pendientesResueltosObjetos];

    if (updatedResolvedIds.includes(id)) {
      updatedResolvedIds = updatedResolvedIds.filter(x => x !== id);
      updatedResolvedObjs = updatedResolvedObjs.filter(o => o.id !== id);
    } else {
      updatedResolvedIds.push(id);
      const targetItem = dbPendientes.find(p => p.id === id);
      if (targetItem) {
        updatedResolvedObjs.push(targetItem);
      }
    }

    onChangePendientesResueltos(updatedResolvedIds);
    if (onChangePendientesResueltosObjetos) {
      onChangePendientesResueltosObjetos(updatedResolvedObjs);
    }
  };

  // --- Registrar Nueva Trazabilidad ---
  const addNuevaTrazRow = () => {
    if (!editable) return;
    onChangeTrazabilidadesNuevas([
      ...trazabilidadesNuevas,
      {
        tipo: 'Sin marcar',
        codigo_sap: '',
        descripcion: '',
        orden: '',
        lote: '',
        defecto: '',
        ticket: '',
        tickets_inspeccionados: '',
        tickets_retenidos: '',
        estado: 'Pendiente',
        obs: '',
        hacia_adelante: false,
        hacia_atras: false
      }
    ]);
  };

  const removeNuevaTrazRow = (index: number) => {
    if (!editable) return;
    const updated = [...trazabilidadesNuevas];
    updated.splice(index, 1);
    onChangeTrazabilidadesNuevas(updated);
  };

  const updateNuevaTrazCell = (index: number, key: keyof Trazabilidad, value: any) => {
    if (!editable) return;
    const updated = [...trazabilidadesNuevas];
    let row = { ...updated[index], [key]: value };

    if (key === 'codigo_sap') {
      const matched = CATALOGO_PRODUCTOS_PBO.find(p => p.codigo.toLowerCase() === value.toLowerCase().trim());
      if (matched) {
        row.descripcion = matched.nombre;
      }
    }

    // Automatically determine state and tipo text
    const forward = row.hacia_adelante ?? false;
    const backward = row.hacia_atras ?? false;

    if (forward && backward) {
      row.estado = 'Finalizada';
      row.tipo = 'Adelante y Atrás';
    } else {
      row.estado = 'Pendiente';
      if (forward) {
        row.tipo = 'Hacia delante';
      } else if (backward) {
        row.tipo = 'Hacia atrás';
      } else {
        row.tipo = 'Sin marcar';
      }
    }

    updated[index] = row;
    onChangeTrazabilidadesNuevas(updated);
  };

  // --- Registrar Nuevo Pendiente ---
  const addNuevoPendRow = () => {
    if (!editable) return;
    onChangePendientesNuevos([
      ...pendientesNuevos,
      { descripcion: '', responsable: '', observaciones: '', estado: 'Pendiente' }
    ]);
  };

  const removeNuevoPendRow = (index: number) => {
    if (!editable) return;
    const updated = [...pendientesNuevos];
    updated.splice(index, 1);
    onChangePendientesNuevos(updated);
  };

  const updateNuevoPendCell = (index: number, key: keyof Pendiente, value: string) => {
    if (!editable) return;
    const updated = [...pendientesNuevos];
    updated[index] = { ...updated[index], [key]: value };
    onChangePendientesNuevos(updated);
  };

  return (
    <div className="space-y-8">
      {/* SECCION TRAZABILIDADES ACTIVAS (HERENCIA) */}
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Trazabilidades Activas (Herencia)</h2>
              <p className="text-xs text-slate-500">Trazabilidades iniciadas en turnos anteriores. Marque hacia adelante y hacia atrás para finalizarlas.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-[6%] leading-tight">Hacia<br/>Adelante</th>
                  <th className="py-2.5 px-3 text-center w-[6%] leading-tight">Hacia<br/>Atrás</th>
                  <th className="py-2.5 px-3 w-[10%]">Código SAP</th>
                  <th className="py-2.5 px-3 w-[16%]">Descripción</th>
                  <th className="py-2.5 px-3 w-[8%]">Orden</th>
                  <th className="py-2.5 px-3 w-[8%]">Lote</th>
                  <th className="py-2.5 px-3 w-[10%]">Defecto</th>
                  <th className="py-2.5 px-3 w-[12%]">Inspeccionados</th>
                  <th className="py-2.5 px-3 w-[12%]">Retenidos</th>
                  <th className="py-2.5 px-3 w-[12%]">Comentarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                      Cargando trazabilidades activas...
                    </td>
                  </tr>
                ) : dbTrazabilidades.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                      Excelente: No hay trazabilidades abiertas de turnos anteriores.
                    </td>
                  </tr>
                ) : (
                  dbTrazabilidades.map((t) => {
                    const isChecked = trazabilidadesResueltas.includes(t.id!);
                    return (
                      <tr 
                        key={t.id} 
                        className={`transition-all hover:bg-slate-50 ${isChecked ? 'bg-emerald-50/40 text-emerald-800' : ''}`}
                      >
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={!editable}
                            onClick={() => handleEditHeredada(t.id!, 'hacia_adelante', !t.hacia_adelante)}
                            className={`p-1 rounded-sm transition-all ${t.hacia_adelante ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {t.hacia_adelante ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={!editable}
                            onClick={() => handleEditHeredada(t.id!, 'hacia_atras', !t.hacia_atras)}
                            className={`p-1 rounded-sm transition-all ${t.hacia_atras ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {t.hacia_atras ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className={`py-3 px-3 font-semibold ${isChecked ? 'line-through' : ''}`}>{t.codigo_sap}</td>
                        <td className={`py-3 px-3 ${isChecked ? 'line-through' : ''}`}>{t.descripcion}</td>
                        <td className={`py-3 px-3 ${isChecked ? 'line-through' : ''}`}>{t.orden}</td>
                        <td className={`py-3 px-3 font-semibold ${isChecked ? 'line-through' : ''}`}>{t.lote}</td>
                        <td className={`py-3 px-3 ${isChecked ? 'line-through' : ''}`}>{t.defecto}</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={t.tickets_inspeccionados || ''}
                            onChange={(e) => handleEditHeredada(t.id!, 'tickets_inspeccionados', e.target.value)}
                            disabled={!editable}
                            className={`w-full text-xs p-1.5 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${isChecked ? 'bg-transparent border-transparent text-emerald-800' : 'bg-white border-slate-300'}`}
                            placeholder="Tickets"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={t.tickets_retenidos || ''}
                            onChange={(e) => handleEditHeredada(t.id!, 'tickets_retenidos', e.target.value)}
                            disabled={!editable}
                            className={`w-full text-xs p-1.5 border rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-shadow ${isChecked ? 'bg-transparent border-transparent text-emerald-800' : 'bg-white border-slate-300'}`}
                            placeholder="Retenidos"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={t.obs || ''}
                            onChange={(e) => handleEditHeredada(t.id!, 'obs', e.target.value)}
                            disabled={!editable}
                            className={`w-full text-xs p-1.5 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${isChecked ? 'bg-transparent border-transparent text-emerald-800' : 'bg-white border-slate-300'}`}
                            placeholder="Obs..."
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECCION PENDIENTES DE TRABAJO (HERENCIA) */}
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Tareas/Pendientes Activos (Herencia)</h2>
              <p className="text-xs text-slate-500">Marque las actividades realizadas durante este turno.</p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 max-h-[350px] rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-[12%]">Hecho</th>
                  <th className="py-2.5 px-3 w-[48%]">Descripción del Pendiente</th>
                  <th className="py-2.5 px-3 w-[20%]">Responsable</th>
                  <th className="py-2.5 px-3 w-[20%]">Comentarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                      Cargando pendientes activos...
                    </td>
                  </tr>
                ) : dbPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                      Excelente: No hay tareas o pendientes abiertos.
                    </td>
                  </tr>
                ) : (
                  dbPendientes.map((p) => {
                    const isChecked = pendientesResueltos.includes(p.id!);
                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => togglePendienteResuelto(p.id!)}
                        className={`transition-all hover:bg-slate-50 cursor-pointer ${isChecked ? 'bg-emerald-50/40 text-emerald-800 line-through' : ''}`}
                      >
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={!editable}
                            className={`p-1 rounded-sm transition-all ${isChecked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold">{p.descripcion}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-600">{p.responsable || 'Cualquiera'}</td>
                        <td className="py-3 px-3 text-slate-500 italic text-[10px]">{p.observaciones || 'Sin comentarios'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REGISTRAR NUEVA TRAZABILIDAD */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Registrar Nueva Trazabilidad</h2>
              <p className="text-xs text-slate-500">Deje documentadas las trazabilidades realizadas durante este turno.</p>
            </div>
          </div>
          {editable && (
            <button
              onClick={addNuevaTrazRow}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Agregar Trazabilidad
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-2 w-[8%] text-center">Hacia Adelante</th>
                <th className="py-3 px-2 w-[8%] text-center">Hacia Atrás</th>
                <th className="py-3 px-4 w-[10%]">Código SAP</th>
                <th className="py-3 px-4 w-[18%]">Descripción</th>
                <th className="py-3 px-4 w-[10%]">Orden</th>
                <th className="py-3 px-4 w-[10%]">Lote</th>
                <th className="py-3 px-4 w-[10%]">Defecto/Causa</th>
                <th className="py-3 px-4 w-[10%]">Tickets Inspeccionados</th>
                <th className="py-3 px-4 w-[10%]">Tickets Retenidos</th>
                <th className="py-3 px-4 w-[12%]">OBS/Comentarios</th>
                {editable && <th className="py-3 px-4 w-[4%] text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {trazabilidadesNuevas.length === 0 ? (
                <tr>
                  <td colSpan={editable ? 11 : 10} className="py-8 text-center text-slate-400 font-medium bg-slate-50/40">
                    No se han registrado nuevas solicitudes de trazabilidad en este turno.
                  </td>
                </tr>
              ) : (
                trazabilidadesNuevas.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-all">
                    <td className="py-1 px-1.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1">
                        <input
                          type="checkbox"
                          disabled={!editable}
                          checked={t.hacia_adelante || false}
                          onChange={(e) => updateNuevaTrazCell(idx, 'hacia_adelante', e.target.checked)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                      </label>
                    </td>
                    <td className="py-1 px-1.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1">
                        <input
                          type="checkbox"
                          disabled={!editable}
                          checked={t.hacia_atras || false}
                          onChange={(e) => updateNuevaTrazCell(idx, 'hacia_atras', e.target.checked)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                      </label>
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.codigo_sap}
                        onChange={(val) => updateNuevaTrazCell(idx, 'codigo_sap', val)}
                        placeholder="SAP"
                        label="Código SAP"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.descripcion}
                        onChange={(val) => updateNuevaTrazCell(idx, 'descripcion', val)}
                        placeholder="Descripción"
                        label="Descripción de la Trazabilidad"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.orden}
                        onChange={(val) => updateNuevaTrazCell(idx, 'orden', val)}
                        placeholder="Orden"
                        label="Número de Orden"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.lote}
                        onChange={(val) => updateNuevaTrazCell(idx, 'lote', val)}
                        placeholder="Lote"
                        label="Lote de Producción"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.defecto}
                        onChange={(val) => updateNuevaTrazCell(idx, 'defecto', val)}
                        placeholder="Defecto"
                        label="Defecto / Causa para Trazabilidad"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.tickets_inspeccionados || ''}
                        onChange={(val) => updateNuevaTrazCell(idx, 'tickets_inspeccionados', val)}
                        placeholder="Inspeccionados"
                        label="Tickets Inspeccionados"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.tickets_retenidos || ''}
                        onChange={(val) => updateNuevaTrazCell(idx, 'tickets_retenidos', val)}
                        placeholder="Retenidos"
                        label="Tickets Retenidos"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={t.obs}
                        onChange={(val) => updateNuevaTrazCell(idx, 'obs', val)}
                        placeholder="Comentarios"
                        label="Observaciones y Detalles de Trazabilidad"
                      />
                    </td>
                    {editable && (
                      <td className="text-center py-1 px-1.5">
                        <button
                          onClick={() => removeNuevaTrazRow(idx)}
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

      {/* REGISTRAR NUEVO PENDIENTE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Registrar Nuevo Pendiente</h2>
              <p className="text-xs text-slate-500">Deje tareas o pendientes específicos para los próximos turnos.</p>
            </div>
          </div>
          {editable && (
            <button
              onClick={addNuevoPendRow}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Solicitar Pendiente
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                <th className="py-3 px-4 w-[45%]">Descripción del Pendiente</th>
                <th className="py-3 px-4 w-[20%]">Responsable Sugerido</th>
                <th className="py-3 px-4 w-[30%]">Observaciones / Detalles</th>
                {editable && <th className="py-3 px-4 w-[5%] text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pendientesNuevos.length === 0 ? (
                <tr>
                  <td colSpan={editable ? 4 : 3} className="py-8 text-center text-slate-400 font-medium bg-slate-50/40">
                    No se han registrado nuevos pendientes en este turno.
                  </td>
                </tr>
              ) : (
                pendientesNuevos.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-all">
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={p.descripcion}
                        onChange={(val) => updateNuevoPendCell(idx, 'descripcion', val)}
                        placeholder="Ej. Revisar balanzas de ensacadora L1"
                        label="Descripción del Pendiente"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={p.responsable}
                        onChange={(val) => updateNuevoPendCell(idx, 'responsable', val)}
                        placeholder="Ej. Bruno / Turno mañana"
                        label="Responsable Sugerido"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <ExpandableCell
                        disabled={!editable}
                        value={p.observaciones}
                        onChange={(val) => updateNuevoPendCell(idx, 'observaciones', val)}
                        placeholder="Detalles adicionales..."
                        label="Observaciones y Detalles del Pendiente"
                      />
                    </td>
                    {editable && (
                      <td className="text-center py-1 px-1.5">
                        <button
                          onClick={() => removeNuevoPendRow(idx)}
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
