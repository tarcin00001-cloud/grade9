import re
with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

# First, revert ALL isMounted and stage usages back to normal
content = content.replace("isMounted && stage <= 2 &&", "stage <= 2 &&")
content = content.replace("isMounted && stage === 5 &&", "stage === 5 &&")

# Now, we want to completely remove the sticky notes that are INSIDE the action panel
content = re.sub(r" *\{/\* Diegetic Sticky Notes \(Jutting out into empty space\) \*/\}\n *\{stage (<= 2|=== 5) && \(\n *<div className=\"absolute -top-12.*?</div>\n *\)\}\n", "", content, flags=re.DOTALL)
content = re.sub(r" *\{stage === 5 && \(\n *<div className=\"absolute -top-12.*?</div>\n *\)\}\n", "", content, flags=re.DOTALL)

# Now, apply isMounted ONLY to the External Diegetic Sticky Notes
# We can find them by looking for {/* External Diegetic Sticky Notes */}
external_notes = """          {/* External Diegetic Sticky Notes */}
          {isMounted && stage <= 2 && ("""
content = content.replace("          {/* External Diegetic Sticky Notes */}\n          {stage <= 2 && (", external_notes)

external_note5 = """          )}
          {isMounted && stage === 5 && ("""
content = content.replace("          )}\n          {stage === 5 && (", external_note5)

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
