import os

target_file = 'labs/VirtualMem9.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the RAM Section to use centered constrained layout with aspect-square
old_ram_section = """{/* RAM Section - Flex to fill half the motherboard space */}
              <div className="flex-1 flex flex-col p-4 md:p-5 border-b border-slate-200 relative z-10 bg-slate-50/50 min-h-0">
                 <h3 className="shrink-0 text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap size={14} /> Physical RAM Array
                 </h3>
                 
                 <div className="flex-1 grid grid-cols-3 gap-3 md:gap-5 min-h-0">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative w-full h-full rounded-xl bg-slate-100 border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center overflow-hidden min-h-[60px]">"""

new_ram_section = """{/* RAM Section - Centered Console Approach */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 border-b border-slate-200 relative z-10 bg-slate-50/50 min-h-0">
                 <div className="w-full max-w-lg flex flex-col">
                    <h3 className="shrink-0 text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Zap size={14} /> Physical RAM Array
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3 md:gap-5 w-full">
                       {[0, 1, 2].map(slotIndex => {
                          const appId = ram[slotIndex];
                          const app = appId ? APPS.find(a => a.id === appId) : null;
                          
                          return (
                             <div key={slotIndex} className="relative aspect-square w-full rounded-xl bg-slate-100 border-2 border-slate-300 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center overflow-hidden">"""
content = content.replace(old_ram_section, new_ram_section)

# 2. Update the Disk Section to use centered constrained layout with aspect-square
old_disk_section = """{/* Disk Section - Flex to fill bottom half */}
              <div className="flex-1 flex flex-col p-4 md:p-5 relative min-h-0 bg-transparent">
                 <div className="shrink-0 flex items-center justify-between mb-3">
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

                 {/* FIXED: grid-cols-5 ALWAYS so it never wraps to a second row, squashing automatically to fit horizontally and vertically! */}
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
                               className={`w-full h-full bg-white shadow-sm border border-slate-300 border-b-[4px] rounded-xl flex flex-col items-center justify-center p-1 md:p-2 cursor-pointer hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all group relative z-10`}
                             >"""

new_disk_section = """{/* Disk Section - Centered Console Approach */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative min-h-0 bg-transparent">
                 <div className="w-full max-w-2xl flex flex-col">
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

                    <div className="grid grid-cols-5 gap-2 md:gap-4 w-full">
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
                                  className={`aspect-square w-full bg-white shadow-sm border border-slate-300 border-b-[4px] rounded-xl flex flex-col items-center justify-center p-1 md:p-2 cursor-pointer hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all group relative z-10`}
                                >"""
content = content.replace(old_disk_section, new_disk_section)

# 3. Update the Empty Disk Bays to use aspect-square
old_empty_disk = """{/* Empty Drive Bays */}
                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="w-full h-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden min-h-[60px]">"""

new_empty_disk = """{/* Empty Drive Bays */}
                       {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center relative overflow-hidden">"""
content = content.replace(old_empty_disk, new_empty_disk)

# 4. Close the new inner wrapper divs for RAM and Disk
old_ram_close = """</div>
                 </div>
              </div>

              {/* Disk Section"""

new_ram_close = """</div>
                    </div>
                 </div>
              </div>

              {/* Disk Section"""
content = content.replace(old_ram_close, new_ram_close)

old_disk_close = """</div>
                 </div>
              </div>

           </div>"""

new_disk_close = """</div>
                    </div>
                 </div>
              </div>

           </div>"""
content = content.replace(old_disk_close, new_disk_close)


with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Applied Option 1 (Locked Aspect Ratio & Centered layout) to {target_file}")
