import re

filepath = r'c:\Users\LocalAdmin\working\Dev\Lab9\labs\ContentDeliveryNetwork9.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the layout
content = content.replace('className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] flex flex-col', 'className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] grid grid-cols-2 md:flex md:flex-col')

# Add timersRef and state machine
state_machine_init = '''  const [worldCelebration, setWorldCelebration] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Added pedagogical state
  const [phase, setPhase] = useState<"LEARN" | "TRY_MANUAL" | "FAIL_OVERLOAD" | "UNDERSTAND" | "IMPROVE" | "COMPLETE" | "OUTCOME">("LEARN");
  const [isOutageActive, setIsOutageActive] = useState(false);
  const [failoverActive, setFailoverActive] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);
'''
content = content.replace('  const [worldCelebration, setWorldCelebration] = useState(false);\n  const [completed, setCompleted] = useState(false);', state_machine_init)

# Modify setTimeout to use timersRef
content = re.sub(r'setTimeout\(', r'timersRef.current.push(setTimeout(', content)
# We need to fix the closing parenthesis of setTimeout if we did this. It's too complex to regex correctly.
