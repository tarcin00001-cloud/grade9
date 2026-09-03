import math
import random

def simulate(capacity, refillRate):
    tokens = capacity
    health = 100
    droppedGood = 0
    droppedBad = 0
    processedGood = 0
    processedBad = 0
    
    lastRefill = 0
    lastGoodSpawn = 0
    lastBadSpawn = 0
    burstCount = 0
    
    # Packets format: {"type": 'good'/'bad', "y": 0, "status": 'moving'}
    packets = []
    
    # Run for 20 seconds (enough to drop 60 bad packets)
    total_ms = 10000
    
    for now in range(0, total_ms, 33): # 30 FPS ~ 33ms delta
        # Refill
        if now - lastRefill > (1000 / refillRate):
            tokens = min(capacity, tokens + 1)
            lastRefill = now
            
        # Spawn Good
        if now - lastGoodSpawn > 2000:
            burstCount = 5
            lastGoodSpawn = now
            
        if burstCount > 0 and random.random() > 0.4:
            packets.append({"type": "good", "y": 0, "status": "moving"})
            burstCount -= 1
            
        # Spawn Bad
        if now - lastBadSpawn > 50:
            packets.append({"type": "bad", "y": 0, "status": "moving"})
            lastBadSpawn = now
            
        # Move & Evaluate
        speed = 4
        bouncerY = 50
        serverY = 90
        
        for p in packets:
            if p["status"] == "moving":
                oldY = p["y"]
                p["y"] += speed
                
                if oldY < bouncerY and p["y"] >= bouncerY:
                    if tokens > 0:
                        tokens -= 1
                    else:
                        p["status"] = "dropped"
                        if p["type"] == "bad":
                            droppedBad += 1
                        else:
                            droppedGood += 1
                            
                if p["y"] >= serverY and p["status"] == "moving":
                    p["status"] = "processed"
                    if p["type"] == "bad":
                        health -= 5
                        processedBad += 1
                    else:
                        processedGood += 1
                        
                    if refillRate > 12:
                        health -= 0.5
                        
        # Filter packets
        packets = [p for p in packets if p["y"] < 110 and (p["status"] == "moving" or p["y"] < bouncerY + 20)]
        
        # Check fail/win
        if health <= 0 or droppedGood >= 3:
            return False, f"Failed at {now}ms: health={health}, droppedGood={droppedGood}, droppedBad={droppedBad}"
        
        if droppedBad > 60:
            return True, f"Won at {now}ms!"
            
    return False, f"Timeout at {total_ms}ms: health={health}, droppedGood={droppedGood}, droppedBad={droppedBad}"

results = []
for c in range(1, 21):
    for r in range(2, 26):
        wins = 0
        for _ in range(5): # run 5 times due to randomness
            win, msg = simulate(c, r)
            if win:
                wins += 1
        if wins == 5:
            results.append(f"C={c}, R={r}")

print("Winning combinations:", results)
