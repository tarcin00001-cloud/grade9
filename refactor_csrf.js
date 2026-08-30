const fs = require('fs');

try {
  let content = fs.readFileSync('labs/CSRFAttacks9.tsx', 'utf8');

  // 1. Soften the jet-black zinc to slate
  content = content.replace(/bg-zinc-950/g, 'bg-slate-900');
  content = content.replace(/bg-zinc-900/g, 'bg-slate-800');
  content = content.replace(/border-zinc-800/g, 'border-slate-700');
  content = content.replace(/border-zinc-700/g, 'border-slate-600');
  content = content.replace(/text-zinc-500/g, 'text-slate-400');
  content = content.replace(/text-zinc-600/g, 'text-slate-500');
  content = content.replace(/text-zinc-900/g, 'text-slate-900');
  content = content.replace(/bg-black/g, 'bg-slate-950');

  // 2. Increase font sizes globally
  content = content.replace(/text-\[8px\]/g, 'text-[11px]');
  content = content.replace(/text-\[9px\]/g, 'text-[12px]');

  // 3. Move Jumbotron to a Sleek HUD Bar
  const oldJumbotron = `            {/* Jumbotron Mission Board */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[440px] bg-slate-800 border-[4px] border-t-0 border-slate-600 rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center p-2 z-40">
                <div className="w-full bg-slate-900 p-2 rounded-lg shadow-[inset_0_2px_15px_rgba(0,0,0,1)] border border-slate-700">`;
                  
  const newJumbotron = `            {/* Sleek Top HUD Mission Board */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[900px] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-start gap-4 px-4 py-2.5 z-40">`;

  content = content.replace(oldJumbotron, newJumbotron);

  // We need to remove the closing </div> of the inner div that was removed
  const closingDivsToFix = `                    </div>
                </div>
            </div>`;
  const fixedClosingDivs = `                    </div>
            </div>`;
  content = content.replace(closingDivsToFix, fixedClosingDivs);

  // The grid inside it
  const oldGrid = `<div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] text-slate-400">`;
  const newGrid = `<div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-slate-300 w-full">`;
  content = content.replace(oldGrid, newGrid);

  // The CheckCircle header
  const oldHeader = `<div className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5 drop-shadow-[0_0_8px_currentColor]">
                       <CheckCircle size={16} /> Sandbox Missions
                    </div>`;
  const newHeader = `<div className="text-cyan-400 font-black text-[12px] uppercase tracking-widest flex items-center gap-2 drop-shadow-md shrink-0 border-r border-slate-700 pr-4">
                       <CheckCircle size={18} /> Missions
                    </div>`;
  content = content.replace(oldHeader, newHeader);

  // 4. Add Click-to-Equip support
  const dragCode = `                                     <motion.div
                                         key="gear"
                                         drag
                                         dragMomentum={false}
                                         onDragEnd={handleGearDragEnd}`;

  const newDragCode = `                                     <motion.div
                                         key="gear"
                                         drag
                                         dragMomentum={false}
                                         onDragEnd={handleGearDragEnd}
                                         onClick={() => {
                                             setMode("GEAR_LOCK");
                                             setFeedback("ANTI-CSRF TOKEN DEPLOYED VIA TAP.");
                                             completeMission(2);
                                             playSuccess();
                                         }}`;
  content = content.replace(dragCode, newDragCode);

  fs.writeFileSync('labs/CSRFAttacks9.tsx', content);
  console.log("Success");
} catch(e) {
  console.error(e);
}
