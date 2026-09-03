import re

filepath = 'labs/ResponsibleAI23.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the text container
old_text_container = 'className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 flex flex-col justify-center border-2 border-slate-200 shadow-sm relative overflow-y-auto"'
new_text_container = 'className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl p-5 md:p-6 flex flex-col justify-center border-2 border-slate-200 shadow-sm relative overflow-hidden"'

# Fix the text sizing to prevent clipping
old_text_h2 = 'className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest mb-4 leading-tight"'
new_text_h2 = 'className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest mb-2 md:mb-3 leading-tight"'

old_text_p = 'className="text-base md:text-lg text-slate-600 font-medium leading-relaxed"'
new_text_p = 'className="text-sm md:text-base text-slate-600 font-medium leading-relaxed"'

old_icon_div = 'className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center border-2 border-sky-100 mb-6 shadow-sm"'
new_icon_div = 'className="w-10 h-10 md:w-12 md:h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center border-2 border-sky-100 mb-4 shadow-sm shrink-0"'

content = content.replace(old_text_container, new_text_container)
content = content.replace(old_text_h2, new_text_h2)
content = content.replace(old_text_p, new_text_p)
content = content.replace(old_icon_div, new_icon_div)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Scrollbar fix applied!")
