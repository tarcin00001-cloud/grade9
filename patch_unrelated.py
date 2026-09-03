import re

# Fix CloudStrategy16.tsx
try:
    with open('labs/CloudStrategy16.tsx', 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r'playSuccess\([^)]+,\s*[^)]+\)', 'playSuccess()', c)
    c = re.sub(r'playPop\([^)]+,\s*[^)]+\)', 'playPop()', c)
    c = re.sub(r'playError\([^)]+,\s*[^)]+\)', 'playError()', c)
    c = re.sub(r'playZap\([^)]+,\s*[^)]+\)', 'playZap()', c)
    with open('labs/CloudStrategy16.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
except Exception as e:
    pass

# Fix OopPython15.tsx
try:
    with open('labs/OopPython15.tsx', 'r', encoding='utf-8') as f:
        o = f.read()
    if 'lucide-react' in o:
        # just inject AlertTriangle into the first lucide-react import
        o = re.sub(r'import\s+\{', 'import { AlertTriangle, ', o, count=1)
    else:
        o = 'import { AlertTriangle } from "lucide-react";\n' + o
    with open('labs/OopPython15.tsx', 'w', encoding='utf-8') as f:
        f.write(o)
except Exception as e:
    pass
