import os

with open('components/LabShell.tsx', 'r') as f:
    shell_content = f.read()

# Replace the hardcoded padding with dynamic padding that respects `compact` and `subtitle`
old_padding = 'className="relative z-10 flex flex-col flex-1 min-h-0 w-full px-4 pb-4 pt-[clamp(4.75rem,15vh,8.75rem)] md:px-6 md:pb-6"'
new_padding = 'className={`relative z-10 flex flex-col flex-1 min-h-0 w-full ${compact ? "px-2 md:px-4 pb-1 md:pb-2 " + (subtitle ? "pt-[clamp(4rem,10vh,5rem)]" : "pt-[clamp(2.75rem,8vh,3.5rem)]") : "px-4 md:px-6 pb-4 md:pb-6 " + (subtitle ? "pt-[clamp(4.75rem,15vh,8.75rem)]" : "pt-[clamp(3.75rem,12vh,5.75rem)]")}`}'
shell_content = shell_content.replace(old_padding, new_padding)

with open('components/LabShell.tsx', 'w') as f:
    f.write(shell_content)

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    lab_content = f.read()

# Remove the subtitle
lab_content = lab_content.replace(
    'subtitle="Sort the App Features (what the app does) from the Performance Goals (how well it runs)!"\n',
    ''
)
# If it had \r\n instead
lab_content = lab_content.replace(
    'subtitle="Sort the App Features (what the app does) from the Performance Goals (how well it runs)!"\r\n',
    ''
)
# If it's inline
lab_content = lab_content.replace(
    'subtitle="Sort the App Features (what the app does) from the Performance Goals (how well it runs)!"',
    ''
)

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(lab_content)

print("LabShell padding optimized and subtitle removed.")
