import os
import glob

lab_files = glob.glob('labs/[vV]irtual[mM]em9.tsx')
target_file = lab_files[0] if lab_files else 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

old_text = """<p className={`text-[9px] md:text-xs font-medium leading-tight ${stats.cpuTemp > 80 ? 'text-rose-500/80' : 'text-slate-500'}`}>
                      {phase === "intro" && "Click 'Power On' to boot the OS Memory Manager."}
                      {phase === "ram_fill" && "Mount the 3 queued apps directly into the fast RAM slots."}
                      {phase === "first_fault" && "RAM is full! Eject an app from RAM to the Hard Drive to load the 3D Engine."}
                      {phase === "thrashing_intro" && "The CPU will now rapidly demand apps not in RAM. Prepare for heavy I/O."}
                      {phase === "thrashing" && "Keep up with CPU demands! Swap apps instantly. Watch the temperature!"}
                      {phase === "upgrade_ssd" && "Mechanical HDD bottleneck detected! I/O Wait Lock. Install NVMe."}
                      {phase === "ssd_test" && "Resume operations with high-speed solid-state storage."}
                      {phase === "success" && "Virtual Memory stabilized. Zero thrashing detected."}
                    </p>"""

new_text = """<p className={`text-[9px] md:text-xs font-medium leading-tight ${stats.cpuTemp > 80 ? 'text-rose-500/80' : 'text-slate-500'}`}>
                      {phase === "intro" && "Click 'Power On' to boot the OS Memory Manager."}
                      {phase === "ram_fill" && "Click the 3 queued apps to mount them directly into the fast RAM slots."}
                      {phase === "first_fault" && "RAM is full! Click an app in RAM to eject it, then click the 3D Engine in the Disk to load it."}
                      {phase === "thrashing_intro" && "The CPU will now rapidly demand apps not in RAM. Prepare for heavy I/O."}
                      {phase === "thrashing" && "Click an app in RAM to eject it, then click the demanded app to load it! Watch the CPU temperature!"}
                      {phase === "upgrade_ssd" && "Mechanical HDD bottleneck detected! I/O Wait Lock. Install NVMe."}
                      {phase === "ssd_test" && "Keep the CPU fed! Click an app in RAM to eject it, then click the demanded app to swap it in."}
                      {phase === "success" && "Virtual Memory stabilized. Zero thrashing detected."}
                    </p>"""

content = content.replace(old_text, new_text)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully updated HUD instructions in {target_file}")
