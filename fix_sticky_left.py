with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

content = content.replace("absolute top-2 right-2 sm:top-2 sm:-right-8 bg-yellow-200", "absolute top-12 left-2 sm:top-16 sm:-left-6 md:-left-10 bg-yellow-200")

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
