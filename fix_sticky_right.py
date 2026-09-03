with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

content = content.replace("absolute top-8 left-8 sm:top-12 sm:left-12 z-50 bg-yellow-200", "absolute top-8 right-8 sm:top-12 sm:right-12 z-50 bg-yellow-200")

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
