"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Play, ShieldAlert, ShieldCheck, Cpu, Database, AlertOctagon, Repeat, Lock, ArrowDownUp, CheckCircle2, XCircle, Save, Fuel, GitMerge, GitCommit } from 'lucide-react';
import LabShell from '@/components/LabShell';
import { useLabAudio } from '@/hooks/useLabAudio';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import Celebration from '@/components/Celebration';

type Phase = 'LEARN' | 'ATTACK_RUNNING' | 'HACKED' | 'PATCHING' | 'PATCH_RUNNING' | 'SECURED' | 'GOVERNANCE' | 'COMPLETED';

const BLOCKS = [
    { id: 'check', text: 'require(balances[msg.sender] > 0);', color: 'text-blue-300', border: 'border-l-blue-500', bg: 'bg-blue-900/20', desc: '1. CHECK: Ensure user has funds' },
    { id: 'interact', text: 'msg.sender.call.value(amount)("");', color: 'text-rose-300', border: 'border-l-rose-500', bg: 'bg-rose-900/20', desc: '2. INTERACT: Send Ether to user' },
    { id: 'effect', text: 'balances[msg.sender] = 0;', color: 'text-emerald-300', border: 'border-l-emerald-500', bg: 'bg-emerald-900/20', desc: '3. EFFECT: Update internal balance' }
];

export default function EthereumDao9() {
    const { playClick, playPop, playError, playSuccess, playZap, playHeavyThud, playChime } = useLabAudio();
    const { reportComplete } = useLMSBridge("ethereumdao9");

    const [phase, setPhase] = useState<Phase>('LEARN');
    const [daoBalance, setDaoBalance] = useState(150);
    const [isShaking, setIsShaking] = useState(false);
    const [attackerBalance, setAttackerBalance] = useState(0);
    const [callStack, setCallStack] = useState<number[]>([]);
    const [activeLine, setActiveLine] = useState<string | null>(null);
    const [codeOrder, setCodeOrder] = useState(BLOCKS);
    const [strikes, setStrikes] = useState(0);
    const [showModal, setShowModal] = useState<{show: boolean, title: string, msg: string, type: 'error'|'info'|'locked'|'success' | 'none'}>({show: false, title: '', msg: '', type: 'none'});
    const [govChoice, setGovChoice] = useState<'hard'|'soft'|'none'|null>(null);
    
    // New mechanics state
    const [attempt, setAttempt] = useState(0); // 0 = First hack (low gas), 1 = Second hack (high gas)
    const [gas, setGas] = useState(100);

    const attackRunningRef = useRef(false);

    const runExploit = async () => {
        if (attackRunningRef.current) return;
        attackRunningRef.current = true;
        setPhase('ATTACK_RUNNING');
        playClick();

        const isFirstAttempt = attempt === 0;
        let currentDao = daoBalance;
        let currentAttacker = attackerBalance;
        let stack = [];
        
        let currentGas = isFirstAttempt ? 40 : 100;
        setGas(currentGas);

        const maxIterations = isFirstAttempt ? 2 : 10;

        for (let i = 0; i < maxIterations; i++) {
            if (!attackRunningRef.current) break;
            if (currentDao <= 0) break; // Cannot steal beyond 0
            
            stack.push(i);
            setCallStack([...stack]);
            
            setActiveLine('check');
            playPop();
            currentGas -= 10;
            setGas(currentGas);
            await new Promise(r => setTimeout(r, 400));
            
            setActiveLine('interact');
            playZap();
            
            const stealAmount = Math.min(30, currentDao);
            currentDao -= stealAmount;
            currentAttacker += stealAmount;
            
            currentGas -= 10;
            setGas(currentGas);
            setDaoBalance(currentDao);
            setAttackerBalance(currentAttacker);
            await new Promise(r => setTimeout(r, 400));
        }

        setActiveLine(null);
        playHeavyThud();
        
        await new Promise(r => setTimeout(r, 1000));
        
        if (isFirstAttempt) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setPhase('LEARN');
            setAttempt(1);
            setCallStack([]);
            setShowModal({
                show: true,
                type: 'error',
                title: 'OUT OF GAS EXCEPTION',
                msg: 'Your recursive loop crashed because it ran out of fuel! You only managed to drain 60M ETH before execution halted. You must increase your transaction gas limit to finish the heist.'
            });
        } else {
            setPhase('HACKED');
            setShowModal({
                show: true,
                type: 'error',
                title: 'SYSTEM COMPROMISED',
                msg: 'With enough Gas, the reentrancy loop stayed alive until the vault was completely drained to 0. The attacker now holds the entire 150M ETH.'
            });
        }
        attackRunningRef.current = false;
    };
    
    const tryUpdateLiveContract = () => {
        playClick();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setShowModal({
            show: true,
            type: 'locked',
            title: 'ACCESS DENIED: IMMUTABLE CODE',
            msg: 'Smart contracts are permanently burned onto the blockchain. You cannot simply "edit" or "update" live code! You must draft a secure version in a Local Sandbox.'
        });
        setPhase('PATCHING');
        // Do NOT reset balances here. Keep continuous math! Vault is 0, Hacker is 150.
    };

    const runPatchTest = async () => {
        if (attackRunningRef.current) return;
        attackRunningRef.current = true;
        setPhase('PATCH_RUNNING');
        playClick();

        // Inject 150M into the NEW patched contract, but Hacker KEEPS their stolen money!
        setDaoBalance(150);
        let startAttacker = attackerBalance; // Keep continuous math
        
        setCallStack([]);
        setGas(100);

        const isCorrect = codeOrder[0].id === 'check' && codeOrder[1].id === 'effect' && codeOrder[2].id === 'interact';

        for (let i = 0; i < codeOrder.length; i++) {
            setActiveLine(codeOrder[i].id);
            if (codeOrder[i].id === 'interact') playZap();
            else playPop();
            await new Promise(r => setTimeout(r, 500));

            if (codeOrder[i].id === 'interact') {
                const effectIdx = codeOrder.findIndex(b => b.id === 'effect');
                if (effectIdx > i) {
                    setDaoBalance(0);
                    setAttackerBalance(startAttacker + 150); // Steals another 150M!
                    setCallStack([1,2,3,4,5]);
                    playHeavyThud();
                    setActiveLine(null);
                    await new Promise(r => setTimeout(r, 1000));
                    
                    const newStrikes = strikes + 1;
                    setStrikes(newStrikes);
                    
                    if (newStrikes >= 3) {
                        setShowModal({
                            show: true, type: 'locked', title: 'SYSTEM LOCKED',
                            msg: 'Multiple failed audits. The DAO has collapsed entirely. You must restart the simulation.'
                        });
                    } else {
                        setShowModal({
                            show: true, type: 'error', title: 'VULNERABILITY REMAINS',
                            msg: `The contract is still vulnerable to reentrancy! You must update the internal state (EFFECT) BEFORE handing control to an external address (INTERACT). Strikes: ${newStrikes}/3`
                        });
                        setPhase('PATCHING');
                    }
                    attackRunningRef.current = false;
                    return;
                } else {
                    setDaoBalance(120);
                    setAttackerBalance(startAttacker + 30);
                }
            }
        }

        setActiveLine(null);
        playSuccess();
        await new Promise(r => setTimeout(r, 1000));
        
        setPhase('SECURED');
        setShowModal({
            show: true, type: 'success', title: 'CONTRACT SECURED',
            msg: 'Excellent! By following the Checks-Effects-Interactions pattern, the balance is zeroed before funds are sent. If the attacker tries to reenter, the CHECK phase blocks them.'
        });
        attackRunningRef.current = false;
    };

    const handleReset = () => {
        playClick();
        setPhase('LEARN');
        setAttempt(0);
        setGas(100);
        setDaoBalance(150);
        setAttackerBalance(0);
        setCallStack([]);
        setActiveLine(null);
        setCodeOrder(BLOCKS);
        setStrikes(0);
        setShowModal({show: false, title: '', msg: '', type: 'none'});
        setGovChoice(null);
        attackRunningRef.current = false;
    };

    const executeGovernance = () => {
        if (!govChoice) return;
        playClick();
        if (govChoice === 'hard') {
            playChime();
            setPhase('COMPLETED');
            reportComplete({ labId: 'ethereumdao9', points: 100 });
        } else {
            playError();
            setShowModal({
                show: true, type: 'error', title: 'COMMUNITY REJECTED',
                msg: govChoice === 'soft' 
                    ? 'A Soft Fork was attempted but a secondary bug was found in the update, risking the entire network. Try another consensus mechanism.' 
                    : 'Doing nothing means the attacker legally keeps 14% of all Ether in existence. The community refuses this outcome.'
            });
        }
    };

    return (
        <LabShell
            labId="ethereumdao9"
            title="The Ethereum DAO"
            instruction={phase === 'LEARN' ? "Step 1: Execute the withdrawal function to observe the race condition vulnerability." : phase === 'PATCHING' ? "Step 2: Drag and drop the code blocks to secure the new contract." : "Step 3: Resolve the crisis via community governance."}
            compact={true}
            bgOverride="bg-slate-200"
            onReset={handleReset}
        >
            <div className="flex flex-col lg:flex-row w-full h-full min-h-0 gap-2 sm:gap-4">
                
                {/* LEFT PANEL - SMART CONTRACT IDE */}
                <div className="flex-1 bg-slate-900 rounded-2xl shadow-xl border-4 border-slate-800 flex flex-col overflow-hidden min-h-[300px]">
                    <div className="bg-slate-950 p-3 sm:p-4 flex items-center justify-between border-b-2 border-slate-800 shrink-0 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Cpu size={18} className="text-cyan-400" />
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">DAO_Contract.sol</span>
                        </div>
                    </div>

                    <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col justify-center">
                        <div className="text-slate-400 font-mono text-sm mb-2 font-bold">function withdraw(uint amount) public {'{'}</div>
                        
                        <div className="flex-1 flex flex-col gap-2 pl-3">
                            {phase === 'PATCHING' && (
                                <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl py-2 px-3 mb-1 flex items-center justify-center gap-2 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                                    <ArrowDownUp size={18} className="text-amber-400" />
                                    <span className="text-amber-400 font-black text-xs uppercase tracking-widest">Drag blocks up/down to reorder execution flow</span>
                                </div>
                            )}
                            {(phase === 'LEARN' || phase === 'ATTACK_RUNNING' || phase === 'HACKED') ? (
                                // Static Phase
                                BLOCKS.map(block => (
                                    <div key={block.id} className={`p-3 rounded-r-xl border-y-2 border-r-2 border-l-[6px] ${block.border} transition-all duration-300 flex items-center justify-between ${activeLine === block.id ? 'bg-slate-800 shadow-[0_0_20px_rgba(6,182,212,0.4)] border-y-cyan-700 border-r-cyan-700' : `${block.bg} border-y-slate-800 border-r-slate-800`}`}>
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase tracking-widest mb-1.5 font-black">{block.desc}</span>
                                            <span className={`${block.color} font-mono text-sm font-bold`}>{block.text}</span>
                                        </div>
                                        {activeLine === block.id && <Play size={16} className="text-cyan-400 shrink-0 animate-pulse" />}
                                    </div>
                                ))
                            ) : (
                                // Interactive Reorder Phase
                                <Reorder.Group axis="y" values={codeOrder} onReorder={setCodeOrder} className="flex flex-col gap-3 h-full justify-center">
                                    {codeOrder.map(block => (
                                        <Reorder.Item key={block.id} value={block} dragListener={phase === 'PATCHING'} className={`p-3 rounded-r-xl border-y-2 border-r-2 border-l-[6px] ${block.border} cursor-grab active:cursor-grabbing transition-colors ${activeLine === block.id ? 'bg-slate-800 border-y-cyan-700 border-r-cyan-700' : `bg-slate-800 shadow-lg border-y-slate-700 border-r-slate-700 hover:border-y-slate-500 hover:border-r-slate-500`}`}>
                                            <div className="flex items-center gap-3">
                                                <ArrowDownUp size={16} className="text-slate-500 shrink-0" />
                                                <div>
                                                    <span className="text-slate-400 block text-[10px] uppercase tracking-widest mb-1.5 font-black">{block.desc}</span>
                                                    <span className={`${block.color} font-mono text-sm font-bold`}>{block.text}</span>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                        </div>
                        <div className="text-slate-400 font-mono text-sm mt-2 font-bold">{'}'}</div>
                    </div>

                    <div className="p-4 bg-slate-950 border-t-2 border-slate-800 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                        {phase === 'LEARN' && attempt === 0 && (
                            <button onClick={runExploit} className="w-full py-4 bg-slate-900 border-2 border-rose-600 hover:bg-rose-600 hover:text-white text-rose-500 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.15)] hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 flex items-center justify-center gap-3">
                                <AlertOctagon size={20} /> Execute Exploit
                            </button>
                        )}
                        {phase === 'LEARN' && attempt === 1 && (
                            <button onClick={runExploit} className="w-full py-4 bg-amber-950 border-2 border-amber-500 hover:bg-amber-600 hover:text-white text-amber-500 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-3 animate-pulse">
                                <Fuel size={20} /> Increase Gas & Re-Execute
                            </button>
                        )}
                        {phase === 'ATTACK_RUNNING' && (
                            <div className="w-full py-4 bg-rose-600 shadow-[0_0_25px_rgba(225,29,72,0.6)] text-white font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 animate-pulse">
                                <Repeat size={20} className="animate-spin" /> REENTRANCY LOOP DETECTED
                            </div>
                        )}
                        {phase === 'HACKED' && (
                            <button onClick={tryUpdateLiveContract} className="w-full py-4 bg-blue-900 border-2 border-blue-500 hover:bg-blue-600 hover:text-white text-blue-400 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 flex items-center justify-center gap-3">
                                <Save size={20} /> Save & Update Live Contract
                            </button>
                        )}
                        {phase === 'PATCHING' && (
                            <button onClick={runPatchTest} className="w-full py-4 bg-emerald-600 border-2 border-emerald-500 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center gap-3">
                                <ShieldCheck size={20} /> Test New Contract
                            </button>
                        )}
                        {phase === 'PATCH_RUNNING' && (
                            <div className="w-full py-4 bg-slate-800 border-2 border-slate-700 text-emerald-400 font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 animate-pulse">
                                <Cpu size={20} /> RUNNING SECURITY AUDIT...
                            </div>
                        )}
                        {(phase === 'SECURED' || phase === 'GOVERNANCE' || phase === 'COMPLETED') && (
                            <div className="w-full py-4 bg-emerald-900/40 text-emerald-400 font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 border border-emerald-800/50">
                                <CheckCircle2 size={20} /> CONTRACT SECURED
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL - BLOCKCHAIN & STACK */}
                <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-h-0">
                    
                    {/* VAULT STATUS */}
                    <div className="bg-slate-100 rounded-2xl shadow-inner border-2 border-slate-200 p-4 shrink-0 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-2 left-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{phase.includes('PATCH') ? 'Sandbox Network (Test Mode)' : 'Live Network Balances'}</div>
                        
                        <div className="flex w-full items-stretch justify-around mt-3">
                            {/* DAO Vault */}
                            <div className="flex flex-col items-center justify-center z-10 bg-white border-2 border-slate-200 p-4 rounded-xl shadow-md min-w-[120px] md:min-w-[140px]">
                                <Database size={28} className={daoBalance > 0 ? "text-indigo-500 drop-shadow-sm" : "text-slate-300"} />
                                <span className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest text-center">DAO Vault<br/><span className="text-[8px] text-slate-400/80 tracking-normal">(Community Fund)</span></span>
                                <span className={`text-2xl md:text-3xl font-black tracking-tighter mt-1 ${daoBalance > 0 ? "text-indigo-700" : "text-rose-500"}`}>{Math.max(0, daoBalance)}M ETH</span>
                            </div>

                            {/* Conduit */}
                            <div className="flex-1 px-2 md:px-4 relative flex items-center justify-center">
                                <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden relative shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] border-2 border-slate-300">
                                    <AnimatePresence>
                                        {phase === 'ATTACK_RUNNING' && (
                                            <motion.div initial={{x: '-100%'}} animate={{x: '100%'}} transition={{repeat: Infinity, duration: 0.3, ease: 'linear'}} className="w-full h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)]" />
                                        )}
                                    </AnimatePresence>
                                </div>
                                {phase === 'ATTACK_RUNNING' && <div className="absolute inset-0 flex items-center justify-center"><ArrowDownUp size={24} className="text-white z-10 rotate-90 drop-shadow-lg animate-pulse" /></div>}
                            </div>

                            {/* Hacker Wallet */}
                            <div className="flex flex-col items-center justify-center z-10 bg-slate-900 border-2 border-slate-800 p-4 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] min-w-[120px] md:min-w-[140px]">
                                <AlertOctagon size={28} className={attackerBalance > 0 ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-slate-700"} />
                                <span className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Hacker</span>
                                <span className={`text-2xl md:text-3xl font-black tracking-tighter mt-1 ${attackerBalance > 0 ? "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "text-slate-600"}`}>{attackerBalance}M ETH</span>
                            </div>
                        </div>
                    </div>

                    {/* CALL STACK / GOVERNANCE */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border-2 border-slate-200 flex flex-col overflow-hidden min-h-[260px] relative">
                        
                        <AnimatePresence mode="wait">
                            {(phase !== 'SECURED' && phase !== 'GOVERNANCE' && phase !== 'COMPLETED') ? (
                                <motion.div key="stack" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex flex-col bg-slate-50">
                                    <div className="bg-white p-3 border-b-2 border-slate-100 shrink-0 shadow-sm z-10 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Cpu size={16}/> EVM Call Stack</span>
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1 px-3 shadow-inner">
                                            <Fuel size={14} className={gas > 50 ? "text-emerald-500" : gas > 0 ? "text-amber-500" : "text-rose-500"} />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gas</span>
                                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-300 ${gas > 50 ? 'bg-emerald-500' : gas > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{width: `${gas}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Grid Background */}
                                    <div className="flex-1 p-2 sm:p-3 overflow-y-hidden flex flex-col-reverse gap-2 relative" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                        
                                        {/* Empty Slots */}
                                        {callStack.length === 0 && (
                                            <div className="absolute inset-0 flex flex-col gap-2 p-2 sm:p-3">
                                                {[0,1,2,3,4].map(i => (
                                                    <div key={`empty-${i}`} className="border-2 border-dashed border-slate-300 rounded-xl p-2 h-[42px] flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                                        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">_ SYS_IDLE : 0x000{i}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Active Stack Frames */}
                                        {callStack.map((_, i) => (
                                            <motion.div initial={{opacity:0, scale:0.95, y:10}} animate={{opacity:1, scale:1, y:0}} key={i} className="bg-rose-50 border-2 border-rose-300 rounded-xl p-2 sm:px-3 shadow-sm flex items-center justify-between z-10">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-mono text-rose-500 font-black">0x000{i}</span>
                                                    <span className="text-sm font-black text-rose-800 tracking-tight">withdraw()</span>
                                                </div>
                                                <span className="text-[10px] font-black bg-rose-600 text-white px-3 py-1 rounded-full uppercase shadow-sm animate-pulse tracking-widest">Re-entry</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="gov" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="absolute inset-0 flex flex-col p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-white overflow-y-auto">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1 shrink-0">Decentralized Governance</h3>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 mb-3 leading-relaxed shrink-0">The code is patched, but $150M was stolen. How does the Ethereum community resolve this existential crisis?</p>
                                    
                                    <div className="flex flex-col gap-2 flex-1 min-h-0 justify-center">
                                        {[
                                            { id: 'hard', title: 'Hard Fork', desc: 'Rewrite blockchain history to before the hack. Creates Ethereum (ETH) & Ethereum Classic (ETC).' },
                                            { id: 'soft', title: 'Soft Fork', desc: 'Blacklist the attacker\'s address. Does not rewrite history, but introduces censorship.' },
                                            { id: 'none', title: 'Do Nothing', desc: '"Code is Law". The smart contract executed exactly as written. The attacker keeps the funds.' }
                                        ].map(opt => (
                                            <button 
                                                key={opt.id} 
                                                onClick={() => { playClick(); setGovChoice(opt.id as any); }}
                                                className={`text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all shrink-0 ${govChoice === opt.id ? 'bg-indigo-600 border-indigo-700 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                            >
                                                <div className={`text-[11px] sm:text-xs font-black uppercase tracking-widest ${govChoice === opt.id ? 'text-white' : 'text-slate-800'}`}>{opt.title}</div>
                                                <div className={`text-[9px] sm:text-[10px] font-medium leading-snug mt-0.5 ${govChoice === opt.id ? 'text-indigo-100' : 'text-slate-500'}`}>{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        disabled={!govChoice} 
                                        onClick={executeGovernance}
                                        className={`mt-3 w-full py-2.5 sm:py-3 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all shrink-0 ${govChoice ? 'bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/50 hover:bg-indigo-500 active:scale-95' : 'bg-slate-200 text-slate-400'}`}
                                    >
                                        Execute Consensus
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {showModal.show && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className={`bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border-4 ${showModal.type === 'error' ? 'border-rose-500' : showModal.type === 'locked' ? 'border-slate-800' : 'border-emerald-500'}`}>
                            {showModal.type === 'error' ? <XCircle size={56} className="mx-auto text-rose-500 mb-5" /> : showModal.type === 'locked' ? <Lock size={56} className="mx-auto text-slate-800 mb-5" /> : <ShieldCheck size={56} className="mx-auto text-emerald-500 mb-5" />}
                            
                            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter uppercase">{showModal.title}</h2>
                            <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
                                {showModal.msg}
                            </p>
                            
                            <button 
                                onClick={() => {
                                    playClick();
                                    if (showModal.type === 'locked' && showModal.title === 'SYSTEM LOCKED') handleReset();
                                    else if (showModal.type === 'success') {
                                        setPhase('GOVERNANCE');
                                        setDaoBalance(0); // Snap back to live reality
                                        setAttackerBalance(150);
                                        setShowModal({show:false, title:'', msg:'', type:'none'});
                                    } else {
                                        setShowModal({show:false, title:'', msg:'', type:'none'});
                                    }
                                }} 
                                className={`w-full font-black py-4 rounded-xl transition-all shadow-md uppercase tracking-widest text-sm ${showModal.type === 'error' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : showModal.type === 'locked' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                            >
                                {showModal.type === 'locked' && showModal.title === 'SYSTEM LOCKED' ? 'Reboot System' : 'Acknowledge'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Celebration
                isActive={phase === 'COMPLETED'}
                message="History rewritten! The Hard Fork successfully recovered the funds, though it fractured the community forever. You've mastered reentrancy and blockchain governance."
                onReplay={handleReset}
            />

        </LabShell>
    );
}
