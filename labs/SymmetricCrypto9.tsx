"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  PaintBucket, 
  Key, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  Bot,
  HelpCircle,
  Activity,
  Flame,
  Zap,
  Cookie
} from "lucide-react";

// ─── TYPES & CONSTANTS ────────────────────────────────────────────────────────

type L1Step = "idle" | "public_added" | "private_mixed" | "flung" | "shared_potion";

const PRESET_MESSAGES = [
  "DONT TOUCH THE COOKIES! ",
  "SECRET CLUB MEETING AT 5 ",
  "DINO ISLAND IS REAL! ",
  "BOB LOVES CANDY FLOSS "
];

const QUIZ_QUESTIONS = [
  {
    question: "In Symmetric Cryptography, how many secret keys do Alice and Bob share to lock AND unlock their messages?",
    options: [
      { text: " Just ONE shared key!", isCorrect: true },
      { text: " Ten different keys!", isCorrect: false },
      { text: " Zero keys, they just shout!", isCorrect: false }
    ],
    hint: "Think about the word 'Symmetric' — it means same on both sides! They use the same key for locking and unlocking."
  },
  {
    question: "Why can't Eve the Sneaky Badger steal the secret key from the flying paint mixtures?",
    options: [
      { text: " Once paint is mixed, you cannot unmix it!", isCorrect: true },
      { text: " She forgot her paint brushes at home!", isCorrect: false },
      { text: " She was too busy eating acorns!", isCorrect: false }
    ],
    hint: "In math, some things are easy to do but super hard to undo. Mixing paint is a one-way street!"
  },
  {
    question: "What makes a secret key super-duper strong and hard for a hacking robot to guess?",
    options: [
      { text: " Making it very long (like a 256-bit T-Rex key!)", isCorrect: true },
      { text: " Making it just 1 letter long.", isCorrect: false },
      { text: " Writing it on a post-it note on the monitor.", isCorrect: false }
    ],
    hint: "A longer key means there are more combinations than there are stars in the sky!"
  }
];

// Helper components for cartoon rendering
const HelperBot = ({ text, face = "NEUTRAL" }: { text: string; face?: string }) => (
  <div className="flex items-center gap-3 bg-amber-100 border-2 border-black p-3.5 rounded-2xl shadow-none">
    <div className="w-12 h-12 bg-amber-400 border-2 border-black rounded-full flex flex-col items-center justify-center font-bold text-lg select-none shrink-0 animate-bounce">
      <span className="text-[10px] uppercase text-zinc-200 leading-none font-black">Agent</span>
      <span className="text-sm font-black">{face}</span>
    </div>
    <p className="text-xs font-black text-zinc-800 leading-normal">{text}</p>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SymmetricCrypto9() {
  const { reportComplete } = useLMSBridge("symmetriccrypto9");
  const { playClick, playPop, playSuccess, playError, playZap, playDrop, playChime } = useLabAudio();

  const [phase, setPhase] = useState<"explore" | "simulate" | "quiz">("explore");
  const [level1Done, setLevel1Done] = useState(false);
  const [level2Done, setLevel2Done] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // ── LEVEL 1 STATES (Paint Mixer) ──
  const [l1Step, setL1Step] = useState<L1Step>("idle");
  const [aliceBowl, setAliceBowl] = useState("#f1f5f9"); // Slate-100 empty
  const [bobBowl, setBobBowl] = useState("#f1f5f9");
  const [eveMessage, setEveMessage] = useState("Haha, I will steal their colors! ");
  const [eveInterceptions, setEveInterceptions] = useState<{ left: string | null; right: string | null }>({ left: null, right: null });

  // ── LEVEL 2 STATES (Cookie Safe) ──
  const [selectedPresetMsg, setSelectedPresetMsg] = useState(PRESET_MESSAGES[0]);
  const [customMsg, setCustomMsg] = useState("");
  const [keyStrength, setKeyStrength] = useState<"128" | "192" | "256">("128");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedMsg, setEncryptedMsg] = useState<string | null>(null);
  const [decryptedMsg, setDecryptedMsg] = useState<string | null>(null);
  const [triedKey, setTriedKey] = useState<"banana" | "purple" | null>(null);
  const [safeState, setSafeState] = useState<"locked" | "wrong" | "opened">("locked");

  // ── LEVEL 3 STATES (Quiz) ──
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelectedOpt, setQuizSelectedOpt] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);

  // ── LEVEL 1 FUNCTIONS ──
  const l1AddPublicBase = () => {
    if (l1Step !== "idle") return;
    playDrop();
    setL1Step("public_added");
    setAliceBowl("#fde047"); // Lemon Yellow
    setBobBowl("#fde047");
  };

  const l1MixPrivate = () => {
    if (l1Step !== "public_added") return;
    playZap();
    setL1Step("private_mixed");
    setAliceBowl("#f97316"); // Mixed Orange (Yellow + Red)
    setBobBowl("#22c55e"); // Mixed Green (Yellow + Blue)
  };

  const l1FlingPaint = () => {
    if (l1Step !== "private_mixed") return;
    playPop();
    setL1Step("flung");
    setEveMessage("Ooh! Flying colors! Let me grab some... ");

    // After animation finishes
    setTimeout(() => {
      playError();
      setEveInterceptions({ left: "#f97316", right: "#22c55e" });
      setEveMessage("Booo! It's already mixed! I can't unmix paint to get the Red or Blue bases! ");
    }, 1800);
  };

  const l1CreateSharedPotion = () => {
    if (l1Step !== "flung") return;
    playSuccess();
    setL1Step("shared_potion");
    setAliceBowl("#a855f7"); // Purple Magical Potion
    setBobBowl("#a855f7");
    setLevel1Done(true);
  };

  const resetL1 = () => {
    setL1Step("idle");
    setAliceBowl("#f1f5f9");
    setBobBowl("#f1f5f9");
    setEveMessage("Haha, I will steal their colors! ");
    setEveInterceptions({ left: null, right: null });
    playClick();
  };

  // ── LEVEL 2 FUNCTIONS ──
  const runEncryption = () => {
    playZap();
    setIsEncrypting(true);
    setEncryptedMsg(null);
    setDecryptedMsg(null);
    setSafeState("locked");
    setTriedKey(null);

    const timeToCrunch = keyStrength === "128" ? 800 : keyStrength === "192" ? 1400 : 2000;
    
    setTimeout(() => {
      playChime();
      setIsEncrypting(false);
      const text = customMsg.trim() || selectedPresetMsg;
      
      // Let's scramble text into gibberish emojis
      const emojis = ["", "", "", "", "", "", "", "", "", ""];
      let scramble = "";
      for (let i = 0; i < Math.min(12, text.length); i++) {
        scramble += emojis[Math.floor(Math.random() * emojis.length)];
      }
      setEncryptedMsg(scramble);
    }, timeToCrunch);
  };

  const tryDecrypt = (keyType: "banana" | "purple") => {
    setTriedKey(keyType);
    if (keyType === "purple") {
      playSuccess();
      setSafeState("opened");
      setDecryptedMsg(customMsg.trim() || selectedPresetMsg);
      setLevel2Done(true);
    } else {
      playError();
      setSafeState("wrong");
      setDecryptedMsg(null);
    }
  };

  const resetL2 = () => {
    setCustomMsg("");
    setEncryptedMsg(null);
    setDecryptedMsg(null);
    setTriedKey(null);
    setSafeState("locked");
    playClick();
  };

  // ── LEVEL 3 FUNCTIONS ──
  const handleQuizAnswer = (optIdx: number, isCorrect: boolean) => {
    if (quizFeedback === "correct") return;
    setQuizSelectedOpt(optIdx);
    
    if (isCorrect) {
      playSuccess();
      setQuizFeedback("correct");
      setShowHint(false);
    } else {
      playError();
      setQuizFeedback("wrong");
    }
  };

  const nextQuizQuestion = () => {
    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      setHasWon(true);
      reportComplete();
    } else {
      setQuizIdx(prev => prev + 1);
      setQuizSelectedOpt(null);
      setQuizFeedback(null);
      setShowHint(false);
      playPop();
    }
  };

  const handleReplayAll = () => {
    // Reset Level 1
    setL1Step("idle");
    setAliceBowl("#f1f5f9");
    setBobBowl("#f1f5f9");
    setEveMessage("Haha, I will steal their colors! ");
    setEveInterceptions({ left: null, right: null });
    setLevel1Done(false);

    // Reset Level 2
    setCustomMsg("");
    setEncryptedMsg(null);
    setDecryptedMsg(null);
    setTriedKey(null);
    setSafeState("locked");
    setLevel2Done(false);

    // Reset Level 3
    setQuizIdx(0);
    setQuizSelectedOpt(null);
    setQuizFeedback(null);
    setShowHint(false);

    // Go back to Level 1
    setPhase("explore");
    setHasWon(false);
    playClick();
  };

  return (
    <LabShell
      labId="symmetriccrypto9" theme="forge"
      bgOverride="bg-cartoony-grid"
      title="Symmetric Crypto & Paint-Mixing Key Exchange"
      onReset={handleReplayAll}
      instruction="1. Learn the principles of symmetric cryptography and the challenge of key distribution. 2. Use the paint-mixing analogy simulation to visualize the Diffie-Hellman key exchange. 3. Securely agree on a shared secret key over a public channel. 4. Encrypt and decrypt a message using the successfully exchanged symmetric key."
      compact
    >
      {/* Visual stylesheet for cartoony toy-like styling */}
      <style>{`
        .bg-cartoony-grid {
          background-color: #fef9c3 !important; /* light soft yellow */
          background-image: 
            radial-gradient(#fbcfe8 15%, transparent 15%),
            radial-gradient(#e0f2fe 15%, transparent 15%) !important;
          background-size: 40px 40px !important;
          background-position: 0 0, 20px 20px !important;
          position: relative;
        }

        .cartoon-panel {
          background: #ffffff !important;
          border: 2px solid #000000 !important;
          border-radius: 24px !important;
          box-shadow: none !important;
          color: #0f172a !important;
        }

        .cartoon-screen {
          background: #f8fafc !important;
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }

        .cartoon-btn-tab {
          border: 2px solid #000000 !important;
          border-radius: 16px !important;
          box-shadow: none !important;
          font-weight: 900 !important;
          background: #ffffff !important;
          color: #1e293b !important;
          transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .cartoon-btn-tab:not([disabled]):hover {
          transform: translateY(-2px);
          box-shadow: none !important;
        }

        .cartoon-btn-tab:not([disabled]):active {
          transform: translateY(1px);
          box-shadow: none !important;
        }

        .cartoon-btn-tab.active-tab {
          background: #ef4444 !important;
          color: #ffffff !important;
          transform: translateY(1px);
          box-shadow: none !important;
        }

        .cartoon-btn-action {
          background: #ef4444 !important;
          color: #ffffff !important;
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
          font-weight: 900 !important;
          transition: all 0.1s ease;
        }

        .cartoon-btn-action:hover:not([disabled]) {
          transform: translateY(-2px);
          box-shadow: none !important;
          background: #dc2626 !important;
        }

        .cartoon-btn-action:active:not([disabled]) {
          transform: translateY(1px);
          box-shadow: none !important;
        }
      `}</style>

      <Celebration
        isActive={hasWon}
        message="Fantastic! You successfully mixed colors to generate a shared secret key, encrypted the secret cookie recipe, and proved your knowledge at the Academy! You are now a certified Secret Cryptography Agent! "
        onReplay={handleReplayAll}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 select-none">
        
        {/* Navigation Tabs - Gated */}
        <div className="shrink-0 flex gap-3">
          <button
            onClick={() => { setPhase("explore"); playPop(); }}
            className={`flex-1 py-3 text-xs md:text-sm uppercase tracking-wider cartoon-btn-tab ${
              phase === "explore" ? "active-tab text-white" : "bg-[#09090b] text-zinc-800"
            }`}
          >
             L1: Explore paint
          </button>
          
          <button
            onClick={() => { if (level1Done) { setPhase("simulate"); playPop(); } }}
            disabled={!level1Done}
            className={`flex-1 py-3 text-xs md:text-sm uppercase tracking-wider cartoon-btn-tab ${
              !level1Done ? "opacity-35 cursor-not-allowed bg-zinc-100" :
              phase === "simulate" ? "active-tab text-white" : "bg-[#09090b] text-zinc-800"
            }`}
          >
             L2: Cookie Safe Sim
          </button>

          <button
            onClick={() => { if (level1Done && level2Done) { setPhase("quiz"); playPop(); } }}
            disabled={!level1Done || !level2Done}
            className={`flex-1 py-3 text-xs md:text-sm uppercase tracking-wider cartoon-btn-tab ${
              (!level1Done || !level2Done) ? "opacity-35 cursor-not-allowed bg-zinc-100" :
              phase === "quiz" ? "active-tab text-white" : "bg-[#09090b] text-zinc-800"
            }`}
          >
             L3: Agent Quiz
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ── PHASE 1: EXPLORE PAINT MIXING ── */}
          {phase === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                
                {/* Control Panel Left */}
                <div className="lg:col-span-4 cartoon-panel p-4 flex flex-col justify-between min-h-0">
                  <div className="flex flex-col gap-3 flex-1">
                    <span className="text-xs font-black uppercase text-pink-600 tracking-wider">Paint Machine Controller</span>
                    
                    <div className="flex flex-col gap-2.5 my-auto">
                      {/* Step 1 */}
                      <button
                        onClick={l1AddPublicBase}
                        disabled={l1Step !== "idle"}
                        className={`w-full py-3.5 cartoon-btn-action uppercase text-xs flex items-center justify-center gap-2 ${
                          l1Step === "idle" 
                            ? "bg-yellow-300 text-zinc-900 hover:bg-yellow-200" 
                            : "bg-zinc-200 text-zinc-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <PaintBucket size={16} /> 1. Dispense Lemon Base (Public)
                      </button>

                      {/* Step 2 */}
                      <button
                        onClick={l1MixPrivate}
                        disabled={l1Step !== "public_added"}
                        className={`w-full py-3.5 cartoon-btn-action uppercase text-xs flex items-center justify-center gap-2 ${
                          l1Step === "public_added" 
                            ? "bg-orange-400 text-zinc-900 hover:bg-orange-300" 
                            : "bg-zinc-200 text-zinc-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <Flame size={16} /> 2. Mix in Private Jams!
                      </button>

                      {/* Step 3 */}
                      <button
                        onClick={l1FlingPaint}
                        disabled={l1Step !== "private_mixed"}
                        className={`w-full py-3.5 cartoon-btn-action uppercase text-xs flex items-center justify-center gap-2 ${
                          l1Step === "private_mixed" 
                            ? "bg-blue-400 text-zinc-900 hover:bg-blue-300" 
                            : "bg-zinc-200 text-zinc-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <Zap size={16} /> 3. Fling Jars Over Network
                      </button>

                      {/* Step 4 */}
                      <button
                        onClick={l1CreateSharedPotion}
                        disabled={l1Step !== "flung"}
                        className={`w-full py-3.5 cartoon-btn-action uppercase text-xs flex items-center justify-center gap-2 ${
                          l1Step === "flung" 
                            ? "bg-violet-600 text-zinc-900 hover:bg-purple-400 animate-bounce" 
                            : "bg-zinc-200 text-zinc-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <Key size={16} /> 4. Create Magical Purple Key!
                      </button>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={resetL1}
                      className="w-full py-2 border-2 border-black rounded-xl hover:bg-zinc-100 text-xs font-black flex items-center justify-center gap-1 mt-2 bg-[#09090b]"
                    >
                      <RotateCcw size={12} /> Reset Blender
                    </button>
                  </div>

                  {/* Level 1 Done transition banner */}
                  {level1Done && (
                    <button
                      onClick={() => { setPhase("simulate"); playPop(); }}
                      className="w-full py-3 mt-3 bg-emerald-600 hover:bg-green-400 text-white text-xs font-black uppercase cartoon-btn-action flex items-center justify-center gap-2"
                    >
                      Unlocks Level 2: Simulate! <ArrowRight size={14} />
                    </button>
                  )}

                  {/* Cartoon Helper bot instructions */}
                  <div className="mt-4 shrink-0">
                    <HelperBot 
                      face={l1Step === "shared_potion" ? "‿" : l1Step === "flung" ? "SURPRISED" : "NEUTRAL"}
                      text={
                        l1Step === "idle" ? "Alice and Bob need a shared secret key. Let's start by dispensing the Lemon Base (Public) paint!" :
                        l1Step === "public_added" ? "Now, Alice adds Red Cherry Sauce, and Bob adds Blueberry Jam! Click 'Mix in Private Jams'!" :
                        l1Step === "private_mixed" ? "Each got a custom mix! Let's swap these mixes over the network so they can merge them!" :
                        l1Step === "flung" ? "Eve intercepted the mixes, but she can't separate them! Now mix your private jam into the received jar to make the Magical Purple Secret!" :
                        "Tada! Both got the exact same Purple Potion! Eve is left clueless. You unlocked Level 2!"
                      } 
                    />
                  </div>
                </div>

                {/* Animation/Interactive Display Right */}
                <div className="lg:col-span-8 cartoon-panel p-4 flex flex-col justify-between min-h-0 relative overflow-hidden bg-sky-200/50">
                  
                  {/* Sky background / grid */}
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-sky-300/40 pointer-events-none" />
                  
                  <div className="relative z-10 w-full h-full flex flex-col min-h-0 justify-between gap-2">
                    
                    {/* Public Lemon spot at top */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="w-16 h-16 bg-yellow-300 border-2 border-black rounded-full flex items-center justify-center shadow-none relative">
                        <span className="text-xl font-bold"></span>
                        <div className="absolute -bottom-6 bg-amber-900/40 border-2 border-black px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                          Public Yellow
                        </div>
                      </div>
                    </div>

                    {/* Left/Middle/Right Cartoon Areas */}
                    <div className="flex-1 flex items-center justify-between px-4 min-h-[220px]">
                      
                      {/* Alice's Candy Cottage */}
                      <div className="flex flex-col items-center gap-2 w-1/4">
                        <div className="relative w-28 h-32 bg-pink-100 border-2 border-black rounded-2xl shadow-none flex flex-col items-center justify-between p-2">
                          <span className="text-[10px] font-black text-pink-700 bg-pink-200 border-2 border-black px-1.5 py-0.5 rounded-lg uppercase">
                            Alice's Lab
                          </span>
                          
                          {/* Blender/Beaker bowl */}
                          <div className="w-16 h-16 border-2 border-black rounded-b-2xl bg-[#09090b] relative flex flex-col-reverse overflow-hidden shadow-inner mt-2">
                            <motion.div 
                              animate={{ height: aliceBowl !== "#f1f5f9" ? "100%" : "0%" }}
                              style={{ backgroundColor: aliceBowl }}
                              className="w-full transition-colors duration-500" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-zinc-800 mix-blend-difference">
                              {l1Step === "idle" ? "EMPTY" : l1Step === "public_added" ? "YELLOW" : l1Step === "private_mixed" ? "ORANGE" : l1Step === "flung" ? "ORANGE" : "PURPLE"}
                            </div>
                          </div>

                          <span className="text-[10px] font-black text-zinc-600 mt-1 uppercase">Cherry Red </span>
                        </div>
                      </div>

                      {/* Eve the Sneaky Badger Treehouse */}
                      <div className="flex flex-col items-center gap-2 w-1/3 relative">
                        {/* Eve Badger representation */}
                        <div className="w-32 h-36 bg-amber-800/80 border-2 border-black rounded-t-3xl rounded-b-xl flex flex-col items-center justify-between p-2">
                          <span className="text-[9px] font-black text-white bg-rose-700 border-2 border-black px-1 py-0.5 rounded uppercase tracking-wider">
                            Eve's Spy Tree
                          </span>
                          
                          {/* Badger Face */}
                          <div className="w-14 h-14 bg-zinc-700 border-2 border-black rounded-full flex flex-col items-center justify-center p-1 relative overflow-hidden">
                            <div className="w-full h-4 bg-black absolute top-3" />
                            <div className="flex gap-2.5 z-10">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#09090b] flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-black"></span></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-[#09090b] flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-black"></span></span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-100 z-10 mt-1 leading-none"></span>
                          </div>

                          {/* Eve's Intercepted Jar */}
                          <div className="flex gap-1.5 justify-center">
                            <div className="w-7 h-8 border-2 border-black bg-[#09090b] rounded-b-lg relative overflow-hidden">
                              {eveInterceptions.left && (
                                <div style={{ backgroundColor: eveInterceptions.left }} className="absolute inset-0" />
                              )}
                            </div>
                            <div className="w-7 h-8 border-2 border-black bg-[#09090b] rounded-b-lg relative overflow-hidden">
                              {eveInterceptions.right && (
                                <div style={{ backgroundColor: eveInterceptions.right }} className="absolute inset-0" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Speech Bubble */}
                        <div className="absolute -top-14 w-44 bg-[#09090b] border-2 border-black p-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-[9px] font-bold text-zinc-800 text-center leading-tight">
                          {eveMessage}
                          <div className="w-2.5 h-2.5 bg-[#09090b] border-r-2 border-b-2 border-black rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                        </div>
                      </div>

                      {/* Bob's Balloon Castle */}
                      <div className="flex flex-col items-center gap-2 w-1/4">
                        <div className="relative w-28 h-32 bg-amber-900/40 border-2 border-black rounded-2xl shadow-none flex flex-col items-center justify-between p-2">
                          <span className="text-[10px] font-black text-blue-700 bg-blue-200 border-2 border-black px-1.5 py-0.5 rounded-lg uppercase">
                            Bob's Lab
                          </span>

                          {/* Blender/Beaker bowl */}
                          <div className="w-16 h-16 border-2 border-black rounded-b-2xl bg-[#09090b] relative flex flex-col-reverse overflow-hidden shadow-inner mt-2">
                            <motion.div 
                              animate={{ height: bobBowl !== "#f1f5f9" ? "100%" : "0%" }}
                              style={{ backgroundColor: bobBowl }}
                              className="w-full transition-colors duration-500" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-zinc-800 mix-blend-difference">
                              {l1Step === "idle" ? "EMPTY" : l1Step === "public_added" ? "YELLOW" : l1Step === "private_mixed" ? "GREEN" : l1Step === "flung" ? "GREEN" : "PURPLE"}
                            </div>
                          </div>

                          <span className="text-[10px] font-black text-zinc-600 mt-1 uppercase">Blueberry Jam 🫐</span>
                        </div>
                      </div>

                    </div>

                    {/* Flying paint animation blobs */}
                    <AnimatePresence>
                      {l1Step === "flung" && !eveInterceptions.left && (
                        <>
                          {/* Alice's Orange mix flying to Bob */}
                          <motion.div
                            initial={{ x: 120, y: -160, scale: 1 }}
                            animate={{ x: [120, 350, 580], y: [-160, -220, -160] }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-8 h-8 rounded-full border-4 border-black absolute z-30 flex items-center justify-center bg-orange-400 font-bold text-xs"
                          >
                            
                          </motion.div>
                          {/* Bob's Green mix flying to Alice */}
                          <motion.div
                            initial={{ x: 580, y: -160, scale: 1 }}
                            animate={{ x: [580, 350, 120], y: [-160, -220, -160] }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-8 h-8 rounded-full border-4 border-black absolute z-30 flex items-center justify-center bg-emerald-600 font-bold text-xs"
                          >
                            
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>

                    {/* Connection cables */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {/* Dotted paths */}
                      <path d="M 170,120 L 170,200" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" />
                      <path d="M 530,120 L 530,200" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" />
                      <path d="M 230,300 L 470,300" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="8 4" />
                    </svg>

                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* ── PHASE 2: COOKIE SAFE SIMULATOR ── */}
          {phase === "simulate" && (
            <motion.div
              key="simulate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                
                {/* Control Panel Left */}
                <div className="lg:col-span-5 cartoon-panel p-4 flex flex-col justify-between min-h-0">
                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    <span className="text-xs font-black uppercase text-pink-600 tracking-wider">Cookie Recipe Encryption Unit</span>

                    {/* Input message box */}
                    <div className="border-4 border-black bg-[#09090b] p-3.5 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">1. Write your Secret Message:</label>
                      <input 
                        type="text"
                        placeholder="Type something secret..."
                        value={customMsg}
                        onChange={(e) => { setCustomMsg(e.target.value); }}
                        className="w-full p-2 border-2 border-black rounded-lg text-xs font-black outline-none bg-zinc-50 focus:bg-[#09090b]"
                        maxLength={24}
                      />
                      
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {PRESET_MESSAGES.map((msg) => (
                          <button
                            key={msg}
                            onClick={() => { setCustomMsg(""); setSelectedPresetMsg(msg); playPop(); }}
                            className={`px-2 py-1 border-2 border-black rounded-lg text-[9px] font-black ${
                              (customMsg === "" && selectedPresetMsg === msg) 
                                ? "bg-pink-400 text-white" 
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                            }`}
                          >
                            {msg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Key Strength Selector */}
                    <div className="border-4 border-black bg-[#09090b] p-3.5 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col gap-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">2. Select Key Lock Strength:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => { setKeyStrength("128"); playPop(); }}
                          className={`p-2 border-2 border-black rounded-xl text-center text-[10px] font-black flex flex-col items-center gap-0.5 ${
                            keyStrength === "128" ? "bg-amber-300" : "bg-zinc-50 hover:bg-zinc-100"
                          }`}
                        >
                          <span>128-bit</span>
                          <span className="text-[8px] text-zinc-500 uppercase">Baby Dino </span>
                        </button>
                        <button
                          onClick={() => { setKeyStrength("192"); playPop(); }}
                          className={`p-2 border-2 border-black rounded-xl text-center text-[10px] font-black flex flex-col items-center gap-0.5 ${
                            keyStrength === "192" ? "bg-orange-300" : "bg-zinc-50 hover:bg-zinc-100"
                          }`}
                        >
                          <span>192-bit</span>
                          <span className="text-[8px] text-zinc-500 uppercase">Papa Bear </span>
                        </button>
                        <button
                          onClick={() => { setKeyStrength("256"); playPop(); }}
                          className={`p-2 border-2 border-black rounded-xl text-center text-[10px] font-black flex flex-col items-center gap-0.5 ${
                            keyStrength === "256" ? "bg-red-300" : "bg-zinc-50 hover:bg-zinc-100"
                          }`}
                        >
                          <span>256-bit</span>
                          <span className="text-[8px] text-zinc-500 uppercase">T-Rex </span>
                        </button>
                      </div>
                    </div>

                    {/* Encrypt Button */}
                    <button
                      onClick={runEncryption}
                      disabled={isEncrypting}
                      className="w-full py-4 bg-violet-600 hover:bg-purple-400 text-white font-black uppercase text-xs cartoon-btn-action flex items-center justify-center gap-2"
                    >
                      <Lock size={16} /> {isEncrypting ? "Crunching & Locking..." : "Encrypt & Lock Recipe!"}
                    </button>

                  </div>

                  {/* Level 2 Done transition banner */}
                  {level2Done && (
                    <button
                      onClick={() => { setPhase("quiz"); playPop(); }}
                      className="w-full py-3 mt-3 bg-emerald-600 hover:bg-green-400 text-white text-xs font-black uppercase cartoon-btn-action flex items-center justify-center gap-2"
                    >
                      Unlocks Level 3: Final Quiz! <ArrowRight size={14} />
                    </button>
                  )}

                  {/* Cartoon Helper bot instructions */}
                  <div className="mt-4 shrink-0">
                    <HelperBot 
                      face={safeState === "opened" ? "‿" : safeState === "wrong" ? "_" : "NEUTRAL"}
                      text={
                        isEncrypting ? "Nom nom nom! The encryption monster is scrambling your message into hard-to-crack gibberish!" :
                        safeState === "opened" ? "Hurrah! The purple potion key matched, and the cookie safe popped open!" :
                        safeState === "wrong" ? "Whoops! The monkey key didn't work. Eve cannot guess the key either. Try the Purple Potion key!" :
                        encryptedMsg ? "Message Encrypted! Try choosing a key at the right to unlock the Cookie Safe!" :
                        "Write a message, choose a strength level (more bits = more safety!), and encrypt it!"
                      } 
                    />
                  </div>
                </div>

                {/* Encryption/Safe Simulator Display Right */}
                <div className="lg:col-span-7 cartoon-panel p-4 flex flex-col gap-4 min-h-0 relative overflow-hidden bg-orange-100/50 justify-between">
                  
                  {/* Encrypted Message Display screen */}
                  <div className="cartoon-screen p-4 flex-1 flex flex-col justify-around text-center gap-3">
                    <div className="border-b-2 border-black/10 pb-2">
                      <span className="text-[10px] font-black text-zinc-400 uppercase">Input Message:</span>
                      <p className="text-base font-black text-zinc-800 mt-1">"{customMsg.trim() || selectedPresetMsg}"</p>
                    </div>

                    <div className="py-4 flex flex-col items-center justify-center gap-2">
                      {isEncrypting ? (
                        <div className="flex flex-col items-center gap-2 animate-pulse">
                          <Cookie size={40} className="text-amber-600 animate-spin" />
                          <span className="text-xs font-black text-purple-700 uppercase">SCRAMBLING BITS...</span>
                        </div>
                      ) : encryptedMsg ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-black text-rose-400 bg-rose-900/40 border-2 border-rose-500/50 px-2 py-0.5 rounded-lg uppercase">
                            Locked Ciphertext:
                          </span>
                          <p className="text-2xl font-black font-mono tracking-widest text-zinc-900 border-4 border-black border-dashed bg-[#09090b] p-3 rounded-2xl shadow-inner max-w-sm">
                            {encryptedMsg}
                          </p>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                            Lock Strength: {keyStrength === "128" ? "128-bit (Baby)" : keyStrength === "192" ? "192-bit (Papa)" : "256-bit (T-Rex)"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Recipe not encrypted yet. Click the button on the left!</span>
                      )}
                    </div>

                    {decryptedMsg && (
                      <div className="border-t-2 border-black/10 pt-2 bg-emerald-950/30/50 p-2.5 rounded-xl border border-emerald-500/50/20">
                        <span className="text-[10px] font-black text-emerald-400 uppercase">Decrypted Result:</span>
                        <p className="text-base font-black text-green-700 mt-1">" {decryptedMsg} "</p>
                      </div>
                    )}
                  </div>

                  {/* Interactive Cookie Safe Decrypter */}
                  {encryptedMsg && (
                    <div className="border-4 border-black bg-[#09090b] p-3.5 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col gap-3">
                      <span className="text-[10px] font-black text-zinc-500 uppercase text-center block">
                        3. Choose a key to open the cookie safe:
                      </span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* Banana Key (Wrong key) */}
                        <button
                          onClick={() => tryDecrypt("banana")}
                          className={`p-3 border-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                            triedKey === "banana" 
                              ? "border-rose-500/50 bg-rose-950/30 shadow-[2px_2px_0px_#000]" 
                              : "border-black hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0.5 bg-amber-950/30 active:shadow-[1px_1px_0px_#000]"
                          }`}
                        >
                          <span className="text-3xl"></span>
                          <span className="text-xs font-black uppercase text-amber-700">Banana Key</span>
                          <span className="text-[8px] font-bold text-zinc-400">Incorrect Symmetric Key</span>
                        </button>

                        {/* Purple Secret Key (Correct Key) */}
                        <button
                          onClick={() => tryDecrypt("purple")}
                          className={`p-3 border-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                            triedKey === "purple" && safeState === "opened"
                              ? "border-emerald-500/50 bg-emerald-950/30 shadow-[2px_2px_0px_#000] animate-pulse" 
                              : "border-black hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0.5 bg-violet-950/30 active:shadow-[1px_1px_0px_#000]"
                          }`}
                        >
                          <span className="text-3xl"></span>
                          <span className="text-xs font-black uppercase text-purple-700">Purple Potion Key</span>
                          <span className="text-[8px] font-bold text-zinc-400">Shared Symmetric Key</span>
                        </button>

                      </div>

                      {/* Monkey Pop up / Cookie Safe result illustration */}
                      <AnimatePresence>
                        {triedKey === "banana" && (
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-rose-900/40 border-2 border-rose-500/50 p-2.5 rounded-xl text-center text-xs font-black text-rose-400 flex items-center justify-center gap-2"
                          >
                            <span></span>
                            <span>Bzzzt! Wrong Key! A cheeky monkey stole your banana instead! Safe remains locked.</span>
                          </motion.div>
                        )}
                        {safeState === "opened" && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-emerald-900/40 border-2 border-emerald-500/50 p-2.5 rounded-xl text-center text-xs font-black text-green-700 flex items-center justify-center gap-2"
                          >
                            <span></span>
                            <span>Bingo! The Purple Potion matches! Safe popped open! Cookies are saved!</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* ── PHASE 3: SECRET AGENT ACADEMY QUIZ ── */}
          {phase === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                
                {/* Score panel Left */}
                <div className="lg:col-span-4 cartoon-panel p-4 flex flex-col justify-between min-h-0">
                  <div className="flex flex-col gap-3 flex-1">
                    <span className="text-xs font-black uppercase text-pink-600 tracking-wider">Academy Grade Book</span>

                    <div className="border-4 border-black bg-[#09090b] p-4 rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col gap-2 my-auto">
                      <span className="text-[10px] font-black text-zinc-400 uppercase">Quiz Progression:</span>
                      
                      <div className="flex justify-between items-center text-sm font-black text-zinc-800">
                        <span>Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}</span>
                        <span className="text-pink-600 bg-pink-50 border-2 border-pink-500 px-2 py-0.5 rounded-lg text-xs">
                          {Math.round(((quizIdx) / QUIZ_QUESTIONS.length) * 100)}% Done
                        </span>
                      </div>

                      {/* Process dots */}
                      <div className="flex gap-2.5 mt-2">
                        {QUIZ_QUESTIONS.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`flex-1 h-3 border-2 border-black rounded-full ${
                              idx < quizIdx ? "bg-emerald-600" :
                              idx === quizIdx ? "bg-yellow-400 animate-pulse" : "bg-zinc-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Hint card */}
                    <div className="mt-3">
                      <button
                        onClick={() => { setShowHint(!showHint); playClick(); }}
                        className="text-xs font-black text-purple-700 bg-violet-900/40 hover:bg-purple-200 border-2 border-black py-1.5 px-3 rounded-xl flex items-center justify-center gap-1 w-full"
                      >
                        <HelpCircle size={14} /> {showHint ? "Hide Agent Hint" : "Reveal Agent Hint"}
                      </button>
                      <AnimatePresence>
                        {showHint && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#09090b] border-2 border-black p-3 rounded-xl text-xs font-bold text-zinc-600 leading-normal mt-2 shadow-sm"
                          >
                            {QUIZ_QUESTIONS[quizIdx].hint}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  {/* Bot feedback */}
                  <div className="mt-4 shrink-0">
                    <HelperBot 
                      face={quizFeedback === "correct" ? "‿" : quizFeedback === "wrong" ? "_" : "NEUTRAL"}
                      text={
                        quizFeedback === "correct" ? "Spot on! That's correct! Click next to proceed." :
                        quizFeedback === "wrong" ? "Ouch! That answer bounced off. Check the hint and try again!" :
                        "Pop the bubble containing the correct option to prove you understand Symmetric Crypto!"
                      } 
                    />
                  </div>
                </div>

                {/* Question bubble panel Right */}
                <div className="lg:col-span-8 cartoon-panel p-4 flex flex-col justify-between min-h-0 relative overflow-hidden bg-violet-900/40/50">
                  
                  <div className="flex-1 flex flex-col justify-between py-2 text-center gap-4">
                    
                    {/* The Question Text */}
                    <div className="border-b-4 border-black/10 pb-4 w-full">
                      <span className="text-[10px] font-black text-violet-400 uppercase">Question #{quizIdx + 1}</span>
                      <h3 className="text-lg md:text-xl font-black text-zinc-800 leading-snug mt-1.5 max-w-xl mx-auto">
                        "{QUIZ_QUESTIONS[quizIdx].question}"
                      </h3>
                    </div>

                    {/* Option bubble buttons */}
                    <div className="flex-grow flex flex-col justify-center gap-3.5 max-w-lg mx-auto w-full my-2">
                      {QUIZ_QUESTIONS[quizIdx].options.map((opt, idx) => {
                        const isSelected = quizSelectedOpt === idx;
                        const isCorrect = opt.isCorrect;
                        
                        let borderStyle = "border-black bg-[#09090b] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-y-0.5";
                        if (isSelected) {
                          borderStyle = isCorrect 
                            ? "border-green-600 bg-emerald-900/40 text-green-800 shadow-[2px_2px_0px_#000] translate-y-0.5"
                            : "border-red-600 bg-rose-900/40 text-red-800 shadow-[2px_2px_0px_#000] translate-y-0.5 animate-shake";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizFeedback === "correct"}
                            onClick={() => handleQuizAnswer(idx, isCorrect)}
                            className={`w-full p-4 border-4 rounded-2xl text-left text-xs md:text-sm font-black transition-all flex items-center gap-3 shadow-[3px_3px_0px_#000] ${borderStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 text-xs font-black ${
                              isSelected 
                                ? isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white" 
                                : "bg-zinc-100 text-zinc-600"
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom controls / next buttons */}
                    <div className="min-h-[50px] flex items-center justify-center shrink-0">
                      {quizFeedback === "correct" ? (
                        <button
                          onClick={nextQuizQuestion}
                          className="py-3 px-8 bg-emerald-600 hover:bg-green-400 text-white font-black uppercase text-xs cartoon-btn-action flex items-center justify-center gap-2 animate-bounce"
                        >
                          {quizIdx + 1 === QUIZ_QUESTIONS.length ? "Finish Lab & Celebrate!" : "Next Question!"} <ArrowRight size={14} />
                        </button>
                      ) : quizFeedback === "wrong" ? (
                        <p className="text-rose-400 text-xs font-black uppercase animate-pulse">
                           Try another choice! Click the hint button if you need help.
                        </p>
                      ) : (
                        <p className="text-zinc-400 text-xs font-bold italic">
                          Tap on the bubble with the right answer.
                        </p>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </LabShell>
  );
}
