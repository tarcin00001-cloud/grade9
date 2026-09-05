"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BrainCircuit, CircuitBoard, Cog, Globe2, Palette, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { BOOK_TITLE, GRADE, GRADE_LABEL, LABS, type LabDefinition, type LabTheme } from "@/data/labs";

const THEME_ICON: Record<LabTheme, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  circuit: CircuitBoard, cosmos: BrainCircuit, ocean: Globe2, forge: Cog, garden: ShieldCheck, studio: Palette, neon: Sparkles,
};
const THEME_BAR: Record<LabTheme, string> = { circuit:"bg-emerald-400", cosmos:"bg-indigo-400", ocean:"bg-sky-400", forge:"bg-amber-400", garden:"bg-green-400", studio:"bg-pink-400", neon:"bg-orange-400" };
const THEME_ICON_BG: Record<LabTheme, string> = { circuit:"bg-emerald-100 text-emerald-700", cosmos:"bg-indigo-100 text-indigo-700", ocean:"bg-sky-100 text-sky-700", forge:"bg-amber-100 text-amber-700", garden:"bg-green-100 text-green-700", studio:"bg-pink-100 text-pink-700", neon:"bg-orange-100 text-orange-700" };
const THEME_TAG: Record<LabTheme, string> = { circuit:"bg-emerald-100 text-emerald-700", cosmos:"bg-indigo-100 text-indigo-700", ocean:"bg-sky-100 text-sky-700", forge:"bg-amber-100 text-amber-700", garden:"bg-green-100 text-green-700", studio:"bg-pink-100 text-pink-700", neon:"bg-orange-100 text-orange-700" };

function LabCard({ lab }: { lab: LabDefinition }) {
  const Icon = THEME_ICON[lab.theme];
  const isPlanned = lab.status === "planned";
  const hasSampleImage = lab.n <= 48;
  const [imgError, setImgError] = useState(false);

  const card = (
    <div className={`group relative h-full min-h-[220px] overflow-hidden rounded-[2rem] transition-transform duration-300 ${isPlanned ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:-translate-y-2 hover:shadow-2xl"}`}>
      {hasSampleImage && !imgError ? (
        <img 
          src={`/sample-lab-cards-9/${lab.n}.png`} 
          alt={lab.title} 
          onError={() => setImgError(true)}
          className="block w-full h-auto object-contain" 
        />
      ) : (
        <div className={`w-full h-full min-h-[260px] rounded-[2rem] p-6 flex flex-col justify-between border shadow-xl backdrop-blur-md transition-all ${
          lab.theme === 'cosmos' ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border-indigo-500/40' :
          lab.theme === 'ocean' ? 'bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white border-sky-400/40' :
          lab.theme === 'forge' ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 text-white border-amber-400/40' :
          lab.theme === 'studio' ? 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white border-pink-400/40' :
          lab.theme === 'neon' ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white border-emerald-400/40' :
          'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white border-slate-600/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-black/30 border border-white/20 uppercase tracking-widest text-white/90">
              Lab {lab.n}
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${THEME_ICON_BG[lab.theme]} shadow-md`}>
              <Icon size={20} />
            </div>
          </div>
          <div className="my-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-1">{lab.lesson}</span>
            <h3 className="font-black text-xl leading-tight text-white drop-shadow-sm">{lab.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/90 pt-3 border-t border-white/15">
            Launch Simulation <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      )}
    </div>
  );
  if (isPlanned) return card;
  return <Link className="block h-full" href={`/labs/${lab.slug}`}>{card}</Link>;
}

export default function HomePage() {
  const liveCount = LABS.filter(l => l.status !== "planned").length;
  return (
    <main className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 -z-20 h-full w-full object-cover"
      >
        <source src="/video/grade%209%20crct.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0" style={{ backgroundImage:"radial-gradient(circle, rgba(100,116,139,0.08) 1px, transparent 1px)", backgroundSize:"28px 28px" }} />
        <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.40) 100%)" }} />
      </div>
      <section className="relative z-10 flex min-h-[98vh] flex-col items-center justify-center px-6 pb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.25em]"
          style={{ background:"rgba(225,29,72,0.10)", border:"1.5px solid rgba(225,29,72,0.25)", color:"#be123c" }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />{GRADE_LABEL} · {BOOK_TITLE}
        </div>
        <h1 className="mb-4 text-5xl font-black leading-none tracking-tight text-red-700 md:text-7xl lg:text-8xl">
          Computing{" "}
          <span className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">Lab</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base font-semibold leading-relaxed text-red-600 md:text-lg">
          {liveCount} of {LABS.length} Grade {GRADE} labs are interactive now. Each lab is a hands-on simulation built to make computing concepts click.
        </p>
        <div className="mt-8 inline-flex overflow-hidden rounded-2xl divide-x divide-red-200"
          style={{ background:"rgba(255,255,255,0.72)", backdropFilter:"blur(12px)", border:"1.5px solid rgba(255,255,255,0.95)", boxShadow:"0 4px 20px rgba(15,23,42,0.08)" }}>
          {[{value:liveCount,label:"Live Now"},{value:LABS.length,label:"Total Labs"},{value:GRADE,label:"Grade"}].map(({value,label}) => (
            <div key={label} className="flex flex-col items-center px-6 py-3">
              <span className="text-2xl font-black text-red-700">{value}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LABS.map(lab => <LabCard key={lab.slug} lab={lab} />)}
        </div>
      </section>
      <footer className="relative z-10 pb-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Thamba Labs · Grade {GRADE}</p>
      </footer>
    </main>
  );
}