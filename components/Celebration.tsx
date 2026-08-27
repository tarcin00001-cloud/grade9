"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWindowSize } from "react-use";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

interface CelebrationProps { isActive: boolean; hideModal?: boolean; message?: string; onReplay?: () => void; }

export default function Celebration({ isActive, hideModal = false, message = "Congrats! You have completed the lab.", onReplay }: CelebrationProps) {
  const { width, height } = useWindowSize(); 
  const [show, setShow] = useState(false);

  const handleReplay = useCallback(() => { 
    setShow(false); 
    onReplay?.(); 
  }, [onReplay]);

  useEffect(() => { 
    if (isActive) setShow(true);
    else setShow(false);
  }, [isActive]);

  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
          {/* Confetti full screen */}
          <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
          
          {/* Bright focus veil */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.72 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-sky-200" 
          />

          {!hideModal && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center max-w-lg mx-4 text-center border-4 border-amber-300"
            >
              <div className="absolute -top-10 bg-amber-400 p-4 rounded-full border-4 border-white shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>
              
              <p className="text-xl md:text-2xl font-bold text-slate-700 mt-8 mb-8">
                {message}
              </p>

              {onReplay && (
                <button 
                  onClick={handleReplay}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <RotateCcw size={20} />
                  Play Again
                </button>
              )}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
