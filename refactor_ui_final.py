import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

replacements = [
    # 1. Glassmorphism for Containers (Blend better with the Cosmos background)
    ('bg-slate-900/80 backdrop-blur rounded-2xl border-2', 'bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 border-white/10'),
    ('bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700', 'bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10'),
    ('bg-slate-900 rounded-3xl border border-slate-700', 'bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10'),
    
    # 2. Adaptive Grid (Fixes awkward 5-column empty spaces and truncated titles)
    ('overflow-hidden grid grid-cols-3 xl:grid-cols-5 gap-2', 'overflow-hidden grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5'),
    
    # 3. Card Interactivity & Select Affordance
    ('hover:bg-slate-800 active:scale-95', 'hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 group'),
    ('text-indigo-500">', 'text-indigo-400 transition-colors group-hover:text-white bg-indigo-500/10 group-hover:bg-indigo-500/30 px-2 py-0.5 rounded-full">'),
    
    # 4. Phone Simulator Realism (Adding a notch and inner glass bezel)
    ('bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 rounded-2xl p-3 border-[6px]', 
     'bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black rounded-[1.5rem] p-3 border-[6px] border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden'),
    
    # Insert Notch into Phone (Find the Phone Status Bar and prepend notch)
    ('{/* Phone Status Bar */}', 
     '{/* iPhone Notch */}\n              <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-20"><div className="w-24 h-full bg-slate-800 rounded-b-xl shadow-sm"></div></div>\n\n              {/* Phone Status Bar */}'),
    
    # 5. Make empty slots look more inviting
    ('text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center px-2">Slot Feature',
     'text-[10px] font-semibold text-cyan-500/40 uppercase tracking-widest text-center px-2">Slot Feature'),
    ('text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center px-2">Slot Metric',
     'text-[10px] font-semibold text-emerald-500/40 uppercase tracking-widest text-center px-2">Slot Metric')
]

for old_str, new_str in replacements:
    content = content.replace(old_str, new_str)

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("UI/UX Enhancements applied successfully.")
