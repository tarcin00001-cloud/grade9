import os

# Fix Gpu9.tsx
with open('labs/Gpu9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('"""use client""";', '"use client";')
with open('labs/Gpu9.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix Cloudflare9.tsx
with open('labs/cloudflare9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace actual newlines inside the string with \n literal
bad_str = '''{cpuLoad > 80 ? "x,y,z... no '='
x,y... no '='
x... no '='
(Backtracking...)" : "Match failed instantly. (Safe)"}'''

good_str = '{cpuLoad > 80 ? "x,y,z... no \'=\'\\nx,y... no \'=\'\\nx... no \'=\'\\n(Backtracking...)" : "Match failed instantly. (Safe)"}'

content = content.replace(bad_str, good_str)

with open('labs/cloudflare9.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Syntax fixed!")
