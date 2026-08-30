import re

with open('labs/DeepLearning9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure Celebration is imported
if 'import Celebration' not in content:
    content = content.replace('import LabShell', 'import Celebration from "@/components/Celebration";\nimport LabShell')

if 'RotateCcw' not in content:
    content = content.replace('import { Brain', 'import { Brain, RotateCcw')

# Replace the custom overlay block
custom_overlay_pattern = r'\{\/\* Custom Mission Success Overlay \*\/\}.*?(?=\<div className="flex-1 flex flex-col)'
replacement = """<Celebration
        isActive={hasWon}
        message={missionIndex === MISSIONS.length - 1 
                 ? "Amazing! You fully trained the self-driving car. The AI has reached maximum capabilities and the lab is complete!" 
                 : "Great job! The AI learned to correctly identify the patterns. Let's move to a harder task!"}
        onReplay={missionIndex < MISSIONS.length - 1 ? handleNextMission : () => { setMissionIndex(0); handleReset(); }}
        actionLabel={missionIndex < MISSIONS.length - 1 ? "Next Mission" : "Replay Lab"}
        actionIcon={missionIndex < MISSIONS.length - 1 ? <Play size={20} fill="currentColor" /> : <RotateCcw size={20} />}
      />

      """
      
content = re.sub(custom_overlay_pattern, replacement, content, flags=re.DOTALL)

with open('labs/DeepLearning9.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Celebration injected!")
