"use client";
import { useEffect, useRef, useCallback } from 'react';

let _sharedCtx: AudioContext | null = null;
let _hasInteracted = false;

if (typeof window !== 'undefined') {
    const markInteracted = () => { _hasInteracted = true; };
    window.addEventListener('click', markInteracted, { once: true });
    window.addEventListener('pointerdown', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
}

const getCtx = (): AudioContext | null => { 
    if (typeof window === 'undefined' || !_hasInteracted) return null; 
    try { 
        if (!_sharedCtx || _sharedCtx.state === 'closed') { 
            _sharedCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); 
        } 
        if (_sharedCtx.state === 'suspended') _sharedCtx.resume(); 
        return _sharedCtx; 
    } catch { return null; } 
};
const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0) => { const ctx = getCtx(); if (!ctx) return; setTimeout(() => { try { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime); gain.gain.setValueAtTime(0.12, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration); } catch { /* */ } }, delay); };
let _cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { const load = () => { _cachedVoices = window.speechSynthesis.getVoices(); }; load(); window.speechSynthesis.addEventListener('voiceschanged', load); }
export function useLabAudio() {
  const isSpeakingRef = useRef(false);
  const lastPlayedRef = useRef<Record<string, number>>({});

  const withThrottle = (key: string, fn: () => void, cooldownMs = 100) => {
      const now = Date.now();
      if (now - (lastPlayedRef.current[key] || 0) < cooldownMs) return;
      lastPlayedRef.current[key] = now;
      fn();
  };

  const playClick   = useCallback(() => withThrottle('click', () => playTone(660,'sine',0.08)), []);
  const playPop     = useCallback(() => withThrottle('pop', () => playTone(880,'sine',0.1)), []);
  const playSuccess = useCallback(() => withThrottle('success', () => { playTone(523.25,'sine',0.15); playTone(659.25,'sine',0.15,120); playTone(783.99,'sine',0.15,240); playTone(1046.5,'sine',0.4,360); }, 1000), []);
  const playError   = useCallback(() => withThrottle('error', () => playTone(180,'sawtooth',0.3), 300), []);
  const playZap     = useCallback(() => withThrottle('zap', () => playTone(440,'square',0.12)), []);
  const playDrop    = useCallback(() => withThrottle('drop', () => playTone(300,'sine',0.15)), []);
  const playChime   = useCallback(() => withThrottle('chime', () => { playTone(1046.5,'sine',0.2); playTone(1318.5,'sine',0.2,150); }, 500), []);

  // Mechanical Sounds
  const playHeavyThud = useCallback(() => withThrottle('thud', () => {
    const ctx = getCtx(); if (!ctx) return;
    setTimeout(() => { try { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(150, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3); gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3); } catch { /* */ } }, 0);
  }, 300), []);
  
  const playPneumaticHiss = useCallback(() => withThrottle('hiss', () => {
    const ctx = getCtx(); if (!ctx) return;
    setTimeout(() => { try { const duration = 0.5; const bufferSize = ctx.sampleRate * duration; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate); const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1; const noise = ctx.createBufferSource(); noise.buffer = buffer; const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1000; const gain = ctx.createGain(); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration); noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination); noise.start(); } catch { /* */ } }, 0);
  }, 500), []);
  
  const playGearGrind = useCallback(() => withThrottle('grind', () => {
    const ctx = getCtx(); if (!ctx) return;
    setTimeout(() => { try { const osc = ctx.createOscillator(); const mod = ctx.createOscillator(); const modGain = ctx.createGain(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime); mod.type = 'square'; mod.frequency.setValueAtTime(20, ctx.currentTime); modGain.gain.value = 50; mod.connect(modGain); modGain.connect(osc.frequency); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8); osc.connect(gain); gain.connect(ctx.destination); osc.start(); mod.start(); osc.stop(ctx.currentTime + 0.8); mod.stop(ctx.currentTime + 0.8); } catch { /* */ } }, 0);
  }, 800), []);
  const speakInstructions = useCallback((text: string) => { if (!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate=0.9; u.pitch=1.2; const v = _cachedVoices.find(v => v.lang.includes('en') && (v.name.includes('Female')||v.name.includes('Samantha')||v.name.includes('Google'))); if (v) u.voice=v; isSpeakingRef.current=true; u.onend=()=>{isSpeakingRef.current=false;}; window.speechSynthesis.speak(u); }, []);
  const stopSpeaking = useCallback(() => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); isSpeakingRef.current=false; } }, []);
  useEffect(() => { const r=()=>getCtx(); document.addEventListener('click',r,{once:true}); document.addEventListener('touchstart',r,{once:true}); return ()=>{stopSpeaking();}; }, [stopSpeaking]);
  return { playClick, playPop, playSuccess, playError, playZap, playDrop, playChime, playHeavyThud, playPneumaticHiss, playGearGrind, speakInstructions, stopSpeaking };
}

