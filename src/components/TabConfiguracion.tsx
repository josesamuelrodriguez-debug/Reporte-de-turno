import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, Server, ShieldCheck, Key, HelpCircle } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, isSupabaseConnected, getSqlSchema, getSupabaseClient } from '../db';

interface TabConfiguracionProps {
  onConfigChanged: () => void;
}

export default function TabConfiguracion({ onConfigChanged }: TabConfiguracionProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const config = getSavedSupabaseConfig();
    if (config) {
      setUrl(config.url);
      setAnonKey(config.anonKey);
    }
    setConnected(isSupabaseConnected());
  }, []);

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Por favor introduzca tanto la URL como la Clave Anon.');
      return;
    }
    saveSupabaseConfig(url.trim(), anonKey.trim());
    setConnected(true);
    setTestStatus('idle');
    onConfigChanged();
    alert('¡Configuración de Supabase guardada correctamente! La aplicación ahora intentará conectarse.');
  };

  const handleClear = () => {
    if (window.confirm('¿Está seguro de desconectar Supabase? El sistema volverá a usar el almacenamiento local integrado.')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setConnected(false);
      setTestStatus('idle');
      onConfigChanged();
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    
    // Save temporarily if changed
    if (url.trim() && anonKey.trim()) {
      saveSupabaseConfig(url.trim(), anonKey.trim());
      onConfigChanged();
    }

    const client = getSupabaseClient();
    if (!client) {
      setTestStatus('error');
      setErrorMessage('Cliente Supabase no inicializado. Rellene los campos correctamente.');
      return;
    }

    try {
      // Try to query the analistas table
      const { data, error } = await client.from('analistas').select('nombre').limit(1);
      
      if (error) {
        throw error;
      }
      
      setTestStatus('success');
      setConnected(true);
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setErrorMessage(err.message || 'Error desconocido al conectar. Verifique que creó las tablas en Supabase.');
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(getSqlSchema());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* SECCION 1: CONECTOR DIRECTO */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Conexión a Base de Datos Supabase (Nube)</h2>
              <p className="text-sm text-slate-500">Sincronice sus reportes de turno con PostgreSQL. En Vercel, use variables de entorno.</p>
            </div>
          </div>

          <div>
            {connected ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" /> CONECTADO A NUBE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                <Server className="w-4 h-4" /> ALMACENAMIENTO LOCAL ACTIVO
              </span>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-400" /> Supabase URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tu-proyecto.supabase.co"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-3 text-sm transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-slate-400" /> Supabase Anon Key (API Public Key)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-3 text-sm transition-all outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-md shadow-indigo-100"
            >
              Guardar Configuración
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all border border-slate-200 disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'Probando...' : 'Probar Conexión'}
            </button>
          </div>
          
          {connected && (
            <button
              onClick={handleClear}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg transition-all cursor-pointer"
            >
              Desconectar Supabase (Usar Local)
            </button>
          )}
        </div>

        {/* Feedbacks de pruebas */}
        {testStatus === 'success' && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            ✔ ¡Conexión exitosa! Las tablas existen y se leyeron los datos de Supabase correctamente.
          </div>
        )}
        {testStatus === 'error' && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <p className="font-bold">❌ Error al conectar a la base de datos:</p>
            <p className="font-mono text-[11px] bg-white p-2 rounded-md border border-rose-100">{errorMessage}</p>
            <p className="text-slate-500 mt-2">Asegúrese de haber ejecutado el script SQL que se muestra a continuación en la consola SQL de su proyecto Supabase.</p>
          </div>
        )}
      </div>

      {/* SECCION 2: DESPLIEGUE EN VERCEL & GITHUB */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
          <HelpCircle className="w-5 h-5 text-indigo-600" /> Guía para Despliegue en Vercel, GitHub y Supabase
        </h3>
        
        <div className="text-xs text-slate-600 space-y-4">
          <p>
            Esta aplicación está diseñada para compilar de forma estática en <strong>Vercel</strong> y conectarse directamente a su base de datos <strong>Supabase</strong> sin necesidad de un servidor intermedio complicado.
          </p>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800 text-sm block mb-1">1. Subir a GitHub</span>
              <p>Suba este código fuente a un repositorio en su cuenta de GitHub. Asegúrese de que incluya los archivos de configuración de Vite y Tailwind.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800 text-sm block mb-1">2. Importar en Vercel</span>
              <p>Cree un nuevo proyecto en Vercel e impórtelo desde su repositorio de GitHub. Seleccione el framework preset <strong>Vite</strong>.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800 text-sm block mb-1">3. Variables en Vercel</span>
              <p>En el panel de Vercel, configure las siguientes variables de entorno para que se conecte automáticamente:</p>
              <div className="bg-slate-800 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] mt-2 space-y-1">
                <div>VITE_SUPABASE_URL=tu_url_supabase</div>
                <div>VITE_SUPABASE_ANON_KEY=tu_anon_key</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCION 3: CODIGO SQL EDITOR */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Estructura SQL para Supabase (SQL Editor)</h3>
            <p className="text-xs text-slate-500">Copie y ejecute este script en el editor SQL de Supabase para generar todas las tablas de control automáticamente.</p>
          </div>
          <button
            onClick={copySql}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar SQL
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-auto max-h-[300px] border border-slate-900 leading-relaxed shadow-inner">
          {getSqlSchema()}
        </pre>
      </div>

    </div>
  );
}
