with open("labs/ratelimiting9.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "{stage === 5 && (" in line and "               " in line:
        if "bg-yellow-200" not in line and "bg-white" not in line and "bg-emerald-900" not in line:
            # Let's verify by just printing it first
            pass

# Let's use re instead
import re
with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

content = content.replace("               {stage === 5 && (\n             \n             {/* Diegetic Sticky Note for early stages */}", "             {/* Diegetic Sticky Note for early stages */}")

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
