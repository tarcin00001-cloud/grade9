with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
stage2_lines = []
stage5_lines = []

in_stage2 = False
in_stage5 = False

for line in lines:
    if "{stage <= 2 && (" in line and "bg-yellow-200" in line:
        # Wait, the '{stage <= 2' might be on the previous line
        pass

# Actually let's just find the exact block indices
i = 0
while i < len(lines):
    if "{stage <= 2 && (" in lines[i]:
        if "bg-yellow-200" in lines[i+1]:
            # This is the sticky note
            stage2_lines = lines[i:i+9]
            i += 9
            continue
    if "{stage === 5 && (" in lines[i]:
        if "bg-yellow-200" in lines[i+1]:
            # This is the sticky note
            stage5_lines = lines[i:i+11]
            i += 11
            continue
    new_lines.append(lines[i])
    i += 1

# Modify the lines
for j in range(len(stage2_lines)):
    stage2_lines[j] = stage2_lines[j].replace("absolute top-8 left-12 sm:top-12 sm:left-24", "absolute top-8 left-8 sm:top-12 sm:left-12 z-50")
for j in range(len(stage5_lines)):
    stage5_lines[j] = stage5_lines[j].replace("absolute top-8 left-12 sm:top-12 sm:left-24", "absolute top-8 left-8 sm:top-12 sm:left-12 z-50")

# Inject after screws
final_lines = []
for line in new_lines:
    final_lines.append(line)
    if "HARDWARE SCREWS" in line:
        # wait, let's inject after the last screw
        pass
    if "w-2 h-0.5 bg-slate-800 -rotate-12" in line:
        final_lines.append("\n")
        final_lines.extend(stage2_lines)
        final_lines.append("\n")
        final_lines.extend(stage5_lines)

with open("labs/ratelimiting9.tsx", "w") as f:
    f.writelines(final_lines)
print("Success")
