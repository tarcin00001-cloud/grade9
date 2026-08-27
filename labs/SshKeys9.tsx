"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Terminal, ShieldAlert, Key, Unlock, HardDriveDownload, CloudUpload } from "lucide-react";

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SshKeys9() {
  const { reportComplete } = useLMSBridge("sshkeys9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"PASSWORD" | "SSH_KEY">("PASSWORD");
  
  // Game States
  const [hasKeys, setHasKeys] = useState(false);
  const [keysUploaded, setKeysUploaded] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  // Terminal Logs
  const [userLogs, setUserLogs] = useState<string[]>(["$ system ready."]);
  const [hackerLogs, setHackerLogs] = useState<string[]>(["[WIRETAP] Sniffing port 22..."]);

  // Auto-scroll terminals
  const userEndRef = useRef<HTMLDivElement>(null);
  const hackerEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { userEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [userLogs]);
  useEffect(() => { hackerEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [hackerLogs]);

  const addLog = (term: "user" | "hacker", msg: string) => {
     if (term === "user") setUserLogs(prev => [...prev, msg]);
     else setHackerLogs(prev => [...prev, msg]);
  };

  const attemptPasswordAuth = () => {
    playPop();
    addLog("user", "$ ssh alice@server -p password");
    
    setTimeout(() => {
       playError();
       addLog("hacker", "[ALERT] Cleartext intercepted!");
       addLog("hacker", "--> User: alice");
       addLog("hacker", "--> Pass: hunter2");
       addLog("user", "Login successful (but insecure).");
    }, 800);
  };

  const generateKeys = () => {
    playZap();
    addLog("user", "$ ssh-keygen -t rsa -b 4096");
    
    setTimeout(() => {
       playPop();
       addLog("user", "Generating public/private rsa key pair.");
       addLog("user", "Your identification has been saved in ~/.ssh/id_rsa");
       addLog("user", "Your public key has been saved in ~/.ssh/id_rsa.pub");
       setHasKeys(true);
    }, 800);
  };

  const uploadKeys = () => {
    playZap();
    addLog("user", "$ ssh-copy-id alice@server");
    
    setTimeout(() => {
       playPop();
       addLog("user", "Number of key(s) added: 1");
       addLog("user", "Now try logging into the machine, with:   'ssh alice@server'");
       addLog("hacker", "[WIRETAP] Intercepted 1 file: id_rsa.pub");
       addLog("hacker", "[NOTE] It's a public key... useless without the private key.");
       setKeysUploaded(true);
    }, 1000);
  };

  const attemptSshAuth = () => {
    playPop();
    addLog("user", "$ ssh alice@server");
    
    setTimeout(() => {
       playPop();
       addLog("user", "Authenticating with public key \"alice@laptop\"...");
       addLog("hacker", "[WIRETAP] Intercepted payload!");
       addLog("hacker", "--> Data: 0x9f8b4c2a1e7d...");
       
       setTimeout(() => {
          playSuccess();
          addLog("user", "Welcome to Ubuntu 22.04 LTS!");
          addLog("user", "Access Granted securely.");
          addLog("hacker", "[ERROR] Payload is cryptographically signed. Cannot decode.");
          
          if (!hasWon) {
             setHasWon(true);
             setTimeout(reportComplete, 1500);
          }
       }, 1000);
    }, 800);
  };

  const reset = () => {
    setMode("PASSWORD");
    setHasKeys(false);
    setKeysUploaded(false);
    setUserLogs(["$ system ready."]);
    setHackerLogs(["[WIRETAP] Sniffing port 22..."]);
    setHasWon(false);
  };

  return (
    <LabShell labId="sshkeys9" theme="forge" title="SSH Key Cryptography"
      onReset={reset}
      instruction="1. Understand the role of SSH keys in secure remote access. 2. Generate an SSH key pair and configure the public key on the simulated server. 3. Initiate a secure SSH connection using your private key. 4. Troubleshoot common connection errors caused by incorrect key permissions." compact>
      
      <Celebration isActive={hasWon} message="Access Granted! Because you never sent your Private Key across the wire, there was nothing for the Hacker to steal. If they intercept the signed cryptographic payload, it's completely useless to them. This is why servers mandate SSH Keys." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white rounded-2xl border-orange-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-4">
          
          <button 
            onClick={() => { setMode("PASSWORD"); playPop(); }}
            className={`px-6 py-3 rounded-xl font-black text-xs md:text-sm transition-all border-2 w-full md:w-auto ${mode === "PASSWORD" ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-neutral-800 border-neutral-700 text-neutral-400"}`}
          >
            Mode: Password Auth
          </button>
          
          <button 
            onClick={() => { setMode("SSH_KEY"); playZap(); }}
            className={`px-6 py-3 rounded-xl font-black text-xs md:text-sm transition-all border-2 w-full md:w-auto ${mode === "SSH_KEY" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-neutral-800 border-neutral-700 text-neutral-400"}`}
          >
            Mode: SSH Key Auth
          </button>

        </div>

        {/* Dual Terminal Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
           
           {/* User Terminal */}
           <div className="flex flex-col border-2 border-emerald-200 rounded-3xl overflow-hidden bg-white shadow-xl min-h-0">
              <div className="bg-emerald-50 border-b border-emerald-200 p-3 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
                    <Terminal size={14} /> User Laptop
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-emerald-700">
                 {userLogs.map((log, i) => (
                    <div key={i} className={log.startsWith("$") ? "text-emerald-800 font-bold mt-2" : "pl-4"}>
                       {log}
                    </div>
                 ))}
                 <div ref={userEndRef} />
              </div>

              {/* Action Buttons */}
              <div className="bg-emerald-50 p-3 flex gap-2 overflow-x-auto">
                 {mode === "PASSWORD" ? (
                    <button onClick={attemptPasswordAuth} className="px-4 py-2 bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-black whitespace-nowrap hover:bg-rose-200">
                       $ ssh alice@server
                    </button>
                 ) : (
                    <>
                       <button onClick={generateKeys} disabled={hasKeys} className="px-4 py-2 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-black whitespace-nowrap hover:bg-emerald-200 disabled:opacity-30 flex items-center gap-2">
                          <Key size={14}/> 1. ssh-keygen
                       </button>
                       <button onClick={uploadKeys} disabled={!hasKeys || keysUploaded} className="px-4 py-2 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-black whitespace-nowrap hover:bg-emerald-200 disabled:opacity-30 flex items-center gap-2">
                          <CloudUpload size={14}/> 2. ssh-copy-id
                       </button>
                       <button onClick={attemptSshAuth} disabled={!keysUploaded} className="px-4 py-2 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-black whitespace-nowrap hover:bg-emerald-200 disabled:opacity-30 flex items-center gap-2">
                          <Unlock size={14}/> 3. ssh alice@server
                       </button>
                    </>
                 )}
              </div>
           </div>

           {/* Hacker Terminal */}
           <div className="flex flex-col border-2 border-rose-200 rounded-3xl overflow-hidden bg-white shadow-xl min-h-0">
              <div className="bg-rose-50 border-b border-rose-200 p-3 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase">
                    <ShieldAlert size={14} /> Man-in-the-Middle Wireshark
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-rose-700">
                 {hackerLogs.map((log, i) => (
                    <div key={i} className={log.includes("Cleartext") || log.includes("hunter2") ? "text-rose-800 font-bold bg-rose-100 p-1" : "pl-2"}>
                       {log}
                    </div>
                 ))}
                 <div ref={hackerEndRef} />
              </div>
           </div>

        </div>

      </div>
    </LabShell>
  );
}
