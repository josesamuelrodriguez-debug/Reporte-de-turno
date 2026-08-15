with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace("import { TabConfiguracion } from './components/TabConfiguracion';", "import { TabConfiguracion } from './components/TabConfiguracion';\nimport { TabRoce } from './components/TabRoce';")

# Change useState
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'general' | 'calidad' | 'seguimiento' | 'rociadoras' | 'resumen' | 'historial' | 'configuracion'>('general');",
    "const [activeTab, setActiveTab] = useState<'general' | 'calidad' | 'seguimiento' | 'rociadoras' | 'roce' | 'resumen' | 'historial' | 'configuracion'>('general');"
)

# Add button
target1 = "🎨 Rociadoras\n            </button>"
nav_rociadoras_end = content.find(target1)
if nav_rociadoras_end != -1:
    nav_rociadoras_end += len(target1)
    new_button = """
            <button
              onClick={() => setActiveTab('roce')}
              className={`py-4 px-5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'roce' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🔄 Roce
            </button>"""
    content = content[:nav_rociadoras_end] + new_button + content[nav_rociadoras_end:]

# Add rendering logic
target2 = "<TabRociadoras\n                    rociadoras={rociadoras}\n                    onChangeRociadoras={setRociadoras}\n                    editable={editable}\n                  />\n                )}"
render_rociadoras_end = content.find(target2)
if render_rociadoras_end != -1:
    render_rociadoras_end += len(target2)
    new_tab = """

                {activeTab === 'roce' && (
                  <TabRoce
                    cabeceraFecha={cabecera.fecha}
                    cabeceraTurno={cabecera.turno}
                    usuarioRegistro={currentRole === 'calidad' ? 'INSPECTOR CALIDAD' : 'OPERADOR'}
                  />
                )}"""
    content = content[:render_rociadoras_end] + new_tab + content[render_rociadoras_end:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
