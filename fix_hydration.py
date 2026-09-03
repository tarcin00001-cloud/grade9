with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

# Add isMounted to state
state_block = """  const [stage, setStage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);"""
content = content.replace("  const [stage, setStage] = useState(1);", state_block)

# Wrap the sticky notes in isMounted
content = content.replace("{stage <= 2 && (", "{isMounted && stage <= 2 && (")
content = content.replace("{stage === 5 && (", "{isMounted && stage === 5 && (")

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
