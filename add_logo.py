import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl tracking-wider shadow-lg shadow-indigo-100 shrink-0">
              SE
            </div>"""

replacement = """          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 sm:h-10 w-auto object-contain shrink-0" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
            <div className="bg-indigo-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl tracking-wider shadow-lg shadow-indigo-100 shrink-0">
              SE
            </div>"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
