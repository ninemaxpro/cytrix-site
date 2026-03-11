"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Filters ───────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "shift-left",  label: "Shift Left",          color: "cyan"    },
  { id: "terraform",   label: "Terraform Guardrails", color: "emerald" },
  { id: "zero-trust",  label: "Zero Trust",           color: "violet"  },
  { id: "vuln-mgmt",   label: "Vulnerability Mgmt",   color: "amber"   },
  { id: "logging",     label: "Logging & Metrics",    color: "rose"    },
  { id: "future",      label: "In the Pipeline",      color: "indigo"  },
] as const;

type FilterId = typeof FILTERS[number]["id"];

// ─── Nodes ─────────────────────────────────────────────────────────────────
interface PipelineNode {
  id: string;
  label: string;
  sublabel: string;
  tags: FilterId[];
  icon: React.ReactNode;
  future?: boolean;
}

const nodes: PipelineNode[] = [
  // ── Lane 1: CI Pipeline ──
  {
    id: "dev", label: "Dev", sublabel: "Code commit",
    tags: ["shift-left"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  },
  {
    id: "github-actions", label: "GitHub Actions", sublabel: "CI pipeline",
    tags: ["shift-left", "logging", "future"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
  },
  {
    id: "ecr", label: "ECR", sublabel: "Image registry",
    tags: ["shift-left", "vuln-mgmt", "zero-trust"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
  // ── Lane 2: Infrastructure ──
  {
    id: "terraform", label: "Terraform", sublabel: "IaC modules",
    tags: ["terraform", "zero-trust", "shift-left"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>,
  },
  {
    id: "plan-apply", label: "Plan / Apply", sublabel: "IaC validation",
    tags: ["terraform", "zero-trust"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: "ecs", label: "ECS / VPC", sublabel: "Runtime infra",
    tags: ["zero-trust", "terraform", "logging"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg>,
  },
  // ── Lane 3: Runtime Monitoring ──
  {
    id: "cloudwatch", label: "CloudWatch", sublabel: "Logs & metrics",
    tags: ["logging"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: "eventbridge", label: "EventBridge", sublabel: "Scheduler",
    tags: ["logging", "vuln-mgmt"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  },
  {
    id: "prowler", label: "Prowler", sublabel: "CSPM scan",
    tags: ["vuln-mgmt", "logging"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  },
  // ── Output nodes ──
  {
    id: "cytrix", label: "Cytrix Engine", sublabel: "Detection pipeline",
    tags: ["vuln-mgmt", "logging", "future"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
  },
  {
    id: "output", label: "CLI / Grafana", sublabel: "Dashboards",
    tags: ["logging", "vuln-mgmt", "future"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  },
  {
    id: "notify", label: "SNS / Email", sublabel: "Alert delivery",
    tags: ["future"],
    future: true,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  },
];

// ─── Lane definitions ──────────────────────────────────────────────────────
interface LaneDef {
  label: string;
  nodeIds: string[];
  filters: Set<FilterId>;
  gates: string[]; // security gate label between node[i] and node[i+1]
}

const INPUT_LANES: LaneDef[] = [
  {
    label: "CI Pipeline",
    nodeIds: ["dev", "github-actions", "ecr"],
    filters: new Set<FilterId>(["shift-left", "vuln-mgmt", "zero-trust", "logging", "future"]),
    gates: ["git-secrets", "Trivy CI"],
  },
  {
    label: "Infrastructure",
    nodeIds: ["terraform", "plan-apply", "ecs"],
    filters: new Set<FilterId>(["terraform", "zero-trust", "shift-left", "logging"]),
    gates: ["tfsec", "IAM Scope"],
  },
  {
    label: "Runtime Monitor",
    nodeIds: ["cloudwatch", "eventbridge", "prowler"],
    filters: new Set<FilterId>(["logging", "vuln-mgmt"]),
    gates: ["VPC Flow", "15 min"],
  },
];

const OUTPUT_NODE_IDS = ["cytrix", "output", "notify"];

// Bracket geometry — 3 equal rows of 100px = 300px total
const LANE_H = 300;
const BRACKET_W = 52;
const MID_X = BRACKET_W / 2;
const LANE_CY = [LANE_H / 6, LANE_H / 2, (LANE_H * 5) / 6]; // 50, 150, 250

// Hex values for SVG strokes (Tailwind doesn't reach into SVG)
const COLOR_HEX: Record<string, string> = {
  cyan: "#22d3ee", emerald: "#34d399", violet: "#8b5cf6",
  amber: "#f59e0b", rose: "#f43f5e",  indigo: "#818cf8",
};

// ─── Detail panel content ──────────────────────────────────────────────────
interface FilterPoint { node: string; detail: string; badge: string; planned?: boolean; }
interface FilterDetail { title: string; subtitle?: string; points: FilterPoint[]; }

const filterDetails: Record<FilterId, FilterDetail> = {
  "shift-left": {
    title: "Shift Left Security",
    points: [
      { node: "Dev",            badge: "git-secrets",    detail: "Pre-commit hooks block secrets and credentials from ever reaching the repo." },
      { node: "GitHub Actions", badge: "tfsec",          detail: "tfsec scans all Terraform on every PR. HIGH/CRITICAL findings block the merge — policy failures never reach plan." },
      { node: "GitHub Actions", badge: "Trivy CI",       detail: "Trivy scans the Docker image after build. If CRITICAL CVEs exist, the push to ECR is blocked." },
      { node: "Terraform",      badge: "Policy-as-Code", detail: "tfsec integrated as a required CI step — no terraform plan runs unless IaC scan passes clean." },
    ],
  },
  "terraform": {
    title: "Terraform Guardrails",
    points: [
      { node: "Terraform",    badge: "Hardened Modules",  detail: "Modules enforce encryption-at-rest, deny public S3 ACLs, and scope IAM roles to least privilege by default." },
      { node: "Plan / Apply", badge: "Remote State",      detail: "State in S3 with DynamoDB lock, versioning, and SSE-S3. No local state files — drift tracked centrally." },
      { node: "ECS / VPC",    badge: "Network Isolation", detail: "VPC module provisions private-only subnets for ECS tasks. Public subnets are ALB/NAT only — no direct workload exposure." },
      { node: "ECR",          badge: "Immutable Tags",    detail: "ECR repo created via Terraform with immutable image tags and scan-on-push enabled. Tag overwrite is denied." },
    ],
  },
  "zero-trust": {
    title: "Zero Trust Architecture",
    points: [
      { node: "Terraform",    badge: "IAM Least Priv",     detail: "All roles use condition keys (aws:SourceVpc, aws:CalledVia). No wildcard resources. Roles scoped to specific services." },
      { node: "ECR",          badge: "Private Registry",   detail: "ECR access requires explicit IAM binding. No public repos. Cross-account access blocked by resource policy." },
      { node: "Plan / Apply", badge: "Apply Gate",         detail: "Terraform apply only proceeds after tfsec passes clean. IAM role used for apply is scoped to the minimum required actions — no AdministratorAccess." },
      { node: "ECS / VPC",    badge: "Task Role Isolation",detail: "Task role and task execution role are separate. ECS tasks have no public IPs. Security groups are deny-all inbound by default — ALB is the only ingress point." },
    ],
  },
  "vuln-mgmt": {
    title: "Vulnerability Management",
    points: [
      { node: "ECR",          badge: "Build-time Scan", detail: "ECR scan-on-push catches OS and package CVEs at build time. CRITICAL findings block deployment via CI gate." },
      { node: "Prowler",      badge: "CSPM",            detail: "Prowler runs 200+ AWS security checks every 15 min via EventBridge. Covers IAM, S3, EC2, networking, and encryption posture across the full account." },
      { node: "Cytrix Engine",badge: "EPSS + KEV",      detail: "Each finding enriched with CISA KEV and OSV.dev data. EPSS score surfaces exploitability, not just severity. KEV match auto-elevates priority." },
      { node: "CLI / Grafana",badge: "Risk Scoring",    detail: "Weighted formula (CVSS + EPSS + exposure + blast radius + KEV match) produces P1–P4 tiers. P1s auto-trigger CloudTrail correlation." },
    ],
  },
  "logging": {
    title: "Logging & Metrics",
    points: [
      { node: "GitHub Actions", badge: "CI Audit Log",   detail: "tfsec and Trivy results posted as PR comments. Full CI execution history retained in GitHub for audit trail." },
      { node: "CloudWatch",     badge: "Log Retention",  detail: "ECS container logs stream to CloudWatch with 90-day retention. VPC Flow Logs on all subnets captured and fed into Cytrix for network correlation." },
      { node: "EventBridge",    badge: "Scan Cadence",   detail: "EventBridge rule triggers Prowler and Trivy every 15 minutes across all monitored resources. Serverless — no cron instances required." },
      { node: "Cytrix Engine",  badge: "CloudTrail",     detail: "All Lambda invocations, S3 writes, and EventBridge events logged. CloudTrail enabled multi-region for full API-level audit coverage." },
    ],
  },
  "future": {
    title: "In the Pipeline",
    subtitle: "Planned features — architecture defined, not yet deployed",
    points: [
      {
        node: "GitHub Actions", badge: "CI Adapter", planned: true,
        detail: "tfsec and Trivy findings from every PR flow into Cytrix as first-class findings. Shift-left detections score and rank alongside runtime scans — CI regressions become P3/P4 findings.",
      },
      {
        node: "Cytrix Engine", badge: "Lambda 5 · Notifier", planned: true,
        detail: "Fifth Lambda triggered by correlated/ writes. Reads the CloudTrail attack hypothesis, attaches the top guardrail recommendation and Terraform snippet, publishes to SNS within 30s of correlation.",
      },
      {
        node: "SNS / Email", badge: "Alert Delivery", planned: true,
        detail: "aws_sns_topic + email subscription via Terraform variable. P1/P2 alerts land in the security inbox with score, blast radius, CloudTrail timeline, and one-click remediation — loop closed.",
      },
      {
        node: "CLI / Grafana", badge: "Posture Dashboard", planned: true,
        detail: "Tag-driven compliance view mapping resources to Zero Trust, Least Privilege, and Data Protection concepts. Shows per-concept coverage — which resources are compliant and which are exposed.",
      },
    ],
  },
};

// ─── Color palette ──────────────────────────────────────────────────────────
const colorMap = {
  cyan:    { btn: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",         active: "border-cyan-400 bg-cyan-500/20 text-cyan-300",         node: "border-cyan-400 bg-cyan-500/15 shadow-cyan-500/40",         dot: "bg-cyan-400",    ring: "bg-cyan-400",    line: "bg-cyan-400",    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",       heading: "text-cyan-300"    },
  emerald: { btn: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", active: "border-emerald-400 bg-emerald-500/20 text-emerald-300", node: "border-emerald-400 bg-emerald-500/15 shadow-emerald-500/40", dot: "bg-emerald-400", ring: "bg-emerald-400", line: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", heading: "text-emerald-300" },
  violet:  { btn: "border-violet-500/40 text-violet-400 bg-violet-500/10",   active: "border-violet-400 bg-violet-500/20 text-violet-300",   node: "border-violet-400 bg-violet-500/15 shadow-violet-500/40",   dot: "bg-violet-400",  ring: "bg-violet-400",  line: "bg-violet-400",  badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",  heading: "text-violet-300"  },
  amber:   { btn: "border-amber-500/40 text-amber-400 bg-amber-500/10",       active: "border-amber-400 bg-amber-500/20 text-amber-300",       node: "border-amber-400 bg-amber-500/15 shadow-amber-500/40",       dot: "bg-amber-400",   ring: "bg-amber-400",   line: "bg-amber-400",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",     heading: "text-amber-300"   },
  rose:    { btn: "border-rose-500/40 text-rose-400 bg-rose-500/10",          active: "border-rose-400 bg-rose-500/20 text-rose-300",          node: "border-rose-400 bg-rose-500/15 shadow-rose-500/40",          dot: "bg-rose-400",    ring: "bg-rose-400",    line: "bg-rose-400",    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",        heading: "text-rose-300"    },
  indigo:  { btn: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",    active: "border-indigo-400 bg-indigo-500/20 text-indigo-300",    node: "border-indigo-400 bg-indigo-500/15 shadow-indigo-500/40",    dot: "bg-indigo-400",  ring: "bg-indigo-400",  line: "bg-indigo-400",  badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",  heading: "text-indigo-300"  },
};

// ─── Inline flow connector with optional security gate badge ──────────────
function FlowConnector({ active, c, dashed, gate }: {
  active: boolean;
  c: typeof colorMap[keyof typeof colorMap] | null;
  dashed?: boolean;
  gate?: string;
}) {
  const PACKETS = 2;
  return (
    <div className="flex-1 relative flex items-center h-[4.5rem] min-w-0" style={{ minWidth: "1rem" }}>
      <div
        className={`w-full h-px transition-all duration-300 ${active && c ? `${c.line} opacity-50` : "bg-slate-700/30"}`}
        style={dashed && !active ? { backgroundImage: "repeating-linear-gradient(90deg,rgba(99,102,241,0.25) 0,rgba(99,102,241,0.25) 6px,transparent 6px,transparent 12px)", background: "none", height: 1 } : undefined}
      />
      <div
        className={`absolute right-0 transition-colors duration-300 ${active && c ? c.dot : dashed ? "bg-indigo-500/25" : "bg-slate-700/40"}`}
        style={{ width: 5, height: 5, clipPath: "polygon(0 20%, 100% 50%, 0 80%)" }}
      />
      {active && c && Array.from({ length: PACKETS }).map((_, i) => (
        <div key={i} className={`absolute w-1.5 h-1.5 rounded-full ${c.dot} animate-travel-packet`}
          style={{ animationDelay: `${i * 0.7}s`, top: "50%", transform: "translateY(-50%)", boxShadow: "0 0 6px currentColor" }}
        />
      ))}
      {gate && (
        <div className="absolute left-1/2 z-20 pointer-events-none"
          style={{ top: "50%", transform: "translate(-50%, -50%)" }}>
          <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-sm border transition-all duration-300 whitespace-nowrap ${
            active && c
              ? `${c.badge} shadow-sm`
              : "bg-slate-950 border-slate-700/40 text-slate-600"
          }`}>
            {gate}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── SVG convergence bracket ──────────────────────────────────────────────
function ConvergenceBracket({ lane1Active, lane2Active, lane3Active, colorName }: {
  lane1Active: boolean;
  lane2Active: boolean;
  lane3Active: boolean;
  colorName: string | null;
}) {
  const anyActive = lane1Active || lane2Active || lane3Active;
  const activeStroke = colorName ? COLOR_HEX[colorName] : "transparent";
  const idleStroke = "rgb(51,65,85)";

  const seg = (active: boolean) => ({
    stroke: active ? activeStroke : idleStroke,
    strokeWidth: 1,
    strokeOpacity: active ? 0.65 : 0.35,
    transition: "stroke 0.3s ease, stroke-opacity 0.3s ease",
  });

  return (
    <svg width={BRACKET_W} height={LANE_H} viewBox={`0 0 ${BRACKET_W} ${LANE_H}`}
      className="flex-shrink-0 self-stretch" style={{ overflow: "visible" }}>
      <line x1={0} y1={LANE_CY[0]} x2={MID_X} y2={LANE_CY[0]} style={seg(lane1Active)} />
      <line x1={0} y1={LANE_CY[1]} x2={MID_X} y2={LANE_CY[1]} style={seg(lane2Active)} />
      <line x1={0} y1={LANE_CY[2]} x2={MID_X} y2={LANE_CY[2]} style={seg(lane3Active)} />
      <line x1={MID_X} y1={LANE_CY[0]} x2={MID_X} y2={LANE_CY[2]} style={seg(anyActive)} />
      <line x1={MID_X} y1={LANE_CY[1]} x2={BRACKET_W} y2={LANE_CY[1]} style={seg(anyActive)} />
      {anyActive && colorName && (
        <polygon
          points={`${BRACKET_W - 6},${LANE_CY[1] - 3} ${BRACKET_W},${LANE_CY[1]} ${BRACKET_W - 6},${LANE_CY[1] + 3}`}
          fill={activeStroke} opacity={0.7}
        />
      )}
    </svg>
  );
}

// ─── Single pipeline node ──────────────────────────────────────────────────
function PipelineNodeEl({
  node, highlighted, activeColor, activeFilter,
}: {
  node: PipelineNode;
  highlighted: boolean;
  activeColor: typeof colorMap[keyof typeof colorMap] | null;
  activeFilter?: FilterId | null;
}) {
  const isFutureNode = node.future === true;
  const showFutureGhost = isFutureNode && !highlighted;

  return (
    <div className="flex flex-col items-center text-center relative flex-shrink-0" style={{ width: "4.5rem" }}>
      {highlighted && activeColor && (
        <>
          <div className={`absolute rounded-2xl ${activeColor.ring} opacity-0 animate-node-ring`} style={{ width: "4.5rem", height: "4.5rem", top: 0 }} />
          <div className={`absolute rounded-2xl ${activeColor.ring} opacity-0 animate-node-ring`} style={{ width: "4.5rem", height: "4.5rem", top: 0, animationDelay: "0.8s" }} />
        </>
      )}
      <motion.div
        animate={{ opacity: highlighted ? 1 : showFutureGhost ? 0.3 : 0.15, scale: highlighted ? 1 : 0.95 }}
        transition={{ duration: 0.25 }}
        className={`relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
          highlighted && activeColor ? `${activeColor.node} shadow-lg`
          : showFutureGhost ? "border-indigo-500/25 bg-indigo-500/5"
          : "border-slate-700/60 bg-slate-900/80 text-slate-500"
        }`}
        style={showFutureGhost ? { borderStyle: "dashed" } : undefined}
      >
        <span className={highlighted && activeColor ? activeColor.heading : showFutureGhost ? "text-indigo-400/40" : "text-slate-500"}>
          {node.icon}
        </span>
      </motion.div>
      <motion.p animate={{ opacity: highlighted ? 1 : showFutureGhost ? 0.35 : 0.15 }} transition={{ duration: 0.25 }}
        className="mt-2 text-xs font-semibold text-slate-200 leading-tight">{node.label}</motion.p>
      <motion.p animate={{ opacity: highlighted ? 0.6 : showFutureGhost ? 0.25 : 0.1 }} transition={{ duration: 0.25 }}
        className={`text-[10px] mt-0.5 leading-tight ${showFutureGhost ? "text-indigo-400/50" : "text-slate-500"}`}>{node.sublabel}</motion.p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const activeFilterDef = FILTERS.find(f => f.id === activeFilter);
  const activeColor = activeFilterDef ? colorMap[activeFilterDef.color] : null;

  const laneIsActive = (i: number) => !!activeFilter && INPUT_LANES[i].filters.has(activeFilter);
  const anyLaneActive = INPUT_LANES.some((_, i) => laneIsActive(i));

  const nodeById = (id: string) => nodes.find(n => n.id === id)!;
  const isHighlighted = (node: PipelineNode) => !activeFilter || node.tags.includes(activeFilter);

  const toggle = (id: FilterId) => setActiveFilter(p => p === id ? null : id);
  const detail = activeFilter ? filterDetails[activeFilter] : null;
  const isFutureTab = activeFilter === "future";

  const outputNodes = OUTPUT_NODE_IDS.map(nodeById);

  return (
    <section id="flow" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Security at <span className="gradient-text">Every Phase</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From first commit to live detection. Click a layer to see where it is enforced.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-14">
          {FILTERS.map(f => {
            const c = colorMap[f.color];
            const isActive = activeFilter === f.id;
            return (
              <button key={f.id} onClick={() => toggle(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${isActive ? c.active : c.btn} ${f.id === "future" ? "border-dashed" : ""}`}>
                {f.id === "future" && <span className="mr-1.5 opacity-60">◎</span>}
                {f.label}
              </button>
            );
          })}
        </motion.div>

        {/* ── Pipeline diagram ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>

          {/* Desktop: 3-lane convergence layout */}
          <div className="hidden md:grid px-4" style={{ gridTemplateColumns: `1fr ${BRACKET_W}px auto`, alignItems: "stretch" }}>

            {/* Left: 3 input lanes */}
            <div className="grid grid-rows-3" style={{ height: `${LANE_H}px` }}>
              {INPUT_LANES.map((lane, laneIdx) => {
                const active = laneIsActive(laneIdx);
                const laneNds = lane.nodeIds.map(nodeById);
                return (
                  <div key={lane.label} className="flex items-center">
                    {laneNds.map((node, i) => (
                      <Fragment key={node.id}>
                        <PipelineNodeEl node={node} highlighted={isHighlighted(node)} activeColor={activeColor} activeFilter={activeFilter} />
                        {i < laneNds.length - 1 && (
                          <FlowConnector
                            active={active && isHighlighted(node) && isHighlighted(laneNds[i + 1])}
                            c={activeColor}
                            gate={lane.gates[i]}
                          />
                        )}
                      </Fragment>
                    ))}
                    {/* Trailing line extending to convergence bracket */}
                    <FlowConnector active={active} c={activeColor} />
                  </div>
                );
              })}
            </div>

            {/* Center: convergence bracket SVG */}
            <ConvergenceBracket
              lane1Active={laneIsActive(0)}
              lane2Active={laneIsActive(1)}
              lane3Active={laneIsActive(2)}
              colorName={activeFilterDef?.color ?? null}
            />

            {/* Right: output lane */}
            <div className="flex items-center self-center">
              {outputNodes.map((node, i) => {
                const nextNode = outputNodes[i + 1];
                return (
                  <Fragment key={node.id}>
                    <PipelineNodeEl node={node} highlighted={isHighlighted(node)} activeColor={activeColor} activeFilter={activeFilter} />
                    {nextNode && (
                      <FlowConnector
                        active={anyLaneActive && isHighlighted(node) && isHighlighted(nextNode)}
                        c={activeColor}
                        dashed={node.future || nextNode.future}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {/* Mobile: flat 2-col grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {nodes.map(node => (
              <PipelineNodeEl key={node.id} node={node} highlighted={isHighlighted(node)} activeColor={activeColor} activeFilter={activeFilter} />
            ))}
          </div>
        </motion.div>

        {/* Lane labels (desktop only, shown when idle) */}
        {!activeFilter && (
          <div className="hidden md:grid px-4 mt-2" style={{ gridTemplateColumns: `1fr ${BRACKET_W}px auto` }}>
            <div className="grid grid-rows-3" style={{ height: "54px" }}>
              {[
                { label: "CI Pipeline",      color: "text-cyan-700" },
                { label: "Infrastructure",   color: "text-emerald-700" },
                { label: "Runtime Monitor",  color: "text-violet-700" },
              ].map(({ label, color }) => (
                <div key={label} className={`flex items-center text-[10px] font-mono ${color} opacity-60`}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {activeFilter && detail && activeColor && (
            <motion.div key={activeFilter} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }} className="mt-10">
              <div
                className={`rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-6 ${isFutureTab ? "border-dashed" : ""}`}
                style={{ borderColor: isFutureTab ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg font-bold ${activeColor.heading}`}>{detail.title}</h3>
                  {isFutureTab && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-dashed border-indigo-500/30 text-indigo-400/70 bg-indigo-500/10">
                      planned
                    </span>
                  )}
                </div>
                {detail.subtitle && <p className="text-xs text-slate-500 font-mono mb-5">{detail.subtitle}</p>}
                {!detail.subtitle && <div className="mb-5" />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {detail.points.map((point, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex gap-3">
                      <div
                        className={`w-0.5 rounded-full flex-shrink-0 self-stretch ${activeColor.dot} ${point.planned ? "opacity-25" : "opacity-50"}`}
                        style={point.planned ? { backgroundImage: "repeating-linear-gradient(180deg,currentColor 0,currentColor 4px,transparent 4px,transparent 8px)", background: "none", width: 2 } : undefined}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500">{point.node}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${activeColor.badge} ${point.planned ? "border-dashed opacity-75" : ""}`}>
                            {point.badge}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${point.planned ? "text-slate-400" : "text-slate-300"}`}>
                          {point.detail}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle hint */}
        {!activeFilter && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-6 font-mono">
            select a security layer above to highlight where it is enforced
          </motion.p>
        )}
      </div>
    </section>
  );
}
