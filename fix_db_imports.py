with open('src/db.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix import
target = "  Reproceso\\n} from './types';"
new_target = "  Reproceso,\\n  RocePrueba\\n} from './types';"
content = content.replace(target, new_target)

# Fix supabase client
content = content.replace("if (import.meta.env.VITE_USE_SUPABASE === 'true' && supabase) {", "const supabase = getSupabaseClient();\\n  if (supabase) {")

with open('src/db.ts', 'w', encoding='utf-8') as f:
    f.write(content)
