import React from "react";

interface WorldCanvasProps {
    children: React.ReactNode;
    controlDeck?: React.ReactNode;
    worldFlex?: number;
    deckFlex?: number;
}

export function WorldCanvas({ children, controlDeck, worldFlex = 3, deckFlex = 1 }: WorldCanvasProps) {
    return (
        <div className="flex flex-col w-full h-full min-h-0 relative bg-transparent font-sans overflow-hidden">
            <div 
                className="min-h-0 relative w-full overflow-hidden flex flex-col justify-end items-center pb-0"
                style={{ flex: worldFlex }}
            >
                {children}
            </div>

            {controlDeck && (
                <div 
                    className="w-full bg-gradient-to-b from-slate-800 to-slate-900 border-t-[16px] border-slate-700 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative z-50 overflow-hidden"
                    style={{ flex: deckFlex }}
                >
                    {controlDeck}
                </div>
            )}
        </div>
    );
}
