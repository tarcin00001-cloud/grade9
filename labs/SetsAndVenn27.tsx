"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Database, Search, Filter, ShieldCheck, User, Users, CheckCircle2, RotateCcw, MonitorPlay, Gamepad2, Film, Dna, Lock, Skull } from "lucide-react";

const LEVELS = [
  { id: 'sorter', title: 'Data Sorter', desc: 'Sort users', icon: <Users size={12} /> },
  { id: 'search2', title: 'Search Engine', desc: '2-Set Query', icon: <Search size={12} /> },
  { id: 'search3', title: 'DB Master', desc: '3-Set Query', icon: <Database size={12} /> },
  { id: 'bio', title: 'Bio Matcher', desc: 'Intersection', icon: <Filter size={12} /> },
  { id: 'access', title: 'Super Query', desc: 'Center Set', icon: <ShieldCheck size={12} /> },
  { id: 'boss', title: 'Boss Level', desc: 'Sym. Difference', icon: <Skull size={12} /> }
];

type UserType = { id: string, name: string, roles: string[], zone: string | null };

const INITIAL_USERS: UserType[] = [
  { id: 'u1', name: 'Alice', roles: ['Admin'], zone: null },
  { id: 'u2', name: 'Bob', roles: ['Editor'], zone: null },
  { id: 'u3', name: 'Charlie', roles: ['Admin', 'Editor'], zone: null },
  { id: 'u4', name: 'Diana', roles: ['Admin', 'Editor'], zone: null },
  { id: 'u5', name: 'Eve', roles: ['Editor'], zone: null }
];

export default function SetsAndVenn27() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === Level 1: Data Sorter ===
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleZoneClick = (zone: string) => {
    if (!selectedUser) {
      if (playError) playError();
      setErrorMsg("Select a user first, then click the correct zone in the Venn diagram!");
      return;
    }

    const user = users.find(u => u.id === selectedUser);
    if (!user) return;

    let correctZone = '';
    if (user.roles.includes('Admin') && user.roles.includes('Editor')) correctZone = 'A_AND_B';
    else if (user.roles.includes('Admin')) correctZone = 'A_ONLY';
    else if (user.roles.includes('Editor')) correctZone = 'B_ONLY';

    if (zone !== correctZone) {
      if (playError) playError();
      setErrorMsg(`Incorrect! Look at ${user.name}'s roles. They don't belong in that region.`);
      setSelectedUser(null);
      return;
    }

    if (playPop) playPop();
    setUsers(prev => prev.map(u => u.id === selectedUser ? { ...u, zone } : u));
    setSelectedUser(null);
    setErrorMsg(null);

    // Check level completion
    if (users.filter(u => u.id !== selectedUser && u.zone === null).length === 0) {
      if (playSuccess) playSuccess();
      setErrorMsg("Excellent! You correctly identified intersections and differences.");
    }
  };


  // === Level 2: Search Engine (2-Circle) ===
  const [selectedZoneL2, setSelectedZoneL2] = useState<string | null>(null);
  const checkL2 = (zone: string) => {
    if (playClick) playClick();
    setSelectedZoneL2(zone);
    if (zone === 'A_ONLY') { // Action games NOT multiplayer
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setErrorMsg("Incorrect! Look for the region that is inside Action, but OUTSIDE of Multiplayer.");
    }
  };


  // === Level 3: Database Master (3-Circle) ===
  const [selectedZoneL3, setSelectedZoneL3] = useState<string | null>(null);
  const checkL3 = (zone: string) => {
    if (playClick) playClick();
    setSelectedZoneL3(zone);
    // Sci-Fi Comedies NOT Action -> Intersection of Sci-Fi(A) & Comedy(C), minus Action(B)
    if (zone === 'A_AND_C') { 
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setErrorMsg("Incorrect! Find the slice where Sci-Fi and Comedy overlap, but keep OUT of the Action circle.");
    }
  };

  // === Level 4: Bio Matcher (2-Circle) ===
  const [selectedZoneL4, setSelectedZoneL4] = useState<string | null>(null);
  const checkL4 = (zone: string) => {
    if (playClick) playClick();
    setSelectedZoneL4(zone);
    if (zone === 'A_AND_B') { 
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setErrorMsg("Incorrect! Find the genes they have in COMMON (the overlapping intersection).");
    }
  };

  // === Level 5: Super Query (3-Circle) ===
  const [selectedZoneL5, setSelectedZoneL5] = useState<string | null>(null);
  const checkL5 = (zone: string) => {
    if (playClick) playClick();
    setSelectedZoneL5(zone);
    if (zone === 'ALL') { 
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setErrorMsg("Incorrect! Look for the exact center where ALL THREE departments overlap.");
    }
  };

  // === Level 6: Boss Level (Symmetric Difference) ===
  const [selectedZonesL6, setSelectedZonesL6] = useState<string[]>([]);
  const checkL6 = (zone: string) => {
    if (playClick) playClick();
    
    setSelectedZonesL6(prev => {
      const newZones = prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone];
      
      if (newZones.length === 2 && newZones.includes('A_ONLY') && newZones.includes('B_ONLY')) {
        if (playSuccess) playSuccess();
        setErrorMsg(null);
      } else if (newZones.includes('A_AND_B')) {
         if (playError) playError();
         setErrorMsg("Incorrect! Symmetric Difference (A Δ B) means elements in A or B, but NOT BOTH.");
      } else if (newZones.length >= 2) {
         if (playError) playError();
         setErrorMsg("You need exactly the two non-overlapping regions.");
      } else {
         setErrorMsg(null);
      }
      return newZones;
    });
  };

  // === General Helpers ===
  const nextLevel = () => {
    if (currentLevel + 1 >= LEVELS.length) {
      if (playZap) playZap();
      setWin(true);
    } else {
      if (playSuccess) playSuccess();
      setCurrentLevel(l => l + 1);
      setErrorMsg(null);
      resetCurrentLevel();
    }
  };

  const resetGame = () => {
    if (playClick) playClick();
    setCurrentLevel(0);
    setWin(false);
    setErrorMsg(null);
    setUsers(INITIAL_USERS);
    setSelectedUser(null);
    setSelectedZoneL2(null);
    setSelectedZoneL3(null);
    setSelectedZoneL4(null);
    setSelectedZoneL5(null);
    setSelectedZonesL6([]);
  };

  const resetCurrentLevel = () => {
    if (playClick) playClick();
    setErrorMsg(null);
    if (currentLevel === 0) {
      setUsers(INITIAL_USERS);
      setSelectedUser(null);
    }
    if (currentLevel === 1) setSelectedZoneL2(null);
    if (currentLevel === 2) setSelectedZoneL3(null);
    if (currentLevel === 3) setSelectedZoneL4(null);
    if (currentLevel === 4) setSelectedZoneL5(null);
    if (currentLevel === 5) setSelectedZonesL6([]);
  };

  const isLevelComplete = () => {
    if (currentLevel === 0) return users.every(u => u.zone !== null);
    if (currentLevel === 1) return selectedZoneL2 === 'A_ONLY';
    if (currentLevel === 2) return selectedZoneL3 === 'A_AND_C';
    if (currentLevel === 3) return selectedZoneL4 === 'A_AND_B';
    if (currentLevel === 4) return selectedZoneL5 === 'ALL';
    if (currentLevel === 5) return selectedZonesL6.length === 2 && selectedZonesL6.includes('A_ONLY') && selectedZonesL6.includes('B_ONLY');
    return false;
  };

  const getChallengeQuestion = () => {
    if (currentLevel === 0) return "Sort the users! Click a user, then click the correct region in the Venn diagram.";
    if (currentLevel === 1) return "Find Action Games that are NOT Multiplayer (Difference: A - B). Click the correct region!";
    if (currentLevel === 2) return "Find Sci-Fi Comedies that are NOT Action. Click the correct region!";
    if (currentLevel === 3) return "Bioinformatics: Find the common genes shared by BOTH Species X and Y (Intersection: A ∩ B).";
    if (currentLevel === 4) return "Access Control: Find users who are in ALL THREE departments (Admin ∩ HR ∩ IT).";
    if (currentLevel === 5) return "BOSS: Symmetric Difference (A Δ B). Click ALL regions representing elements in Client (A) OR Server (B) but NOT BOTH.";
    return "";
  };


  return (
    <LabShell
      labId="setsandvenn27"
      title="Sets & Venn Diagrams"
      subtitle="Data Organization"
      theme="cosmos"
      compact={true}
      onReset={resetGame}
      instruction="1. Review the concepts of set theory, including unions and intersections. 2. Map these mathematical concepts to database queries and search engine logic. 3. Use the interactive Venn diagram to construct complex search queries. 4. Analyze the search results to verify the accuracy of your set operations."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You mastered Unions, Intersections, and Differences!" />

      {!win && (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-2 p-1">
          
          {/* Level Progress */}
          <div className="flex gap-1 shrink-0">
            {LEVELS.map((level, i) => (
              <div 
                key={level.id} 
                className={`flex-1 flex flex-col p-1.5 rounded-lg border-2 transition-colors ${i === currentLevel ? 'bg-indigo-100 border-indigo-400 text-indigo-900 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : i < currentLevel ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600' : 'bg-white border-slate-300 text-slate-500'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {level.icon}
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter truncate">{level.title}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 bg-white rounded-2xl border-2 border-slate-200 shadow-2xl flex flex-col items-center p-2 relative overflow-hidden min-h-0">
            
            {/* Objective Box */}
            <div className="bg-indigo-50 border-2 border-indigo-500/50 p-2 rounded-lg w-full max-w-4xl text-center mb-1 shrink-0 z-20">
               <h3 className="text-indigo-600 font-black uppercase tracking-widest text-[9px] mb-0.5">Current Objective</h3>
               <p className="text-slate-900 text-xs font-bold leading-tight">{getChallengeQuestion()}</p>
            </div>

            {/* The Visualization */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 relative z-10 overflow-hidden">
              
              {/* === Level 1: Data Sorter === */}
              {currentLevel === 0 && (
                <div className="flex w-full h-full items-center justify-around gap-4">
                  
                  {/* User Pool */}
                  <div className="flex flex-col gap-2 w-48 shrink-0">
                    <div className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Unsorted Users</div>
                    {users.filter(u => u.zone === null).map(user => (
                      <button
                        key={user.id}
                        onClick={() => { setSelectedUser(user.id); if(playClick) playClick(); }}
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-transform ${selectedUser === user.id ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-lg shadow-indigo-500/50' : 'bg-slate-100 border-slate-300 hover:border-indigo-400'}`}
                      >
                        <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm"><User size={16} className="text-slate-500"/></div>
                        <div>
                          <div className={`font-bold text-sm ${selectedUser === user.id ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                          <div className={`text-[10px] font-black uppercase ${selectedUser === user.id ? 'text-indigo-200' : 'text-indigo-500'}`}>{user.roles.join(' & ')}</div>
                        </div>
                      </button>
                    ))}
                    {users.filter(u => u.zone === null).length === 0 && (
                      <div className="text-center text-xs text-emerald-500 font-bold border-2 border-dashed border-emerald-900 rounded-lg p-4">All Ordered!</div>
                    )}
                  </div>

                  {/* Venn Diagram */}
                  <div className="relative w-80 h-64 shrink-0 flex items-center justify-center scale-110 sm:scale-125 origin-center">
                    {/* Background Circles to define the shape visually */}
                    <div className="absolute w-48 h-48 rounded-full border-4 border-sky-500/50 -ml-20 flex items-start justify-center pt-4 opacity-30">
                       <span className="text-sky-400 font-black text-xs uppercase">Set A: Admins</span>
                    </div>
                    <div className="absolute w-48 h-48 rounded-full border-4 border-pink-500/50 ml-20 flex items-start justify-center pt-4 opacity-30">
                       <span className="text-pink-400 font-black text-xs uppercase">Set B: Editors</span>
                    </div>

                    {/* Interactive Zones */}
                    {/* A ONLY */}
                    <button 
                      onClick={() => handleZoneClick('A_ONLY')}
                      className={`absolute w-24 h-32 -ml-32 rounded-l-full hover:bg-sky-500/20 transition-colors flex flex-col gap-1.5 items-center justify-center z-20 ${selectedUser ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {users.filter(u => u.zone === 'A_ONLY').map(u => (
                        <div key={u.id} className="bg-sky-900 border border-sky-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">{u.name}</div>
                      ))}
                    </button>

                    {/* INTERSECTION */}
                    <button 
                      onClick={() => handleZoneClick('A_AND_B')}
                      className={`absolute w-16 h-32 hover:bg-purple-500/20 transition-colors flex flex-col gap-1.5 items-center justify-center z-20 ${selectedUser ? 'cursor-pointer' : 'cursor-default'} rounded-full`}
                    >
                      {users.filter(u => u.zone === 'A_AND_B').map(u => (
                        <div key={u.id} className="bg-purple-900 border border-purple-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">{u.name}</div>
                      ))}
                    </button>

                    {/* B ONLY */}
                    <button 
                      onClick={() => handleZoneClick('B_ONLY')}
                      className={`absolute w-24 h-32 ml-32 rounded-r-full hover:bg-pink-500/20 transition-colors flex flex-col gap-1.5 items-center justify-center z-20 ${selectedUser ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {users.filter(u => u.zone === 'B_ONLY').map(u => (
                        <div key={u.id} className="bg-pink-900 border border-pink-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">{u.name}</div>
                      ))}
                    </button>

                  </div>

                </div>
              )}


              {/* === Level 2: Search Engine === */}
              {currentLevel === 1 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2">
                  
                  {/* Visual Venn */}
                  <div className="relative w-72 h-48 shrink-0 flex items-center justify-center scale-110 sm:scale-125 origin-center">
                    {/* Set A (Action) */}
                    <div className="absolute w-40 h-40 rounded-full border-4 border-amber-500 -ml-16 flex items-start justify-center pt-2 pointer-events-none">
                       <span className="text-amber-600 font-black text-[10px] uppercase bg-white px-1 rounded border border-slate-200">Action</span>
                    </div>
                    {/* Set B (Multiplayer) */}
                    <div className="absolute w-40 h-40 rounded-full border-4 border-emerald-500 ml-16 flex items-start justify-center pt-2 pointer-events-none">
                       <span className="text-emerald-600 font-black text-[10px] uppercase bg-white px-1 rounded border border-slate-200">Multiplayer</span>
                    </div>

                    {/* Interactive Div Zones (Approximate but works well) */}
                    <button 
                      onClick={() => checkL2('A_ONLY')}
                      className={`absolute w-20 h-32 -ml-28 rounded-l-full transition-colors z-20 ${selectedZoneL2 === 'A_ONLY' ? 'bg-amber-500/40' : 'hover:bg-amber-500/20'}`}
                    />
                    <button 
                      onClick={() => checkL2('A_AND_B')}
                      className={`absolute w-12 h-32 rounded-full transition-colors z-20 ${selectedZoneL2 === 'A_AND_B' ? 'bg-lime-500/40' : 'hover:bg-lime-500/20'}`}
                    />
                    <button 
                      onClick={() => checkL2('B_ONLY')}
                      className={`absolute w-20 h-32 ml-28 rounded-r-full transition-colors z-20 ${selectedZoneL2 === 'B_ONLY' ? 'bg-emerald-500/40' : 'hover:bg-emerald-500/20'}`}
                    />
                  </div>

                  {/* SQL Query Result */}
                  <div className="bg-slate-50 border border-slate-300 w-full max-w-lg rounded-lg p-2 text-center font-mono text-[10px] text-sky-700 h-10 flex items-center justify-center">
                    {selectedZoneL2 === 'A_ONLY' ? "SELECT * FROM Games WHERE genre='Action' EXCEPT SELECT * FROM Games WHERE genre='Multiplayer'" :
                     selectedZoneL2 === 'A_AND_B' ? "SELECT * FROM Games WHERE genre='Action' INTERSECT SELECT * FROM Games WHERE genre='Multiplayer'" :
                     selectedZoneL2 === 'B_ONLY' ? "SELECT * FROM Games WHERE genre='Multiplayer' EXCEPT SELECT * FROM Games WHERE genre='Action'" :
                     "Waiting for query input..."}
                  </div>

                  {/* Results Output */}
                  <div className="flex gap-4 h-24 items-center">
                    {selectedZoneL2 === 'A_ONLY' && (
                      <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-amber-500">
                         <MonitorPlay className="text-amber-500 mb-1" size={24}/>
                         <span className="text-[9px] font-bold text-slate-900">Singleplayer Action RPG</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Level 3: DB Master (3-Circle) === */}
              {currentLevel === 2 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2">
                  
                  {/* Visual Venn */}
                  <div className="relative w-64 h-64 shrink-0 flex items-center justify-center scale-110 sm:scale-125 origin-center">
                    
                    {/* Circles Outline */}
                    <div className="absolute w-32 h-32 rounded-full border-4 border-sky-500 -ml-12 -mt-12 flex items-start justify-center pt-1 pointer-events-none">
                       <span className="text-sky-600 font-black text-[9px] uppercase bg-white px-1 rounded border border-slate-200">Sci-Fi (A)</span>
                    </div>
                    <div className="absolute w-32 h-32 rounded-full border-4 border-pink-500 ml-12 -mt-12 flex items-start justify-center pt-1 pointer-events-none">
                       <span className="text-pink-600 font-black text-[9px] uppercase bg-white px-1 rounded border border-slate-200">Action (B)</span>
                    </div>
                    <div className="absolute w-32 h-32 rounded-full border-4 border-amber-500 mt-16 flex items-end justify-center pb-1 pointer-events-none">
                       <span className="text-amber-600 font-black text-[9px] uppercase bg-white px-1 rounded border border-slate-200">Comedy (C)</span>
                    </div>

                    {/* Interactive Div Zones (Approximate grid mapping) */}
                    {/* A ONLY */}
                    <button onClick={() => checkL3('A_ONLY')} className={`absolute w-12 h-16 -ml-20 -mt-16 rounded-tl-full rounded-bl-full z-20 transition-colors ${selectedZoneL3==='A_ONLY'?'bg-sky-500/40':'hover:bg-sky-500/20'}`} />
                    {/* B ONLY */}
                    <button onClick={() => checkL3('B_ONLY')} className={`absolute w-12 h-16 ml-20 -mt-16 rounded-tr-full rounded-br-full z-20 transition-colors ${selectedZoneL3==='B_ONLY'?'bg-pink-500/40':'hover:bg-pink-500/20'}`} />
                    {/* C ONLY */}
                    <button onClick={() => checkL3('C_ONLY')} className={`absolute w-24 h-12 mt-28 rounded-b-full z-20 transition-colors ${selectedZoneL3==='C_ONLY'?'bg-amber-500/40':'hover:bg-amber-500/20'}`} />
                    
                    {/* A AND B (No C) */}
                    <button onClick={() => checkL3('A_AND_B')} className={`absolute w-10 h-10 -mt-20 rounded-full z-20 transition-colors ${selectedZoneL3==='A_AND_B'?'bg-purple-500/40':'hover:bg-purple-500/20'}`} />
                    
                    {/* A AND C (No B) - THIS IS THE CORRECT ANSWER */}
                    <button onClick={() => checkL3('A_AND_C')} className={`absolute w-10 h-10 -ml-16 mt-6 rounded-full z-20 transition-colors ${selectedZoneL3==='A_AND_C'?'bg-lime-500/40':'hover:bg-lime-500/20'}`} />
                    
                    {/* B AND C (No A) */}
                    <button onClick={() => checkL3('B_AND_C')} className={`absolute w-10 h-10 ml-16 mt-6 rounded-full z-20 transition-colors ${selectedZoneL3==='B_AND_C'?'bg-orange-500/40':'hover:bg-orange-500/20'}`} />
                    
                    {/* A AND B AND C */}
                    <button onClick={() => checkL3('ALL')} className={`absolute w-8 h-8 mt-0 rounded-full z-20 transition-colors ${selectedZoneL3==='ALL'?'bg-slate-400/40':'hover:bg-slate-400/20'}`} />
                  </div>

                  {/* SQL Query Result */}
                  <div className="bg-slate-50 border border-slate-300 w-full max-w-lg rounded-lg p-2 text-center font-mono text-[10px] text-emerald-700 h-10 flex items-center justify-center">
                    {selectedZoneL3 === 'A_AND_C' ? "(SELECT * FROM SciFi INTERSECT SELECT * FROM Comedy) EXCEPT SELECT * FROM Action" :
                     selectedZoneL3 ? "Query updated. Incorrect region selected." :
                     "Waiting for query input..."}
                  </div>
                  
                  {/* Results */}
                  <div className="flex gap-4 h-16 items-center">
                    {selectedZoneL3 === 'A_AND_C' && (
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-lime-500">
                         <Film className="text-lime-600" size={20}/>
                         <span className="text-[10px] font-bold text-slate-900">Space Balls (Sci-Fi Comedy)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Level 4: Bio Matcher (2-Circle) === */}
              {currentLevel === 3 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2">
                  
                  {/* Visual Venn */}
                  <div className="relative w-72 h-48 shrink-0 flex items-center justify-center scale-110 sm:scale-125 origin-center">
                    {/* Set A */}
                    <div className="absolute w-40 h-40 rounded-full border-4 border-teal-500 -ml-16 flex items-start justify-center pt-2 pointer-events-none">
                       <span className="text-teal-600 font-black text-[10px] uppercase bg-white px-1 rounded border border-slate-200">Species X</span>
                    </div>
                    {/* Set B */}
                    <div className="absolute w-40 h-40 rounded-full border-4 border-fuchsia-500 ml-16 flex items-start justify-center pt-2 pointer-events-none">
                       <span className="text-fuchsia-600 font-black text-[10px] uppercase bg-white px-1 rounded border border-slate-200">Species Y</span>
                    </div>

                    <button 
                      onClick={() => checkL4('A_ONLY')}
                      className={`absolute w-20 h-32 -ml-28 rounded-l-full transition-colors z-20 ${selectedZoneL4 === 'A_ONLY' ? 'bg-teal-500/40' : 'hover:bg-teal-500/20'}`}
                    />
                    <button 
                      onClick={() => checkL4('A_AND_B')}
                      className={`absolute w-12 h-32 rounded-full transition-colors z-20 ${selectedZoneL4 === 'A_AND_B' ? 'bg-slate-400/40' : 'hover:bg-slate-400/20'}`}
                    />
                    <button 
                      onClick={() => checkL4('B_ONLY')}
                      className={`absolute w-20 h-32 ml-28 rounded-r-full transition-colors z-20 ${selectedZoneL4 === 'B_ONLY' ? 'bg-fuchsia-500/40' : 'hover:bg-fuchsia-500/20'}`}
                    />
                    {/* REMOVED FROM HERE */}
                  </div>

                  {/* Operation Result */}
                  <div className="bg-slate-50 border border-slate-300 w-full max-w-lg rounded-lg p-2 text-center font-mono text-[10px] text-teal-700 h-10 flex items-center justify-center">
                    {selectedZoneL4 === 'A_AND_B' ? "INTERSECTION(Species X, Species Y) -> Common Ancestry Genes" :
                     selectedZoneL4 ? "Calculating gene overlap... incorrect region." :
                     "Waiting for gene operation..."}
                  </div>

                  {/* Results Output */}
                  <div className="flex gap-4 h-24 items-center">
                    {selectedZoneL4 === 'A_AND_B' && (
                      <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-400">
                         <Dna className="text-slate-600 mb-1" size={24}/>
                         <span className="text-[9px] font-bold text-slate-900">Shared DNA Sequences</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Level 5: Super Query (3-Circle) === */}
              {currentLevel === 4 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2">
                  
                  {/* Visual Venn */}
                  <div className="relative w-64 h-64 shrink-0 flex items-center justify-center scale-110 sm:scale-125 origin-center">
                    
                    {/* Circles Outline */}
                    <div className="absolute w-32 h-32 rounded-full border-4 border-indigo-500 -ml-12 -mt-12 flex items-start justify-center pt-1 pointer-events-none">
                       <span className="text-indigo-600 font-black text-[9px] uppercase bg-white px-1 rounded border border-slate-200">Admin (A)</span>
                    </div>
                    <div className="absolute w-32 h-32 rounded-full border-4 border-emerald-500 ml-12 -mt-12 flex items-start justify-center pt-1 pointer-events-none">
                       <span className="text-emerald-600 font-black text-[9px] uppercase bg-white px-1 rounded border border-slate-200">HR (B)</span>
                    </div>
                    <div className="absolute w-32 h-32 rounded-full border-4 border-rose-500 mt-16 flex items-end justify-center pb-1 pointer-events-none">
                       <span className="text-rose-600 font-black text-[9px] uppercase bg-white px-1 rounded border border-slate-200">IT (C)</span>
                    </div>

                    {/* Interactive Div Zones (Approximate grid mapping) */}
                    <button onClick={() => checkL5('A_ONLY')} className={`absolute w-12 h-16 -ml-20 -mt-16 rounded-tl-full rounded-bl-full z-20 transition-colors ${selectedZoneL5==='A_ONLY'?'bg-indigo-500/40':'hover:bg-indigo-500/20'}`} />
                    <button onClick={() => checkL5('B_ONLY')} className={`absolute w-12 h-16 ml-20 -mt-16 rounded-tr-full rounded-br-full z-20 transition-colors ${selectedZoneL5==='B_ONLY'?'bg-emerald-500/40':'hover:bg-emerald-500/20'}`} />
                    <button onClick={() => checkL5('C_ONLY')} className={`absolute w-24 h-12 mt-28 rounded-b-full z-20 transition-colors ${selectedZoneL5==='C_ONLY'?'bg-rose-500/40':'hover:bg-rose-500/20'}`} />
                    
                    <button onClick={() => checkL5('A_AND_B')} className={`absolute w-10 h-10 -mt-20 rounded-full z-20 transition-colors ${selectedZoneL5==='A_AND_B'?'bg-teal-500/40':'hover:bg-teal-500/20'}`} />
                    <button onClick={() => checkL5('A_AND_C')} className={`absolute w-10 h-10 -ml-16 mt-6 rounded-full z-20 transition-colors ${selectedZoneL5==='A_AND_C'?'bg-purple-500/40':'hover:bg-purple-500/20'}`} />
                    <button onClick={() => checkL5('B_AND_C')} className={`absolute w-10 h-10 ml-16 mt-6 rounded-full z-20 transition-colors ${selectedZoneL5==='B_AND_C'?'bg-amber-500/40':'hover:bg-amber-500/20'}`} />
                    
                    {/* THIS IS THE CORRECT ANSWER */}
                    <button onClick={() => checkL5('ALL')} className={`absolute w-8 h-8 mt-0 rounded-full z-20 transition-colors ${selectedZoneL5==='ALL'?'bg-slate-400/60':'hover:bg-slate-400/30'}`} />
                  </div>

                  {/* SQL Query Result */}
                  <div className="bg-slate-50 border border-slate-300 w-full max-w-lg rounded-lg p-2 text-center font-mono text-[10px] text-slate-700 h-10 flex items-center justify-center">
                    {selectedZoneL5 === 'ALL' ? "SELECT * FROM Admin INTERSECT SELECT * FROM HR INTERSECT SELECT * FROM IT" :
                     selectedZoneL5 ? "Query updated. Incorrect region selected." :
                     "Waiting for query input..."}
                  </div>
                  
                  {/* Results */}
                  <div className="flex gap-4 h-16 items-center">
                    {selectedZoneL5 === 'ALL' && (
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-400">
                         <Lock className="text-slate-600" size={20}/>
                         <span className="text-[10px] font-bold text-slate-900">Super User Access</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === Level 6: Boss Level (2-Circle Symmetric Difference) === */}
              {currentLevel === 5 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2">
                  
                  {/* Visual Venn */}
                  <div className="relative w-72 h-48 shrink-0 flex items-center justify-center scale-110 sm:scale-125 origin-center">
                    {/* Set A */}
                    <div className="absolute w-40 h-40 rounded-full border-4 border-red-500 -ml-16 flex items-start justify-center pt-2 pointer-events-none">
                       <span className="text-red-600 font-black text-[10px] uppercase bg-white px-1 rounded border border-slate-200">Client (A)</span>
                    </div>
                    {/* Set B */}
                    <div className="absolute w-40 h-40 rounded-full border-4 border-cyan-500 ml-16 flex items-start justify-center pt-2 pointer-events-none">
                       <span className="text-cyan-600 font-black text-[10px] uppercase bg-white px-1 rounded border border-slate-200">Server (B)</span>
                    </div>

                    <button 
                      onClick={() => checkL6('A_ONLY')}
                      className={`absolute w-20 h-32 -ml-28 rounded-l-full transition-colors z-20 ${selectedZonesL6.includes('A_ONLY') ? 'bg-red-500/40' : 'hover:bg-red-500/20'}`}
                    />
                    <button 
                      onClick={() => checkL6('A_AND_B')}
                      className={`absolute w-12 h-32 rounded-full transition-colors z-20 ${selectedZonesL6.includes('A_AND_B') ? 'bg-slate-400/40' : 'hover:bg-slate-400/20'}`}
                    />
                    <button 
                      onClick={() => checkL6('B_ONLY')}
                      className={`absolute w-20 h-32 ml-28 rounded-r-full transition-colors z-20 ${selectedZonesL6.includes('B_ONLY') ? 'bg-cyan-500/40' : 'hover:bg-cyan-500/20'}`}
                    />
                  </div>

                  {/* Operation Result */}
                  <div className="bg-slate-50 border border-slate-300 w-full max-w-lg rounded-lg p-2 text-center font-mono text-[10px] text-red-700 h-10 flex items-center justify-center">
                    {selectedZonesL6.length === 2 && selectedZonesL6.includes('A_ONLY') && selectedZonesL6.includes('B_ONLY') 
                     ? "(Client UNION Server) EXCEPT (Client INTERSECT Server)" :
                     selectedZonesL6.length > 0 ? "Select all regions that apply..." :
                     "Waiting for multiple selections..."}
                  </div>

                  {/* Results Output */}
                  <div className="flex gap-4 h-24 items-center">
                    {selectedZonesL6.length === 2 && selectedZonesL6.includes('A_ONLY') && selectedZonesL6.includes('B_ONLY') && (
                      <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-cyan-500">
                         <Skull className="text-cyan-600 mb-1" size={24}/>
                         <span className="text-[9px] font-bold text-slate-900">Symmetric Difference Achieved!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-2 bg-red-50 px-4 py-2 rounded-xl border-2 border-red-500 shadow-xl max-w-lg text-center z-30"
                >
                  <p className="text-xs font-bold text-red-700 tracking-wide">
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center bg-white p-2 rounded-xl border-2 border-slate-200 shrink-0">
            <button 
              onClick={resetCurrentLevel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-[10px]"
            >
              <RotateCcw size={14} /> Reset Level
            </button>
            
            {isLevelComplete() ? (
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={nextLevel}
                className="flex items-center gap-1.5 px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 size={16} /> {currentLevel === 5 ? 'Finish Lab' : 'Next Level'}
              </motion.button>
            ) : (
              <div className="px-6 py-2 font-black text-xs text-slate-500 uppercase tracking-widest">
                Awaiting Input...
              </div>
            )}
          </div>
          
        </div>
      )}
    </LabShell>
  );
}
