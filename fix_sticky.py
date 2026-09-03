lines = []
with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
found = False
while i < len(lines):
    new_lines.append(lines[i])
    if "Task: Configure a Token Bucket firewall" in lines[i] and not found:
        # append the rest of the block
        new_lines.append(lines[i+1])
        new_lines.append(lines[i+2])
        new_lines.append(lines[i+3])
        new_lines.append("\n               {stage === 5 && (\n                 <div className=\"absolute -top-12 -left-48 bg-yellow-200 p-4 w-72 shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-[-4deg] z-40 border border-yellow-300 transform transition-transform hover:rotate-0\">\n                    <div className=\"absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm\" />\n                    <p className=\"font-mono text-xs text-slate-800 font-bold leading-tight mb-2 uppercase border-b border-yellow-300/50 pb-1\">Sysadmin Note</p>\n                    <p className=\"font-mono text-[11px] text-slate-800 font-bold leading-relaxed\">\n                      - Users send bursts of <b>5</b> packets. Capacity must absorb this.<br/>\n                      - Botnet sends <b>20</b> pkt/sec. Keep Refill low (under 10) so they can't crash the API Core!\n                    </p>\n                 </div>\n               )}\n")
        i += 3
        found = True
    i += 1

with open("labs/ratelimiting9.tsx", "w") as f:
    f.writelines(new_lines)
print("Success")
