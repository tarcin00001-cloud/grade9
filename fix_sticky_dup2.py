import re
with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

content = re.sub(r" *\{/\* Diegetic Sticky Note \*/\}\n *\{stage === 5 && \(\n *<div className=\"relative bg-yellow-200.*?</p>\n *</div>\n *\)\}\n", "", content, flags=re.DOTALL)

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
