import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, X, Check } from 'lucide-react';

interface ExpandableCellProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  rows?: number;
}

export default function ExpandableCell({
  value,
  onChange,
  disabled = false,
  placeholder = '',
  label = 'Editar campo',
  className = '',
  rows = 1,
}: ExpandableCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize inline textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(34, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  // Handle opening modal
  const openModal = () => {
    if (disabled) return;
    setTempValue(value);
    setIsOpen(true);
  };

  // Focus modal textarea when opened
  useEffect(() => {
    if (isOpen && modalTextareaRef.current) {
      setTimeout(() => {
        if (modalTextareaRef.current) {
          modalTextareaRef.current.focus();
          // Move cursor to end
          const len = modalTextareaRef.current.value.length;
          modalTextareaRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }, [isOpen]);

  const handleSave = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Handle escape and ctrl+enter in modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="relative group/cell w-full min-w-[100px] flex items-stretch">
      <textarea
        ref={textareaRef}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDoubleClick={openModal}
        placeholder={placeholder}
        rows={rows}
        className={`w-full pr-7 bg-transparent border border-transparent focus:border-slate-200 focus:bg-white rounded px-2 py-1.5 text-sm outline-hidden resize-none transition-all disabled:text-slate-500 overflow-hidden min-h-[34px] ${className}`}
        style={{ height: 'auto' }}
      />
      
      {!disabled && (
        <button
          type="button"
          onClick={openModal}
          title="Doble clic o pulsa para expandir en pantalla completa"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100/80 transition-all opacity-40 group-hover/cell:opacity-100 focus:opacity-100 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* EXPANSION MODAL (MOBILE FRIENDLY OVERLAY) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={handleCancel}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Editor Ampliado</span>
                <h3 className="text-sm font-bold text-slate-800">{label}</h3>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 flex flex-col">
              <label className="text-xs font-semibold text-slate-400 mb-2 block">
                Escribe aquí (puedes usar varias líneas). Presiona Ctrl + Enter para guardar.
              </label>
              <textarea
                ref={modalTextareaRef}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe el reporte completo aquí..."
                className="w-full flex-1 min-h-[220px] max-h-[60vh] p-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-base outline-hidden transition-all resize-y font-sans leading-relaxed text-slate-800"
              />
              <div className="text-right text-[11px] text-slate-400 mt-2 font-mono">
                {tempValue.length} caracteres
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
