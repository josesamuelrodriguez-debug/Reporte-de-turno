import React, { useEffect, useState } from 'react';
import { History, Eye, ArrowUpRight, CheckCircle2, FileEdit, Clock, Printer, Trash2 } from 'lucide-react';
import { ReporteTurno } from '../types';
import { getHistorialReportes } from '../db';

interface TabHistorialProps {
  onLoadReporte: (id: number) => void;
  onPrintReporte?: (id: number) => void;
  onDeleteReporte?: (id: number) => void;
  currentReporteId?: number;
  refreshTrigger?: number;
}

export default function TabHistorial({
  onLoadReporte,
  onPrintReporte,
  onDeleteReporte,
  currentReporteId,
  refreshTrigger = 0
}: TabHistorialProps) {
  const [historial, setHistorial] = useState<ReporteTurno[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const data = await getHistorialReportes();
      setHistorial(data);
    } catch (e) {
      console.error("Error loading historical reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [refreshTrigger, currentReporteId]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Historial de Reportes de Turno</h2>
            <p className="text-xs text-slate-500">Consulte o recargue reportes anteriores grabados en la base de datos.</p>
          </div>
        </div>
        <button
          onClick={cargarHistorial}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          Sincronizar Historial
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
              <th className="py-3 px-4 w-[18%]">Código de Reporte</th>
              <th className="py-3 px-4 w-[15%]">Fecha</th>
              <th className="py-3 px-4 w-[12%]">Grupo</th>
              <th className="py-3 px-4 w-[22%]">Analista Responsable</th>
              <th className="py-3 px-4 w-[12%]">Turno</th>
              <th className="py-3 px-4 w-[11%]">Estado</th>
              <th className="py-3 px-4 w-[10%] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  Cargando historial de turnos...
                </td>
              </tr>
            ) : historial.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                  No hay reportes de turno registrados aún. ¡Comience un borrador!
                </td>
              </tr>
            ) : (
              historial.map((rep) => {
                const isActive = currentReporteId === rep.id;
                const isBorrador = rep.estado === 'Borrador';

                return (
                  <tr 
                    key={rep.id} 
                    className={`hover:bg-slate-50/50 transition-all ${isActive ? 'bg-indigo-50/20' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {rep.fecha ? `${rep.fecha.replace(/-/g, '')}-T${rep.turno}-${rep.grupo}` : `TEMP-${rep.id}`}
                        </span>
                        {isActive && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black uppercase px-1 py-0.5 rounded-sm">
                            Abierto
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">ID Registro: #{rep.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{rep.fecha}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">Grupo {rep.grupo}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 truncate block max-w-[200px]" title={rep.analista}>
                      {rep.analista || 'No especificado'}
                    </td>
                    <td className="py-3.5 px-4">Turno {rep.turno}</td>
                    <td className="py-3.5 px-4">
                      {isBorrador ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" /> Borrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terminado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onLoadReporte(rep.id!)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isBorrador
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                          }`}
                          disabled={isActive}
                          title={isBorrador ? "Editar Borrador" : "Cargar Reporte"}
                        >
                          {isBorrador ? (
                            <FileEdit className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {!isBorrador && onPrintReporte && (
                           <button
                             onClick={() => onPrintReporte(rep.id!)}
                             className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                             title="Imprimir Resumen"
                           >
                             <Printer className="w-3.5 h-3.5" />
                           </button>
                        )}
                        {onDeleteReporte && (
                           <button
                             onClick={() => onDeleteReporte(rep.id!)}
                             className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-700"
                             title="Eliminar Reporte"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
