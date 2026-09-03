import os, re, glob
for p in glob.glob('labs/*.tsx'):
    with open(p, 'r', encoding='utf-8') as f: content = f.read()
    content = re.sub(r'reportComplete\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*(\d+)\s*\)', r'reportComplete({ labId: "\1", points: \2 })', content)
    content = re.sub(r'reportComplete\(\s*(\d+)\s*\)', r'reportComplete({ points: \1 })', content)
    if '<LabShell' in content and 'labId=' not in content:
        lab_id = os.path.basename(p).replace('.tsx', '').lower()
        content = re.sub(r'<LabShell', f'<LabShell labId="{lab_id}"', content)
    with open(p, 'w', encoding='utf-8') as f: f.write(content)
