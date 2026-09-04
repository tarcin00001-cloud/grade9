import re

filepath = r'c:\Users\LocalAdmin\working\Dev\Lab9\labs\ContentDeliveryNetwork9.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('      )}\n    </div>\n  );\n}', '        )}\n    </div>\n  );\n}')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
