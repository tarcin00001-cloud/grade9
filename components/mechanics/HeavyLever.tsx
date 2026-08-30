import { motion, useAnimation } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";

interface HeavyLeverProps {
    colorClass?: string;
    onPull: () => void;
    disabled?: boolean;
}

export function HeavyLever({ colorClass = "bg-emerald-500", onPull, disabled = false }: HeavyLeverProps) {
    const controls = useAnimation();
    const { playHeavyThud } = useLabAudio();
    
    return (
        <div className={`relative w-16 h-32 bg-zinc-950 rounded-3xl border-[8px] border-zinc-900 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex justify-center py-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="absolute top-4 bottom-4 w-4 bg-black rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,1)] opacity-90" />
            
            <motion.div
                drag={disabled ? false : "y"}
                dragConstraints={{ top: 0, bottom: 65 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={(e, info) => {
                    if (info.offset.y > 45) {
                        playHeavyThud();
                        onPull();
                    }
                    controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                }}
                animate={controls}
                whileDrag={{ scale: 0.95 }}
                className={`relative w-12 h-12 rounded-full ${colorClass} bg-gradient-to-b from-white/30 to-transparent shadow-[0_10px_20px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing border-b-[6px] border-black/50 mt-1 z-10 flex flex-col items-center justify-center`}
            >
               <div className="w-6 h-1 bg-white/40 rounded-full mb-1 shadow-sm" />
               <div className="w-6 h-1 bg-white/40 rounded-full shadow-sm" />
            </motion.div>
        </div>
    );
}
