with open('src/db.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Reproceso,\\n  RocePrueba", "Reproceso")
content = content.replace("Reproceso,\n  RocePrueba", "Reproceso")

with open('src/db.ts', 'w', encoding='utf-8') as f:
    f.write(content)
