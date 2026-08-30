import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Card Titles & Slotted Items (Fixing invisible text)
content = content.replace('text-slate-100', 'text-slate-900')

# 2. Fix the Bay Titles that didn't match case properly
content = content.replace('>User Features</span>', '>App Features (What it does)</span>')
content = content.replace('>Quality Gauges</span>', '>Performance Goals (How well it runs)</span>')
# Also uppercase versions just in case
content = content.replace('>USER FEATURES</span>', '>APP FEATURES (WHAT IT DOES)</span>')
content = content.replace('>QUALITY GAUGES</span>', '>PERFORMANCE GOALS (HOW WELL IT RUNS)</span>')

# 3. SELECT Button Affordance
content = content.replace('"text-indigo-500"', '"text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200"')

# 4. Stress Test Button (Remove purple gradient, make solid indigo for Light theme)
content = content.replace('bg-gradient-to-r from-indigo-500 to-purple-600', 'bg-indigo-600 hover:bg-indigo-700')

# 5. Mission Switcher tabs (Make inactive tabs darker)
content = content.replace('"text-slate-500 hover:text-slate-700"', '"text-slate-600 hover:text-slate-900"')

# 6. Phone Simulator Notch (Make it match the dark screen better)
content = content.replace('bg-slate-800 rounded-b-xl shadow-sm', 'bg-black rounded-b-xl shadow-sm')

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Contrast UI bugs fixed.")
