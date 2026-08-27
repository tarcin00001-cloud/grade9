"use client";
import { useCallback, useEffect, useRef, useState } from "react";
type LMSInitData = { userId?: string; studentName?: string; grade?: number; levelValue?: number; mode?: string; attemptId?: string; sessionId?: string; labId?: string; [key: string]: unknown; };
type LMSMessage = { type?: string; data?: LMSInitData; [key: string]: unknown } | LMSInitData;
type ReportCompleteArgs = { labId?: string; points?: number; timeTaken?: number; extraData?: Record<string, unknown>; };
const DEFAULT_POINTS = 100; const GRADE = 9;
export function useLMSBridge(defaultLabId?: string) {
  const [lmsData, setLmsData] = useState<LMSInitData>({}); const startTimeRef = useRef(Date.now()); const reportedLabsRef = useRef<Set<string>>(new Set()); const [hasParentFrame, setHasParentFrame] = useState(false);
  const getTimeTaken = useCallback(() => Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)), []);
  useEffect(() => {
    if (typeof window === "undefined") return; const isEmbedded = window.parent !== window; setHasParentFrame(isEmbedded);
    const handleMessage = (event: MessageEvent<LMSMessage>) => { const message = event.data; if (!message || typeof message !== "object") return; if ("type" in message && message.type === "lmsInit") { setLmsData(prev => ({ ...prev, ...(message.data ?? {}) })); return; } if ("type" in message && message.type === "lmsContext" && "data" in message && message.data) { setLmsData(prev => ({ ...prev, ...(message.data ?? {}) })); return; } if (!("type" in message)) { const hasKnownKeys = "userId" in message || "studentName" in message || "grade" in message || "levelValue" in message || "mode" in message || "attemptId" in message || "sessionId" in message || "labId" in message; if (hasKnownKeys) setLmsData(prev => ({ ...prev, ...message })); } };
    window.addEventListener("message", handleMessage); if (isEmbedded) window.parent.postMessage({ type: "labReady", data: { grade: GRADE, labId: defaultLabId ?? null } }, "*"); return () => window.removeEventListener("message", handleMessage);
  }, [defaultLabId]);
  const reportComplete = useCallback(({ labId, points = DEFAULT_POINTS, timeTaken, extraData }: ReportCompleteArgs = {}) => {
    if (typeof window === "undefined" || window.parent === window) return; const resolvedLabId = labId ?? defaultLabId ?? lmsData.labId; if (!resolvedLabId || reportedLabsRef.current.has(resolvedLabId)) return; reportedLabsRef.current.add(resolvedLabId);
    
    // 1. Post to parent immediately
    const payload = { type: "levelComplete", data: { labId: resolvedLabId, grade: GRADE, level: Number(lmsData.levelValue ?? 1), points, timeTaken: timeTaken ?? getTimeTaken(), userId: lmsData.userId, attemptId: lmsData.attemptId, sessionId: lmsData.sessionId, mode: lmsData.mode, completedAt: new Date().toISOString(), ...extraData } };
    window.parent.postMessage(payload, "*");
    
    // 2. Queue locally for resilience against sudden unmounts
    try {
      const queue = JSON.parse(localStorage.getItem('codevyuh_completion_queue') || '[]');
      queue.push(payload);
      localStorage.setItem('codevyuh_completion_queue', JSON.stringify(queue));
    } catch(e) {}
  }, [defaultLabId, getTimeTaken, lmsData]);
  return { lmsData, hasParentFrame, getTimeTaken, reportComplete };
}
