import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  CheckCircle2, 
  PlusCircle, 
  Database, 
  Settings, 
  History, 
  AlertOctagon, 
  AlertTriangle,
  ClipboardCheck,
  Sparkles,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { 
  getAnalistas, 
  getUltimoReporteBorrador, 
  guardarReporteCompleto, 
  terminarReporte, 
  eliminarReporte,
  getReportePorId, 
  isSupabaseConnected,
  getLotesPBO,
  getSavedSupabaseConfig
} from './db';
import { 
  ReporteTurno, 
  ProductoTurno, 
  ProductoObservacion, 
  DesviacionSinRetencion, 
  ObservacionGeneral, 
  IdentificacionRociadoras, 
  Trazabilidad, 
  Pendiente, 
  ReporteCompleto 
} from './types';

// Tab components
import TabGeneral from './components/TabGeneral';
import TabCalidad from './components/TabCalidad';
import TabSeguimiento from './components/TabSeguimiento';
import TabRociadoras from './components/TabRociadoras';
import TabResumen from './components/TabResumen';
import TabHistorial from './components/TabHistorial';
import TabConfiguracion from './components/TabConfiguracion';
import { TabRoce } from './components/TabRoce';
import TabPBO from './components/TabPBO';
import CompanyLogo from './components/CompanyLogo';

export default function App() {
  // Navigation & Security State
  const [activeModule, setActiveModule] = useState<'inspeccion' | 'pbo'>('inspeccion');
  const [currentRole, setCurrentRole] = useState<'public' | 'calidad' | 'logistica'>(() => {
    return 'calidad';
  });
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'general' | 'calidad' | 'seguimiento' | 'rociadoras' | 'roce' | 'resumen' | 'historial' | 'configuracion'>('general');
  const [dbConnected, setDbConnected] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');

  const [isScrolled, setIsScrolled] = useState(false);

  // Warning when reloading the page to prevent unsaved data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '¿Desea guardar lo registrado? Se perderán los datos si recarga la página.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAuthenticate = (pin: string): boolean => {
    setCurrentRole('calidad');
    setLoginError(false);
    return true;
  };

  const handleLogout = () => {
    setCurrentRole('calidad');
    setActiveModule('pbo');
  };

  // Analysts State
  const [analistas, setAnalistas] = useState<string[]>([]);

  // Main Report State
  const [reporteId, setReporteId] = useState<number | undefined>(undefined);
  const [editable, setEditable] = useState(true);
  const [cabecera, setCabecera] = useState<ReporteTurno>({
    fecha: '',
    grupo: 'A',
    analista: '',
    turno: 1,
    temp_cumple: true,
    hum_cumple: true,
    pie_calidad_cumple: true,
    observacion_pie_calidad: '',
    pie_operaciones_cumple: true,
    observacion_pie_operaciones: '',
    caida_tension: '',
    observaciones_ambiente: '',
    equipos_medicion: '',
    start_quality_cumple: true,
    observacion_start_quality: '',
    estado: 'Borrador'
  });
  const [productos, setProductos] = useState<ProductoTurno[]>([]);
  const [observaciones, setObservaciones] = useState<ProductoObservacion[]>([]);
  const [desviaciones, setDesviaciones] = useState<DesviacionSinRetencion[]>([]);
  const [generales, setGenerales] = useState<ObservacionGeneral[]>([]);
  const [rociadoras, setRociadoras] = useState<IdentificacionRociadoras[]>([]);
  const [trazabilidadesNuevas, setTrazabilidadesNuevas] = useState<Trazabilidad[]>([]);
  const [trazabilidadesResueltas, setTrazabilidadesResueltas] = useState<number[]>([]);
  const [trazabilidadesResueltasObjetos, setTrazabilidadesResueltasObjetos] = useState<Trazabilidad[]>([]);
  const [trazabilidadesHeredadasModificadas, setTrazabilidadesHeredadasModificadas] = useState<Trazabilidad[]>([]);
  const [pendientesNuevos, setPendientesNuevos] = useState<Pendiente[]>([]);
  const [pendientesResueltos, setPendientesResueltos] = useState<number[]>([]);
  const [pendientesResueltosObjetos, setPendientesResueltosObjetos] = useState<Pendiente[]>([]);

  // Trigger to update trace/issues lists
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pboLotesCount, setPboLotesCount] = useState<number>(0);

  // Initialize dates
  const initFecha = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load analysts list and active borrador report on mount
  const loadInitialData = async () => {
    setDbConnected(isSupabaseConnected());
    
    // Resolve dynamic Supabase logo or local logo
    const config = getSavedSupabaseConfig();
    if (config && config.url) {
      const cleanUrl = config.url.replace(/\/$/, '');
      setLogoSrc(`${cleanUrl}/storage/v1/object/public/logos/logo.png`);
    } else {
      setLogoSrc('/logo.png');
    }
    
    // Load analysts
    try {
      const list = await getAnalistas();
      setAnalistas(list);
    } catch (e) {
      console.error("Error loading analysts list", e);
    }

    // Try to load any existing "Borrador" shift report
    try {
      const draft = await getUltimoReporteBorrador();
      if (draft) {
        cargarReporteEnPantalla(draft);
      } else {
        resetearNuevoReporte();
      }
    } catch (e) {
      console.error("Error loading active draft", e);
      resetearNuevoReporte();
    }
  };

  const handleConfigChanged = () => {
    loadInitialData();
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load and count PBO lotes for the current shift
  useEffect(() => {
    const fetchPboCount = async () => {
      try {
        const allPbo = await getLotesPBO();
        const count = allPbo.filter(
          l => l.fecha_registro === cabecera.fecha && l.turno_registro === cabecera.turno
        ).length;
        setPboLotesCount(count);
      } catch (err) {
        console.error("Error fetching PBO count in App:", err);
      }
    };
    if (cabecera.fecha) {
      fetchPboCount();
    }
  }, [cabecera.fecha, cabecera.turno, refreshTrigger, activeModule]);

  // Load a complete report payload into the form states
  const cargarReporteEnPantalla = (payload: ReporteCompleto) => {
    setReporteId(payload.reporte_id);
    setCabecera(payload.cabecera);
    setProductos(payload.productos);
    setObservaciones(payload.observaciones);
    setDesviaciones(payload.desviaciones);
    setGenerales(payload.generales);
    setRociadoras(payload.rociadoras);
    setTrazabilidadesNuevas(payload.trazabilidades_nuevas);
    setTrazabilidadesResueltas(payload.trazabilidades_resueltas);
    setTrazabilidadesResueltasObjetos(payload.trazabilidades_resueltas_objetos || []);
    setPendientesNuevos(payload.pendientes_nuevos || []);
    setPendientesResueltos(payload.pendientes_resueltos);
    setPendientesResueltosObjetos(payload.pendientes_resueltos_objetos || []);
    setEditable(payload.cabecera.estado === 'Borrador');
    
    // Force lists to update
    setRefreshTrigger(prev => prev + 1);
  };

  // Clear everything and set a fresh form state
  const resetearNuevoReporte = () => {
    setReporteId(undefined);
    setCabecera({
      fecha: initFecha(),
      grupo: 'A',
      analista: '',
      turno: 1,
      temp_cumple: true,
      hum_cumple: true,
      pie_calidad_cumple: true,
      observacion_pie_calidad: '',
      pie_operaciones_cumple: true,
      observacion_pie_operaciones: '',
      caida_tension: '',
      observaciones_ambiente: '',
      estado: 'Borrador'
    });
    setProductos([]);
    setObservaciones([]);
    setDesviaciones([]);
    setGenerales([]);
    setRociadoras([]);
    setTrazabilidadesNuevas([]);
    setTrazabilidadesResueltas([]);
    setTrazabilidadesResueltasObjetos([]);
    setPendientesNuevos([]);
    setPendientesResueltos([]);
    setPendientesResueltosObjetos([]);
    setEditable(true);

    // Refresh trace and issue lists
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNuevoBorrador = () => {
    if (reporteId) {
      const confirm = window.confirm(
        `¿Desea iniciar un nuevo borrador en blanco desde cero?\n\nEl borrador actual (N°${reporteId}) permanecerá guardado en el historial y NO se borrará. Podrá volver a cargarlo en cualquier momento.`
      );
      if (!confirm) return;
    } else {
      const hasData = cabecera.analista || productos.length > 0 || observaciones.length > 0;
      if (hasData) {
        const confirm = window.confirm(
          "¿Desea iniciar un nuevo borrador en blanco?\n\nSi desea conservar los datos ingresados hasta ahora, asegúrese de hacer clic en 'Guardar' primero."
        );
        if (!confirm) return;
      }
    }
    resetearNuevoReporte();
    setActiveTab('general');
    alert("Se ha iniciado un nuevo borrador en blanco.");
  };

  // Trigger loading report from history
  const handleLoadReportePorId = async (id: number) => {
    try {
      const rep = await getReportePorId(id);
      if (rep) {
        cargarReporteEnPantalla(rep);
        setActiveTab('general');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(`No se encontró el reporte N°${id}.`);
      }
    } catch (err) {
      console.error("Error reading report details", err);
      alert("No se pudo cargar el reporte.");
    }
  };

  const handlePrintReporteDesdeHistorial = async (id: number) => {
    try {
      const rep = await getReportePorId(id);
      if (rep) {
        cargarReporteEnPantalla(rep);
        setActiveTab('resumen');
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        alert(`No se encontró el reporte N°${id}.`);
      }
    } catch (err) {
      console.error("Error preparing report for print", err);
      alert("No se pudo cargar el reporte para imprimir.");
    }
  };

  const handleDeleteReporte = async (id: number) => {
    const confirm = window.confirm(`¿Está seguro que desea ELIMINAR PERMANENTEMENTE el reporte N°${id}? Esta acción no se puede deshacer.`);
    if (!confirm) return;

    try {
      await eliminarReporte(id);
      alert(`Reporte N°${id} eliminado con éxito.`);
      setRefreshTrigger(prev => prev + 1);
      
      // If the deleted report is the active one, reset
      if (reporteId === id) {
        resetearNuevoReporte();
        setActiveTab('general');
      }
    } catch (err: any) {
      console.error("Error deleting report", err);
      alert(`Ocurrió un error al eliminar: ${err.message || err}`);
    }
  };

  // Compile full object payload for database saving
  const recopilarPayload = (): ReporteCompleto => {
    return {
      reporte_id: reporteId,
      cabecera,
      productos,
      observaciones,
      desviaciones,
      generales,
      rociadoras,
      trazabilidades_nuevas: trazabilidadesNuevas,
      trazabilidades_resueltas: trazabilidadesResueltas,
      trazabilidades_resueltas_objetos: trazabilidadesResueltasObjetos.filter(t => Boolean(t.hacia_adelante && t.hacia_atras)),
      trazabilidades_activas_modificadas: trazabilidadesHeredadasModificadas,
      pendientes_nuevos: pendientesNuevos,
      pendientes_resueltos: pendientesResueltos,
      pendientes_resueltos_objetos: pendientesResueltosObjetos.filter(p => p.id && pendientesResueltos.includes(p.id))
    };
  };

  // Action: Save progress
  const handleGuardarAvance = async (mostrarAlerta = true): Promise<boolean> => {
    if (!cabecera.analista) {
      alert('Debe seleccionar un analista antes de guardar.');
      setActiveTab('general');
      return false;
    }

    try {
      const payload = recopilarPayload();
      const newId = await guardarReporteCompleto(payload);
      setReporteId(newId);
      
      if (mostrarAlerta) {
        alert(`¡Avance guardado con éxito! ID de Reporte: N°${newId}`);
      }
      
      // Sync list
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (err: any) {
      console.error("Error saving progress", err);
      alert(`Error al guardar: ${err.message || err}`);
      return false;
    }
  };

  // Action: Terminate shift
  const handleTerminarTurno = async () => {
    if (!cabecera.analista) {
      alert('Debe seleccionar un analista antes de terminar el turno.');
      setActiveTab('general');
      return;
    }

    const confirmTerminar = window.confirm(
      '¿Está seguro de TERMINAR EL TURNO?\n\n' +
      'Una vez cerrado, el reporte quedará finalizado y bloqueado de forma permanente. ' +
      'Las tareas y trazabilidades marcadas como resueltas se consolidarán, y las nuevas pasarán como herencia al siguiente turno.'
    );

    if (!confirmTerminar) return;

    // Save first
    const saved = await handleGuardarAvance(false);
    if (!saved || !reporteId) {
      alert('No se pudo guardar el reporte antes de cerrarlo. Intente de nuevo.');
      return;
    }

    try {
      await terminarReporte(reporteId);
      setEditable(false);
      setCabecera(prev => ({ ...prev, estado: 'Terminado' }));
      alert(`¡Turno terminado y consolidado con éxito! Reporte N°${reporteId} finalizado.`);
      
      // Go to summary to review or print
      setActiveTab('resumen');
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error("Error ending shift", err);
      alert(`Error al finalizar turno: ${err.message || err}`);
    }
  };

  // Action: Start new shift
  const handleComenzarNuevoTurno = () => {
    const confirmNuevo = window.confirm('¿Desea abrir un formulario en blanco para un NUEVO TURNO?');
    if (!confirmNuevo) return;
    
    resetearNuevoReporte();
    setActiveTab('general');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      
      {/* TOP STATUS BAR (Hidden when printing) */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[10px] sm:text-xs font-semibold border-b border-slate-800 print:hidden flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest hidden md:inline">Sistema de Inspección de Turno v1.2.5</span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-[11px] font-bold text-slate-300">
            Sesión: {currentRole === 'calidad' ? (
              <span className="text-indigo-400 font-extrabold uppercase bg-indigo-500/10 px-2 py-0.5 rounded">Calidad</span>
            ) : currentRole === 'logistica' ? (
              <span className="text-orange-400 font-extrabold uppercase bg-orange-500/10 px-2 py-0.5 rounded">Logística</span>
            ) : (
              <span className="text-slate-400 font-extrabold uppercase bg-slate-800 px-2 py-0.5 rounded">Consulta Pública</span>
            )}
          </span>
          {currentRole !== 'public' && (
            <button
              onClick={handleLogout}
              className="text-[10px] font-extrabold text-rose-400 hover:text-rose-350 underline uppercase tracking-wider cursor-pointer ml-2"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
        <div className="flex items-center">
          {dbConnected ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Supabase Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-slate-500"></span>
              Local Activo
            </span>
          )}
        </div>
      </div>

      {/* HEADER BAR (Hidden when printing) */}
      <header className="bg-white text-slate-900 border-b border-slate-200 relative print:hidden shadow-xs h-auto sm:h-16 py-3 sm:py-0 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <CompanyLogo className="h-8 sm:h-10 w-auto object-contain shrink-0" />
            <div className="bg-indigo-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl tracking-wider shadow-lg shadow-indigo-100 shrink-0">
              SE
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800">
                {activeModule === 'inspeccion' ? 'Inspección de Turno' : 'Producto Bajo Observación'}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden xs:block">
                {activeModule === 'inspeccion' ? 'Control de Calidad e Incidencias' : 'Registro de Retenciones y Cuarentenas'}
              </p>
            </div>
          </div>

          {/* Module Switcher and Actions Toggle */}
          <div className="flex flex-col xs:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Module Switcher Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full xs:w-auto justify-center">
              <button
                onClick={() => setActiveModule('inspeccion')}
                className={`flex-1 xs:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModule === 'inspeccion'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📋 Inspección
              </button>
              <button
                onClick={() => setActiveModule('pbo')}
                className={`flex-1 xs:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModule === 'pbo'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🛡️ PBO
              </button>
            </div>

            {/* Quick Actions (Save / Terminar / Nuevo Borrador) */}
            {currentRole === 'calidad' && (
              <div className="flex items-center gap-2 w-full xs:w-auto justify-center">
                <button
                  onClick={handleNuevoBorrador}
                  className="flex-1 xs:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition-all whitespace-nowrap"
                  title="Crear un nuevo borrador de reporte desde cero"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Nuevo Borrador
                </button>
                {editable && (
                  <>
                    <button
                      onClick={() => handleGuardarAvance(true)}
                      className="flex-1 xs:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition-all whitespace-nowrap"
                      title="Guardar Avance de Reporte"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Guardar
                    </button>
                    <button
                      onClick={handleTerminarTurno}
                      className="flex-1 xs:flex-initial flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition-all whitespace-nowrap"
                      title="Terminar y Finalizar Turno"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terminar Turno
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* WARNING INDICATORS (Fila Superior) (Hidden when printing) */}
      {activeModule === 'inspeccion' && currentRole === 'calidad' && (
        <section className="bg-slate-50/50 border-b border-slate-200 py-4 px-4 print:hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Active Shift details summary */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">Reporte Actual</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {reporteId ? `Reporte N°${reporteId}` : 'Borrador sin Guardar'}
                </span>
                <span className="text-slate-500 block text-[10px] mt-0.5">
                  {cabecera.fecha ? `Fecha: ${cabecera.fecha}` : 'Sin fecha'} | Grupo: {cabecera.grupo}
                </span>
              </div>
            </div>

            {/* Alert: Products held under observation */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="block font-bold text-rose-400 uppercase text-[10px] tracking-wider">Bajo Observación</span>
                <span className="font-extrabold text-rose-700 block text-sm mt-0.5">
                  {pboLotesCount} Lote(s) Retenido(s)
                </span>
                <span className="text-rose-500/75 block text-[10px] mt-0.5">Requieren inspección en laboratorio</span>
              </div>
            </div>

            {/* Alert: Deviations without hold */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3 sm:col-span-2 lg:col-span-1">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="block font-bold text-amber-400 uppercase text-[10px] tracking-wider">Desviaciones Operativas</span>
                <span className="font-extrabold text-amber-700 block text-sm mt-0.5">
                  {desviaciones.length} Desviación(es) Menor(es)
                </span>
                <span className="text-amber-600 block text-[10px] mt-0.5">No generaron retencion</span>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* TAB NAVIGATION (Hidden when printing) */}
      {activeModule === 'inspeccion' && currentRole === 'calidad' && (
        <nav className="bg-white border-b border-slate-200 print:hidden overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'general' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 Datos y Operación
            </button>
            <button
              onClick={() => setActiveTab('calidad')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'calidad' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🔍 Calidad e Incidentes
            </button>
            <button
              onClick={() => setActiveTab('seguimiento')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'seguimiento' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📌 Seguimiento y Cierre
            </button>
            <button
              onClick={() => setActiveTab('rociadoras')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'rociadoras' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🎨 Rociadoras
            </button>
            <button
              onClick={() => setActiveTab('roce')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'roce' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🔄 Roce
            </button>
            <button
              onClick={() => setActiveTab('resumen')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'resumen' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📊 Resumen Visual
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'historial' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Historial de Turnos
            </button>
          </div>
        </nav>
      )}

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 print:p-0">
        <div className="print:block">
          {activeModule === 'pbo' ? (
            <TabPBO 
              currentRole={currentRole}
              onAuthenticate={handleAuthenticate}
              onLogout={handleLogout}
              cabeceraFecha={cabecera.fecha}
              cabeceraTurno={cabecera.turno}
              cabeceraAnalista={cabecera.analista}
            />
          ) : (
            /* TRADITIONAL INSPECTION TABS */
            <>
              {activeTab === 'general' && (
                <TabGeneral 
                  cabecera={cabecera}
                  onChangeCabecera={(c) => setCabecera(prev => ({ ...prev, ...c }))}
                  productos={productos}
                  onChangeProductos={setProductos}
                  analistas={analistas}
                  editable={editable}
                />
              )}

                {activeTab === 'calidad' && (
                  <TabCalidad
                    observaciones={observaciones}
                    onChangeObservaciones={setObservaciones}
                    desviaciones={desviaciones}
                    onChangeDesviaciones={setDesviaciones}
                    generales={generales}
                    onChangeGenerales={setGenerales}
                    editable={editable}
                  />
                )}

                {activeTab === 'seguimiento' && (
                  <TabSeguimiento
                    reporteId={reporteId}
                    trazabilidadesNuevas={trazabilidadesNuevas}
                    onChangeTrazabilidadesNuevas={setTrazabilidadesNuevas}
                    trazabilidadesResueltas={trazabilidadesResueltas}
                    onChangeTrazabilidadesResueltas={setTrazabilidadesResueltas}
                    trazabilidadesResueltasObjetos={trazabilidadesResueltasObjetos}
                    onChangeTrazabilidadesResueltasObjetos={setTrazabilidadesResueltasObjetos}
                    trazabilidadesHeredadasModificadas={trazabilidadesHeredadasModificadas}
                    onChangeTrazabilidadesHeredadasModificadas={setTrazabilidadesHeredadasModificadas}
                    pendientesNuevos={pendientesNuevos}
                    onChangePendientesNuevos={setPendientesNuevos}
                    pendientesResueltos={pendientesResueltos}
                    onChangePendientesResueltos={setPendientesResueltos}
                    pendientesResueltosObjetos={pendientesResueltosObjetos}
                    onChangePendientesResueltosObjetos={setPendientesResueltosObjetos}
                    editable={editable}
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {activeTab === 'rociadoras' && (
                  <TabRociadoras
                    rociadoras={rociadoras}
                    onChangeRociadoras={setRociadoras}
                    editable={editable}
                  />
                )}

                {activeTab === 'roce' && (
                  <TabRoce
                    cabeceraFecha={cabecera.fecha}
                    cabeceraTurno={cabecera.turno}
                    usuarioRegistro={currentRole === 'calidad' ? 'INSPECTOR CALIDAD' : 'OPERADOR'}
                  />
                )}

                {activeTab === 'resumen' && (
                  <TabResumen 
                    reporte={recopilarPayload()}
                  />
                )}

                {activeTab === 'historial' && (
                  <TabHistorial
                    onLoadReporte={handleLoadReportePorId}
                    onPrintReporte={handlePrintReporteDesdeHistorial}
                    onDeleteReporte={handleDeleteReporte}
                    currentReporteId={reporteId}
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {activeTab === 'configuracion' && (
                  <TabConfiguracion 
                    onConfigChanged={handleConfigChanged}
                  />
                )}
              </>
            )}
          </div>
        </main>

      {/* FOOTER ACTION BAR (Hidden when printing) */}
      {activeModule === 'inspeccion' && currentRole === 'calidad' && !editable && (
        <footer className="bg-white border-t border-slate-200 py-4 px-6 print:hidden shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            
            <div>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> REPORTE FINALIZADO Y CONSOLIDADO
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleComenzarNuevoTurno}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Iniciar Nuevo Turno
              </button>
            </div>

          </div>
        </footer>
      )}

      {/* Floating Action Bar when scrolling (Hidden when printing) */}
      {currentRole === 'calidad' && editable && isScrolled && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/80 transition-all duration-300 print:hidden animate-fade-in">
          <button
            onClick={() => handleGuardarAvance(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-all whitespace-nowrap"
            title="Guardar Avance de Reporte"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar
          </button>
          <button
            onClick={handleTerminarTurno}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-all whitespace-nowrap"
            title="Terminar y Finalizar Turno"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terminar Turno
          </button>
        </div>
      )}

    </div>
  );
}
