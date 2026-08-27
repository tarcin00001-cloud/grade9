"use client";
import LabShell from "@/components/LabShell";
import type { LabDefinition } from "@/data/labs";
import { Clock } from "lucide-react";

export default function PlannedLabPage({ lab }: { lab: LabDefinition }) {
  return (
    <LabShell labId={lab.slug} theme={lab.theme} title={lab.title} subtitle={lab.lesson}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border border-white/20">
          <Clock size={36} className="text-white/60" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Coming Soon</h2>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">This lab simulation is in development. Check back soon for the interactive experience.</p>
        </div>
      </div>
    </LabShell>
  );
}
