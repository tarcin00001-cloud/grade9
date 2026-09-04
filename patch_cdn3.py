import re

filepath = r'c:\Users\LocalAdmin\working\Dev\Lab9\labs\ContentDeliveryNetwork9.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State machine & Phase logic
state_vars = '''  const [worldCelebration, setWorldCelebration] = useState(false);
  const [completed, setCompleted] = useState(false);

  // 7-step pedagogical flow
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
  }, []);'''
content = re.sub(r'  const \[worldCelebration.*?setCompleted\(false\);', state_vars, content, flags=re.DOTALL)

# 2. Latency Logic
latency_logic = '''  // Calculate live global average latency in ms
  let liveLatencyMs = 240;
  if (isOutageActive && !failoverActive) {
    liveLatencyMs = 503; // Overload
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
  }, [phase, hasSouth, isOptimalVictory, syncedStations, cachedStationIds, completed, worldCelebration, playSuccess, playError, reportComplete]);'''

content = re.sub(r'  // Calculate live global average latency in ms.*?reportComplete\}\]\);', latency_logic, content, flags=re.DOTALL)

# 3. LabShell props
labshell_props = '''    <LabShell
      labId="contentdeliverynetwork9"
      title="CDN Network Architecture"
      instruction={
        phase === 0 ? "Learn: A CDN places servers near users. Drag 1 canister to the farthest station (Southern Port 195ms)." :
        phase === 1 ? "Try: Eliminate remaining lag. Drag canisters to Metro Central and Northern Hub." :
        phase === 2 ? "Perfect! Edge caches are deployed..." :
        phase === 3 ? "OUTAGE: June 8, 2021. A bug in Fastly's CDN downed 85% of their edge fleet! Single-CDN dependency is a failure point." :
        phase === 4 ? "Improve: Multi-CDN Redundancy. A Failover Switch has appeared in the Depot. Toggle it to reroute traffic to GCP/Cloudflare!" :
        "Outcome: Redundancy saved the network. Latency is back to 12ms."
      }
      hint="Suburban Grid is already close (12ms). Deploy your 3 canisters to Metro Central, Northern Hub, and Southern Port (50-195ms) to bring global waiting time all the way into the green FAST zone!"
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
      }}'''
content = re.sub(r'    <LabShell.*?setCompleted\(false\);\n      \}\}', labshell_props, content, flags=re.DOTALL)

# 4. SetTimeouts in moveDrive & grid fix
content = content.replace('setTimeout(() => {', 'timersRef.current.push(setTimeout(() => {')
content = content.replace('}, 400);', '}, 400));')
content = content.replace('}, journeyDuration);', '}, journeyDuration));')

# 5. Fix layout grid
content = content.replace('className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] flex flex-col', 'className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] grid grid-cols-2 md:flex md:flex-col')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Phase 2 logic injected.')
