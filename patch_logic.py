import os
import re

target_file = 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the stale closure bug in handleAction by removing the check
old_timeout_logic = """          if (driveType === "HDD") playError(); else playPop();
          setIsSwapping(false);
          setSwapTarget(null);
          
          if (phase === "thrashing" && stats.cpuTemp >= 85) {
             setPhase("upgrade_ssd");
          }
       }, swapDelay);"""

new_timeout_logic = """          if (driveType === "HDD") playError(); else playPop();
          setIsSwapping(false);
          setSwapTarget(null);
       }, swapDelay);"""

content = content.replace(old_timeout_logic, new_timeout_logic)

# 2. Add the correct useEffect to monitor cpuTemp and trigger the upgrade
# I will inject this right after the existing useEffects.
use_effect_injection = """
  useEffect(() => {
    if (phase === "thrashing" && stats.cpuTemp >= 85) {
       const timer = setTimeout(() => {
          setPhase("upgrade_ssd");
       }, 1500); // 1.5s of dramatic shaking before interrupting
       return () => clearTimeout(timer);
    }
  }, [stats.cpuTemp, phase]);
"""

# Find a good place to inject. After the first useEffect is fine.
content = content.replace("  const handleAction =", use_effect_injection + "\n  const handleAction =")

# 3. Fix the confusing text for first_fault
old_text = 'click the 3D Engine in the Disk to load it."'
new_text = 'click the 3D Engine in the Queue to load it."'
content = content.replace(old_text, new_text)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched VirtualMem9 logic bugs successfully.")
