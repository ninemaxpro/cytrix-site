"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Filters ───────────────────────────────────────────────────────────────────
type FilterId = "cicd" | "cytrix";

const FILTERS: { id: FilterId; label: string; hex: string; btn: string; active: string }[] = [
  { id: "cicd",   label: "CI/CD Pipeline", hex: "#22d3ee",
    btn:    "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
    active: "border-cyan-400 bg-cyan-500/20 text-cyan-300" },
  { id: "cytrix", label: "Cytrix Flow",    hex: "#2dd4bf",
    btn:    "border-teal-500/40 text-teal-400 bg-teal-500/10",
    active: "border-teal-400 bg-teal-500/20 text-teal-300" },
];

const CAT_HEX: Record<string, string> = {
  cicd:    "#22d3ee",
  trigger: "#d97706",
  lambda:  "#0d9488",
  storage: "#3b82f6",
  service: "#f97316",
  output:  "#a78bfa",
};

const NR = 20;

interface GNode {
  id: string; label: string; sublabel: string;
  cx: number; cy: number;
  tags: FilterId[];
  category: string;
  issue?: string;
  iconPath: string;
}

interface GEdge {
  id: string; from: string; to: string;
  tags: FilterId[];
}

// ── Canvas layout ─────────────────────────────────────────────────────────────
// Canvas: 800 × 490
//
// Dev Laptop      cx=63  cy=50   (above GitHub box)
// GitHub box      x=8    y=82   w=110  h=338   (bottom=420)
//   GitHub        cx=63  cy=130
//   GH Actions    cx=63  cy=210
//   TF Plan       cx=63  cy=290
//   TF Apply      cx=63  cy=370
//
// AWS zone        x=138  y=15   w=570  h=465   (right=708, bottom=480)
//   API Gateway   cx=318 cy=370   (CI/CD endpoint, same cy as TF Apply)
//
//   Lambda sub-box  x=148 y=78  w=100  h=367   (cx=198, bottom=445)
//     EventBridge   cx=198 cy=105
//     Collector     cx=198 cy=185
//     Enricher      cx=198 cy=265
//     Scorer        cx=198 cy=345
//     Correlator    cx=198 cy=425
//
//   Threat Intel    cx=318 cy=265   (feeds Enricher horizontally, same cy)
//   CloudTrail      cx=580 cy=295   (feeds Correlator diagonally; bottom=315, above s3c-sec at cy=425)
//
//   S3 sub-box      x=418 y=158  w=80   h=287   (cx=458, bottom=445)
//     s3raw         cx=458 cy=185   (same cy as Collector)
//     s3enriched    cx=458 cy=265   (same cy as Enricher)
//     s3scored      cx=458 cy=345   (same cy as Scorer)
//     s3correlated  cx=458 cy=425   (same cy as Correlator)
//
// SecEng          cx=720 cy=425   (outside AWS zone, right of s3correlated)

const NODES: GNode[] = [
  // ── CI/CD — vertical stack at cx=63 ──────────────────────────────────────────
  { id: "dev",
    label: "Dev Laptop", sublabel: "pre-commit hook",
    cx: 63, cy: 50, tags: ["cicd"], category: "cicd",
    iconPath: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" },

  { id: "github",
    label: "GitHub", sublabel: "source repo",
    cx: 63, cy: 130, tags: ["cicd"], category: "cicd", issue: "secret leak?",
    iconPath: "M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },

  { id: "ci",
    label: "GH Actions", sublabel: "tfsec · bandit · pip-audit",
    cx: 63, cy: 210, tags: ["cicd"], category: "cicd",
    iconPath: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" },

  { id: "tfplan",
    label: "TF Plan", sublabel: "validate + tfsec gate",
    cx: 63, cy: 290, tags: ["cicd"], category: "cicd",
    iconPath: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" },

  { id: "tfapply",
    label: "TF Apply", sublabel: "modules/infra",
    cx: 63, cy: 370, tags: ["cicd"], category: "cicd",
    iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },

  // ── AWS zone — CI/CD endpoint (same cy as TF Apply) ───────────────────────────
  { id: "apigw",
    label: "API Gateway", sublabel: "infra provisioned",
    cx: 318, cy: 370, tags: ["cicd"], category: "cicd",
    iconPath: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" },

  // ── AWS zone — Lambda column cx=198 ───────────────────────────────────────────
  { id: "eventbridge",
    label: "EventBridge", sublabel: "rate(15 min)",
    cx: 198, cy: 105, tags: ["cytrix"], category: "trigger",
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },

  { id: "collector",
    label: "Collector", sublabel: "Prowler + Trivy",
    cx: 198, cy: 185, tags: ["cytrix"], category: "lambda",
    iconPath: "M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" },

  { id: "enricher",
    label: "Enricher", sublabel: "KEV + OSV + 6 passes",
    cx: 198, cy: 265, tags: ["cytrix"], category: "lambda",
    iconPath: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },

  { id: "scorer",
    label: "Scorer", sublabel: "Weighted → P1-P4",
    cx: 198, cy: 345, tags: ["cytrix"], category: "lambda",
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },

  { id: "correlator",
    label: "Correlator", sublabel: "attack stories",
    cx: 198, cy: 425, tags: ["cytrix"], category: "lambda",
    iconPath: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },

  // ── AWS zone — service nodes ───────────────────────────────────────────────────
  { id: "threatintel",
    label: "Threat Intel", sublabel: "CISA KEV + OSV.dev",
    cx: 318, cy: 265, tags: ["cytrix"], category: "service",
    iconPath: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },

  { id: "cloudtrail",
    label: "CloudTrail", sublabel: "auto-logged AWS calls",
    cx: 580, cy: 295, tags: ["cytrix"], category: "service",
    iconPath: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" },

  // ── AWS zone — S3 column cx=458 ────────────────────────────────────────────────
  { id: "s3raw",
    label: "S3 raw/", sublabel: "per-tool batches",
    cx: 458, cy: 185, tags: ["cytrix"], category: "storage",
    iconPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },

  { id: "s3enriched",
    label: "S3 enriched/", sublabel: "with context",
    cx: 458, cy: 265, tags: ["cytrix"], category: "storage",
    iconPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },

  { id: "s3scored",
    label: "S3 scored/", sublabel: "with tiers",
    cx: 458, cy: 345, tags: ["cytrix"], category: "storage",
    iconPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },

  { id: "s3correlated",
    label: "S3 correlated/", sublabel: "attack stories",
    cx: 458, cy: 425, tags: ["cytrix"], category: "storage",
    iconPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },

  // ── Outside AWS zone ──────────────────────────────────────────────────────────
  { id: "seceng",
    label: "SecEng", sublabel: "Cytrix CLI",
    cx: 720, cy: 425, tags: ["cytrix"], category: "output",
    iconPath: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" },
];

const EDGES: GEdge[] = [
  // CI/CD vertical chain (cx=63)
  { id: "dev-gh",     from: "dev",         to: "github",       tags: ["cicd"]   },
  { id: "gh-ci",      from: "github",      to: "ci",           tags: ["cicd"]   },
  { id: "ci-tfp",     from: "ci",          to: "tfplan",       tags: ["cicd"]   },
  { id: "tfp-tfap",   from: "tfplan",      to: "tfapply",      tags: ["cicd"]   },
  // TF Apply → API Gateway (horizontal, same cy=370)
  { id: "tfap-apigw", from: "tfapply",     to: "apigw",        tags: ["cicd"]   },
  // EventBridge → Collector (vertical, same cx=198)
  { id: "eb-col",     from: "eventbridge", to: "collector",    tags: ["cytrix"] },
  // Threat Intel → Enricher (horizontal left, same cy=265)
  { id: "ti-enr",     from: "threatintel", to: "enricher",     tags: ["cytrix"] },
  // CloudTrail → Correlator (diagonal - Correlator queries CloudTrail via boto3)
  { id: "trail-cor",  from: "cloudtrail",  to: "correlator",   tags: ["cytrix"] },
  // Lambda → S3 (horizontal right, same cy per row)
  { id: "col-s3r",    from: "collector",   to: "s3raw",        tags: ["cytrix"] },
  { id: "enr-s3e",    from: "enricher",    to: "s3enriched",   tags: ["cytrix"] },
  { id: "scr-s3s",    from: "scorer",      to: "s3scored",     tags: ["cytrix"] },
  { id: "cor-s3c",    from: "correlator",  to: "s3correlated", tags: ["cytrix"] },
  // S3 → next Lambda (S3 ObjectCreated notification - diagonal down-left)
  { id: "s3r-enr",    from: "s3raw",       to: "enricher",     tags: ["cytrix"] },
  { id: "s3e-scr",    from: "s3enriched",  to: "scorer",       tags: ["cytrix"] },
  { id: "s3s-cor",    from: "s3scored",    to: "correlator",   tags: ["cytrix"] },
  // S3 correlated → SecEng (horizontal right, same cy=425)
  { id: "s3c-sec",    from: "s3correlated",to: "seceng",       tags: ["cytrix"] },
];

interface FlowStep { label: string; badge: string; detail: string }
interface FlowDetail { title: string; description: string; steps: FlowStep[] }

const FLOW_DETAILS: Record<FilterId, FlowDetail> = {
  cicd: {
    title: "CI/CD Security Pipeline",
    description: "Every commit flows through security gates before a single AWS resource is created. TF Apply calls AWS APIs to provision all infrastructure. CI/CD flow ends there.",
    steps: [
      { label: "Dev Laptop",  badge: "pre-commit",                 detail: "git-secrets hook blocks credential commits before push." },
      { label: "GitHub",      badge: "branch protection",          detail: "Branch protection enforces CI pass before merge. No direct pushes to main." },
      { label: "GH Actions",  badge: "tfsec + Bandit + pip-audit", detail: "tfsec scans IaC, Bandit runs SAST, pip-audit checks CVEs. HIGH findings block merge." },
      { label: "TF Plan",     badge: "validate + tfsec gate",      detail: "Hardened modules enforce encryption, scoped IAM, no public S3 - by default." },
      { label: "TF Apply",    badge: "modules/infra",              detail: "Calls AWS APIs to provision all infra. CI/CD flow ends here - runtime is Cytrix territory." },
      { label: "API Gateway", badge: "AWS APIs",                   detail: "Represents all AWS API endpoints called during provisioning: Lambda, S3, EventBridge, IAM." },
    ],
  },
  cytrix: {
    title: "Cytrix Detection Pipeline",
    description: "EventBridge fires every 15 minutes. Collector reads Prowler and Trivy output from S3. Findings zigzag through S3 stages driven by ObjectCreated notifications.",
    steps: [
      { label: "EventBridge",  badge: "rate(15 min)",        detail: "Scheduled rule triggers Collector Lambda every 15 minutes." },
      { label: "Collector",    badge: "S3 raw/",             detail: "Reads Prowler OCSF output + Trivy scan results from S3 (written by GH Actions cron). Normalises into CytrixFindings and writes to S3 raw/." },
      { label: "Threat Intel", badge: "CISA KEV + OSV.dev",  detail: "Enricher fetches CISA KEV catalog on cold start, then queries OSV.dev per CVE over HTTPS. No AWS service - direct external API calls." },
      { label: "Enricher",     badge: "S3 enriched/",        detail: "6 enrichment passes: exposure, threat intel (KEV+OSV), vulnerability, asset criticality, historical, blast radius. Writes to S3 enriched/." },
      { label: "Scorer",       badge: "S3 scored/",          detail: "Weighted formula across 6 signals (CVSS, EPSS, exposure, blast radius, asset criticality, threat intel) produces P1-P4 tiers." },
      { label: "CloudTrail",   badge: "boto3 API",           detail: "Correlator calls cloudtrail.get_paginator('lookup_events') to find all API activity on P1/P2 finding resources. AWS auto-logs all API calls - Correlator reads them." },
      { label: "Correlator",   badge: "S3 correlated/",      detail: "Groups CloudTrail events with each P1/P2 finding. Builds attack hypothesis. Writes CorrelationStory JSON to S3 correlated/." },
      { label: "Cytrix CLI",   badge: "SecEng laptop",       detail: "Security engineer runs cytrix findings to pull ranked attack stories directly from S3 correlated/." },
    ],
  },
};

const nodeById = (id: string) => NODES.find(n => n.id === id)!;

function edgePath(fromId: string, toId: string): string {
  const f = nodeById(fromId);
  const t = nodeById(toId);
  const dx = t.cx - f.cx, dy = t.cy - f.cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return "";
  const ux = dx / len, uy = dy / len;
  const sx = f.cx + ux * NR, sy = f.cy + uy * NR;
  const ex = t.cx - ux * NR, ey = t.cy - uy * NR;

  if (Math.abs(dy) < 4 || Math.abs(dx) < 4)
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const mid = (sx + ex) / 2;
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${mid.toFixed(1)} ${sy.toFixed(1)}, ${mid.toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
  const mid = (sy + ey) / 2;
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${sx.toFixed(1)} ${mid.toFixed(1)}, ${ex.toFixed(1)} ${mid.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const filter = FILTERS.find(f => f.id === activeFilter) ?? null;
  const detail = activeFilter ? FLOW_DETAILS[activeFilter] : null;

  const nodeHi  = (n: GNode) => !activeFilter || n.tags.includes(activeFilter);
  const edgeAct = (e: GEdge) => !!activeFilter && e.tags.includes(activeFilter);
  const toggle  = (id: FilterId) => setActiveFilter(p => p === id ? null : id);

  const awsFill   = activeFilter === "cytrix" ? "rgba(13,148,136,0.05)"
                  : activeFilter === "cicd"   ? "rgba(34,211,238,0.04)"
                  : "rgba(15,23,42,0.4)";
  const awsStroke = activeFilter === "cytrix" ? "rgba(45,212,191,0.25)"
                  : activeFilter === "cicd"   ? "rgba(34,211,238,0.20)"
                  : "rgba(30,41,59,0.8)";

  return (
    <section id="flow" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Security at <span className="gradient-text">Every Phase</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From first commit to correlated findings - one continuous flow. Select a layer to trace it.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-3 mb-10">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => toggle(f.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                activeFilter === f.id ? f.active : f.btn
              }`}>
              {f.label}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }} className="hidden md:block overflow-x-auto">
          <svg viewBox="0 0 800 490" className="w-full" style={{ minWidth: 580 }}>

            <defs>
              <marker id="arr-def" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
              </marker>
              {filter && (
                <marker id="arr-act" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill={filter.hex} />
                </marker>
              )}
            </defs>

            {/* ── GitHub vertical box ── */}
            <rect x="8" y="82" width="110" height="338" rx="8"
              fill={activeFilter === "cicd" ? "rgba(34,211,238,0.04)" : "rgba(15,23,42,0.3)"}
              stroke={activeFilter === "cicd" ? "rgba(34,211,238,0.25)" : "rgba(30,41,59,0.7)"}
              strokeWidth="1" style={{ transition: "all 0.3s" }} />
            <text x="22" y="97" fontSize="8" fontFamily="monospace"
              fill={activeFilter === "cicd" ? "#22d3ee" : "#334155"}
              letterSpacing="1.5" style={{ transition: "all 0.3s" }}>GITHUB</text>

            {/* ── AWS outer zone ── */}
            <rect x="138" y="15" width="570" height="465" rx="10"
              fill={awsFill} stroke={awsStroke}
              strokeWidth="1" style={{ transition: "all 0.3s" }} />
            <text x="154" y="30" fontSize="8" fontFamily="monospace"
              fill={activeFilter ? (activeFilter === "cicd" ? "#22d3ee" : "#2dd4bf") : "#334155"}
              letterSpacing="1.5" style={{ transition: "all 0.3s" }}>AWS</text>

            {/* ── Lambda vertical sub-box ── */}
            <rect x="148" y="78" width="100" height="367" rx="5"
              fill={activeFilter === "cytrix" ? "rgba(13,148,136,0.07)" : "rgba(13,148,136,0.02)"}
              stroke={activeFilter === "cytrix" ? "rgba(13,148,136,0.30)" : "rgba(13,148,136,0.10)"}
              strokeWidth="0.75" strokeDasharray="4 3"
              style={{ transition: "all 0.3s" }} />
            <text x="160" y="91" fontSize="6.5" fontFamily="monospace"
              fill={activeFilter === "cytrix" ? "#0d9488" : "#334155"}
              letterSpacing="1" opacity={activeFilter === "cytrix" ? 0.7 : 0.3}
              style={{ transition: "all 0.3s" }}>LAMBDA</text>

            {/* ── S3 vertical sub-box ── */}
            <rect x="418" y="158" width="80" height="287" rx="5"
              fill={activeFilter === "cytrix" ? "rgba(59,130,246,0.07)" : "rgba(59,130,246,0.02)"}
              stroke={activeFilter === "cytrix" ? "rgba(59,130,246,0.30)" : "rgba(59,130,246,0.10)"}
              strokeWidth="0.75" strokeDasharray="4 3"
              style={{ transition: "all 0.3s" }} />
            <text x="430" y="171" fontSize="6.5" fontFamily="monospace"
              fill={activeFilter === "cytrix" ? "#3b82f6" : "#334155"}
              letterSpacing="1" opacity={activeFilter === "cytrix" ? 0.7 : 0.3}
              style={{ transition: "all 0.3s" }}>S3</text>

            {/* ── Edges ── */}
            {EDGES.map(e => {
              const act = edgeAct(e);
              const d   = edgePath(e.from, e.to);
              return (
                <path key={e.id} d={d} fill="none"
                  stroke={act ? filter!.hex : "#1e3a4a"}
                  strokeWidth={act ? 1.5 : 1}
                  strokeOpacity={act ? 0.80 : 0.55}
                  strokeDasharray={act ? "7 5" : undefined}
                  markerEnd={act ? "url(#arr-act)" : "url(#arr-def)"}
                  style={act ? { animation: "dash-march 0.85s linear infinite" } : undefined}
                />
              );
            })}

            {/* ── Nodes ── */}
            {NODES.map(n => {
              const hi      = nodeHi(n);
              const clr     = filter?.hex ?? CAT_HEX[n.category];
              const catClr  = CAT_HEX[n.category];
              const guarded = hi && !!activeFilter && !!n.issue;

              return (
                <motion.g key={n.id}
                  animate={{ opacity: hi ? 1 : 0.18 }}
                  transition={{ duration: 0.22 }}>

                  {n.issue && (
                    <g>
                      <rect x={n.cx - 28} y={n.cy - NR - 20} width={56} height={14} rx={7}
                        fill={guarded ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.10)"}
                        stroke={guarded ? "rgba(34,197,94,0.35)" : "rgba(251,191,36,0.30)"}
                        strokeWidth="0.75" />
                      <text x={n.cx} y={n.cy - NR - 10} textAnchor="middle"
                        fontSize="7.5" fontFamily="monospace"
                        fill={guarded ? "#4ade80" : "#fbbf24"}>
                        {guarded ? "✓ guarded" : n.issue}
                      </text>
                    </g>
                  )}

                  {hi && activeFilter && (
                    <>
                      <circle cx={n.cx} cy={n.cy} r={NR} fill="none"
                        stroke={clr} strokeWidth="1.5" strokeOpacity="0.35"
                        style={{
                          transformBox: "fill-box" as React.CSSProperties["transformBox"],
                          transformOrigin: "center",
                          animation: "node-ring 1.6s ease-out infinite",
                        }} />
                      <circle cx={n.cx} cy={n.cy} r={NR} fill="none"
                        stroke={clr} strokeWidth="1.5" strokeOpacity="0.35"
                        style={{
                          transformBox: "fill-box" as React.CSSProperties["transformBox"],
                          transformOrigin: "center",
                          animation: "node-ring 1.6s ease-out 0.8s infinite",
                        }} />
                    </>
                  )}

                  <circle cx={n.cx} cy={n.cy} r={NR}
                    fill={hi && activeFilter ? `${catClr}18` : "rgba(15,23,42,0.9)"}
                    stroke={hi ? (activeFilter ? catClr : catClr + "80") : "#1e293b"}
                    strokeWidth={hi && activeFilter ? 1.5 : 1}
                  />

                  <svg x={n.cx - 8} y={n.cy - 8} width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke={hi ? catClr : "#334155"}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    opacity={hi ? (activeFilter ? 1 : 0.6) : 0.25}>
                    <path d={n.iconPath} />
                  </svg>

                  <text x={n.cx} y={n.cy + NR + 12} textAnchor="middle"
                    fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif"
                    fill={hi ? (activeFilter ? "#e2e8f0" : "#94a3b8") : "#334155"}>
                    {n.label}
                  </text>
                  <text x={n.cx} y={n.cy + NR + 22} textAnchor="middle"
                    fontSize="7" fontFamily="monospace"
                    fill={hi && activeFilter ? `${catClr}88` : "#2d3f55"}>
                    {n.sublabel}
                  </text>
                </motion.g>
              );
            })}

            {/* Legend */}
            {[
              { label: "CI/CD",   color: "#22d3ee" },
              { label: "Trigger", color: "#d97706" },
              { label: "Lambda",  color: "#0d9488" },
              { label: "Storage", color: "#3b82f6" },
              { label: "Service", color: "#f97316" },
              { label: "Output",  color: "#a78bfa" },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${30 + i * 124}, 478)`}>
                <circle r="4.5" cx="4.5" cy="4.5" fill={item.color} opacity="0.7" />
                <text x="13" y="8.5" fontSize="8.5" fontFamily="monospace" fill="#475569">{item.label}</text>
              </g>
            ))}
          </svg>
        </motion.div>

        <div className="md:hidden mb-6 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-500 text-center">View on a wider screen for the full diagram.</p>
        </div>

        {!activeFilter && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-2 font-mono">
            select a flow above to trace it through the diagram
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {activeFilter && detail && filter && (
            <motion.div key={activeFilter}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}
              className="mt-8">
              <div className="rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-6"
                style={{ borderColor: `${filter.hex}28` }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: filter.hex }} />
                  <h3 className="text-lg font-bold text-slate-100">{detail.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-2xl">{detail.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.steps.map((step, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold mt-0.5"
                        style={{ backgroundColor: `${filter.hex}18`, color: filter.hex, border: `1px solid ${filter.hex}30` }}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-300">{step.label}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${filter.hex}14`, color: filter.hex, border: `1px solid ${filter.hex}30` }}>
                            {step.badge}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-slate-400 leading-relaxed">{step.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
