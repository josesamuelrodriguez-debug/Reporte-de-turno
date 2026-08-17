export interface Analista {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface ReporteTurno {
  id?: number;
  fecha: string;
  grupo: string;
  analista: string;
  turno: number;
  temp_cumple: boolean;
  hum_cumple: boolean;
  pie_calidad_cumple?: boolean;
  observacion_pie_calidad?: string;
  pie_operaciones_cumple?: boolean;
  observacion_pie_operaciones?: string;
  caida_tension: string;
  observaciones_ambiente: string;
  equipos_medicion?: string;
  start_quality_cumple?: boolean;
  observacion_start_quality?: string;
  estado: 'Borrador' | 'Terminado';
  created_at?: string;
}

export interface ProductoTurno {
  id?: number;
  reporte_id?: number;
  codigo_sap: string;
  descripcion: string;
  orden?: string;
  lote: string;
  cantidad?: string;
  paletas?: string;
  camadas?: string;
  obs: string;
}

export interface ProductoObservacion {
  id?: number;
  reporte_id?: number;
  codigo_sap: string;
  descripcion: string;
  orden: string;
  lote: string;
  defecto: string;
  ticket: string;
  nca: string;
  causa_raiz: string;
  acciones: string;
  obs: string;
}

export interface Trazabilidad {
  id?: number;
  reporte_creacion_id?: number;
  reporte_resolucion_id?: number | null;
  tipo: string;
  codigo_sap: string;
  descripcion: string;
  orden: string;
  lote: string;
  defecto: string;
  ticket: string;
  estado: 'Pendiente' | 'Finalizada';
  obs: string;
  hacia_adelante?: boolean;
  hacia_atras?: boolean;
  tickets_inspeccionados?: string;
  tickets_retenidos?: string;
}

export interface DesviacionSinRetencion {
  id?: number;
  reporte_id?: number;
  hora: string;
  codigo_sap: string;
  descripcion: string;
  lote: string;
  tipo: string;
  defecto: string;
  nca: string;
  paletas_afectadas: string;
  pruebas_funcionales: string;
  observaciones: string;
}

export interface ObservacionGeneral {
  id?: number;
  reporte_id?: number;
  tipo_evento: string;
  descripcion: string;
}

export interface Pendiente {
  id?: number;
  reporte_creacion_id?: number;
  reporte_resolucion_id?: number | null;
  descripcion: string;
  responsable: string;
  observaciones: string;
  estado: 'Pendiente' | 'Realizado';
}

export interface IdentificacionRociadoras {
  id?: number;
  reporte_id?: number;
  linea: string;
  maquina: string;
  color: string;
  hora?: string;
}

export interface ReporteCompleto {
  reporte_id?: number;
  cabecera: ReporteTurno;
  productos: ProductoTurno[];
  observaciones: ProductoObservacion[];
  desviaciones: DesviacionSinRetencion[];
  generales: ObservacionGeneral[];
  rociadoras: IdentificacionRociadoras[];
  trazabilidades_nuevas: Trazabilidad[];
  trazabilidades_resueltas: number[]; // ids of resolved active trazabilidades
  trazabilidades_resueltas_objetos?: Trazabilidad[]; // full objects of traceabilities resolved in this report
  trazabilidades_activas_modificadas?: Trazabilidad[]; // modified inherited
  pendientes_nuevos: Pendiente[];
  pendientes_resueltos: number[]; // ids of resolved active pendientes
  pendientes_resueltos_objetos?: Pendiente[]; // full objects of pendientes resolved in this report
}

export interface LotePBO {
  id_pbo: string;                  // Folio único (Ej: PBO-001)
  producto: string;                // Nombre completo del producto
  formato: string;                 // Formato de presentación para cálculo de latas
  lote: string;                    // Código alfanumérico de lote
  orden: string;                   // Orden de producción
  fecha_produccion: string;        // Fecha de fabricación
  defecto_general: string;         // Defecto inicial reportado
  cantidad_total_latas: number;    // Cálculo matemático: (Paletas * latasPorPaleta) + (Camadas * 472)
  ubicacion: string;               // Almacen actual ("Almacen de PBO", "Transicion", "Almacen de PT")
  estatus_general: 'Abierto' | 'Cerrado';
  aviso_calidad?: string;          // Aviso de Calidad (opcional)
  lote_inspeccion?: string;        // Lote de Inspección (opcional)
  medidas_correctivas?: string;
  causas?: string;
  usuario_registro: string;
  creado_el: string;
  fecha_registro?: string;         // Para filtrado por fecha/turno en PBO
  turno_registro?: number;         // Para filtrado por fecha/turno en PBO
}

export interface Paleta {
  id: string;                      // ID único
  id_pbo: string;                  // Llave foránea hacia LotePBO
  nro_ticket: string;              // Número físico del ticket de retención
  camadas_sueltas: number;
  paletas_nuevas?: number;         // Camadas sueltas (si no es paleta completa, 0 indica paleta estándar)
  defecto: string;                 // Defecto específico de esta paleta
  nca: string;                     // Nivel de Calidad Aceptable (NCA) asignado
  estatus: 'Sin reprocesar' | 'En proceso' | 'Reprocesado' | 'Liberado Directo' | 'Desecho';
  creado_el: string;
}

export interface Reproceso {
  id: string;
  id_pbo: string;
  tickets_originales_consumidos: string; // Tickets que entraron al reproceso
  nuevo_ticket_reprocesado: string;      // Nuevo ticket generado físico
  camadas_sueltas: number;
  paletas_nuevas?: number;               // 0 si es paleta completa
  estatus_calidad: 'Chequeado por Calidad' | 'En Control de Calidad' | 'Aprobado' | 'Rechazado';
  estatus_logistica: 'En espera' | 'Confirmado' | 'Inconsistencia';
  check_liberado?: boolean;
  check_liberado_parcial?: boolean;
  cantidad_liberada?: string;            // Cantidad liberada cuando es parcialmente liberado (Ej: 2 paletas, 1000 latas)
  check_espera_formato?: boolean;
  usuario_registro: string;
  creado_el: string;
  fecha_registro?: string;
  turno_registro?: number;
  fecha_liberacion?: string;
  turno_liberacion?: number;
  calidad?: 'Cumple' | 'No Cumple';
  observaciones?: string;
}

export interface RocePrueba {
  id: string;
  fecha: string;
  turno: number;
  codigo_sap: string;
  producto: string;
  lote: string;
  lote_be?: string;
  peso_be?: string;
  distribucion_be?: string;
  viscosidad_be?: string;
  resultados: Record<number, string>; // { 1: 'Sin roce', 2: 'Leve', ..., 12: 'Moderado' }
  usuario: string;
  creado_el: string;
}
