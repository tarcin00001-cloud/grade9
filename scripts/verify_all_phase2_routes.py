import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:3008"

# 11 newly cataloged labs with their expected titles and slugs
NEW_LABS = [
    {"n": 49, "slug": "torrouting9", "title": "The Onion Router (TOR) Network"},
    {"n": 50, "slug": "microservices9", "title": "Microservices Architecture"},
    {"n": 51, "slug": "zerodayexploit9", "title": "Zero-Day Exploits & Patching"},
    {"n": 52, "slug": "machinelearningtraining9", "title": "Supervised ML (Gradient Descent)"},
    {"n": 53, "slug": "graphqlbasics9", "title": "GraphQL Data Fetching"},
    {"n": 54, "slug": "oauthflow9", "title": "OAuth 2.0 (SSO Identity)"},
    {"n": 55, "slug": "reverseproxies9", "title": "Reverse Proxies (NGINX)"},
    {"n": 56, "slug": "webassembly9", "title": "WebAssembly (WASM) Speed"},
    {"n": 57, "slug": "jwttokens9", "title": "JSON Web Tokens (JWT)"},
    {"n": 58, "slug": "continuousintegration9", "title": "Continuous Integration (CI/CD)"},
    {"n": 59, "slug": "testingstrategies43", "title": "Testing Strategies & TestingScript"},
]

SPOT_CHECK_LABS = [
    {"slug": "contentdeliverynetwork9", "title": "CDN Network Architecture"},
    {"slug": "sshkeys9", "title": "SSH Key Cryptography"},
    {"slug": "blockchain9", "title": "Blockchain High-Security Vaults"}
]

passes = []
failures = []

def test_url(url, expected_snippets=None):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Phase2Verifier/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            content = resp.read().decode("utf-8", errors="replace")
            
            if status != 200:
                failures.append(f"GET {url} returned HTTP {status} (expected 200)")
                return False, ""
            
            if expected_snippets:
                for snippet in expected_snippets:
                    if snippet not in content:
                        failures.append(f"GET {url} missing expected snippet: '{snippet}'")
                        return False, ""
            
            passes.append(f"GET {url} -> HTTP 200 OK (title/content confirmed)")
            return True, content
    except urllib.error.HTTPError as e:
        failures.append(f"GET {url} returned HTTP {e.code} (404/Error)")
        return False, ""
    except Exception as e:
        failures.append(f"GET {url} failed with error: {e}")
        return False, ""

print("=" * 60)
print("PHASE 2 HTTP ROUTE VERIFICATION")
print("=" * 60)

# 1. Test Home Page for 59 count
print("\n[1] Verifying Home / Catalog Dashboard Page...")
ok, home_html = test_url(f"{BASE_URL}/", ["59"])
if ok:
    print("  -> Home page rendered with dynamic 59 lab count!")

# 2. Test All 11 New Labs
print("\n[2] Verifying 11 Newly Registered Labs...")
for lab in NEW_LABS:
    url = f"{BASE_URL}/labs/{lab['slug']}"
    alt_title = lab["title"].replace("&", "&amp;")
    ok, _ = test_url(url, [alt_title])
    if ok:
        print(f"  -> [n:{lab['n']}] /labs/{lab['slug']} renders successfully with title '{lab['title']}'!")

# 3. Spot check canonical labs
print("\n[3] Spot-checking Canonical Existing Labs...")
for lab in SPOT_CHECK_LABS:
    url = f"{BASE_URL}/labs/{lab['slug']}"
    alt_title = lab["title"].replace("&", "&amp;")
    ok, _ = test_url(url, [alt_title])
    if ok:
        print(f"  -> [Canonical] /labs/{lab['slug']} renders cleanly with title '{lab['title']}'!")

print("\n" + "=" * 60)
print(f"SUMMARY: {len(passes)} passed, {len(failures)} failed")
print("=" * 60)

if failures:
    print("\nFAILURES:")
    for f in failures:
        print(f"  [FAIL] {f}")
    sys.exit(1)
else:
    print("\nALL 11 NEW ROUTES + CANONICAL SPOT-CHECKS RESOLVED WITH HTTP 200 OK!")
    sys.exit(0)
