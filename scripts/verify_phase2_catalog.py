import re
import os
import sys

workspace_dir = r"c:\Users\LocalAdmin\working\Dev\Lab9"
labs_ts_path = os.path.join(workspace_dir, "data", "labs.ts")
page_tsx_path = os.path.join(workspace_dir, "app", "labs", "[slug]", "page.tsx")

passes = []
errors = []

def check(condition, desc):
    if condition:
        passes.append(desc)
    else:
        errors.append(desc)

with open(labs_ts_path, "r", encoding="utf-8") as f:
    labs_content = f.read()

with open(page_tsx_path, "r", encoding="utf-8") as f:
    page_content = f.read()

# 1. Parse entries from data/labs.ts
entry_regex = re.compile(r'\{n:\s*(\d+),\s*slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*lesson:\s*"([^"]+)",\s*desc:\s*"([^"]+)",\s*theme:\s*"([^"]+)",\s*archetype:\s*"([^"]+)",\s*status:\s*"([^"]+)"\}')
matches = entry_regex.findall(labs_content)

check(len(matches) == 59, f"data/labs.ts registers exactly 59 labs (found {len(matches)})")

expected_11_slugs = [
    "torrouting9",
    "microservices9",
    "zerodayexploit9",
    "machinelearningtraining9",
    "graphqlbasics9",
    "oauthflow9",
    "reverseproxies9",
    "webassembly9",
    "jwttokens9",
    "continuousintegration9",
    "testingstrategies43"
]

slugs_found = [m[1] for m in matches]
n_values = [int(m[0]) for m in matches]

check(n_values == list(range(1, 60)), "n values are strictly sequential from 1 through 59")
check(len(set(slugs_found)) == 59, "All 59 slugs are unique")

# Check the new 11 slugs exist in n: 49..59
new_11_in_catalog = slugs_found[48:]
for slug in expected_11_slugs:
    check(slug in new_11_in_catalog, f"Catalog includes newly registered slug '{slug}' in entries 49-59")

# 2. Check router branches in page.tsx for all 59 slugs
for slug in slugs_found:
    branch = f'slug === "{slug}"'
    check(branch in page_content, f"Router page.tsx has branch for slug '{slug}'")

# 3. Check reverseproxies9 in router
check('import ReverseProxies9' in page_content, "Router imports ReverseProxies9")
check('if (slug === "reverseproxies9") return <ReverseProxies9 />;' in page_content, "Router wires reverseproxies9 branch")

# 4. Check that no canonical labs (1..48) were modified in data/labs.ts
check('{n:1, slug:"contentdeliverynetwork9"' in labs_content, "Lab 1 contentdeliverynetwork9 is intact")
check('{n:48, slug:"blockchain9"' in labs_content, "Lab 48 blockchain9 is intact")

print(f"\nTotal Checks: {len(passes) + len(errors)}")
print(f"Passed: {len(passes)}")
print(f"Failed: {len(errors)}")

if errors:
    print("\nFAILURES:")
    for err in errors:
        print(f"  ❌ {err}")
    sys.exit(1)
else:
    print("\nALL PHASE 2 CATALOG & ROUTER CHECKS PASSED!")
    for p in passes:
        print(f"  [OK] {p}")
