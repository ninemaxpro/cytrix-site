"use client";

import { motion } from "framer-motion";

export default function FeedbackCTA() {
  return (
    <section id="feedback" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-cyan-500/20 glow-cyan">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Would <span className="gradient-text">You Add?</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Cytrix is actively evolving. If you&apos;re a security engineer, SRE,
              or hiring manager — I&apos;d love your input on what to build next.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://forms.gle/PLACEHOLDER"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
              >
                Share Feedback
              </a>
              <a
                href="https://github.com/ninemaxpro/cytrix-engine/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              >
                GitHub Discussions
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
