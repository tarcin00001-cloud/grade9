import re

with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

# Replace stage 2 sticky position
content = content.replace("absolute -top-6 -right-2 bg-yellow-200", "absolute top-8 left-12 sm:top-12 sm:left-24 bg-yellow-200")

# Replace stage 5 sticky position
content = content.replace("absolute -top-12 -left-48 bg-yellow-200", "absolute top-8 left-12 sm:top-12 sm:left-24 bg-yellow-200")

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
