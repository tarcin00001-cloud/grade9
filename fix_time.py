import re
with open('labs/TwoFactorAuth9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const formattedTime = :;', 'const formattedTime = ${Math.floor(secondsLeft / 60)}:;')

with open('labs/TwoFactorAuth9.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
