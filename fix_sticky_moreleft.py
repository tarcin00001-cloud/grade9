with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

content = content.replace("absolute top-12 left-2 sm:top-16 sm:-left-6 md:-left-10 bg-yellow-200", "absolute top-12 left-2 sm:top-16 sm:-left-12 md:-left-24 lg:-left-32 xl:-left-40 bg-yellow-200")

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
