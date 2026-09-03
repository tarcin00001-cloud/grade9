import os
import glob

lab_files = glob.glob('labs/[vV]irtual[mM]em9.tsx')
target_file = lab_files[0] if lab_files else 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the LabShell opening tag to include instruction and hint props
old_labshell = """<LabShell
      labId="virtualmem9"
      theme="ocean"
      title="OS Virtual Memory & Thrashing"
      compact
      onReset={handleReset}
    >"""

new_labshell = """<LabShell
      labId="virtualmem9"
      theme="ocean"
      title="OS Virtual Memory & Thrashing"
      instruction="Load incoming apps into RAM. When RAM is full, page out old apps to the Hard Drive. Upgrade to an SSD to prevent thrashing!"
      hint="Watch the CPU demand queue carefully. Swap apps to the disk to make room, but beware of I/O delays!"
      compact
      onReset={handleReset}
    >"""

content = content.replace(old_labshell, new_labshell)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added missing LabShell props (instruction, hint).")
