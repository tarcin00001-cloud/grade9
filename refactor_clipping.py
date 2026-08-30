import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Fix the Tray Clipping (Allow invisible scrolling so all 10 items are accessible without breaking the "no scrollbars" rule)
old_tray_grid = 'className="overflow-hidden grid grid-cols-2 md:grid-cols-3 gap-3"'
new_tray_grid = 'className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 pb-4"'
content = content.replace(old_tray_grid, new_tray_grid)

# 2. Fix the Sockets crushing the Tray (Stop them from wrapping into giant multi-row blocks on mid-size screens)
# There are two instances of the socket container (Functional and Non-Functional)
old_socket_wrap = 'className="flex flex-wrap gap-2"'
new_socket_wrap = 'className="grid grid-cols-2 xl:grid-cols-4 gap-2"'
content = content.replace(old_socket_wrap, new_socket_wrap)

# 3. Reduce minimum width of slots so they don't overflow the grid
old_slot_class = 'flex-1 min-w-[120px] h-12 rounded-xl border-2'
new_slot_class = 'flex-1 min-w-0 h-12 rounded-xl border-2'
content = content.replace(old_slot_class, new_slot_class)

# 4. Make the Tray Cards slightly more compact so they fit better
content = content.replace('p-2 cursor-pointer', 'p-1.5 cursor-pointer')
content = content.replace('mb-1 gap-1', 'mb-0.5 gap-1')
content = content.replace('text-[11px] font-bold text-slate-900', 'text-[10px] sm:text-[11px] font-bold text-slate-900')

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Clipping fixed. Invisible scrolling enabled.")
