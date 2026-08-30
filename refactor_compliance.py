import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Fix Math Impossibility (Mission 3 Budget)
# Required = 11700. Giving 12000 allows exact 300 leeway like the others.
content = content.replace('budget: 11500', 'budget: 12000')

# 2. Fix 4.5s LMS Timer Compliance
# Change the second setTimeout from 1500 to 3000 (1.5s test + 3.0s celebration = 4.5s total)
old_timeout = """        if (next.ecommerce && next.streaming && next.superapp && !hasWon) {
          setTimeout(() => {
            setHasWon(true);
            reportComplete();
            playChime();
          }, 1500);
        }"""
new_timeout = """        if (next.ecommerce && next.streaming && next.superapp && !hasWon) {
          setTimeout(() => {
            setHasWon(true);
            reportComplete();
            playChime();
          }, 3000);
        }"""
content = content.replace(old_timeout, new_timeout)

# 3. Fix Mobile Clipping (Responsive Layout Rule)
# Wrap the Left Bay and Right Bay in mobile toggle classes or a tab system. 
# Simplest: The right simulator acts as a full-screen overlay on mobile when testing, or we just rely on standard flex wrapping if allowed? 
# "Everything must fit exactly into a 390x844 boundary without internal clipping or scrollbars"
# I will enforce a mobile tab system by injecting a new state at the top, or just making the simulator hidden on mobile unless testing.
# Let's conditionally hide the Right Bay (Simulator) on mobile UNLESS simStatus is not "idle". And hide Left Bay when Simulator is shown.

old_left_bay_class = 'className="flex-1 flex flex-col gap-4 min-w-0 min-h-0"'
new_left_bay_class = 'className={`flex-1 flex flex-col gap-4 min-w-0 min-h-0 ${simStatus !== "idle" ? "hidden lg:flex" : "flex"}`}'
content = content.replace(old_left_bay_class, new_left_bay_class)

old_right_bay_class = 'className="w-full lg:w-72 xl:w-80 bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between p-3 shrink-0"'
new_right_bay_class = 'className={`w-full lg:w-72 xl:w-80 bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex-col justify-between p-3 shrink-0 ${simStatus === "idle" ? "hidden lg:flex" : "flex"}`}'
content = content.replace(old_right_bay_class, new_right_bay_class)

# Update the "Engage Stress Test" button in the Left Bay so mobile users can trigger it when the Right Bay is hidden
# Wait, the Engage Stress Test button is IN the Right Bay! 
# If the Right Bay is hidden, they can never click it on mobile!
# Let's inject a duplicate button into the Left Bay just for mobile.

mobile_run_button = """
            {/* Mobile Run Button */}
            <div className="lg:hidden shrink-0 mt-2">
              <button
                onClick={handleRunStressTest}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
                  isBudgetExceeded
                    ? "bg-rose-600 text-white"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                }`}
              >
                <Zap size={16} /> Engage Stress Test
              </button>
            </div>
          </div>
"""
content = content.replace('</div>\n\n          {/* Right Bay:', mobile_run_button + '\n          {/* Right Bay:')

# In Right Bay, add a "Back to Architecture" button for mobile so they can return if they fail.
mobile_back_button = """
            {/* Mobile Back Button */}
            <div className="lg:hidden shrink-0 mt-3 border-t border-slate-700/50 pt-3">
              <button
                onClick={() => setSimStatus("idle")}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 flex items-center justify-center gap-2 active:scale-95"
              >
                <ChevronLeft size={16} /> Back to Architecture
              </button>
            </div>
"""
# I'll use ArrowLeft instead of ChevronLeft since ChevronLeft isn't imported.
mobile_back_button = mobile_back_button.replace('ChevronLeft', 'ArrowLeft')

# Insert it right after Launch Action Button in right bay
content = content.replace('</button>\n            </div>\n\n          </div>', '</button>\n            </div>' + mobile_back_button + '\n          </div>')

# Ensure ArrowLeft is imported
if 'ArrowLeft' not in content:
    content = content.replace('ArrowRight,', 'ArrowRight, ArrowLeft,')


with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Compliance fixes applied successfully.")
