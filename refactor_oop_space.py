import os
import re

with open('labs/ClassesInJava9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'subtitle="[^"]+"\s*',
    '',
    content
)

with open('labs/ClassesInJava9.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Subtitle removed. Space reclaimed!")
