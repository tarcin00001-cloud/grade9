import os

target_file = 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the Data Bus Queue items (Make them square to match RAM/Disk and prevent Framer Motion text-squish)
old_queue = """className={`bg-white border border-slate-300 border-b-[3px] shadow-sm rounded-lg p-2 md:p-2.5 pr-2 md:pr-3 flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-slate-50 active:border-b-0 active:translate-y-[2px] transition-all flex-1 min-w-[120px] z-20`}
                          >
                             <div className={`w-7 h-7 md:w-8 md:h-8 rounded-md ${app.bgColor} border ${app.borderColor} flex items-center justify-center shrink-0`}>
                                <app.icon size={14} className={app.color} />
                             </div>
                             <span className="font-bold text-slate-800 text-[10px] md:text-[11px] uppercase tracking-wider truncate drop-shadow-sm">{app.name}</span>"""

new_queue = """className={`bg-white border border-slate-300 border-b-[3px] shadow-sm rounded-lg p-2 flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer hover:bg-slate-50 active:border-b-0 active:translate-y-[2px] transition-all w-20 h-20 md:w-24 md:h-24 shrink-0 z-20`}
                          >
                             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md ${app.bgColor} border ${app.borderColor} flex items-center justify-center shrink-0`}>
                                <app.icon size={16} className={app.color} />
                             </div>
                             <span className="font-bold text-slate-800 text-[9px] md:text-[10px] uppercase tracking-wider text-center drop-shadow-sm leading-tight">{app.name}</span>"""
content = content.replace(old_queue, new_queue)

# 2. Fix the RAM Slot Cartridge (Fill the empty space, increase icon/text size, fix inset)
old_ram = """className={`absolute inset-[6px] rounded-lg bg-white border border-slate-300 border-b-[4px] shadow-sm flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all`}
                                >
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-white/90 backdrop-blur-sm rounded-lg absolute inset-0 z-20">
                                         <Loader2 size={16} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin mb-2`} />
                                         <div className="w-2/3 h-1 md:h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                            <motion.div 
                                              initial={{ width: 0 }} 
                                              animate={{ width: "100%" }} 
                                              transition={{ duration: driveType === "HDD" ? 2.5 : 0.3 }}
                                              className={`h-full ${driveType === "HDD" ? "bg-amber-500" : "bg-emerald-500"}`} 
                                            />
                                         </div>
                                      </div>
                                   ) : (
                                      <>
                                         <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md ${app.bgColor} flex items-center justify-center border ${app.borderColor}`}>
                                            <app.icon size={16} className={app.color} />
                                         </div>
                                         <span className={`mt-1 md:mt-2 font-bold text-[9px] md:text-[10px] uppercase tracking-wider text-slate-700`}>{app.name}</span>"""

new_ram = """className={`w-[92%] h-[92%] rounded-lg bg-white border border-slate-300 border-b-[4px] shadow-sm flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all`}
                                >
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-white/90 backdrop-blur-sm rounded-lg absolute inset-0 z-20">
                                         <Loader2 size={24} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin mb-2`} />
                                         <div className="w-2/3 h-1.5 md:h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                            <motion.div 
                                              initial={{ width: 0 }} 
                                              animate={{ width: "100%" }} 
                                              transition={{ duration: driveType === "HDD" ? 2.5 : 0.3 }}
                                              className={`h-full ${driveType === "HDD" ? "bg-amber-500" : "bg-emerald-500"}`} 
                                            />
                                         </div>
                                      </div>
                                   ) : (
                                      <>
                                         <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl ${app.bgColor} flex items-center justify-center border-2 ${app.borderColor}`}>
                                            <app.icon size={24} className={app.color} />
                                         </div>
                                         <span className={`mt-1 md:mt-2 font-black text-[10px] md:text-xs uppercase tracking-wider text-slate-700`}>{app.name}</span>"""
content = content.replace(old_ram, new_ram)

# 3. Fix the Disk Bay Cartridge (Increase icon/text size slightly to fill space)
old_disk = """<div className={`w-6 h-6 md:w-8 md:h-8 rounded-md ${app.bgColor} flex items-center justify-center border ${app.borderColor} mb-1 md:mb-2`}>
                                   <app.icon size={14} className={app.color} />
                                </div>
                                <span className={`font-bold text-[8px] md:text-[10px] uppercase tracking-wider text-center text-slate-700 leading-tight`}>{app.name}</span>"""

new_disk = """<div className={`w-8 h-8 md:w-10 md:h-10 rounded-md ${app.bgColor} flex items-center justify-center border ${app.borderColor} mb-1 md:mb-2`}>
                                   <app.icon size={18} className={app.color} />
                                </div>
                                <span className={`font-black text-[9px] md:text-[11px] uppercase tracking-wider text-center text-slate-700 leading-tight`}>{app.name}</span>"""
content = content.replace(old_disk, new_disk)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Applied layout and proportion fixes to {target_file}")
