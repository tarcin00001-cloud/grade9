with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    if "THE HARDWARE CHASSIS" in lines[i]:
        sticky = """
          {/* External Diegetic Sticky Notes */}
          {stage <= 2 && (
            <div className="absolute top-2 right-2 sm:top-2 sm:-right-8 bg-yellow-200 p-4 w-64 shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-3 z-50 border border-yellow-300 transform transition-transform hover:rotate-0">
               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
               <p className="font-mono text-sm text-slate-800 font-bold leading-tight">
                 Task: Configure a Token Bucket firewall to defend the server from a DDoS botnet, without blocking real users.
               </p>
            </div>
          )}
          {stage === 5 && (
            <div className="absolute top-2 right-2 sm:top-2 sm:-right-8 bg-yellow-200 p-4 w-72 shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-[-2deg] z-50 border border-yellow-300 transform transition-transform hover:rotate-0">
               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
               <p className="font-mono text-[10px] text-slate-800 font-bold leading-tight mb-2 uppercase border-b border-yellow-300/50 pb-1">Sysadmin Note</p>
               <p className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed">
                 - Users send bursts of <b>5</b> packets. Capacity must absorb this.<br/>
                 - Botnet sends <b>20</b> pkt/sec. Keep Refill low (under 10) so they can't crash the API Core!
               </p>
            </div>
          )}
"""
        new_lines.append(sticky)
    new_lines.append(lines[i])
    i += 1

with open("labs/ratelimiting9.tsx", "w") as f:
    f.writelines(new_lines)
print("Success")
