with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

import re
old_sticky = re.search(r"className=\"absolute -top-12 -left-48 bg-yellow-200", content)
if old_sticky:
    content = content[:old_sticky.start()] + "className=\"absolute -top-6 -right-2 bg-yellow-200" + content[old_sticky.end():]
    with open("labs/ratelimiting9.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Could not find sticky note class")
