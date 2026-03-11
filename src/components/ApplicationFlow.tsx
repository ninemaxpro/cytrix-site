"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Filters ───────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "shift-left", label: "Shift Left",          color: "cyan"    },
  { id: "terraform",  label: "Terraform Guardrails", color: "emerald" },
  { id: "zero-trust", label: "Zero Trust",           color: "violet"  },
  { id: "vuln-mgmt",  label: "Vulnerability Mgmt",   color: "amber"   },
  { id: "logging",    label: "Logging & Metrics",    color: "rose"    },
  { id: "future",     label: "In the Pipeline",      color: "indigo"  },
] as const;

type FilterId = typeof FILTERS[number]["id"];

// ─── Node definitions ──────────────────────────────────────────────────────
interface PipelineNode {
  id: string;
  label: string;
  sublabel: string;
  tags: FilterId[];
  icon: React.ReactNode;
}

const NODES: Record<string, PipelineNode> = {
  dev: {
    id: "dev", label: "Dev", sublabel: "Local machine",
    tags: ["shift-left"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  },
  terraform: {
    id: "terraform", label: "Terraform", sublabel: "IaC modules",
    tags: ["terraform", "zero-trust", "shift-left"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>,
  },
  "github-actions": {
    id: "github-actions", label: "GitHub Actions", sublabel: "CI pipeline",
    tags: ["shift-left", "vuln-mgmt", "logging", "future"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
  },
  "plan-apply": {
    id: "plan-apply", label: "Plan / Apply", sublabel: "IaC validation",
    tags: ["terraform", "zero-trust", "logging"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  ecr: {
    id: "ecr", label: "ECR", sublabel: "Image registry",
    tags: ["shift-left", "vuln-mgmt", "zero-trust"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
  ecs: {
    id: "ecs", label: "ECS / VPC", sublabel: "Runtime infra",
    tags: ["zero-trust", "terraform", "logging"],
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg>,
  },
};

// ─── Pipeline rows: [devLaptop node, GitHub node, AWS node] + gates ────────
const ROWS: {
  nodeIds: [string, string, string];
  gates: [string, string];
  rowTags: FilterId[];
}[] = [
  {
    nodeIds: ["dev", "github-actions", "ecr"],
    gates: ["git-secrets", "Trivy CI"],
    rowTags: ["shift-left", "vuln-mgmt", "zero-trust", "logging", "future"],
  },
  {
    nodeIds: ["terraform", "plan-apply", "ecs"],
    gates: ["tfsec", "IAM Scope"],
    rowTags: ["terraform", "zero-trust", "shift-left", "logging"],
  },
];

const SWIMLANES = [
  { label: "Dev Laptop", col: 1 },
  { label: "GitHub",     col: 3 },
  { label: "AWS",        col: 5 },
];

// ─── Detail panel content ──────────────────────────────────────────────────
interface FilterPoint { node: string; badge: string; detail: string; planned?: boolean; }
interface FilterDetail { title: string; subtitle?: string; points: FilterPoint[]; }

const filterDetails: Record<FilterId, FilterDetail> = {
  "shift-left": {
    title: "Shift Left Security",
    points: [
      { node: "Dev",            badge: "git-secrets",    detail: "Pre-commit hooks scan every commit for secrets and credentials before they reach the repo. Block at source, not after the fact." },
      { node: "GitHub Actions", badge: "tfsec",          detail: "tfsec scans all Terraform on every PR. HIGH/CRITICAL findings block the merge — policy failures never reach plan." },
      { node: "GitHub Actions", badge: "Trivy CI",       detail: "Trivy scans the Docker image after build. CRITICAL CVEs block the push to ECR — vulnerable images never land in the registry." },
      { node: "Terraform",      badge: "Policy-as-Code", detail: "tfsec integrated as a required CI step — no terraform plan runs unless IaC scan passes clean. Security is a merge prerequisite." },
    ],
  },
  "terraform": {
    title: "Terraform Guardrails",
    points: [
      { node: "Terraform",    badge: "Hardened Modules",  detail: "Modules enforce encryption-at-rest, deny public S3 ACLs, and scope IAM roles to least privilege by default. Security is the module default, not an option." },
      { node: "Plan / Apply", badge: "Remote State",      detail: "State in S3 with DynamoDB lock, versioning, and SSE-S3. No local state files — drift is tracked centrally, lock prevents concurrent corruption." },
      { node: "ECS / VPC",    badge: "Network Isolation", detail: "VPC module provisions private-only subnets for ECS tasks. Public subnets are ALB/NAT only — no direct workload exposure to the internet." },
      { node: "ECR",          badge: "Immutable Tags",    detail: "ECR repo created via Terraform with immutable image tags and scan-on-push enabled. Image overwrite is denied at the registry level." },
    ],
  },
  "zero-trust": {
    title: "Zero Trust Architecture",
    points: [
      { node: "Terraform",    badge: "IAM Least Priv",      detail: "All roles use condition keys (aws:SourceVpc, aws:CalledVia). No wildcard resources. Roles are scoped to the specific actions each service requires." },
      { node: "ECR",          badge: "Private Registry",    detail: "ECR access requires explicit IAM binding. No public repos. Cross-account access blocked by resource policy by default." },
      { node: "Plan / Apply", badge: "Apply Gate",          detail: "Terraform apply only proceeds after tfsec passes clean. The IAM role used for apply is scoped to the minimum required actions — no AdministratorAccess." },
      { node: "ECS / VPC",    badge: "Task Role Isolation", detail: "Task role and execution role are separate. ECS tasks have no public IPs. Security groups are deny-all inbound — ALB is the only ingress path." },
    ],
  },
  "vuln-mgmt": {
    title: "Vulnerability Management",
    points: [
      { node: "GitHub Actions", badge: "Trivy CI",        detail: "Trivy scans the container image at build time. CRITICAL CVEs block the ECR push — the vulnerability gate is in CI, not in production." },
      { node: "ECR",            badge: "Scan-on-Push",    detail: "ECR scan-on-push runs on every image pushed, even outside CI. Scan results are accessible via CLI and trigger Cytrix findings for tracking." },
      { node: "Terraform",      badge: "Pinned Versions", detail: "All provider versions pinned in terraform.lock.hcl. No floating latest — supply chain drift is prevented at the IaC level." },
      { node: "ECS / VPC",      badge: "Runtime Defence", detail: "Planned: Falco sidecar for runtime container anomaly detection. Any exec into a running container or unexpected network call triggers an alert.", planned: true },
    ],
  },
  "logging": {
    title: "Logging & Metrics",
    points: [
      { node: "GitHub Actions", badge: "CI Audit Log",   detail: "tfsec and Trivy results posted as PR comments and retained as GitHub Actions artifacts. Full CI execution history available for audit." },
      { node: "Plan / Apply",   badge: "State Audit",    detail: "S3 access logs on the state bucket and DynamoDB lock table track every plan and apply. Terraform state history provides full IaC change audit trail." },
      { node: "ECS / VPC",      badge: "CloudWatch",     detail: "ECS container logs stream to CloudWatch with 90-day retention. VPC Flow Logs enabled on all subnets — captured and fed into Cytrix for correlation." },
      { node: "ECR",            badge: "Push Audit",     detail: "Every ECR image push is logged to CloudTrail. Pull access is audited. Tag mutation attempts are blocked and logged via immutable tag policy." },
    ],
  },
  "future": {
    title: "In the Pipeline",
    subtitle: "Planned improvements to the build and deploy security posture",
    points: [
      { node: "GitHub Actions", badge: "DAST",    planned: true, detail: "OWASP ZAP or Nuclei dynamic scan against a staging environment on every merge to main. Runtime behaviour tested before production deploy." },
      { node: "GitHub Actions", badge: "SBOM",    planned: true, detail: "Syft generates a Software Bill of Materials at image build time. SBOM attached to ECR image as an OCI attestation for supply chain traceability." },
      { node: "ECR",            badge: "Cosign",  planned: true, detail: "Image signing with Sigstore Cosign. Only signed images with a valid attestation can be pulled by ECS task definitions — unsigned deploys are blocked." },
      { node: "Plan / Apply",   badge: "OPA",     planned: true, detail: "Open Policy Agent gates on terraform plan output. Custom policies enforce resource naming conventions, tag compliance, and region restrictions before apply." },
    ],
  },
};

// ─── Color palette ──────────────────────────────────────────────────────────
const colorMap = {
  cyan:    { btn: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",         active: "border-cyan-400 bg-cyan-500/20 text-cyan-300",         node: "border-cyan-400 bg-cyan-500/10 shadow-cyan-500/30",     dot: "bg-cyan-400",    ring: "bg-cyan-400",   line: "bg-cyan-400",    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",       heading: "text-cyan-300"    },
  emerald: { btn: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", active: "border-emerald-400 bg-emerald-500/20 text-emerald-300", node: "border-emerald-400 bg-emerald-500/10 shadow-emerald-500/30", dot: "bg-emerald-400", ring: "bg-emerald-400", line: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", heading: "text-emerald-300" },
  violet:  { btn: "border-violet-500/40 text-violet-400 bg-violet-500/10",   active: "border-violet-400 bg-violet-500/20 text-violet-300",   node: "border-violet-400 bg-violet-500/10 shadow-violet-500/30",   dot: "bg-violet-400",  ring: "bg-violet-400",  line: "bg-violet-400",  badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",  heading: "text-violet-300"  },
  amber:   { btn: "border-amber-500/40 text-amber-400 bg-amber-500/10",       active: "border-amber-400 bg-amber-500/20 text-amber-300",       node: "border-amber-400 bg-amber-500/10 shadow-amber-500/30",       dot: "bg-amber-400",   ring: "bg-amber-400",   line: "bg-amber-400",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",     heading: "text-amber-300"   },
  rose:    { btn: "border-rose-500/40 text-rose-400 bg-rose-500/10",          active: "border-rose-400 bg-rose-500/20 text-rose-300",          node: "border-rose-400 bg-rose-500/10 shadow-rose-500/30",          dot: "bg-rose-400",    ring: "bg-rose-400",    line: "bg-rose-400",    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",        heading: "text-rose-300"    },
  indigo:  { btn: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",    active: "border-indigo-400 bg-indigo-500/20 text-indigo-300",    node: "border-indigo-400 bg-indigo-500/10 shadow-indigo-500/30",    dot: "bg-indigo-400",  ring: "bg-indigo-400",  line: "bg-indigo-400",  badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",  heading: "text-indigo-300"  },
};

// ─── Node circle ──────────────────────────────────────────────────────────
function NodeCircle({ node, highlighted, activeColor }: {
  node: PipelineNode;
  highlighted: boolean;
  activeColor: typeof colorMap[keyof typeof colorMap] | null;
}) {
  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Pulse rings */}
      {highlighted && activeColor && (
        <>
          <div className={`absolute rounded-full ${activeColor.ring} opacity-0 animate-node-ring`}
            style={{ width: 56, height: 56, top: 0 }} />
          <div className={`absolute rounded-full ${activeColor.ring} opacity-0 animate-node-ring`}
            style={{ width: 56, height: 56, top: 0, animationDelay: "0.8s" }} />
        </>
      )}
      <motion.div
        animate={{ opacity: highlighted ? 1 : 0.18, scale: highlighted ? 1 : 0.92 }}
        transition={{ duration: 0.25 }}
        className={`relative z-10 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          highlighted && activeColor
            ? `${activeColor.node} shadow-lg`
            : "border-slate-700/50 bg-slate-900/80"
        }`}
      >
        <span className={highlighted && activeColor ? activeColor.heading : "text-slate-600"}>
          {node.icon}
        </span>
      </motion.div>
      <div className="text-center">
        <motion.p animate={{ opacity: highlighted ? 1 : 0.2 }} transition={{ duration: 0.25 }}
          className="text-xs font-semibold text-slate-200 leading-tight whitespace-nowrap">
          {node.label}
        </motion.p>
        <motion.p animate={{ opacity: highlighted ? 0.5 : 0.12 }} transition={{ duration: 0.25 }}
          className="text-[10px] text-slate-500 leading-tight whitespace-nowrap mt-0.5">
          {node.sublabel}
        </motion.p>
      </div>
    </div>
  );
}

// ─── Connector with gate badge ─────────────────────────────────────────────
function Connector({ active, c, gate }: {
  active: boolean;
  c: typeof colorMap[keyof typeof colorMap] | null;
  gate: string;
}) {
  return (
    <div className="flex-1 relative flex items-center" style={{ height: 56 }}>
      {/* Line */}
      <div className={`w-full h-px transition-all duration-300 ${active && c ? `${c.line} opacity-60` : "bg-slate-700/25"}`} />
      {/* Arrow tip */}
      <div className={`absolute right-0 flex-shrink-0 transition-colors duration-300 ${active && c ? c.dot : "bg-slate-700/35"}`}
        style={{ width: 5, height: 5, clipPath: "polygon(0 20%, 100% 50%, 0 80%)" }} />
      {/* Animated packets */}
      {active && c && [0, 1].map(i => (
        <div key={i} className={`absolute w-1.5 h-1.5 rounded-full ${c.dot} animate-travel-packet`}
          style={{ animationDelay: `${i * 0.7}s`, top: "50%", transform: "translateY(-50%)" }} />
      ))}
      {/* Gate badge */}
      <div className="absolute left-1/2 z-10 pointer-events-none"
        style={{ top: "50%", transform: "translate(-50%, -50%)" }}>
        <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-sm border transition-all duration-300 whitespace-nowrap ${
          active && c ? `${c.badge}` : "bg-slate-950 border-slate-700/40 text-slate-600"
        }`}>
          {gate}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const activeFilterDef = FILTERS.find(f => f.id === activeFilter);
  const activeColor = activeFilterDef ? colorMap[activeFilterDef.color] : null;

  const isHighlighted = (node: PipelineNode) =>
    !activeFilter || node.tags.includes(activeFilter);

  const toggle = (id: FilterId) => setActiveFilter(p => p === id ? null : id);
  const detail = activeFilter ? filterDetails[activeFilter] : null;
  const isFutureTab = activeFilter === "future";

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
            How security is built into the development and deployment pipeline. Click a layer to see where it is enforced.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-12">
          {FILTERS.map(f => {
            const c = colorMap[f.color];
            const isActive = activeFilter === f.id;
            return (
              <button key={f.id} onClick={() => toggle(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                  isActive ? c.active : c.btn
                } ${f.id === "future" ? "border-dashed" : ""}`}>
                {f.id === "future" && <span className="mr-1.5 opacity-60">◎</span>}
                {f.label}
              </button>
            );
          })}
        </motion.div>

        {/* ── Swimlane diagram (desktop) ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }} className="hidden md:block">

          {/* Swimlane container */}
          <div className="rounded-xl border border-slate-800/60 overflow-hidden">

            {/* Swimlane header row */}
            <div className="grid border-b border-slate-800/60" style={{ gridTemplateColumns: "1fr 1fr 2fr" }}>
              {SWIMLANES.map((sw, i) => (
                <div key={sw.label}
                  className={`py-3 px-6 text-center text-[11px] font-mono tracking-wider uppercase text-slate-500 ${
                    i < SWIMLANES.length - 1 ? "border-r border-slate-800/60" : ""
                  } bg-slate-900/60`}>
                  {sw.label}
                </div>
              ))}
            </div>

            {/* Pipeline rows */}
            <div className="bg-slate-950/40">
              {ROWS.map((row, rowIdx) => {
                const [n1, n2, n3] = row.nodeIds.map(id => NODES[id]);
                const [g1, g2] = row.gates;
                const rowActive = !!activeFilter && row.rowTags.includes(activeFilter);
                const c1Active = rowActive && isHighlighted(n1) && isHighlighted(n2);
                const c2Active = rowActive && isHighlighted(n2) && isHighlighted(n3);

                return (
                  <div key={rowIdx}
                    className={`flex items-center px-6 py-8 ${rowIdx > 0 ? "border-t border-slate-800/40" : ""}`}>
                    {/* Col 1: Dev Laptop node */}
                    <div className="flex items-center justify-center" style={{ width: "calc((100% - 2 * (100% / 3)) / 1)" }}>
                      <NodeCircle node={n1} highlighted={isHighlighted(n1)} activeColor={activeColor} />
                    </div>

                    {/* Connector 1 + Col 2: GitHub node + Connector 2 + Col 3: AWS node */}
                    {/* We use flex to fill the remaining space */}
                    <div className="flex flex-1 items-center">
                      {/* Connector 1 (Dev Laptop → GitHub) */}
                      <Connector active={c1Active} c={activeColor} gate={g1} />

                      {/* GitHub node - centered in its third */}
                      <div className="flex items-center justify-center flex-none px-6">
                        <NodeCircle node={n2} highlighted={isHighlighted(n2)} activeColor={activeColor} />
                      </div>

                      {/* Connector 2 (GitHub → AWS) */}
                      <Connector active={c2Active} c={activeColor} gate={g2} />

                      {/* AWS node */}
                      <div className="flex items-center justify-center flex-none pl-6">
                        <NodeCircle node={n3} highlighted={isHighlighted(n3)} activeColor={activeColor} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical swimlane dividers overlay hint text */}
          {!activeFilter && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-center text-xs text-slate-700 mt-4 font-mono">
              select a security layer above to highlight where it is enforced
            </motion.p>
          )}
        </motion.div>

        {/* Mobile: simple grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {Object.values(NODES).map(node => (
            <div key={node.id} className="flex justify-center py-4">
              <NodeCircle node={node} highlighted={isHighlighted(node)} activeColor={activeColor} />
            </div>
          ))}
        </div>

        {/* ── Detail panel ── */}
        <AnimatePresence mode="wait">
          {activeFilter && detail && activeColor && (
            <motion.div key={activeFilter} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }} className="mt-8">
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
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }} className="flex gap-3">
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

      </div>
    </section>
  );
}
