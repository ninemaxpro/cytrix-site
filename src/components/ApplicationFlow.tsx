"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Two filters only ──────────────────────────────────────────────────────────
type FilterId = "cicd" | "cytrix";

const FILTERS: { id: FilterId; label: string; hex: string; btn: string; active: string }[] = [
  { id: "cicd",   label: "CI/CD Pipeline", hex: "#22d3ee",
    btn:    "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
    active: "border-cyan-400 bg-cyan-500/20 text-cyan-300" },
  { id: "cytrix", label: "Cytrix Flow",    hex: "#34d399",
    btn:    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    active: "border-emerald-400 bg-emerald-500/20 text-emerald-300" },
];

const NR = 24; // node circle radius

// ── Data types ────────────────────────────────────────────────────────────────
interface GNode {
  id: string; label: string; sublabel: string;
  x: number;  y: number;
  tags: FilterId[];
  issue?: string;
  planned?: boolean;
  iconPath: string;
}

interface GEdge {
  id: string; from: string; to: string;
  tags: FilterId[];
  dashed?: boolean;   // cross-connection style
}

// ── Nodes ─────────────────────────────────────────────────────────────────────
// Canvas: 900 × 450
// CI/CD row  y = 104
// Shared     y = 252
// Cytrix row y = 385

const NODES: GNode[] = [
  // ── CI/CD Pipeline (top row) ────────────────────────────────────────────
  { id: "dev", label: "Dev Laptop", sublabel: "pre-commit hook",
    x: 75,  y: 104, tags: ["cicd"],
    iconPath: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" },

  { id: "github", label: "GitHub", sublabel: "source repo",
    x: 230, y: 104, tags: ["cicd"], issue: "secret leak?",
    iconPath: "M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" },

  { id: "ci", label: "GH Actions", sublabel: "tfsec · bandit · pip-audit",
    x: 395, y: 104, tags: ["cicd"],
    iconPath: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" },

  { id: "tfplan", label: "TF Plan", sublabel: "validate + tfsec gate",
    x: 556, y: 104, tags: ["cicd"],
    iconPath: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" },

  { id: "tfapply", label: "TF Apply", sublabel: "modules/infra",
    x: 718, y: 104, tags: ["cicd"],
    iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },

  // ── Shared infrastructure (middle) ──────────────────────────────────────
  { id: "iam", label: "IAM Roles", sublabel: "per-fn scoped",
    x: 556, y: 252, tags: ["cicd", "cytrix"], issue: "over-privileged?",
    iconPath: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" },

  { id: "s3", label: "S3 Stages", sublabel: "raw → enriched → scored",
    x: 718, y: 252, tags: ["cicd", "cytrix"], issue: "public access?",
    iconPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },

  // ── Cytrix Detection Pipeline (bottom row) ──────────────────────────────
  { id: "eventbridge", label: "EventBridge", sublabel: "15-min schedule",
    x: 75,  y: 385, tags: ["cytrix"],
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },

  { id: "collector", label: "Collector λ", sublabel: "CloudTrail → S3 raw",
    x: 230, y: 385, tags: ["cytrix"],
    iconPath: "M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" },

  { id: "enricher", label: "Enricher λ", sublabel: "threat intel + context",
    x: 395, y: 385, tags: ["cytrix"],
    iconPath: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },

  { id: "scorer", label: "Scorer λ", sublabel: "risk scoring",
    x: 556, y: 385, tags: ["cytrix"],
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },

  { id: "correlator", label: "Correlator λ", sublabel: "incident grouping",
    x: 718, y: 385, tags: ["cytrix"],
    iconPath: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },

  { id: "sns", label: "SNS", sublabel: "alert delivery",
    x: 855, y: 330, tags: ["cytrix"], planned: true,
    iconPath: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
];

// ── Edges ─────────────────────────────────────────────────────────────────────
const EDGES: GEdge[] = [
  // CI/CD pipeline
  { id: "dev-gh",    from: "dev",         to: "github",     tags: ["cicd"] },
  { id: "gh-ci",     from: "github",      to: "ci",         tags: ["cicd"] },
  { id: "ci-tfp",    from: "ci",          to: "tfplan",     tags: ["cicd"] },
  { id: "tfp-dep",   from: "tfplan",      to: "tfapply",    tags: ["cicd"] },
  { id: "dep-iam",   from: "tfapply",     to: "iam",        tags: ["cicd"] },
  { id: "dep-s3",    from: "tfapply",     to: "s3",         tags: ["cicd"] },

  // Cytrix flow
  { id: "eb-col",    from: "eventbridge", to: "collector",  tags: ["cytrix"] },
  { id: "col-enr",   from: "collector",   to: "enricher",   tags: ["cytrix"] },
  { id: "enr-scr",   from: "enricher",    to: "scorer",     tags: ["cytrix"] },
  { id: "scr-cor",   from: "scorer",      to: "correlator", tags: ["cytrix"] },
  { id: "cor-sns",   from: "correlator",  to: "sns",        tags: ["cytrix"] },

  // Cross-connections: provisioned infra used by Cytrix runtime
  { id: "iam-enr",   from: "iam",         to: "enricher",   tags: ["cicd", "cytrix"], dashed: true },
  { id: "s3-scr",    from: "s3",          to: "scorer",     tags: ["cicd", "cytrix"], dashed: true },
];

// ── Flow detail panel ─────────────────────────────────────────────────────────
interface FlowStep { label: string; badge: string; detail: string; planned?: boolean }
interface FlowDetail { title: string; description: string; steps: FlowStep[] }

const FLOW_DETAILS: Record<FilterId, FlowDetail> = {
  cicd: {
    title: "CI/CD Security Pipeline",
    description: "Every commit flows through automated security gates before a single resource reaches AWS. No manual reviews - the guardrails are wired into the pipeline itself.",
    steps: [
      { label: "Dev Laptop",  badge: "pre-commit",              detail: "git-secrets hook scans every commit for credentials and keys before the push. Block at source." },
      { label: "GitHub",      badge: "branch protection",       detail: "Branch protection enforces CI pass before merge. No direct pushes to main." },
      { label: "GH Actions",  badge: "tfsec + Bandit + pip-audit", detail: "tfsec scans IaC for misconfigs, Bandit runs SAST on Lambda Python, pip-audit checks deps for CVEs. HIGH/CRITICAL blocks merge." },
      { label: "TF Plan",     badge: "validate + tfsec gate",   detail: "terraform validate + tfsec on plan output. Hardened modules enforce encryption, scoped roles, and block public access by default." },
      { label: "TF Apply",    badge: "modules/infra",           detail: "Runs locally. Remote state in S3 + DynamoDB lock. Provisions per-function IAM roles and S3 stages. Open S3 is architecturally impossible." },
    ],
  },
  cytrix: {
    title: "Cytrix Detection Pipeline",
    description: "EventBridge fires every 15 minutes. Raw CloudTrail events pass through four Lambda stages - collect, enrich, score, correlate - producing risk-ranked incidents ready for action.",
    steps: [
      { label: "EventBridge",     badge: "15-min schedule",    detail: "Scheduled rule triggers the Collector Lambda on a fixed cadence. No manual intervention." },
      { label: "Collector λ",     badge: "→ S3 raw/",          detail: "Pulls CloudTrail events for the window. Writes raw findings to S3 raw/ prefix with the function's scoped IAM role." },
      { label: "Enricher λ",      badge: "→ S3 enriched/",     detail: "Reads raw findings. Adds geo, ASN, threat actor tags, and IOC matches from threat intel feed. Writes to S3 enriched/." },
      { label: "Scorer λ",        badge: "→ S3 scored/",       detail: "Assigns risk score by severity, confidence, and threat intel signal weight. Writes to S3 scored/." },
      { label: "Correlator λ",    badge: "→ S3 correlated/",   detail: "Groups related findings into incidents by actor, technique, and timeline. Produces actionable incident records." },
      { label: "SNS",             badge: "alert delivery",     detail: "High-severity incidents trigger SNS notification. Auto-remediation Lambda planned as next subscriber.", planned: true },
    ],
  },
};

// ── SVG path helpers ──────────────────────────────────────────────────────────
const nodeById = (id: string) => NODES.find(n => n.id === id)!;

function edgePath(e: GEdge): string {
  const f = nodeById(e.from);
  const t = nodeById(e.to);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return "";
  const ux = dx / len, uy = dy / len;
  const sx = f.x + ux * NR, sy = f.y + uy * NR;
  const ex = t.x - ux * NR, ey = t.y - uy * NR;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const mid = (sx + ex) / 2;
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${mid.toFixed(1)} ${sy.toFixed(1)}, ${mid.toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
  const mid = (sy + ey) / 2;
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${sx.toFixed(1)} ${mid.toFixed(1)}, ${ex.toFixed(1)} ${mid.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const filter  = FILTERS.find(f => f.id === activeFilter) ?? null;
  const detail  = activeFilter ? FLOW_DETAILS[activeFilter] : null;

  const nodeHi  = (n: GNode) => !activeFilter || n.tags.includes(activeFilter);
  const edgeAct = (e: GEdge) => !!activeFilter && e.tags.includes(activeFilter);

  const toggle  = (id: FilterId) => setActiveFilter(p => p === id ? null : id);

  return (
    <section id="flow" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Security at <span className="gradient-text">Every Phase</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Full application flow from dev commit to cloud runtime. Select a flow to see where guardrails are enforced and what each stage does.
          </p>
        </motion.div>

        {/* Filter buttons */}
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

        {/* ── SVG diagram (desktop) ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }} className="hidden md:block overflow-x-auto">
          <svg viewBox="0 0 900 450" className="w-full" style={{ minWidth: 600 }}>

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

            {/* Lane backgrounds */}
            {/* CI/CD lane */}
            <rect x="12" y="28" width="876" height="148" rx="10"
              fill={activeFilter === "cicd"   ? "rgba(34,211,238,0.04)" : "rgba(30,41,59,0.5)"}
              stroke={activeFilter === "cicd" ? "rgba(34,211,238,0.18)" : "rgba(51,65,85,0.35)"}
              strokeWidth="1" style={{ transition: "all 0.3s" }} />
            {/* Cytrix lane */}
            <rect x="12" y="305" width="876" height="132" rx="10"
              fill={activeFilter === "cytrix"   ? "rgba(52,211,153,0.04)" : "rgba(30,41,59,0.5)"}
              stroke={activeFilter === "cytrix" ? "rgba(52,211,153,0.18)" : "rgba(51,65,85,0.35)"}
              strokeWidth="1" style={{ transition: "all 0.3s" }} />

            {/* Lane labels */}
            <text x="28" y="48" fontSize="9" fontFamily="monospace" fill="#334155" letterSpacing="1.5">
              CI / CD PIPELINE
            </text>
            <text x="28" y="325" fontSize="9" fontFamily="monospace" fill="#334155" letterSpacing="1.5">
              CYTRIX DETECTION
            </text>

            {/* Edges */}
            {EDGES.map(e => {
              const act = edgeAct(e);
              const d   = edgePath(e);
              return (
                <path key={e.id} d={d} fill="none"
                  stroke={act ? filter!.hex : "#334155"}
                  strokeWidth={act ? 1.5 : 1}
                  strokeOpacity={act ? 0.75 : e.dashed ? 0.3 : 0.55}
                  strokeDasharray={act ? "7 5" : e.dashed ? "4 4" : undefined}
                  markerEnd={act ? "url(#arr-act)" : "url(#arr-def)"}
                  style={act ? { animation: "dash-march 0.85s linear infinite" } : undefined}
                />
              );
            })}

            {/* Nodes */}
            {NODES.map(n => {
              const hi      = nodeHi(n);
              const guarded = hi && !!activeFilter && !!n.issue;
              const clr     = filter?.hex ?? "#94a3b8";

              return (
                <motion.g key={n.id}
                  animate={{ opacity: hi ? 1 : 0.18 }}
                  transition={{ duration: 0.22 }}>

                  {/* Issue badge */}
                  {n.issue && (
                    <g>
                      <rect x={n.x - 30} y={n.y - NR - 22} width={60} height={15} rx={7.5}
                        fill={guarded ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.10)"}
                        stroke={guarded ? "rgba(34,197,94,0.35)" : "rgba(251,191,36,0.30)"}
                        strokeWidth="0.75" />
                      <text x={n.x} y={n.y - NR - 11} textAnchor="middle"
                        fontSize="7.5" fontFamily="monospace"
                        fill={guarded ? "#4ade80" : "#fbbf24"}>
                        {guarded ? "✓ guarded" : n.issue}
                      </text>
                    </g>
                  )}

                  {/* Pulse rings - transformBox keeps scale anchored to circle center */}
                  {hi && activeFilter && !n.planned && (
                    <>
                      <circle cx={n.x} cy={n.y} r={NR} fill="none"
                        stroke={clr} strokeWidth="1.5" strokeOpacity="0.35"
                        style={{
                          transformBox:   "fill-box" as React.CSSProperties["transformBox"],
                          transformOrigin: "center",
                          animation: "node-ring 1.6s ease-out infinite",
                        }} />
                      <circle cx={n.x} cy={n.y} r={NR} fill="none"
                        stroke={clr} strokeWidth="1.5" strokeOpacity="0.35"
                        style={{
                          transformBox:   "fill-box" as React.CSSProperties["transformBox"],
                          transformOrigin: "center",
                          animation: "node-ring 1.6s ease-out 0.8s infinite",
                        }} />
                    </>
                  )}

                  {/* Circle */}
                  <circle cx={n.x} cy={n.y} r={NR}
                    fill={
                      n.planned     ? "rgba(129,140,248,0.06)"
                      : hi && activeFilter ? `${clr}18`
                      : "rgba(15,23,42,0.9)"
                    }
                    stroke={
                      n.planned     ? "rgba(129,140,248,0.25)"
                      : hi && activeFilter ? clr
                      : "#334155"
                    }
                    strokeWidth={hi && activeFilter ? 1.5 : 1}
                    strokeDasharray={n.planned ? "4 3" : undefined}
                  />

                  {/* Icon */}
                  <svg x={n.x - 9} y={n.y - 9} width="18" height="18" viewBox="0 0 24 24"
                    fill="none"
                    stroke={hi && activeFilter ? clr : n.planned ? "#818cf8" : "#475569"}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={n.iconPath} />
                  </svg>

                  {/* Labels */}
                  <text x={n.x} y={n.y + NR + 14} textAnchor="middle"
                    fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif"
                    fill={hi && activeFilter ? "#e2e8f0" : "#64748b"}>
                    {n.label}
                  </text>
                  <text x={n.x} y={n.y + NR + 26} textAnchor="middle"
                    fontSize="8" fontFamily="monospace"
                    fill={hi && activeFilter ? `${clr}88` : "#2d3f55"}>
                    {n.sublabel}
                    {n.planned && (
                      <tspan fontSize="7.5" fill={hi && activeFilter ? "#818cf8" : "#3b4f6a"}> (planned)</tspan>
                    )}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        {/* Mobile fallback */}
        <div className="md:hidden mb-6 space-y-2">
          {(["CI/CD Pipeline", "Cytrix Detection"] as const).map(zone => (
            <div key={zone} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{zone}</p>
            </div>
          ))}
          <p className="text-xs text-slate-600 text-center pt-1">View on a wider screen for the full diagram.</p>
        </div>

        {/* Idle hint */}
        {!activeFilter && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-3 font-mono">
            select a flow above to trace it through the diagram
          </motion.p>
        )}

        {/* ── Flow detail panel ── */}
        <AnimatePresence mode="wait">
          {activeFilter && detail && filter && (
            <motion.div key={activeFilter}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}
              className="mt-8">

              <div className="rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-6"
                style={{ borderColor: `${filter.hex}28` }}>

                {/* Header */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: filter.hex }} />
                  <h3 className="text-lg font-bold text-slate-100">{detail.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-2xl">{detail.description}</p>

                {/* Steps grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.steps.map((step, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex gap-3">

                      {/* Step number */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold mt-0.5"
                        style={{ backgroundColor: `${filter.hex}18`, color: filter.hex, border: `1px solid ${filter.hex}30` }}>
                        {i + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-300">{step.label}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${filter.hex}14`,
                              color: filter.hex,
                              border: `1px solid ${filter.hex}30`,
                              opacity: step.planned ? 0.65 : 1,
                            }}>
                            {step.badge}
                            {step.planned && " · planned"}
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
