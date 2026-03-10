"use client";

import { motion } from "framer-motion";

const pipelineStages = [
  { label: "EventBridge", icon: "⏱", color: "text-amber-400" },
  { label: "Collector", icon: "📥", color: "text-cyan-400" },
  { label: "Enrichment", icon: "🧬", color: "text-emerald-400" },
  { label: "Scorer", icon: "📊", color: "text-cyan-400" },
  { label: "Correlator", icon: "🔗", color: "text-red-400" },
  { label: "CLI", icon: "💻", color: "text-emerald-400" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block mb-6 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm"
        >
          Cloud Security Intelligence Platform
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="gradient-text">One engineer.</span>
          <br />
          <span className="text-slate-200">Full security operations.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Real scanners, real threat intel, real IR playbooks.
          <br />
          From finding to remediation in one CLI.
        </p>

        {/* Animated pipeline */}
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap mb-12">
          {pipelineStages.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
              className="flex items-center gap-2 md:gap-4"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-2xl backdrop-blur-sm card-hover">
                  {stage.icon}
                </div>
                <span className={`text-xs font-mono ${stage.color}`}>
                  {stage.label}
                </span>
              </div>
              {i < pipelineStages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="text-slate-600 text-lg hidden md:block"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan-500/40">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex gap-4 justify-center"
        >
          <a
            href="https://github.com/ninemaxpro/cytrix-engine"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
          >
            View Source
          </a>
          <a
            href="#demo"
            className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
          >
            Watch Demo
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 rounded-full border border-slate-700 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-cyan-500/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
