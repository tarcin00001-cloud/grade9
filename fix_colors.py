import re

with open('labs/CrossSiteScripting9.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('theme="cosmos"', 'theme="ocean"')
code = code.replace('bg-slate-900/80', 'bg-white/95')
code = code.replace('border-slate-700/60', 'border-4 border-blue-200/50')
code = code.replace('bg-slate-800/80', 'bg-blue-100')
code = code.replace('text-slate-300', 'text-blue-950')
code = code.replace('text-slate-500', 'text-blue-500')
code = code.replace('bg-slate-950/80', 'bg-blue-50/80')
code = code.replace('bg-slate-950/90', 'bg-white')
code = code.replace('bg-slate-950', 'bg-blue-50')
code = code.replace('bg-slate-900', 'bg-white')
code = code.replace('bg-slate-800', 'bg-blue-100')
code = code.replace('bg-slate-700', 'bg-blue-500')
code = code.replace('border-slate-800', 'border-blue-300')
code = code.replace('border-slate-700', 'border-blue-300')
code = code.replace('border-slate-600', 'border-blue-400')
code = code.replace('border-slate-500', 'border-blue-400')
code = code.replace('text-slate-400', 'text-blue-600')
code = code.replace('text-slate-600', 'text-blue-700')
code = code.replace('bg-cyan-500', 'bg-amber-400')
code = code.replace('hover:bg-cyan-400', 'hover:bg-amber-300')
code = code.replace('text-cyan-950', 'text-amber-950')
code = code.replace('border-cyan-700', 'border-amber-600')
code = code.replace('text-cyan-400', 'text-blue-600')

with open('labs/CrossSiteScripting9.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
