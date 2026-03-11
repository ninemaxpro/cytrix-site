"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Filters ──────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "shift-left",   label: "Shift Left",           hex: "#22d3ee", btn: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",         active: "border-cyan-400 bg-cyan-500/20 text-cyan-300"         },
  { id: "terraform",    label: "Terraform Guardrails",  hex: "#34d399", btn: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", active: "border-emerald-400 bg-emerald-500/20 text-emerald-300" },
  { id: "zero-trust",   label: "Zero Trust",            hex: "#a78bfa", btn: "border-violet-500/40 text-violet-400 bg-violet-500/10",   active: "border-violet-400 bg-violet-500/20 text-violet-300"   },
  { id: "vuln-mgmt",    label: "Vuln Mgmt",             hex: "#fbbf24", btn: "border-amber-500/40 text-amber-400 bg-amber-500/10",      active: "border-amber-400 bg-amber-500/20 text-amber-300"      },
  { id: "logging",      label: "Logging & Metrics",     hex: "#fb7185", btn: "border-rose-500/40 text-rose-400 bg-rose-500/10",         active: "border-rose-400 bg-rose-500/20 text-rose-300"         },
  { id: "threat-intel", label: "Threat Intel",          hex: "#fb923c", btn: "border-orange-500/40 text-orange-400 bg-orange-500/10",   active: "border-orange-400 bg-orange-500/20 text-orange-300"   },
  { id: "future",       label: "In the Pipeline",       hex: "#818cf8", btn: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",   active: "border-indigo-400 bg-indigo-500/20 text-indigo-300"   },
] as const;

type FilterId = typeof FILTERS[number]["id"];

// ── Graph nodes ───────────────────────────────────────────────────────────────
interface GNode {
  id: string; label: string; sublabel: string;
  x: number; y: number;
  tags: FilterId[];
  issue?: string;        // ambient risk badge text
  planned?: boolean;
  iconPath: string;      // Heroicon path (24x24 viewBox)
}

const NR = 26; // node circle radius

const NODES: GNode[] = [
  // Dev zone
  {
    id: "dev", label: "Dev Laptop", sublabel: "pre-commit hook",
    x: 80, y: 110, tags: ["shift-left", "terraform", "vuln-mgmt"],
    iconPath: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3",
  },
  {
    id: "terraform", label: "Terraform", sublabel: "modules/infra",
    x: 80, y: 370, tags: ["terraform", "zero-trust", "shift-left"],
    iconPath: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3",
  },
  // CI zone
  {
    id: "github", label: "GitHub", sublabel: "source repo",
    x: 265, y: 110, tags: ["shift-left", "vuln-mgmt"],
    issue: "secret leak?",
    iconPath: "M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z",
  },
  {
    id: "ci", label: "GH Actions", sublabel: "tfsec · bandit · pip-audit",
    x: 265, y: 370, tags: ["shift-left", "vuln-mgmt", "logging"],
    iconPath: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z",
  },
  // AWS left column
  {
    id: "eventbridge", label: "EventBridge", sublabel: "15-min trigger",
    x: 460, y: 110, tags: ["logging", "terraform"],
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  },
  {
    id: "iam", label: "IAM Roles", sublabel: "per-fn scoped",
    x: 460, y: 240, tags: ["zero-trust", "terraform"],
    issue: "over-privileged?",
    iconPath: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  },
  {
    id: "s3", label: "S3 Stages", sublabel: "raw → scored",
    x: 460, y: 370, tags: ["terraform", "zero-trust", "logging"],
    issue: "public access?",
    iconPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  },
  // AWS pipeline column
  {
    id: "collector", label: "Collector", sublabel: "Lambda fn",
    x: 640, y: 110, tags: ["logging", "zero-trust"],
    iconPath: "M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3",
  },
  {
    id: "enricher", label: "Enricher", sublabel: "Lambda fn",
    x: 640, y: 240, tags: ["logging", "threat-intel", "zero-trust"],
    iconPath: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
  {
    id: "scorer", label: "Scorer", sublabel: "Lambda fn",
    x: 640, y: 370, tags: ["logging", "threat-intel", "zero-trust"],
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  // AWS output column
  {
    id: "cloudtrail", label: "CloudTrail", sublabel: "API audit",
    x: 820, y: 110, tags: ["logging"],
    iconPath: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75",
  },
  {
    id: "correlator", label: "Correlator", sublabel: "Lambda fn",
    x: 820, y: 240, tags: ["logging", "threat-intel", "zero-trust"],
    iconPath: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  },
  {
    id: "sns", label: "SNS", sublabel: "alert delivery",
    x: 820, y: 370, tags: ["future", "threat-intel"],
    planned: true,
    iconPath: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
  },
];

// ── Graph edges ───────────────────────────────────────────────────────────────
interface GEdge {
  id: string; from: string; to: string;
  tags: FilterId[];
  special?: "reverse-h"; // U-curve going below for backwards horizontal
  label?: string;
}

const EDGES: GEdge[] = [
  { id: "dev-gh",       from: "dev",         to: "github",      tags: ["shift-left"] },
  { id: "dev-tf",       from: "dev",         to: "terraform",   tags: ["terraform", "shift-left"] },
  { id: "gh-ci",        from: "github",      to: "ci",          tags: ["shift-left", "vuln-mgmt", "logging"] },
  { id: "ci-tf",        from: "ci",          to: "terraform",   tags: ["terraform", "shift-left"], special: "reverse-h", label: "tfsec gate" },
  { id: "tf-eb",        from: "terraform",   to: "eventbridge", tags: ["terraform", "logging"] },
  { id: "tf-iam",       from: "terraform",   to: "iam",         tags: ["terraform", "zero-trust"] },
  { id: "tf-s3",        from: "terraform",   to: "s3",          tags: ["terraform", "zero-trust"] },
  { id: "eb-col",       from: "eventbridge", to: "collector",   tags: ["logging"] },
  { id: "col-ct",       from: "collector",   to: "cloudtrail",  tags: ["logging"] },
  { id: "iam-enr",      from: "iam",         to: "enricher",    tags: ["zero-trust"] },
  { id: "s3-scr",       from: "s3",          to: "scorer",      tags: ["terraform", "zero-trust", "logging"] },
  { id: "col-enr",      from: "collector",   to: "enricher",    tags: ["logging", "threat-intel"] },
  { id: "enr-scr",      from: "enricher",    to: "scorer",      tags: ["logging", "threat-intel"] },
  { id: "scr-cor",      from: "scorer",      to: "correlator",  tags: ["logging", "threat-intel"] },
  { id: "cor-sns",      from: "correlator",  to: "sns",         tags: ["future", "threat-intel"] },
];

// ── Filter guardrail data ─────────────────────────────────────────────────────
interface IssueRow {
  issue: string;
  severity: "critical" | "high" | "medium";
  before: string;
  after: string;
  how: string;
}

interface GuardrailDetail {
  title: string;
  description: string;
  issues: IssueRow[];
}

const GUARDRAILS: Record<FilterId, GuardrailDetail> = {
  "shift-left": {
    title: "Shift Left Security",
    description: "Security checks run before any code reaches AWS. Pre-commit hooks and CI gates block issues at the source - leaked secrets and vulnerable dependencies never enter the pipeline.",
    issues: [
      { issue: "Leaked credential in commit",   severity: "critical", before: "Possible",    after: "Blocked at commit", how: "git-secrets pre-commit hook scans every commit before push" },
      { issue: "Vulnerable Python dependency",   severity: "high",     before: "Gets deployed", after: "Blocked at PR",   how: "pip-audit fails CI on any known CVE in requirements.txt" },
      { issue: "Insecure code pattern (SAST)",   severity: "high",     before: "Gets deployed", after: "Blocked at PR",   how: "Bandit static analysis on all Lambda code, HIGH findings fail merge" },
      { issue: "Terraform misconfig merged",     severity: "high",     before: "Possible",    after: "Blocked at PR",   how: "tfsec runs on every PR as a required CI check before terraform apply" },
    ],
  },
  "terraform": {
    title: "Terraform Guardrails",
    description: "Developers cannot create misconfigured resources by hand. All infrastructure flows through Terraform modules stored in the repo under modules/. The module enforces secure configuration by default - an open S3 bucket or unscoped IAM role is architecturally impossible.",
    issues: [
      { issue: "Public S3 bucket",               severity: "critical", before: "Possible by hand", after: "Architecturally impossible", how: "modules/s3 sets block_public_access=true by default - cannot be overridden" },
      { issue: "Unencrypted S3 bucket",           severity: "high",     before: "Possible",         after: "Enforced",                   how: "Module default: server-side encryption SSE-S3 on every bucket" },
      { issue: "Over-privileged Lambda role",     severity: "high",     before: "Possible",         after: "Prevented",                  how: "modules/lambda creates a scoped execution role per function automatically" },
      { issue: "Terraform state corruption",      severity: "medium",   before: "Possible",         after: "Prevented",                  how: "Remote state in S3 + DynamoDB lock. No local state files allowed" },
    ],
  },
  "zero-trust": {
    title: "Zero Trust Architecture",
    description: "No implicit trust between services. Each Lambda function has its own IAM role scoped to the exact S3 prefixes it needs. A compromised Collector cannot access Scorer data. Access denied is the default.",
    issues: [
      { issue: "Shared IAM role across Lambdas",  severity: "critical", before: "Possible",  after: "Prevented",  how: "Terraform module creates one isolated role per Lambda function" },
      { issue: "Wildcard IAM resource (*.)",       severity: "high",     before: "Possible",  after: "Prevented",  how: "All roles use scoped ARNs + condition keys (aws:CalledVia, aws:SourceAccount)" },
      { issue: "Cross-stage S3 read access",       severity: "high",     before: "Possible",  after: "Denied",     how: "Bucket resource policy restricts each prefix to the owning Lambda role only" },
      { issue: "Lateral movement via role",        severity: "critical", before: "Possible",  after: "Blocked",    how: "Compromise of one role cannot escalate - no cross-function permissions exist" },
    ],
  },
  "vuln-mgmt": {
    title: "Vulnerability Management",
    description: "Dependencies, code patterns, and IaC provider versions are all scanned before deployment. Known CVEs never reach Lambda. Provider drift is locked at the IaC level.",
    issues: [
      { issue: "CVE in Lambda package",           severity: "high",   before: "Could deploy", after: "Blocked at PR", how: "pip-audit scans requirements.txt on every PR against OSV database" },
      { issue: "Insecure Python pattern",         severity: "medium", before: "Could deploy", after: "Blocked at PR", how: "Bandit flags subprocess injection, weak crypto, open perms" },
      { issue: "Terraform provider version drift",severity: "medium", before: "Possible",     after: "Locked",        how: "All provider versions pinned in terraform.lock.hcl, committed to repo" },
    ],
  },
  "logging": {
    title: "Logging & Metrics",
    description: "Every API call, Lambda invocation, and IaC change is recorded. CloudTrail covers the AWS control plane. CloudWatch captures Lambda execution. State versioning covers every terraform apply.",
    issues: [
      { issue: "Untracked AWS API call",          severity: "high",   before: "No record",  after: "Recorded",  how: "CloudTrail enabled multi-region, 90-day retention enforced by Terraform" },
      { issue: "Blind Lambda invocation",         severity: "medium", before: "No trace",   after: "Logged",    how: "CloudWatch log group per function, access restricted to the function role" },
      { issue: "IaC change with no audit trail",  severity: "medium", before: "No record",  after: "Recorded",  how: "S3 state versioning + DynamoDB lock table logs every plan and apply" },
    ],
  },
  "threat-intel": {
    title: "Threat Intelligence",
    description: "Raw findings are enriched with external context before scoring. The Enricher queries threat feeds for IP reputation, known IOCs, and actor tags. The Scorer weights findings by signal strength before Correlator groups them into incidents.",
    issues: [
      { issue: "Uncontextualized finding",        severity: "medium", before: "Raw alert",        after: "Enriched with context",   how: "Enricher adds geo, ASN, threat actor, and IOC tags per IP/domain" },
      { issue: "Unscored anomaly dismissed",      severity: "high",   before: "Ignored as noise", after: "Risk-scored",             how: "Scorer weights severity by IOC reputation and behavioral signals" },
      { issue: "Siloed alerts - no correlation",  severity: "medium", before: "Individual alerts", after: "Correlated into incident", how: "Correlator groups related findings into campaigns with shared context" },
    ],
  },
  "future": {
    title: "In the Pipeline",
    description: "Planned improvements to close the detection-to-remediation loop. The goal: a finding is detected, scored, correlated, and fixed automatically - no human required for known patterns.",
    issues: [
      { issue: "Manual alert triage required",   severity: "high",   before: "Human required",  after: "Auto-remediated (planned)", how: "Correlator triggers a Remediation Lambda with a targeted fix playbook" },
      { issue: "No supply chain visibility",     severity: "medium", before: "No SBOM",          after: "SBOM generated (planned)", how: "Syft generates Software Bill of Materials at deploy time, attached as artifact" },
      { issue: "Unverified Lambda package",      severity: "high",   before: "Any package runs", after: "Code signing (planned)",   how: "Lambda code signing policy rejects unsigned or tampered packages at invoke" },
    ],
  },
};

// ── SVG helpers ───────────────────────────────────────────────────────────────
const nodeById = (id: string) => NODES.find(n => n.id === id)!;

function edgePath(e: GEdge): string {
  const f = nodeById(e.from);
  const t = nodeById(e.to);

  if (e.special === "reverse-h") {
    // U-curve below for backwards-horizontal edges (ci -> terraform, same y row)
    const drop = 55;
    return `M ${f.x} ${f.y + NR} C ${f.x} ${f.y + NR + drop}, ${t.x} ${t.y + NR + drop}, ${t.x} ${t.y + NR}`;
  }

  const dx = t.x - f.x;
  const dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return "";

  const ux = dx / len, uy = dy / len;
  const sx = f.x + ux * NR, sy = f.y + uy * NR;
  const ex = t.x - ux * NR, ey = t.y - uy * NR;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const mid = (sx + ex) / 2;
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${mid.toFixed(1)} ${sy.toFixed(1)}, ${mid.toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  } else {
    const mid = (sy + ey) / 2;
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${sx.toFixed(1)} ${mid.toFixed(1)}, ${ex.toFixed(1)} ${mid.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
}

// Mid-point of a cubic bezier at t=0.5 (approximation for label placement)
function bezierMid(d: string): { x: number; y: number } {
  const parts = d.replace(/[MCL]/g, "").trim().split(/[\s,]+/).map(Number);
  if (parts.length < 8) return { x: 0, y: 0 };
  // For cubic: P(0.5) = (P0 + 3P1 + 3P2 + P3) / 8
  const [x0, y0, cx1, cy1, cx2, cy2, x3, y3] = parts;
  return {
    x: (x0 + 3 * cx1 + 3 * cx2 + x3) / 8,
    y: (y0 + 3 * cy1 + 3 * cy2 + y3) / 8,
  };
}

const SEV_COLOR = {
  critical: { bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/30"   },
  high:     { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/30"  },
  medium:   { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const filter    = FILTERS.find(f => f.id === activeFilter) ?? null;
  const detail    = activeFilter ? GUARDRAILS[activeFilter] : null;
  const isFuture  = activeFilter === "future";

  const nodeHighlighted = (n: GNode) => !activeFilter || n.tags.includes(activeFilter);
  const edgeActive      = (e: GEdge) => !!activeFilter && e.tags.includes(activeFilter);

  const toggle = (id: FilterId) => setActiveFilter(p => p === id ? null : id);

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
            Full application flow from dev commit to cloud runtime. Select a security layer to see which nodes it protects, what risks it eliminates, and how.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => toggle(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                activeFilter === f.id ? f.active : f.btn
              } ${f.id === "future" ? "border-dashed" : ""}`}>
              {f.id === "future" && <span className="mr-1.5 opacity-60">◎</span>}
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* ── SVG diagram (desktop) ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }} className="hidden md:block overflow-x-auto">
          <svg viewBox="0 0 900 460" className="w-full" style={{ minWidth: 600 }}>
            <defs>
              {/* Arrowhead markers - one neutral, one per active filter */}
              <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
              </marker>
              {filter && (
                <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill={filter.hex} />
                </marker>
              )}
            </defs>

            {/* Zone backgrounds */}
            <rect x="18" y="28" width="164" height="410" rx="10"
              fill="rgba(30,41,59,0.5)" stroke="rgba(51,65,85,0.4)" strokeWidth="1" />
            <rect x="200" y="28" width="142" height="410" rx="10"
              fill="rgba(30,41,59,0.4)" stroke="rgba(51,65,85,0.3)" strokeWidth="1" />
            <rect x="360" y="28" width="522" height="410" rx="10"
              fill="rgba(30,41,59,0.35)" stroke="rgba(51,65,85,0.3)" strokeWidth="1" />

            {/* Zone labels */}
            {[
              { x: 100, label: "Dev Laptop" },
              { x: 271, label: "CI / GitHub" },
              { x: 621, label: "AWS Runtime" },
            ].map(z => (
              <text key={z.label} x={z.x} y="20" textAnchor="middle"
                fontSize="9" fontFamily="monospace" fill="#475569" letterSpacing="1">
                {z.label.toUpperCase()}
              </text>
            ))}

            {/* Edges */}
            {EDGES.map(e => {
              const active = edgeActive(e);
              const d = edgePath(e);
              return (
                <g key={e.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={active ? filter!.hex : "#334155"}
                    strokeWidth={active ? 1.5 : 1}
                    strokeOpacity={active ? 0.8 : 0.6}
                    strokeDasharray={active ? "7 5" : undefined}
                    markerEnd={active ? "url(#arrow-active)" : "url(#arrow-default)"}
                    style={active ? { animation: "dash-march 0.9s linear infinite" } : undefined}
                  />
                  {/* Edge label (only for reverse-h tfsec gate when filter active) */}
                  {active && e.label && (() => {
                    const mid = bezierMid(d);
                    return (
                      <g>
                        <rect x={mid.x - 24} y={mid.y + 6} width={48} height={13} rx="4"
                          fill="rgba(15,23,42,0.9)" stroke={filter!.hex} strokeWidth="0.5" strokeOpacity="0.5" />
                        <text x={mid.x} y={mid.y + 15} textAnchor="middle"
                          fontSize="8" fontFamily="monospace" fill={filter!.hex} fillOpacity="0.9">
                          {e.label}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map(n => {
              const hi      = nodeHighlighted(n);
              const guarded = hi && !!activeFilter && !!n.issue;
              const clr     = filter?.hex ?? "#94a3b8";

              return (
                <motion.g key={n.id}
                  animate={{ opacity: hi ? 1 : 0.2 }}
                  transition={{ duration: 0.25 }}>

                  {/* Issue badge - above circle */}
                  {n.issue && (
                    <g>
                      <rect
                        x={n.x - 32} y={n.y - NR - 22} width={64} height={16} rx="8"
                        fill={guarded ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.10)"}
                        stroke={guarded ? "rgba(34,197,94,0.35)" : "rgba(251,191,36,0.30)"}
                        strokeWidth="0.75"
                      />
                      <text x={n.x} y={n.y - NR - 11} textAnchor="middle"
                        fontSize="8" fontFamily="monospace"
                        fill={guarded ? "#4ade80" : "#fbbf24"}>
                        {guarded ? "✓ guarded" : n.issue}
                      </text>
                    </g>
                  )}

                  {/* Pulse ring when highlighted */}
                  {hi && activeFilter && !n.planned && (
                    <>
                      <circle cx={n.x} cy={n.y} r={NR}
                        fill="none" stroke={clr} strokeWidth="1" strokeOpacity="0.35"
                        style={{ animation: "node-ring 1.6s ease-out infinite" }} />
                      <circle cx={n.x} cy={n.y} r={NR}
                        fill="none" stroke={clr} strokeWidth="1" strokeOpacity="0.35"
                        style={{ animation: "node-ring 1.6s ease-out infinite", animationDelay: "0.8s" }} />
                    </>
                  )}

                  {/* Main circle */}
                  <circle
                    cx={n.x} cy={n.y} r={NR}
                    fill={
                      n.planned ? "rgba(129,140,248,0.06)"
                      : hi && activeFilter ? `${clr}18`
                      : "rgba(15,23,42,0.9)"
                    }
                    stroke={
                      n.planned ? "rgba(129,140,248,0.25)"
                      : hi && activeFilter ? clr
                      : "#334155"
                    }
                    strokeWidth={hi && activeFilter ? 1.5 : 1}
                    strokeDasharray={n.planned ? "4 3" : undefined}
                  />

                  {/* Icon (embedded SVG) */}
                  <svg x={n.x - 10} y={n.y - 10} width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke={hi && activeFilter ? clr : n.planned ? "#818cf8" : "#475569"}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={n.iconPath} />
                  </svg>

                  {/* Node label */}
                  <text x={n.x} y={n.y + NR + 14} textAnchor="middle"
                    fontSize="10.5" fontWeight="600" fontFamily="system-ui, sans-serif"
                    fill={hi && activeFilter ? "#e2e8f0" : "#94a3b8"}>
                    {n.label}
                    {n.planned && (
                      <tspan fontSize="8" fontFamily="monospace"
                        fill={hi && activeFilter ? "#818cf8" : "#475569"}> (planned)</tspan>
                    )}
                  </text>
                  <text x={n.x} y={n.y + NR + 27} textAnchor="middle"
                    fontSize="8.5" fontFamily="monospace"
                    fill={hi && activeFilter ? `${clr}99` : "#334155"}>
                    {n.sublabel}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        {/* Mobile fallback */}
        <div className="flex flex-col gap-2 md:hidden mb-6">
          {["Dev Laptop", "CI / GitHub", "AWS Runtime"].map(zone => (
            <div key={zone} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{zone}</p>
            </div>
          ))}
          <p className="text-xs text-slate-600 text-center mt-2">View on a wider screen to see the full diagram.</p>
        </div>

        {/* Idle hint */}
        {!activeFilter && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-4 font-mono">
            select a security layer above to highlight where it is enforced and what risks it eliminates
          </motion.p>
        )}

        {/* ── Guardrail detail panel ── */}
        <AnimatePresence mode="wait">
          {activeFilter && detail && filter && (
            <motion.div key={activeFilter}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}
              className="mt-8">

              <div className={`rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-6 ${isFuture ? "border-dashed" : ""}`}
                style={{ borderColor: `${filter.hex}28` }}>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filter.hex }} />
                      <h3 className="text-lg font-bold text-slate-100">{detail.title}</h3>
                      {isFuture && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-dashed border-indigo-500/30 text-indigo-400/70 bg-indigo-500/10">
                          planned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{detail.description}</p>
                  </div>
                </div>

                {/* Issues table */}
                <div className="mt-5 rounded-xl border border-slate-800/60 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800/60 bg-slate-900/60">
                        <th className="text-left px-4 py-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider w-5/12">Issue eliminated</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider w-1/12">Risk</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider w-2/12">Before</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider w-2/12">After</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden lg:table-cell">How</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.issues.map((row, i) => {
                        const sev = SEV_COLOR[row.severity];
                        return (
                          <motion.tr key={i}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300 font-medium text-[13px]">{row.issue}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono capitalize ${sev.bg} ${sev.text} ${sev.border}`}>
                                {row.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-rose-400/80 text-[12px] font-mono">{row.before}</td>
                            <td className="px-4 py-3 text-emerald-400/90 text-[12px] font-mono">{row.after}</td>
                            <td className="px-4 py-3 text-slate-500 text-[12px] hidden lg:table-cell">{row.how}</td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
