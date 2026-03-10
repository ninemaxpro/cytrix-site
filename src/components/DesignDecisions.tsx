"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const decisions = [
  {
    question: "Why S3 as the data layer, not DynamoDB?",
    answer:
      "S3 is practically free at this scale (~$0.03/month for PUTs). It supports event-driven triggers natively (S3 → Lambda), works as both storage and message bus. DynamoDB adds cost and complexity for a write-heavy, read-rarely pipeline. JSON files in S3 prefixes (raw/, enriched/, scored/, correlated/) act as natural stage boundaries.",
  },
  {
    question: "Why weighted scoring instead of just CVSS?",
    answer:
      "CVSS alone doesn't account for your environment. A critical CVE on an isolated dev box is less urgent than a medium CVE on a public-facing production system. The six-factor formula (CVSS + EPSS + exposure + blast radius + asset criticality + threat intel) produces P1-P4 tiers that reflect actual risk, not theoretical severity.",
  },
  {
    question: "Why opaque module IDs in tags, not file paths?",
    answer:
      "Putting file paths (terraform/modules/lambda/main.tf) in AWS tags is an information leak — attackers learn your repo structure. Opaque IDs (cytrix:module = secure-s3) reveal nothing. A local mapping file (tf-module-map.json) resolves IDs to paths for developers, but never leaves the workstation.",
  },
  {
    question: "Why EventBridge, not cron or Step Functions?",
    answer:
      "EventBridge is serverless, costs nothing at this rate (a few invocations per hour), and integrates natively with Lambda. Cron requires a running instance. Step Functions add orchestration complexity — the S3 event chain already handles stage sequencing for free.",
  },
  {
    question: "Why a CLI instead of a web UI?",
    answer:
      "Security engineers live in terminals. A CLI is faster to iterate on, easier to script, and doesn't need hosting. The Grafana dashboards handle visual monitoring. Phase 2 adds a web UI for management visibility — but the CLI remains the primary operator interface.",
  },
  {
    question: "Why separate Lambdas per stage, not one monolith?",
    answer:
      "Each Lambda has scoped IAM permissions (collector can read scanner buckets, scorer can only read/write its prefixes). A monolith would need union permissions — violating least privilege. Separate functions also mean independent scaling, isolated failures, and clearer CloudWatch logs.",
  },
];

export default function DesignDecisions() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="decisions" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Design <span className="gradient-text">Decisions</span>
          </h2>
          <p className="text-slate-400">
            The &ldquo;why&rdquo; behind every architectural choice.
          </p>
        </motion.div>

        <div className="space-y-3">
          {decisions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
              >
                <span className="text-sm md:text-base font-medium text-slate-200">
                  {d.question}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  className="text-cyan-400 text-xl ml-4 flex-shrink-0"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 py-4 text-sm text-slate-400 leading-relaxed bg-slate-950/50 border-t border-slate-800/50">
                      {d.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
