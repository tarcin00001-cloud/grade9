import os

target_file = 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the Data Bus Queue wrapper: remove scrollbars and use flex-wrap
old_queue_wrapper = 'className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin"'
new_queue_wrapper = 'className="flex flex-row flex-wrap gap-3"'
content = content.replace(old_queue_wrapper, new_queue_wrapper)

# 2. Fix the Data Bus Queue items: give them a min/max width so they wrap organically
old_queue_item = 'className={`bg-slate-800 border border-slate-600 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700 hover:border-slate-400 transition-all shadow-sm group`}'
new_queue_item = 'className={`bg-slate-800 border border-slate-600 rounded-xl p-2 pr-3 flex items-center gap-2 cursor-pointer hover:bg-slate-700 hover:border-slate-400 transition-all shadow-sm flex-1 min-w-[140px] max-w-[200px] group`}'
content = content.replace(old_queue_item, new_queue_item)

# 3. Fix the Disk Section wrapper: remove scrollbars
old_disk_wrapper = 'className="grid grid-cols-4 md:grid-cols-5 gap-4 flex-1 content-start overflow-y-auto pr-2 pb-2 scrollbar-thin"'
new_disk_wrapper = 'className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 flex-1 content-start"'
content = content.replace(old_disk_wrapper, new_disk_wrapper)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Removed all scrollbars and applied flex-wrap grids to {target_file}")
