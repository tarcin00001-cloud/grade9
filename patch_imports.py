import re

filepath = r'c:\Users\LocalAdmin\working\Dev\Lab9\labs\ContentDeliveryNetwork9.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { AlertTriangle, Zap, Server, Shield } from "lucide-react";', 'import { AlertTriangle, Zap, Server, Shield, ShieldAlert, ShieldCheck } from "lucide-react";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
