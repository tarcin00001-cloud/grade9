import json

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. LabShell Theme
content = content.replace('bgOverride="bg-slate-950"', 'theme="cosmos"')

# 2 & 3. Bay Borders (Targeted replacement)
content = content.replace(
    '? "border-slate-700 opacity-50"\n                  : "border-slate-700"',
    '? "border-cyan-800/80 bg-cyan-950/20 opacity-50"\n                  : "border-cyan-900/50 bg-cyan-950/10"'
, 1)

content = content.replace(
    '? "border-slate-700 opacity-50"\n                  : "border-slate-700"',
    '? "border-emerald-800/80 bg-emerald-950/20 opacity-50"\n                  : "border-emerald-900/50 bg-emerald-950/10"'
, 1)

content = content.replace(
    ': "border-slate-700 bg-slate-900/50"',
    ': "border-cyan-900/60 bg-slate-900/50"'
, 1)
content = content.replace(
    ': "border-slate-700 bg-slate-900/50"',
    ': "border-emerald-900/60 bg-slate-900/50"'
, 1)

# 4 & 5. Empty Slot Text
content = content.replace('text-slate-600 uppercase tracking-widest text-center px-2">Slot Feature', 'text-slate-400 uppercase tracking-widest text-center px-2">Slot Feature')
content = content.replace('text-slate-600 uppercase tracking-widest text-center px-2">Slot Metric', 'text-slate-400 uppercase tracking-widest text-center px-2">Slot Metric')

# 6. Tray Cards Styling
old_tray_style = """                  // Style logic based on type (but keep it subtle so they have to read)
                  let colorClasses = "border-slate-700 hover:border-slate-500 text-slate-300";
                  if (isSelected) colorClasses = "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] text-white";"""

new_tray_style = """                  // Style logic based on type
                  let colorClasses = "border-slate-700 hover:border-slate-500 text-slate-300 border-t-4 " + (mod.type === "functional" ? "border-t-cyan-500/50" : mod.type === "non-functional" ? "border-t-emerald-500/50" : "border-t-rose-500/50");
                  if (isSelected) colorClasses = "border-amber-400 border-t-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] text-white";"""
content = content.replace(old_tray_style, new_tray_style)

content = content.replace('bg-slate-950 border-2', 'bg-slate-900 border-2')

# 7. Live Simulator Phone Screen
content = content.replace(
    'my-auto bg-black rounded-2xl p-3 border-[6px]',
    'my-auto bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 rounded-2xl p-3 border-[6px]'
)
content = content.replace('text-[10px] text-slate-600 font-bold', 'text-[10px] text-slate-400 font-bold')

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Done")
