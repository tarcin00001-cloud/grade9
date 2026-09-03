import os

target_file = 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the Diagnostics column bulletproof using inline styles for width on desktop
old_diag = 'className="flex flex-col shrink-0 w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 relative z-10"'
new_diag = 'className="flex flex-col shrink-0 w-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 relative z-10"\n           style={{ maxWidth: "100%", flexBasis: "288px" }}'
content = content.replace(old_diag, new_diag)

# Fallback if w-[280px] is still there
old_diag_2 = 'className="flex flex-col shrink-0 w-full md:w-[280px] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 relative z-10"'
content = content.replace(old_diag_2, new_diag)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied bulletproof inline styles to layout.")
