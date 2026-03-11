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

interface PipelineNode {
  id: string;
  label: string;
  sublabel: string;
  tags: FilterId[];
  icon: React.ReactNode;
}

// ─── Swimlane cards ────────────────────────────────────────────────────────
interface SwimLane {
  id: string;
  label: string;
  headerIcon: React.ReactNode;
  nodes: PipelineNode[];
}

const LANES: SwimLane[] = [
  {
    id: "dev",
    label: "Dev Laptop",
    headerIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" /></svg>,
    nodes: [
      {
        id: "dev", label: "Dev", sublabel: "pre-commit",
        tags: ["shift-left"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
      },
      {
        id: "terraform", label: "Terraform", sublabel: "IaC modules",
        tags: ["terraform", "zero-trust", "shift-left"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>,
      },
      {
        id: "plan-apply", label: "Plan / Apply", sublabel: "local apply",
        tags: ["terraform", "zero-trust", "logging"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      },
    ],
  },
  {
    id: "github",
    label: "GitHub",
    headerIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>,
    nodes: [
      {
        id: "github-actions", label: "GH Actions", sublabel: "CI checks",
        tags: ["shift-left", "vuln-mgmt", "logging", "future"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
      },
    ],
  },
  {
    id: "aws",
    label: "AWS",
    headerIcon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>,
    nodes: [
      {
        id: "lambda-iam", label: "Lambda + IAM", sublabel: "scoped roles",
        tags: ["zero-trust", "terraform"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
      },
      {
        id: "s3", label: "S3", sublabel: "encrypted stages",
        tags: ["terraform", "zero-trust"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
      },
      {
        id: "cloudtrail", label: "CloudTrail", sublabel: "API audit",
        tags: ["logging"],
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" /></svg>,
      },
    ],
  },
];

// ─── Deployed architecture stack ───────────────────────────────────────────
interface StackNode {
  id: string;
  label: string;
  sublabel: string;
  planned?: boolean;
  icon: React.ReactNode;
}

// Pipeline chain — rendered left-to-right with connectors
const STACK_PIPELINE: StackNode[] = [
  {
    id: "eventbridge", label: "EventBridge", sublabel: "15 min schedule",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  },
  {
    id: "collector", label: "Collector", sublabel: "Lambda fn",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" /></svg>,
  },
  {
    id: "enricher", label: "Enricher", sublabel: "Lambda fn",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  },
  {
    id: "scorer", label: "Scorer", sublabel: "Lambda fn",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  },
  {
    id: "correlator", label: "Correlator", sublabel: "Lambda fn",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
  },
];

// Supporting services — rendered as a second row
const STACK_SUPPORT: StackNode[] = [
  {
    id: "s3-stages", label: "S3", sublabel: "raw / enriched / scored / correlated",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  },
  {
    id: "iam", label: "IAM", sublabel: "per-function roles",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
  },
  {
    id: "cli", label: "CLI", sublabel: "Python script",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
  },
  {
    id: "sns", label: "SNS", sublabel: "alert delivery",
    planned: true,
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  },
];

// ─── Color palette ─────────────────────────────────────────────────────────
const colorMap = {
  cyan:    { btn: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",         active: "border-cyan-400 bg-cyan-500/20 text-cyan-300",         node: "border-cyan-400 bg-cyan-500/10 shadow-cyan-500/30",         ring: "bg-cyan-400",    dot: "bg-cyan-400",    line: "bg-cyan-400",    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",       heading: "text-cyan-300",    card: "border-cyan-500/30 shadow-cyan-500/10"    },
  emerald: { btn: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", active: "border-emerald-400 bg-emerald-500/20 text-emerald-300", node: "border-emerald-400 bg-emerald-500/10 shadow-emerald-500/30", ring: "bg-emerald-400", dot: "bg-emerald-400", line: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", heading: "text-emerald-300", card: "border-emerald-500/30 shadow-emerald-500/10" },
  violet:  { btn: "border-violet-500/40 text-violet-400 bg-violet-500/10",   active: "border-violet-400 bg-violet-500/20 text-violet-300",   node: "border-violet-400 bg-violet-500/10 shadow-violet-500/30",   ring: "bg-violet-400",  dot: "bg-violet-400",  line: "bg-violet-400",  badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",  heading: "text-violet-300",  card: "border-violet-500/30 shadow-violet-500/10"  },
  amber:   { btn: "border-amber-500/40 text-amber-400 bg-amber-500/10",       active: "border-amber-400 bg-amber-500/20 text-amber-300",       node: "border-amber-400 bg-amber-500/10 shadow-amber-500/30",       ring: "bg-amber-400",   dot: "bg-amber-400",   line: "bg-amber-400",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",     heading: "text-amber-300",   card: "border-amber-500/30 shadow-amber-500/10"   },
  rose:    { btn: "border-rose-500/40 text-rose-400 bg-rose-500/10",          active: "border-rose-400 bg-rose-500/20 text-rose-300",          node: "border-rose-400 bg-rose-500/10 shadow-rose-500/30",          ring: "bg-rose-400",    dot: "bg-rose-400",    line: "bg-rose-400",    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",        heading: "text-rose-300",    card: "border-rose-500/30 shadow-rose-500/10"    },
  indigo:  { btn: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",    active: "border-indigo-400 bg-indigo-500/20 text-indigo-300",    node: "border-indigo-400 bg-indigo-500/10 shadow-indigo-500/30",    ring: "bg-indigo-400",  dot: "bg-indigo-400",  line: "bg-indigo-400",  badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",  heading: "text-indigo-300",  card: "border-indigo-500/30 shadow-indigo-500/10"  },
};

// ─── Detail panel ──────────────────────────────────────────────────────────
interface FilterPoint { node: string; badge: string; detail: string; planned?: boolean; }
interface FilterDetail { title: string; subtitle?: string; points: FilterPoint[]; }

const filterDetails: Record<FilterId, FilterDetail> = {
  "shift-left": {
    title: "Shift Left Security",
    points: [
      { node: "Dev",        badge: "git-secrets",    detail: "Pre-commit hook scans every commit for secrets and credentials before they reach the repo. Block at source, not after the fact." },
      { node: "GH Actions", badge: "tfsec",          detail: "tfsec scans all Terraform on every PR. HIGH/CRITICAL findings block the merge — policy failures never reach terraform plan." },
      { node: "GH Actions", badge: "Bandit",         detail: "Bandit runs static analysis on all Python Lambda code. Hardcoded secrets, insecure functions, and common misconfigurations caught before merge." },
      { node: "Terraform",  badge: "Policy-as-Code", detail: "tfsec is a required CI step. No terraform plan runs until the IaC scan passes clean. Security is a merge prerequisite, not an afterthought." },
    ],
  },
  "terraform": {
    title: "Terraform Guardrails",
    points: [
      { node: "Terraform",    badge: "Hardened Modules",  detail: "Modules enforce encryption-at-rest, deny public S3 ACLs, and scope IAM roles to least privilege by default. Secure config is the default, not an option." },
      { node: "Plan / Apply", badge: "Remote State",      detail: "State stored in S3 with DynamoDB lock, versioning, and SSE-S3. No local state files — drift tracked centrally, concurrent corruption prevented by lock." },
      { node: "Lambda + IAM", badge: "Execution Roles",   detail: "Each Lambda has its own execution role, created via Terraform and scoped to the exact S3 prefixes it reads and writes. No shared roles between functions." },
      { node: "S3",           badge: "Bucket Hardening",  detail: "S3 modules enforce server-side encryption, block-public-access at bucket and account level, and enable versioning by default on all stage prefixes." },
    ],
  },
  "zero-trust": {
    title: "Zero Trust Architecture",
    points: [
      { node: "Terraform",    badge: "IAM Least Priv",     detail: "All roles use condition keys (aws:CalledVia, aws:SourceAccount). No wildcard resources. Each role carries only what its service needs." },
      { node: "Lambda + IAM", badge: "Role Isolation",     detail: "Collector, Enricher, Scorer, and Correlator each have separate IAM roles. Compromise of one role cannot escalate access to another function." },
      { node: "Plan / Apply", badge: "Apply Gate",         detail: "The Terraform execution role is scoped to the minimum required actions — no AdministratorAccess. Apply only proceeds after tfsec passes clean." },
      { node: "S3",           badge: "Resource Policy",    detail: "Each S3 prefix is accessible only to the specific Lambda role that owns that pipeline stage. Cross-stage access is denied at the bucket policy level." },
    ],
  },
  "vuln-mgmt": {
    title: "Vulnerability Management",
    points: [
      { node: "GH Actions", badge: "pip-audit",       detail: "pip-audit scans Python dependencies on every PR. Known CVEs in requirements.txt fail the build before the Lambda package is deployed." },
      { node: "GH Actions", badge: "Bandit",          detail: "Bandit static analysis flags insecure patterns — subprocess injection, weak crypto, open permissions — at PR time before any code ships." },
      { node: "Terraform",  badge: "Pinned Versions", detail: "All provider versions pinned in terraform.lock.hcl. No floating latest — supply chain drift prevented at the IaC level." },
      { node: "Lambda + IAM", badge: "Code Signing",  planned: true, detail: "Planned: Lambda code signing ensures only verified deployment packages are executed. Unsigned or tampered packages are rejected at invocation." },
    ],
  },
  "logging": {
    title: "Logging & Metrics",
    points: [
      { node: "GH Actions",   badge: "CI Audit Log",  detail: "tfsec, Bandit, and pip-audit results retained as CI artifacts. Full pipeline execution history in GitHub for audit." },
      { node: "Plan / Apply", badge: "State Audit",   detail: "S3 access logs on the state bucket and DynamoDB lock table record every plan and apply. Full IaC change history via state versioning." },
      { node: "CloudTrail",   badge: "API Audit",     detail: "CloudTrail enabled multi-region. Every Lambda invocation, S3 write, IAM change, and EventBridge event logged with 90-day retention." },
      { node: "Lambda + IAM", badge: "CloudWatch",    detail: "All Lambda function logs stream to CloudWatch with 90-day retention enforced by Terraform. Log group resource policy restricts access to the function role." },
    ],
  },
  "future": {
    title: "In the Pipeline",
    subtitle: "Planned improvements to the build and deploy security posture",
    points: [
      { node: "GH Actions",   badge: "SBOM",      planned: true, detail: "Syft generates a Software Bill of Materials for Lambda packages at deploy time. Attached as a build artifact for supply chain traceability." },
      { node: "GH Actions",   badge: "DAST",      planned: true, detail: "OWASP ZAP dynamic scan against a staging Lambda endpoint on every merge to main. Runtime behaviour validated before production deploy." },
      { node: "Plan / Apply", badge: "OPA",       planned: true, detail: "Open Policy Agent gates on terraform plan JSON output. Enforces tag compliance, naming conventions, and region restrictions before apply." },
      { node: "Lambda + IAM", badge: "Powertools",planned: true, detail: "AWS Lambda Powertools structured logging, tracing (X-Ray), and metrics across all 4 functions. Enables request-level correlation and SLO tracking." },
    ],
  },
};

// ─── Small circle node ────────────────────────────────────────────────────
function NodeCircle({ node, highlighted, activeColor, small }: {
  node: { label: string; sublabel: string; icon: React.ReactNode; planned?: boolean };
  highlighted: boolean;
  activeColor: typeof colorMap[keyof typeof colorMap] | null;
  small?: boolean;
}) {
  const size = small ? "w-7 h-7" : "w-8 h-8";
  const ringSize = small ? 28 : 32;

  return (
    <div className="flex flex-col items-center gap-1.5 relative">
      {highlighted && activeColor && (
        <>
          <div className={`absolute rounded-full ${activeColor.ring} opacity-0 animate-node-ring`}
            style={{ width: ringSize, height: ringSize, top: 0 }} />
          <div className={`absolute rounded-full ${activeColor.ring} opacity-0 animate-node-ring`}
            style={{ width: ringSize, height: ringSize, top: 0, animationDelay: "0.8s" }} />
        </>
      )}
      <motion.div
        animate={{ opacity: highlighted ? 1 : 0.18, scale: highlighted ? 1 : 0.9 }}
        transition={{ duration: 0.25 }}
        className={`relative z-10 ${size} rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          node.planned
            ? "border-indigo-500/30 bg-indigo-500/5 border-dashed"
            : highlighted && activeColor
              ? `${activeColor.node} shadow-md`
              : "border-slate-700/50 bg-slate-900/80"
        }`}
      >
        <span className={
          node.planned ? "text-indigo-400/50"
          : highlighted && activeColor ? activeColor.heading
          : "text-slate-600"
        }>
          {node.icon}
        </span>
      </motion.div>
      <div className="text-center">
        <motion.p animate={{ opacity: highlighted ? 1 : 0.2 }} transition={{ duration: 0.25 }}
          className={`font-semibold text-slate-200 leading-tight whitespace-nowrap ${small ? "text-[10px]" : "text-[11px]"}`}>
          {node.label}
          {node.planned && <span className="ml-1 text-indigo-400/50 text-[8px] font-mono">planned</span>}
        </motion.p>
        <motion.p animate={{ opacity: highlighted ? 0.5 : 0.12 }} transition={{ duration: 0.25 }}
          className="text-[9px] text-slate-500 leading-tight mt-0.5" style={{ maxWidth: 72 }}>
          {node.sublabel}
        </motion.p>
      </div>
    </div>
  );
}

// ─── Card-to-card connector ────────────────────────────────────────────────
function CardConnector({ active, c }: {
  active: boolean;
  c: typeof colorMap[keyof typeof colorMap] | null;
}) {
  return (
    <div className="flex items-center flex-shrink-0 w-10 relative">
      <div className={`w-full h-px transition-all duration-300 ${active && c ? `${c.line} opacity-70` : "bg-slate-700/30"}`} />
      <div className={`absolute right-0 transition-colors duration-300 ${active && c ? c.dot : "bg-slate-700/35"}`}
        style={{ width: 5, height: 5, clipPath: "polygon(0 20%, 100% 50%, 0 80%)" }} />
      {active && c && [0, 1].map(i => (
        <div key={i} className={`absolute w-1.5 h-1.5 rounded-full ${c.dot} animate-travel-packet`}
          style={{ animationDelay: `${i * 0.8}s`, top: "50%", transform: "translateY(-50%)" }} />
      ))}
    </div>
  );
}

// ─── Mini connector (inside stack box) ────────────────────────────────────
function MiniConnector() {
  return (
    <div className="flex items-center flex-shrink-0 w-6 relative pb-7">
      <div className="w-full h-px bg-slate-700/30" />
      <div className="absolute right-0 bg-slate-700/35"
        style={{ width: 4, height: 4, clipPath: "polygon(0 20%, 100% 50%, 0 80%)" }} />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ApplicationFlow() {
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(null);

  const activeFilterDef = FILTERS.find(f => f.id === activeFilter);
  const activeColor = activeFilterDef ? colorMap[activeFilterDef.color] : null;

  const laneHasMatch = (lane: SwimLane) =>
    !activeFilter || lane.nodes.some(n => n.tags.includes(activeFilter));

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
            How security is built into every stage of development and deployment. Click a layer to see where it is enforced.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-10">
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

        {/* ── Section label ── */}
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3 hidden md:block">
          Development Pipeline
        </p>

        {/* ── Swimlane cards ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }} className="hidden md:flex items-center gap-0 mb-4">
          {LANES.map((lane, laneIdx) => {
            const laneActive = laneHasMatch(lane);
            const nextLane = LANES[laneIdx + 1];
            const connectorActive = !!activeFilter && laneActive && !!nextLane && laneHasMatch(nextLane);

            return (
              <div key={lane.id} className="flex items-center">
                <motion.div
                  animate={{ opacity: laneActive ? 1 : 0.25 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-xl border bg-slate-900/60 transition-all duration-300 ${
                    activeFilter && activeColor && laneActive
                      ? `${activeColor.card} shadow-lg`
                      : "border-slate-800/70"
                  }`}
                  style={{ minWidth: 140 }}
                >
                  {/* Card header */}
                  <div className={`flex items-center justify-center gap-1.5 px-4 py-2.5 border-b text-[10px] font-mono tracking-wider uppercase ${
                    activeFilter && activeColor && laneActive
                      ? "border-current text-current opacity-60"
                      : "border-slate-800/60 text-slate-600"
                  }`}
                    style={activeFilter && activeColor && laneActive ? { color: "inherit" } : undefined}>
                    <span className={activeFilter && activeColor && laneActive ? activeColor.heading : "text-slate-600"}>
                      {lane.headerIcon}
                    </span>
                    <span className={activeFilter && activeColor && laneActive ? activeColor.heading : "text-slate-600"}>
                      {lane.label}
                    </span>
                  </div>

                  {/* Nodes */}
                  <div className="flex items-start justify-center gap-5 px-5 py-5">
                    {lane.nodes.map(node => (
                      <NodeCircle key={node.id} node={node} highlighted={isHighlighted(node)} activeColor={activeColor} />
                    ))}
                  </div>
                </motion.div>

                {nextLane && <CardConnector active={connectorActive} c={activeColor} />}
              </div>
            );
          })}
        </motion.div>

        {/* Mobile pipeline */}
        <div className="flex flex-col gap-3 md:hidden mb-6">
          {LANES.map(lane => (
            <div key={lane.id} className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">{lane.label}</p>
              <div className="flex gap-5 flex-wrap">
                {lane.nodes.map(node => (
                  <NodeCircle key={node.id} node={node} highlighted={isHighlighted(node)} activeColor={activeColor} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Deployed Architecture box ── */}
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3 hidden md:block mt-2">
          Deployed Architecture
        </p>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">

          {/* Box header */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800/50 bg-slate-900/60">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">AWS · Runtime</span>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Lambda pipeline row */}
            <div>
              <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider mb-3">Detection Pipeline</p>
              <div className="flex items-start flex-wrap gap-0">
                {STACK_PIPELINE.map((node, i) => (
                  <div key={node.id} className="flex items-start">
                    <NodeCircle node={node} highlighted={!activeFilter} activeColor={activeColor} small />
                    {i < STACK_PIPELINE.length - 1 && <MiniConnector />}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800/40" />

            {/* Supporting services row */}
            <div>
              <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider mb-3">Supporting Services</p>
              <div className="flex items-start flex-wrap gap-6">
                {STACK_SUPPORT.map(node => (
                  <NodeCircle key={node.id} node={node} highlighted={!activeFilter} activeColor={activeColor} small />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Idle hint */}
        {!activeFilter && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-xs text-slate-700 mt-5 font-mono">
            select a security layer above to highlight where it is enforced
          </motion.p>
        )}

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
