import React from "react";

interface RetroCRTProps {
    children: React.ReactNode;
    color?: "cyan" | "emerald" | "amber" | "rose";
    className?: string;
}

export function RetroCRT({ children, color = "cyan", className = "" }: RetroCRTProps) {
    const colorClasses = {
        cyan: "text-cyan-500",
        emerald: "text-emerald-500",
        amber: "text-amber-500",
        rose: "text-rose-500"
    };

    return (
        <div className={`mt-3 w-[85%] h-12 bg-black rounded-lg border-4 border-slate-700 shadow-inner flex items-center justify-center relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
            <span className={`font-mono text-xs uppercase font-black tracking-widest z-10 drop-shadow-[0_0_8px_currentColor] ${colorClasses[color]}`}>
                {children}
            </span>
        </div>
    );
}
