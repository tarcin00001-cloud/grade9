import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

old_tray = '''              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3 shrink-0">
                Blueprint Repository ({trayModules.length} Available)
              </span>
              
              <div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 w-full">
                {trayModules.map((id) => {'''

new_tray = '''              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3 shrink-0">
                Blueprint Repository ({trayModules.length} Available)
              </span>
              
              <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-2 pr-1 content-start">
                {trayModules.map((id) => {'''

content = content.replace(old_tray, new_tray)

# Fallback if line endings differ
if old_tray not in content:
    # Try regex approach
    import re
    content = re.sub(
        r'Blueprint Repository \(\{trayModules\.length\} Available\)\s*</span>\s*<div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 w-full">\s*\{trayModules\.map',
        'Blueprint Repository ({trayModules.length} Available)\n              </span>\n              \n              <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-2 pr-1 content-start">\n                {trayModules.map',
        content
    )

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Tray restored to wrapping grid.")
