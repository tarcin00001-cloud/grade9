import os
import re

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Expand the Grid Columns (4 cols on lg, 5 cols on xl) so 8-10 items fit in 2 or 3 rows.
# Replace whatever the current tray grid is:
content = re.sub(
    r'className="[^"]*grid grid-cols-[^"]*gap-2[^"]*"',
    'className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-1 pr-1"',
    content
)

# 2. Compact the Sockets (App Features & Performance Goals) to save vertical space
content = content.replace('shadow-sm p-3"', 'shadow-sm p-2"')
content = content.replace('h-12 rounded-xl', 'h-10 rounded-xl')
content = content.replace('mb-2 pb-2', 'mb-1.5 pb-1.5')

# 3. Compact the Tray Container
content = content.replace('shadow-xl p-3 flex', 'shadow-xl p-2 flex')
content = content.replace('mb-3 shrink-0', 'mb-1.5 shrink-0')

# 4. Compact the Tray Cards
content = content.replace('leading-relaxed line-clamp-2', 'leading-tight line-clamp-1')
content = content.replace('mb-1 flex-1', 'mb-0.5 flex-1')
content = content.replace('mb-0.5 gap-1', 'mb-0 gap-1')

# 5. Compact the Top Objective Header
content = content.replace('gap-4 min-h-0"', 'gap-2 sm:gap-3 min-h-0"') # gap between top header and workspace
content = content.replace('gap-4 shrink-0"', 'gap-2 shrink-0"') # gap between left and right bays

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Ultra-compact layout applied. 10 items will now fit perfectly.")
