import os

filepath = 'labs/ItSupport18.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_workstation_block = """                       {/* Header */}
                       <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
                          <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest ${ws.state === 'warning' ? 'text-amber-600' : 'text-slate-400'}`}>
                             Station 0{ws.id}
                          </span>
                          {ws.state === 'warning' && (
                             <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                          )}
                       </div>

                       {/* Progress Bar (Timer) */}
                       {ws.state === 'warning' && (
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-200">
                             <motion.div 
                               className="h-full bg-amber-500" 
                               initial={{ width: "100%" }}
                               animate={{ width: `${(ws.timeLeft / ws.maxTime) * 100}%` }}
                               transition={{ ease: "linear" }}
                             />
                          </div>
                       )}

                       {/* Vector Desk Visual */}
                       <div className="absolute inset-0 flex flex-col items-center justify-end pb-[10%] px-4 pointer-events-none">
                          <div className="relative w-full max-w-[200px] flex flex-col items-center">
                             {/* Monitor */}
                             <div className={`w-20 md:w-28 aspect-video rounded-t-lg border-[3px] border-b-0 flex items-center justify-center relative bg-white ${ws.state === 'warning' ? 'border-amber-300' : ws.state === 'breached' ? 'border-rose-400 bg-rose-100' : ws.state === 'secured' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}>
                                {ws.state === 'secured' && <CheckCircle2 size={24} className="text-emerald-500" />}
                                {ws.state === 'breached' && <ShieldAlert size={24} className="text-rose-500" />}
                                {ws.state === 'idle' && <Monitor size={20} className="text-slate-200" />}
                             </div>
                             {/* Desk Surface */}
                             <div className="w-full h-3 md:h-4 bg-slate-200 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] relative flex items-center justify-center gap-2">
                                <Keyboard size={10} className="text-slate-400" />
                                <Mouse size={8} className="text-slate-400" />
                                {/* PC Tower */}
                                <div className="absolute right-2 -bottom-6 md:-bottom-8 w-6 md:w-8 h-12 md:h-16 bg-slate-700 rounded-sm border-t-[4px] border-slate-600 flex flex-col items-center py-2">
                                   <HardDrive size={10} className="text-sky-400 mb-1" />
                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                </div>
                             </div>
                          </div>
                       </div>"""

new_workstation_block = """                       {/* Background Texture (Fixes Empty Void) */}
                       <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                       {/* Header: Camera Overlay Style */}
                       <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10 font-mono">
                          <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest bg-white/90 px-2 py-1 rounded-md shadow-sm border ${ws.state === 'warning' ? 'text-amber-600 border-amber-200' : 'text-slate-500 border-slate-200'}`}>
                             CAM_0{ws.id}
                          </span>
                          {ws.state === 'warning' ? (
                             <span className="flex items-center gap-1.5 text-[9px] md:text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-1 rounded-md shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                BREACH_DETECTED
                             </span>
                          ) : (
                             <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded border border-transparent">
                                SECURE
                             </span>
                          )}
                       </div>

                       {/* Progress Bar (Timer) */}
                       {ws.state === 'warning' && (
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-200 z-20">
                             <motion.div 
                               className="h-full bg-amber-500" 
                               initial={{ width: "100%" }}
                               animate={{ width: `${(ws.timeLeft / ws.maxTime) * 100}%` }}
                               transition={{ ease: "linear" }}
                             />
                          </div>
                       )}

                       {/* Vector Desk Visual - SCALED UP with Worker */}
                       <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 md:pb-8 pointer-events-none">
                          
                          {/* Wall Details (Whiteboard / Poster) */}
                          <div className="absolute top-[25%] w-[60%] max-w-[180px] h-12 md:h-16 bg-white border-2 border-slate-200 rounded-lg shadow-sm opacity-60 flex flex-col items-center justify-center p-2">
                              <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full mb-2" />
                              <div className="w-3/4 h-1.5 md:h-2 bg-slate-100 rounded-full" />
                          </div>

                          <div className="relative w-[85%] max-w-[280px] flex flex-col items-center z-10">
                             {/* Monitor */}
                             <div className={`w-28 md:w-40 aspect-video rounded-t-xl border-[4px] border-b-0 flex items-center justify-center relative bg-white shadow-lg ${ws.state === 'warning' ? 'border-amber-300' : ws.state === 'breached' ? 'border-rose-400 bg-rose-50' : ws.state === 'secured' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}>
                                {ws.state === 'secured' && <CheckCircle2 size={32} className="text-emerald-500 drop-shadow-sm" />}
                                {ws.state === 'breached' && <ShieldAlert size={32} className="text-rose-500 drop-shadow-sm" />}
                                {ws.state === 'idle' && <Monitor size={28} className="text-slate-200" />}
                                
                                {/* Monitor Stand */}
                                <div className={`absolute -bottom-4 w-6 md:w-8 h-4 ${ws.state === 'warning' ? 'bg-amber-200' : 'bg-slate-300'}`} />
                                <div className={`absolute -bottom-5 w-16 md:w-20 h-1 rounded-full ${ws.state === 'warning' ? 'bg-amber-300' : 'bg-slate-400'}`} />
                             </div>
                             
                             {/* Desk Surface */}
                             <div className="w-full h-4 md:h-5 bg-slate-200 rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.1)] relative flex items-center justify-center gap-3 md:gap-5 mt-5 border border-slate-300 z-10">
                                <Keyboard size={12} className="text-slate-400 hidden sm:block" />
                                <Mouse size={8} className="text-slate-400 hidden sm:block" />
                                {/* PC Tower */}
                                <div className="absolute right-2 md:right-4 -bottom-12 md:-bottom-16 w-8 md:w-12 h-16 md:h-20 bg-slate-700 rounded-sm border-t-[6px] border-slate-600 flex flex-col items-center py-2 shadow-xl">
                                   <HardDrive size={14} className="text-sky-400 mb-2 opacity-80" />
                                   <div className={`w-2 h-2 rounded-full ${ws.state === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`} />
                                </div>
                             </div>

                             {/* Employee Silhouette (The Human Error Factor) */}
                             <div className="absolute -bottom-4 md:-bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 drop-shadow-xl transition-all duration-500">
                                {/* Head */}
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] border-white translate-y-3 md:translate-y-4 z-10 ${ws.state === 'warning' ? 'bg-amber-600' : ws.state === 'breached' ? 'bg-rose-700' : 'bg-slate-800'}`} />
                                {/* Shoulders */}
                                <div className={`w-28 h-16 md:w-32 md:h-20 rounded-t-[3rem] border-[3px] border-b-0 border-white ${ws.state === 'warning' ? 'bg-amber-500' : ws.state === 'breached' ? 'bg-rose-600' : 'bg-slate-700'}`} />
                             </div>
                          </div>
                       </div>"""

if old_workstation_block in content:
    content = content.replace(old_workstation_block, new_workstation_block)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find old workstation block")
