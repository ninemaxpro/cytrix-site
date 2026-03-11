"use client";

import { motion } from "framer-motion";

const items = [
  {
    status: "in-progress",
    title: "Auto-Remediation Engine",
    description:
      "Lambda-driven remediation execution - not just recommendations. P1 findings trigger an approval-gated fix: IAM policy scope reduction, S3 block-public-access enforcement, SG rule removal. Full audit trail per action.",
    tags: ["Lambda", "IAM", "S3", "Approval Gate"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    status: "planned",
    title: "Multi-Account Aggregation",
    description:
      "Org-level view across all AWS accounts. Central findings aggregation, cross-account attack story correlation, and unified risk scoring per business unit. Built for AWS Organizations + SCP integration.",
    tags: ["AWS Orgs", "SCPs", "Cross-account", "Aggregation"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    status: "planned",
    title: "Kubernetes Security",
    description:
      "Falco runtime threat detection + Trivy Operator for continuous K8s workload scanning. CIS Kubernetes Benchmark mapped findings. Feeds directly into the Cytrix scoring pipeline alongside existing AWS findings.",
    tags: ["Falco", "Trivy Operator", "CIS K8s", "EKS"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    status: "planned",
    title: "Real-Time Alerting",
    description:
      "Slack and PagerDuty integration for P1/P2 findings. Configurable alert routing per severity, account, and resource tag. Deduplication window prevents alert storms. On-call context included in every alert.",
    tags: ["Slack", "PagerDuty", "Deduplication", "On-call"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
];

const statusStyle = {
  "in-progress": {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    label: "In Progress",
    dot: "bg-amber-400",
    border: "border-amber-500/20",
    glow: "hover:border-amber-500/40 hover:shadow-amber-500/10",
  },
  "planned": {
    badge: "bg-slate-700/50 text-slate-400 border-slate-600/40",
    label: "Planned",
    dot: "bg-slate-500",
    border: "border-slate-700/40",
    glow: "hover:border-slate-600/60 hover:shadow-slate-500/5",
  },
};

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What&apos;s <span className="gradient-text">Next</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Cytrix is actively evolving. These are the capabilities currently in design or development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item, i) => {
            const s = statusStyle[item.status as keyof typeof statusStyle];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl border bg-slate-900/50 p-6 transition-all duration-300 shadow-lg ${s.border} ${s.glow}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800/80 text-slate-400">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${s.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{item.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-500 border border-slate-700/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-slate-700 font-mono mt-10"
        >
          built by one engineer - designed to scale
        </motion.p>
      </div>
    </section>
  );
}
