import os
import re

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Timers & Memory Leaks
content = content.replace(
    'const [hasWon, setHasWon] = useState<boolean>(false);',
    'const [hasWon, setHasWon] = useState<boolean>(false);\n  const testTimer = useRef<NodeJS.Timeout | null>(null);\n  const winTimer = useRef<NodeJS.Timeout | null>(null);\n\n  useEffect(() => {\n    return () => {\n      if (testTimer.current) clearTimeout(testTimer.current);\n      if (winTimer.current) clearTimeout(winTimer.current);\n    };\n  }, []);'
)
content = content.replace('setTimeout(() => {\n      setSimStatus("success");', 'testTimer.current = setTimeout(() => {\n      setSimStatus("success");')
content = content.replace('setTimeout(() => {\n            setHasWon(true);', 'winTimer.current = setTimeout(() => {\n            setHasWon(true);')
content = content.replace(
    'const handleReset = () => {\n    setActiveMission("ecommerce");',
    'const handleReset = () => {\n    if (testTimer.current) clearTimeout(testTimer.current);\n    if (winTimer.current) clearTimeout(winTimer.current);\n    setActiveMission("ecommerce");'
)

# 2. Next Stage Logic Bugs (Main & Mobile Buttons)
next_stage_logic = """onClick={() => {
                  if (simStatus === "success") {
                    playPop();
                    if (!completedMissions.ecommerce) setActiveMission("ecommerce");
                    else if (!completedMissions.streaming) setActiveMission("streaming");
                    else if (!completedMissions.superapp) setActiveMission("superapp");
                  } else {
                    handleRunStressTest();
                  }
                }}"""
content = content.replace('onClick={handleRunStressTest}\n                disabled', next_stage_logic + '\n                disabled')
content = content.replace('onClick={handleRunStressTest}\n                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase', next_stage_logic + '\n                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase')

# 3. Mobile Back Button Stale State
content = content.replace(
    'onClick={() => setSimStatus("idle")}',
    'onClick={() => {\n                  setSimStatus("idle");\n                  setDiagnosticFeedback("");\n                  setDiagnosticReason("");\n                  playPop();\n                }}'
)

# 4. Reduced Motion (Accessibility)
content = content.replace('animate-pulse', 'motion-safe:animate-pulse')
content = content.replace('animate-spin', 'motion-safe:animate-spin')
content = content.replace('motion-safe:motion-safe:', 'motion-safe:') # prevent double

# 5. Hover State Stickiness (Mobile UX)
# Instead of hover:, we rely on group-hover which acts the same, but we can replace 'hover:shadow-lg' with 'md:hover:shadow-lg' etc.
# To keep it simple, tailwind applies hover on mobile too. Let's leave it unless strictly necessary, but to fix it strictly:
content = content.replace('hover:shadow-lg hover:-translate-y-0.5', '@media(hover:hover):hover:shadow-lg @media(hover:hover):hover:-translate-y-0.5')

# 6. Keyboard Accessibility
# Tray card
content = content.replace(
    'onClick={() => {\n                        playPop();\n                        setSelectedModule(isSelected ? null : id);\n                      }}',
    'onClick={() => {\n                        playPop();\n                        setSelectedModule(isSelected ? null : id);\n                      }}\n                      tabIndex={0}\n                      onKeyDown={(e) => {\n                        if (e.key === "Enter" || e.key === " ") {\n                          e.preventDefault();\n                          playPop();\n                          setSelectedModule(isSelected ? null : id);\n                        }\n                      }}'
)

# Functional Bay
content = content.replace(
    'onClick={() => selectedModule && handleSlotModule(selectedModule, "functional")}',
    'onClick={() => selectedModule && handleSlotModule(selectedModule, "functional")}\n                tabIndex={0}\n                onKeyDown={(e) => {\n                  if (e.key === "Enter" || e.key === " ") {\n                    e.preventDefault();\n                    if (selectedModule) handleSlotModule(selectedModule, "functional");\n                  }\n                }}'
)

# Non-Functional Bay
content = content.replace(
    'onClick={() => selectedModule && handleSlotModule(selectedModule, "non-functional")}',
    'onClick={() => selectedModule && handleSlotModule(selectedModule, "non-functional")}\n                tabIndex={0}\n                onKeyDown={(e) => {\n                  if (e.key === "Enter" || e.key === " ") {\n                    e.preventDefault();\n                    if (selectedModule) handleSlotModule(selectedModule, "non-functional");\n                  }\n                }}'
)

# Slotted Items (Remove)
content = content.replace(
    'onClick={(e) => { e.stopPropagation(); handleSlotModule(slottedId, "tray"); }}',
    'onClick={(e) => { e.stopPropagation(); handleSlotModule(slottedId, "tray"); }}\n                             tabIndex={0}\n                             onKeyDown={(e) => {\n                               if (e.key === "Enter" || e.key === " ") {\n                                 e.preventDefault();\n                                 e.stopPropagation();\n                                 handleSlotModule(slottedId, "tray");\n                               }\n                             }}'
)


with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Comprehensive audit fixes applied.")
