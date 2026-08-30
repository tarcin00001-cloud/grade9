import os

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    content = f.read()

# 1. Theme and Header Text
content = content.replace('theme="cosmos"', 'theme="ocean"')
content = content.replace(
    'Classify Functional user features vs Non-Functional quality metrics to launch production software!',
    'Sort the App Features (what the app does) from the Performance Goals (how well it runs)!'
)
content = content.replace('USER FEATURES', 'APP FEATURES')
content = content.replace('QUALITY GAUGES', 'PERFORMANCE GOALS')
content = content.replace('Slot Feature', 'App Feature')
content = content.replace('Slot Metric', 'Performance Goal')
content = content.replace('BLUEPRINT REPOSITORY', 'BLUEPRINT REPOSITORY (DRAG OR CLICK)')

# 2. Vocabulary Simplification
replacements_vocab = [
    ('AES-256 Encryption', 'Bank-Grade Security'),
    ('Cryptographic protection for passwords and cards', "Scrambles passwords so hackers can't read them"),
    ('Zero Data Loss', 'Cloud Backup'),
    ('Replicated storage preventing database wipes', 'Saves everything safely so nothing gets deleted'),
    ('Physical Rack Server', 'Buy a Metal Server'),
    ('Hardware equipment (premature solution trap)', 'Trap! We are writing software, not buying hardware yet.'),
    ('Make It Secure', 'Make It Safe'),
    ('Vague, unmeasurable goal (cannot be tested)', 'Trap! This is a vague wish. Programmers need exact rules.'),
    ('Latency Under 50ms', 'Lightning Fast'),
    ('Instant response with zero input delay', 'The app reacts instantly as soon as you tap'),
    ('Zero Buffering', 'Smooth Streaming'),
    ('Eliminates video playback interruptions', 'Video plays without pausing or loading circles'),
    ('Lossless Audio', 'Crystal Clear Audio'),
    ('High-fidelity sound transmission', 'Sound quality is perfectly crisp'),
    ('Fiber Optic CDN', 'Buy Fiber Cables'),
    ('Hardware network infrastructure', 'Trap! Focus on the app code, not internet cables.'),
    ('Make It Fast', 'Make It Fast'),
    ('Vague performance requirement', "Trap! How fast is 'fast'? We need measurable numbers."),
    ('99.99% Uptime', 'Never Goes Down'),
    ('High availability server configuration', 'The app stays online 99.9% of the year'),
    ('10k Concurrent', 'Handles Huge Crowds'),
    ('Scales to handle ten thousand simultaneous users', 'Supports 10,000 users clicking at the same time')
]
for old, new in replacements_vocab:
    content = content.replace(old, new)

# 3. High Contrast Light Theme Colors
replacements_colors = [
    ('text-white', 'text-slate-900'),
    ('text-slate-200', 'text-slate-800'),
    ('text-slate-300', 'text-slate-700'),
    ('text-slate-400', 'text-slate-600'),
    ('bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 border-white/10', 'bg-white rounded-2xl border-2 border-slate-200 shadow-sm'),
    ('bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10', 'bg-white rounded-2xl border border-slate-200 shadow-sm'),
    ('bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]', 'bg-slate-50 rounded-3xl border border-slate-200 shadow-xl'),
    ('bg-slate-950', 'bg-slate-100'),
    ('border-slate-800', 'border-slate-300'),
    ('border-slate-700/50', 'border-slate-300'),
    ('border-slate-700', 'border-slate-300'),
    ('bg-slate-900', 'bg-white'),
    ('hover:bg-slate-800', 'hover:bg-slate-50'),
    ('bg-slate-800', 'bg-slate-200'),
    ('bg-slate-100 bg-[radial-gradient', 'bg-slate-950 bg-[radial-gradient'),
    ('from-slate-900', 'from-slate-800'),
    ('grid-cols-[repeat(auto-fit,minmax(140px,1fr))]', 'grid-cols-2 md:grid-cols-3'),
]
for old, new in replacements_colors:
    content = content.replace(old, new)

# 4. Special fixes post color-replace
content = content.replace('text-slate-800 uppercase tracking-[0.15em] mb-4">Live Simulator', 'text-slate-800 uppercase tracking-[0.15em] mb-4">Live Simulator')
content = content.replace('className="text-[10px] text-slate-500 font-mono"', 'className="text-[10px] text-slate-400 font-mono"')
content = content.replace('text-[11px] text-slate-600 font-semibold uppercase tracking-widest mt-4">Awaiting Architecture', 'text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-4">Awaiting Architecture')
content = content.replace('text-slate-900 border-indigo-900', 'text-white border-indigo-200')
content = content.replace('bg-rose-600 text-slate-900', 'bg-rose-600 text-white')
content = content.replace('className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 active:border-b-0 active:translate-y-1 ${', 'className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 active:border-b-0 active:translate-y-1 text-white ${')
content = content.replace('text-slate-700 bg-slate-200 flex items-center justify-center', 'text-slate-700 bg-slate-200 flex items-center justify-center')
content = content.replace('text-cyan-500/40', 'text-cyan-700/60')
content = content.replace('text-emerald-500/40', 'text-emerald-700/60')

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(content)

print("Light theme, vocabulary, and grid fixes applied successfully.")
