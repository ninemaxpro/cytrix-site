"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface TerminalLine {
  type: "command" | "output" | "blank" | "divider";
  text: string;
  color?: string;
}

// ─── Tab: Dashboard ────────────────────────────────────────────────────────
const dashboardScript: TerminalLine[] = [
  { type: "command", text: "$ cytrix findings --summary" },
  { type: "blank",   text: "" },
  { type: "output",  text: "╔══════════════════════════════════════════════╗", color: "text-cyan-400" },
  { type: "output",  text: "║       CYTRIX  SECURITY  POSTURE              ║", color: "text-cyan-400" },
  { type: "output",  text: "║       aws account: 123456789012   eu-west-2  ║", color: "text-slate-500" },
  { type: "output",  text: "╚══════════════════════════════════════════════╝", color: "text-cyan-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  FINDINGS SUMMARY                             run: 2026-03-11 08:47 UTC", color: "text-slate-300" },
  { type: "divider", text: "  ──────────────────────────────────────────────────────────────────" },
  { type: "output",  text: "  P1  CRITICAL   ██████░░░░░░░░░░░░░░░░░░░░   2   (+1 since last run)", color: "text-red-400" },
  { type: "output",  text: "  P2  HIGH       ░░░░░░░░░░░░░░░░░░░░░░░░░░   0", color: "text-amber-400" },
  { type: "output",  text: "  P3  MEDIUM     █████████████████░░░░░░░░░   8   (-2 since last run)", color: "text-cyan-400" },
  { type: "output",  text: "  P4  LOW        ████████████████████████░░  36", color: "text-slate-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  TOOL STATUS", color: "text-slate-300" },
  { type: "divider", text: "  ──────────────────────────────────────────────────────────────────" },
  { type: "output",  text: "  Prowler   CSPM      ● Active    38 findings    last: 4m ago", color: "text-emerald-400" },
  { type: "output",  text: "  Trivy     Scanner   ● Active     8 findings    last: 4m ago", color: "text-emerald-400" },
  { type: "output",  text: "  Correlator          ● Active     2 stories     last: 4m ago", color: "text-emerald-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  ATTACK STORIES", color: "text-red-400" },
  { type: "divider", text: "  ──────────────────────────────────────────────────────────────────" },
  { type: "output",  text: "  [story-001]  IAM wildcard policy → 3 CloudTrail events", color: "text-red-400" },
  { type: "output",  text: "               AssumeRole → S3:GetObject → EC2:Describe", color: "text-slate-400" },
  { type: "output",  text: "               actor: arn:aws:sts::123456789012:assumed-role/dev-role", color: "text-slate-500" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  [story-002]  S3 bucket public access → 1 CloudTrail event", color: "text-red-400" },
  { type: "output",  text: "               PutBucketPolicy from external IP: 185.220.101.x", color: "text-slate-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  TREND (7d)   findings: ▄▄▅▆▇█▆   p1s: ▁▁▁▁▂▃▂", color: "text-slate-500" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  [i] run 'cytrix findings --top 5 --detail' to see prioritized breakdown", color: "text-slate-600" },
];

// ─── Tab: Prioritization ──────────────────────────────────────────────────
const prioritizationScript: TerminalLine[] = [
  { type: "command", text: "$ cytrix findings --top 5 --detail" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  PRIORITIZED FINDINGS                         weighted score model v2.1", color: "text-slate-300" },
  { type: "divider", text: "  ──────────────────────────────────────────────────────────────────" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  #1  [P1-0041]  IAM role with wildcard resource policy", color: "text-red-400" },
  { type: "output",  text: "       resource : arn:aws:iam::123456789012:role/dev-ec2-role", color: "text-slate-500" },
  { type: "output",  text: "       source   : Prowler / iam_policy_attached_no_wildcards", color: "text-slate-500" },
  { type: "output",  text: "       CVSS     : 8.8   EPSS: 0.71   exposure: PUBLIC   blast: HIGH", color: "text-amber-400" },
  { type: "output",  text: "       SCORE    : 94 / 100  ← CISA KEV match (CVE-2023-44487)", color: "text-red-400" },
  { type: "output",  text: "       fix      : Scope resource to specific ARN pattern, remove wildcard", color: "text-emerald-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  #2  [P1-0037]  S3 bucket public ACL enabled", color: "text-red-400" },
  { type: "output",  text: "       resource : arn:aws:s3:::cytrix-raw-uploads", color: "text-slate-500" },
  { type: "output",  text: "       source   : Prowler / s3_bucket_public_access_block_enabled", color: "text-slate-500" },
  { type: "output",  text: "       CVSS     : 7.5   EPSS: 0.44   exposure: PUBLIC   blast: HIGH", color: "text-amber-400" },
  { type: "output",  text: "       SCORE    : 87 / 100  ← correlated: PutBucketPolicy from ext IP", color: "text-red-400" },
  { type: "output",  text: "       fix      : Enable S3 Block Public Access, remove public ACL grant", color: "text-emerald-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  #3  [P3-0019]  ECR image: 3 HIGH CVEs (libssl, zlib, curl)", color: "text-cyan-400" },
  { type: "output",  text: "       resource : cytrix-engine:latest@sha256:a1b2c3d4...", color: "text-slate-500" },
  { type: "output",  text: "       source   : Trivy / image scan", color: "text-slate-500" },
  { type: "output",  text: "       CVSS     : 7.1   EPSS: 0.12   exposure: INTERNAL blast: MED", color: "text-amber-400" },
  { type: "output",  text: "       SCORE    : 61 / 100", color: "text-cyan-400" },
  { type: "output",  text: "       fix      : Rebuild image on base: python:3.12-slim (patched)", color: "text-emerald-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  #4  [P3-0022]  Security group allows 0.0.0.0/0 on port 22", color: "text-cyan-400" },
  { type: "output",  text: "       resource : sg-0abc1234def (ecs-tasks-sg)", color: "text-slate-500" },
  { type: "output",  text: "       SCORE    : 57 / 100", color: "text-cyan-400" },
  { type: "output",  text: "       fix      : Restrict SSH ingress to bastion CIDR only", color: "text-emerald-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  #5  [P3-0031]  CloudTrail not enabled in us-east-1", color: "text-cyan-400" },
  { type: "output",  text: "       resource : aws account / us-east-1", color: "text-slate-500" },
  { type: "output",  text: "       SCORE    : 53 / 100", color: "text-cyan-400" },
  { type: "output",  text: "       fix      : Enable CloudTrail multi-region trail with S3 logging", color: "text-emerald-400" },
  { type: "blank",   text: "" },
  { type: "output",  text: "  SCORE MODEL   CVSS×0.25 + EPSS×0.30 + exposure×0.20 + blast×0.15 + kev×0.10", color: "text-slate-600" },
];

// ─── Tab config ────────────────────────────────────────────────────────────
const tabs = [
  { id: "dashboard",      label: "Dashboard",      script: dashboardScript },
  { id: "prioritization", label: "Prioritization", script: prioritizationScript },
] as const;

type TabId = typeof tabs[number]["id"];

// ─── Terminal tab component ────────────────────────────────────────────────
function TerminalTab({ script }: { script: TerminalLine[] }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [isTyping, setIsTyping]         = useState(false);
  const [started, setStarted]           = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDemo = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleLines(0);
    setIsTyping(true);
    setStarted(true);

    let line = 0;
    intervalRef.current = setInterval(() => {
      line++;
      if (line >= script.length) {
        clearInterval(intervalRef.current!);
        setIsTyping(false);
        return;
      }
      setVisibleLines(line + 1);
    }, 90);
  }, [script]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  // Reset when script changes (tab switch)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleLines(0);
    setIsTyping(false);
    setStarted(false);
  }, [script]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 p-5 font-mono text-sm h-[520px] overflow-y-auto"
    >
      {script.slice(0, visibleLines).map((line, i) => (
        <div key={i} className="min-h-[1.35rem] leading-relaxed">
          {line.type === "blank" ? (
            <span>&nbsp;</span>
          ) : line.type === "divider" ? (
            <span className="text-slate-800">{line.text}</span>
          ) : line.type === "command" ? (
            <span className="text-emerald-400">{line.text}</span>
          ) : (
            <span className={line.color || "text-slate-300"}>{line.text}</span>
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
            className="px-6 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-sans text-sm"
          >
            Run
          </button>
        </div>
      )}

      {!isTyping && started && (
        <div className="mt-5 text-center">
          <button
            onClick={startDemo}
            className="text-xs text-slate-600 hover:text-cyan-400 transition-colors font-sans"
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function TerminalDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const activeScript = tabs.find((t) => t.id === activeTab)!.script;

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
            Real CLI output from Cytrix running against a live AWS account.
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
              cytrix - zsh - 80x24
            </span>

            {/* Tabs */}
            <div className="ml-auto flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-700 text-slate-100"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal body - key forces remount on tab change */}
          <TerminalTab key={activeTab} script={activeScript} />
        </motion.div>
      </div>
    </section>
  );
}
