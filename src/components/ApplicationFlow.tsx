"use client";

import { motion } from "framer-motion";

const flowSteps = [
  {
    step: "01",
    title: "Ingest",
    subtitle: "Security tools run on schedule",
    description:
      "Prowler scans AWS config. Trivy scans containers and IaC. Findings land as JSON in S3.",
    detail: "EventBridge triggers every 15 minutes. Each tool's adapter normalizes output into CytrixFinding schema.",
    color: "cyan",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Enrich",
    subtitle: "Context added automatically",
    description:
      "Each finding is enriched with threat intel (CISA KEV, OSV.dev), exposure analysis, asset criticality, and blast radius.",
    detail: "Six enrichment passes run in sequence. Coverage percentage drives confidence scoring.",
    color: "emerald",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Score",
    subtitle: "Weighted risk prioritization",
    description:
      "Weighted formula: CVSS + EPSS + exposure + blast radius + asset criticality + threat intel. Output: P1/P2/P3/P4 tier.",
    detail: "Weights are configurable via weights.json. Tiers: P1 >= 80, P2 >= 60, P3 >= 40, P4 < 40.",
    color: "amber",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Correlate",
    subtitle: "Attack stories emerge",
    description:
      "P1/P2 findings trigger CloudTrail investigation. Who used that role? What else did they touch? Full incident timeline.",
    detail: "7-day CloudTrail lookback. Builds attack hypothesis with correlated events across services.",
    color: "red",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.928-3.374a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.75" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Remediate",
    subtitle: "Guardrails + IR playbooks",
    description:
      "CIS/ISO-mapped guardrail recommendations. Auto-generated Terraform code. NIST/PICERL incident response playbooks.",
    detail: "From finding to fix: compliance mapping, remediation commands, and framework-aligned runbooks.",
    color: "cyan",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-cyan-500/10" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/10" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400", glow: "shadow-amber-500/10" },
  red: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400", glow: "shadow-red-500/10" },
};

export default function ApplicationFlow() {
  return (
    <section id="flow" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="gradient-text">Cytrix</span> Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Five stages. Fully automated. From raw scanner output to actionable remediation.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-emerald-500/30 to-red-500/30" />

          {flowSteps.map((step, i) => {
            const c = colorMap[step.color];
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start mb-12 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                } flex-row`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-4 h-4 rounded-full ${c.bg} ${c.border} border-2 shadow-lg ${c.glow}`} />
                </div>

                {/* Content card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-8" : "md:pl-8"} ${isLeft ? "" : "md:ml-auto"}`}>
                  <div className={`p-6 rounded-xl bg-slate-900/50 border ${c.border} backdrop-blur-sm card-hover`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>
                        {step.icon}
                      </div>
                      <div>
                        <span className={`text-xs font-mono ${c.text}`}>
                          STAGE {step.step}
                        </span>
                        <h3 className="text-xl font-bold text-slate-100">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-300 mb-2">
                      {step.subtitle}
                    </p>
                    <p className="text-sm text-slate-400 mb-3">
                      {step.description}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
