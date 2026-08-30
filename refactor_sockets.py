import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# Fix the container for both sockets
old_grid = '<div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-1 pr-1">'
new_flex = '<div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 w-full">'
content = content.replace(old_grid, new_flex)

# Make the children wrap nicely on mobile but stretch fully on desktop
old_child = 'className={`flex-1 min-w-0 h-12'
new_child = 'className={`flex-1 min-w-[45%] lg:min-w-0 h-12'
content = content.replace(old_child, new_child)

# Also fix the text wrap issue inside the empty sockets
old_empty_text = '<span className="text-[10px] font-semibold text-emerald-700/60 uppercase tracking-widest text-center px-2">Performance Goal</span>'
new_empty_text = '<span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700/60 uppercase tracking-widest text-center px-1">Performance Goal</span>'
content = content.replace(old_empty_text, new_empty_text)

old_empty_text_f = '<span className="text-[10px] font-semibold text-cyan-700/60 uppercase tracking-widest text-center px-2">App Feature</span>'
new_empty_text_f = '<span className="text-[9px] sm:text-[10px] font-semibold text-cyan-700/60 uppercase tracking-widest text-center px-1">App Feature</span>'
content = content.replace(old_empty_text_f, new_empty_text_f)


with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Sockets updated to Flex layout to perfectly fill empty space.")
