import re

with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

# First, remove the absolute sticky notes we added to the chassis
content = re.sub(r"               \{stage <= 2 && \(\n                 <div className=\"absolute top-8 left-8 sm:top-12 sm:left-10 z-50 bg-yellow-200 p-4.*?</div>\n               \)\}\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"               \{stage === 5 && \(\n                 <div className=\"absolute top-8 left-8 sm:top-12 sm:left-10 z-50 bg-yellow-200 p-4.*?</div>\n               \)\}\n", "", content, flags=re.DOTALL)

# Let's verify they are gone. Wait, the exact strings might vary because of my previous script.
# Let's just use a broad regex for any absolute yellow-200 sticky note that starts with {stage
content = re.sub(r" *\{stage (<= 2|=== 5) && \(\n *<div className=\"absolute[^>]*bg-yellow-200.*?</p>\n *</div>\n *\)\}\n*", "", content, flags=re.DOTALL)

# Now, let's inject them as RELATIVE elements inside the Action Panel flow!
# For Stage <= 2:
stage2_action = re.search(r"               \{stage <= 2 && \(\n                 <div className=\"bg-slate-800 p-6 rounded-2xl", content)
if stage2_action:
    sticky = """
               {/* Diegetic Sticky Note */}
               {stage <= 2 && (
                 <div className="relative bg-yellow-200 p-4 w-full shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-1 z-40 border border-yellow-300 mb-6">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
                    <p className="font-mono text-sm text-slate-800 font-bold leading-tight">
                      Task: Configure a Token Bucket firewall to defend the server from a DDoS botnet, without blocking real users.
                    </p>
                 </div>
               )}
"""
    content = content[:stage2_action.start()] + sticky + content[stage2_action.start():]

# For Stage 5/6:
stage5_action = re.search(r"               \{\(stage === 5 \|\| stage === 6\) && \(\n                 <div className=\"bg-slate-800 p-6", content)
if stage5_action:
    sticky = """
               {/* Diegetic Sticky Note */}
               {stage === 5 && (
                 <div className="relative bg-yellow-200 p-4 w-full shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-[-1deg] z-40 border border-yellow-300 mb-6">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
                    <p className="font-mono text-[10px] text-slate-800 font-bold leading-tight mb-2 uppercase border-b border-yellow-300/50 pb-1">Sysadmin Note</p>
                    <p className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed">
                      - Users send bursts of <b>5</b> packets. Capacity must absorb this.<br/>
                      - Botnet sends <b>20</b> pkt/sec. Keep Refill low (under 10) so they can't crash the API Core!
                    </p>
                 </div>
               )}
"""
    content = content[:stage5_action.start()] + sticky + content[stage5_action.start():]

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
