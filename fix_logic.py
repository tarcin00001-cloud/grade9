import re

with open("labs/ratelimiting9.tsx", "r") as f:
    content = f.read()

# Fix the Bouncer logic
old_bouncer = re.search(r"            if \(oldY < bouncerY && pkt\.y >= bouncerY && stage === 6\) \{.*?\n            \}", content, re.DOTALL)
if old_bouncer:
    new_bouncer = """            if (oldY < bouncerY && pkt.y >= bouncerY && stage === 6) {
              if (p.tokens > 0) {
                p.tokens--;
              } else {
                if (pkt.type === 'good' && capacity >= 5) {
                   // Pedagogical rule: If capacity is >= 5 (burst size), the IP-firewall allows the burst.
                } else {
                   pkt.status = 'dropped';
                   if (pkt.type === 'bad') p.stats.droppedBad++;
                   if (pkt.type === 'good') p.stats.droppedGood++;
                }
              }
            }"""
    content = content[:old_bouncer.start()] + new_bouncer + content[old_bouncer.end():]

# Fix the Damage logic
old_damage = re.search(r"              if \(pkt\.type === 'bad'\) \{\n                p\.health -= 5;", content, re.DOTALL)
if old_damage:
    new_damage = """              if (pkt.type === 'bad') {
                p.health -= 2;"""
    content = content[:old_damage.start()] + new_damage + content[old_damage.end():]

with open("labs/ratelimiting9.tsx", "w") as f:
    f.write(content)
print("Success")
