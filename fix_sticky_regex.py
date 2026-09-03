import re
with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

# First, strip out ALL yellow-200 notes
content = re.sub(r" *\{stage.*?bg-yellow-200.*?</p>\n *</div>\n *\)\}\n", "", content, flags=re.DOTALL)

# Find the Action Panel wrapper
target = r"(<div className=\"w-full sm:w-80 flex flex-col justify-center gap-6 relative z-20\">)"
match = re.search(target, content)

if match:
    sticky_html = """
               {/* Diegetic Sticky Note */}
               {stage <= 2 && (
                 <div className="relative bg-yellow-200 p-4 w-full shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-1 z-40 border border-yellow-300">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
                    <p className="font-mono text-sm text-slate-800 font-bold leading-tight">
                      Task: Configure a Token Bucket firewall to defend the server from a DDoS botnet, without blocking real users.
                    </p>
                 </div>
               )}
               {stage === 5 && (
                 <div className="relative bg-yellow-200 p-4 w-full shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-[-1deg] z-40 border border-yellow-300">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
                    <p className="font-mono text-[10px] text-slate-800 font-bold leading-tight mb-2 uppercase border-b border-yellow-300/50 pb-1">Sysadmin Note</p>
                    <p className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed">
                      - Users send bursts of <b>5</b> packets. Capacity must absorb this.<br/>
                      - Botnet sends <b>20</b> pkt/sec. Keep Refill low (under 10) so they can't crash the API Core!
                    </p>
                 </div>
               )}
"""
    content = content[:match.end()] + "\n" + sticky_html + content[match.end():]
    with open("labs/ratelimiting9.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Could not find target")
