import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ReporteCompleto, 
  Analista, 
  ReporteTurno, 
  ProductoTurno, 
  ProductoObservacion, 
  DesviacionSinRetencion, 
  ObservacionGeneral, 
  IdentificacionRociadoras, 
  Trazabilidad, 
  Pendiente,
  LotePBO,
  Paleta,
  Reproceso, RocePrueba
} from './types';

// Default analistas list
const DEFAULT_ANALISTAS: string[] = [
  'BRUNO MUÑOZ',
  'STEFFANY OSTO',
  'DARWIN MARQUEZ',
  'GABRIELA LOPEZ',
  'DIEGO SANTAMARIA',
  'JOSÉ SEGOVIA'
];

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Check for env variables or local storage configuration
const getEnvConfig = (): SupabaseConfig | null => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  if (url && anonKey && url !== 'MY_SUPABASE_URL' && anonKey !== 'MY_SUPABASE_ANON_KEY') {
    return { url, anonKey };
  }
  return null;
};

export const getSavedSupabaseConfig = (): SupabaseConfig | null => {
  const env = getEnvConfig();
  if (env) return env;

  const stored = localStorage.getItem('supabase_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('supabase_config', JSON.stringify({ url, anonKey }));
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('supabase_config');
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSavedSupabaseConfig();
  if (!config) {
    cachedClient = null;
    return null;
  }
  
  if (!cachedClient) {
    cachedClient = createClient(config.url, config.anonKey);
  }
  return cachedClient;
};

export const isSupabaseConnected = (): boolean => {
  return getSupabaseClient() !== null;
};

// ==========================================
// LOCAL STORAGE BACKEND (FULL DATABASE ENGINE)
// ==========================================

const getLocalData = (key: string, defaultValue: any = []) => {
  const val = localStorage.getItem(`db_${key}`);
  if (!val) return defaultValue;
  try {
    return JSON.parse(val);
  } catch {
    return defaultValue;
  }
};

const setLocalData = (key: string, data: any) => {
  localStorage.setItem(`db_${key}`, JSON.stringify(data));
};

// Initialize default data if empty
const initLocalDb = () => {
  if (!localStorage.getItem('db_analistas')) {
    const analistas: Analista[] = DEFAULT_ANALISTAS.map((nombre, i) => ({
      id: i + 1,
      nombre,
      activo: true
    }));
    setLocalData('analistas', analistas);
  }
};

initLocalDb();

// ==========================================
// UNIFIED DATABASE SERVICE
// ==========================================

export const getAnalistas = async (): Promise<string[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('analistas')
        .select('nombre')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(r => r.nombre);
      }
    } catch (e) {
      console.error("Supabase Error, falling back to Local", e);
    }
  }

  // Fallback
  const local: Analista[] = getLocalData('analistas');
  return local.filter(a => a.activo).map(a => a.nombre).sort();
};

export const getPendientesActivos = async (reporteId?: number): Promise<Pendiente[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('pendientes').select('*');
      if (reporteId) {
        query = query.or(`estado.eq.Pendiente,reporte_resolucion_id.eq.${reporteId}`);
      } else {
        query = query.eq('estado', 'Pendiente');
      }
      const { data, error } = await query.order('id', { ascending: true });
      
      if (error) throw error;
      return (data || []).filter(p => {
        if (p.estado === 'Realizado' && p.reporte_resolucion_id !== reporteId) {
          return false;
        }
        return true;
      });
    } catch (e) {
      console.error("Supabase error fetching active issues", e);
    }
  }

  // Fallback
  const pendientes: Pendiente[] = getLocalData('pendientes');
  return pendientes.filter(p => {
    if (p.estado === 'Realizado' && p.reporte_resolucion_id !== reporteId) {
      return false;
    }
    if (!reporteId && p.estado === 'Realizado') return false;
    return p.estado === 'Pendiente' || p.reporte_resolucion_id === reporteId;
  });
};

export const parseTrazabilidadesList = (list: Trazabilidad[]): Trazabilidad[] => {
  return list.map(t => {
    let insp = t.tickets_inspeccionados || '';
    let ret = t.tickets_retenidos || '';
    if (!insp && !ret && t.ticket) {
      if (t.ticket.includes('|')) {
        const parts = t.ticket.split('|');
        const inspPart = parts[0] || '';
        const retPart = parts[1] || '';
        insp = inspPart.replace('Insp:', '').trim();
        ret = retPart.replace('Ret:', '').trim();
      } else {
        insp = t.ticket;
      }
    }
    return {
      ...t,
      tickets_inspeccionados: insp,
      tickets_retenidos: ret
    };
  });
};

export const getTrazabilidadActiva = async (reporteId?: number): Promise<Trazabilidad[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('trazabilidad').select('*');
      if (reporteId) {
        query = query.or(`estado.eq.Pendiente,reporte_resolucion_id.eq.${reporteId}`);
      } else {
        query = query.eq('estado', 'Pendiente');
      }
      const { data, error } = await query.order('id', { ascending: true });
      
      if (error) throw error;
      const parsed = parseTrazabilidadesList(data || []);
      return parsed.filter(t => {
        const isBoth = Boolean(t.hacia_adelante && t.hacia_atras);
        if (isBoth && t.estado !== 'Finalizada') {
          t.estado = 'Finalizada';
        }
        if ((t.estado === 'Finalizada' || isBoth) && t.reporte_resolucion_id !== reporteId) {
          return false;
        }
        return true;
      });
    } catch (e) {
      console.error("Supabase error fetching active traceability", e);
    }
  }

  // Fallback
  const list: Trazabilidad[] = getLocalData('trazabilidad');
  const parsed = parseTrazabilidadesList(list);
  return parsed.filter(t => {
    const isBoth = Boolean(t.hacia_adelante && t.hacia_atras);
    if (isBoth && t.estado !== 'Finalizada') {
      t.estado = 'Finalizada';
    }
    if ((t.estado === 'Finalizada' || isBoth) && t.reporte_resolucion_id !== reporteId) {
      return false;
    }
    if (!reporteId && (t.estado === 'Finalizada' || isBoth)) return false;
    return t.estado === 'Pendiente' || t.reporte_resolucion_id === reporteId;
  });
};

export const getUltimoReporteBorrador = async (): Promise<ReporteCompleto | null> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: cabeceras, error: errCab } = await supabase
        .from('reporte_turno')
        .select('*')
        .eq('estado', 'Borrador')
        .order('id', { ascending: false })
        .limit(1);
      
      if (errCab) throw errCab;
      if (!cabeceras || cabeceras.length === 0) return null;

      const supaCab = cabeceras[0] as ReporteTurno;
      const rId = supaCab.id!;
      const localCabecera = getLocalData('reporte_turno').find((c: any) => c.id === rId);
      const cabecera: ReporteTurno = localCabecera ? { ...supaCab, ...localCabecera } : supaCab;

      const [
        { data: productos },
        { data: observaciones },
        { data: desviaciones },
        { data: generales },
        { data: rociadoras },
        { data: trazabilidades_nuevas },
        { data: trazabilidades_resueltas },
        { data: pendientes_nuevos },
        { data: pendientes_resueltos }
      ] = await Promise.all([
        supabase.from('productos_turno').select('*').eq('reporte_id', rId),
        supabase.from('producto_observacion').select('*').eq('reporte_id', rId),
        supabase.from('desviaciones_sin_retencion').select('*').eq('reporte_id', rId),
        supabase.from('observaciones_generales').select('*').eq('reporte_id', rId),
        supabase.from('identificacion_rociadoras').select('*').eq('reporte_id', rId),
        supabase.from('trazabilidad').select('*').eq('reporte_creacion_id', rId),
        supabase.from('trazabilidad').select('*').eq('reporte_resolucion_id', rId),
        supabase.from('pendientes').select('*').eq('reporte_creacion_id', rId),
        supabase.from('pendientes').select('*').eq('reporte_resolucion_id', rId)
      ]);

      const trazResueltasFull = (trazabilidades_resueltas || []) as Trazabilidad[];
      const pendResueltosFull = (pendientes_resueltos || []) as Pendiente[];

      return {
        reporte_id: rId,
        cabecera,
        productos: productos || [],
        observaciones: observaciones || [],
        desviaciones: desviaciones || [],
        generales: generales || [],
        rociadoras: rociadoras || [],
        trazabilidades_nuevas: parseTrazabilidadesList(trazabilidades_nuevas || []),
        trazabilidades_resueltas: trazResueltasFull.map(r => r.id!),
        trazabilidades_resueltas_objetos: parseTrazabilidadesList(trazResueltasFull),
        pendientes_nuevos: pendientes_nuevos || [],
        pendientes_resueltos: pendResueltosFull.map(r => r.id!),
        pendientes_resueltos_objetos: pendResueltosFull
      };
    } catch (e) {
      console.error("Supabase error fetching borrador, using local fallback", e);
    }
  }

  // Fallback
  const cabeceras: ReporteTurno[] = getLocalData('reporte_turno');
  const borrador = cabeceras.find(c => c.estado === 'Borrador');
  if (!borrador) return null;

  const rId = borrador.id!;
  const productos: ProductoTurno[] = getLocalData('productos_turno').filter((p: any) => p.reporte_id === rId);
  const observaciones: ProductoObservacion[] = getLocalData('producto_observacion').filter((p: any) => p.reporte_id === rId);
  const desviaciones: DesviacionSinRetencion[] = getLocalData('desviaciones_sin_retencion').filter((p: any) => p.reporte_id === rId);
  const generales: ObservacionGeneral[] = getLocalData('observaciones_generales').filter((p: any) => p.reporte_id === rId);
  const rociadoras: IdentificacionRociadoras[] = getLocalData('identificacion_rociadoras').filter((p: any) => p.reporte_id === rId);
  
  const trazabilidades_nuevas: Trazabilidad[] = getLocalData('trazabilidad').filter((p: any) => p.reporte_creacion_id === rId);
  const trazResueltasFull: Trazabilidad[] = getLocalData('trazabilidad').filter((p: any) => p.reporte_resolucion_id === rId);
  const trazabilidades_resueltas: number[] = trazResueltasFull.map((p: any) => p.id);

  const pendientes_nuevos: Pendiente[] = getLocalData('pendientes').filter((p: any) => p.reporte_creacion_id === rId);
  const pendResueltosFull: Pendiente[] = getLocalData('pendientes').filter((p: any) => p.reporte_resolucion_id === rId);
  const pendientes_resueltos: number[] = pendResueltosFull.map((p: any) => p.id);

  return {
    reporte_id: rId,
    cabecera: borrador,
    productos,
    observaciones,
    desviaciones,
    generales,
    rociadoras,
    trazabilidades_nuevas: parseTrazabilidadesList(trazabilidades_nuevas),
    trazabilidades_resueltas,
    trazabilidades_resueltas_objetos: parseTrazabilidadesList(trazResueltasFull),
    pendientes_nuevos,
    pendientes_resueltos,
    pendientes_resueltos_objetos: pendResueltosFull
  };
};

export const eliminarReporte = async (reporteId: number): Promise<void> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('reporte_turno')
        .delete()
        .eq('id', reporteId);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Supabase error deleting report", e);
      throw e;
    }
  }

  // Fallback
  let cabeceras: ReporteTurno[] = getLocalData('reporte_turno');
  cabeceras = cabeceras.filter(c => c.id !== reporteId);
  setLocalData('reporte_turno', cabeceras);
};

export const terminarReporte = async (reporteId: number): Promise<void> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('reporte_turno')
        .update({ estado: 'Terminado' })
        .eq('id', reporteId);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Supabase error terminating report", e);
    }
  }

  // Fallback
  const cabeceras: ReporteTurno[] = getLocalData('reporte_turno');
  const index = cabeceras.findIndex(c => c.id === reporteId);
  if (index !== -1) {
    cabeceras[index].estado = 'Terminado';
    setLocalData('reporte_turno', cabeceras);
  }
};const guardarReporteLocal = (reporteCompleto: ReporteCompleto): number => {
  const {
    reporte_id,
    cabecera,
    productos,
    observaciones,
    desviaciones,
    generales,
    rociadoras,
    trazabilidades_nuevas,
    trazabilidades_resueltas,
    trazabilidades_activas_modificadas,
    pendientes_nuevos,
    pendientes_resueltos
  } = reporteCompleto;

  const resolvedTrazIds = new Set<number>(trazabilidades_resueltas || []);
  if (trazabilidades_activas_modificadas) {
    trazabilidades_activas_modificadas.forEach(traz => {
      if (traz.id) {
        if (traz.hacia_adelante && traz.hacia_atras) {
          resolvedTrazIds.add(traz.id);
        } else {
          resolvedTrazIds.delete(traz.id);
        }
      }
    });
  }

  const resolvedPendIds = new Set<number>(pendientes_resueltos || []);

  let rId = reporte_id;
  const cabeceras: ReporteTurno[] = getLocalData('reporte_turno');

  if (rId) {
    const index = cabeceras.findIndex(c => c.id === rId);
    if (index !== -1) {
      cabeceras[index] = { ...cabeceras[index], ...cabecera, id: rId };
    } else {
      cabeceras.unshift({ ...cabecera, id: rId });
    }
    setLocalData('reporte_turno', cabeceras);

    // Clean up associated children first to overwrite them
    const allProds: ProductoTurno[] = getLocalData('productos_turno').filter((p: any) => p.reporte_id !== rId);
    const allObs: ProductoObservacion[] = getLocalData('producto_observacion').filter((p: any) => p.reporte_id !== rId);
    const allDesv: DesviacionSinRetencion[] = getLocalData('desviaciones_sin_retencion').filter((p: any) => p.reporte_id !== rId);
    const allGen: ObservacionGeneral[] = getLocalData('observaciones_generales').filter((p: any) => p.reporte_id !== rId);
    const allRoc: IdentificacionRociadoras[] = getLocalData('identificacion_rociadoras').filter((p: any) => p.reporte_id !== rId);

    // Delete trace/issues originally created in this report
    const allTraz: Trazabilidad[] = getLocalData('trazabilidad').filter((p: any) => p.reporte_creacion_id !== rId);
    const allPend: Pendiente[] = getLocalData('pendientes').filter((p: any) => p.reporte_creacion_id !== rId);

    // Restore trace/issues marked resolved by this report back to Pendiente
    allTraz.forEach(t => {
      if (t.reporte_resolucion_id === rId) {
        t.estado = 'Pendiente';
        t.reporte_resolucion_id = null;
      }
    });
    allPend.forEach(p => {
      if (p.reporte_resolucion_id === rId) {
        p.estado = 'Pendiente';
        p.reporte_resolucion_id = null;
      }
    });

    setLocalData('productos_turno', allProds);
    setLocalData('producto_observacion', allObs);
    setLocalData('desviaciones_sin_retencion', allDesv);
    setLocalData('observaciones_generales', allGen);
    setLocalData('identificacion_rociadoras', allRoc);
    setLocalData('trazabilidad', allTraz);
    setLocalData('pendientes', allPend);

  } else {
    // Generar nuevo id
    rId = Date.now();
    const nuevoReporte: ReporteTurno = {
      ...cabecera,
      id: rId,
      estado: 'Borrador'
    };
    cabeceras.unshift(nuevoReporte); // Insertar al inicio
    setLocalData('reporte_turno', cabeceras);
  }

  const activeId = rId!;

  // Insertar hijos
  const localProds = getLocalData('productos_turno');
  productos.forEach(p => localProds.push({ ...p, id: Date.now() + Math.random(), reporte_id: activeId }));
  setLocalData('productos_turno', localProds);

  const localObs = getLocalData('producto_observacion');
  observaciones.forEach(o => localObs.push({ ...o, id: Date.now() + Math.random(), reporte_id: activeId }));
  setLocalData('producto_observacion', localObs);

  const localDesv = getLocalData('desviaciones_sin_retencion');
  desviaciones.forEach(d => localDesv.push({ ...d, id: Date.now() + Math.random(), reporte_id: activeId }));
  setLocalData('desviaciones_sin_retencion', localDesv);

  const localGen = getLocalData('observaciones_generales');
  generales.forEach(g => localGen.push({ ...g, id: Date.now() + Math.random(), reporte_id: activeId }));
  setLocalData('observaciones_generales', localGen);

  const localRoc = getLocalData('identificacion_rociadoras');
  rociadoras.forEach(r => localRoc.push({ ...r, id: Date.now() + Math.random(), reporte_id: activeId }));
  setLocalData('identificacion_rociadoras', localRoc);

  // Trace nuevas
  const localTraz: Trazabilidad[] = getLocalData('trazabilidad');
  trazabilidades_nuevas.forEach(t => {
    const isResolved = Boolean(t.hacia_adelante && t.hacia_atras);
    localTraz.push({
      ...t,
      id: Math.floor(Math.random() * 1000000),
      estado: isResolved ? 'Finalizada' : 'Pendiente',
      reporte_creacion_id: activeId,
      reporte_resolucion_id: isResolved ? activeId : null
    });
  });
  
  // Trace modificadas
  if (trazabilidades_activas_modificadas) {
    trazabilidades_activas_modificadas.forEach(traz => {
      const idx = localTraz.findIndex(t => t.id === traz.id);
      if (idx !== -1) {
        const isResolved = Boolean(traz.hacia_adelante && traz.hacia_atras);
        localTraz[idx].tickets_inspeccionados = traz.tickets_inspeccionados;
        localTraz[idx].tickets_retenidos = traz.tickets_retenidos;
        localTraz[idx].obs = traz.obs;
        localTraz[idx].hacia_adelante = traz.hacia_adelante;
        localTraz[idx].hacia_atras = traz.hacia_atras;
        localTraz[idx].estado = isResolved ? 'Finalizada' : 'Pendiente';
        localTraz[idx].reporte_resolucion_id = isResolved ? activeId : null;
      }
    });
  }

  // Trace resueltas / desmarcadas sync
  localTraz.forEach((t, idx) => {
    if (t.id && (t.reporte_resolucion_id === activeId || resolvedTrazIds.has(t.id))) {
      const isResolved = resolvedTrazIds.has(t.id);
      localTraz[idx].estado = isResolved ? 'Finalizada' : 'Pendiente';
      localTraz[idx].reporte_resolucion_id = isResolved ? activeId : null;
    }
  });
  setLocalData('trazabilidad', localTraz);

  // Pendientes nuevos
  const localPend: Pendiente[] = getLocalData('pendientes');
  pendientes_nuevos.forEach(p => {
    const isDone = p.estado === 'Realizado';
    localPend.push({
      ...p,
      id: Math.floor(Math.random() * 1000000),
      estado: isDone ? 'Realizado' : 'Pendiente',
      reporte_creacion_id: activeId,
      reporte_resolucion_id: isDone ? activeId : null
    });
  });

  // Pendientes resueltos / desmarcados sync
  localPend.forEach((p, idx) => {
    if (p.id && (p.reporte_resolucion_id === activeId || resolvedPendIds.has(p.id))) {
      const isDone = resolvedPendIds.has(p.id);
      localPend[idx].estado = isDone ? 'Realizado' : 'Pendiente';
      localPend[idx].reporte_resolucion_id = isDone ? activeId : null;
    }
  });
  setLocalData('pendientes', localPend);

  return activeId;
};

export const guardarReporteCompleto = async (
  reporteCompleto: ReporteCompleto
): Promise<number> => {
  // 1. Guardado local preventivo para garantizar que nada de información se pierda
  const localId = guardarReporteLocal(reporteCompleto);

  const {
    reporte_id,
    cabecera,
    productos,
    observaciones,
    desviaciones,
    generales,
    rociadoras,
    trazabilidades_nuevas,
    trazabilidades_resueltas,
    trazabilidades_activas_modificadas,
    pendientes_nuevos,
    pendientes_resueltos
  } = reporteCompleto;

  const resolvedTrazIds = new Set<number>(trazabilidades_resueltas || []);
  if (trazabilidades_activas_modificadas) {
    trazabilidades_activas_modificadas.forEach(traz => {
      if (traz.id) {
        if (traz.hacia_adelante && traz.hacia_atras) {
          resolvedTrazIds.add(traz.id);
        } else {
          resolvedTrazIds.delete(traz.id);
        }
      }
    });
  }

  const resolvedPendIds = new Set<number>(pendientes_resueltos || []);

  const supabase = getSupabaseClient();
  if (!supabase) {
    return localId;
  }

  try {
    let rId = reporte_id;

    // Payload de cabecera
    const cabeceraPayload: Record<string, any> = {
      fecha: cabecera.fecha,
      grupo: cabecera.grupo,
      analista: cabecera.analista,
      turno: cabecera.turno,
      temp_cumple: cabecera.temp_cumple,
      hum_cumple: cabecera.hum_cumple,
      pie_calidad_cumple: cabecera.pie_calidad_cumple,
      observacion_pie_calidad: cabecera.observacion_pie_calidad,
      pie_operaciones_cumple: cabecera.pie_operaciones_cumple,
      observacion_pie_operaciones: cabecera.observacion_pie_operaciones,
      tension_fleje_cumple: cabecera.tension_fleje_cumple,
      observacion_tension_fleje: cabecera.observacion_tension_fleje,
      video_inspector_cumple: cabecera.video_inspector_cumple,
      observacion_video_inspector: cabecera.observacion_video_inspector,
      light_tester_cumple: cabecera.light_tester_cumple,
      observacion_light_tester: cabecera.observacion_light_tester,
      printer_11_calificacion: cabecera.printer_11_calificacion,
      observacion_printer_11: cabecera.observacion_printer_11,
      printer_12_calificacion: cabecera.printer_12_calificacion,
      observacion_printer_12: cabecera.observacion_printer_12,
      printer_31_calificacion: cabecera.printer_31_calificacion,
      observacion_printer_31: cabecera.observacion_printer_31,
      printer_32_calificacion: cabecera.printer_32_calificacion,
      observacion_printer_32: cabecera.observacion_printer_32,
      caida_tension: cabecera.caida_tension,
      observaciones_ambiente: cabecera.observaciones_ambiente
    };

    const optionalColumns = [
      'observacion_pie_calidad',
      'pie_calidad_cumple',
      'observacion_pie_operaciones',
      'pie_operaciones_cumple',
      'observacion_tension_fleje',
      'tension_fleje_cumple',
      'observacion_video_inspector',
      'video_inspector_cumple',
      'observacion_light_tester',
      'light_tester_cumple',
      'observacion_printer_11',
      'printer_11_calificacion',
      'observacion_printer_12',
      'printer_12_calificacion',
      'observacion_printer_31',
      'printer_31_calificacion',
      'observacion_printer_32',
      'printer_32_calificacion',
      'caida_tension',
      'observaciones_ambiente',
      'temp_cumple',
      'hum_cumple'
    ];

    let payload = { ...cabeceraPayload };
    let activeId: number | null = null;

    for (let attempt = 0; attempt <= optionalColumns.length; attempt++) {
      if (rId) {
        const { error: errCab } = await supabase
          .from('reporte_turno')
          .update(payload)
          .eq('id', rId);

        if (!errCab) {
          activeId = rId;
          break;
        }

        const errMsg = (errCab.message || JSON.stringify(errCab)).toLowerCase();
        if (errMsg.includes('column') || errMsg.includes('schema cache') || errMsg.includes('could not find') || errCab.code === 'PGRST204' || errCab.code === '42703') {
          let removed = false;
          for (const col of optionalColumns) {
            if (col in payload && (errMsg.includes(col.toLowerCase()) || attempt === optionalColumns.length - 1)) {
              delete payload[col];
              removed = true;
              break;
            }
          }
          if (!removed) {
            const nextCol = optionalColumns.find(c => c in payload);
            if (nextCol) {
              delete payload[nextCol];
            } else {
              break;
            }
          }
        } else {
          break;
        }
      } else {
        const { data, error: errCab } = await supabase
          .from('reporte_turno')
          .insert({ ...payload, estado: 'Borrador' })
          .select('id')
          .single();

        if (!errCab && data) {
          activeId = data.id;
          break;
        }

        const errMsg = (errCab?.message || JSON.stringify(errCab)).toLowerCase();
        if (errMsg && (errMsg.includes('column') || errMsg.includes('schema cache') || errMsg.includes('could not find') || errCab?.code === 'PGRST204' || errCab?.code === '42703')) {
          let removed = false;
          for (const col of optionalColumns) {
            if (col in payload && (errMsg.includes(col.toLowerCase()) || attempt === optionalColumns.length - 1)) {
              delete payload[col];
              removed = true;
              break;
            }
          }
          if (!removed) {
            const nextCol = optionalColumns.find(c => c in payload);
            if (nextCol) {
              delete payload[nextCol];
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    }

    if (!activeId) {
      console.warn("No se pudo escribir en la tabla cabecera de Supabase, retornando ID local:", localId);
      return localId;
    }

    // Limpiar subtablas asociadas para sobreescribir
    await Promise.all([
      supabase.from('productos_turno').delete().eq('reporte_id', activeId),
      supabase.from('producto_observacion').delete().eq('reporte_id', activeId),
      supabase.from('desviaciones_sin_retencion').delete().eq('reporte_id', activeId),
      supabase.from('observaciones_generales').delete().eq('reporte_id', activeId),
      supabase.from('identificacion_rociadoras').delete().eq('reporte_id', activeId),
      supabase.from('trazabilidad').delete().eq('reporte_creacion_id', activeId),
      supabase.from('pendientes').delete().eq('reporte_creacion_id', activeId),
      supabase.from('trazabilidad').update({ estado: 'Pendiente', reporte_resolucion_id: null }).eq('reporte_resolucion_id', activeId),
      supabase.from('pendientes').update({ estado: 'Pendiente', reporte_resolucion_id: null }).eq('reporte_resolucion_id', activeId)
    ]);

    // 2. Insertar subtablas
    const insertPromises: Promise<any>[] = [];

    if (productos.length > 0) {
      insertPromises.push(
        supabase.from('productos_turno').insert(
          productos.map(p => ({
            reporte_id: activeId,
            codigo_sap: p.codigo_sap,
            descripcion: p.descripcion,
            orden: p.orden || null,
            lote: p.lote,
            cantidad: p.cantidad || null,
            paletas: p.paletas || null,
            camadas: p.camadas || null,
            obs: p.obs
          }))
        ) as any
      );
    }

    if (observaciones.length > 0) {
      insertPromises.push(
        supabase.from('producto_observacion').insert(
          observaciones.map(o => ({
            reporte_id: activeId,
            codigo_sap: o.codigo_sap,
            descripcion: o.descripcion,
            orden: o.orden,
            lote: o.lote,
            defecto: o.defecto,
            ticket: o.ticket,
            nca: o.nca,
            causa_raiz: o.causa_raiz,
            acciones: o.acciones,
            obs: o.obs
          }))
        ) as any
      );
    }

    if (desviaciones.length > 0) {
      insertPromises.push(
        supabase.from('desviaciones_sin_retencion').insert(
          desviaciones.map(d => ({
            reporte_id: activeId,
            hora: d.hora || null,
            codigo_sap: d.codigo_sap,
            descripcion: d.descripcion,
            lote: d.lote,
            tipo: d.tipo || null,
            defecto: d.defecto,
            nca: d.nca,
            paletas_afectadas: d.paletas_afectadas,
            pruebas_funcionales: d.pruebas_funcionales,
            observaciones: d.observaciones
          }))
        ) as any
      );
    }

    if (generales.length > 0) {
      insertPromises.push(
        supabase.from('observaciones_generales').insert(
          generales.map(g => ({
            reporte_id: activeId,
            tipo_evento: g.tipo_evento,
            descripcion: g.descripcion
          }))
        ) as any
      );
    }

    if (rociadoras.length > 0) {
      insertPromises.push(
        supabase.from('identificacion_rociadoras').insert(
          rociadoras.map(r => ({
            reporte_id: activeId,
            linea: r.linea,
            maquina: r.maquina,
            color: r.color,
            hora: r.hora || null
          }))
        ) as any
      );
    }

    if (trazabilidades_nuevas.length > 0) {
      insertPromises.push(
        supabase.from('trazabilidad').insert(
          trazabilidades_nuevas.map(t => {
            const isResolved = Boolean(t.hacia_adelante && t.hacia_atras);
            return {
              tipo: t.tipo,
              codigo_sap: t.codigo_sap,
              descripcion: t.descripcion,
              orden: t.orden,
              lote: t.lote,
              defecto: t.defecto,
              ticket: t.ticket || (t.tickets_inspeccionados && t.tickets_retenidos ? `Insp: ${t.tickets_inspeccionados} | Ret: ${t.tickets_retenidos}` : t.tickets_inspeccionados || t.tickets_retenidos || ''),
              tickets_inspeccionados: t.tickets_inspeccionados || null,
              tickets_retenidos: t.tickets_retenidos || null,
              estado: isResolved ? 'Finalizada' : 'Pendiente',
              obs: t.obs,
              hacia_adelante: t.hacia_adelante ?? false,
              hacia_atras: t.hacia_atras ?? false,
              reporte_creacion_id: activeId,
              reporte_resolucion_id: isResolved ? activeId : null
            };
          })
        ) as any
      );
    }

    if (pendientes_nuevos.length > 0) {
      insertPromises.push(
        supabase.from('pendientes').insert(
          pendientes_nuevos.map(p => {
            const isDone = p.estado === 'Realizado';
            return {
              descripcion: p.descripcion,
              responsable: p.responsable,
              observaciones: p.observaciones,
              estado: isDone ? 'Realizado' : 'Pendiente',
              reporte_creacion_id: activeId,
              reporte_resolucion_id: isDone ? activeId : null
            };
          })
        ) as any
      );
    }

    // 3. Resolver y Desmarcar Trazabilidades y Pendientes
    if (trazabilidades_activas_modificadas && trazabilidades_activas_modificadas.length > 0) {
      trazabilidades_activas_modificadas.forEach(traz => {
        if (traz.id) {
          const isResolved = Boolean(traz.hacia_adelante && traz.hacia_atras);
          insertPromises.push(
            supabase
              .from('trazabilidad')
              .update({
                tickets_inspeccionados: traz.tickets_inspeccionados,
                tickets_retenidos: traz.tickets_retenidos,
                obs: traz.obs,
                hacia_adelante: traz.hacia_adelante,
                hacia_atras: traz.hacia_atras,
                estado: isResolved ? 'Finalizada' : 'Pendiente',
                reporte_resolucion_id: isResolved ? activeId : null
              })
              .eq('id', traz.id) as any
          );
        }
      });
    }

    // Sync trazabilidad resolution states in Supabase
    if (resolvedTrazIds.size > 0) {
      const idsArray = Array.from(resolvedTrazIds);
      insertPromises.push(
        supabase
          .from('trazabilidad')
          .update({ estado: 'Finalizada', reporte_resolucion_id: activeId })
          .in('id', idsArray) as any
      );
      insertPromises.push(
        supabase
          .from('trazabilidad')
          .update({ estado: 'Pendiente', reporte_resolucion_id: null })
          .eq('reporte_resolucion_id', activeId)
          .not('id', 'in', `(${idsArray.join(',')})`) as any
      );
    } else {
      insertPromises.push(
        supabase
          .from('trazabilidad')
          .update({ estado: 'Pendiente', reporte_resolucion_id: null })
          .eq('reporte_resolucion_id', activeId) as any
      );
    }

    // Sync pendientes resolution states in Supabase
    if (resolvedPendIds.size > 0) {
      const idsArray = Array.from(resolvedPendIds);
      insertPromises.push(
        supabase
          .from('pendientes')
          .update({ estado: 'Realizado', reporte_resolucion_id: activeId })
          .in('id', idsArray) as any
      );
      insertPromises.push(
        supabase
          .from('pendientes')
          .update({ estado: 'Pendiente', reporte_resolucion_id: null })
          .eq('reporte_resolucion_id', activeId)
          .not('id', 'in', `(${idsArray.join(',')})`) as any
      );
    } else {
      insertPromises.push(
        supabase
          .from('pendientes')
          .update({ estado: 'Pendiente', reporte_resolucion_id: null })
          .eq('reporte_resolucion_id', activeId) as any
      );
    }

    const results = await Promise.all(insertPromises);
    for (const res of results) {
      if (res && res.error) {
        console.warn("Advertencia en tabla secundaria de Supabase:", res.error);
      }
    }

    return activeId;

  } catch (e: any) {
    console.warn("Falló sincronización con Supabase (quedó guardado localmente):", e);
    return localId;
  }
};

export const getHistorialReportes = async (): Promise<ReporteTurno[]> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reporte_turno')
        .select('*')
        .order('fecha', { ascending: false })
        .order('id', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Supabase error fetching history", e);
    }
  }

  // Fallback
  return getLocalData('reporte_turno');
};

export const getReportePorId = async (id: number): Promise<ReporteCompleto | null> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: cabeceras, error: errCab } = await supabase
        .from('reporte_turno')
        .select('*')
        .eq('id', id)
        .single();
      
      if (errCab) throw errCab;
      if (!cabeceras) return null;

      const supaCab = cabeceras as ReporteTurno;
      const localCabecera = getLocalData('reporte_turno').find((c: any) => c.id === id);
      const cabecera: ReporteTurno = localCabecera ? { ...supaCab, ...localCabecera } : supaCab;

      const [
        { data: productos },
        { data: observaciones },
        { data: desviaciones },
        { data: generales },
        { data: rociadoras },
        { data: trazabilidades_nuevas },
        { data: trazabilidades_resueltas },
        { data: pendientes_nuevos },
        { data: pendientes_resueltos }
      ] = await Promise.all([
        supabase.from('productos_turno').select('*').eq('reporte_id', id),
        supabase.from('producto_observacion').select('*').eq('reporte_id', id),
        supabase.from('desviaciones_sin_retencion').select('*').eq('reporte_id', id),
        supabase.from('observaciones_generales').select('*').eq('reporte_id', id),
        supabase.from('identificacion_rociadoras').select('*').eq('reporte_id', id),
        supabase.from('trazabilidad').select('*').eq('reporte_creacion_id', id),
        supabase.from('trazabilidad').select('*').eq('reporte_resolucion_id', id),
        supabase.from('pendientes').select('*').eq('reporte_creacion_id', id),
        supabase.from('pendientes').select('*').eq('reporte_resolucion_id', id)
      ]);

      const trazResueltasFull = (trazabilidades_resueltas || []) as Trazabilidad[];
      const pendResueltosFull = (pendientes_resueltos || []) as Pendiente[];

      return {
        reporte_id: id,
        cabecera,
        productos: productos || [],
        observaciones: observaciones || [],
        desviaciones: desviaciones || [],
        generales: generales || [],
        rociadoras: rociadoras || [],
        trazabilidades_nuevas: parseTrazabilidadesList(trazabilidades_nuevas || []),
        trazabilidades_resueltas: trazResueltasFull.map(r => r.id!),
        trazabilidades_resueltas_objetos: parseTrazabilidadesList(trazResueltasFull),
        pendientes_nuevos: pendientes_nuevos || [],
        pendientes_resueltos: pendResueltosFull.map(r => r.id!),
        pendientes_resueltos_objetos: pendResueltosFull
      };
    } catch (e) {
      console.error("Supabase error fetching report details", e);
    }
  }

  // Fallback
  const cabeceras: ReporteTurno[] = getLocalData('reporte_turno');
  const cabecera = cabeceras.find(c => c.id === id);
  if (!cabecera) return null;

  const productos: ProductoTurno[] = getLocalData('productos_turno').filter((p: any) => p.reporte_id === id);
  const observaciones: ProductoObservacion[] = getLocalData('producto_observacion').filter((p: any) => p.reporte_id === id);
  const desviaciones: DesviacionSinRetencion[] = getLocalData('desviaciones_sin_retencion').filter((p: any) => p.reporte_id === id);
  const generales: ObservacionGeneral[] = getLocalData('observaciones_generales').filter((p: any) => p.reporte_id === id);
  const rociadoras: IdentificacionRociadoras[] = getLocalData('identificacion_rociadoras').filter((p: any) => p.reporte_id === id);
  
  const trazabilidades_nuevas: Trazabilidad[] = getLocalData('trazabilidad').filter((p: any) => p.reporte_creacion_id === id);
  const trazResueltasFull: Trazabilidad[] = getLocalData('trazabilidad').filter((p: any) => p.reporte_resolucion_id === id);
  const trazabilidades_resueltas: number[] = trazResueltasFull.map((p: any) => p.id);

  const pendientes_nuevos: Pendiente[] = getLocalData('pendientes').filter((p: any) => p.reporte_creacion_id === id);
  const pendResueltosFull: Pendiente[] = getLocalData('pendientes').filter((p: any) => p.reporte_resolucion_id === id);
  const pendientes_resueltos: number[] = pendResueltosFull.map((p: any) => p.id);

  return {
    reporte_id: id,
    cabecera,
    productos,
    observaciones,
    desviaciones,
    generales,
    rociadoras,
    trazabilidades_nuevas: parseTrazabilidadesList(trazabilidades_nuevas),
    trazabilidades_resueltas,
    trazabilidades_resueltas_objetos: parseTrazabilidadesList(trazResueltasFull),
    pendientes_nuevos,
    pendientes_resueltos,
    pendientes_resueltos_objetos: pendResueltosFull
  };
};

export const getSqlSchema = (): string => {
  return `-- SQL de inicialización para Supabase (Copia y pega esto en la sección "SQL Editor" de tu panel Supabase)

-- ==========================================
-- SCRIPT DE MIGRACIÓN (Si ya tienes las tablas creadas, corre solo esto para no borrar tus datos)
-- ==========================================
-- ALTER TABLE productos_turno ADD COLUMN IF NOT EXISTS orden TEXT;
-- ALTER TABLE productos_turno ADD COLUMN IF NOT EXISTS paletas TEXT;
-- ALTER TABLE productos_turno ADD COLUMN IF NOT EXISTS camadas TEXT;
-- ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS tickets_inspeccionados TEXT;
-- ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS tickets_retenidos TEXT;
ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS hacia_adelante BOOLEAN DEFAULT FALSE;
ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS hacia_atras BOOLEAN DEFAULT FALSE;
ALTER TABLE pbo_paletas ALTER COLUMN nca TYPE TEXT;

-- MIGRACIÓN PARA REPROCESOS PBO
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS paletas_nuevas INTEGER DEFAULT 0;
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS fecha_registro TEXT;
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS turno_registro INTEGER;
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS check_liberado BOOLEAN DEFAULT FALSE;
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS check_liberado_parcial BOOLEAN DEFAULT FALSE;
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS cantidad_liberada TEXT;
ALTER TABLE pbo_reprocesos ADD COLUMN IF NOT EXISTS check_espera_formato BOOLEAN DEFAULT FALSE;
-- ALTER TABLE identificacion_rociadoras ADD COLUMN IF NOT EXISTS hora TEXT;
-- ALTER TABLE desviaciones_sin_retencion ADD COLUMN IF NOT EXISTS hora TEXT;
-- ALTER TABLE desviaciones_sin_retencion ADD COLUMN IF NOT EXISTS tipo TEXT;
--
-- -- SI NO TENÍAS LA TABLA DE DESVIACIONES SIN RETENCIÓN EN TU BASE DE DATOS ACTUAL, EJECUTA ESTO:
-- CREATE TABLE IF NOT EXISTS desviaciones_sin_retencion (
--     id SERIAL PRIMARY KEY,
--     reporte_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
--     hora TEXT,
--     codigo_sap TEXT,
--     descripcion TEXT,
--     lote TEXT,
--     tipo TEXT,
--     defecto TEXT,
--     nca TEXT,
--     paletas_afectadas TEXT,
--     pruebas_funcionales TEXT,
--     observaciones TEXT
-- );

-- ==========================================
-- RESETEO TOTAL (OPCIONAL)
-- Si estás experimentando errores de guardado y no te importa perder los reportes actuales, 
-- puedes borrar todas las tablas de reportes (sin borrar la información de PBO) ejecutando:
--
-- DROP TABLE IF EXISTS desviaciones_sin_retencion CASCADE;
-- DROP TABLE IF EXISTS observaciones_generales CASCADE;
-- DROP TABLE IF EXISTS identificacion_rociadoras CASCADE;
-- DROP TABLE IF EXISTS pendientes CASCADE;
-- DROP TABLE IF EXISTS trazabilidad CASCADE;
-- DROP TABLE IF EXISTS producto_observacion CASCADE;
-- DROP TABLE IF EXISTS productos_turno CASCADE;
-- DROP TABLE IF EXISTS reporte_turno CASCADE;
-- ==========================================


CREATE TABLE IF NOT EXISTS analistas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE
);

-- Insertar los analistas fijos
INSERT INTO analistas (nombre) VALUES 
('BRUNO MUÑOZ'),
('STEFFANY OSTO'),
('DARWIN MARQUEZ'),
('GABRIELA LOPEZ'),
('DIEGO SANTAMARIA'),
('JOSÉ SEGOVIA')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS reporte_turno (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    grupo TEXT NOT NULL,
    analista TEXT NOT NULL,
    turno INTEGER NOT NULL,
    temp_cumple BOOLEAN NOT NULL,
    hum_cumple BOOLEAN NOT NULL,
    pie_calidad_cumple BOOLEAN DEFAULT TRUE,
    observacion_pie_calidad TEXT,
    pie_operaciones_cumple BOOLEAN DEFAULT TRUE,
    observacion_pie_operaciones TEXT,
    caida_tension TEXT,
    observaciones_ambiente TEXT,
    estado TEXT DEFAULT 'Borrador',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos_turno (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    codigo_sap TEXT,
    descripcion TEXT,
    orden TEXT,
    lote TEXT,
    cantidad TEXT,
    paletas TEXT,
    camadas TEXT,
    obs TEXT
);

CREATE TABLE IF NOT EXISTS producto_observacion (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    codigo_sap TEXT,
    descripcion TEXT,
    orden TEXT,
    lote TEXT,
    defecto TEXT,
    ticket TEXT,
    nca TEXT,
    causa_raiz TEXT,
    acciones TEXT,
    obs TEXT
);

CREATE TABLE IF NOT EXISTS trazabilidad (
    id SERIAL PRIMARY KEY,
    reporte_creacion_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    reporte_resolucion_id INTEGER REFERENCES reporte_turno(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL,
    codigo_sap TEXT,
    descripcion TEXT,
    orden TEXT,
    lote TEXT,
    defecto TEXT,
    ticket TEXT,
    tickets_inspeccionados TEXT,
    tickets_retenidos TEXT,
    hacia_adelante BOOLEAN DEFAULT FALSE,
    hacia_atras BOOLEAN DEFAULT FALSE,
    estado TEXT DEFAULT 'Pendiente',
    obs TEXT
);

CREATE TABLE IF NOT EXISTS desviaciones_sin_retencion (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    hora TEXT,
    codigo_sap TEXT,
    descripcion TEXT,
    lote TEXT,
    tipo TEXT,
    defecto TEXT,
    nca TEXT,
    paletas_afectadas TEXT,
    pruebas_funcionales TEXT,
    observaciones TEXT
);

CREATE TABLE IF NOT EXISTS observaciones_generales (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    tipo_evento TEXT,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS pendientes (
    id SERIAL PRIMARY KEY,
    reporte_creacion_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    reporte_resolucion_id INTEGER REFERENCES reporte_turno(id) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    responsable TEXT,
    observaciones TEXT,
    estado TEXT DEFAULT 'Pendiente'
);

CREATE TABLE IF NOT EXISTS identificacion_rociadoras (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reporte_turno(id) ON DELETE CASCADE,
    linea TEXT NOT NULL,
    maquina TEXT NOT NULL,
    color TEXT,
    hora TEXT
);

CREATE TABLE IF NOT EXISTS pbo_lotes (
    id_pbo TEXT PRIMARY KEY,
    producto TEXT NOT NULL,
    formato TEXT NOT NULL,
    lote TEXT NOT NULL,
    orden TEXT NOT NULL,
    fecha_produccion TEXT NOT NULL,
    defecto_general TEXT NOT NULL,
    cantidad_total_latas INTEGER NOT NULL,
    ubicacion TEXT NOT NULL,
    estatus_general TEXT NOT NULL,
    medidas_correctivas TEXT,
    causas TEXT,
    usuario_registro TEXT NOT NULL,
    creado_el TEXT NOT NULL,
    fecha_registro TEXT,
    turno_registro INTEGER
);

CREATE TABLE IF NOT EXISTS pbo_paletas (
    id TEXT PRIMARY KEY,
    id_pbo TEXT NOT NULL REFERENCES pbo_lotes(id_pbo) ON DELETE CASCADE,
    nro_ticket TEXT NOT NULL,
    camadas_sueltas INTEGER NOT NULL,
    defecto TEXT NOT NULL,
    nca TEXT NOT NULL,
    estatus TEXT NOT NULL,
    creado_el TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pbo_reprocesos (
    id TEXT PRIMARY KEY,
    id_pbo TEXT NOT NULL REFERENCES pbo_lotes(id_pbo) ON DELETE CASCADE,
    tickets_originales_consumidos TEXT NOT NULL,
    nuevo_ticket_reprocesado TEXT NOT NULL,
    paletas_nuevas INTEGER DEFAULT 0,
    camadas_sueltas INTEGER NOT NULL,
    estatus_calidad TEXT NOT NULL,
    estatus_logistica TEXT NOT NULL,
    check_liberado BOOLEAN DEFAULT FALSE,
    check_liberado_parcial BOOLEAN DEFAULT FALSE,
    cantidad_liberada TEXT,
    check_espera_formato BOOLEAN DEFAULT FALSE,
    usuario_registro TEXT NOT NULL,
    creado_el TEXT NOT NULL,
    fecha_registro TEXT,
    turno_registro INTEGER
);

-- Desactivar Seguridad de Fila (RLS) para permitir lectura/escritura pública con la key anónima de Supabase
ALTER TABLE analistas DISABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_turno DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos_turno DISABLE ROW LEVEL SECURITY;
ALTER TABLE producto_observacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE trazabilidad DISABLE ROW LEVEL SECURITY;
ALTER TABLE desviaciones_sin_retencion DISABLE ROW LEVEL SECURITY;
ALTER TABLE observaciones_generales DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE identificacion_rociadoras DISABLE ROW LEVEL SECURITY;
ALTER TABLE pbo_lotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pbo_paletas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pbo_reprocesos DISABLE ROW LEVEL SECURITY;

-- Asegurar columnas para herencia y resolucion en bases de datos existentes
ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS reporte_resolucion_id INTEGER REFERENCES reporte_turno(id) ON DELETE SET NULL;
ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS hacia_adelante BOOLEAN DEFAULT FALSE;
ALTER TABLE trazabilidad ADD COLUMN IF NOT EXISTS hacia_atras BOOLEAN DEFAULT FALSE;
ALTER TABLE pendientes ADD COLUMN IF NOT EXISTS reporte_resolucion_id INTEGER REFERENCES reporte_turno(id) ON DELETE SET NULL;
ALTER TABLE reporte_turno ADD COLUMN IF NOT EXISTS pie_calidad_cumple BOOLEAN DEFAULT TRUE;
ALTER TABLE reporte_turno ADD COLUMN IF NOT EXISTS observacion_pie_calidad TEXT;
ALTER TABLE reporte_turno ADD COLUMN IF NOT EXISTS pie_operaciones_cumple BOOLEAN DEFAULT TRUE;
ALTER TABLE reporte_turno ADD COLUMN IF NOT EXISTS observacion_pie_operaciones TEXT;
ALTER TABLE roce_pruebas ADD COLUMN IF NOT EXISTS lote_be TEXT;
ALTER TABLE roce_pruebas ADD COLUMN IF NOT EXISTS peso_be TEXT;
ALTER TABLE roce_pruebas ADD COLUMN IF NOT EXISTS distribucion_be TEXT;
ALTER TABLE roce_pruebas ADD COLUMN IF NOT EXISTS viscosidad_be TEXT;

-- Recargar la caché del esquema de Supabase para que la API reconozca las nuevas tablas y columnas
NOTIFY pgrst, 'reload schema';
`;
};

// ==========================================
// PBO DATABASE ACTIONS
// ==========================================

export const getLotesPBO = async (): Promise<LotePBO[]> => {
  const local: LotePBO[] = getLocalData('pbo_lotes');
  const deletedIds: string[] = getLocalData('pbo_lotes_deleted') || [];

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pbo_lotes')
        .select('*')
        .order('creado_el', { ascending: false });
      if (!error && data) {
        const filtered = data.filter((item: any) => !deletedIds.includes(item.id_pbo));
        setLocalData('pbo_lotes', filtered);
        return filtered;
      }
    } catch (e) {
      console.error("Supabase PBO Lotes error", e);
    }
  }
  return local.filter((item: LotePBO) => !deletedIds.includes(item.id_pbo));
};

export const saveLotePBO = async (lote: LotePBO): Promise<void> => {
  // Always update local data
  const lotes: LotePBO[] = getLocalData('pbo_lotes');
  const index = lotes.findIndex(l => l.id_pbo === lote.id_pbo);
  if (index !== -1) {
    lotes[index] = lote;
  } else {
    lotes.push(lote);
  }
  setLocalData('pbo_lotes', lotes);

  // Clear from deleted tracking if present
  const deletedIds: string[] = getLocalData('pbo_lotes_deleted') || [];
  if (deletedIds.includes(lote.id_pbo)) {
    setLocalData('pbo_lotes_deleted', deletedIds.filter(id => id !== lote.id_pbo));
  }

  // Try Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('pbo_lotes').upsert(lote);
      if (error) console.error("Supabase Save Lote PBO error", error);
    } catch (e) {
      console.error("Supabase Save Lote PBO error", e);
    }
  }
};

export const deleteLotePBO = async (id_pbo: string): Promise<void> => {
  // Always update local data
  const lotes: LotePBO[] = getLocalData('pbo_lotes');
  setLocalData('pbo_lotes', lotes.filter(l => l.id_pbo !== id_pbo));

  const paletas: Paleta[] = getLocalData('pbo_paletas');
  setLocalData('pbo_paletas', paletas.filter(p => p.id_pbo !== id_pbo));

  const reprocesos: Reproceso[] = getLocalData('pbo_reprocesos');
  setLocalData('pbo_reprocesos', reprocesos.filter(r => r.id_pbo !== id_pbo));

  // Mark as deleted locally
  const deletedLotes: string[] = getLocalData('pbo_lotes_deleted') || [];
  if (!deletedLotes.includes(id_pbo)) {
    deletedLotes.push(id_pbo);
    setLocalData('pbo_lotes_deleted', deletedLotes);
  }

  // Try Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await Promise.all([
        supabase.from('pbo_lotes').delete().eq('id_pbo', id_pbo),
        supabase.from('pbo_paletas').delete().eq('id_pbo', id_pbo),
        supabase.from('pbo_reprocesos').delete().eq('id_pbo', id_pbo)
      ]);
    } catch (e) {
      console.error("Supabase Delete Lote PBO error", e);
    }
  }
};

export const getPaletasPBO = async (): Promise<Paleta[]> => {
  const local: Paleta[] = getLocalData('pbo_paletas');
  const deletedIds: string[] = getLocalData('pbo_paletas_deleted') || [];

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pbo_paletas').select('*');
      if (!error && data) {
        const filtered = data.filter((item: any) => !deletedIds.includes(item.id));
        setLocalData('pbo_paletas', filtered);
        return filtered;
      }
    } catch (e) {
      console.error("Supabase PBO Paletas error", e);
    }
  }
  return local.filter((item: Paleta) => !deletedIds.includes(item.id));
};

export const savePaletasPBO = async (paletasToSave: Paleta[]): Promise<void> => {
  // Always update local data
  const paletas: Paleta[] = getLocalData('pbo_paletas');
  paletasToSave.forEach(pToSave => {
    const idx = paletas.findIndex(p => p.id === pToSave.id);
    if (idx !== -1) {
      paletas[idx] = pToSave;
    } else {
      paletas.push(pToSave);
    }
  });
  setLocalData('pbo_paletas', paletas);

  // Clear saved IDs from deleted tracking
  const deletedIds: string[] = getLocalData('pbo_paletas_deleted') || [];
  const savedIds = paletasToSave.map(p => p.id);
  const remainingDeleted = deletedIds.filter(id => !savedIds.includes(id));
  setLocalData('pbo_paletas_deleted', remainingDeleted);

  // Try Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('pbo_paletas').upsert(paletasToSave);
      if (error) console.error("Supabase Save Paletas PBO error", error);
    } catch (e) {
      console.error("Supabase Save Paletas PBO error", e);
    }
  }
};


export const getReprocesosPBO = async (): Promise<Reproceso[]> => {
  const local: Reproceso[] = getLocalData('pbo_reprocesos');
  const deletedIds: string[] = getLocalData('pbo_reprocesos_deleted') || [];

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pbo_reprocesos').select('*');
      if (!error && data) {
        const filtered = data.filter((item: any) => !deletedIds.includes(item.id));
        setLocalData('pbo_reprocesos', filtered);
        return filtered;
      }
    } catch (e) {
      console.error("Supabase PBO Reproceso error", e);
    }
  }
  return local.filter((item: Reproceso) => !deletedIds.includes(item.id));
};

export const saveReprocesoPBO = async (reproceso: Reproceso): Promise<void> => {
  // Always update local data first
  const reprocesos: Reproceso[] = getLocalData('pbo_reprocesos');
  const index = reprocesos.findIndex(r => r.id === reproceso.id);
  if (index !== -1) {
    reprocesos[index] = reproceso;
  } else {
    reprocesos.unshift(reproceso);
  }
  setLocalData('pbo_reprocesos', reprocesos);

  // Clear saved ID from deleted tracking
  const deletedIds: string[] = getLocalData('pbo_reprocesos_deleted') || [];
  if (deletedIds.includes(reproceso.id)) {
    setLocalData('pbo_reprocesos_deleted', deletedIds.filter(id => id !== reproceso.id));
  }

  // Try Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(reproceso).filter(([_, v]) => v !== undefined)
      );
      const { error } = await supabase.from('pbo_reprocesos').upsert(cleanData);
      if (error) {
        console.warn("Supabase Save Reproceso PBO error:", error.message || error);
        // Fallback in case Supabase schema is missing check_* or optional columns
        const coreData = {
          id: reproceso.id,
          id_pbo: reproceso.id_pbo,
          tickets_originales_consumidos: reproceso.tickets_originales_consumidos,
          nuevo_ticket_reprocesado: reproceso.nuevo_ticket_reprocesado,
          camadas_sueltas: reproceso.camadas_sueltas,
          paletas_nuevas: reproceso.paletas_nuevas ?? 0,
          estatus_calidad: reproceso.estatus_calidad,
          estatus_logistica: reproceso.estatus_logistica,
          usuario_registro: reproceso.usuario_registro,
          creado_el: reproceso.creado_el,
          fecha_registro: reproceso.fecha_registro,
          turno_registro: reproceso.turno_registro,
          calidad: reproceso.calidad || 'Cumple',
          observaciones: reproceso.observaciones || '',
        };
        const { error: fallbackError } = await supabase.from('pbo_reprocesos').upsert(coreData);
        if (fallbackError) {
          console.error("Supabase Fallback Save Reproceso error:", fallbackError.message || fallbackError);
        }
      }
    } catch (e) {
      console.error("Supabase Save Reproceso PBO catch error", e);
    }
  }
};

export const deleteReprocesoPBO = async (id: string): Promise<void> => {
  // Always update local data
  let reprocesos: Reproceso[] = getLocalData('pbo_reprocesos');
  reprocesos = reprocesos.filter((r: Reproceso) => r.id !== id);
  setLocalData('pbo_reprocesos', reprocesos);

  // Track deleted ID locally so getReprocesosPBO will never bring it back if Supabase delete fails or RLS blocks it
  const deletedIds: string[] = getLocalData('pbo_reprocesos_deleted') || [];
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    setLocalData('pbo_reprocesos_deleted', deletedIds);
  }

  // Try Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('pbo_reprocesos').delete().eq('id', id);
      if (error) {
        console.error("Supabase Delete Reproceso PBO error:", error.message || error);
      }
    } catch (e) {
      console.error("Supabase Delete Reproceso PBO error", e);
    }
  }
};

export const deletePaletaPBO = async (id: string): Promise<void> => {
  // Always update local data
  let paletas: Paleta[] = getLocalData('pbo_paletas');
  paletas = paletas.filter((p: Paleta) => p.id !== id);
  setLocalData('pbo_paletas', paletas);

  // Track deleted ID locally
  const deletedIds: string[] = getLocalData('pbo_paletas_deleted') || [];
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    setLocalData('pbo_paletas_deleted', deletedIds);
  }

  // Try Supabase sync
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('pbo_paletas').delete().eq('id', id);
      if (error) console.error("Supabase Delete Paleta PBO error", error);
    } catch (e) {
      console.error("Supabase Delete Paleta PBO error", e);
    }
  }
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
