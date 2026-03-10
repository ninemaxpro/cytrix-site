"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface TerminalLine {
  type: "command" | "output" | "blank";
  text: string;
  color?: string;
}

const demoScript: TerminalLine[] = [
  { type: "command", text: "$ cytrix" },
  { type: "blank", text: "" },
  { type: "output", text: "╔══════════════════════════════════════════════╗", color: "text-cyan-400" },
  { type: "output", text: "║           CYTRIX SECURITY ENGINE             ║", color: "text-cyan-400" },
  { type: "output", text: "╚══════════════════════════════════════════════╝", color: "text-cyan-400" },
  { type: "blank", text: "" },
  { type: "output", text: "  [1] Security Insights    — findings dashboard", color: "text-slate-300" },
  { type: "output", text: "  [2] Dashboards           — Grafana (Running)", color: "text-emerald-400" },
  { type: "output", text: "  [3] Guardrails           — recommendations", color: "text-slate-300" },
  { type: "output", text: "  [4] Resource Inventory   — tag management", color: "text-slate-300" },
  { type: "blank", text: "" },
  { type: "output", text: "  Select option [1-4] or Ctrl+C to exit", color: "text-slate-500" },
  { type: "blank", text: "" },
  { type: "command", text: "$ 1" },
  { type: "blank", text: "" },
  { type: "output", text: "╔══════════════════════════════════════════════╗", color: "text-cyan-400" },
  { type: "output", text: "║         SECURITY POSTURE DASHBOARD           ║", color: "text-cyan-400" },
  { type: "output", text: "╚══════════════════════════════════════════════╝", color: "text-cyan-400" },
  { type: "blank", text: "" },
  { type: "output", text: "  Findings Summary", color: "text-slate-200" },
  { type: "output", text: "  ────────────────────────────────────────────", color: "text-slate-700" },
  { type: "output", text: "  P1 CRITICAL   ██████░░░░░░░░░░░░░░    2", color: "text-red-400" },
  { type: "output", text: "  P2 HIGH       ░░░░░░░░░░░░░░░░░░░░    0", color: "text-amber-400" },
  { type: "output", text: "  P3 MEDIUM     ████████████████░░░░    8", color: "text-cyan-400" },
  { type: "output", text: "  P4 LOW        ████████████████████   36", color: "text-slate-400" },
  { type: "blank", text: "" },
  { type: "output", text: "  Integrated Tools", color: "text-slate-200" },
  { type: "output", text: "  ────────────────────────────────────────────", color: "text-slate-700" },
  { type: "output", text: "  Prowler       CSPM         ● Active    38 findings", color: "text-emerald-400" },
  { type: "output", text: "  Trivy         Scanner      ● Active     8 findings", color: "text-emerald-400" },
  { type: "blank", text: "" },
  { type: "output", text: "  Attack Stories [story]", color: "text-red-400" },
  { type: "output", text: "  ────────────────────────────────────────────", color: "text-slate-700" },
  { type: "output", text: "  [story] IAM wildcard policy → 3 CloudTrail events", color: "text-red-400" },
  { type: "output", text: "          AssumeRole → S3 GetObject → EC2 Describe", color: "text-slate-400" },
  { type: "output", text: "  [story] S3 public access → 1 CloudTrail event", color: "text-red-400" },
  { type: "output", text: "          PutBucketPolicy from external IP", color: "text-slate-400" },
];

export default function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDemo = useCallback(() => {
    setVisibleLines(0);
    setIsTyping(true);
    setStarted(true);

    let line = 0;
    intervalRef.current = setInterval(() => {
      line++;
      if (line >= demoScript.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
        return;
      }
      setVisibleLines(line + 1);
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It <span className="gradient-text">In Action</span>
          </h2>
          <p className="text-slate-400">
            Real output from the Cytrix CLI running against a live AWS account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden border border-slate-800 glow-cyan"
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-slate-500 ml-2 font-mono">
              cytrix — zsh — 80x24
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={containerRef}
            className="bg-slate-950 p-4 font-mono text-sm h-[480px] overflow-y-auto"
          >
            {demoScript.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="min-h-[1.4rem]">
                {line.type === "blank" ? (
                  <br />
                ) : line.type === "command" ? (
                  <span className="text-emerald-400">{line.text}</span>
                ) : (
                  <span className={line.color || "text-slate-300"}>
                    {line.text}
                  </span>
                )}
              </div>
            ))}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-blink" />
            )}
            {!started && (
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={startDemo}
                  className="px-6 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-sans text-base"
                >
                  Run Demo
                </button>
              </div>
            )}
            {!isTyping && started && (
              <div className="mt-4 text-center">
                <button
                  onClick={startDemo}
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors font-sans"
                >
                  Replay
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
