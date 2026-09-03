import os
with open('labs/Univac9.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("import * as THREE from 'three';\n", "")
if '"use client";' in c:
    c = c.replace('"use client";', '"use client";\nimport * as THREE from \'three\';')

with open('labs/Univac9.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Univac fixed properly")
