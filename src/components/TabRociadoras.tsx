import React, { useState } from 'react';
import { Pipette, Paintbrush, RefreshCw, Trash2, Clock, Check, Plus } from 'lucide-react';
import { IdentificacionRociadoras } from '../types';

interface TabRociadorasProps {
  rociadoras: IdentificacionRociadoras[];
  onChangeRociadoras: (roc: IdentificacionRociadoras[]) => void;
  editable: boolean;
}

const MAQUINAS_L1 = ['11', '12', '13', '14', '15'];
const MAQUINAS_L3 = ['31', '32', '33', '34', '35', '36', '37', '38'];

// Predefined colors for fast picking
const COLOR_PRESETS = [
  { name: 'Rojo', hex: '#EF4444', textClass: 'text-white' },
  { name: 'Azul', hex: '#3B82F6', textClass: 'text-white' },
  { name: 'Verde', hex: '#10B981', textClass: 'text-white' },
  { name: 'Amarillo', hex: '#EAB308', textClass: 'text-slate-900' },
  { name: 'Naranja', hex: '#F97316', textClass: 'text-white' },
  { name: 'Negro', hex: '#1E293B', textClass: 'text-white' },
  { name: 'Morado', hex: '#8B5CF6', textClass: 'text-white' },
  { name: 'Marrón', hex: '#78350F', textClass: 'text-white' }
];

export default function TabRociadoras({
  rociadoras,
  onChangeRociadoras,
  editable
}: TabRociadorasProps) {

  // Current line hours (defaults to current time)
  const getInitialTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [horaL1, setHoraL1] = useState(getInitialTime());
  const [horaL3, setHoraL3] = useState(getInitialTime());

  // Retrieve all checks for a machine
  const getChecksForMachine = (linea: string, maquina: string): IdentificacionRociadoras[] => {
    return rociadoras.filter(r => r.linea === linea && r.maquina === maquina);
  };

  // Toggle color preset check at the current line hour
  const togglePresetColor = (linea: string, maquina: string, colorName: string) => {
    if (!editable) return;
    const lineHour = linea === 'Linea 1' ? horaL1 : horaL3;
    
    // Check if check exists at exact hour and color
    const existingIndex = rociadoras.findIndex(
      r => r.linea === linea && r.maquina === maquina && r.color.toLowerCase() === colorName.toLowerCase() && r.hora === lineHour
    );

    if (existingIndex !== -1) {
      // Remove it
      const updated = rociadoras.filter((_, idx) => idx !== existingIndex);
      onChangeRociadoras(updated);
    } else {
      // Add it
      const updated = [
        ...rociadoras,
        { linea, maquina, color: colorName, hora: lineHour }
      ];
      onChangeRociadoras(updated);
    }
  };

  // Add custom color for a machine at the current line hour
  const addCustomColor = (linea: string, maquina: string, colorName: string) => {
    if (!editable || !colorName.trim()) return;
    const lineHour = linea === 'Linea 1' ? horaL1 : horaL3;

    // Avoid duplicate check for same hour and color
    const exists = rociadoras.some(
      r => r.linea === linea && r.maquina === maquina && r.color.toLowerCase() === colorName.trim().toLowerCase() && r.hora === lineHour
    );

    if (!exists) {
      const updated = [
        ...rociadoras,
        { linea, maquina, color: colorName.trim(), hora: lineHour }
      ];
      onChangeRociadoras(updated);
    }
  };

  // Delete a specific check for a machine
  const removeCheckValue = (linea: string, maquina: string, checkIndex: number) => {
    if (!editable) return;
    const machineChecks = rociadoras.filter(r => r.linea === linea && r.maquina === maquina);
    if (checkIndex < 0 || checkIndex >= machineChecks.length) return;
    
    const targetCheck = machineChecks[checkIndex];
    const updated = rociadoras.filter(r => r !== targetCheck);
    onChangeRociadoras(updated);
  };

  const clearAllColors = () => {
    if (!editable) return;
    if (window.confirm('¿Está seguro de limpiar todos los registros de color de las rociadoras?')) {
      onChangeRociadoras([]);
    }
  };

  const renderMachineCard = (linea: string, maquina: string) => {
    const checks = getChecksForMachine(linea, maquina);
    const lineHour = linea === 'Linea 1' ? horaL1 : horaL3;

    return (
      <div 
        key={`${linea}_${maquina}`}
        className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3.5 shadow-xs ${
          checks.length > 0 ? 'border-indigo-150 bg-indigo-50/5' : 'border-slate-200'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${checks.length > 0 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-350'}`} />
            <span className="font-bold text-slate-800 text-sm">Máquina {maquina}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            {linea === 'Linea 1' ? 'L1' : 'L3'}
          </span>
        </div>

        {/* Visual List of Active Checks on this machine */}
        <div className="space-y-1.5 min-h-[40px]">
          {checks.length === 0 ? (
            <div className="text-center py-2.5">
              <p className="text-xs text-slate-400 italic">Sin registros de color</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {checks.map((chk, idx) => {
                const matchedPreset = COLOR_PRESETS.find(
                  p => p.name.toLowerCase() === chk.color.trim().toLowerCase()
                );
                const circleBg = matchedPreset ? matchedPreset.hex : '#A855F7'; // Purple fallback for custom

                return (
                  <div 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-150 pl-1.5 pr-1 py-0.5 rounded-md text-[11px] font-medium text-slate-700 shadow-xs"
                  >
                    <span 
                      className="w-2 h-2 rounded-full border border-slate-300" 
                      style={{ backgroundColor: circleBg }}
                    />
                    <span>{chk.color}</span>
                    <span className="text-slate-400 text-[10px]">({chk.hora})</span>
                    {editable && (
                      <button
                        onClick={() => removeCheckValue(linea, maquina, idx)}
                        className="p-0.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors ml-0.5"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Color Presets Buttons */}
        {editable && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Color preset:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_PRESETS.map(preset => {
                const isChecked = checks.some(
                  c => c.color.toLowerCase() === preset.name.toLowerCase() && c.hora === lineHour
                );

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePresetColor(linea, maquina, preset.name)}
                    className={`relative w-full h-8 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200 border hover:scale-105 active:scale-95 ${
                      isChecked 
                        ? 'ring-2 ring-indigo-500 ring-offset-1 border-transparent shadow-md' 
                        : 'border-slate-200 shadow-xs'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={`Click para alternar ${preset.name} a las ${lineHour}`}
                  >
                    {isChecked ? (
                      <Check className={`w-4 h-4 font-bold ${preset.textClass}`} />
                    ) : (
                      <span className={`text-[9px] font-extrabold select-none opacity-85 ${preset.textClass}`}>
                        {preset.name.substring(0, 3)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Color Input */}
        {editable && (
          <div className="pt-2 border-t border-slate-50">
            <div className="flex items-center gap-1">
              <Paintbrush className="w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Otro color + Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.currentTarget;
                    const val = target.value.trim();
                    if (val) {
                      addCustomColor(linea, maquina, val);
                      target.value = ''; // Reset input
                    }
                  }
                }}
                className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-xs flex-1 outline-hidden"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
              <Pipette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Identificación de Rociadoras (Marcas de Calidad)</h2>
              <p className="text-sm text-slate-500">Registro visual de la tinta de marcaje utilizada por cada rociadora para control de lotes impresos.</p>
            </div>
          </div>
          {editable && rociadoras.length > 0 && (
            <button
              onClick={clearAllColors}
              className="flex items-center gap-1 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar Todo
            </button>
          )}
        </div>
      </div>

      {/* COLUMNS PER LINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LINEA 1 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6 flex flex-col h-full">
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-5 bg-indigo-600 rounded-xs" />
                LÍNEA 1
              </h3>
              <p className="text-xs text-slate-400">Rociadoras activas de Línea 1.</p>
            </div>
            
            {/* General Line Time input */}
            <div className="flex items-center gap-2 bg-slate-50 pl-2.5 pr-2 py-1.5 rounded-xl border border-slate-150 shadow-2xs self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hora Inspección L1:</span>
              <input
                type="time"
                disabled={!editable}
                value={horaL1}
                onChange={(e) => setHoraL1(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800 font-bold outline-hidden w-[75px]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MAQUINAS_L1.map(mq => renderMachineCard('Linea 1', mq))}
          </div>
        </div>

        {/* LINEA 3 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6 flex flex-col h-full">
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-5 bg-indigo-600 rounded-xs" />
                LÍNEA 3
              </h3>
              <p className="text-xs text-slate-400">Rociadoras activas de Línea 3.</p>
            </div>
            
            {/* General Line Time input */}
            <div className="flex items-center gap-2 bg-slate-50 pl-2.5 pr-2 py-1.5 rounded-xl border border-slate-150 shadow-2xs self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hora Inspección L3:</span>
              <input
                type="time"
                disabled={!editable}
                value={horaL3}
                onChange={(e) => setHoraL3(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800 font-bold outline-hidden w-[75px]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MAQUINAS_L3.map(mq => renderMachineCard('Linea 3', mq))}
          </div>
        </div>

      </div>
    </div>
  );
}
