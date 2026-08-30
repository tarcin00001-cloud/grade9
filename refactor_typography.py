import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

replacements = [
    # Top Objective Text
    ('text-[11px] sm:text-[13px] font-bold text-slate-200', 'text-[12px] sm:text-[14px] font-semibold text-white'),
    ('text-[10px] text-slate-400 font-bold tracking-wider', 'text-[11px] text-slate-400 font-semibold tracking-wider'),
    
    # Bay Headers
    ('text-[10px] font-black uppercase tracking-widest', 'text-xs font-bold uppercase tracking-[0.15em]'),
    ('text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5', 'text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5'),
    
    # Slotted module text
    ('text-[9px] font-bold text-slate-200 line-clamp-1', 'text-[10px] font-bold text-slate-100 line-clamp-1'),
    ('text-[9px] font-bold text-slate-400 uppercase tracking-widest', 'text-[10px] font-semibold text-slate-400 uppercase tracking-widest'),
    
    # Tray Header
    ('text-[10px] font-black text-slate-500 uppercase tracking-widest', 'text-[11px] font-bold text-slate-400 uppercase tracking-widest'),
    
    # Tray Cards
    ('text-[10px] font-bold truncate leading-tight', 'text-[11px] font-bold text-slate-100 truncate leading-tight'),
    ('text-[9px] font-mono font-bold text-slate-500', 'text-[10px] font-mono font-bold text-slate-400'),
    ('text-[9px] text-slate-400 leading-snug line-clamp-2', 'text-[10px] text-slate-300 leading-relaxed line-clamp-2'),
    ('text-[8px] font-black uppercase tracking-widest', 'text-[9px] font-bold uppercase tracking-wider'),
    ('text-[9px] font-black uppercase tracking-widest', 'text-[10px] font-bold uppercase tracking-wider'),
    
    # Simulator
    ('text-[11px] font-black text-slate-300 uppercase tracking-widest', 'text-xs font-bold text-slate-200 uppercase tracking-[0.15em]'),
    ('text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4', 'text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-4'),
    ('text-[9px] text-slate-500 font-mono', 'text-[10px] text-slate-500 font-mono'),
    
    # Simulator Inner status
    ('text-[13px] font-black text-emerald-400', 'text-[14px] font-bold text-emerald-400'),
    ('text-[11px] font-black uppercase tracking-widest text-indigo-400', 'text-xs font-bold uppercase tracking-widest text-indigo-400'),
    ('text-[11px] font-black text-rose-400 uppercase tracking-widest mt-1', 'text-xs font-bold text-rose-400 uppercase tracking-widest mt-1'),
    
    # Action Button
    ('font-black text-[11px]', 'font-bold text-xs'),
    ('bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800', 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-indigo-900 shadow-lg shadow-indigo-500/25')
]

for old_str, new_str in replacements:
    content = content.replace(old_str, new_str)

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Formatting applied successfully.")
