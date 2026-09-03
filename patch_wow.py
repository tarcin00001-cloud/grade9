import re

with open('labs/ComputingBenefits44.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add motion.div to TOP HALF wrapper for screen shake
content = content.replace(
    '<div className="flex-1 min-h-[20vh] md:min-h-[25vh] bg-slate-900 rounded-[2rem] overflow-hidden flex relative shadow-2xl border-4 border-slate-700 z-10">',
    '''<motion.div 
          animate={isOverheating ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}}
          transition={{ repeat: isOverheating ? Infinity : 0, duration: 0.2 }}
          className="flex-1 min-h-[20vh] md:min-h-[25vh] bg-slate-900 rounded-[2rem] overflow-hidden flex relative shadow-2xl border-4 border-slate-700 z-10"
        >'''
)

# And replace the closing div of TOP HALF
# It is located right before BOTTOM HALF
content = content.replace(
    '''        </div>

        {/* BOTTOM HALF: Hardware Console */}''',
    '''        </motion.div>

        {/* BOTTOM HALF: Hardware Console */}'''
)

# 2. Golden Hour Sky
content = content.replace(
    '<div className="flex-1 relative overflow-hidden transition-colors duration-1000 bg-sky-200">',
    '<div className={`flex-1 relative overflow-hidden transition-colors duration-1000 ${greenPower ? "bg-amber-100" : "bg-sky-200"}`}>'
)

# 3. Data Streams
data_stream_code = '''          {/* Data Streams (Glowing Packets) */}
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center gap-12 sm:gap-16 px-4 sm:px-10">
            {trafficData > 0 && (
              <div className="w-full h-1 bg-blue-500/20 relative rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }} 
                  animate={{ x: "2000%" }} 
                  transition={{ repeat: Infinity, duration: 2.5 - (trafficData/100)*1.5, ease: "linear" }}
                  className="w-16 sm:w-24 h-full bg-blue-400 shadow-[0_0_15px_#60a5fa] rounded-full" 
                />
              </div>
            )}
            {farmData > 0 && (
              <div className="w-full h-1 bg-emerald-500/20 relative rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }} 
                  animate={{ x: "2000%" }} 
                  transition={{ repeat: Infinity, duration: 2.5 - (farmData/100)*1.5, ease: "linear" }}
                  className="w-16 sm:w-24 h-full bg-emerald-400 shadow-[0_0_15px_#34d399] rounded-full" 
                />
              </div>
            )}
          </div>
          
          {/* Left: The World */}'''

content = content.replace('          {/* Left: The World */}', data_stream_code)

# 4. Meltdown Sparks
sparks_code = '''            {/* Server Meltdown Sparks */}
            <AnimatePresence>
              {isOverheating && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex justify-center items-end pb-8"
                >
                  <div className="absolute inset-0 bg-rose-500/10 animate-pulse mix-blend-color-burn" />
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={`spark-${i}`}
                      initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                      animate={{ 
                        y: -100 - Math.random() * 100, 
                        x: (Math.random() - 0.5) * 80,
                        opacity: 0,
                        scale: Math.random() * 1.5 + 0.5
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.4 + Math.random()*0.4, 
                        delay: Math.random() 
                      }}
                      className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_8px_#fbbf24]"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`bg-slate-900 border-2 ${liquidCooling ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-700'} rounded-lg p-2 flex flex-col gap-2 w-full shadow-2xl relative z-10 transition-colors`}>'''

content = content.replace('            <div className={`bg-slate-900 border-2 ${liquidCooling ? \'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]\' : \'border-slate-700\'} rounded-lg p-2 flex flex-col gap-2 w-full shadow-2xl relative z-10 transition-colors`}>', sparks_code)


with open('labs/ComputingBenefits44.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
