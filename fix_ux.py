import os

target_file = 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if '{/* Motherboard Area - 100% Fluid Flex Grid */}' in line:
        start_idx = i
        break

if start_idx != -1:
    top_part = "".join(lines[:start_idx])
    
    new_motherboard = """           {/* Motherboard Area - 100% Fluid Flex Grid */}
           <div className="flex-1 flex flex-col min-h-0 relative bg-white">
              
              {/* RAM Section - Fluid Wide Layout */}
              <div className="flex-1 flex flex-col p-4 md:p-5 border-b border-slate-200 relative z-10 bg-slate-50/50 min-h-0">
                 <h3 className="shrink-0 text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap size={14} /> Physical RAM Array
                 </h3>
                 
                 <div className="flex-1 grid grid-cols-3 gap-3 md:gap-5 min-h-0">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative w-full h-full rounded-xl bg-slate-100 border-2 border-slate-300 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center overflow-hidden min-h-[60px]">
                             <div className={`absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full z-20 ${app ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300 shadow-inner'}`} />

                             {!app ? (
                                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">SLOT_{slotIndex}</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-[6px] md:inset-[8px] rounded-lg bg-white border border-slate-300 border-b-[4px] shadow-sm flex flex-row items-center p-2 md:p-3 cursor-pointer z-10 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all overflow-hidden`}
                                >
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-white/90 backdrop-blur-sm rounded-lg absolute inset-0 z-20">
                                         <Loader2 size={24} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin mb-2`} />
                                      </div>
                                   ) : (
                                      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.05}} className="flex w-full h-full items-center justify-between gap-2 md:gap-4 relative z-10">
                                         {/* Left: Icon */}
                                         <div className={`w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-lg ${app.bgColor} flex items-center justify-center border-2 ${app.borderColor}`}>
                                            <app.icon size={20} className={app.color} />
                                         </div>
                                         
                                         {/* Middle: Text & Details */}
                                         <div className="flex-1 flex flex-col justify-center min-w-0">
                                            <span className={`font-black text-[10px] md:text-xs xl:text-sm uppercase tracking-wider text-slate-800 truncate leading-tight`}>{app.name}</span>
                                            <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                                               <div className="h-1.5 w-6 md:w-8 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                                                  <div className="w-full h-full bg-emerald-400 animate-pulse" />
                                               </div>
                                               <span className="text-[8px] font-mono font-bold text-slate-400">ACTIVE</span>
                                            </div>
                                         </div>
                                         
                                         {/* Right: Hardware Barcode/Hex */}
                                         <div className="hidden xl:flex flex-col items-end shrink-0 justify-center">
                                            <span className="text-[9px] font-mono font-black text-slate-300 mb-1">0x0F{slotIndex}A</span>
                                            <div className="flex gap-[2px] opacity-30">
                                               {[...Array(6)].map((_, i) => (
                                                  <div key={i} className={`h-3 bg-slate-500 ${i%2===0 ? 'w-1' : 'w-0.5'}`} />
                                               ))}
                                            </div>
                                         </div>
                                      </motion.div>
                                   )}
                                   
                                   {/* Bottom Gold Pins Skeleton */}
                                   <div className="absolute bottom-0 left-4 right-4 h-1 md:h-1.5 flex gap-[3px] justify-around opacity-40">
                                      {[...Array(12)].map((_, i) => (
                                         <div key={i} className="h-full w-2 bg-amber-400 rounded-t-[1px]" />
                                      ))}
                                   </div>
                                </motion.div>
                             )}
                          </div>
                       )
                    })}
                 </div>
              </div>

              {/* Disk Section - Fluid Layout */}
              <div className="flex-1 flex flex-col p-4 md:p-5 relative min-h-0 bg-transparent">
                 <div className="shrink-0 flex items-center justify-between mb-3 w-full">
                    <h3 className="text-[10px] md:text-xs font-black text-sky-600 uppercase tracking-widest flex items-center gap-2">
                       <HardDrive size={14} /> 
                       PAGEFILE.SYS
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[9px] md:text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-600 px-2 py-1 md:px-3 md:py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle size={12}/> Mech.Drive</span>
                    ) : (
                       <span className="text-[9px] md:text-[10px] font-black bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-1 md:px-3 md:py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5"><FastForward size={12}/> NVMe_Array</span>
                    )}
                 </div>

                 <div className="flex-1 grid grid-cols-5 gap-2 md:gap-4 min-h-0">
                    <AnimatePresence>
                       {disk.map(appId => {
                          const app = APPS.find(a => a.id === appId)!;
                          return (
                             <motion.div
                               layoutId={`app-${app.id}`}
                               key={app.id}
                               initial={{ opacity: 0, scale: 0.8 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.8 }}
                               onClick={() => handleAction(app.id, "disk")}
                               className={`w-full h-full bg-white shadow-sm border border-slate-300 border-b-[4px] rounded-xl flex flex-col items-center justify-center p-1 md:p-2 cursor-pointer hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all group relative z-10 overflow-hidden min-h-[50px]`}
                             >
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.05}} className="flex flex-col items-center justify-center w-full h-full relative z-10">
                                   <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${app.bgColor} flex items-center justify-center border-2 ${app.borderColor} mb-1 md:mb-2`}>
                                      <app.icon size={18} className={app.color} />
                                   </div>
                                   <span className={`font-black text-[9px] md:text-[11px] uppercase tracking-wider text-center text-slate-700 leading-tight truncate w-full px-1`}>{app.name}</span>
                                   <div className="hidden xl:flex mt-1 items-center gap-1">
                                      <HardDrive size={10} className="text-slate-400" />
                                      <span className="text-[8px] font-mono text-slate-400 font-bold">PAGED</span>
                                   </div>
                                </motion.div>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {/* Empty Drive Bays */}
                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="w-full h-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center relative overflow-hidden min-h-[50px]">
                          <span className="text-[8px] md:text-xs font-black text-slate-400 uppercase tracking-widest text-center">Drive<br className="sm:hidden" /> Bay</span>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>
      </div>
    </LabShell>
  );
}
"""
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(top_part + new_motherboard)
    print("UX redesign applied successfully!")
