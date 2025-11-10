
"use client";

import { useEffect, useState, useRef, RefObject } from "react";
import { Check, Loader2 } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  duration: number;
}

const steps: Step[] = [
  { id: 1, title: "Identify the entities", description: "Analyzing company structure and relationships", duration: 2500 },
  { id: 2, title: "Find the entity profile", description: "Gathering comprehensive company information",  duration: 3500 },
  { id: 3, title: "Find the entity connections", description: "Mapping ownership and director networks", duration: 4000 },
  { id: 4, title: "Run rules to identify nominee", description: "Applying compliance indicators and risk assessment", duration: 3000 },
];

export const ANALYSIS_TOTAL_MS = steps.reduce((sum, s) => sum + s.duration, 0);

type Props = {
  /** container ที่มี overflow (เช่น div ของ overlay) */
  scrollContainerRef?: RefObject<HTMLElement>;
  /** ให้เราไปหน้าถัดไป/สั่งนำทาง เมื่อจบสเต็ป */
  onComplete?: () => void;
  /** ป้องกันดีดขึ้นบนสุดก่อน navigate */
  preventTopJump?: boolean;
};

export function StepLoadingAnimation({
  scrollContainerRef,
  onComplete,
  preventTopJump = true,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const t = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(t);
    } else {
      // ✅ จบแล้ว: “ตรึง” scroll ไว้ชั่วคราว กันเด้งขึ้นบน
      if (preventTopJump && scrollContainerRef?.current) {
        const sc = scrollContainerRef.current;
        const y = sc.scrollTop;
        sc.style.scrollBehavior = "auto";
        sc.scrollTop = y; // pin ไว้
      }
      // หน่วงสั้นๆ ให้เฟรมสุดท้าย stable แล้วค่อย onComplete
      const t = setTimeout(() => onComplete?.(), 50);
      return () => clearTimeout(t);
    }
  }, [currentStep, onComplete, preventTopJump, scrollContainerRef]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const el = stepRefs.current[currentStep];
      const sc = scrollContainerRef?.current ?? document.scrollingElement ?? document.documentElement;
      if (el) {
        // เลื่อนให้ step ปัจจุบันอยู่กลาง ๆ container
        const rect = el.getBoundingClientRect();
        const scRect = (scrollContainerRef?.current ?? document.documentElement).getBoundingClientRect();
        const currentTop = (scrollContainerRef?.current?.scrollTop ?? window.scrollY) + (rect.top - scRect.top);
        const target = currentTop - (scRect.height / 2 - rect.height / 2);
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.style.scrollBehavior = "smooth";
          scrollContainerRef.current.scrollTo({ top: target, behavior: "smooth" });
        } else {
          window.scrollTo({ top: target, behavior: "smooth" });
        }
      }
    }
  }, [currentStep, scrollContainerRef]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 via-slate-950 to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left/1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-2xl w-full px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Analyzing Company Data
          </h2>
          <p className="text-slate-400">Please wait while we process your request</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = currentStep === index;
            const isPending = currentStep < index;

            return (
              <div
                key={step.id}
                ref={(el) => { stepRefs.current[index] = el; }}
                className={`relative transition-all duration-700 ease-in-out ${isCurrent ? "scale-105" : "scale-100"}`}
                style={{ opacity: isPending ? 0.4 : 1 }}
              >
                <div
                  className={`flex items-start gap-4 p-6 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-900/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                      : isCurrent
                        ? "bg-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-500/30 animate-pulse-subtle"
                        : "bg-slate-800/30 border-slate-700/50"
                  }`}
                >
                  <div
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                        : isCurrent
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                          : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="h-6 w-6 animate-scale-in" /> : isCurrent ? <Loader2 className="h-6 w-6 animate-spin" /> : step.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold mb-1 transition-colors duration-500 ${
                      isCompleted ? "text-emerald-300" : isCurrent ? "text-blue-300" : "text-slate-400"
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      isCompleted || isCurrent ? "text-slate-300" : "text-slate-500"
                    }`}>
                      {step.description}
                    </p>

                    {isCurrent && (
                      <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full animate-progress-bar"
                          style={{ animation: `progress-bar ${steps[index].duration}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className={`w-0.5 h-6 transition-all duration-500 ${isCompleted ? "bg-emerald-500/50" : "bg-slate-700/50"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentStep >= steps.length && (
          <div className="mt-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-300">
              <Check className="h-5 w-5" />
              <span className="font-semibold">Analysis Complete</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-subtle { 0%,100%{opacity:1} 50%{opacity:.9} }
        @keyframes scale-in { 0%{transform:scale(0)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes progress-bar { 0%{width:0%} 100%{width:100%} }
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-pulse-subtle{ animation:pulse-subtle 2s cubic-bezier(0.4,0,0.6,1) infinite }
        .animate-scale-in{ animation:scale-in .5s cubic-bezier(0.34,1.56,0.64,1) }
        .animate-fade-in{ animation:fade-in .6s ease-out }
      `}</style>
    </div>
  );
}
