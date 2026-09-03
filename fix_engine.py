import re

with open("labs/ratelimiting9.tsx.bak", "r") as f:
    bak = f.read()

# Find original engine
match = re.search(r"  useEffect\(\(\) => \{\n    const FPS = 30;.*?return \(\) => clearInterval\(interval\);\n  \}, \[stage, capacity, refillRate, playError, playSuccess, reportComplete\]\);", bak, re.DOTALL)
if not match:
    match = re.search(r"  useEffect\(\(\) => \{\n    const FPS = 30;.*?return \(\) => clearInterval\(interval\);\n  \}, \[.*?\]\);", bak, re.DOTALL)

if not match:
    print("Could not find original engine")
    exit(1)

original_engine = match.group(0)

# Make sure reportComplete is in the dependency array
if "reportComplete" not in original_engine:
    original_engine = re.sub(r"\}\, \[([^\]]+)\]\);", r"}, [\1, reportComplete]);", original_engine)

with open("labs/ratelimiting9.tsx", "r") as f:
    curr = f.read()

curr_match = re.search(r"  // Engine Loop.*?return \(\) => clearTimeout\(t\);\n    \}\n  \}, \[stage\]\);", curr, re.DOTALL)

if not curr_match:
    print("Could not find current engine")
    exit(1)

physics_struct = """  // Decoupled Physics Engine state
  const physics = useRef({
    packets: [] as Packet[],
    health: 100,
    tokens: 10,
    stats: { droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 },
    lastGoodSpawn: 0,
    lastBadSpawn: 0,
    burstCount: 0,
    lastRefill: 0
  });"""

curr = re.sub(r"  // Decoupled Physics Engine state.*?  // React state just for painting frames", physics_struct + "\n\n  // React state just for painting frames", curr, flags=re.DOTALL)
curr_match2 = re.search(r"  // Engine Loop.*?return \(\) => clearTimeout\(t\);\n    \}\n  \}, \[stage\]\);", curr, re.DOTALL)

# Adjust coordinates to match the pipe
original_engine = original_engine.replace('45 + Math.random() * 10', '50 + (Math.random() * 8 - 4)')
original_engine = original_engine.replace('25 + Math.random() * 50', '50 + (Math.random() * 8 - 4)')

new_content = curr[:curr_match2.start()] + "  " + original_engine + curr[curr_match2.end():]

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(new_content)
print("Success")
