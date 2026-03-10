"use client";

import { motion } from "framer-motion";

const categories = [
  {
    name: "Languages & Runtime",
    items: [
      { name: "Python 3.12", detail: "Lambda runtime" },
      { name: "TypeScript", detail: "This site" },
      { name: "HCL", detail: "Terraform IaC" },
      { name: "Bash", detail: "Automation scripts" },
    ],
  },
  {
    name: "AWS Services",
    items: [
      { name: "Lambda", detail: "4 pipeline stages" },
      { name: "S3", detail: "Finding storage" },
      { name: "EventBridge", detail: "15-min schedule" },
      { name: "CloudTrail", detail: "Audit investigation" },
      { name: "AWS Config", detail: "Resource discovery" },
      { name: "X-Ray", detail: "Distributed tracing" },
      { name: "IAM", detail: "Scoped roles" },
      { name: "CloudWatch", detail: "Structured logs" },
    ],
  },
  {
    name: "Infrastructure",
    items: [
      { name: "Terraform", detail: "IaC (v1.11, AWS 6.x)" },
      { name: "GitHub Actions", detail: "CI/CD pipelines" },
      { name: "Docker", detail: "Local dev + Grafana" },
      { name: "LocalStack", detail: "Offline testing" },
    ],
  },
  {
    name: "Security Tools",
    items: [
      { name: "Prowler", detail: "AWS CSPM scanner" },
      { name: "Trivy", detail: "Vuln + IaC scanner" },
      { name: "tfsec", detail: "Terraform scanning" },
      { name: "CISA KEV", detail: "Exploit catalog" },
      { name: "OSV.dev", detail: "Vuln database" },
    ],
  },
  {
    name: "Observability",
    items: [
      { name: "Grafana", detail: "2 dashboards" },
      { name: "CloudWatch Logs", detail: "Structured JSON" },
      { name: "Logs Insights", detail: "Query engine" },
    ],
  },
  {
    name: "Frameworks",
    items: [
      { name: "CIS Benchmarks", detail: "Guardrail mapping" },
      { name: "ISO 27001", detail: "Compliance mapping" },
      { name: "NIST / PICERL", detail: "IR playbooks" },
      { name: "MITRE ATT&CK", detail: "Technique mapping" },
    ],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tech <span className="gradient-text">Stack</span>
          </h2>
          <p className="text-slate-400">
            Everything used to build and operate Cytrix.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.08 }}
              className="p-5 rounded-xl bg-slate-900/30 border border-slate-800/50"
            >
              <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                {cat.name}
              </h3>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="text-sm text-slate-200 font-medium">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500">{item.detail}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
