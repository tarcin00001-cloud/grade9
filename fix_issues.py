with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

import re

# 1. Add onReset to LabShell
labshell = re.search(r"<LabShell[^>]*>", content)
if labshell and "onReset=" not in content:
    reset_func = """
  const handleReset = () => {
    setStage(1);
    setShowModal(false);
    setCapacity(10);
    setRefillRate(6);
    physics.current = {
      packets: [],
      health: 100,
      tokens: 10,
      stats: { droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 },
      lastGoodSpawn: 0,
      lastBadSpawn: 0,
      burstCount: 0,
      lastRefill: 0
    };
    setRenderPackets([]);
    setHealth(100);
    setTokens(10);
    setStats({ droppedBad: 0, droppedGood: 0, processedGood: 0, processedBad: 0 });
  };
"""
    # Insert reset func before return
    return_stmt = re.search(r"  return \(\n", content)
    if return_stmt:
        content = content[:return_stmt.start()] + reset_func + content[return_stmt.start():]
        content = content.replace("compact={true}", "compact={true}\n      onReset={handleReset}")

# 2. Add Stage 5 Sticky Note
stage2_sticky = re.search(r"\{stage <= 2 && \(\n.*?</div>\n               \)\}", content, re.DOTALL)
if stage2_sticky:
    stage5_sticky = """
               {stage === 5 && (
                 <div className="absolute -top-12 -left-32 bg-yellow-200 p-4 w-64 shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-[-4deg] z-40 border border-yellow-300 transform transition-transform hover:rotate-0">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
                    <p className="font-mono text-xs text-slate-800 font-bold leading-tight mb-2 uppercase border-b border-yellow-300/50 pb-1">Sysadmin Note</p>
                    <p className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed">
                      - Users send bursts of <b>5</b> packets. Capacity must absorb this.<br/>
                      - Botnet sends <b>20</b> pkt/sec. Keep Refill low (under 10) so they can't crash the API Core!
                    </p>
                 </div>
               )}
"""
    content = content[:stage2_sticky.end()] + stage5_sticky + content[stage2_sticky.end():]

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
