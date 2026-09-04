import re

filepath = r'c:\Users\LocalAdmin\working\Dev\Lab9\labs\ContentDeliveryNetwork9.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State machine replacements
state_search = """  const [worldCelebration, setWorldCelebration] = useState(false);
  const [completed, setCompleted] = useState(false);"""

state_replace = """  const [worldCelebration, setWorldCelebration] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Added pedagogical state
  const [phase, setPhase] = useState<number>(0);
  const [isOutageActive, setIsOutageActive] = useState(false);
  const [failoverActive, setFailoverActive] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);"""

content = content.replace(state_search, state_replace)

# 2. Latency & victory logic replacements
latency_search = """  // Calculate live global average latency in ms
  let liveLatencyMs = 240;
  if (cachedCount === 0) liveLatencyMs = 240;
  else if (cachedCount === 1) {
    liveLatencyMs = hasSuburban ? 228 : hasMetro ? 170 : hasNorth ? 140 : 130;
  } else if (cachedCount === 2) {
    if (hasNorth && hasSouth) liveLatencyMs = 62;
    else if (hasMetro && (hasNorth || hasSouth)) liveLatencyMs = 85;
    else liveLatencyMs = 150;
  } else if (cachedCount === 3) {
    if (hasMetro && hasNorth && hasSouth) liveLatencyMs = 12; // OPTIMAL VICTORY!
    else if (hasSuburban && hasNorth && hasSouth) liveLatencyMs = 50;
    else if (hasSuburban && hasMetro && (hasNorth || hasSouth)) liveLatencyMs = 110;
  }

  // Needle angle mapping: 240ms -> +68° (OVERLOAD), 140ms -> +35°, 60ms -> -10°, 12ms -> -68° (FAST)
  let targetNeedleAngle = 68;
  if (liveLatencyMs <= 15) targetNeedleAngle = -68;
  else if (liveLatencyMs <= 60) targetNeedleAngle = -28;
  else if (liveLatencyMs <= 120) targetNeedleAngle = 18;
  else if (liveLatencyMs <= 180) targetNeedleAngle = 44;
  else targetNeedleAngle = 68;

  // Genuine Victory: Cached 3 stations AND achieved lowest latency (Metro, North, South)
  const isOptimalVictory = cachedCount === 3 && hasMetro && hasNorth && hasSouth;

  useEffect(() => {
    if (isOptimalVictory && !completed && !worldCelebration) {
      const allSynced = cachedStationIds.every((id) => syncedStations.has(id));

      if (allSynced) {
        setWorldCelebration(true);
        setTimeout(() => {
          setCompleted(true);
          playSuccess();
          reportComplete();
        }, 1400);
      }
    }
  }, [isOptimalVictory, syncedStations, cachedStationIds, completed, worldCelebration, playSuccess, reportComplete]);"""

latency_replace = """  // Calculate live global average latency in ms
  let liveLatencyMs = 240;
  if (isOutageActive && !failoverActive) {
    liveLatencyMs = 503;
  } else if (cachedCount === 0) {
    liveLatencyMs = 240;
  } else if (cachedCount === 1) {
    liveLatencyMs = hasSuburban ? 228 : hasMetro ? 170 : hasNorth ? 140 : 130;
  } else if (cachedCount === 2) {
    if (hasNorth && hasSouth) liveLatencyMs = 62;
    else if (hasMetro && (hasNorth || hasSouth)) liveLatencyMs = 85;
    else liveLatencyMs = 150;
  } else if (cachedCount === 3) {
    if (hasMetro && hasNorth && hasSouth) liveLatencyMs = 12; // OPTIMAL VICTORY!
    else if (hasSuburban && hasNorth && hasSouth) liveLatencyMs = 50;
    else if (hasSuburban && hasMetro && (hasNorth || hasSouth)) liveLatencyMs = 110;
  }

  // Needle angle mapping
  let targetNeedleAngle = 68;
  if (liveLatencyMs === 503) targetNeedleAngle = 75; // max right
  else if (liveLatencyMs <= 15) targetNeedleAngle = -68;
  else if (liveLatencyMs <= 60) targetNeedleAngle = -28;
  else if (liveLatencyMs <= 120) targetNeedleAngle = 18;
  else if (liveLatencyMs <= 180) targetNeedleAngle = 44;
  else targetNeedleAngle = 68;

  // Genuine Victory: Cached 3 stations AND achieved lowest latency
  const isOptimalVictory = cachedCount === 3 && hasMetro && hasNorth && hasSouth;

  // 7-STEP LOOP LOGIC
  useEffect(() => {
    const allSynced = cachedStationIds.every((id) => syncedStations.has(id));

    if (phase === 0 && hasSouth) {
      setPhase(1); // Try manual
    } else if (phase === 1 && isOptimalVictory && allSynced) {
      setPhase(2); // Understand
      timersRef.current.push(setTimeout(() => {
        setIsOutageActive(true);
        playError();
        setPhase(3); // Fail Overload
        timersRef.current.push(setTimeout(() => {
          setPhase(4); // Improve
        }, 4000));
      }, 2000));
    } else if (phase === 5 && !completed && !worldCelebration) {
      setPhase(6); // Complete
      setWorldCelebration(true);
      timersRef.current.push(setTimeout(() => {
        setCompleted(true);
        playSuccess();
        reportComplete();
      }, 4500)); // Minimum 4.5s delay
    }
  }, [phase, hasSouth, isOptimalVictory, syncedStations, cachedStationIds, completed, worldCelebration, playSuccess, playError, reportComplete]);"""

content = content.replace(latency_search, latency_replace)

# 3. LabShell props replacements
labshell_search = """      instruction="Deploy Regional Caches to Reduce Global Wait Time. Drag memory canisters into high-delay regional stations to eliminate network lag."
      hint="Suburban Grid is already close (12ms). Deploy your 3 canisters to Metro Central, Northern Hub, and Southern Port (50–195ms) to bring global waiting time all the way into the green FAST zone!"
      bgOverride="bg-slate-100"
      compact={true}
      onReset={() => {
        setDriveLocations({ drive_1: "origin_1", drive_2: "origin_2", drive_3: "origin_3" });
        setSyncingStations(new Set());
        setSyncedStations(new Set());
        setWarningMessage(null);
        setWorldCelebration(false);
        setCompleted(false);
      }}"""

labshell_replace = """      instruction={
        phase === 0 ? "Learn: A CDN places servers near users. Drag 1 canister to the farthest station (Southern Port 195ms)." :
        phase === 1 ? "Try: Eliminate remaining lag. Drag canisters to Metro Central and Northern Hub." :
        phase === 2 ? "Perfect! Edge caches are deployed..." :
        phase === 3 ? "OUTAGE: June 8, 2021. A bug in Fastly's CDN downed 85% of their edge fleet! Single-CDN dependency is a failure point." :
        phase === 4 ? "Improve: Multi-CDN Redundancy. A Failover Switch has appeared in the Depot. Toggle it to reroute traffic to GCP/Cloudflare!" :
        "Outcome: Redundancy saved the network. Latency is back to 12ms."
      }
      hint="Suburban Grid is already close (12ms). Deploy your 3 canisters to Metro Central, Northern Hub, and Southern Port (50–195ms) to bring global waiting time all the way into the green FAST zone!"
      bgOverride="bg-slate-100"
      compact={true}
      onReset={() => {
        setDriveLocations({ drive_1: "origin_1", drive_2: "origin_2", drive_3: "origin_3" });
        setSyncingStations(new Set());
        setSyncedStations(new Set());
        setWarningMessage(null);
        setWorldCelebration(false);
        setCompleted(false);
        setPhase(0);
        setIsOutageActive(false);
        setFailoverActive(false);
        clearTimers();
      }}"""

content = content.replace(labshell_search, labshell_replace)

# 4. Fix setTimeouts in moveDrive function
movedrive_search1 = """      setTimeout(() => {
        setImpactStations((prev) => {
          const next = new Set(prev);
          next.delete(targetStation);
          return next;
        });
      }, 400);"""
movedrive_replace1 = """      timersRef.current.push(setTimeout(() => {
        setImpactStations((prev) => {
          const next = new Set(prev);
          next.delete(targetStation);
          return next;
        });
      }, 400));"""
content = content.replace(movedrive_search1, movedrive_replace1)

movedrive_search2 = """      setTimeout(() => {
        setSyncingStations((prev) => {
          const next = new Set(prev);
          next.delete(targetStation);
          return next;
        });
        setSyncedStations((prev) => new Set(prev).add(targetStation));
        playPop();
      }, journeyDuration);"""
movedrive_replace2 = """      timersRef.current.push(setTimeout(() => {
        setSyncingStations((prev) => {
          const next = new Set(prev);
          next.delete(targetStation);
          return next;
        });
        setSyncedStations((prev) => new Set(prev).add(targetStation));
        playPop();
      }, journeyDuration));"""
content = content.replace(movedrive_search2, movedrive_replace2)

# 5. Add MainServerDepot props
depot_props_search = """          <MainServerDepot
            needleAngle={targetNeedleAngle}
            liveLatencyMs={liveLatencyMs}
            driveLocations={driveLocations}
            activeDropZone={activeDropZone}
            selectedDrive={selectedDrive}
            nodeRefs={nodeRefs}
            availableCopies={availableCopies}
            cachedCount={cachedCount}
            onSlotClick={handleSlotClick}
            setSelectedDrive={setSelectedDrive}
            handleDragStart={handleDragStart}
            handleDrag={handleDrag}
            handleDragEnd={handleDragEnd}
            playPop={playPop}
            worldCelebration={worldCelebration}
            stationYs={railCoords.stationYs}
          />"""

depot_props_replace = """          <MainServerDepot
            needleAngle={targetNeedleAngle}
            liveLatencyMs={liveLatencyMs}
            driveLocations={driveLocations}
            activeDropZone={activeDropZone}
            selectedDrive={selectedDrive}
            nodeRefs={nodeRefs}
            availableCopies={availableCopies}
            cachedCount={cachedCount}
            onSlotClick={handleSlotClick}
            setSelectedDrive={setSelectedDrive}
            handleDragStart={handleDragStart}
            handleDrag={handleDrag}
            handleDragEnd={handleDragEnd}
            playPop={playPop}
            worldCelebration={worldCelebration}
            stationYs={railCoords.stationYs}
            isOutageActive={isOutageActive}
            failoverActive={failoverActive}
            onToggleFailover={() => {
              setFailoverActive(true);
              setPhase(5);
              playSuccess();
            }}
          />"""
content = content.replace(depot_props_search, depot_props_replace)

# 6. Update MainServerDepot signature
depot_sig_search = """  playPop,
  worldCelebration,
  stationYs,
}: any) {"""

depot_sig_replace = """  playPop,
  worldCelebration,
  stationYs,
  isOutageActive,
  failoverActive,
  onToggleFailover,
}: any) {"""
content = content.replace(depot_sig_search, depot_sig_replace)

# 7. Add Failover Switch inside MainServerDepot
# We will replace the "3 Canister Bays" div conditionally when isOutageActive is true
bays_search = """      {/* 3 Canister Bays */}
      <div className="w-full bg-slate-300/80 p-1.5 rounded-xl border border-slate-400 flex flex-col items-center shrink-0">"""

bays_replace = """      {/* Multi-CDN Failover Switch (Phase 6 Outage Response) */}
      {isOutageActive ? (
        <div className={`w-full p-2 rounded-xl border-4 flex flex-col items-center justify-center shrink-0 transition-all ${failoverActive ? 'bg-emerald-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-red-950 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {failoverActive ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />}
            <span className={`text-[10px] font-black uppercase tracking-wider ${failoverActive ? 'text-emerald-400' : 'text-red-400'}`}>
              MULTI-CDN FAILOVER
            </span>
          </div>
          
          <button 
            onClick={onToggleFailover}
            disabled={failoverActive}
            className={`w-full py-2 rounded-lg border-b-4 flex flex-col items-center justify-center transition-all ${failoverActive ? 'bg-emerald-800 border-emerald-950 opacity-80 cursor-default' : 'bg-red-600 border-red-800 hover:bg-red-500 active:border-b-0 active:mt-1 cursor-pointer'}`}
          >
            <span className="text-white text-[11px] font-black tracking-widest drop-shadow-md">
              {failoverActive ? "ROUTING GCP/CLOUDFLARE" : "ENGAGE SECONDARY CDN"}
            </span>
          </button>
        </div>
      ) : (
      <div className="w-full bg-slate-300/80 p-1.5 rounded-xl border border-slate-400 flex flex-col items-center shrink-0">"""

content = content.replace(bays_search, bays_replace)
# And add the closing brace for the ternary operator
bays_end_search = """        </div>
      </div>
    </div>
  );
}"""

bays_end_replace = """        </div>
      </div>
      )}
    </div>
  );
}"""
content = content.replace(bays_end_search, bays_end_replace)

# 8. Outage pulsing animations
cooling_search = """      {/* Industrial Header with Active Dynamic Cooling Turbines */}
      <div className={`w-full rounded-lg px-2 py-1 border-b-2 shadow-sm flex items-center justify-between text-white shrink-0 transition-colors duration-500 ${
        isCoolAndNominal ? "bg-emerald-600 border-emerald-700" : "bg-slate-800 border-slate-900"
      }`}>"""
cooling_replace = """      {/* Industrial Header with Active Dynamic Cooling Turbines */}
      <div className={`w-full rounded-lg px-2 py-1 border-b-2 shadow-sm flex items-center justify-between text-white shrink-0 transition-colors duration-500 ${
        isOutageActive && !failoverActive ? "bg-red-900 border-red-950 animate-pulse" : isCoolAndNominal ? "bg-emerald-600 border-emerald-700" : "bg-slate-800 border-slate-900"
      }`}>"""
content = content.replace(cooling_search, cooling_replace)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Advanced logic replacements done.')
