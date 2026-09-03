with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    # Skip any line that looks like an absolute sticky note
    if "absolute top-8 left-8 sm:top-12 sm:left-10 z-50 bg-yellow-200" in lines[i]:
        i += 9 # skip the whole block roughly, wait, this is dangerous
        continue
    new_lines.append(lines[i])
    i += 1
