import re
import os

filepath = r'c:\Users\LocalAdmin\working\Dev\Lab9\labs\ContentDeliveryNetwork9.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. LMS Bridge Fix
content = content.replace('useLMSBridge("cdn-9")', 'useLMSBridge("contentdeliverynetwork9")')
content = content.replace('labId="cdn-9"', 'labId="contentdeliverynetwork9"')

# 2. Typography Fixes
content = content.replace('text-[6px]', 'text-[8.5px]')
content = content.replace('text-[6.5px]', 'text-[9px]')
content = content.replace('text-[7px]', 'text-[10px]')
content = content.replace('text-[7.5px]', 'text-[10.5px]')
content = content.replace('text-[8px]', 'text-[11px]')

# 3. Add lucide icons
content = content.replace('import { useLMSBridge } from "@/hooks/useLMSBridge";', 'import { useLMSBridge } from "@/hooks/useLMSBridge";\nimport { AlertTriangle, Zap, Server, Shield } from "lucide-react";')

# 4. Fix layout grid
content = content.replace('className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] flex flex-col', 'className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] grid grid-cols-2 md:flex md:flex-col')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Basic replacements done.')
