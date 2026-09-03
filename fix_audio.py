import re

with open("labs/ratelimiting9.tsx", "r") as f:
    curr = f.read()

if "import { useLabAudio }" not in curr:
    curr = curr.replace("import { useLMSBridge }", "import { useLMSBridge }\nimport { useLabAudio }")

if "const { playError, playSuccess } = useLabAudio();" not in curr:
    curr = curr.replace('const { reportComplete } = useLMSBridge("ratelimiting9");', 'const { reportComplete } = useLMSBridge("ratelimiting9");\n  const { playError, playSuccess } = useLabAudio();')

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(curr)
print("Success")
