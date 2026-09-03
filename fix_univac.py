import os
with open('labs/Univac9.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
if "import * as THREE" not in c:
    c = "import * as THREE from 'three';\n" + c
    with open('labs/Univac9.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
print("Univac fixed")
