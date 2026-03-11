"use client";

import { useState } from "react";
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
    id: "terraform", label: "Terraform", sublabel: "IaC deploy",
    tags: ["terraform", "zero-trust", "shift-left"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>,
  },
  {
    id: "ecr", label: "ECR", sublabel: "Image registry",
    tags: ["shift-left", "vuln-mgmt", "zero-trust"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
  {
    id: "ecs", label: "ECS / VPC", sublabel: "Runtime infra",
    tags: ["zero-trust", "terraform", "logging"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg>,
  },
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

// ─── Detail panel content ──────────────────────────────────────────────────
interface FilterPoint {
  node: string;
  detail: string;
  badge: string;
  planned?: boolean;
}

interface FilterDetail {
  title: string;
  subtitle?: string;
  points: FilterPoint[];
}

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
      { node: "Terraform",  badge: "Hardened Modules", detail: "Modules enforce encryption-at-rest, deny public S3 ACLs, and scope IAM roles to least privilege by default." },
      { node: "Terraform",  badge: "Remote State",     detail: "State in S3 with DynamoDB lock, versioning, and SSE-S3. No local state files — drift tracked centrally." },
      { node: "ECS / VPC",  badge: "Network Isolation",detail: "VPC module provisions private-only subnets for ECS tasks. Public subnets are ALB/NAT only — no direct workload exposure." },
      { node: "ECR",        badge: "Immutable Tags",   detail: "ECR repo created via Terraform with immutable image tags and scan-on-push enabled. Tag overwrite is denied." },
    ],
  },
  "zero-trust": {
    title: "Zero Trust Architecture",
    points: [
      { node: "Terraform",  badge: "IAM Least Priv",       detail: "All roles use condition keys (aws:SourceVpc, aws:CalledVia). No wildcard resources. Roles scoped to specific services." },
      { node: "ECR",        badge: "Private Registry",      detail: "ECR access requires explicit IAM binding. No public repos. Cross-account access blocked by resource policy." },
      { node: "ECS / VPC",  badge: "Network Zero Trust",    detail: "ECS tasks have no public IPs. Security groups are deny-all inbound by default — ALB is the only ingress point." },
      { node: "ECS / VPC",  badge: "Task Role Isolation",   detail: "Task role and task execution role are separate. Task role carries only the permissions the container code requires." },
    ],
  },
  "vuln-mgmt": {
    title: "Vulnerability Management",
    points: [
      { node: "ECR",          badge: "Build-time Scan",    detail: "ECR scan-on-push catches OS and package CVEs at build time. CRITICAL findings block deployment via CI gate." },
      { node: "Cytrix Engine",badge: "Continuous Scan",    detail: "Prowler CSPM runs every 15 min via EventBridge across 200+ AWS security checks. Trivy scans live containers and IaC." },
      { node: "Cytrix Engine",badge: "KEV + EPSS",         detail: "Each finding enriched with CISA KEV and OSV.dev data. EPSS score surfaces exploitability, not just severity." },
      { node: "CLI / Grafana",badge: "Risk Scoring",       detail: "Weighted formula (CVSS + EPSS + exposure + blast radius + KEV match) produces P1–P4 tiers. P1s auto-trigger CloudTrail correlation." },
    ],
  },
  "logging": {
    title: "Logging & Metrics",
    points: [
      { node: "GitHub Actions", badge: "CI Audit Log",  detail: "tfsec and Trivy results posted as PR comments. Full CI execution history retained in GitHub for audit trail." },
      { node: "ECS / VPC",      badge: "CloudWatch",    detail: "ECS container logs stream to CloudWatch with 90-day retention. VPC Flow Logs on all subnets ingested by Cytrix." },
      { node: "Cytrix Engine",  badge: "CloudTrail",    detail: "All Lambda invocations, S3 writes, and EventBridge events logged. CloudTrail enabled multi-region for API-level audit." },
      { node: "CLI / Grafana",  badge: "Grafana",       detail: "Grafana dashboards show finding trends, score distribution, tool health, and pipeline latency. Alerts on P1 spike or pipeline failure." },
    ],
  },
  "future": {
    title: "In the Pipeline",
    subtitle: "Planned features — architecture defined, not yet deployed",
    points: [
      {
        node: "GitHub Actions",
        badge: "CI Adapter",
        planned: true,
        detail: "tfsec and Trivy findings from every PR flow into Cytrix as first-class findings. Shift-left detections score and rank alongside runtime scans — CI regressions become P3/P4 findings.",
      },
      {
        node: "Cytrix Engine",
        badge: "Lambda 5 · Notifier",
        planned: true,
        detail: "Fifth Lambda triggered by correlated/ writes. Reads the CloudTrail attack hypothesis, attaches the top guardrail recommendation and Terraform snippet, publishes to SNS within 30s of correlation.",
      },
      {
        node: "SNS / Email",
        badge: "Alert Delivery",
        planned: true,
        detail: "aws_sns_topic + email subscription via Terraform variable. P1/P2 alerts land in the security inbox with score, blast radius, CloudTrail timeline, and one-click remediation — loop closed.",
      },
      {
        node: "CLI / Grafana",
        badge: "Posture Dashboard",
        planned: true,
        detail: "Tag-driven compliance view mapping resources to Zero Trust, Least Privilege, and Data Protection concepts. Shows per-concept coverage — which resources are compliant and which are exposed.",
      },
    ],
  },
};

// ─── Color palette ─────────────────────────────────────────────────────────
const colorMap = {
  cyan:    { btn: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",         active: "border-cyan-400 bg-cyan-500/20 text-cyan-300",         node: "border-cyan-400 bg-cyan-500/15 shadow-cyan-500/40",       dot: "bg-cyan-400",    ring: "bg-cyan-400",    line: "bg-cyan-400",    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",       heading: "text-cyan-300"    },
  emerald: { btn: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", active: "border-emerald-400 bg-emerald-500/20 text-emerald-300", node: "border-emerald-400 bg-emerald-500/15 shadow-emerald-500/40", dot: "bg-emerald-400", ring: "bg-emerald-400", line: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", heading: "text-emerald-300" },
  violet:  { btn: "border-violet-500/40 text-violet-400 bg-violet-500/10",   active: "border-violet-400 bg-violet-500/20 text-violet-300",   node: "border-violet-400 bg-violet-500/15 shadow-violet-500/40",  dot: "bg-violet-400",  ring: "bg-violet-400",  line: "bg-violet-400",  badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",  heading: "text-violet-300"  },
  amber:   { btn: "border-amber-500/40 text-amber-400 bg-amber-500/10",       active: "border-amber-400 bg-amber-500/20 text-amber-300",       node: "border-amber-400 bg-amber-500/15 shadow-amber-500/40",     dot: "bg-amber-400",   ring: "bg-amber-400",   line: "bg-amber-400",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",     heading: "text-amber-300"   },
  rose:    { btn: "border-rose-500/40 text-rose-400 bg-rose-500/10",          active: "border-rose-400 bg-rose-500/20 text-rose-300",          node: "border-rose-400 bg-rose-500/15 shadow-rose-500/40",        dot: "bg-rose-400",    ring: "bg-rose-400",    line: "bg-rose-400",    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",        heading: "text-rose-300"    },
  indigo:  { btn: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",    active: "border-indigo-400 bg-indigo-500/20 text-indigo-300",    node: "border-indigo-400 bg-indigo-500/15 shadow-indigo-500/40",  dot: "bg-indigo-400",  ring: "bg-indigo-400",  line: "bg-indigo-400",  badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",  heading: "text-indigo-300"  },
};

// ─── Connector with animated packets ──────────────────────────────────────
function FlowConnector({ active, c, dashed }: {
  active: boolean;
  c: typeof colorMap[keyof typeof colorMap] | null;
  dashed?: boolean;
}) {
  const PACKETS = 3;
  return (
    <div className="flex-1 relative flex items-center h-[4.5rem] min-w-0">
      {/* Base line */}
      <div
        className={`w-full h-px transition-all duration-400 ${active && c ? `${c.line} opacity-50` : "bg-slate-700/30"} ${dashed ? "opacity-30" : ""}`}
        style={dashed && !active ? { backgroundImage: "repeating-linear-gradient(90deg,rgb(99,102,241,0.25) 0,rgb(99,102,241,0.25) 6px,transparent 6px,transparent 12px)", background: "none", height: 1 } : undefined}
      />

      {/* Arrow head */}
      <div
        className={`absolute right-0 transition-colors duration-300 ${active && c ? c.dot : dashed ? "bg-indigo-500/30" : "bg-slate-700/40"}`}
        style={{ width: 5, height: 5, clipPath: "polygon(0 20%, 100% 50%, 0 80%)" }}
      />

      {/* Animated packets */}
      {active && c && Array.from({ length: PACKETS }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full ${c.dot} animate-travel-packet`}
          style={{ animationDelay: `${i * 0.6}s`, top: "50%", transform: "translateY(-50%)", boxShadow: "0 0 6px currentColor" }}
        />
      ))}
    </div>
  );
}

// ─── Single pipeline node ──────────────────────────────────────────────────
function PipelineNodeEl({
  node, highlighted, activeColor, activeFilter,
}: {
  node: PipelineNode;
  highlighted: boolean;
  activeColor: typeof colorMap[keyof typeof colorMap] | null;
  activeFilter: FilterId | null;
}) {
  // Future nodes are shown as dashed/ghosted when no filter or non-future filter is active
  const isFutureNode = node.future === true;
  const isIdle = !activeFilter;
  const showFutureGhost = isFutureNode && (isIdle || (!highlighted));

  return (
    <div className="flex flex-col items-center text-center relative flex-shrink-0" style={{ width: "4.5rem" }}>
      {/* Outer pulse ring */}
      {highlighted && activeColor && (
        <div className={`absolute rounded-2xl ${activeColor.ring} opacity-0 animate-node-ring`} style={{ width: "4.5rem", height: "4.5rem", top: 0 }} />
      )}
      {highlighted && activeColor && (
        <div className={`absolute rounded-2xl ${activeColor.ring} opacity-0 animate-node-ring`} style={{ width: "4.5rem", height: "4.5rem", top: 0, animationDelay: "0.8s" }} />
      )}

      {/* Node box */}
      <motion.div
        animate={{ opacity: highlighted ? 1 : showFutureGhost ? 0.35 : 0.15, scale: highlighted ? 1 : 0.95 }}
        transition={{ duration: 0.25 }}
        className={`relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
          highlighted && activeColor
            ? `${activeColor.node} border-2 shadow-lg`
            : showFutureGhost
            ? "border-indigo-500/30 bg-indigo-500/5 text-indigo-400/50 border-dashed"
            : "border-slate-700/60 bg-slate-900/80 text-slate-500"
        }`}
        style={showFutureGhost && !highlighted ? { borderStyle: "dashed" } : undefined}
      >
        <span className={highlighted && activeColor ? activeColor.heading : showFutureGhost ? "text-indigo-400/50" : "text-slate-500"}>
          {node.icon}
        </span>
      </motion.div>

      {/* Labels */}
      <motion.p
        animate={{ opacity: highlighted ? 1 : showFutureGhost ? 0.4 : 0.15 }}
        transition={{ duration: 0.25 }}
        className="mt-2 text-xs font-semibold text-slate-200 leading-tight"
      >
        {node.label}
      </motion.p>
      <motion.p
        animate={{ opacity: highlighted ? 0.6 : showFutureGhost ? 0.3 : 0.1 }}
        transition={{ duration: 0.25 }}
        className={`text-[10px] mt-0.5 leading-tight ${showFutureGhost && !highlighted ? "text-indigo-400/60" : "text-slate-500"}`}
      >
        {node.sublabel}
      </motion.p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const activeFilterDef = FILTERS.find((f) => f.id === activeFilter);
  const activeColor = activeFilterDef ? colorMap[activeFilterDef.color] : null;

  const isHighlighted = (node: PipelineNode) => !activeFilter || node.tags.includes(activeFilter);

  const connectorActive = (a: PipelineNode, b: PipelineNode) =>
    !!activeFilter && isHighlighted(a) && isHighlighted(b);

  // A connector is "future dashed" if it leads into/out of a future node and no filter is active
  const connectorIsFuture = (a: PipelineNode, b: PipelineNode) =>
    !activeFilter && (a.future || b.future);

  const toggle = (id: FilterId) => setActiveFilter((p) => (p === id ? null : id));

  const detail = activeFilter ? filterDetails[activeFilter] : null;
  const isFutureTab = activeFilter === "future";

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
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-14">
          {FILTERS.map((f) => {
            const c = colorMap[f.color];
            const isActive = activeFilter === f.id;
            const isFuture = f.id === "future";
            return (
              <button
                key={f.id}
                onClick={() => toggle(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                  isActive ? c.active : c.btn
                } ${isFuture ? "border-dashed" : ""}`}
              >
                {isFuture && (
                  <span className="mr-1.5 opacity-70">◎</span>
                )}
                {f.label}
              </button>
            );
          })}
        </motion.div>

        {/* Pipeline row */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
          <div className="hidden md:flex items-center px-4">
            {nodes.map((node, i) => (
              <>
                <PipelineNodeEl
                  key={node.id}
                  node={node}
                  highlighted={isHighlighted(node)}
                  activeColor={activeColor}
                  activeFilter={activeFilter}
                />
                {i < nodes.length - 1 && (
                  <FlowConnector
                    key={`conn-${i}`}
                    active={connectorActive(node, nodes[i + 1])}
                    c={activeColor}
                    dashed={connectorIsFuture(node, nodes[i + 1])}
                  />
                )}
              </>
            ))}
          </div>

          {/* Mobile: 2-column grid fallback */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {nodes.map((node) => (
              <PipelineNodeEl
                key={node.id}
                node={node}
                highlighted={isHighlighted(node)}
                activeColor={activeColor}
                activeFilter={activeFilter}
              />
            ))}
          </div>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {activeFilter && detail && activeColor && (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="mt-10"
            >
              <div
                className={`rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-6 ${isFutureTab ? "border-dashed" : ""}`}
                style={{ borderColor: isFutureTab ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)" }}
              >
                {/* Panel heading */}
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg font-bold ${activeColor.heading}`}>
                    {detail.title}
                  </h3>
                  {isFutureTab && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/30 text-indigo-400/70 bg-indigo-500/10 border-dashed">
                      planned
                    </span>
                  )}
                </div>

                {detail.subtitle && (
                  <p className="text-xs text-slate-500 font-mono mb-5">{detail.subtitle}</p>
                )}
                {!detail.subtitle && <div className="mb-5" />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {detail.points.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-3"
                    >
                      {/* Left bar — dashed for planned items */}
                      <div
                        className={`w-0.5 rounded-full flex-shrink-0 self-stretch ${activeColor.dot} ${point.planned ? "opacity-30" : "opacity-50"}`}
                        style={point.planned ? { backgroundImage: "repeating-linear-gradient(180deg,currentColor 0,currentColor 4px,transparent 4px,transparent 8px)", background: "none", width: 2 } : undefined}
                      />

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500">{point.node}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${activeColor.badge} ${point.planned ? "border-dashed opacity-80" : ""}`}>
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-8 font-mono"
          >
            select a security layer above to highlight where it is enforced
          </motion.p>
        )}
      </div>
    </section>
  );
}
