with open('src/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("equipos_medicion?: string;\\n}", "equipos_medicion?: string;\\n  evidencias?: string[];\\n}")

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
