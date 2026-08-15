import re

with open('src/components/TabPBO.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "                  {/* TAB 4: LAB DICTAMEN */}"
end_str = "                  {/* TAB 5: CAUSAS Y MEDIDAS */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    final_str = content[:start_idx] + content[end_idx:]
    with open('src/components/TabPBO.tsx', 'w', encoding='utf-8') as f:
        f.write(final_str)
    print("Success")
else:
    print("Could not find boundaries")
