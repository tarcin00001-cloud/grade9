import os
import glob
import re

lab_files = glob.glob('labs/[vV]irtual[mM]em9.tsx')
target_file = lab_files[0] if lab_files else 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the interval so it doesn't overwrite an existing active demand
old_interval = """    const interval = setInterval(() => {
       if (!isSwapping) {
          const availableToFault = demands.filter(id => !ram.includes(id));
          if (availableToFault.length > 0) {
             const next = availableToFault[Math.floor(Math.random() * availableToFault.length)];
             setActiveDemand(next);
          }
       }
    }, phase === "thrashing" ? 1500 : 1000);"""

new_interval = """    const interval = setInterval(() => {
       if (!isSwapping) {
          setActiveDemand(current => {
             // CRITICAL FIX: Don't change the demand if one is already pending!
             if (current) return current; 
             
             const availableToFault = demands.filter(id => !ram.includes(id));
             if (availableToFault.length > 0) {
                return availableToFault[Math.floor(Math.random() * availableToFault.length)];
             }
             return null;
          });
       }
    }, phase === "thrashing" ? 1500 : 1000);"""

content = content.replace(old_interval, new_interval)

# Ensure the success condition is high enough that they actually play the SSD part, but not infinite
# Let's change 8 to 10 so they do about 4 successful SSD swaps
content = content.replace('stats.hits + stats.faults >= 8', 'stats.hits + stats.faults >= 10')

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed activeDemand overwrite bug and balanced success condition in {target_file}")
