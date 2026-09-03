"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect, useRef } from "react";
import { ArrowLeft, Volume2, RotateCcw, Lightbulb, Maximize, Minimize } from "lucide-react";
import { useLabAudio } from "@/hooks/useLabAudio";

type Theme = "circuit" | "cosmos" | "ocean" | "forge" | "garden" | "studio" | "neon" | "grade9";

interface LabShellProps {
  children: ReactNode;
  labId: string;
  theme?: Theme;
  title: string;
  subtitle?: string;
  instruction?: string;
  hint?: string;
  bgOverride?: string;
  navExtra?: ReactNode;
  compact?: boolean;
  onReset?: () => void;
}

export default function LabShell({ children, labId, theme = "circuit", title, subtitle, instruction, hint, bgOverride, navExtra, compact=false, onReset }: LabShellProps) {
  const { speakInstructions } = useLabAudio();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      shellRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const activeHint = hint || instruction;

  const handleHint = () => {
    setShowHint(true);
    if (activeHint) speakInstructions(activeHint);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), 8000);
  };

  return (
    <div
      ref={shellRef}
      className={`lab-shell ${bgOverride ? '' : `theme-${theme}`} relative h-[100dvh] w-full overflow-hidden flex flex-col`} 
      style={{ 
        backgroundColor: bgOverride?.startsWith('bg-') ? undefined : bgOverride,
        backgroundImage: bgOverride ? 'none' : undefined
      }}
    >
      <div className={`absolute inset-0 z-0 ${bgOverride?.startsWith('bg-') ? bgOverride : ''}`} style={{ backgroundColor: bgOverride?.startsWith('bg-') ? undefined : bgOverride }} />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />
      
      {/* Grade 9 Standard Header Layout */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-[clamp(.5rem,1.8vw,1.5rem)] py-[clamp(.35rem,1vh,.75rem)] pointer-events-none shrink-0">
        
        {/* Left: Hint then Fullscreen */}
        <div className="pointer-events-auto shrink-0 flex items-center justify-start gap-2">
          {activeHint && (
            <button 
              onClick={handleHint} title="Need a hint?"
              className="flex items-center justify-center px-4 h-9 md:h-10 bg-white rounded-full text-sky-700 shadow-sm hover:bg-sky-50 transition-colors gap-1.5 font-bold text-sm border border-sky-100/80 cursor-pointer"
            >
              <Lightbulb size={16} strokeWidth={2.5} />
              <span>Hint</span>
            </button>
          )}

          <button 
            onClick={toggleFullscreen} title="Fullscreen"
            className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white rounded-full text-sky-700 shadow-sm hover:bg-sky-50 transition-colors border border-sky-100/80 cursor-pointer"
          >
            {isFullscreen ? <Minimize size={16} strokeWidth={2.5} /> : <Maximize size={16} strokeWidth={2.5} />}
          </button>
        </div>

        <div className="pointer-events-auto flex-1 flex flex-col items-center text-center shrink-0 px-2">
          <h1 className={`text-[clamp(1.5rem,3.2vw,2.5rem)] font-black drop-shadow-sm leading-tight tracking-tight ${theme === 'grade9' || (bgOverride && !/(700|800|900|950)/.test(bgOverride)) ? 'text-sky-950' : 'text-white'}`}>{title}</h1>
          {subtitle && <p className={`text-[clamp(.85rem,1.6vw,1.25rem)] font-bold mt-0.5 ${theme === 'grade9' || bgOverride ? 'text-sky-600' : 'text-sky-200'}`}>{subtitle}</p>}
        </div>

        {/* Right: Speaker then Reset */}
        <div className="flex items-center justify-end gap-2 pointer-events-auto shrink-0">
          {instruction && (
            <button 
              onClick={() => speakInstructions(instruction)} title="Listen to instructions"
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white rounded-full text-sky-700 shadow-sm hover:bg-sky-50 transition-colors border border-sky-100/80 cursor-pointer"
            >
              <Volume2 size={18} strokeWidth={2.5} />
            </button>
          )}

          {onReset && (
            <button 
              onClick={onReset} title="Reset"
              className="flex items-center justify-center px-4 h-9 md:h-10 bg-white hover:bg-sky-50 rounded-full text-sky-700 transition-colors gap-1.5 font-bold text-sm border border-sky-100/80 shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} strokeWidth={2.5} />
              <span>Reset</span>
            </button>
          )}
          
          {navExtra}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 flex flex-col flex-1 min-h-0 w-full ${compact ? "px-2 md:px-4 pb-1 md:pb-2 " + (subtitle ? "pt-[clamp(4rem,10vh,5rem)]" : "pt-[clamp(2.75rem,8vh,3.5rem)]") : "px-4 md:px-6 pb-4 md:pb-6 " + (subtitle ? "pt-[clamp(4.75rem,15vh,8.75rem)]" : "pt-[clamp(3.75rem,12vh,5.75rem)]")}`}>
        {children}
      </div>

      {/* Floating Hint Overlay */}
      {showHint && activeHint && (
        <div className="absolute top-[60px] md:top-[70px] left-4 md:left-6 z-50 bg-white border-2 border-sky-300 rounded-xl px-4 py-3 shadow-xl max-w-sm text-sm font-semibold text-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l-2 border-t-2 border-sky-300 transform rotate-45"></div>
          {activeHint}
        </div>
      )}
    </div>
  );
}
