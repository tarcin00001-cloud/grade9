with open("labs/Ransomware9.tsx", "r") as f:
    for i, line in enumerate(f):
        if "renderM3Eradicate" in line:
            print(f"Line {i+1}: {repr(line)}")
