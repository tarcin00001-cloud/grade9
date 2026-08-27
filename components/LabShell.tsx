"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect, useRef } from "react";
import { ArrowLeft, Volume2, RotateCcw, Lightbulb, Maximize, Minimize } from "lucide-react";
import { useLabAudio } from "@/hooks/useLabAudio";

type Theme = "circuit" | "cosmos" | "ocean" | "forge" | "garden" | "studio" | "neon";

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

  const handleHint = () => {
    setShowHint(true);
    if (hint) speakInstructions(hint);
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
        
        {/* Left: Hint & Fullscreen */}
        <div className="pointer-events-auto shrink-0 w-[clamp(7.5rem,19vw,15.625rem)] flex items-center justify-start gap-2 md:gap-3">
          {hint && (
            <button 
              onClick={handleHint} title="Need a hint?"
              className="flex items-center justify-center px-4 h-10 md:h-11 bg-white rounded-full text-sky-700 shadow-md hover:bg-sky-50 transition-colors gap-2 font-bold text-sm md:text-base border border-sky-100"
            >
              <Lightbulb size={18} strokeWidth={2.5} />
              <span>Hint</span>
            </button>
          )}

          <button 
            onClick={toggleFullscreen} title="Fullscreen"
            className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-white rounded-full text-sky-700 shadow-md hover:bg-sky-50 transition-colors border border-sky-100"
          >
            {isFullscreen ? <Minimize size={18} strokeWidth={2.5} /> : <Maximize size={18} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Center: Title & Subtitle */}
        <div className="pointer-events-auto flex-1 flex flex-col items-center mt-2 text-center shrink-0">
          <h1 className="text-[clamp(1.5rem,3.2vw,2.75rem)] font-bold text-[#dc2626] drop-shadow-sm leading-tight">{title}</h1>
          {subtitle && <p className="text-[clamp(.9rem,1.8vw,1.5rem)] font-semibold text-[#ef4444] mt-1">{subtitle}</p>}
        </div>

        {/* Right: Listen & Reset */}
        <div className="flex items-center justify-end gap-2 md:gap-3 pointer-events-auto shrink-0 w-[clamp(7.5rem,19vw,15.625rem)]">
          
          {instruction && (
            <button 
              onClick={() => speakInstructions(instruction)} title="Listen"
              className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-white rounded-full text-sky-700 shadow-md hover:bg-sky-50 transition-colors border border-sky-100"
            >
              <Volume2 size={20} strokeWidth={2.5} />
            </button>
          )}

          {onReset && (
            <button 
              onClick={onReset} title="Reset"
              className="flex items-center justify-center px-4 h-10 md:h-11 bg-white rounded-full text-sky-700 shadow-md hover:bg-sky-50 transition-colors gap-2 font-bold text-sm md:text-base border border-sky-100"
            >
              <RotateCcw size={18} strokeWidth={2.5} />
              <span>Reset</span>
            </button>
          )}
          
          {navExtra}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full px-4 pb-4 pt-[clamp(4.75rem,15vh,8.75rem)] md:px-6 md:pb-6">
        {children}
      </div>

      {/* Floating Hint Overlay */}
      {showHint && hint && (
        <div className="absolute top-[70px] right-6 z-50 bg-white border-2 border-sky-300 rounded-xl px-4 py-3 shadow-xl max-w-sm text-sm font-semibold text-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute -top-2 right-12 w-4 h-4 bg-white border-l-2 border-t-2 border-sky-300 transform rotate-45"></div>
          {hint}
        </div>
      )}
    </div>
  );
}
