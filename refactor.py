import json

with open('labs/RequirementAnalysis9.tsx', 'r') as f:
    lines = f.readlines()

logic = "".join(lines[:359])

new_ui = """  return (
    <LabShell
      labId="requirementanalysis9"
      title="Requirements Analysis Studio"
      subtitle="Classify Functional user features vs Non-Functional quality metrics to launch production software!"
      hint="1. Functional Blueprints: What the system does (Shopping Cart, Video Engine). 2. Quality Gauges: How well it performs (Encryption, <50ms Latency). 3. Avoid premature hardware traps and vague unmeasurable goals!"
      bgOverride="bg-slate-950"
      compact={true}
      instruction="1. Select feature blueprints for user capabilities. 2. Slot measurable quality gauges for security & speed. 3. Avoid hardware traps and stay within budget to deploy the app."
      onReset={handleReset}
    >
      <Celebration
        isActive={hasWon}
        message="Master Software Architect Certified! You mastered Requirements Analysis by distinguishing Functional features from measurable Non-Functional constraints."
        onReplay={handleReset}
      />

      {/* Blueprint Architecture Theme */}
      <div className="flex-1 min-h-0 w-full flex flex-col relative z-10 select-none overflow-hidden bg-[linear-gradient(#1e293b_1px,transparent_1px),linear-gradient(90deg,#1e293b_1px,transparent_1px)] [background-size:20px_20px] p-2 sm:p-4 gap-4">
        
        {/* Top Mission Header & Budget Strip */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.5)] gap-4">
          
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] shrink-0">
              <Layers size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] sm:text-[13px] font-bold text-slate-200 leading-snug">
                {MISSIONS[activeMission].objective}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1 block">
                Target Platform: <b className="text-cyan-400">{MISSIONS[activeMission].appTitle}</b>
              </span>
            </div>
          </div>

          {/* Mission Switcher Tabs + Budget Pill */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
              {(["ecommerce", "streaming", "superapp"] as MissionId[]).map((mId) => (
                <button
                  key={mId}
                  onClick={() => {
                    if (mId !== activeMission) {
                      playPop();
                      setActiveMission(mId);
                    }
                  }}
                  className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeMission === mId
                      ? "text-white bg-slate-800 shadow-md"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {MISSIONS[mId].title.split(". ")[1]}
                  {completedMissions[mId] && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
                  )}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-mono text-[11px] font-black ${
              isBudgetExceeded
                ? "bg-rose-950/50 text-rose-400 border-rose-500/50"
                : budgetRemaining < 1000
                ? "bg-amber-950/50 text-amber-400 border-amber-500/50"
                : "bg-emerald-950/50 text-emerald-400 border-emerald-500/50"
            }`}>
              <span>$ {currentCost.toLocaleString()}</span>
              <span className="text-slate-600 font-normal">/</span>
              <span>$ {MISSIONS[activeMission].budget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          
          {/* Left Bay: Sockets & Tray */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-0">
            
            {/* Assembly Bays */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              
              {/* Functional Sockets */}
              <div 
                onClick={() => selectedModule && handleSlotModule(selectedModule, "functional")}
                className={`flex-1 bg-slate-900/80 backdrop-blur rounded-2xl border-2 p-3 flex flex-col transition-colors cursor-pointer ${
                selectedModule && ALL_MODULES[selectedModule].type === "functional" 
                  ? "border-cyan-500 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                  : selectedModule 
                  ? "border-slate-700 opacity-50"
                  : "border-slate-700"
              }`}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <ShoppingCart size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">User Features</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {slottedF.length} / {MISSIONS[activeMission].socketsF}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: MISSIONS[activeMission].socketsF }).map((_, i) => {
                    const slottedId = slottedF[i];
                    return (
                      <div key={i} className={`flex-1 min-w-[120px] h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all ${
                        slottedId 
                          ? "border-cyan-500 bg-cyan-950/30 border-solid" 
                          : "border-slate-700 bg-slate-900/50"
                      }`}>
                        {slottedId ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-rose-950/30 hover:border-rose-500 group" onClick={(e) => { e.stopPropagation(); handleSlotModule(slottedId, "tray"); }}>
                             <span className="text-cyan-400 mb-0.5">{renderIcon(ALL_MODULES[slottedId].iconName, 16)}</span>
                             <span className="text-[9px] font-bold text-slate-200 line-clamp-1 group-hover:hidden">{ALL_MODULES[slottedId].name}</span>
                             <span className="text-[9px] font-bold text-rose-400 hidden group-hover:block">REMOVE</span>
                          </div>
                        ) : (
                           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center px-2">Slot Feature</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Non-Functional Sockets */}
              <div 
                onClick={() => selectedModule && handleSlotModule(selectedModule, "non-functional")}
                className={`flex-1 bg-slate-900/80 backdrop-blur rounded-2xl border-2 p-3 flex flex-col transition-colors cursor-pointer ${
                selectedModule && ALL_MODULES[selectedModule].type === "non-functional" 
                  ? "border-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : selectedModule 
                  ? "border-slate-700 opacity-50"
                  : "border-slate-700"
              }`}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quality Gauges</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {slottedNF.length} / {MISSIONS[activeMission].socketsNF}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: MISSIONS[activeMission].socketsNF }).map((_, i) => {
                    const slottedId = slottedNF[i];
                    return (
                      <div key={i} className={`flex-1 min-w-[120px] h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all ${
                        slottedId 
                          ? "border-emerald-500 bg-emerald-950/30 border-solid" 
                          : "border-slate-700 bg-slate-900/50"
                      }`}>
                        {slottedId ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-rose-950/30 hover:border-rose-500 group" onClick={(e) => { e.stopPropagation(); handleSlotModule(slottedId, "tray"); }}>
                             <span className="text-emerald-400 mb-0.5">{renderIcon(ALL_MODULES[slottedId].iconName, 16)}</span>
                             <span className="text-[9px] font-bold text-slate-200 line-clamp-1 group-hover:hidden">{ALL_MODULES[slottedId].name}</span>
                             <span className="text-[9px] font-bold text-rose-400 hidden group-hover:block">REMOVE</span>
                          </div>
                        ) : (
                           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center px-2">Slot Metric</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>

            {/* Component Tray */}
            <div className="flex-1 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700 p-3 shadow-md flex flex-col min-h-0 overflow-hidden">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 shrink-0">
                Blueprint Repository ({trayModules.length} Available)
              </span>
              
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 pb-4">
                {trayModules.map((id) => {
                  const mod = ALL_MODULES[id];
                  const isSelected = selectedModule === id;
                  
                  // Style logic based on type (but keep it subtle so they have to read)
                  let colorClasses = "border-slate-700 hover:border-slate-500 text-slate-300";
                  if (isSelected) colorClasses = "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] text-white";

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        playClick();
                        setSelectedModule(isSelected ? null : id);
                      }}
                      className={`bg-slate-950 border-2 rounded-xl p-2.5 cursor-pointer flex flex-col transition-all ${colorClasses} hover:bg-slate-800 active:scale-95`}
                    >
                      <div className="flex items-start justify-between mb-1.5 gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`shrink-0 ${isSelected ? "text-amber-400" : "text-slate-500"}`}>
                            {renderIcon(mod.iconName, 14)}
                          </span>
                          <span className="text-[10px] font-bold truncate leading-tight">{mod.name}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-500 shrink-0">${mod.cost}</span>
                      </div>

                      <p className="text-[9px] text-slate-400 leading-snug line-clamp-2 mb-2 flex-1">
                        {mod.desc}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-slate-800">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 ${
                           mod.type === "functional" ? "text-cyan-500" : mod.type === "non-functional" ? "text-emerald-500" : "text-rose-500" 
                        }`}>
                           {mod.type === "functional" ? "Feature" : mod.type === "non-functional" ? "Quality" : mod.type === "solution" ? "Hardware?" : "Vague?"}
                        </span>
                        
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-amber-400 animate-pulse" : "text-indigo-500"}`}>
                          {isSelected ? "TAP BAY TO SLOT" : "SELECT"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Bay: Live Smartphone Simulator & Stress Test Controller */}
          <div className="w-full lg:w-72 xl:w-80 bg-slate-900 rounded-3xl border border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between p-3 shrink-0">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-2 mb-2 shrink-0 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-slate-400" />
                <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                  Live Simulator
                </h3>
              </div>
              <div className={`w-2 h-2 rounded-full ${simStatus === "success" ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" : simStatus === "error" ? "bg-rose-500" : "bg-slate-600"}`} />
            </div>

            {/* Simulated Smartphone Screen */}
            <div className={`my-auto bg-black rounded-2xl p-3 border-[6px] shadow-inner text-white flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all ${
              simStatus === "error" ? "border-rose-900 bg-rose-950/20" : simStatus === "success" ? "border-emerald-900 bg-emerald-950/20" : "border-slate-800"
            }`}>
              
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pb-2 shrink-0 z-10">
                <span>9:41</span>
                <span className="truncate max-w-[100px]">{MISSIONS[activeMission].appTitle}</span>
                <span className="flex items-center gap-1"><Wifi size={10}/> 5G</span>
              </div>

              {/* Screen Content reacting live */}
              <div className="my-2 flex-1 flex flex-col justify-center items-center text-center gap-3 z-10">
                {simStatus === "testing" ? (
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <Activity size={36} className="text-indigo-500 animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Compiling...</span>
                  </div>
                ) : simStatus === "success" ? (
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <ShieldCheck size={32} />
                    </div>
                    <span className="text-[13px] font-black text-emerald-400 uppercase tracking-widest mt-1">Deployed</span>
                    <span className="text-[10px] text-emerald-200/70 max-w-[180px] leading-tight">
                      All specs met! $ {budgetRemaining.toLocaleString()} under budget.
                    </span>
                  </div>
                ) : simStatus === "error" ? (
                  <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                      <AlertTriangle size={32} />
                    </div>
                    <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest mt-1">Crash Report</span>
                    <span className="text-[9px] text-rose-200/80 max-w-[180px] leading-relaxed bg-rose-950/50 p-2 rounded-lg border border-rose-900/50">
                      {diagnosticFeedback}: {diagnosticReason}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[200px]">
                      {slottedF.map((id) => (
                        <div key={id} className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[9px] font-bold text-cyan-300 flex items-center justify-center gap-1.5 truncate">
                          {renderIcon(ALL_MODULES[id].iconName, 12, "shrink-0")}
                          <span className="truncate">{ALL_MODULES[id].name}</span>
                        </div>
                      ))}
                      {slottedNF.map((id) => (
                        <div key={id} className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[9px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 truncate">
                          {renderIcon(ALL_MODULES[id].iconName, 12, "shrink-0")}
                          <span className="truncate">{ALL_MODULES[id].name}</span>
                        </div>
                      ))}
                    </div>
                    {slottedF.length === 0 && slottedNF.length === 0 && (
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
                        Awaiting Architecture
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="shrink-0 mt-3">
              <button
                onClick={handleRunStressTest}
                disabled={simStatus === "testing"}
                className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                  simStatus === "success"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800"
                    : isBudgetExceeded
                    ? "bg-rose-600 hover:bg-rose-500 text-white border-rose-800"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800"
                }`}
              >
                {simStatus === "testing" ? (
                  <><Activity size={16} className="animate-spin" /> Verifying...</>
                ) : simStatus === "success" ? (
                  <>Next Stage <ArrowRight size={16} /></>
                ) : (
                  <><Zap size={16} /> Engage Stress Test</>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </LabShell>
  );
}
"""

with open('labs/RequirementAnalysis9.tsx', 'w') as f:
    f.write(logic + new_ui)

print("Done")
