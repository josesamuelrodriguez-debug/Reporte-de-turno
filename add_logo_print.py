import re

with open('src/components/TabResumen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """          <div className="flex items-center gap-2.5">
            {/* Elegant Logo Badge */}
            <div className="bg-indigo-600 text-white font-black text-sm px-3 py-1.5 rounded-xl tracking-wider select-none border border-indigo-700">
              SE
            </div>"""

replacement = """          <div className="flex items-center gap-2.5">
            {/* Elegant Logo Badge */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-auto object-contain shrink-0" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
            <div className="bg-indigo-600 text-white font-black text-sm px-3 py-1.5 rounded-xl tracking-wider select-none border border-indigo-700">
              SE
            </div>"""

content = content.replace(target, replacement)

with open('src/components/TabResumen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
