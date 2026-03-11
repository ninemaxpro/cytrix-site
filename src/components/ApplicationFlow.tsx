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

// ── Category colours (matching Architecture.tsx palette) ───────────────────────
const CAT: Record<string, { bg: string; border: string; text: string }> = {
  cicd:    { bg: "rgba(8,51,68,0.75)",   border: "#22d3ee", text: "#7dd3fc" },
  trigger: { bg: "rgba(66,32,6,0.75)",   border: "#d97706", text: "#fbbf24" },
  lambda:  { bg: "rgba(4,47,46,0.75)",   border: "#0d9488", text: "#2dd4bf" },
  storage: { bg: "rgba(12,26,61,0.75)",  border: "#3b82f6", text: "#60a5fa" },
  output:  { bg: "rgba(26,5,37,0.75)",   border: "#a855f7", text: "#c084fc" },
};

const DIM_BG     = "rgba(15,23,42,0.5)";
const DIM_BORDER = "#1e293b";

// ── Card dimensions ────────────────────────────────────────────────────────────
const CW = 155, CH = 68;   // card width / height
const NW = CW / 2;          // half-width  (78)
const NH = CH / 2;          // half-height (34)

// ── Node & edge types ─────────────────────────────────────────────────────────
type Side = "right" | "left" | "bottom" | "top";

interface GNode {
  id: string; label: string; sublabel: string; detail: string;
  cx: number; cy: number;
  tags: FilterId[];
  category: string;
  issue?: string;
  planned?: boolean;
}

interface GEdge {
  id: string; from: string; to: string;
  tags: FilterId[];
  fSide: Side; tSide: Side;
  style?: "dashed";   // for cross-lane connector
}

// ── Nodes ─────────────────────────────────────────────────────────────────────
// Canvas: 1100 × 455
// CI/CD row       cy = 95
// Cytrix Lambda   cy = 255
// Cytrix S3       cy = 375
// Outputs         cx = 990  (cy = 255 / 375)

const NODES: GNode[] = [
  // ── CI/CD Pipeline (top row) ────────────────────────────────────────────────
  { id: "dev",       label: "Dev Laptop",    sublabel: "pre-commit hook",        detail: "git-secrets on every commit",
    cx: 75,  cy: 95,  tags: ["cicd"],   category: "cicd" },
  { id: "github",    label: "GitHub",        sublabel: "source repo",            detail: "branch protection + secret scan",
    cx: 245, cy: 95,  tags: ["cicd"],   category: "cicd", issue: "secret leak?" },
  { id: "ci",        label: "GH Actions",    sublabel: "CI checks",              detail: "tfsec · bandit · pip-audit",
    cx: 415, cy: 95,  tags: ["cicd"],   category: "cicd" },
  { id: "tfplan",    label: "TF Plan",       sublabel: "validate + tfsec gate",  detail: "hardened modules enforced",
    cx: 585, cy: 95,  tags: ["cicd"],   category: "cicd" },
  { id: "tfapply",   label: "TF Apply",      sublabel: "modules/infra",          detail: "remote state · DynamoDB lock",
    cx: 755, cy: 95,  tags: ["cicd"],   category: "cicd" },
  { id: "awsapi",    label: "AWS APIs",      sublabel: "resources provisioned",  detail: "IAM + S3 + Lambda + EventBridge",
    cx: 925, cy: 95,  tags: ["cicd"],   category: "cicd" },

  // ── Cytrix Lambda row ────────────────────────────────────────────────────────
  { id: "eventbridge", label: "EventBridge", sublabel: "rate(15 min)",           detail: "Schedule trigger",
    cx: 75,  cy: 255, tags: ["cytrix"], category: "trigger" },
  { id: "collector",   label: "Collector",   sublabel: "Lambda / 256 MB",        detail: "Prowler + Trivy adapters",
    cx: 245, cy: 255, tags: ["cytrix"], category: "lambda" },
  { id: "enricher",    label: "Enrichment",  sublabel: "Lambda / 512 MB",        detail: "KEV + OSV + 6 passes",
    cx: 430, cy: 255, tags: ["cytrix"], category: "lambda" },
  { id: "scorer",      label: "Scorer",      sublabel: "Lambda / 256 MB",        detail: "Weighted formula → P1–P4",
    cx: 615, cy: 255, tags: ["cytrix"], category: "lambda" },
  { id: "correlator",  label: "Correlator",  sublabel: "Lambda / 512 MB",        detail: "CloudTrail investigation",
    cx: 800, cy: 255, tags: ["cytrix"], category: "lambda" },

  // ── Cytrix S3 row (below respective Lambda) ──────────────────────────────────
  { id: "s3raw",       label: "S3 raw/",       sublabel: "Per-tool batches",     detail: "s3://cytrix-.../raw/",
    cx: 245, cy: 375, tags: ["cytrix"], category: "storage" },
  { id: "s3enriched",  label: "S3 enriched/",  sublabel: "With context",         detail: "s3://cytrix-.../enriched/",
    cx: 430, cy: 375, tags: ["cytrix"], category: "storage" },
  { id: "s3scored",    label: "S3 scored/",     sublabel: "With tiers",          detail: "s3://cytrix-.../scored/",
    cx: 615, cy: 375, tags: ["cytrix"], category: "storage" },
  { id: "s3correlated",label: "S3 correlated/", sublabel: "Attack stories",      detail: "s3://cytrix-.../correlated/",
    cx: 800, cy: 375, tags: ["cytrix"], category: "storage" },

  // ── Outputs (right column) ────────────────────────────────────────────────────
  { id: "cli",         label: "Cytrix CLI",    sublabel: "Dashboard + Menu",      detail: "Findings + Guardrails + IR",
    cx: 990, cy: 255, tags: ["cytrix"], category: "output" },
  { id: "grafana",     label: "Grafana",       sublabel: "Dashboards",            detail: "Security + Pipeline",
    cx: 990, cy: 375, tags: ["cytrix"], category: "output" },
];

// ── Edges ─────────────────────────────────────────────────────────────────────
const EDGES: GEdge[] = [
  // CI/CD horizontal chain
  { id: "dev-gh",    from: "dev",          to: "github",       tags: ["cicd"],   fSide: "right",  tSide: "left"   },
  { id: "gh-ci",     from: "github",       to: "ci",           tags: ["cicd"],   fSide: "right",  tSide: "left"   },
  { id: "ci-tfp",    from: "ci",           to: "tfplan",       tags: ["cicd"],   fSide: "right",  tSide: "left"   },
  { id: "tfp-tfap",  from: "tfplan",       to: "tfapply",      tags: ["cicd"],   fSide: "right",  tSide: "left"   },
  { id: "tfap-api",  from: "tfapply",      to: "awsapi",       tags: ["cicd"],   fSide: "right",  tSide: "left"   },

  // Cytrix: EventBridge triggers Collector
  { id: "eb-col",    from: "eventbridge",  to: "collector",    tags: ["cytrix"], fSide: "right",  tSide: "left"   },

  // Lambda → S3 (vertical down)
  { id: "col-s3r",   from: "collector",    to: "s3raw",        tags: ["cytrix"], fSide: "bottom", tSide: "top"    },
  { id: "enr-s3e",   from: "enricher",     to: "s3enriched",   tags: ["cytrix"], fSide: "bottom", tSide: "top"    },
  { id: "scr-s3s",   from: "scorer",       to: "s3scored",     tags: ["cytrix"], fSide: "bottom", tSide: "top"    },
  { id: "cor-s3c",   from: "correlator",   to: "s3correlated", tags: ["cytrix"], fSide: "bottom", tSide: "top"    },

  // S3 → next Lambda (diagonal up-right: right of S3 → left of Lambda)
  { id: "s3r-enr",   from: "s3raw",        to: "enricher",     tags: ["cytrix"], fSide: "right",  tSide: "left"   },
  { id: "s3e-scr",   from: "s3enriched",   to: "scorer",       tags: ["cytrix"], fSide: "right",  tSide: "left"   },
  { id: "s3s-cor",   from: "s3scored",     to: "correlator",   tags: ["cytrix"], fSide: "right",  tSide: "left"   },

  // Outputs
  { id: "s3c-cli",   from: "s3correlated", to: "cli",          tags: ["cytrix"], fSide: "right",  tSide: "left"   },
  { id: "s3s-cli",   from: "s3scored",     to: "cli",          tags: ["cytrix"], fSide: "right",  tSide: "left"   },
  { id: "s3c-graf",  from: "s3correlated", to: "grafana",      tags: ["cytrix"], fSide: "right",  tSide: "left"   },
];

// ── Flow detail steps ─────────────────────────────────────────────────────────
interface FlowStep { label: string; badge: string; detail: string; planned?: boolean }
interface FlowDetail { title: string; description: string; steps: FlowStep[] }

const FLOW_DETAILS: Record<FilterId, FlowDetail> = {
  cicd: {
    title: "CI/CD Security Pipeline",
    description: "Every commit flows through automated security gates before a single AWS resource is created. Guardrails are wired into the pipeline - not added after.",
    steps: [
      { label: "Dev Laptop",  badge: "pre-commit",                 detail: "git-secrets hook scans every commit for credentials and keys before push." },
      { label: "GitHub",      badge: "branch protection",          detail: "Branch protection requires CI pass before merge. No direct pushes to main." },
      { label: "GH Actions",  badge: "tfsec + Bandit + pip-audit", detail: "tfsec scans IaC, Bandit runs SAST on Lambda code, pip-audit checks Python deps for CVEs. HIGH findings block merge." },
      { label: "TF Plan",     badge: "validate + tfsec gate",      detail: "terraform validate + tfsec on plan output. Hardened modules enforce encryption, scoped roles, no public S3 - by default." },
      { label: "TF Apply",    badge: "modules/infra",              detail: "Runs locally with remote state in S3 + DynamoDB lock. Calls AWS APIs to provision all resources." },
      { label: "AWS APIs",    badge: "resources provisioned",      detail: "Terraform calls AWS APIs to create IAM roles, S3 stages, Lambda functions, and EventBridge schedule. CI/CD flow ends here." },
    ],
  },
  cytrix: {
    title: "Cytrix Detection Pipeline",
    description: "EventBridge fires every 15 minutes. Raw findings from Prowler and Trivy flow through four Lambda stages - collect, enrich, score, correlate - and land in Grafana and CLI.",
    steps: [
      { label: "EventBridge",   badge: "rate(15 min)",        detail: "Scheduled rule triggers Collector Lambda on a fixed cadence. No manual intervention." },
      { label: "Collector",     badge: "S3 raw/",             detail: "Runs Prowler + Trivy adapters. Writes raw per-tool batches to S3 raw/ prefix." },
      { label: "Enrichment",    badge: "S3 enriched/",        detail: "Adds KEV and OSV context in 6 enrichment passes. Writes to S3 enriched/." },
      { label: "Scorer",        badge: "S3 scored/",          detail: "Weighted formula produces P1–P4 priority tiers. Writes to S3 scored/." },
      { label: "Correlator",    badge: "S3 correlated/",      detail: "CloudTrail investigation groups findings into attack stories. Writes to S3 correlated/." },
      { label: "CLI + Grafana", badge: "output",              detail: "Cytrix CLI serves findings, guardrails, and IR playbooks. Grafana dashboards visualise security + pipeline metrics." },
    ],
  },
};

// ── SVG path helper ────────────────────────────────────────────────────────────
const nodeById = (id: string) => NODES.find(n => n.id === id)!;

function edgePath(e: GEdge): string {
  const f = nodeById(e.from);
  const t = nodeById(e.to);

  const sx = e.fSide === "right" ? f.cx + NW : e.fSide === "left" ? f.cx - NW : f.cx;
  const sy = e.fSide === "bottom" ? f.cy + NH : e.fSide === "top"  ? f.cy - NH : f.cy;
  const ex = e.tSide === "left"   ? t.cx - NW : e.tSide === "right" ? t.cx + NW : t.cx;
  const ey = e.tSide === "top"    ? t.cy - NH : e.tSide === "bottom"? t.cy + NH : t.cy;

  const dx = ex - sx, dy = ey - sy;

  if (Math.abs(dx) < 4) return `M ${sx} ${sy} L ${ex} ${ey}`;  // vertical
  if (Math.abs(dy) < 4) return `M ${sx} ${sy} L ${ex} ${ey}`;  // horizontal

  // S-curve bezier
  if (Math.abs(dx) >= Math.abs(dy)) {
    const mid = (sx + ex) / 2;
    return `M ${sx} ${sy} C ${mid} ${sy}, ${mid} ${ey}, ${ex} ${ey}`;
  }
  const mid = (sy + ey) / 2;
  return `M ${sx} ${sy} C ${sx} ${mid}, ${ex} ${mid}, ${ex} ${ey}`;
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
            From first commit to correlated findings. Select a flow to trace it through the full pipeline.
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

          <svg viewBox="0 0 1100 455" className="w-full" style={{ minWidth: 700 }}>
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
            <rect x="10" y="28" width="1080" height="105" rx="8"
              fill={activeFilter === "cicd" ? "rgba(34,211,238,0.04)" : "rgba(30,41,59,0.45)"}
              stroke={activeFilter === "cicd" ? "rgba(34,211,238,0.20)" : "rgba(51,65,85,0.30)"}
              strokeWidth="1" style={{ transition: "all 0.3s" }} />
            <rect x="10" y="215" width="1080" height="225" rx="8"
              fill={activeFilter === "cytrix" ? "rgba(45,212,191,0.04)" : "rgba(30,41,59,0.45)"}
              stroke={activeFilter === "cytrix" ? "rgba(45,212,191,0.20)" : "rgba(51,65,85,0.30)"}
              strokeWidth="1" style={{ transition: "all 0.3s" }} />

            {/* Lane labels */}
            <text x="26" y="46" fontSize="8.5" fontFamily="monospace" fill="#334155" letterSpacing="1.5">CI/CD PIPELINE</text>
            <text x="26" y="234" fontSize="8.5" fontFamily="monospace" fill="#334155" letterSpacing="1.5">CYTRIX DETECTION</text>

            {/* Separator annotation */}
            <text x="550" y="200" textAnchor="middle" fontSize="8" fontFamily="monospace"
              fill={activeFilter === "cicd" ? "rgba(34,211,238,0.5)" : "#1e293b"}>
              ↓ TF Apply provisions these resources
            </text>

            {/* Edges */}
            {EDGES.map(e => {
              const act = edgeAct(e);
              const d   = edgePath(e);
              return (
                <path key={e.id} d={d} fill="none"
                  stroke={act ? filter!.hex : "#1e3a4a"}
                  strokeWidth={act ? 1.5 : 1}
                  strokeOpacity={act ? 0.80 : 0.55}
                  strokeDasharray={act ? "7 5" : e.style === "dashed" ? "4 4" : undefined}
                  markerEnd={act ? "url(#arr-act)" : "url(#arr-def)"}
                  style={act ? { animation: "dash-march 0.85s linear infinite" } : undefined}
                />
              );
            })}

            {/* Nodes */}
            {NODES.map(n => {
              const hi      = nodeHi(n);
              const cat     = CAT[n.category];
              const guarded = hi && !!activeFilter && !!n.issue;

              return (
                <motion.g key={n.id}
                  animate={{ opacity: hi ? 1 : 0.15 }}
                  transition={{ duration: 0.22 }}>

                  {/* Issue badge above card */}
                  {n.issue && (
                    <g>
                      <rect x={n.cx - 30} y={n.cy - NH - 20} width={60} height={14} rx={7}
                        fill={guarded ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.10)"}
                        stroke={guarded ? "rgba(34,197,94,0.35)" : "rgba(251,191,36,0.30)"}
                        strokeWidth="0.75" />
                      <text x={n.cx} y={n.cy - NH - 10} textAnchor="middle"
                        fontSize="7.5" fontFamily="monospace"
                        fill={guarded ? "#4ade80" : "#fbbf24"}>
                        {guarded ? "✓ guarded" : n.issue}
                      </text>
                    </g>
                  )}

                  {/* Card background */}
                  <rect
                    x={n.cx - NW} y={n.cy - NH}
                    width={CW} height={CH} rx="8"
                    fill={hi ? cat.bg : DIM_BG}
                    stroke={hi ? cat.border : DIM_BORDER}
                    strokeWidth={hi && activeFilter ? 1.5 : 1}
                    strokeDasharray={n.planned ? "4 3" : undefined}
                    style={{ transition: "fill 0.25s, stroke 0.25s" }}
                  />

                  {/* Card text */}
                  <text x={n.cx} y={n.cy - 14} textAnchor="middle"
                    fontSize="11.5" fontWeight="700" fontFamily="system-ui, sans-serif"
                    fill={hi ? cat.text : "#334155"} style={{ transition: "fill 0.25s" }}>
                    {n.label}
                    {n.planned && (
                      <tspan fontSize="8" fontFamily="monospace" opacity="0.6"> (planned)</tspan>
                    )}
                  </text>
                  <text x={n.cx} y={n.cy + 2} textAnchor="middle"
                    fontSize="9.5" fontFamily="system-ui, sans-serif"
                    fill={hi ? cat.text : "#334155"} opacity={hi ? 0.7 : 0.4}
                    style={{ transition: "fill 0.25s" }}>
                    {n.sublabel}
                  </text>
                  <text x={n.cx} y={n.cy + 16} textAnchor="middle"
                    fontSize="8" fontFamily="monospace"
                    fill={hi ? cat.text : "#334155"} opacity={hi ? 0.45 : 0.3}
                    style={{ transition: "fill 0.25s" }}>
                    {n.detail}
                  </text>
                </motion.g>
              );
            })}

            {/* Legend */}
            {[
              { label: "CI/CD",    color: "#22d3ee" },
              { label: "Trigger",  color: "#d97706" },
              { label: "Lambda",   color: "#0d9488" },
              { label: "Storage",  color: "#3b82f6" },
              { label: "Output",   color: "#a855f7" },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${260 + i * 130}, 440)`}>
                <rect width="10" height="10" rx="2" fill={item.color} opacity="0.7" />
                <text x="15" y="9" fontSize="9" fontFamily="monospace" fill="#475569">{item.label}</text>
              </g>
            ))}
          </svg>
        </motion.div>

        {/* Mobile fallback */}
        <div className="md:hidden mb-6 space-y-2">
          {["CI/CD Pipeline", "Cytrix Detection"].map(zone => (
            <div key={zone} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{zone}</p>
            </div>
          ))}
          <p className="text-xs text-slate-600 text-center pt-1">View on a wider screen for the full diagram.</p>
        </div>

        {/* Idle hint */}
        {!activeFilter && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-2 font-mono">
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
