import os

try:
    with open('labs/CloudStrategy16.tsx', 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Fix missing labId
    c = c.replace('<LabShell\\n        title=', '<LabShell\\n        labId="cloudstrategy16"\\n        title=')
    c = c.replace('<LabShell\\n      title=', '<LabShell\\n      labId="cloudstrategy16"\\n      title=')
    
    # Fix Celebration extra title prop
    c = c.replace('title="Migration Complete!"\\n          message=', 'message=')
    
    # Fix expected 0-1 arguments but got 2 (probably useLabAudio playSuccess(a, b))
    # Or reportComplete? 
    with open('labs/CloudStrategy16.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Patched CloudStrategy16")
except Exception as e:
    print(e)
