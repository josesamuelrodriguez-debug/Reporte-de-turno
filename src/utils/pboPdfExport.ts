import { jsPDF } from 'jspdf';
import { FO062FormData } from './pboExcelExport';
import { FO062_LOGO_BASE64 } from './logoBase64';

/**
 * Generates an official, highly polished PDF report for
 * FO062-CM21-CAL (INFORME DE PRODUCTO NO CONFORME), matching the Excel structure
 * with dynamic row heights, light red cell shading, bold labels only on the left column,
 * and highlighted bold 'Cantidad No Conforme'.
 */
export const exportPBOToOfficialPDF = async (
  formData: FO062FormData,
  idPbo: string = 'PBO'
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 215.9 mm
  const margin = 12;
  const tableWidth = 191.9; // Available width (pageWidth - 2 * margin)
  
  let currentY = 12;

  // Soft Red & Corporate Quality Palette
  const borderColor = [185, 195, 205] as const; // Crisp border
  const labelBgColor = [254, 242, 242] as const; // Soft Light Red (Tailwind Red 50: #FEF2F2)
  const bannerBgColor = [185, 28, 28] as const; // Deep Quality Crimson Red (Tailwind Red 700)
  const textColorDark = [20, 25, 35] as const; // Slate 900
  const textColorLabel = [127, 29, 29] as const; // Dark Red Label (Tailwind Red 900)
  const redAccent = [185, 28, 28] as const; // Red 700

  // ==========================================
  // 1. HEADER (Rows 2-4 in Excel)
  // B2:B4 (Logo) | C2:E4 (Title) | F2:F4 (Code/Date)
  // ==========================================
  const headerHeight = 22;
  const colBWidth = 48; // Logo column width
  const colFWidth = 38; // Code & date column width
  const colCEWidth = tableWidth - colBWidth - colFWidth; // 105.9 mm for Title

  // Outer border of header
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, tableWidth, headerHeight, 'S');

  // Vertical dividers
  doc.line(margin + colBWidth, currentY, margin + colBWidth, currentY + headerHeight);
  doc.line(margin + colBWidth + colCEWidth, currentY, margin + colBWidth + colCEWidth, currentY + headerHeight);

  // Logo in Cell B2:B4 (Original Empresas Polar logo preserved)
  try {
    const logoX = margin + 3;
    const logoY = currentY + 2;
    const logoW = colBWidth - 6;
    const logoH = headerHeight - 4;
    doc.addImage(FO062_LOGO_BASE64, 'JPEG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  } catch (err) {
    console.warn('Could not add base64 logo to PDF, drawing text fallback:', err);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 50, 120);
    doc.text('METALGRÁFICA', margin + colBWidth / 2, currentY + 9, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text('EMPRESAS POLAR', margin + colBWidth / 2, currentY + 14.5, { align: 'center' });
  }

  // Title in Cell C2:E4 (centered without secondary text)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text('INFORME DE PRODUCTO NO CONFORME', margin + colBWidth + (colCEWidth / 2), currentY + (headerHeight / 2) + 2, { align: 'center' });

  // Right Column F (F2, F3, F4)
  const colFX = margin + colBWidth + colCEWidth;
  const f2Height = 10;
  const f3Height = 5.5;
  const f4Height = 6.5;

  // Horizontal lines in Col F
  doc.line(colFX, currentY + f2Height, margin + tableWidth, currentY + f2Height);
  doc.line(colFX, currentY + f2Height + f3Height, margin + tableWidth, currentY + f2Height + f3Height);

  // F2 Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text('FO062-CM21-CAL', colFX + 2.5, currentY + 3.6);
  doc.setFont('helvetica', 'normal');
  doc.text('Versión: 2', colFX + 2.5, currentY + 6.6);
  doc.text('Fecha actualiz.: 12/06/2026', colFX + 2.5, currentY + 9.3);

  // F3 Text (Label "Fecha" with soft red background)
  doc.setFillColor(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
  doc.rect(colFX + 0.2, currentY + f2Height + 0.2, colFWidth - 0.4, f3Height - 0.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textColorLabel[0], textColorLabel[1], textColorLabel[2]);
  doc.text('Fecha', colFX + (colFWidth / 2), currentY + f2Height + 3.8, { align: 'center' });

  // F4 Text (Date value)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text(formData.fecha || '', colFX + (colFWidth / 2), currentY + f2Height + f3Height + 4.4, { align: 'center' });

  currentY += headerHeight;

  // ==========================================
  // 2. BANNER (Row 5 in Excel: B5:F5) - RED BANNER
  // ==========================================
  const bannerHeight = 7;
  doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
  doc.rect(margin, currentY, tableWidth, bannerHeight, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NOTIFICACIÓN DE PRODUCTO NO CONFORME', margin + (tableWidth / 2), currentY + 4.8, { align: 'center' });

  currentY += bannerHeight;

  // ==========================================
  // 3. MAIN TABLE WITH DYNAMIC ROW HEIGHTS
  // Left: Label (Col B, 48 mm) - ALWAYS BOLD with light red shading
  // Right: Value (Cols C-F merged, 143.9 mm) - REGULAR font (except Cantidad No Conforme)
  // ==========================================
  const labelColWidth = colBWidth; // 48 mm
  const valueColWidth = tableWidth - labelColWidth; // 143.9 mm
  const minRowHeight = 6.2;
  const lineHeight = 3.8;
  const paddingY = 2.2;

  /**
   * Helper that calculates the exact height required by the content
   * and draws an adaptive cell with no superfluous blank space.
   */
  const drawAdaptiveTableRow = (
    label: string,
    value: string,
    options: {
      valueIsBold?: boolean;
      forceMultiline?: boolean;
      customColor?: readonly [number, number, number] | [number, number, number];
    } = {}
  ) => {
    const { valueIsBold = false, forceMultiline = false, customColor } = options;
    const cleanValue = value ? String(value).trim() : 'N/A';

    // Measure text lines in regular (or bold if requested)
    doc.setFont('helvetica', valueIsBold ? 'bold' : 'normal');
    doc.setFontSize(8.5);

    const availableTextWidth = valueColWidth - 5;
    const splitLines = doc.splitTextToSize(cleanValue, availableTextWidth);
    const lineCount = Math.max(1, splitLines.length);

    // Dynamic height calculation based on lines of text
    let calculatedHeight = minRowHeight;
    if (lineCount > 1 || forceMultiline) {
      calculatedHeight = Math.max(minRowHeight, (paddingY * 2) + (lineCount * lineHeight));
    }

    // Background fill for label column (Soft light red)
    doc.setFillColor(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
    doc.rect(margin, currentY, labelColWidth, calculatedHeight, 'FD');

    // Background fill for value column (Pure white)
    doc.setFillColor(255, 255, 255);
    doc.rect(margin + labelColWidth, currentY, valueColWidth, calculatedHeight, 'FD');

    // Cell borders
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(margin, currentY, labelColWidth, calculatedHeight, 'S');
    doc.rect(margin + labelColWidth, currentY, valueColWidth, calculatedHeight, 'S');

    // Draw Left Label Text (ALWAYS BOLD)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textColorLabel[0], textColorLabel[1], textColorLabel[2]);
    
    if (lineCount > 1 || forceMultiline) {
      doc.text(label, margin + 2.5, currentY + paddingY + 2.6);
    } else {
      doc.text(label, margin + 2.5, currentY + (calculatedHeight / 2) + 1.1);
    }

    // Draw Right Value Text (REGULAR, except Cantidad No Conforme)
    doc.setFont('helvetica', valueIsBold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    if (customColor) {
      doc.setTextColor(customColor[0], customColor[1], customColor[2]);
    } else {
      doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
    }

    if (lineCount > 1 || forceMultiline) {
      doc.text(splitLines, margin + labelColWidth + 2.5, currentY + paddingY + 2.6);
    } else {
      doc.text(cleanValue, margin + labelColWidth + 2.5, currentY + (calculatedHeight / 2) + 1.1);
    }

    currentY += calculatedHeight;
  };

  // Row 6: Correspondencia
  drawAdaptiveTableRow('Correspondencia:', formData.correspondencia, { valueIsBold: false });
  // Row 7: Proceso
  drawAdaptiveTableRow('Proceso:', formData.proceso, { valueIsBold: false });
  // Row 8: Aviso de calidad
  drawAdaptiveTableRow('Aviso de calidad:', formData.avisoCalidad, { valueIsBold: false });
  // Row 9: Lote de inspección
  drawAdaptiveTableRow('Lote de inspección:', formData.loteInspeccion, { valueIsBold: false });
  // Row 10: Material
  drawAdaptiveTableRow('Material :', formData.material, { valueIsBold: false });
  // Row 11: Código SAP
  drawAdaptiveTableRow('Código SAP :', formData.codigoSap, { valueIsBold: false });
  // Row 12: Código Proveedor
  drawAdaptiveTableRow('Código Proveedor:', formData.codigoProveedor, { valueIsBold: false });
  // Row 13: Lote
  drawAdaptiveTableRow('Lote:', formData.lote, { valueIsBold: false });
  // Row 14: Numero de Paleta
  drawAdaptiveTableRow('Numero de Paleta:', formData.numeroPaleta, { valueIsBold: false });
  // Row 15: Orden Fabricación
  drawAdaptiveTableRow('Orden Fabricación :', formData.ordenFabricacion, { valueIsBold: false });
  // Row 16: Cantidad Retenida
  drawAdaptiveTableRow('Cantidad Retenida:', formData.cantidadRetenida, { valueIsBold: false });
  
  // Row 17: Cantidad No Conforme (THE ONLY RIGHT COLUMN VALUE IN BOLD + RED)
  drawAdaptiveTableRow('Cantidad No Conforme:', formData.cantidadNoConforme, { valueIsBold: true, customColor: redAccent });

  // Row 18: Defecto (Dynamic adaptation, regular font)
  drawAdaptiveTableRow('Defecto:', formData.defecto, { valueIsBold: false, forceMultiline: true });

  // Row 19: Causa(s) (Dynamic adaptation, regular font)
  drawAdaptiveTableRow('Causa(s):', formData.causas, { valueIsBold: false, forceMultiline: true });

  // Row 20: Observación (Dynamic adaptation, regular font)
  drawAdaptiveTableRow('Observación:', formData.observacion, { valueIsBold: false, forceMultiline: true });

  // ==========================================
  // 4. SIGNATURES & PAGE (Rows 21-23 in Excel) - ADAPTIVE
  // B21:C23 (Elaborado por) | D21:E23 (Revisado por) | F21:F23 (Pag.1/1)
  // ==========================================
  const sigCol1Width = (tableWidth - colFWidth) / 2; // (191.9 - 38)/2 = 76.95 mm
  const sigCol2Width = sigCol1Width;                 // 76.95 mm
  const sigCol3Width = colFWidth;                    // 38 mm

  const sigCol1X = margin;
  const sigCol2X = margin + sigCol1Width;
  const sigCol3X = margin + sigCol1Width + sigCol2Width;

  // Measure signatures text height
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const elabLines = doc.splitTextToSize(formData.elaboradoPor || 'Inspector de Calidad', sigCol1Width - 5);
  const revLines = doc.splitTextToSize(formData.revisadoPor || 'Dayana Royer & Fray Vivas', sigCol2Width - 5);
  
  const maxSigLines = Math.max(elabLines.length, revLines.length, 1);
  const sigHeight = Math.max(16, 8 + (maxSigLines * 4.5) + 3);

  // Background fills for signature cards
  doc.setFillColor(255, 255, 255);
  doc.rect(sigCol1X, currentY, sigCol1Width, sigHeight, 'FD');
  doc.rect(sigCol2X, currentY, sigCol2Width, sigHeight, 'FD');
  doc.rect(sigCol3X, currentY, sigCol3Width, sigHeight, 'FD');

  // Outer borders
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.rect(sigCol1X, currentY, sigCol1Width, sigHeight, 'S');
  doc.rect(sigCol2X, currentY, sigCol2Width, sigHeight, 'S');
  doc.rect(sigCol3X, currentY, sigCol3Width, sigHeight, 'S');

  // Top header tab for Elaborado por (Soft light red)
  doc.setFillColor(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
  doc.rect(sigCol1X + 0.2, currentY + 0.2, sigCol1Width - 0.4, 5.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textColorLabel[0], textColorLabel[1], textColorLabel[2]);
  doc.text('Elaborado por:', sigCol1X + 2.5, currentY + 3.8);

  // Elaborado por Content (Regular font)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text(elabLines, sigCol1X + 2.5, currentY + 9.5);

  // Top header tab for Revisado por (Soft light red)
  doc.setFillColor(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
  doc.rect(sigCol2X + 0.2, currentY + 0.2, sigCol2Width - 0.4, 5.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textColorLabel[0], textColorLabel[1], textColorLabel[2]);
  doc.text('Revisado por:', sigCol2X + 2.5, currentY + 3.8);

  // Revisado por Content (Regular font)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textColorDark[0], textColorDark[1], textColorDark[2]);
  doc.text(revLines, sigCol2X + 2.5, currentY + 9.5);

  // Pag.1/1 (F21:F23) with soft light red background
  doc.setFillColor(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
  doc.rect(sigCol3X + 0.2, currentY + 0.2, sigCol3Width - 0.4, sigHeight - 0.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textColorLabel[0], textColorLabel[1], textColorLabel[2]);
  doc.text('Pág. 1/1', sigCol3X + (sigCol3Width / 2), currentY + (sigHeight / 2) + 1.2, { align: 'center' });

  // ==========================================
  // SAVE PDF
  // ==========================================
  const cleanId = idPbo.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `FO062-CM21-CAL - PRODUCTO NO CONFORME - ${cleanId}.pdf`;
  doc.save(filename);
};
