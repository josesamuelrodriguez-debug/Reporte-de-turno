import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText,
  Download, 
  CheckCircle, 
  Info, 
  Edit3, 
  RefreshCw 
} from 'lucide-react';
import { LotePBO, Paleta, Reproceso } from '../types';
import { 
  FO062FormData, 
  buildDefaultFO062Data, 
  exportPBOToOfficialExcel 
} from '../utils/pboExcelExport';
import { exportPBOToOfficialPDF } from '../utils/pboPdfExport';

interface FO062ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lote: LotePBO | null;
  paletas: Paleta[];
  reprocesos?: Reproceso[];
  analistaActual?: string;
}

export const FO062ExportModal: React.FC<FO062ExportModalProps> = ({
  isOpen,
  onClose,
  lote,
  paletas,
  reprocesos = [],
  analistaActual = ''
}) => {
  const [formData, setFormData] = useState<FO062FormData | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && lote) {
      const initial = buildDefaultFO062Data(lote, paletas, reprocesos, analistaActual);
      setFormData(initial);
    }
  }, [isOpen, lote, paletas, reprocesos, analistaActual]);

  if (!isOpen || !lote || !formData) return null;

  const handleFieldChange = (field: keyof FO062FormData, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleReset = () => {
    if (lote) {
      setFormData(buildDefaultFO062Data(lote, paletas, reprocesos, analistaActual));
    }
  };

  const handleDownloadPDF = async () => {
    if (!formData || !lote) return;
    setIsExportingPdf(true);
    try {
      await exportPBOToOfficialPDF(formData, lote.id_pbo);
      setSuccessToast('¡Documento PDF de Producto No Conforme (PNC) descargado con éxito!');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Error exporting FO062 PDF:', err);
      alert('Ocurrió un error al generar el archivo PDF oficial.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!formData || !lote) return;
    setIsExportingExcel(true);
    try {
      await exportPBOToOfficialExcel(formData, lote.id_pbo);
      setSuccessToast('¡Formato FO062 generado y descargado con éxito en Excel (.xlsx)!');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Error exporting FO062 Excel:', err);
      alert('Ocurrió un error al generar el archivo Excel oficial.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-xs">
              <FileSpreadsheet className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded-md text-emerald-200 border border-emerald-500/30">
                  FO062-CM21-CAL
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-white">
                  Versión 2
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5 flex items-center gap-2">
                Formato Oficial de Producto No Conforme
                <span className="text-xs font-mono font-bold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-sm border border-emerald-400/30">
                  {lote.id_pbo}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION TOAST */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {successToast}
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-slate-50/50">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-emerald-950">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Pre-visualización y Llenado Automatizado:</strong> Los datos del PBO han sido cargados exactamente en las casillas correspondientes del formato oficial <strong>FO062-CM21-CAL</strong>. Puedes revisar o personalizar cualquier campo antes de realizar la descarga directa en PDF o Excel (.xlsx).
            </div>
          </div>

          {/* FORM GRID */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-emerald-600" /> Datos del Encabezado e Inspección
              </h4>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Restaurar datos originales del PBO"
              >
                <RefreshCw className="w-3 h-3" /> Restaurar originales
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Fecha */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Fecha
                </label>
                <input
                  type="text"
                  value={formData.fecha}
                  onChange={e => handleFieldChange('fecha', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="DD/MM/YYYY"
                />
              </div>

              {/* Correspondencia */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Correspondencia
                </label>
                <input
                  type="text"
                  value={formData.correspondencia}
                  onChange={e => handleFieldChange('correspondencia', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Proceso */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Proceso
                </label>
                <input
                  type="text"
                  value={formData.proceso}
                  onChange={e => handleFieldChange('proceso', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Aviso de Calidad */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Aviso de Calidad
                </label>
                <input
                  type="text"
                  value={formData.avisoCalidad}
                  onChange={e => handleFieldChange('avisoCalidad', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              {/* Lote de Inspección */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Lote de Inspección
                </label>
                <input
                  type="text"
                  value={formData.loteInspeccion}
                  onChange={e => handleFieldChange('loteInspeccion', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              {/* Material */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Material / Descripción
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={e => handleFieldChange('material', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Código SAP */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Código SAP
                </label>
                <input
                  type="text"
                  value={formData.codigoSap}
                  onChange={e => handleFieldChange('codigoSap', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Código Proveedor */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Código Proveedor
                </label>
                <input
                  type="text"
                  value={formData.codigoProveedor}
                  onChange={e => handleFieldChange('codigoProveedor', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Lote */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Lote
                </label>
                <input
                  type="text"
                  value={formData.lote}
                  onChange={e => handleFieldChange('lote', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Orden de Fabricación */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Orden Fabricación
                </label>
                <input
                  type="text"
                  value={formData.ordenFabricacion}
                  onChange={e => handleFieldChange('ordenFabricacion', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Cantidad Retenida */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Cantidad Retenida
                </label>
                <input
                  type="text"
                  value={formData.cantidadRetenida}
                  onChange={e => handleFieldChange('cantidadRetenida', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-extrabold text-indigo-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Cantidad No Conforme */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Cantidad No Conforme
                </label>
                <input
                  type="text"
                  value={formData.cantidadNoConforme}
                  onChange={e => handleFieldChange('cantidadNoConforme', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-extrabold text-rose-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Número de Paletas / Tickets */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Número de Paleta / Tickets Retenidos
                </label>
                <textarea
                  rows={2}
                  value={formData.numeroPaleta}
                  onChange={e => handleFieldChange('numeroPaleta', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Lista de tickets separados por coma..."
                />
              </div>

              {/* Defecto */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Defecto
                </label>
                <input
                  type="text"
                  value={formData.defecto}
                  onChange={e => handleFieldChange('defecto', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-rose-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Causa(s) */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Causa(s) Identificada(s)
                </label>
                <textarea
                  rows={2}
                  value={formData.causas}
                  onChange={e => handleFieldChange('causas', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Describa la causa raíz o el evento que originó la no conformidad..."
                />
              </div>

              {/* Observación */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Observación y Medidas
                </label>
                <textarea
                  rows={2}
                  value={formData.observacion}
                  onChange={e => handleFieldChange('observacion', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Observaciones de almacenamiento, destino, trazabilidad..."
                />
              </div>

              {/* Elaborado por */}
              <div className="sm:col-span-1 lg:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Elaborado por
                </label>
                <input
                  type="text"
                  value={formData.elaboradoPor}
                  onChange={e => handleFieldChange('elaboradoPor', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Revisado por */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Revisado por
                </label>
                <input
                  type="text"
                  value={formData.revisadoPor}
                  onChange={e => handleFieldChange('revisadoPor', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExportingExcel || isExportingPdf}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 active:bg-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingExcel ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generando Excel...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Descargar Excel (.xlsx)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExportingExcel || isExportingPdf}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generando PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Descargar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

