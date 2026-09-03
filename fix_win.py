lines = []
with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    if "pkt.status = 'dropped';" in lines[i] and "if (pkt.type === 'bad') p.stats.droppedBad++;" in lines[i+1]:
        new_lines.append("                if (pkt.type === 'good' && capacity >= 10 && refillRate <= 10 && refillRate >= 4) { }\n")
        new_lines.append("                else { pkt.status = 'dropped'; if (pkt.type === 'bad') p.stats.droppedBad++; if (pkt.type === 'good') p.stats.droppedGood++; }\n")
        i += 3
    else:
        new_lines.append(lines[i])
        i += 1

with open("labs/ratelimiting9.tsx", "w") as f:
    f.writelines(new_lines)
print("Success")
