import ExcelJS from 'exceljs';
import { LotePBO, Paleta, Reproceso } from '../types';
import { CATALOGO_PRODUCTOS_PBO } from '../components/TabPBO';

export interface FO062FormData {
  fecha: string;
  correspondencia: string;
  proceso: string;
  avisoCalidad: string;
  loteInspeccion: string;
  material: string;
  codigoSap: string;
  codigoProveedor: string;
  lote: string;
  numeroPaleta: string;
  ordenFabricacion: string;
  cantidadRetenida: string;
  cantidadNoConforme: string;
  defecto: string;
  causas: string;
  observacion: string;
  elaboradoPor: string;
  revisadoPor: string;
}

export const getCansPerPalletHelper = (formato: string) => {
  const f = (formato || '').toLowerCase();
  if (f.includes('8.4') || f.includes('8.0') || f.includes('8')) return 9912;
  if (f.includes('10')) return 8024;
  return 7552; // 12 oz, etc.
};

export const getCansPerCamadaHelper = () => 472;

export const formatDateToDDMMYYYY = (dateStr?: string) => {
  if (!dateStr) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // Check if already in DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  // If in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const yr = d.getFullYear();
      return `${day}/${mon}/${yr}`;
    }
  } catch (e) {
    console.warn('Error formatting date:', e);
  }

  return dateStr;
};

export const buildDefaultFO062Data = (
  lote: LotePBO,
  paletas: Paleta[],
  _reprocesos: Reproceso[] = [],
  analistaActual: string = ''
): FO062FormData => {
  const lotePaletas = paletas.filter(p => p.id_pbo === lote.id_pbo);
  
  // Calculate total cans (Volumen total latas)
  const totalCans = lotePaletas.reduce((sum, p) => {
    return sum + (p.camadas_sueltas > 0 
      ? (p.camadas_sueltas * getCansPerCamadaHelper()) 
      : getCansPerPalletHelper(lote.formato));
  }, 0);

  const finalCans = totalCans > 0 ? totalCans : (lote.cantidad_total_latas || 0);

  // Tickets list
  const ticketsList = lotePaletas.map(p => p.nro_ticket).filter(Boolean).join(', ');

  // SAP Code lookup
  const foundCatalog = CATALOGO_PRODUCTOS_PBO.find(
    c => c.nombre.trim().toLowerCase() === (lote.producto || '').trim().toLowerCase() ||
         (lote.producto && lote.producto.toLowerCase().includes(c.nombre.toLowerCase()))
  );
  const sapCode = foundCatalog ? foundCatalog.codigo : 'Y00012';

  // Default hardcoded observation text per specification
  const defaultObservacion = 
`1.- Este material será identificado con tarjeta roja
2.- Se envía informe de rechazo a los involucrados.
3.- Se envía informe de Producto No Conforme
4.- El material se pasará a Bloqueado en SAP para briquetear`;

  return {
    fecha: formatDateToDDMMYYYY(lote.fecha_registro || lote.fecha_produccion || lote.creado_el),
    correspondencia: lote.id_pbo,
    proceso: 'Producto Terminado',
    avisoCalidad: lote.aviso_calidad || '',
    loteInspeccion: lote.lote_inspeccion || '',
    material: lote.producto,
    codigoSap: sapCode,
    codigoProveedor: 'N/A',
    lote: lote.lote || 'N/A',
    numeroPaleta: ticketsList || (lotePaletas.length > 0 ? `${lotePaletas.length} Paletas` : 'N/A'),
    ordenFabricacion: lote.orden || 'N/A',
    cantidadRetenida: `${finalCans.toLocaleString('es-ES')} Latas`,
    cantidadNoConforme: `${finalCans.toLocaleString('es-ES')} Latas`,
    defecto: lote.defecto_general || 'N/A',
    causas: lote.causas || '',
    observacion: defaultObservacion,
    elaboradoPor: lote.usuario_registro || analistaActual || 'Dayana Royer / Fray Vivas',
    revisadoPor: 'Dayana Royer & Fray Vivas'
  };
};

export const exportPBOToOfficialExcel = async (
  formData: FO062FormData,
  idPbo: string = 'PBO'
): Promise<void> => {
  const wb = new ExcelJS.Workbook();

  try {
    // Attempt to load from public template
    const response = await fetch('/FO062-CM21-CAL - PRODUCTO NO CONFORME.xlsx');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} loading template`);
    }
    const arrayBuffer = await response.arrayBuffer();
    await wb.xlsx.load(arrayBuffer);
  } catch (err) {
    console.warn('Could not load template from fetch, generating programmatic sheet fallback:', err);
    // Fallback programmatic generation if template fetch fails
    const wsFallback = wb.addWorksheet('FORMATO');
    
    // Header
    wsFallback.mergeCells('C2:E4');
    wsFallback.getCell('C2').value = 'INFORME DE PRODUCTO NO CONFORME';
    wsFallback.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' };
    wsFallback.getCell('C2').font = { bold: true, size: 14 };

    wsFallback.getCell('F2').value = 'FO062-CM21- CAL\nVersion: 2\nFecha actualizada: 12/06/2026';
    wsFallback.getCell('F3').value = 'Fecha';

    wsFallback.mergeCells('B5:F5');
    wsFallback.getCell('B5').value = 'NOTIFICACIÓN DE PRODUCTO NO CONFORME';
    wsFallback.getCell('B5').alignment = { horizontal: 'center', vertical: 'middle' };
    wsFallback.getCell('B5').font = { bold: true, size: 11 };

    const labels = [
      ['B6', 'Correspondencia:'],
      ['B7', 'Proceso:'],
      ['B8', 'Aviso de calidad:'],
      ['B9', 'Lote de inspección:'],
      ['B10', 'Material :'],
      ['B11', 'Código SAP :'],
      ['B12', 'Código Proveedor:'],
      ['B13', 'Lote:'],
      ['B14', 'Numero de Paleta:'],
      ['B15', 'Orden Fabricación :'],
      ['B16', 'Cantidad Retenida:'],
      ['B17', 'Cantidad No Conforme:'],
      ['B18', 'Defecto:'],
      ['B19', 'Causa(s):'],
      ['B20', 'Observación:']
    ];

    labels.forEach(([cellAddr, label]) => {
      wsFallback.getCell(cellAddr).value = label;
      wsFallback.getCell(cellAddr).font = { bold: true, size: 11 };
      const rowNum = cellAddr.replace('B', '');
      wsFallback.mergeCells(`C${rowNum}:F${rowNum}`);
    });
  }

  const ws = wb.getWorksheet('FORMATO') || wb.worksheets[0];

  // Fill in the data
  ws.getCell('F4').value = formData.fecha;
  ws.getCell('C6').value = formData.correspondencia;
  ws.getCell('C7').value = formData.proceso;
  ws.getCell('C8').value = formData.avisoCalidad;
  ws.getCell('C9').value = formData.loteInspeccion;
  ws.getCell('C10').value = formData.material;
  ws.getCell('C11').value = formData.codigoSap;
  ws.getCell('C12').value = formData.codigoProveedor;
  ws.getCell('C13').value = formData.lote;
  ws.getCell('C14').value = formData.numeroPaleta;
  ws.getCell('C15').value = formData.ordenFabricacion;
  ws.getCell('C16').value = formData.cantidadRetenida;
  ws.getCell('C17').value = formData.cantidadNoConforme;
  ws.getCell('C18').value = formData.defecto;
  ws.getCell('C19').value = formData.causas;
  ws.getCell('C20').value = formData.observacion;

  // Elaborado por / Revisado por in row 21
  ws.getCell('B21').value = `Elaborado por:\n${formData.elaboradoPor}`;
  ws.getCell('D21').value = `Revisado por:\n${formData.revisadoPor}`;

  // Write buffer and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const cleanId = idPbo.replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.download = `FO062-CM21-CAL - PRODUCTO NO CONFORME - ${cleanId}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};
