import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Remove clashing custom background grid (let LabShell cosmos theme shine natively)
old_bg = 'bg-[linear-gradient(#1e293b_1px,transparent_1px),linear-gradient(90deg,#1e293b_1px,transparent_1px)] [background-size:20px_20px]'
content = content.replace(old_bg, '')

# 2. Fix the Scrollbar (Dynamic grid columns based on item count + reduced padding)
old_grid = 'overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 pb-4'
new_grid = 'overflow-hidden grid grid-cols-3 xl:grid-cols-5 gap-2'
content = content.replace(old_grid, new_grid)

# 3. Reduce vertical height of Bay Slots to give the Tray more room
content = content.replace('min-w-[120px] h-16 rounded-xl', 'min-w-[120px] h-12 rounded-xl')

# 4. Make Tray Cards slightly more compact vertically
content = content.replace('p-2.5 cursor-pointer', 'p-2 cursor-pointer')
content = content.replace('mb-1.5 gap-1', 'mb-1 gap-1')
content = content.replace('line-clamp-2 mb-2 flex-1', 'line-clamp-2 mb-1 flex-1')

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Scrollbar & Layout fixes applied.")
