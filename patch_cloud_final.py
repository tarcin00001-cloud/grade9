import re

try:
    with open('labs/CloudStrategy16.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix playSuccess(a, b) to playSuccess()
    content = re.sub(r'playSuccess\([^)]+\)', 'playSuccess()', content)

    # Fix missing labId
    content = re.sub(r'<LabShell\s+title=', '<LabShell labId="cloudstrategy16" title=', content)
    content = re.sub(r'<LabShell\s+children=', '<LabShell labId="cloudstrategy16" children=', content)
    content = re.sub(r'<LabShell\s+theme=', '<LabShell labId="cloudstrategy16" theme=', content)
    
    # Just in case LabShell starts with something else
    content = re.sub(r'<LabShell\n', '<LabShell\n      labId="cloudstrategy16"\n', content)

    with open('labs/CloudStrategy16.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched CloudStrategy16 successfully.")
except Exception as e:
    print(f"Error patching: {e}")
