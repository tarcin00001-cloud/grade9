import re

filepath = 'labs/ResponsibleAI23.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* RIGHT COLUMN: Case Text & Stamps */}"
end_marker = "      </div>\n    </LabShell>"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find blocks")
    exit(1)

new_right_column = """{/* RIGHT COLUMN: Case Text & Stamps */}
        <div className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-3 md:gap-4 min-h-0 transition-all ${phase !== 'playing' ? 'opacity-50 pointer-events-none' : ''}`}>
           
           {/* Text Description */}
           <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl p-4 md:p-6 flex flex-col justify-center border-2 border-slate-200 shadow-sm relative overflow-hidden">
              <AnimatePresence mode="wait">
                 <motion.div 
                    key={`text-${currentCase.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                 >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center border-2 border-sky-100 mb-2 md:mb-3 shadow-sm shrink-0">
                       <FileText size={18} />
                    </div>
                    <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-widest mb-1 md:mb-2 leading-tight">{currentCase.title}</h2>
                    <p className="text-[11px] md:text-sm text-slate-600 font-medium leading-snug">
                       {currentCase.description}
                    </p>
                 </motion.div>
              </AnimatePresence>
           </div>

           {/* Classification Stamps */}
           <div className="shrink-0 bg-slate-100 rounded-3xl p-3 md:p-4 shadow-inner border-2 border-slate-200 flex flex-col items-center w-full">
              <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                 <Stamp size={14} /> Authorization Stamps
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
                 {STAMPS.map(stamp => (
                    <button
                      key={stamp.id}
                      onClick={() => handleStamp(stamp.id as Category)}
                      className={`relative w-full rounded-2xl border-b-[4px] flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2.5 md:p-3 transition-all group hover:-translate-y-1 active:border-b-0 active:translate-y-1 bg-white border-slate-300 shadow-sm`}
                    >
                       <stamp.icon size={26} strokeWidth={2.5} className={`${stamp.color} transition-transform group-hover:scale-110`} />
                       <span className={`font-black text-[9px] md:text-[10px] uppercase tracking-wider text-center leading-tight ${stamp.color}`}>
                          {stamp.name}
                       </span>
                    </button>
                 ))}
              </div>
           </div>

        </div>

"""

content = content[:start_idx] + new_right_column + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied aggressive compacting fix")
