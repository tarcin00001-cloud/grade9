with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

import re
# Remove old trapped celebration if present
content = re.sub(r'<div className="absolute -right-4 -top-4 opacity-10"><Celebration isActive=\{true\} /></div>', '', content)

# Check if we already inserted it
if "<Celebration isActive={stage === 7} />" not in content:
    # Find the closing angle bracket of LabShell
    match = re.search(r'<LabShell[^>]*>', content)
    if match:
        content = content[:match.end()] + "\n      <Celebration isActive={stage === 7} />" + content[match.end():]

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
