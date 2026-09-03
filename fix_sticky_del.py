with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = 0
for line in lines:
    if skip > 0:
        skip -= 1
        continue
    if "relative bg-yellow-200" in line:
        skip = 9
        continue
    if "{/* Diegetic Sticky Note */}" in line:
        continue
    new_lines.append(line)

with open("labs/ratelimiting9.tsx", "w") as f:
    f.writelines(new_lines)
print("Success")
