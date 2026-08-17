// TabPBO.tsx - Module for "Producto Bajo Observación" (PBO)
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  FileCheck, 
  Search, 
  ArrowRightLeft, 
  Layers, 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  ShieldAlert, 
  TrendingUp, 
  ClipboardList, 
  Barcode, 
  Database,
  Lock,
  Unlock,
  Eye,
  Info,
  Calendar,
  Layers3,
  RefreshCw,
  Printer,
  ChevronRight,
  Sparkles,
  FileText,
  Download,
  X,
  Copy,
  FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { LotePBO, Paleta, Reproceso } from '../types';
import { getLotesPBO, saveLotePBO, deleteLotePBO, getPaletasPBO, savePaletasPBO, getReprocesosPBO, saveReprocesoPBO, deleteReprocesoPBO, deletePaletaPBO } from '../db';
import { FO062ExportModal } from './FO062ExportModal';

export interface CatalogoProductoPBO {
  codigo: string;
  nombre: string;
  formato: string;
}

export const CATALOGO_PRODUCTOS_PBO: CatalogoProductoPBO[] = [
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ", codigo: "Y00001" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ PLIBRE", codigo: "Y00002" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ ZFRANCA", codigo: "Y00003" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT 250ML/8.4OZ", codigo: "Y00004" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT 250ML/8.4OZ PLIBRE", codigo: "Y00005" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT 250ML/8.4OZ ZFRANCA", codigo: "Y00006" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ", codigo: "Y00007" },
  { formato: "10 onza", nombre: "CUERPO LATA MALTIN 10OZ EXP V2", codigo: "Y00008" },
  { formato: "10 onza", nombre: "CUERPO LATA MALTIN 295ML/10OZ T-202", codigo: "Y00009" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN  250ML/8.4OZ", codigo: "Y00010" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PILSEN SLEEK 12OZ", codigo: "Y00011" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN  355ML/12OZ PLIBRE", codigo: "Y00012" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 8.45OZ EXP", codigo: "Y00013" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 250ML/8.4OZ EXP COL", codigo: "Y00014" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 250ML/8.4OZ PLIBRE", codigo: "Y00015" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 250ML/8.4OZ ZF PP", codigo: "Y00016" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA  250ML/8.4OZ", codigo: "Y00017" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA  250ML/8.4OZ PLIBRE", codigo: "Y00018" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA 250ML/8.4OZ ZFRANCA", codigo: "Y00019" },
  { formato: "12 onza", nombre: "CUERPO LATA PEPSI LIGHT 355 ML 12 OZ", codigo: "Y00047" },
  { formato: "12 onza", nombre: "CUERPO LATA 7UP LIGHT 355 ML 12 OZ", codigo: "Y00048" },
  { formato: "12 onza", nombre: "CUERPO LATA PEPSI 355 ML 12 OZ", codigo: "Y00049" },
  { formato: "12 onza", nombre: "CUERPO LATA SODA EVERVESS 355 ML 12 OZ", codigo: "Y00050" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN KOLA 355 ML 12 OZ", codigo: "Y00052" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN NARANJA 355 ML 12 OZ", codigo: "Y00053" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN UVA 355 ML 12 OZ", codigo: "Y00054" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN MANZANA 355 ML 12 OZ", codigo: "Y00055" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN PIÑA 355 ML 12 OZ", codigo: "Y00056" },
  { formato: "12 onza", nombre: "CUERPO LATA DURAZNO YUKERY 335 ML 12 OZ", codigo: "Y00058" },
  { formato: "12 onza", nombre: "CUERPO LATA MANZANA YUKERY 335 ML 12 OZ", codigo: "Y00059" },
  { formato: "12 onza", nombre: "CUERPO LATA PERA YUKERY 335 ML 12 OZ", codigo: "Y00060" },
  { formato: "12 onza", nombre: "CUERPO LATA AGUAKINA  355 ML 12 OZ", codigo: "Y00061" },
  { formato: "12 onza", nombre: "CUERPO LATA 7UP 355 ML 12 OZ", codigo: "Y00062" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ ZF S. ELENA", codigo: "Y00094" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT 250ML/8.4OZ Z S.ELENA", codigo: "Y00095" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 250ML/8.4OZ ZF SEU", codigo: "Y00096" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA 250ML/8.4OZ ZF S. ELE", codigo: "Y00097" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ EXPORT", codigo: "Y00098" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ EXP COL", codigo: "Y00099" },
  { formato: "12 onza", nombre: "CUERPO LATA MANGO YUKERY 335 ML 12 OZ", codigo: "Y00100" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN  355ML/12OZ EXP", codigo: "Y00105" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ CARIBE", codigo: "Y00106" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA SOLERA LIGHT SLEEK 355ml/12Oz", codigo: "Y90107" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PLAIN 250ML/8.4OZ", codigo: "Y00107" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA LIGHT 250ML/8.4OZ", codigo: "Y00108" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN 250ML/8.4OZ", codigo: "Y00109" },
  { formato: "12 onza", nombre: "CUERPO LATA ICE 355ML/12OZ", codigo: "Y00110" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA LIGHT 250ML/8.4OZ PL", codigo: "Y00111" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA LIGHT 250ML/8.4OZ ZF", codigo: "Y00113" },
  { formato: "12 onza", nombre: "CUERPO LATA ICE 355ML/12OZ PL", codigo: "Y00114" },
  { formato: "12 onza", nombre: "CUERPO LATA ICE 355ML/12OZ ZF", codigo: "Y00115" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTA LIGHT 355ML/12OZ", codigo: "Y00116" },
  { formato: "12 onza", nombre: "CUERPO LATA SEVEN UP ICE 2004, 12 ONZ", codigo: "Y00117" },
  { formato: "12 onza", nombre: "CUERPO LATA PEPSI TWIST 355 ML 12 OZ", codigo: "Y00121" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA LIGHT 250ML/8.4OZ PP", codigo: "Y00124" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ", codigo: "Y00125" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ PL", codigo: "Y00126" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ", codigo: "Y00127" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ PL", codigo: "Y00128" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ", codigo: "Y00129" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ PL", codigo: "Y00130" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA LIGHT 295ML/10OZ", codigo: "Y00131" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA LIGHT 295ML/10OZ PL", codigo: "Y00132" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ", codigo: "Y00133" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ PL", codigo: "Y00134" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ  ZF SE", codigo: "Y00135" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ  ZF PP", codigo: "Y00136" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ  ZF SE", codigo: "Y00137" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ  ZF PP", codigo: "Y00138" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ  ZF SE", codigo: "Y00141" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ  ZF PP", codigo: "Y00142" },
  { formato: "10 onza", nombre: "CUERPO LATA MALTIN 295ML/10OZ EXP PTR", codigo: "Y00143" },
  { formato: "8.0 onza", nombre: "CUERPO LATA PILSEN  8OZ EXP SURINAM", codigo: "Y00144" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN NARAMANGO 355 ML 12 O", codigo: "Y00145" },
  { formato: "12 onza", nombre: "CUERPO LATA 7UP BITE 355 ML 12 OZ", codigo: "Y00149" },
  { formato: "12 onza", nombre: "CUERPO LATA PEPSI FREE 355 ML 12 OZ", codigo: "Y00150" },
  { formato: "12 onza", nombre: "CUERPO LATA TE DURAZNO LIPTON 355ML/12OZ", codigo: "Y00151" },
  { formato: "12 onza", nombre: "CUERPO LATA TE LIMON LIPTON 355ML/12OZ", codigo: "Y00152" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN LIGHT 250ML/8.4OZ", codigo: "Y00155" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ EXP PTR", codigo: "Y00156" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN 250ML/8.4OZ EXP COL", codigo: "Y00163" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN SABOR 1 250ML/8.4OZ", codigo: "Y00165" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN SABOR 2 250ML/8.4OZ", codigo: "Y00166" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALT SABOR 2 250ML EXP PRO", codigo: "Y00167" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALT SABOR 2 250ML EXP AUA", codigo: "Y00168" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALT SABOR 2 250ML EXP CZO", codigo: "Y00169" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALT SABOR 1 250ML EXP USA", codigo: "Y00170" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ  ZF SE", codigo: "Y00171" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ  ZF PP", codigo: "Y00172" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA LIGHT 295ML/10OZ  SE", codigo: "Y00173" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA LIGHT 295ML/10OZ  PP", codigo: "Y00174" },
  { formato: "10 onza", nombre: "CUERPO LATA PLAIN 295ML/10OZ", codigo: "Y00175" },
  { formato: "10 onza Sleek", nombre: "CUERPO LATA PEPSI 320ML 10,8 OZ", codigo: "Y00176" },
  { formato: "12 onza", nombre: "CUERPO LATA AGUA POTABLE 355ML/12OZ", codigo: "Y00177" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ  EXP PTR", codigo: "Y00178" },
  { formato: "10 onza", nombre: "CUERPO LATA MARGARITA 295ML/10OZ", codigo: "Y00179" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ ESPAÑA", codigo: "Y00180" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ EXPORT T-202", codigo: "Y00190" },
  { formato: "12 onza", nombre: "CUERPO LATA ICE 355ML/12OZ T-202", codigo: "Y00191" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ T-202", codigo: "Y00192" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ PL T-202", codigo: "Y00193" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ  ZF SE T-202", codigo: "Y00194" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ ZF PP T-202", codigo: "Y00195" },
  { formato: "8.4 onza", nombre: "CUERPO LATA ICE 250ML/8.4OZ EX COL T-202", codigo: "Y00196" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ T-202", codigo: "Y00197" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ PL T-202", codigo: "Y00198" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ  ZF SE T202", codigo: "Y00199" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ ZF PP T202", codigo: "Y00200" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ T-202", codigo: "Y00201" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ CAR T-202", codigo: "Y00202" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN 250ML/8.4OZ T-202", codigo: "y00203" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN 355/120Z TFBI T202", codigo: "Y00204" },
  { formato: "8.4 onza", nombre: "CUERPO LATA MALTIN LIGHT 250ML/8.4OZ 202", codigo: "Y00205" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTA LIGHT 355ML/12OZ T202", codigo: "Y00206" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN 355ML/12OZ T-202", codigo: "Y00207" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN  355ML/12OZ PL T-202", codigo: "Y00208" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 8.45 OZ EXP T-202", codigo: "Y00209" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 250ML/8.4OZ COL T-202", codigo: "Y00210" },
  { formato: "8.0 onza", nombre: "CUERPO LATA PILSEN  8OZ EXP SURINAM 202", codigo: "Y00211" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ T-202", codigo: "Y00212" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ PL T-202", codigo: "Y00213" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ  ZF SE 202", codigo: "Y00214" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ ZF PP 202", codigo: "Y00215" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ T-202", codigo: "Y00216" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ PL T-202", codigo: "Y00217" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ  ZF SE 202", codigo: "Y00218" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ  ZF PP 202", codigo: "Y00219" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA LIGHT 295ML/10OZ T202", codigo: "Y00220" },
  { formato: "10 onza", nombre: "CUERPO LATA SOL LIGHT 295ML/10OZ PL T202", codigo: "Y00221" },
  { formato: "10 onza", nombre: "CUERPO LATA SOL LIGHT 295ML/10OZ  SE 202", codigo: "Y00222" },
  { formato: "10 onza", nombre: "CUERPO LATA SOL LIGHT 295ML/10OZ  PP 202", codigo: "Y00223" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN  355ML/12OZ PANAMA", codigo: "Y00224" },
  { formato: "12 onza", nombre: "CUERPO LATA EVERVESS KEN 355 ML 12 OZ", codigo: "Y00235" },
  { formato: "12 onza", nombre: "CUERPO LATA EVERVESS LII 355 ML 12 OZ", codigo: "Y00236" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN BLEND 355 ML 12 OZ", codigo: "Y00237" },
  { formato: "12 onza", nombre: "CUERPO LATA MANGO LIPTON 335 ML 12 OZ", codigo: "Y00238" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN  355ML/12OZ PAN T-202", codigo: "Y00239" },
  { formato: "12 onza", nombre: "CUERPO LATA PILSEN  355ML/12OZ T-202 DF", codigo: "Y00240" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN  355ML/12OZ ESP T-202", codigo: "Y00241" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT 250ML/8.4OZ T-202", codigo: "Y00242" },
  { formato: "8.0 onza", nombre: "CUERPO LATA PILSEN 8OZ EXP USA T-202", codigo: "Y00243" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA 295ML/10OZ PL/ZF T202", codigo: "Y00248" },
  { formato: "10 onza", nombre: "CUERPO LATA ICE 295ML/10OZ PL/ZF T-202", codigo: "Y00250" },
  { formato: "10 onza", nombre: "CUERPO LATA LIGHT 295ML/10OZ PL/ZF T-202", codigo: "Y00251" },
  { formato: "10 onza", nombre: "CUERPO LATA PILSEN 295ML/10OZ PL/ZF T202", codigo: "Y00252" },
  { formato: "10 onza", nombre: "CUERPO LATA SOL LIG 295ML/10OZ PL/ZF 202", codigo: "Y00253" },
  { formato: "12 onza", nombre: "CUERPO LATA 7UP 355 ML 12 OZ SUCRALOSA", codigo: "Y00264" },
  { formato: "10 onza", nombre: "CUERPO LATA MALTIN LIGHT 295ML/10OZ T202", codigo: "Y00268" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA CLASSIC 295/10 T-202", codigo: "Y00271" },
  { formato: "10 onza", nombre: "CUERPO LATA SOLERA CLASSIC 295/10 PL/ZF", codigo: "Y00272" },
  { formato: "10 onza", nombre: "CUERPO LATA MALTIN MANTEKADO 295ML/10OZ", codigo: "Y00277" },
  { formato: "10 onza", nombre: "CUERPO LATA MALTIN CHOKOLATE 295ML/10OZ", codigo: "Y00278" },
  { formato: "12 onza", nombre: "CUERPO LATA PLAIN 355ML/12OZ", codigo: "Y00283" },
  { formato: "12 onza", nombre: "CUERPO LATA LIGHT 355ML/12OZ T-202", codigo: "Y00286" },
  { formato: "12 onza", nombre: "CUERPO LATA TE VERDE 355ML/12OZ T-202", codigo: "Y00288" },
  { formato: "10 onza", nombre: "CUERPO LATA PLAIN2 295ML/10OZ T-202", codigo: "Y00289" },
  { formato: "10 onza", nombre: "CUERPO LATA PLAIN3 295ML/10OZ T-202", codigo: "Y00290" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PLAIN SLEEK 12OZ", codigo: "Y00294" },
  { formato: "12 onza", nombre: "CUERPO LATA PEPSI MAX 355 ML 12 OZ", codigo: "Y00297" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN CHICLE 355 ML", codigo: "Y00302" },
  { formato: "10 onza Sleek", nombre: "CUERPO LATA SEVEN UP 320ML 10,8 OZ", codigo: "Y00308" },
  { formato: "12 onza", nombre: "CUERPO LATA GOLDEN NARAPARCHITA 355ML 12", codigo: "Y00311" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN 355ML/12OZ TFBI T202", codigo: "Y00312" },
  { formato: "12 onza", nombre: "CUERPO LATA ISLAND COASTAL LEMON 355/120", codigo: "Y00313" },
  { formato: "12 onza", nombre: "CUERPO LATA POLAR PILSEN 355/120Z TFBI T", codigo: "Y00314" },
  { formato: "12 onza", nombre: "CUERPO LATA ISLAND COASTAL SOUT 355/120Z", codigo: "Y00315" },
  { formato: "12 onza", nombre: "CUERPO LATA GINGER BEER BLOOD ORANGE 355", codigo: "Y00317" },
  { formato: "12 onza", nombre: "CUERPO LATA GINGER BEER ORIGINAL 355/120", codigo: "Y00318" },
  { formato: "12 onza", nombre: "CUERPO LATA ISLAND COASTAL LAGER 355/120", codigo: "Y00321" },
  { formato: "12 onza", nombre: "CUERPO LATA BEACH ME UP TFBI 355/120Z", codigo: "Y00324" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA ISLAND ACTIVE SLEEK 12OZ", codigo: "Y00333" },
  { formato: "12 onza", nombre: "CUERPO LATA MALTIN CHILE 355/12OZ", codigo: "Y00334" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PILSEN SLEEK 355ML/12OZ", codigo: "Y00336" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PILSEN SLEEK 355ML/12OZ PL", codigo: "Y00337" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PILSEN SLEEK 355ML/12OZ ZF P", codigo: "Y00338" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PILSEN SLEEK 355ML/12OZ SEU", codigo: "Y00339" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA LIGHT SLEEK 355ML/12OZ", codigo: "Y00340" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA LIGHT SLEEK 355ML/12OZ PL", codigo: "Y00341" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA LIGHT SLEEK 355ML/12OZ ZF PP", codigo: "Y00342" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA LIGHT SLEEK 355ML/12OZ SEU", codigo: "Y00343" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA MALTIN SLEEK 355ML/12OZ", codigo: "Y00344" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA MALTIN LIGHT SLEEK 355ML/12O", codigo: "Y00345" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PEPSI SLEEK 355ML/12OZ", codigo: "Y00346" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA 7UP SLEEK 355ML/12OZ", codigo: "Y00348" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA VERANO 250ML/8.4OZ", codigo: "Y00349" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA VERANO PL 250ML/8.4", codigo: "Y00350" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA VERANO ZF 250ML/8.4", codigo: "Y00351" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA VERANO SEU 250ML/8.", codigo: "Y00352" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA SODA EVERVESS SLEEK 355ML 12", codigo: "Y00353" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GOLDEN KOLA SLEEK 355ML 12", codigo: "Y00354" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PEPSI LIGHT SLEEK 355ML/12OZ", codigo: "Y00355" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PEPSI BLACK SLEEK 355ML/12OZ", codigo: "Y00358" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA MANGO YUKERY SLEEK 335ml/12Oz", codigo: "Y00359" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA MANZANA YUKERY SLEEK  335ml/12Oz", codigo: "Y00360" },
  { formato: "12 onza", nombre: "CUERPO LATA PERA YUKERY SLEEK 335ML/12OZ", codigo: "Y00361" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA DURAZNO YUKERY SLEEK 335ml/12Oz", codigo: "Y00362" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA BLANCA 250ML/8,4OZ", codigo: "Y00363" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA BLANCA PL 250ML/8,4", codigo: "Y00364" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA BLANCA ZF 250ML/8,4", codigo: "Y00365" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA BLANCA SEU 250ML/8,", codigo: "Y00366" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PILSEN PROMO 7° SLEEK 355ML/", codigo: "Y00367" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA SODA AGUAKINA SLEEK 355ML/12", codigo: "Y00368" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA SODA SPARKLING SLEEK 355ML/1", codigo: "Y00369" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA TE LIMON LIPTON SLEEK 355ML/", codigo: "Y00370" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA TE DURAZNO LIPTON SLEEK 355M", codigo: "Y00371" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA ROCKSTAR SLEEK 355ML/12OZ", codigo: "Y00372" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA TE VERDE LIPTON SLEEK 355ML/", codigo: "Y00373" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA NARANJA YUKERY SLEEK  335ml/12Oz", codigo: "Y00374" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA ROSADA 250ML/8,4OZ", codigo: "Y00375" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA MOJITO 250ML/8,4OZ", codigo: "Y00376" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA CAROREÑA MOJITO 355ml/12oz", codigo: "Y00377" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA KOLSCH 250ML/8,4OZ", codigo: "Y00378" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT ZONAS ESP 250ML/8,4OZ", codigo: "Y00379" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN ZONAS ESP 250ML/8,4OZ", codigo: "Y00380" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA ZONAS ESP 250ML", codigo: "Y00381" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA LIGHT ZONAS ESP 250ML", codigo: "Y00382" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA VERANO ZONAS ESP 25", codigo: "Y00383" },
  { formato: "8.4 onza", nombre: "CUERPO LATA CAROREÑA BLANCA ZONAS ESP 25", codigo: "Y00384" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GOLDEN MANZANA SLEEK 355ML/1", codigo: "Y00386" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GOLDEN MANGO EXT SLEEK 355ML", codigo: "Y00387" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GOLDEN PIÑA SLEEK 355ML/12OZ", codigo: "Y00388" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GOLDEN UVA SLEEK 355ML/12OZ", codigo: "Y00389" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GOLDEN NARANJA SLEEK 355ML/1", codigo: "Y00390" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA BOHEMIA 250ML/8,4OZ", codigo: "Y00392" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA BOHEMIA 250ML/8,4 PL", codigo: "Y00393" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA BOHEMIA 250ML/8,4 ZF", codigo: "Y00394" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LQM TINTA 250ML/8,4OZ", codigo: "Y00395" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LQM BLANCA 250ML/8,4OZ", codigo: "Y00396" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA 250ML ZONAS ESPECIALE", codigo: "Y00397" },
  { formato: "8.4 onza", nombre: "CUERPO LATA SOLERA LIGHT 250ML ZONAS ESP", codigo: "Y00398" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA GINGER BEER SLEEK 355ML/12OZ", codigo: "Y00399" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN SLEEK 355ML/12OZ ZESP", codigo: "Y00400" },
  { formato: "8.4 onza", nombre: "CUERPO LATA PILSEN 250ML/8,4OZ ZONAS ESP", codigo: "Y00401" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT 250ML/8,4OZ CORREDORES", codigo: "Y00402" },
  { formato: "8.4 onza", nombre: "CUERPO LATA LIGHT SLEEK 355ML/12OZ CORRE", codigo: "Y00403" },
  { formato: "12 onza Sleek", nombre: "CUERPO LATA PERA YUKERY SLEEK 335ml/12Oz", codigo: "Y00361" }
];

interface TabPBOProps {
  currentRole: 'public' | 'calidad' | 'logistica';
  onAuthenticate: (pin: string) => boolean;
  onLogout: () => void;
  cabeceraFecha?: string;
  cabeceraTurno?: number;
  cabeceraAnalista?: string;
}

export default function TabPBO({ 
  currentRole, 
  onAuthenticate, 
  onLogout,
  cabeceraFecha = '',
  cabeceraTurno = 1,
  cabeceraAnalista = ''
}: TabPBOProps) {
  // DB State
  const [lotes, setLotes] = useState<LotePBO[]>([]);
  const [paletas, setPaletas] = useState<Paleta[]>([]);
  const [reprocesos, setReprocesos] = useState<Reproceso[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New Searchable SKU State
  const [showSkuDropdown, setShowSkuDropdown] = useState(false);
  const [skuSearchQuery, setSkuSearchQuery] = useState('');

  // Custom Delete Confirm ID
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reproceso form custom states (Images integration)
  const [selectedOriginalTickets, setSelectedOriginalTickets] = useState<string[]>([]);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [cantPaletasGen, setCantPaletasGen] = useState(1);
  const [cantCamadasGen, setCantCamadasGen] = useState(0);
  const [generatedTicketInputs, setGeneratedTicketInputs] = useState<string[]>([]);

  // Username registry identification
  const [usuarioRegistro, setUsuarioRegistro] = useState<string>(() => {
    return cabeceraAnalista || localStorage.getItem('usuario_registro_pbo') || 'OPERADOR';
  });

  // Sync analyst name when cabeceraAnalista changes
  useEffect(() => {
    if (cabeceraAnalista) {
      setUsuarioRegistro(cabeceraAnalista);
    }
  }, [cabeceraAnalista]);
  const [modalPaletas, setModalPaletas] = useState<{
    index: number;
    nro_ticket: string;
    nca: string;
    defecto: string;
    camadas_sueltas: number;
  }[]>([]);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterTurno, setFilterTurno] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'activos' | 'concluidos'>('activos');

  // Active PBO selection for details view / editing
  const [selectedLoteId, setSelectedLoteId] = useState<string | null>(null);

  // Derived active lote and paletas for full component scope
  const activeLote = lotes.find(l => l.id_pbo === selectedLoteId);
  const activeLotePaletas = selectedLoteId ? paletas.filter(p => p.id_pbo === selectedLoteId) : [];
  const activeLoteRepros = selectedLoteId ? reprocesos.filter(r => r.id_pbo === selectedLoteId) : [];
  
  // PBO Modals & Forms
  const [showNewLoteModal, setShowNewLoteModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showFo062Modal, setShowFo062Modal] = useState(false);
  const [fo062TargetLote, setFo062TargetLote] = useState<LotePBO | null>(null);
  const [summaryFilterScope, setSummaryFilterScope] = useState<'activos' | 'todos'>('activos');
  const [summarySearch, setSummarySearch] = useState('');
  const [copiedSummaryToast, setCopiedSummaryToast] = useState(false);
  const [pboTabActive, setPboTabActive] = useState<'info' | 'paletas' | 'reproceso' | 'traslado'>('info');

  // Security Login state inside PBO if not authenticated
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // New PBO Form
  const [newLote, setNewLote] = useState<{
    codigo_producto: string;
    producto: string;
    formato: string;
    lote: string;
    orden: string;
    fecha_produccion: string;
    defecto_general: string;
    paletas_count: number;
    camadas_sueltas: number;
    nca: string;
    aviso_calidad?: string;
    lote_inspeccion?: string;
  }>({
    codigo_producto: '',
    producto: '',
    formato: '12 onza',
    lote: '',
    orden: '',
    fecha_produccion: '',
    defecto_general: '',
    paletas_count: 1,
    camadas_sueltas: 0,
    nca: '2.5',
    aviso_calidad: '',
    lote_inspeccion: ''
  });

  // Reprocess form
  const [reproForm, setReproForm] = useState({
    tickets_originales_consumidos: '',
    nuevo_ticket_reprocesado: '',
    paletas_nuevas: 0,
    camadas_sueltas: 0,
    cantidad_envases: 0,
    cantidad_unidades: 1,
    check_liberado: false,
    check_espera_formato: false,
    calidad: 'Cumple' as 'Cumple' | 'No Cumple',
    observaciones: '',
  });

  const [editingRepro, setEditingRepro] = useState<Reproceso | null>(null);

  // Lab Dictamen Selection
  const [selectedReproId, setSelectedReproId] = useState<string | null>(null);
  const [dictamenEstatus, setDictamenEstatus] = useState<'Aprobado' | 'Rechazado'>('Aprobado');
  const [dictamenObs, setDictamenObs] = useState('');

  // Causes and actions state
  const [causesState, setCausesState] = useState({
    causas: '',
    medidas_correctivas: ''
  });

  // Expediente Details edit state (Aviso de Calidad, Lote de Inspección, Causa)
  const [expedienteEdit, setExpedienteEdit] = useState({
    aviso_calidad: '',
    lote_inspeccion: '',
    causa: '',
    medidas_correctivas: ''
  });

  // Search detail state
  const [searchDetailLote, setSearchDetailLote] = useState<LotePBO | null>(null);

  // Ref for canvas export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load all PBO data
  useEffect(() => {
    const loadPboData = async () => {
      setLoading(true);
      try {
        const l = await getLotesPBO();
        const p = await getPaletasPBO();
        const r = await getReprocesosPBO();
        setLotes(l);
        setPaletas(p);
        setReprocesos(r);
      } catch (err) {
        console.error("Error loading PBO data", err);
      } finally {
        setLoading(false);
      }
    };
    loadPboData();
  }, [refreshTrigger]);

  // Sync state when selected lote changes
  useEffect(() => {
    if (selectedLoteId) {
      const lote = lotes.find(l => l.id_pbo === selectedLoteId);
      if (lote) {
        setCausesState({
          causas: lote.causas || '',
          medidas_correctivas: lote.medidas_correctivas || ''
        });
        setExpedienteEdit({
          aviso_calidad: lote.aviso_calidad || '',
          lote_inspeccion: lote.lote_inspeccion || '',
          causa: lote.causas || '',
          medidas_correctivas: lote.medidas_correctivas || ''
        });
      }
    }
    // Reset custom Reproceso form fields when switching lotes
    setSelectedOriginalTickets([]);
    setReproForm({
      tickets_originales_consumidos: '',
      nuevo_ticket_reprocesado: '',
      paletas_nuevas: 0,
      camadas_sueltas: 0,
      cantidad_envases: 0,
      cantidad_unidades: 1,
      check_liberado: false,
      check_espera_formato: false,
    });
    setCantPaletasGen(1);
    setCantCamadasGen(0);
    setGeneratedTicketInputs([]);
  }, [selectedLoteId, lotes]);

  // Auto-complete default dates
  useEffect(() => {
    if (showNewLoteModal && !newLote.fecha_produccion) {
      const today = new Date().toISOString().split('T')[0];
      setNewLote(prev => ({ ...prev, fecha_produccion: today }));
    }
  }, [showNewLoteModal]);

  // Reset modalPaletas when closing modal
  useEffect(() => {
    if (!showNewLoteModal) {
      setModalPaletas([]);
    }
  }, [showNewLoteModal]);

  // Manual generation of paletas list based on user counts, defect, and NCA
  const handleGeneratePaletasList = () => {
    const count = newLote.paletas_count || 0;
    if (count <= 0 && newLote.camadas_sueltas <= 0) {
      alert("Por favor ingrese al menos 1 paleta completa o capas sueltas para generar el listado.");
      return;
    }
    const list = [];
    
    // Generate full pallets
    for (let i = 1; i <= count; i++) {
      list.push({
        index: i,
        nro_ticket: '', // MUST be blank initially as requested
        nca: newLote.nca,
        defecto: newLote.defecto_general || '',
        camadas_sueltas: 0
      });
    }
    
    // Generate 1 additional pallet if camadas_sueltas > 0 representing the loose layers
    if (newLote.camadas_sueltas > 0) {
      list.push({
        index: count + 1,
        nro_ticket: '', // MUST be blank initially as requested
        nca: newLote.nca,
        defecto: newLote.defecto_general || '',
        camadas_sueltas: newLote.camadas_sueltas
      });
    }
    
    setModalPaletas(list);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onAuthenticate(pinInput);
    if (ok) {
      setPinInput('');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Calculations for Cans
  const getCansPerPallet = (formato: string) => {
    const f = formato.toLowerCase();
    if (f.includes('8.4') || f.includes('8.0') || f.includes('8')) return 9912;
    if (f.includes('10')) return 8024;
    return 7552; // 12 oz, etc.
  };

  const getCansPerCamada = () => 472;

  const calculateCans = (formato: string, paletasCount: number, camadasSueltas: number) => {
    const cansPerPallet = getCansPerPallet(formato);
    const cansPerCamada = getCansPerCamada();
    return (paletasCount * cansPerPallet) + (camadasSueltas * cansPerCamada);
  };

  // Handle Save Lote
  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede ingresar retenciones PBO.");
      return;
    }

    if (!newLote.producto || !newLote.lote || !newLote.orden || !newLote.defecto_general) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (modalPaletas.length === 0) {
      alert("Por favor, genere el listado de paletas primero usando el botón de 'Generar Listado de Paletas' y complete los números de ticket.");
      return;
    }

    const hasEmptyTicket = modalPaletas.some(p => !p.nro_ticket || !p.nro_ticket.trim());
    if (hasEmptyTicket) {
      alert("Por favor complete el número de ticket para todas las paletas generadas. Esta columna no puede quedar vacía.");
      return;
    }

    // Generate beautiful folio id: PBO-YYYYMMDD-###
    const cleanDate = newLote.fecha_produccion.replace(/-/g, '');
    const suffix = String(lotes.filter(l => l.fecha_produccion === newLote.fecha_produccion).length + 1).padStart(2, '0');
    const id_pbo = `PBO-${cleanDate}-${suffix}`;

    // Sum up total cans from customized pallet inputs
    let totalCans = 0;
    modalPaletas.forEach(mp => {
      if (mp.camadas_sueltas > 0) {
        totalCans += mp.camadas_sueltas * getCansPerCamada();
      } else {
        totalCans += getCansPerPallet(newLote.formato);
      }
    });

    const loteObj: LotePBO = {
      id_pbo,
      producto: newLote.producto.toUpperCase(),
      formato: newLote.formato,
      lote: newLote.lote.toUpperCase(),
      orden: newLote.orden,
      fecha_produccion: newLote.fecha_produccion,
      defecto_general: newLote.defecto_general,
      cantidad_total_latas: totalCans,
      ubicacion: 'Almacen de PBO',
      estatus_general: 'Abierto',
      aviso_calidad: newLote.aviso_calidad?.trim() || '',
      lote_inspeccion: newLote.lote_inspeccion?.trim() || '',
      usuario_registro: usuarioRegistro || 'CALIDAD (MÓDULO PBO)',
      creado_el: new Date().toISOString(),
      fecha_registro: cabeceraFecha || new Date().toISOString().split('T')[0],
      turno_registro: cabeceraTurno
    };

    // Generate Palets entries using dynamic inputs
    const paletasList: Paleta[] = modalPaletas.map(mp => ({
      id: `${id_pbo}-P${mp.index}`,
      id_pbo,
      nro_ticket: mp.nro_ticket.trim().toUpperCase(),
      camadas_sueltas: mp.camadas_sueltas,
      defecto: mp.defecto || newLote.defecto_general,
      nca: mp.nca !== undefined ? mp.nca : newLote.nca,
      estatus: 'Sin reprocesar',
      creado_el: new Date().toISOString()
    }));

    try {
      await saveLotePBO(loteObj);
      await savePaletasPBO(paletasList);
      
      setNewLote({
        codigo_producto: '',
        producto: '',
        formato: '12 onza',
        lote: '',
        orden: '',
        fecha_produccion: '',
        defecto_general: '',
        paletas_count: 1,
        camadas_sueltas: 0,
        nca: '2.5',
        aviso_calidad: '',
        lote_inspeccion: ''
      });
      setShowNewLoteModal(false);
      setSelectedLoteId(id_pbo);
      setPboTabActive('paletas');
      setRefreshTrigger(p => p + 1);
      alert(`¡Folio ${id_pbo} creado con éxito con ${modalPaletas.length} paleta(s) bajo observación!`);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar el folio PBO.");
    }
  };

  // Handle Paleta Status Change
  const handlePaletaStatusChange = async (paleta: Paleta, newEstatus: string) => {
    if (paleta.estatus === 'Reprocesado' && newEstatus === 'Sin reprocesar') {
        const confirmMsg = "Advertencia: Cambiar el estatus de una paleta reprocesada a 'Sin reprocesar' eliminará el ticket de reproceso asociado y revertirá todas las paletas involucradas. ¿Desea continuar?";
        if (!window.confirm(confirmMsg)) return;

        const targetRepro = reprocesos.find(r => r.id_pbo === paleta.id_pbo && r.tickets_originales_consumidos.includes(paleta.nro_ticket));
        
        if (targetRepro) {
            const ticketsToRevert = targetRepro.tickets_originales_consumidos.split(',').map(t => t.trim().toUpperCase());
            
            const updatedPaletas = paletas.map(p2 => {
               if (p2.id_pbo === paleta.id_pbo && ticketsToRevert.includes(p2.nro_ticket.toUpperCase())) {
                   return { ...p2, estatus: 'Sin reprocesar' as any };
               }
               return p2;
            });
            
            setPaletas(updatedPaletas);
            
            try {
                await deleteReprocesoPBO(targetRepro.id);
                setReprocesos(prev => prev.filter(r => r.id !== targetRepro.id));
                alert("El ticket de reproceso asociado ha sido eliminado y las paletas revertidas a 'Sin reprocesar'. Recuerde hacer clic en 'Actualizar Datos Quirúrgicos' para guardar los cambios de las paletas.");
            } catch (e) {
                console.error(e);
            }
            return;
        }
    }
    
    // Normal change
    const updated = [...paletas];
    const pi = updated.findIndex(item => item.id === paleta.id);
    if (pi !== -1) {
        updated[pi].estatus = newEstatus as any;
        setPaletas(updated);
    }
  };

  // Mass save individual palets
  const handleUpdatePaletas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede actualizar datos técnicos.");
      return;
    }
    const lotePaletas = paletas.filter(p => p.id_pbo === selectedLoteId);
    try {
      await savePaletasPBO(lotePaletas);
      if (selectedLoteId) {
        await checkAndAutoCloseLote(selectedLoteId);
      }
      setRefreshTrigger(p => p + 1);
      alert("¡Paletas actualizadas quirúrgicamente con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar paletas.");
    }
  };

  // Add a pallet to an already existing PBO
  const handleAddPaleta = async (loteId: string, defectoGeneral: string) => {
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede agregar paletas.");
      return;
    }
    const lotePaletas = paletas.filter(p => p.id_pbo === loteId);
    const existingNum = lotePaletas.length + 1;
    const newPaletaId = `${loteId}-P${Date.now()}`;
    const newPaleta: Paleta = {
      id: newPaletaId,
      id_pbo: loteId,
      nro_ticket: `TKT-${loteId}-${existingNum}`,
      camadas_sueltas: 0,
      defecto: defectoGeneral || 'Defecto PBO',
      nca: '2.5',
      estatus: 'Sin reprocesar',
      creado_el: new Date().toISOString()
    };
    
    const updatedPaletas = [...paletas, newPaleta];
    setPaletas(updatedPaletas);
    try {
      await savePaletasPBO([newPaleta]);
      setRefreshTrigger(p => p + 1);
      alert(`¡Paleta agregada con éxito! Ticket sugerido: ${newPaleta.nro_ticket}`);
    } catch (err) {
      console.error(err);
      alert("Error al agregar la paleta.");
    }
  };

  // Remove a pallet from an existing PBO
  const handleRemovePaleta = async (paletaId: string, ticketNum: string) => {
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede eliminar paletas.");
      return;
    }
    if (!window.confirm(`¿Está seguro de eliminar la paleta con ticket "${ticketNum}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await deletePaletaPBO(paletaId);
      setPaletas(prev => prev.filter(p => p.id !== paletaId));
      if (selectedOriginalTickets.includes(ticketNum)) {
        setSelectedOriginalTickets(prev => prev.filter(t => t !== ticketNum));
      }
      setRefreshTrigger(p => p + 1);
      alert("Paleta eliminada con éxito.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la paleta.");
    }
  };

  // Register reprocess
  const handleAddReproceso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad registra reprocesos.");
      return;
    }
    if (!selectedLoteId) return;

    let inputTickets = reproForm.nuevo_ticket_reprocesado
      .split(/[\s,;\n]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    if (inputTickets.length === 0) {
      const cleanDate = cabeceraFecha ? cabeceraFecha.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const autoTicket = `TKT-${cleanDate}-REWORK-A1`;
      inputTickets = [autoTicket];
    }

    try {
      let updatedPaletas = [...paletas];
      const paletasToSaveList: Paleta[] = [];

      // 1. Update all selected original tickets (consumed) to "Reprocesado" to discount them from "Material No Reprocesado"
      const ticketsToMark = new Set<string>();

      selectedOriginalTickets.forEach(t => ticketsToMark.add(t.toUpperCase().trim()));

      if (reproForm.tickets_originales_consumidos) {
        reproForm.tickets_originales_consumidos
          .split(/[\s,;\n]+/)
          .map(t => t.trim().toUpperCase())
          .filter(t => t.length > 0 && t !== 'N/A')
          .forEach(t => ticketsToMark.add(t));
      }

      for (const tktOriginal of ticketsToMark) {
        const existingPaletaIdx = updatedPaletas.findIndex(p => p.id_pbo === selectedLoteId && p.nro_ticket.toUpperCase() === tktOriginal);
        if (existingPaletaIdx !== -1) {
          updatedPaletas[existingPaletaIdx] = {
            ...updatedPaletas[existingPaletaIdx],
            estatus: 'Reprocesado' as const
          };
          if (!paletasToSaveList.some(p => p.id === updatedPaletas[existingPaletaIdx].id)) {
            paletasToSaveList.push(updatedPaletas[existingPaletaIdx]);
          }
        }
      }

      // 2. Save new reprocess outputs (new tickets generated)
      const consumedTicketsStr = selectedOriginalTickets.length > 0 
        ? selectedOriginalTickets.join(', ') 
        : (reproForm.tickets_originales_consumidos || 'N/A');

      const ticketsGeneradosStr = inputTickets.join(', ');
      const reproId = `REP-${Date.now()}`;
      const finalCamadas = reproForm.cantidad_envases > 0
        ? Number((reproForm.cantidad_envases / getCansPerCamada()).toFixed(2))
        : (reproForm.camadas_sueltas || 0);

      const nuevoRep: Reproceso = {
        id: reproId,
        id_pbo: selectedLoteId,
        tickets_originales_consumidos: consumedTicketsStr,
        nuevo_ticket_reprocesado: ticketsGeneradosStr,
        camadas_sueltas: finalCamadas,
        paletas_nuevas: reproForm.paletas_nuevas || 0,
        estatus_calidad: 'Aprobado',
        estatus_logistica: 'Confirmado',
        check_liberado: reproForm.check_liberado,
        check_espera_formato: reproForm.check_espera_formato,
        usuario_registro: usuarioRegistro || 'CALIDAD (REPROCESO)',
        creado_el: new Date().toISOString(),
        fecha_registro: cabeceraFecha,
        turno_registro: cabeceraTurno,
        fecha_liberacion: reproForm.check_liberado ? (cabeceraFecha || new Date().toISOString().slice(0, 10)) : undefined,
        turno_liberacion: reproForm.check_liberado ? cabeceraTurno : undefined,
        calidad: reproForm.calidad,
        observaciones: reproForm.observaciones
      };
      
      await saveReprocesoPBO(nuevoRep);
      setReprocesos(prev => [nuevoRep, ...prev]);

      if (paletasToSaveList.length > 0) {
        await savePaletasPBO(paletasToSaveList);
        setPaletas(updatedPaletas);
      }

      await checkAndAutoCloseLote(selectedLoteId);

      setReproForm({
        tickets_originales_consumidos: '',
        nuevo_ticket_reprocesado: '',
        paletas_nuevas: 0,
        camadas_sueltas: 0,
        cantidad_envases: 0,
        cantidad_unidades: 1,
        check_liberado: false,
        check_espera_formato: false,
        calidad: 'Cumple',
        observaciones: ''
      });
      setSelectedOriginalTickets([]);
      setRefreshTrigger(p => p + 1);
      alert(`¡Se registró el reproceso con éxito!`);
    } catch (err) {
      console.error(err);
      alert("Error al registrar reproceso.");
    }
  };

  const handleToggleReproCheck = async (repro: Reproceso, field: 'check_liberado' | 'check_espera_formato') => {
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede modificar los checks de reproceso.");
      return;
    }
    const newValue = !repro[field];

    const updatedRepro: Reproceso = {
      ...repro,
      [field]: newValue
    };

    // Si se activa check_liberado, guardamos la fecha y turno del turno actual
    if (field === 'check_liberado') {
      if (newValue) {
        updatedRepro.fecha_liberacion = cabeceraFecha || new Date().toISOString().slice(0, 10);
        updatedRepro.turno_liberacion = cabeceraTurno;
      } else {
        updatedRepro.fecha_liberacion = undefined;
        updatedRepro.turno_liberacion = undefined;
      }
    }

    try {
      await saveReprocesoPBO(updatedRepro);
      setReprocesos(prev => prev.map(r => r.id === repro.id ? updatedRepro : r));
    } catch (e) {
      console.error(e);
      alert("Error al actualizar checks de reproceso.");
    }
  };

  const handleSaveEditedRepro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepro) return;
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede modificar reprocesos.");
      return;
    }
    try {
      const reproToSave: Reproceso = {
        ...editingRepro,
        fecha_liberacion: editingRepro.check_liberado 
          ? (editingRepro.fecha_liberacion || cabeceraFecha || new Date().toISOString().slice(0, 10))
          : undefined,
        turno_liberacion: editingRepro.check_liberado 
          ? (editingRepro.turno_liberacion || cabeceraTurno)
          : undefined
      };
      await saveReprocesoPBO(reproToSave);
      setEditingRepro(null);
      setRefreshTrigger(p => p + 1);
      alert("Reproceso actualizado con éxito.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios del reproceso.");
    }
  };

  const handleDeleteReproceso = async (repro: Reproceso) => {
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede eliminar reprocesos.");
      return;
    }
    if (!window.confirm(`¿Está seguro de eliminar este reproceso para el ticket ${repro.nuevo_ticket_reprocesado}?`)) {
      return;
    }
    try {
      await deleteReprocesoPBO(repro.id);
      
      // Parse consumed original ticket tokens in this reproceso
      const consumedRaw = repro.tickets_originales_consumidos || '';
      const consumedTokens = consumedRaw
        .split(/[\s,;\n]+/)
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0 && t !== 'N/A');

      const paletasToSave: Paleta[] = [];
      const updatedPaletas = paletas.map(p => {
        if (p.id_pbo === repro.id_pbo) {
          const matchesTicket = consumedTokens.some(tok => p.nro_ticket.toUpperCase() === tok);
          if (matchesTicket && p.estatus === 'Reprocesado') {
            const resetPaleta = { ...p, estatus: 'Sin reprocesar' as const };
            paletasToSave.push(resetPaleta);
            return resetPaleta;
          }
        }
        return p;
      });

      if (paletasToSave.length > 0) {
        await savePaletasPBO(paletasToSave);
      }
      setPaletas(updatedPaletas);
      setReprocesos(prev => prev.filter(r => r.id !== repro.id));
      
      setRefreshTrigger(p => p + 1);
      alert("Reproceso eliminado con éxito. Las paletas consumidas han sido devueltas al estatus 'Sin reprocesar'.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el reproceso.");
    }
  };


  // Logistics update stock movement
  const handleMoveUbicacion = async (ubicacion: string) => {
    if (currentRole !== 'logistica' && currentRole !== 'calidad') {
      alert("Acceso denegado: Solo personal autorizado puede mover mercancía.");
      return;
    }
    if (!selectedLoteId) return;

    const currentLote = lotes.find(l => l.id_pbo === selectedLoteId);
    if (!currentLote) return;

    const updated = {
      ...currentLote,
      ubicacion
    };

    try {
      await saveLotePBO(updated);
      setRefreshTrigger(p => p + 1);
      alert(`¡Ubicación física del lote actualizada a: ${ubicacion}!`);
    } catch (err) {
      console.error(err);
      alert("Error al reubicar.");
    }
  };

  // Logistics validate repro ticket
  const handleLogisticsValidateTicket = async (reproId: string, confirmStatus: 'Confirmado' | 'Inconsistencia') => {
    if (currentRole !== 'logistica' && currentRole !== 'calidad') {
      alert("Acceso denegado: Solo personal de Logística/Calidad puede validar tickets físicamente.");
      return;
    }

    const repro = reprocesos.find(r => r.id === reproId);
    if (!repro) return;

    const updated: Reproceso = {
      ...repro,
      estatus_logistica: confirmStatus
    };

    try {
      await saveReprocesoPBO(updated);
      await checkAndAutoCloseLote(repro.id_pbo);
      setRefreshTrigger(p => p + 1);
      alert(`Ticket físico marcado como: ${confirmStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Expediente Details (Aviso de Calidad, Lote de Inspección, Causa)
  const handleSaveExpedienteData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede modificar los datos del expediente.");
      return;
    }
    if (!selectedLoteId) return;

    const currentLote = lotes.find(l => l.id_pbo === selectedLoteId);
    if (!currentLote) return;

    const updated: LotePBO = {
      ...currentLote,
      aviso_calidad: expedienteEdit.aviso_calidad.trim(),
      lote_inspeccion: expedienteEdit.lote_inspeccion.trim(),
      causas: expedienteEdit.causa.trim(),
      medidas_correctivas: expedienteEdit.medidas_correctivas.trim()
    };

    try {
      await saveLotePBO(updated);
      setRefreshTrigger(p => p + 1);
      alert("¡Datos del expediente actualizados con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al guardar los datos del expediente.");
    }
  };

  // Save technical causes & correctives
  const handleSaveCauses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad ingresa las causas de las desviaciones.");
      return;
    }
    if (!selectedLoteId) return;

    const currentLote = lotes.find(l => l.id_pbo === selectedLoteId);
    if (!currentLote) return;

    const updated: LotePBO = {
      ...currentLote,
      causas: causesState.causas,
      medidas_correctivas: causesState.medidas_correctivas
    };

    try {
      await saveLotePBO(updated);
      setRefreshTrigger(p => p + 1);
      alert("¡Investigación técnica guardada con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al guardar.");
    }
  };

  // Close PBO lot permanently
  const handleToggleCloseLote = async () => {
    if (currentRole !== 'calidad') {
      alert("Acceso denegado: Solo Calidad puede cerrar los expedientes PBO.");
      return;
    }
    if (!selectedLoteId) return;

    const currentLote = lotes.find(l => l.id_pbo === selectedLoteId);
    if (!currentLote) return;

    const isCurrentlyClosed = currentLote.estatus_general === 'Cerrado';
    const msg = isCurrentlyClosed 
      ? "¿Desea volver a ABRIR este expediente de Producto Bajo Observación?" 
      : "¿Está seguro de CERRAR este expediente? Al cerrarlo, certifica que todas las paletas han completado su ciclo físico y técnico.";

    const ok = window.confirm(msg);
    if (!ok) return;

    const updated: LotePBO = {
      ...currentLote,
      estatus_general: isCurrentlyClosed ? 'Abierto' : 'Cerrado'
    };

    try {
      await saveLotePBO(updated);
      setRefreshTrigger(p => p + 1);
      alert(`¡Expediente de PBO marcado como ${updated.estatus_general}!`);
    } catch (err) {
      console.error(err);
    }
  };

  // Automatic PBO closure check & update
  const checkAndAutoCloseLote = async (id: string) => {
    try {
      const latestPaletas = await getPaletasPBO();
      const latestLotes = await getLotesPBO();

      const lotObj = latestLotes.find(l => l.id_pbo === id);
      if (!lotObj) return;

      const lotPaletas = latestPaletas.filter(p => p.id_pbo === id);
      if (lotPaletas.length === 0) return;

      // Checks:
      // Any pallet is still "Sin reprocesar"
      const hasPendingPalets = lotPaletas.some(p => p.estatus === 'Sin reprocesar');

      const shouldClose = !hasPendingPalets;

      if (shouldClose && lotObj.estatus_general === 'Abierto') {
        const updatedLote: LotePBO = { ...lotObj, estatus_general: 'Cerrado' };
        await saveLotePBO(updatedLote);
        alert(`🎉 ¡Atención!\n\nSe ha completado el reproceso de todo el material del lote con folio "${id}". Todos los tickets pendientes han sido reprocesados exitosamente. El PBO ha sido culminado y archivado.`);
      } else if (!shouldClose && lotObj.estatus_general === 'Cerrado') {
        const updatedLote: LotePBO = { ...lotObj, estatus_general: 'Abierto' };
        await saveLotePBO(updatedLote);
      }
    } catch (e) {
      console.error("Error in checkAndAutoCloseLote", e);
    }
  };

  // Actual execute delete function called by our custom confirmation modal
  const executeDeleteLote = async (id: string) => {
    try {
      await deleteLotePBO(id);
      if (selectedLoteId === id) {
        setSelectedLoteId(null);
      }
      setDeleteConfirmId(null);
      setRefreshTrigger(p => p + 1);
      alert(`¡Expediente PBO ${id} eliminado satisfactoriamente!`);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al intentar eliminar el expediente.");
    }
  };

  // Delete current selected PBO lot completely
  const handleDeleteLote = async () => {
    if (!selectedLoteId) return;
    setDeleteConfirmId(selectedLoteId);
  };

  // Autocomplete sample PBO data
  const handleLlenarDatosPboPrueba = async () => {
    if (currentRole !== 'calidad') {
      alert("Clave de seguridad requerida: Inicie sesión como Calidad para registrar datos de prueba.");
      return;
    }

    const cleanDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const pboId = `PBO-${cleanDate}-99`;

    const sampleLote: LotePBO = {
      id_pbo: pboId,
      producto: 'PILSEN SLEEK 12 OZ',
      formato: '12 oz',
      lote: 'NR6J252A3',
      orden: '70161139',
      fecha_produccion: new Date().toISOString().split('T')[0],
      defecto_general: 'Decoración corrida y manchas de tinta en envoltura superior',
      cantidad_total_latas: calculateCans('12 oz', 4, 0),
      ubicacion: 'Transicion',
      estatus_general: 'Abierto',
      causas: 'Inundación temporal en el área de dosificación de tinta por vibración en booster de alimentación.',
      medidas_correctivas: 'Limpieza profunda de rodillos eyectores e incremento de frecuencia de purgado de inyectores.',
      usuario_registro: 'INSPECTOR CALIDAD PRUEBAS',
      creado_el: new Date().toISOString(),
      fecha_registro: cabeceraFecha || new Date().toISOString().split('T')[0],
      turno_registro: cabeceraTurno
    };

    const samplePalets: Paleta[] = [
      { id: `${pboId}-P1`, id_pbo: pboId, nro_ticket: `TKT-${cleanDate}-01`, camadas_sueltas: 0, defecto: 'Tinta corrida severa', nca: '4.0', estatus: 'Reprocesado', creado_el: new Date().toISOString() },
      { id: `${pboId}-P2`, id_pbo: pboId, nro_ticket: `TKT-${cleanDate}-02`, camadas_sueltas: 0, defecto: 'Tinta corrida moderada', nca: '2.5', estatus: 'Reprocesado', creado_el: new Date().toISOString() },
      { id: `${pboId}-P3`, id_pbo: pboId, nro_ticket: `TKT-${cleanDate}-03`, camadas_sueltas: 0, defecto: 'Puntos de tinta sutiles', nca: '1.5', estatus: 'Liberado Directo', creado_el: new Date().toISOString() },
      { id: `${pboId}-P4`, id_pbo: pboId, nro_ticket: `TKT-${cleanDate}-04`, camadas_sueltas: 0, defecto: 'Tinta corrida severa', nca: '4.0', estatus: 'Sin reprocesar', creado_el: new Date().toISOString() }
    ];

    const sampleRepros: Reproceso[] = [
      {
        id: `REP-${Date.now()}-1`,
        id_pbo: pboId,
        tickets_originales_consumidos: `TKT-${cleanDate}-01, TKT-${cleanDate}-02`,
        nuevo_ticket_reprocesado: `TKT-${cleanDate}-REWORK-A1`,
        camadas_sueltas: 0,
        estatus_calidad: 'Aprobado',
        estatus_logistica: 'Confirmado',
        usuario_registro: 'INSPECTOR CALIDAD PRUEBAS',
        creado_el: new Date().toISOString(),
        fecha_registro: cabeceraFecha,
        turno_registro: cabeceraTurno
      }
    ];

    try {
      await saveLotePBO(sampleLote);
      await savePaletasPBO(samplePalets);
      await saveReprocesoPBO(sampleRepros[0]);
      
      setSelectedLoteId(pboId);
      setPboTabActive('info');
      setRefreshTrigger(p => p + 1);
      alert("¡Integradas paletas, lotes, reprocesos e investigación de prueba para PBO! Revise el dashboard o busque por lote.");
    } catch (e) {
      console.error(e);
    }
  };

  // Filtering Logic
  const filteredLotes = lotes.filter(l => {
    const matchDate = !filterDate || l.fecha_produccion === filterDate;
    const matchTurno = !filterTurno || l.turno_registro === parseInt(filterTurno);
    
    const matchSearch = !searchTerm || 
      l.id_pbo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.orden.toLowerCase().includes(searchTerm.toLowerCase());

    return matchDate && matchTurno && matchSearch;
  });

  // Sorting: Abierto first, Cerrado at the end. For same status, newest first.
  const sortedFilteredLotes = [...filteredLotes].sort((a, b) => {
    if (a.estatus_general === 'Abierto' && b.estatus_general === 'Cerrado') return -1;
    if (a.estatus_general === 'Cerrado' && b.estatus_general === 'Abierto') return 1;
    return new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime();
  });

  // KPI calculations (Only for Active / Open PBOs)
  const activeLotes = lotes.filter(l => l.estatus_general === 'Abierto');
  const activeLoteIds = new Set(activeLotes.map(l => l.id_pbo));

  const totalPBOActivos = activeLotes.length;
  
  const totalPaletasCuarentena = paletas.filter(p => activeLoteIds.has(p.id_pbo) && (p.estatus === 'Sin reprocesar' || p.estatus === 'En proceso')).length;
  const totalPaletasPendientesReproceso = paletas.filter(p => activeLoteIds.has(p.id_pbo) && p.estatus === 'Sin reprocesar').length;
  
  const totalCasosCerrados = lotes.filter(l => l.estatus_general === 'Cerrado').length;

  // Total registered cans across all history for recovery rate
  const totalCansRegistered = lotes.reduce((acc, curr) => {
    const lotePalets = paletas.filter(p => p.id_pbo === curr.id_pbo);
    const sumCans = lotePalets.reduce((sum, p) => sum + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(curr.formato)), 0);
    return acc + (sumCans > 0 ? sumCans : (curr.cantidad_total_latas || 0));
  }, 0);

  // Total cans in active / open PBOs
  const totalLatasRetenidasActivos = activeLotes.reduce((acc, curr) => {
    const lotePalets = paletas.filter(p => p.id_pbo === curr.id_pbo);
    const sumCans = lotePalets.reduce((sum, p) => sum + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(curr.formato)), 0);
    return acc + (sumCans > 0 ? sumCans : (curr.cantidad_total_latas || 0));
  }, 0);

  const totalLatasRetenidas = totalLatasRetenidasActivos;
  
  // Liberated directly cans
  const totalCansLiberatedDirect = paletas
    .filter(p => p.estatus === 'Liberado Directo')
    .reduce((acc, curr) => {
      const parent = lotes.find(l => l.id_pbo === curr.id_pbo);
      if (!parent) return acc;
      if (curr.camadas_sueltas > 0) {
        return acc + (curr.camadas_sueltas * getCansPerCamada());
      }
      return acc + getCansPerPallet(parent.formato);
    }, 0);

  // Approved repro cans
  const totalCansApprovedRepro = reprocesos
    .filter(r => r.estatus_calidad === 'Aprobado')
    .reduce((acc, curr) => {
      const parent = lotes.find(l => l.id_pbo === curr.id_pbo);
      if (!parent) return acc;
      let cans = 0;
      if (curr.paletas_nuevas !== undefined && curr.paletas_nuevas > 0) {
        cans += curr.paletas_nuevas * getCansPerPallet(parent.formato);
      } else if (!curr.camadas_sueltas) {
        cans += getCansPerPallet(parent.formato);
      }
      if (curr.camadas_sueltas > 0) {
        cans += curr.camadas_sueltas * getCansPerCamada();
      }
      return acc + cans;
    }, 0);

  const totalCansLiberated = totalCansLiberatedDirect + totalCansApprovedRepro;
  const recoveryRate = totalCansRegistered > 0 
    ? Math.min(100, Math.round((totalCansLiberated / totalCansRegistered) * 100)) 
    : 0;

  // Search logic for express ticket inspection
  const handleExpressSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSearchDetailLote(null);
      return;
    }
    // Check if term is directly a ticket number
    const matchedPalet = paletas.find(p => p.nro_ticket.toLowerCase() === term.toLowerCase());
    if (matchedPalet) {
      const parentLote = lotes.find(l => l.id_pbo === matchedPalet.id_pbo);
      if (parentLote) {
        setSearchDetailLote(parentLote);
        setSelectedLoteId(parentLote.id_pbo);
        return;
      }
    }
    const matchedLoteObj = lotes.find(l => l.lote.toLowerCase() === term.toLowerCase() || l.id_pbo.toLowerCase() === term.toLowerCase());
    if (matchedLoteObj) {
      setSearchDetailLote(matchedLoteObj);
      setSelectedLoteId(matchedLoteObj.id_pbo);
    }
  };

  // Generate PDF Summary (Matching exact table format: MATERIAL, DESCRIPCION, Lote, #Ticket, Cantidad total de paletas, CAMADAS, Defecto, NCA)
  const findMaterialInfo = (productoStr: string) => {
    if (!productoStr) return { codigo: 'Y00336', descripcion: 'PILSEN SLEEK 12 OZ' };
    const norm = productoStr.toUpperCase().trim();
    const found = CATALOGO_PRODUCTOS_PBO.find(c => {
      const cNorm = c.nombre.toUpperCase().trim();
      return cNorm === norm || norm.includes(cNorm) || cNorm.includes(norm);
    });
    if (found) {
      return { codigo: found.codigo, descripcion: found.nombre };
    }
    if (norm.includes('PILSEN SLEEK') || norm.includes('PILSEN')) return { codigo: 'Y00336', descripcion: 'PILSEN SLEEK 12 OZ' };
    if (norm.includes('SOLERA LIGHT') || norm.includes('SOLERA')) return { codigo: 'Y00108', descripcion: 'CUERPO LATA SOLERA LIGHT 250ML/8.4OZ' };
    if (norm.includes('SPARKLING') || norm.includes('SODA')) return { codigo: 'Y00369', descripcion: 'CUERPO LATA SODA SPARKLING SLEEK 355ML/1' };
    if (norm.includes('MANZANA') || norm.includes('YUKERY')) return { codigo: 'Y00360', descripcion: 'CUERPO LATA MANZANA YUKERY SLEEK 335ML/12OZ' };
    if (norm.includes('PEPSI')) return { codigo: 'Y00346', descripcion: 'CUERPO LATA PEPSI SLEEK 355ML/12OZ' };
    return { codigo: 'Y00336', descripcion: productoStr.toUpperCase() };
  };

  const cleanTicketStr = (ticketRaw: string) => {
    if (!ticketRaw) return 'N/A';
    const parts = ticketRaw.trim().split('-');
    const lastPart = parts[parts.length - 1].trim();
    if (!isNaN(Number(lastPart)) && lastPart.length > 0) {
      return String(Number(lastPart));
    }
    return lastPart || ticketRaw;
  };

  // Build summary data for PBO
  interface SummaryRow {
    material: string;
    descripcion: string;
    formato: string;
    orden: string;
    lote: string;
    tickets: string;
    mes_creacion: string;
    analista: string;
    cantidadPaletas: number;
    camadas: number;
    totalRetenida: string;
    defecto: string;
    causas_medidas: string;
    nca: string;
    id_pbo: string;
  }

  const buildSummaryRows = (targetLoteId?: string | null, scope?: 'activos' | 'todos'): SummaryRow[] => {
    let targetLotes: LotePBO[] = [];

    if (targetLoteId) {
      targetLotes = lotes.filter(l => l.id_pbo === targetLoteId);
    } else {
      const activeScope = scope || summaryFilterScope;
      if (activeScope === 'activos') {
        targetLotes = lotes.filter(l => l.estatus_general === 'Abierto' || l.estatus_general !== 'Cerrado');
        if (targetLotes.length === 0) targetLotes = lotes;
      } else {
        targetLotes = lotes;
      }
    }

    const rows: SummaryRow[] = [];

    targetLotes.forEach(loteObj => {
      const lotePalets = paletas.filter(p => p.id_pbo === loteObj.id_pbo);
      const matInfo = findMaterialInfo(loteObj.producto);

      const rawDate = loteObj.creado_el || loteObj.fecha_registro || loteObj.fecha_produccion;
      let mesStr = 'N/A';
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            mesStr = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            mesStr = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
          } else {
            mesStr = String(rawDate);
          }
        } catch {
          mesStr = String(rawDate);
        }
      }

      const causasMedidasStr = [loteObj.causas, loteObj.medidas_correctivas].filter(Boolean).join(' / ') || 'N/A';
      const totalRetenidaStr = `${(loteObj.cantidad_total_latas || 0).toLocaleString('es-ES')} envases`;

      if (lotePalets.length === 0) {
        rows.push({
          material: matInfo.codigo,
          descripcion: matInfo.descripcion,
          formato: loteObj.formato || '12 oz',
          orden: loteObj.orden || 'N/A',
          lote: loteObj.lote,
          tickets: 'N/A',
          mes_creacion: mesStr,
          analista: loteObj.usuario_registro || 'N/A',
          cantidadPaletas: 0,
          camadas: 0,
          totalRetenida: totalRetenidaStr,
          defecto: (loteObj.defecto_general || 'N/D').toUpperCase(),
          causas_medidas: causasMedidasStr,
          nca: 'N/A',
          id_pbo: loteObj.id_pbo,
        });
      } else {
        const groups: Record<string, { tickets: string[]; count: number; camadas: number; defecto: string; nca: string }> = {};

        lotePalets.forEach(p => {
          const ticketClean = cleanTicketStr(p.nro_ticket);
          const defectoClean = p.defecto ? p.defecto.trim() : (loteObj.defecto_general || 'SIN DEFECTO');
          const ncaVal = p.nca ? String(p.nca).trim() : '0';
          const ncaFormatted = ncaVal.endsWith('%') ? ncaVal : `${ncaVal}%`;
          const camadasVal = p.camadas_sueltas || 0;

          // Group by defect and NCA so that loose camadas sum into same row!
          const key = `${defectoClean.toLowerCase()}_${ncaFormatted}`;

          if (!groups[key]) {
            groups[key] = {
              tickets: [],
              count: 0,
              camadas: 0,
              defecto: defectoClean,
              nca: ncaFormatted,
            };
          }
          if (ticketClean && !groups[key].tickets.includes(ticketClean)) {
            groups[key].tickets.push(ticketClean);
          }
          groups[key].count += 1;
          groups[key].camadas += camadasVal;
        });

        Object.values(groups).forEach(g => {
          g.tickets.sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
          });

          rows.push({
            material: matInfo.codigo,
            descripcion: matInfo.descripcion,
            formato: loteObj.formato || '12 oz',
            orden: loteObj.orden || 'N/A',
            lote: loteObj.lote,
            tickets: g.tickets.length > 0 ? g.tickets.join(',') : 'N/A',
            mes_creacion: mesStr,
            analista: loteObj.usuario_registro || 'N/A',
            cantidadPaletas: g.count,
            camadas: g.camadas,
            totalRetenida: totalRetenidaStr,
            defecto: g.defecto.toUpperCase(),
            causas_medidas: causasMedidasStr,
            nca: g.nca,
            id_pbo: loteObj.id_pbo,
          });
        });
      }
    });

    return rows;
  };

  const allSummaryRows = buildSummaryRows(null, summaryFilterScope);
  const filteredSummaryRows = allSummaryRows.filter(r => {
    if (!summarySearch) return true;
    const term = summarySearch.toLowerCase().trim();
    return (
      r.material.toLowerCase().includes(term) ||
      r.descripcion.toLowerCase().includes(term) ||
      r.formato.toLowerCase().includes(term) ||
      r.orden.toLowerCase().includes(term) ||
      r.lote.toLowerCase().includes(term) ||
      r.defecto.toLowerCase().includes(term) ||
      r.tickets.toLowerCase().includes(term) ||
      r.id_pbo.toLowerCase().includes(term)
    );
  });

  const downloadSummaryExcel = () => {
    if (filteredSummaryRows.length === 0) {
      alert("No hay registros en la tabla de resumen para exportar.");
      return;
    }

    const excelData = filteredSummaryRows.map(r => ({
      'MATERIAL': r.material,
      'DESCRIPCION': r.descripcion,
      'FORMATO': r.formato,
      'ORDEN': r.orden,
      'LOTE': r.lote,
      '#TICKET': r.tickets,
      'MES CREACION': r.mes_creacion,
      'ANALISTA': r.analista,
      'CANTIDAD TOTAL DE PALETAS': r.cantidadPaletas,
      'CAMADAS': r.camadas,
      'TOTAL RETENIDA': r.totalRetenida,
      'DEFECTO': r.defecto,
      'CAUSAS Y MEDIDAS': r.causas_medidas,
      'NCA': r.nca
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen PBO");
    XLSX.writeFile(workbook, `Resumen_PBO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const copySummaryToClipboard = () => {
    const headers = ["MATERIAL", "DESCRIPCION", "FORMATO", "ORDEN", "LOTE", "#TICKET", "MES CREACION", "ANALISTA", "CANTIDAD TOTAL DE PALETAS", "CAMADAS", "TOTAL RETENIDA", "DEFECTO", "CAUSAS Y MEDIDAS", "NCA"];
    const tsvRows = filteredSummaryRows.map(r => 
      [r.material, r.descripcion, r.formato, r.orden, r.lote, r.tickets, r.mes_creacion, r.analista, r.cantidadPaletas, r.camadas, r.totalRetenida, r.defecto, r.causas_medidas, r.nca].join("\t")
    );
    const content = [headers.join("\t"), ...tsvRows].join("\n");
    navigator.clipboard.writeText(content);
    setCopiedSummaryToast(true);
    setTimeout(() => setCopiedSummaryToast(false), 2500);
  };

  const generateSummaryPDF = async (targetLoteId?: string | null) => {
    const rows = targetLoteId ? buildSummaryRows(targetLoteId) : filteredSummaryRows;

    if (rows.length === 0) {
      alert('No hay expedientes PBO para generar el resumen.');
      return;
    }

    const totalPaletas = rows.reduce((a, b) => a + b.cantidadPaletas, 0);
    const totalCamadas = rows.reduce((a, b) => a + b.camadas, 0);
    const totalMateriales = new Set(rows.map(r => r.material)).size;

    // Chunk rows into pages to prevent table rows from getting sliced in half on page breaks
    const rowsPerPage1 = 8;
    const rowsPerPageOther = 11;

    const pageChunks: SummaryRow[][] = [];
    if (rows.length <= rowsPerPage1) {
      pageChunks.push(rows);
    } else {
      pageChunks.push(rows.slice(0, rowsPerPage1));
      let offset = rowsPerPage1;
      while (offset < rows.length) {
        pageChunks.push(rows.slice(offset, offset + rowsPerPageOther));
        offset += rowsPerPageOther;
      }
    }

    const totalPages = pageChunks.length;

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const chunk = pageChunks[pageIdx];
        const isFirstPage = pageIdx === 0;

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '1200px';
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '24px';
        container.style.fontFamily = 'Arial, Helvetica, sans-serif';

        let innerHTML = '';

        if (isFirstPage) {
          innerHTML += `
            <div style="background-color: #0f172a; color: #ffffff; padding: 20px 24px; border-radius: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #1e293b;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff;">
                    RESUMEN PBO - CONTROL DE CALIDAD Y DEFECTOS
                  </h1>
                  <span style="background-color: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
                    Auditoría
                  </span>
                </div>
                <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                  Consolidado oficial de materiales retenidos, folios y clasificación de hallazgos
                </p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 11px; color: #cbd5e1; font-weight: 700;">FECHA DE EMISIÓN</p>
                <p style="margin: 2px 0 0 0; font-size: 14px; color: #ffffff; font-weight: 800;">
                  ${new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <!-- KPI Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px;">
              <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Filas Defectos</span>
                <span style="font-size: 18px; font-weight: 900; color: #0f172a;">${rows.length}</span>
              </div>
              <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Paletas</span>
                <span style="font-size: 18px; font-weight: 900; color: #4338ca;">${totalPaletas}</span>
              </div>
              <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Camadas</span>
                <span style="font-size: 18px; font-weight: 900; color: #d97706;">${totalCamadas}</span>
              </div>
              <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Materiales Distintos</span>
                <span style="font-size: 18px; font-weight: 900; color: #059669;">${totalMateriales}</span>
              </div>
            </div>
          `;
        } else {
          innerHTML += `
            <div style="background-color: #0f172a; color: #ffffff; padding: 14px 20px; border-radius: 10px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #1e293b;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <h2 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff;">
                  RESUMEN PBO - CONTROL DE CALIDAD Y DEFECTOS (CONTINUACIÓN)
                </h2>
                <span style="background-color: rgba(255, 255, 255, 0.1); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
                  Página ${pageIdx + 1} de ${totalPages}
                </span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                Fecha: ${new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          `;
        }

        innerHTML += `
          <!-- Main Styled Table -->
          <table style="width: 100%; border-collapse: collapse; font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; color: #000000; border: 2px solid #000000;">
            <thead>
              <tr style="background-color: #CFD8DC; text-align: center; vertical-align: middle; font-weight: 900; height: 38px; border-bottom: 2px solid #000000;">
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 11%; text-transform: uppercase;">MATERIAL</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 23%; text-transform: uppercase;">DESCRIPCION</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 13%;">Lote</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 11%;">#Ticket</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 15%;">Cantidad total de paletas</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 9%;">CAMADAS</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 12%;">Defecto</th>
                <th style="border: 1px solid #000000; padding: 8px 6px; width: 6%;">NCA</th>
              </tr>
            </thead>
            <tbody>
              ${chunk.map(r => `
                <tr style="background-color: #E2EBD8; text-align: center; vertical-align: middle; height: 35px;">
                  <td style="border: 1px solid #000000; padding: 8px 6px; font-weight: 800; font-family: Courier, monospace;">${r.material}</td>
                  <td style="border: 1px solid #000000; padding: 8px 8px; text-transform: uppercase; font-weight: 700; text-align: left;">${r.descripcion}</td>
                  <td style="border: 1px solid #000000; padding: 8px 6px; font-weight: 800; font-family: Courier, monospace;">${r.lote}</td>
                  <td style="border: 1px solid #000000; padding: 8px 6px; font-weight: 600;">${r.tickets}</td>
                  <td style="border: 1px solid #000000; padding: 8px 6px; font-weight: 900; font-size: 12.5px;">${r.cantidadPaletas}</td>
                  <td style="border: 1px solid #000000; padding: 8px 6px; font-weight: 700;">${r.camadas}</td>
                  <td style="border: 1px solid #000000; padding: 8px 8px; text-transform: uppercase; font-weight: 700; text-align: left;">${r.defecto}</td>
                  <td style="border: 1px solid #000000; padding: 8px 6px; font-weight: 900;">${r.nca}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 16px; padding-top: 10px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
            <span style="font-weight: 700;">Línea de Envasado — Sistema de Control de Calidad PBO</span>
            <span style="font-weight: 600;">Página ${pageIdx + 1} de ${totalPages} — Documento Oficial</span>
          </div>
        `;

        container.innerHTML = innerHTML;
        document.body.appendChild(container);

        try {
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 8;
          const maxW = pageWidth - (margin * 2);
          const maxH = pageHeight - (margin * 2);

          let imgWidth = maxW;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (imgHeight > maxH) {
            imgHeight = maxH;
            imgWidth = (canvas.width * imgHeight) / canvas.height;
          }

          const xPos = margin + (maxW - imgWidth) / 2;
          const yPos = margin;

          if (pageIdx > 0) {
            pdf.addPage();
          }

          pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
        } finally {
          document.body.removeChild(container);
        }
      }

      const fileName = targetLoteId 
        ? `Resumen_PBO_${targetLoteId}.pdf` 
        : `Resumen_PBO_Activos_${new Date().toISOString().slice(0, 10)}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('Ocurrió un error al generar el PDF del resumen.');
    }
  };

  // Canvas Drawing for PBO Report
  const drawPboReportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLoteId) return;

    const loteObj = lotes.find(l => l.id_pbo === selectedLoteId);
    if (!loteObj) return;

    const lotePaletas = paletas.filter(p => p.id_pbo === selectedLoteId);
    const loteRepros = reprocesos.filter(r => r.id_pbo === selectedLoteId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We will design a gorgeous high resolution report (width: 800px)
    // Dynamic height calculation
    const headerHeight = 140;
    const detailHeight = 220;
    const palTableHeight = 40 + (lotePaletas.length * 30) + 20;
    const reproTableHeight = loteRepros.length > 0 ? (40 + (loteRepros.length * 30) + 20) : 0;
    const notesHeight = 140;
    const totalHeight = headerHeight + detailHeight + palTableHeight + reproTableHeight + notesHeight + 80;

    canvas.width = 800;
    canvas.height = totalHeight;

    // Background Gradient Slate
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, totalHeight);

    // Header Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, headerHeight);

    // Decorative Orange Strip (Polar Style)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, headerHeight - 8, 800, 8);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillText('Polar - Reporte de Producto Bajo Observación', 40, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`CÓDIGO FOLIO: ${loteObj.id_pbo}`, 40, 75);
    ctx.fillText(`IMPRESO EL: ${new Date().toLocaleString()}`, 40, 95);

    // Status Badge
    ctx.fillStyle = loteObj.estatus_general === 'Abierto' ? '#ef4444' : '#10b981';
    ctx.fillRect(620, 35, 140, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(loteObj.estatus_general === 'Abierto' ? '🔴 EN CUARENTENA' : '🟢 LIBERADO / CERRADO', 690, 54);
    ctx.textAlign = 'left';

    let currentY = headerHeight + 30;

    // Section: Datos Generales
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('1. DATOS GENERALES DEL LOTE', 40, currentY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(40, currentY + 8);
    ctx.lineTo(760, currentY + 8);
    ctx.stroke();

    currentY += 30;

    // Details Grid Layout
    const lotePaletsForDraw = paletas.filter(p => p.id_pbo === loteObj.id_pbo);
    const totalCansOfLoteForDraw = lotePaletsForDraw.reduce((sum, p) => sum + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(loteObj.formato)), 0);

    const details = [
      { label: 'PRODUCTO:', val: loteObj.producto },
      { label: 'LOTE DE ENVASE:', val: loteObj.lote },
      { label: 'ORDEN FABRICACIÓN:', val: loteObj.orden },
      { label: 'PRESENTACIÓN:', val: loteObj.formato },
      { label: 'FECHA DE FABRICACIÓN:', val: loteObj.fecha_produccion },
      { label: 'CANTIDAD (LATAS):', val: totalCansOfLoteForDraw.toLocaleString() },
      { label: 'ALMACÉN ACTUAL:', val: loteObj.ubicacion.toUpperCase() },
      { label: 'REGISTRADO POR:', val: loteObj.usuario_registro }
    ];

    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    
    details.forEach((det, index) => {
      const col = index % 2; // 0 or 1
      const row = Math.floor(index / 2);
      const x = col === 0 ? 50 : 420;
      const y = currentY + (row * 35);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(det.label, x, y);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(det.val, x, y + 16);
    });

    currentY += 160;

    // Section: Paletas Retenidas
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('2. DETALLE DE PALETAS RETENIDAS', 40, currentY);
    ctx.beginPath();
    ctx.moveTo(40, currentY + 8);
    ctx.lineTo(760, currentY + 8);
    ctx.stroke();

    currentY += 25;

    // Draw Table Header
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, currentY, 720, 26);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('ID PALETA', 50, currentY + 17);
    ctx.fillText('TICKET FÍSICO', 180, currentY + 17);
    ctx.fillText('CAMADAS', 330, currentY + 17);
    ctx.fillText('NCA', 420, currentY + 17);
    ctx.fillText('DEFECTO ASOCIADO', 500, currentY + 17);
    ctx.fillText('ESTADO', 680, currentY + 17);

    currentY += 26;

    // Draw Rows
    ctx.font = '11px "JetBrains Mono", monospace';
    lotePaletas.forEach((pal, idx) => {
      // Row zebra background
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f1f5f9';
      ctx.fillRect(40, currentY, 720, 26);

      ctx.fillStyle = '#1e293b';
      ctx.fillText(pal.id, 50, currentY + 17);
      ctx.fillText(pal.nro_ticket, 180, currentY + 17);
      ctx.fillText(pal.camadas_sueltas === 0 ? 'Completa' : `${pal.camadas_sueltas} Cam`, 330, currentY + 17);
      ctx.fillText(`${pal.nca}%`, 420, currentY + 17);
      ctx.fillText(pal.defecto.substring(0, 22) + (pal.defecto.length > 22 ? '...' : ''), 500, currentY + 17);
      
      // Status Badge color
      if (pal.estatus === 'Liberado Directo') ctx.fillStyle = '#10b981';
      else if (pal.estatus === 'Reprocesado') ctx.fillStyle = '#6366f1';
      else if (pal.estatus === 'Desecho') ctx.fillStyle = '#ef4444';
      else ctx.fillStyle = '#f59e0b';
      
      ctx.fillRect(675, currentY + 5, 80, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(pal.estatus.toUpperCase(), 680, currentY + 16);
      ctx.font = '11px "JetBrains Mono", monospace';

      currentY += 26;
    });

    // Draw Reprocess Table if exists
    if (loteRepros.length > 0) {
      currentY += 20;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('3. HISTORIAL DE REPROCESOS / REWORK', 40, currentY);
      ctx.beginPath();
      ctx.moveTo(40, currentY + 8);
      ctx.lineTo(760, currentY + 8);
      ctx.stroke();

      currentY += 25;

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(40, currentY, 720, 26);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('TICKETS CONSUMIDOS', 50, currentY + 17);
      ctx.fillText('NUEVO TICKET', 250, currentY + 17);
      ctx.fillText('DICTAMEN CALIDAD', 420, currentY + 17);
      ctx.fillText('ESTADO LOGÍSTICA', 600, currentY + 17);

      currentY += 26;

      ctx.font = '11px "JetBrains Mono", monospace';
      loteRepros.forEach((rep, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f1f5f9';
        ctx.fillRect(40, currentY, 720, 26);

        ctx.fillStyle = '#1e293b';
        ctx.fillText(rep.tickets_originales_consumidos.substring(0, 28) + (rep.tickets_originales_consumidos.length > 28 ? '...' : ''), 50, currentY + 17);
        ctx.fillText(rep.nuevo_ticket_reprocesado, 250, currentY + 17);
        
        ctx.font = 'bold 10px Inter, sans-serif';
        if (rep.estatus_calidad === 'Aprobado') {
          ctx.fillStyle = '#10b981';
          ctx.fillText('✅ APROBADO', 420, currentY + 17);
        } else if (rep.estatus_calidad === 'Rechazado') {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('❌ RECHAZADO', 420, currentY + 17);
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('⏳ BAJO ANALISIS', 420, currentY + 17);
        }

        if (rep.estatus_logistica === 'Confirmado') {
          ctx.fillStyle = '#10b981';
          ctx.fillText('✔ CONCORDADO', 600, currentY + 17);
        } else if (rep.estatus_logistica === 'Inconsistencia') {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('⚠ INCONSISTENCIA', 600, currentY + 17);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.fillText('⏳ EN TRANSITO', 600, currentY + 17);
        }

        ctx.font = '11px "JetBrains Mono", monospace';
        currentY += 26;
      });
    }

    // Investigation block
    currentY += 20;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('4. INVESTIGACIÓN TÉCNICA Y ACCIONES', 40, currentY);
    ctx.beginPath();
    ctx.moveTo(40, currentY + 8);
    ctx.lineTo(760, currentY + 8);
    ctx.stroke();

    currentY += 25;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, currentY, 720, 100);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(40, currentY, 720, 100);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('CAUSA RAÍZ DIAGNOSTICADA:', 55, currentY + 20);
    ctx.fillText('MEDIDAS CORRECTIVAS ADOPTADAS:', 55, currentY + 60);

    ctx.fillStyle = '#1e293b';
    ctx.font = '11px Inter, sans-serif';
    
    // Wrap text function for causes
    const cText = loteObj.causas || 'Sin registrar causa aún.';
    const aText = loteObj.medidas_correctivas || 'Sin registrar medidas correctivas aún.';
    
    ctx.fillText(cText.substring(0, 110) + (cText.length > 110 ? '...' : ''), 55, currentY + 36);
    ctx.fillText(aText.substring(0, 110) + (aText.length > 110 ? '...' : ''), 55, currentY + 76);

    // Trigger download
    const link = document.createElement('a');
    link.download = `PBO-Expediente-${loteObj.id_pbo}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER WITH SECURITY STATUS */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Módulo Producto Bajo Observación (PBO)</h1>
            <p className="text-xs text-slate-400 mt-1">Control técnico, reproceso y dictámenes para mercancía retenida en envasado.</p>
          </div>
        </div>

        {/* Simplified Analista Identification */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Analista:</span>
            <input
              type="text"
              value={usuarioRegistro}
              onChange={(e) => {
                const val = e.target.value;
                setUsuarioRegistro(val);
                localStorage.setItem('usuario_registro_pbo', val);
              }}
              placeholder="Ingrese su nombre..."
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-bold text-orange-400 uppercase focus:outline-hidden focus:ring-1 focus:ring-orange-500 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* 2. STATS KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PBO abiertos</span>
            <span className="text-lg sm:text-2xl font-black text-slate-800 mt-1 block">{totalPBOActivos}</span>
            <span className="text-[9px] sm:text-[10px] text-red-500 font-semibold block mt-0.5 leading-tight">En cuarentena activa</span>
          </div>
          <div className="bg-red-50 p-2 sm:p-3 rounded-2xl text-red-600 shrink-0">
            <AlertOctagon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paletas Retenidas</span>
            <span className="text-lg sm:text-2xl font-black text-slate-800 mt-1 block">{totalPaletasCuarentena}</span>
            <span className="text-[9px] sm:text-[10px] text-amber-500 font-semibold block mt-0.5 leading-tight">Pendientes</span>
          </div>
          <div className="bg-amber-50 p-2 sm:p-3 rounded-2xl text-amber-500 shrink-0">
            <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paletas por Reprocesar</span>
            <span className="text-lg sm:text-2xl font-black text-indigo-700 mt-1 block">{totalPaletasPendientesReproceso}</span>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold block mt-0.5 leading-tight">En espera</span>
          </div>
          <div className="bg-indigo-50 p-2 sm:p-3 rounded-2xl text-indigo-600 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Latas Retenidas</span>
            <span className="text-lg sm:text-2xl font-black text-slate-800 mt-1 block">{totalLatasRetenidas.toLocaleString()}</span>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 font-semibold block mt-0.5 leading-tight">PBO activos</span>
          </div>
          <div className="bg-emerald-50 p-2 sm:p-3 rounded-2xl text-emerald-600 shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

      </div>

      {/* 3. EXPRESS FINDER / BÚSQUEDA DE EXPEDIENTES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Barcode className="w-4 h-4 text-orange-600" /> Buscador de Expedientes de Calidad (Auditoría Express)
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Ingrese el número de lote (ej: NR6J252A3) o folio PBO (ej: PBO-20260707-01)..."
            value={searchTerm}
            onChange={(e) => handleExpressSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl py-3 px-4 pl-11 text-sm text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500 transition-all font-semibold"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        </div>
        {searchDetailLote && (
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 mt-3 flex items-center justify-between text-xs text-orange-800">
            <div>
              <span className="font-extrabold block">¡Expediente Coincidente Encontrado!</span>
              <span className="mt-0.5 block">
                Folio: <strong className="font-mono">{searchDetailLote.id_pbo}</strong> | Producto: <strong>{searchDetailLote.producto}</strong> | Ubicación: <strong className="uppercase">{searchDetailLote.ubicacion}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedLoteId(searchDetailLote.id_pbo);
                setSearchDetailLote(null);
                setSearchTerm('');
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition-all"
            >
              Abrir Expediente
            </button>
          </div>
        )}
      </div>

      {/* 4. SECTIONS PANEL (Master list vs Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PBO LIST (5 cols) */}
        <div className={`lg:col-span-5 space-y-4 ${selectedLoteId ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 text-indigo-600" /> PBO activos
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSummaryModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Ver y Exportar Tabla Resumen PBO"
                >
                  <FileText className="w-4 h-4" /> Tabla Resumen PBO
                </button>
                {currentRole === 'calidad' && (
                  <button
                    onClick={() => setShowNewLoteModal(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Registrar Retención
                  </button>
                )}
              </div>
            </div>

            {/* Continuous filter controls */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Filtrar Fecha</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 text-slate-700 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Filtrar Turno</label>
                <select
                  value={filterTurno}
                  onChange={(e) => setFilterTurno(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2 text-slate-700 focus:outline-hidden"
                >
                  <option value="">Todos</option>
                  <option value="1">Turno 1 (Día)</option>
                  <option value="2">Turno 2 (Tarde)</option>
                  <option value="3">Turno 3 (Noche)</option>
                </select>
              </div>
            </div>

            {/* Sub-tabs for Activos vs Concluidos */}
            <div className="flex border-b border-slate-200 mb-3 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSidebarTab('activos')}
                className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
                  sidebarTab === 'activos'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                PBO Activos ({lotes.filter(l => l.estatus_general === 'Abierto').length})
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('concluidos')}
                className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
                  sidebarTab === 'concluidos'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Concluidos ({lotes.filter(l => l.estatus_general === 'Cerrado').length})
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {(() => {
                const filteredByTab = sortedFilteredLotes.filter(l => 
                  sidebarTab === 'activos' ? l.estatus_general === 'Abierto' : l.estatus_general === 'Cerrado'
                );

                if (filteredByTab.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                      Ningún expediente {sidebarTab === 'activos' ? 'activo' : 'concluido'} coincide con los criterios.
                    </div>
                  );
                }

                return filteredByTab.map(l => {
                  const isSelected = selectedLoteId === l.id_pbo;
                  return (
                    <div
                      key={l.id_pbo}
                      onClick={() => {
                        setSelectedLoteId(l.id_pbo);
                        setPboTabActive('info');
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50/20 shadow-xs' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{l.id_pbo}</span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] uppercase ${
                            l.estatus_general === 'Abierto' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {l.estatus_general}
                          </span>
                          <button
                            onClick={() => {
                              setFo062TargetLote(l);
                              setShowFo062Modal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-all cursor-pointer"
                            title="Descargar Formato Oficial FO062 Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(l.id_pbo)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded transition-all cursor-pointer"
                            title="Eliminar Expediente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-slate-700 font-bold">{l.producto}</div>
                      <div className="mt-1 flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Lote: <strong className="font-mono text-slate-600">{l.lote}</strong></span>
                        <span>Ubicación: <strong className="text-orange-600 uppercase">{l.ubicacion}</strong></span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Test Seeder Button */}
            {currentRole === 'calidad' && (
              <button
                onClick={handleLlenarDatosPboPrueba}
                className="w-full mt-4 flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 transition-all text-xs font-bold py-2 rounded-xl cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 animate-bounce" />
                Registrar Lote de Prueba PBO
              </button>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: PBO EXPEDIENTE DETAIL (7 cols) */}
        <div className={`lg:col-span-7 ${!selectedLoteId ? 'hidden lg:block' : 'block'}`}>
          {!selectedLoteId ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[400px]">
              <Database className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-extrabold text-slate-700">Ningún Expediente Seleccionado</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Seleccione un folio PBO de la lista lateral o ingrese datos en la búsqueda para consultar o editar la trazabilidad de calidad.
              </p>
            </div>
          ) : (
            (() => {
              if (!activeLote) return null;

              return (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  {/* MOBILE BACK BUTTON */}
                  <div className="lg:hidden mb-2">
                    <button
                      onClick={() => setSelectedLoteId(null)}
                      className="flex items-center gap-1.5 text-xs font-black text-indigo-700 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      ← Volver a la Lista de PBO
                    </button>
                  </div>
                  {/* DETAIL HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-sm">{activeLote.id_pbo}</span>
                        <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase ${
                          activeLote.estatus_general === 'Abierto' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {activeLote.estatus_general}
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-800 mt-2">{activeLote.producto}</h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => {
                          setFo062TargetLote(activeLote);
                          setShowFo062Modal(true);
                        }}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                        title="Descargar Formato Oficial FO062-CM21-CAL Producto No Conforme en Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> PNC
                      </button>

                      <button
                        onClick={() => setShowSummaryModal(true)}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                        title="Ver Tabla Resumen PBO en pantalla"
                      >
                        <FileText className="w-3.5 h-3.5" /> Tabla Resumen PBO
                      </button>

                      <button
                        onClick={drawPboReportImage}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> Descargar PNG
                      </button>

                      {activeLote.estatus_general !== 'Cerrado' && (
                        <button
                          onClick={() => setDeleteConfirmId(activeLote.id_pbo)}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 transition-all cursor-pointer shadow-xs"
                          title="Eliminar Expediente"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar PBO
                        </button>
                      )}
                    </div>
                  </div>

                  {activeLote.estatus_general === 'Cerrado' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs font-bold flex items-center gap-2.5 shadow-xs">
                      <Eye className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="block text-slate-800 uppercase tracking-wider font-extrabold text-[10px]">Expediente Culminado (Cerrado)</span>
                        <p className="font-medium text-[11px] text-amber-700 mt-0.5">Este PBO ha concluido todo su proceso técnico y físico. El sistema lo ha bloqueado en modo de <strong className="font-black text-amber-900">SOLO VISUALIZACIÓN</strong> para resguardar la trazabilidad.</p>
                      </div>
                    </div>
                  )}

                  {/* INTERNAL DETAIL NAV TABS */}
                  <div className="flex border-b border-slate-200 overflow-x-auto">
                    <button
                      onClick={() => setPboTabActive('info')}
                      className={`py-2 px-3.5 font-bold text-xs transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                        pboTabActive === 'info' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      ℹ Datos del Expediente
                    </button>
                    <button
                      onClick={() => setPboTabActive('paletas')}
                      className={`py-2 px-3.5 font-bold text-xs transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                        pboTabActive === 'paletas' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      🥞 Paletas Retenidas ({activeLotePaletas.length})
                    </button>
                    <button
                      onClick={() => setPboTabActive('reproceso')}
                      className={`py-2 px-3.5 font-bold text-xs transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                        pboTabActive === 'reproceso' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      🔄 Reproceso ({activeLoteRepros.length})
                    </button>
                  </div>

                  {/* ACTIVE TAB VIEWS */}
                  
                  {/* TAB 1: GENERAL INFO (DATOS DEL EXPEDIENTE) */}
                  {pboTabActive === 'info' && (() => {
                    const materialReprocesado = activeLotePaletas.filter(p => p.estatus === 'Reprocesado').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const materialSalidaReproceso = activeLoteRepros.reduce((acc, r) => acc + ((r.paletas_nuevas || 0) * getCansPerPallet(activeLote.formato)) + ((r.camadas_sueltas || 0) * getCansPerCamada()), 0);
                    const materialAceptadoDesviacion = activeLotePaletas.filter(p => p.estatus === 'Aceptado Con desviacion').reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const materialConforme = materialSalidaReproceso + materialAceptadoDesviacion;
                    const volumenTotalLatas = activeLotePaletas.reduce((acc, p) => acc + (p.camadas_sueltas > 0 ? (p.camadas_sueltas * getCansPerCamada()) : getCansPerPallet(activeLote.formato)), 0);
                    const materialNoConforme = Math.max(0, volumenTotalLatas - materialConforme);

                    return (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Lote de Envase</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.lote}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Orden Fabricación</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.orden}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Presentación</span>
                          <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLote.formato}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Volumen total latas</span>
                          <span className="font-bold text-slate-800 text-sm mt-0.5 block">{volumenTotalLatas.toLocaleString()} latas</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                          <span className="text-blue-600 block font-bold uppercase text-[9px] tracking-wider">Material Reprocesado</span>
                          <span className="font-bold text-blue-800 text-sm mt-0.5 block">{materialReprocesado.toLocaleString()} latas</span>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                          <span className="text-emerald-600 block font-bold uppercase text-[9px] tracking-wider">Material Conforme</span>
                          <span className="font-bold text-emerald-800 text-sm mt-0.5 block">{materialConforme.toLocaleString()} latas</span>
                        </div>
                        <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                          <span className="text-red-600 block font-bold uppercase text-[9px] tracking-wider">Material No Conforme</span>
                          <span className="font-bold text-red-800 text-sm mt-0.5 block">{materialNoConforme.toLocaleString()} latas</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider mb-1">Defecto Inicial Reportado</span>
                        <span className="font-bold text-slate-700 leading-relaxed block">{activeLote.defecto_general}</span>
                      </div>

                      {/* EXPEDIENTE EDITABLE DETAILS (Aviso de Calidad, Lote de Inspección, Causa) */}
                      <form onSubmit={handleSaveExpedienteData} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            ⚙ Parámetros y Causa del Expediente
                          </span>
                          {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Editable por Calidad
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                              Aviso de Calidad
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 1000284729"
                              value={expedienteEdit.aviso_calidad}
                              onChange={(e) => setExpedienteEdit(prev => ({ ...prev, aviso_calidad: e.target.value }))}
                              disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-800 disabled:opacity-75 focus:bg-white focus:ring-1 focus:ring-orange-500 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                              Lote de Inspección
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 040000018934"
                              value={expedienteEdit.lote_inspeccion}
                              onChange={(e) => setExpedienteEdit(prev => ({ ...prev, lote_inspeccion: e.target.value }))}
                              disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-800 disabled:opacity-75 focus:bg-white focus:ring-1 focus:ring-orange-500 font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                            Causa(s) Identificada(s)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Describa la causa técnica o desviación que originó este expediente de PBO..."
                            value={expedienteEdit.causa}
                            onChange={(e) => setExpedienteEdit(prev => ({ ...prev, causa: e.target.value }))}
                            disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 disabled:opacity-75 focus:bg-white focus:ring-1 focus:ring-orange-500 font-medium"
                          />
                        </div>

                        {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="submit"
                              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              Guardar Datos del Expediente
                            </button>
                          </div>
                        )}
                      </form>

                      <div className="flex gap-4 text-[11px] text-slate-400">
                        <span>Creado el: <strong>{new Date(activeLote.creado_el).toLocaleDateString()}</strong></span>
                        <span>Registrado por: <strong>{activeLote.usuario_registro}</strong></span>
                      </div>
                    </div>
                  )})()
                  }
                  {/* TAB 2: PALETAS RETENIDAS */}
                  {pboTabActive === 'paletas' && (
                    <form onSubmit={handleUpdatePaletas} className="space-y-4">
                      {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
                          <div className="text-xs text-slate-600 font-medium">
                            Administre las paletas de este expediente. Puede añadir nuevos tickets físicos o eliminar existentes si es necesario.
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddPaleta(activeLote.id_pbo, activeLote.defecto_general)}
                            className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                          >
                            <Plus className="w-4 h-4" /> Añadir Paleta
                          </button>
                        </div>
                      )}
                      
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
                              <th className="py-2.5 px-3">Ticket Físico</th>
                              <th className="py-2.5 px-3">Paleta</th>
                              <th className="py-2.5 px-3">Camadas</th>
                              <th className="py-2.5 px-3">NCA</th>
                              <th className="py-2.5 px-3">Defecto específico</th>
                              <th className="py-2.5 px-3">Estatus</th>
                              {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                                <th className="py-2.5 px-3 text-center">Eliminar</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {activeLotePaletas.map((p, idx) => (
                              <tr key={p.id}>
                                <td className="py-1 px-1.5">
                                  <input
                                    type="text"
                                    value={p.nro_ticket}
                                    onChange={(e) => {
                                      const updated = [...paletas];
                                      const pi = updated.findIndex(item => item.id === p.id);
                                      if (pi !== -1) {
                                        updated[pi].nro_ticket = e.target.value;
                                        setPaletas(updated);
                                      }
                                    }}
                                    disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                    className="bg-slate-50 border border-slate-200 text-xs p-1 rounded-md font-mono w-28 disabled:opacity-75"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <span className={`text-xs font-black uppercase tracking-wider ${p.camadas_sueltas === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {p.camadas_sueltas === 0 ? 'Completa ✅' : 'Incompleta ⚠️'}
                                  </span>
                                </td>
                                <td className="py-1 px-1.5">
                                  <input
                                    type="number"
                                    value={p.camadas_sueltas}
                                    onChange={(e) => {
                                      const updated = [...paletas];
                                      const pi = updated.findIndex(item => item.id === p.id);
                                      if (pi !== -1) {
                                        updated[pi].camadas_sueltas = parseInt(e.target.value) || 0;
                                        setPaletas(updated);
                                      }
                                    }}
                                    disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                    className="bg-slate-50 border border-slate-200 text-xs p-1 rounded-md w-16 disabled:opacity-75"
                                  />
                                </td>
                                <td className="py-1 px-1.5">
                                  <input
                                    type="text"
                                    value={p.nca}
                                    onChange={(e) => {
                                      const updated = [...paletas];
                                      const pi = updated.findIndex(item => item.id === p.id);
                                      if (pi !== -1) {
                                        updated[pi].nca = e.target.value;
                                        setPaletas(updated);
                                      }
                                    }}
                                    disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                    className="bg-slate-50 border border-slate-200 text-xs p-1 rounded-md w-16 disabled:opacity-75"
                                  />
                                </td>
                                <td className="py-1 px-1.5">
                                  <input
                                    type="text"
                                    value={p.defecto}
                                    onChange={(e) => {
                                      const updated = [...paletas];
                                      const pi = updated.findIndex(item => item.id === p.id);
                                      if (pi !== -1) {
                                        updated[pi].defecto = e.target.value;
                                        setPaletas(updated);
                                      }
                                    }}
                                    disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                    className="bg-slate-50 border border-slate-200 text-xs p-1 rounded-md w-full min-w-[120px] disabled:opacity-75"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <select
                                    value={p.estatus}
                                    onChange={(e) => handlePaletaStatusChange(p, e.target.value)}
                                    disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                    className="bg-slate-50 border border-slate-200 text-xs p-1 rounded-md disabled:opacity-75 font-semibold text-slate-700"
                                  >
                                    <option value="Sin reprocesar">🔴 Sin reprocesar</option>
                                    <option value="Briqueta">🧱 Briqueta</option>
                                    <option value="Aceptado Con desviacion">⚠️ Aceptado con Desviación</option>
                                    <option value="Reprocesado">🔄 Reprocesado</option>
                                  </select>
                                </td>
                                {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePaleta(p.id, p.nro_ticket)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                      title="Eliminar Paleta"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Actualizar Datos Quirúrgicos
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* TAB 3: REPROCESO / REWORK */}
                  {pboTabActive === 'reproceso' && (
                    <div className="space-y-6">
                      
                      {/* Add Reprocess Form */}
                      {currentRole === 'calidad' && activeLote.estatus_general !== 'Cerrado' && (
                        <form onSubmit={handleAddReproceso} className="bg-orange-50/15 border border-orange-100 p-5 rounded-2xl space-y-4">
                          <h4 className="text-xs font-extrabold text-orange-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-orange-100 pb-2">
                            <RefreshCw className="w-4 h-4" /> Registrar Nuevo Reproceso de Unidad
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                                Paletas Completas
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={reproForm.paletas_nuevas}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                                  setReproForm(prev => ({ ...prev, paletas_nuevas: val }));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                                Camadas Sueltas
                              </label>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={reproForm.camadas_sueltas || ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setReproForm(prev => ({ 
                                    ...prev, 
                                    camadas_sueltas: val,
                                    cantidad_envases: Math.round(val * getCansPerCamada())
                                  }));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-bold"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                                Tickets de las Unidades Reprocesadas (separe por espacios, comas o saltos de línea) - {reproForm.nuevo_ticket_reprocesado.split(/[\s,;\n]+/).filter(t => t.trim().length > 0).length} detectados
                              </label>
                              <textarea
                                placeholder="Ej: TKT-1234, TKT-5678, TKT-9012"
                                rows={2}
                                value={reproForm.nuevo_ticket_reprocesado}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const count = val.split(/[\s,;\n]+/).filter(t => t.trim().length > 0).length;
                                  setReproForm(prev => ({ 
                                    ...prev, 
                                    nuevo_ticket_reprocesado: val,
                                    cantidad_unidades: count > 0 ? count : prev.cantidad_unidades 
                                  }));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-mono font-bold"
                              />
                            </div>

                            {/* Checks / Dictamen de Liberación */}
                            <div className="sm:col-span-2 bg-white p-3.5 border border-slate-200 rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                                  Checks de Liberación de Reproceso
                                </label>
                                {selectedOriginalTickets.length > 0 && (
                                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                                    {selectedOriginalTickets.length} ticket(s) seleccionado(s)
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                                  reproForm.check_liberado ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}>
                                  <label className="flex items-center gap-2 cursor-pointer grow">
                                    <input
                                      type="checkbox"
                                      checked={reproForm.check_liberado}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setReproForm(prev => ({ ...prev, check_liberado: isChecked }));
                                      }}
                                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                    />
                                    <span>✅ Liberado</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setShowTicketsModal(true)}
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all border border-indigo-200 cursor-pointer"
                                  >
                                    {selectedOriginalTickets.length > 0 ? `Modal (${selectedOriginalTickets.length})` : '🔍 Popup'}
                                  </button>
                                </div>

                                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                  reproForm.check_espera_formato ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={reproForm.check_espera_formato}
                                    onChange={(e) => setReproForm(prev => ({ ...prev, check_espera_formato: e.target.checked }))}
                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                  />
                                  <span>📋 A espera de Formato</span>
                                </label>
                              </div>

                              {/* Interactive Ticket Selector Box inside Rework Form */}
                              {(reproForm.check_liberado || selectedOriginalTickets.length > 0) && (
                                <div className="bg-indigo-50/50 border-2 border-indigo-200 rounded-xl p-3 space-y-2.5 animate-fade-in mt-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-[11px] font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Seleccionar Paletas / Tickets a Descontar ({activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar').length} pendientes)
                                      </h5>
                                      <p className="text-[10px] text-indigo-800 font-medium">
                                        Haga clic en las paletas iniciales que se reprocesaron o liberaron en esta tirada:
                                      </p>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const allPending = activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar').map(p => p.nro_ticket);
                                          setSelectedOriginalTickets(allPending);
                                          setReproForm(prev => ({ ...prev, tickets_originales_consumidos: allPending.join(', ') }));
                                        }}
                                        className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md transition-all cursor-pointer"
                                      >
                                        Marcar Todos
                                      </button>
                                      {selectedOriginalTickets.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedOriginalTickets([]);
                                            setReproForm(prev => ({ ...prev, tickets_originales_consumidos: '' }));
                                          }}
                                          className="text-[10px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 px-2 py-1 rounded-md transition-all cursor-pointer border border-rose-300"
                                        >
                                          Limpiar
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar').length === 0 ? (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-center text-xs font-bold">
                                      🎉 ¡No quedan paletas 'Sin reprocesar' pendientes en este lote PBO!
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1 bg-white rounded-lg border border-indigo-100">
                                      {activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar').map(p => {
                                        const isChecked = selectedOriginalTickets.includes(p.nro_ticket);
                                        return (
                                          <div
                                            key={p.id}
                                            onClick={() => {
                                              let updatedTickets = [...selectedOriginalTickets];
                                              if (isChecked) {
                                                updatedTickets = updatedTickets.filter(t => t !== p.nro_ticket);
                                              } else {
                                                updatedTickets.push(p.nro_ticket);
                                              }
                                              setSelectedOriginalTickets(updatedTickets);
                                              setReproForm(prev => ({
                                                ...prev,
                                                tickets_originales_consumidos: updatedTickets.join(', ')
                                              }));
                                            }}
                                            className={`p-2 rounded-lg border cursor-pointer transition-all text-xs flex flex-col justify-between ${
                                              isChecked
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs font-bold'
                                                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800 font-medium'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="font-mono text-xs">{p.nro_ticket}</span>
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 pointer-events-none"
                                              />
                                            </div>
                                            <div className="mt-1 text-[9px] opacity-85 leading-tight">
                                              <div>{p.defecto || 'Sin defecto espec.'}</div>
                                              <div>NCA: {p.nca}</div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Calidad & Observaciones */}
                            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-3.5 border border-slate-200 rounded-xl">
                              <div className="sm:col-span-1">
                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                                  Calidad
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReproForm(prev => ({ ...prev, calidad: 'Cumple' }))}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                                      reproForm.calidad === 'Cumple'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Cumple
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReproForm(prev => ({ ...prev, calidad: 'No Cumple' }))}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                                      reproForm.calidad === 'No Cumple'
                                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    No Cumple
                                  </button>
                                </div>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                                  Obs. (Opcional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Escriba aquí cualquier observación o comentario del reproceso..."
                                  value={reproForm.observaciones || ''}
                                  onChange={(e) => setReproForm(prev => ({ ...prev, observaciones: e.target.value }))}
                                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-hidden text-slate-800 font-medium"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              Registrar Reproceso {reproForm.nuevo_ticket_reprocesado.split(/[\s,;\n]+/).filter(t => t.trim().length > 0).length > 0 ? `(${reproForm.nuevo_ticket_reprocesado.split(/[\s,;\n]+/).filter(t => t.trim().length > 0).length} tickets)` : ''}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Reprocess list: Historial */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Material reprocesado</h3>
                        {activeLoteRepros.length === 0 ? (
                          <div className="text-slate-400 text-xs font-semibold py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                            Ningún lote ha ingresado a reprocesamiento secundario aún.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                                  <th className="py-2.5 px-3">Tickets Generados</th>
                                  <th className="py-2.5 px-3 text-center">Paletas</th>
                                  <th className="py-2.5 px-3 text-center">Camadas</th>
                                  <th className="py-2.5 px-3">Estatus / Checks de Liberación</th>
                                  <th className="py-2.5 px-3">Calidad</th>
                                  <th className="py-2.5 px-3">Obs.</th>
                                  <th className="py-2.5 px-3 text-right">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {activeLoteRepros.map(r => {
                                  const isEditing = editingRepro?.id === r.id;
                                  if (isEditing && editingRepro) {
                                    return (
                                      <tr key={r.id} className="bg-orange-50/20">
                                        <td className="py-2 px-3">
                                          <input
                                            type="text"
                                            value={editingRepro.nuevo_ticket_reprocesado}
                                            onChange={(e) => setEditingRepro({ ...editingRepro, nuevo_ticket_reprocesado: e.target.value.toUpperCase() })}
                                            className="w-full bg-white border border-slate-200 rounded p-1 font-mono text-xs font-bold"
                                          />
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          <input
                                            type="number"
                                            min="0"
                                            value={editingRepro.paletas_nuevas ?? 0}
                                            onChange={(e) => setEditingRepro({ ...editingRepro, paletas_nuevas: parseInt(e.target.value) || 0 })}
                                            className="w-16 bg-white border border-slate-200 rounded p-1 text-center text-xs font-semibold"
                                          />
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={editingRepro.camadas_sueltas}
                                            onChange={(e) => setEditingRepro({ ...editingRepro, camadas_sueltas: parseFloat(e.target.value) || 0 })}
                                            className="w-16 bg-white border border-slate-200 rounded p-1 text-center text-xs font-semibold"
                                          />
                                        </td>
                                        <td className="py-2 px-3">
                                          <div className="space-y-1 text-[10px]">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={editingRepro.check_liberado || false}
                                                onChange={(e) => setEditingRepro({ ...editingRepro, check_liberado: e.target.checked })}
                                                className="rounded text-emerald-600"
                                              />
                                              <span className="font-bold text-emerald-700">Liberado</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={editingRepro.check_espera_formato || false}
                                                onChange={(e) => setEditingRepro({ ...editingRepro, check_espera_formato: e.target.checked })}
                                                className="rounded text-indigo-600"
                                              />
                                              <span className="font-bold text-indigo-700">A espera de Formato</span>
                                            </label>
                                          </div>
                                        </td>
                                        <td className="py-2 px-3">
                                          <select
                                            value={editingRepro.calidad || 'Cumple'}
                                            onChange={(e) => setEditingRepro({ ...editingRepro, calidad: e.target.value as 'Cumple' | 'No Cumple' })}
                                            className="bg-white border border-slate-200 rounded p-1 text-xs font-semibold"
                                          >
                                            <option value="Cumple">Cumple</option>
                                            <option value="No Cumple">No Cumple</option>
                                          </select>
                                        </td>
                                        <td className="py-2 px-3">
                                          <input
                                            type="text"
                                            value={editingRepro.observaciones || ''}
                                            onChange={(e) => setEditingRepro({ ...editingRepro, observaciones: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-medium"
                                            placeholder="Obs."
                                          />
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                          <div className="flex justify-end gap-1.5">
                                            <button
                                              onClick={handleSaveEditedRepro}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                            >
                                              Guardar
                                            </button>
                                            <button
                                              onClick={() => setEditingRepro(null)}
                                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                            >
                                              Cancelar
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return (
                                    <tr key={r.id} className="hover:bg-slate-50/50">
                                      <td className="py-2 px-3 font-mono font-bold text-indigo-700">{r.nuevo_ticket_reprocesado}</td>
                                      <td className="py-2 px-3 text-center font-semibold">{r.paletas_nuevas ?? 0}</td>
                                      <td className="py-2 px-3 text-center font-semibold">{r.camadas_sueltas || '0'}</td>
                                      <td className="py-2 px-3">
                                        <div className="flex flex-wrap items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleReproCheck(r, 'check_liberado')}
                                            disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                              r.check_liberado
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                            title="Clic para activar/desactivar Liberado"
                                          >
                                            ✅ Liberado
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleToggleReproCheck(r, 'check_espera_formato')}
                                            disabled={currentRole !== 'calidad' || activeLote.estatus_general === 'Cerrado'}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                              r.check_espera_formato
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                            title="Clic para activar/desactivar A espera de Formato"
                                          >
                                            📋 A espera de Formato
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                          r.calidad === 'No Cumple'
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                          {r.calidad || 'Cumple'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3">
                                        <span className="text-slate-500 font-medium max-w-[150px] block truncate" title={r.observaciones}>
                                          {r.observaciones || <span className="text-slate-300 italic font-normal">Sin obs.</span>}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        {currentRole === 'calidad' && (
                                          <div className="flex justify-end gap-1.5">
                                            <button
                                              onClick={() => setEditingRepro({ ...r })}
                                              className="text-indigo-600 hover:text-indigo-850 font-bold text-[10px] bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all cursor-pointer"
                                            >
                                              Editar
                                            </button>
                                            <button
                                              onClick={() => handleDeleteReproceso(r)}
                                              className="text-red-600 hover:text-red-850 font-bold text-[10px] bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-all cursor-pointer"
                                            >
                                              Eliminar
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: LOGISTICS & WAREHOUSE */}
                  {pboTabActive === 'traslado' && (
                    <div className="space-y-6">
                      
                      {/* 1. WAREHOUSE stock relocation */}
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-xs">
                        <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider mb-2">Traslado y reubicación física de inventario</span>
                        <p className="text-slate-500 mb-3 leading-relaxed">
                          La mercancía ingresa por defecto en el <strong>Almacen de PBO</strong>. Puede ser movilizada por Logística o Calidad a almacenes intermedios conforme progresa el reproceso.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => activeLote.estatus_general !== 'Cerrado' && handleMoveUbicacion('Almacen de PBO')}
                            disabled={activeLote.estatus_general === 'Cerrado'}
                            className={`flex-1 py-2 px-3 font-bold text-xs rounded-xl border transition-all disabled:opacity-50 ${
                              activeLote.estatus_general === 'Cerrado' ? 'cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              activeLote.ubicacion === 'Almacen de PBO'
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            🚚 Almacén PBO (Retención)
                          </button>
                          <button
                            onClick={() => activeLote.estatus_general !== 'Cerrado' && handleMoveUbicacion('Transicion')}
                            disabled={activeLote.estatus_general === 'Cerrado'}
                            className={`flex-1 py-2 px-3 font-bold text-xs rounded-xl border transition-all disabled:opacity-50 ${
                              activeLote.estatus_general === 'Cerrado' ? 'cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              activeLote.ubicacion === 'Transicion'
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            🔄 En Transición (Rework)
                          </button>
                          <button
                            onClick={() => activeLote.estatus_general !== 'Cerrado' && handleMoveUbicacion('Almacen de PT')}
                            disabled={activeLote.estatus_general === 'Cerrado'}
                            className={`flex-1 py-2 px-3 font-bold text-xs rounded-xl border transition-all disabled:opacity-50 ${
                              activeLote.estatus_general === 'Cerrado' ? 'cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              activeLote.ubicacion === 'Almacen de PT'
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            🏭 Almacén Producto Terminado (PT)
                          </button>
                        </div>
                      </div>

                      {/* 2. PHYSICAL AUDIT VALIDATION */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-orange-600" /> Auditoría de Tickets Físicos de Reproceso
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Logística confirma la existencia física y consistencia del palet en el rack antes de habilitar el despacho de tickets reprocesados.
                        </p>

                        {activeLoteRepros.length === 0 ? (
                          <div className="text-slate-400 text-xs font-semibold py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                            No hay tickets generados post-reproceso para auditar en este expediente.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {activeLoteRepros.map(r => (
                              <div key={r.id} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                  <span className="font-mono font-bold text-slate-800 text-sm block">{r.nuevo_ticket_reprocesado}</span>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-[10px] text-slate-400">NCA: {activeLote.defecto_general.substring(0, 30)}...</span>
                                    {r.check_liberado && (
                                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-extrabold">✅ Liberado</span>
                                    )}
                                    {r.check_espera_formato && (
                                      <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[9px] font-extrabold">📋 A espera de Formato</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase mr-2 ${
                                    r.estatus_logistica === 'Confirmado' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : r.estatus_logistica === 'Inconsistencia' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {r.estatus_logistica}
                                  </span>

                                  {currentRole !== 'public' && activeLote.estatus_general !== 'Cerrado' && (
                                    <>
                                      <button
                                        onClick={() => handleLogisticsValidateTicket(r.id, 'Confirmado')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                      >
                                        Concordado
                                      </button>
                                      <button
                                        onClick={() => handleLogisticsValidateTicket(r.id, 'Inconsistencia')}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                      >
                                        Inconsistencia
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              );
            })()
          )}
        </div>

      </div>

      {/* 5. NEW PBO DIALOG MODAL */}
      {showNewLoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 pb-3 flex-shrink-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                🔬 Ingreso de Producto Bajo Observación
              </h3>
              <button
                onClick={() => setShowNewLoteModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLote} className="flex-1 overflow-y-auto p-5 pt-0 space-y-4 text-xs pb-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="relative">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Código del Producto (SKU)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="🔍 Buscar SKU o nombre..."
                      value={skuSearchQuery}
                      onChange={(e) => {
                        setSkuSearchQuery(e.target.value);
                        setShowSkuDropdown(true);
                      }}
                      onFocus={() => setShowSkuDropdown(true)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    />
                    {newLote.codigo_producto && (
                      <span className="bg-orange-100 text-orange-800 font-mono font-black text-xs px-3 rounded-lg flex items-center shadow-2xs border border-orange-200">
                        {newLote.codigo_producto}
                      </span>
                    )}
                  </div>

                  {showSkuDropdown && (
                    <div className="absolute left-0 right-0 z-40 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {CATALOGO_PRODUCTOS_PBO.filter(p => {
                        const q = skuSearchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q) || p.formato.toLowerCase().includes(q);
                      }).length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 font-semibold text-center">
                          Ningún producto coincide con "{skuSearchQuery}"
                        </div>
                      ) : (
                        CATALOGO_PRODUCTOS_PBO.filter(p => {
                          const q = skuSearchQuery.toLowerCase().trim();
                          if (!q) return true;
                          return p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q) || p.formato.toLowerCase().includes(q);
                        }).slice(0, 40).map(p => (
                          <div
                            key={p.codigo}
                            onClick={() => {
                              setNewLote(prev => ({
                                ...prev,
                                codigo_producto: p.codigo,
                                producto: p.nombre,
                                formato: p.formato
                              }));
                              setSkuSearchQuery(p.codigo);
                              setShowSkuDropdown(false);
                            }}
                            className="p-3 text-xs text-left hover:bg-orange-50 cursor-pointer transition-colors flex flex-col gap-0.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-black text-orange-700">{p.codigo}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-sm">{p.formato}</span>
                            </div>
                            <span className="text-slate-600 font-semibold mt-0.5 leading-snug">{p.nombre}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {showSkuDropdown && (
                    <div 
                      className="fixed inset-0 z-30 bg-transparent" 
                      onClick={() => setShowSkuDropdown(false)}
                    />
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nombre de Producto (Auto-completado)</label>
                  <input
                    type="text"
                    readOnly
                    value={newLote.producto}
                    placeholder="Seleccione un Código de Producto"
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Formato / Presentación (Auto-completado)</label>
                  <input
                    type="text"
                    readOnly
                    value={newLote.formato}
                    placeholder="Formato del producto"
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Código de Lote de Envase</label>
                  <input
                    type="text"
                    placeholder="Ej: NR6J252A3"
                    value={newLote.lote}
                    onChange={(e) => setNewLote(prev => ({ ...prev, lote: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Orden de Fabricación</label>
                  <input
                    type="text"
                    placeholder="Ej: 70161139"
                    value={newLote.orden}
                    onChange={(e) => setNewLote(prev => ({ ...prev, orden: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Fecha de Producción</label>
                  <input
                    type="date"
                    value={newLote.fecha_produccion}
                    onChange={(e) => setNewLote(prev => ({ ...prev, fecha_produccion: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nivel de Calidad Aceptable (NCA) General</label>
                  <input
                    type="text"
                    value={newLote.nca}
                    onChange={(e) => setNewLote(prev => ({ ...prev, nca: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Cantidad de Paletas Retenidas</label>
                  <input
                    type="number"
                    value={newLote.paletas_count}
                    onChange={(e) => setNewLote(prev => ({ ...prev, paletas_count: parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Camadas sueltas (Opcional, de la última paleta)</label>
                  <input
                    type="number"
                    value={newLote.camadas_sueltas}
                    onChange={(e) => setNewLote(prev => ({ ...prev, camadas_sueltas: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                    Aviso de Calidad <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1000284729"
                    value={newLote.aviso_calidad || ''}
                    onChange={(e) => setNewLote(prev => ({ ...prev, aviso_calidad: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                    Lote de Inspección <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 040000018934"
                    value={newLote.lote_inspeccion || ''}
                    onChange={(e) => setNewLote(prev => ({ ...prev, lote_inspeccion: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-700"
                  />
                </div>

              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Defecto Técnico General</label>
                <textarea
                  placeholder="Ej: Decoración defectuosa / Desprendimiento de esmalte en tapa / Exposición metálica excesiva..."
                  value={newLote.defecto_general}
                  onChange={(e) => setNewLote(prev => ({ ...prev, defecto_general: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 h-16"
                />
              </div>

              {/* BUTTON TO GENERATE PALLET LIST */}
              <div className="flex justify-center py-1">
                <button
                  type="button"
                  onClick={handleGeneratePaletasList}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-extrabold px-4 py-3 rounded-2xl border border-indigo-200 shadow-xs transition-all cursor-pointer text-xs"
                >
                  <Layers3 className="w-4 h-4" /> Generar Listado de Paletas para Asignación de Tickets
                </button>
              </div>

              {/* Individual Paletas Customization Table */}
              {modalPaletas.length > 0 ? (
                <div className="border border-indigo-100 rounded-2xl p-4 bg-indigo-50/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-black text-indigo-800 uppercase tracking-wider block">
                      Asignación Detallada de Paletas ({modalPaletas.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Por defecto se hereda el NCA y defecto general
                    </span>
                  </div>
                  
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {modalPaletas.map((mp, idx) => (
                      <div key={mp.index} className="grid grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs items-center">
                        <div className="col-span-12 sm:col-span-3 flex justify-between sm:block border-b sm:border-0 border-slate-100 pb-1 sm:pb-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Paleta</span>
                          <span className="text-xs font-black text-slate-800 block">
                            #{mp.index} {mp.camadas_sueltas > 0 ? '(Sueltas)' : ''}
                          </span>
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5 leading-tight sm:hidden">Nro Ticket</label>
                          <input
                            type="text"
                            value={mp.nro_ticket}
                            placeholder="TKT-#####"
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalPaletas(prev => prev.map(p => p.index === mp.index ? { ...p, nro_ticket: val } : p));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 px-1.5 font-mono font-bold text-[11px] uppercase focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5 leading-tight sm:hidden">NCA</label>
                          <input
                            type="text"
                            value={mp.nca}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalPaletas(prev => prev.map(p => p.index === mp.index ? { ...p, nca: val } : p));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 px-1.5 font-bold text-[11px] focus:bg-white"
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-4">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5 leading-tight sm:hidden">Defecto Paleta</label>
                          <input
                            type="text"
                            value={mp.defecto}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalPaletas(prev => prev.map(p => p.index === mp.index ? { ...p, defecto: val } : p));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 px-1.5 text-[11px] focus:bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 bg-slate-50">
                  <span className="block text-xs font-semibold mb-1">El listado de paletas no ha sido generado aún.</span>
                  <span className="block text-[10px] text-slate-400">Complete los datos superiores y haga clic en "Generar Listado de Paletas".</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLoteModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Ingresar a Base de Datos
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. INTERACTIVE SUMMARY TABLE MODAL */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-auto flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black tracking-wide text-white uppercase">
                      RESUMEN PBO - CONTROL DE CALIDAD Y DEFECTOS
                    </h2>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Auditoría
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Consolidado oficial de materiales retenidos, folios y clasificación de hallazgos
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSummaryModal(false)}
                className="self-end sm:self-auto text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2.5 rounded-2xl transition-all cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Action Bar */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
              
              {/* Scope Switcher & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 grow">
                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex items-center shrink-0">
                  <button
                    onClick={() => setSummaryFilterScope('activos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      summaryFilterScope === 'activos'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    PBO Activos ({lotes.filter(l => l.estatus_general === 'Abierto' || l.estatus_general !== 'Cerrado').length})
                  </button>
                  <button
                    onClick={() => setSummaryFilterScope('todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      summaryFilterScope === 'todos'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                    Todos los PBOs ({lotes.length})
                  </button>
                </div>

                {/* Quick Search */}
                <div className="relative grow max-w-md">
                  <input
                    type="text"
                    value={summarySearch}
                    onChange={(e) => setSummarySearch(e.target.value)}
                    placeholder="Filtrar por material, lote, ticket o defecto..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  {summarySearch && (
                    <button
                      onClick={() => setSummarySearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Export Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => {
                    const target = selectedLoteId ? lotes.find(l => l.id_pbo === selectedLoteId) : (lotes[0] || null);
                    if (target) {
                      setFo062TargetLote(target);
                      setShowFo062Modal(true);
                    } else {
                      alert("Seleccione o tenga un lote PBO registrado para exportar el Formato Oficial FO062.");
                    }
                  }}
                  className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Descargar Formato Oficial FO062-CM21-CAL en Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Formato FO062 (.xlsx)
                </button>

                <button
                  onClick={downloadSummaryExcel}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Descargar archivo Excel con la tabla completa (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Tabla Resumen (.xlsx)
                </button>

                <button
                  onClick={copySummaryToClipboard}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Copiar datos tabulados para pegar en Excel"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Tabla
                </button>

                <button
                  onClick={() => generateSummaryPDF()}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Descargar documento PDF oficial"
                >
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </button>
              </div>
            </div>

            {/* KPI Metrics Row */}
            <div className="bg-slate-100/70 dark:bg-slate-800/40 px-6 py-3 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Total Filas Defectos</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{filteredSummaryRows.length}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Total Paletas</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg">
                  {filteredSummaryRows.reduce((a, b) => a + b.cantidadPaletas, 0)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Total Camadas</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg">
                  {filteredSummaryRows.reduce((a, b) => a + b.camadas, 0)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Materiales Distintos</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg">
                  {new Set(filteredSummaryRows.map(r => r.material)).size}
                </span>
              </div>
            </div>

            {/* Table Content Area */}
            <div className="p-4 sm:p-6 overflow-auto grow">
              {filteredSummaryRows.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
                  <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No se encontraron registros de resumen</p>
                  <p className="text-xs mt-1">Asegúrese de tener expedientes PBO registrados con sus respectivas paletas.</p>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-slate-800 overflow-hidden shadow-xs">
                  <div className="bg-[#CFD8DC] dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-3 text-center border-b-2 border-slate-800">
                    <h3 className="font-black text-sm uppercase tracking-wider">
                      RESUMEN PBO - CONTROL DE CALIDAD Y DEFECTOS
                    </h3>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                      Fecha de emisión: {new Date().toLocaleDateString('es-ES')} — Total de Filas: {filteredSummaryRows.length}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#CFD8DC] dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase text-[10px] text-center tracking-wider border-b-2 border-slate-800">
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">MATERIAL</th>
                          <th className="py-2.5 px-3 border-r border-slate-800 whitespace-nowrap">DESCRIPCION</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">FORMATO</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">ORDEN</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">LOTE</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">#TICKET</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">MES CREACION</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">ANALISTA</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">CANT. TOTAL PALETAS</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">CAMADAS</th>
                          <th className="py-2.5 px-2 border-r border-slate-800 whitespace-nowrap">TOTAL RETENIDA</th>
                          <th className="py-2.5 px-3 border-r border-slate-800 whitespace-nowrap">DEFECTO</th>
                          <th className="py-2.5 px-3 border-r border-slate-800 whitespace-nowrap">CAUSAS Y MEDIDAS</th>
                          <th className="py-2.5 px-2 whitespace-nowrap">NCA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredSummaryRows.map((row, idx) => (
                          <tr 
                            key={`${row.id_pbo}-${idx}`}
                            className="bg-[#E2EBD8] dark:bg-slate-900/90 hover:bg-[#d6e3c9] dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-slate-100 text-center font-medium"
                          >
                            <td className="py-2.5 px-2 border-r border-slate-800 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              {row.material}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-800 font-extrabold uppercase text-slate-900 dark:text-slate-100 text-left">
                              {row.descripcion}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {row.formato}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {row.orden}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-mono font-bold text-slate-900 dark:text-indigo-300 whitespace-nowrap">
                              {row.lote}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {row.tickets}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {row.mes_creacion}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {row.analista}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                              {row.cantidadPaletas}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-bold text-slate-800 dark:text-slate-300 whitespace-nowrap">
                              {row.camadas}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-800 font-bold text-indigo-900 dark:text-indigo-300 text-[11px] whitespace-nowrap">
                              {row.totalRetenida}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-800 font-bold text-slate-900 dark:text-red-300 uppercase text-left">
                              {row.defecto}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-800 text-[11px] font-medium text-slate-800 dark:text-slate-200 text-left max-w-xs">
                              {row.causas_medidas}
                            </td>
                            <td className="py-2.5 px-2 font-black text-slate-900 dark:text-amber-300 whitespace-nowrap">
                              {row.nca}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-900 text-slate-300 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
              <span className="font-medium text-slate-400">
                Línea de Envasado — Sistema de Control de Calidad PBO
              </span>
              <div className="flex items-center gap-3">
                {copiedSummaryToast && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                    <CheckCircle className="w-4 h-4" /> ¡Tabla copiada al portapapeles!
                  </span>
                )}
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cerrar Resumen
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="p-3 bg-red-50 rounded-2xl font-bold">⚠️</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Advertencia Crítica</h3>
                <p className="text-[10px] uppercase font-black tracking-wider text-red-500">Acción Irreversible</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Está completamente seguro de eliminar el expediente <strong className="font-mono text-slate-800">{deleteConfirmId}</strong>? Esta acción eliminará permanentemente todas las paletas registradas, tickets generados y reprocesos asociados de la base de datos. No se podrá recuperar.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                No, cancelar
              </button>
              <button
                type="button"
                onClick={() => executeDeleteLote(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Sí, eliminar expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Select Pending Tickets to Discount when Liberated */}
      {showTicketsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tickets Iniciales a Reprocesar / Descontar
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Marque las paletas pendientes del PBO que fueron consumidas o liberadas en este reproceso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketsModal(false)}
                className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 grow">
              {activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar').length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-6 text-center text-xs font-bold">
                  🎉 ¡Excelente! No quedan tickets 'Sin reprocesar' pendientes en este lote PBO.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeLotePaletas.filter(p => p.estatus === 'Sin reprocesar').map(p => {
                    const isChecked = selectedOriginalTickets.includes(p.nro_ticket);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          let updatedTickets = [...selectedOriginalTickets];
                          if (isChecked) {
                            updatedTickets = updatedTickets.filter(t => t !== p.nro_ticket);
                          } else {
                            updatedTickets.push(p.nro_ticket);
                          }
                          setSelectedOriginalTickets(updatedTickets);
                          setReproForm(prev => ({
                            ...prev,
                            tickets_originales_consumidos: updatedTickets.join(', ')
                          }));
                        }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-xs flex flex-col justify-between ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-sm">{p.nro_ticket}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 pointer-events-none"
                          />
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 leading-tight">
                          <div className="font-semibold text-slate-600 dark:text-slate-400">{p.defecto || 'Sin defecto espec.'}</div>
                          <div className="mt-0.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">NCA: {p.nca}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {selectedOriginalTickets.length} ticket(s) seleccionado(s)
              </span>
              <button
                type="button"
                onClick={() => setShowTicketsModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Aceptar y Guardar Selección
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FO062 OFFICIAL EXCEL FORMAT MODAL */}
      <FO062ExportModal
        isOpen={showFo062Modal}
        onClose={() => setShowFo062Modal(false)}
        lote={fo062TargetLote}
        paletas={paletas}
        reprocesos={reprocesos}
        analistaActual={usuarioRegistro || cabeceraAnalista}
      />

      {/* HIDDEN CANVAS FOR EXPORTS */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

    </div>
  );
}
