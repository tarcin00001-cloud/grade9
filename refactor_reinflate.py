import os
import re

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Fix the Sockets Grids (Accidentally replaced by previous regex)
# The sockets grids are directly below the `</div>` and contain `{Array.from({ length: MISSIONS[activeMission].sockets`
# We'll replace the exact bad grid class strings that are followed by the Array map.
content = content.replace(
    '<div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-1 pr-1">\n                    {Array.from({ length: MISSIONS[activeMission].socketsF })',
    '<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">\n                    {Array.from({ length: MISSIONS[activeMission].socketsF })'
)
content = content.replace(
    '<div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-1 pr-1">\n                    {Array.from({ length: MISSIONS[activeMission].socketsNF })',
    '<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">\n                    {Array.from({ length: MISSIONS[activeMission].socketsNF })'
)

# 2. Re-inflate the Tray Grid Spacing
content = content.replace(
    '<div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-1 pr-1">\n                  {trayModules.map(',
    '<div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2 pr-1 content-start">\n                  {trayModules.map('
)

# 3. Re-inflate the Tray Cards
content = content.replace('p-1.5 \n                      cursor-pointer', 'p-3 \n                      cursor-pointer') # multi-line check
content = content.replace('p-1.5 \r\n                      cursor-pointer', 'p-3 \r\n                      cursor-pointer')
content = content.replace('p-1.5 cursor-pointer', 'p-3 cursor-pointer') # single line
content = content.replace('mb-0 gap-1', 'mb-1 gap-2')
content = content.replace('line-clamp-1 mb-0.5', 'line-clamp-2 mb-2')
content = content.replace('pt-1.5 border-t', 'pt-2 border-t')

# 4. Give the Sockets more breathing room
content = content.replace('h-10 rounded-xl', 'h-12 rounded-xl')

# 5. Fix Tray container spacing
content = content.replace('shadow-sm p-3 shadow-md flex flex-col', 'shadow-sm p-4 shadow-md flex flex-col')
content = content.replace('mb-1.5 shrink-0', 'mb-3 shrink-0')


with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Empty space optimized and engaged.")
