"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── Asciinema player loader ───────────────────────────────────────────────
// Set CAST_URL to your .cast file URL once recorded.
// To record: install asciinema (`brew install asciinema`), run:
//   asciinema rec cytrix-demo.cast
// Then upload to asciinema.org or place the file in /public and set:
//   const CAST_URL = "/cytrix-demo.cast";
// Or use the asciinema.org embed URL:
//   const CAST_URL = "https://asciinema.org/a/<your-id>.cast";
const CAST_URL: string | null = null; // TODO: replace with your cast URL

function AsciinemaEmbed({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import asciinema-player (client only, no SSR)
    import("asciinema-player").then((m) => {
      if (ref.current) {
        m.create(src, ref.current, {
          theme: "monokai",
          autoPlay: false,
          loop: false,
          fit: "width",
          terminalFontSize: "13px",
          rows: 28,
        });
        setLoaded(true);
      }
    });
  }, [src]);

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/asciinema-player@3.8.0/dist/bundle/asciinema-player.min.css" />
      <div ref={ref} className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`} />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 h-40">
          <span className="text-slate-600 font-mono text-sm animate-pulse">loading player...</span>
        </div>
      )}
    </div>
  );
}

// ─── Placeholder shown until cast URL is set ───────────────────────────────
function RecordingPlaceholder() {
  return (
    <div className="bg-slate-950 p-8 h-[360px] flex flex-col items-center justify-center gap-4 font-mono">
      <div className="text-center space-y-2">
        <p className="text-slate-500 text-sm">recording in progress</p>
        <p className="text-slate-700 text-xs">
          <span className="text-cyan-500">$</span> asciinema rec cytrix-demo.cast
        </p>
      </div>
      <div className="mt-4 p-4 rounded-lg border border-slate-800 bg-slate-900/50 text-xs text-slate-500 max-w-md text-center leading-relaxed">
        Once recorded, set <span className="text-cyan-400">CAST_URL</span> in{" "}
        <span className="text-slate-300">TerminalDemo.tsx</span> to the path of your{" "}
        <span className="text-cyan-400">.cast</span> file or asciinema.org URL.
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function TerminalDemo() {
  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It <span className="gradient-text">In Action</span>
          </h2>
          <p className="text-slate-400">
            Real CLI session from Cytrix running against a live AWS account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden border border-slate-800 glow-cyan"
        >
          {/* Terminal chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-slate-500 ml-2 font-mono">cytrix - zsh - 120x28</span>
            {CAST_URL && (
              <a
                href={CAST_URL.startsWith("http") ? CAST_URL.replace(".cast", "") : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-slate-600 hover:text-cyan-400 transition-colors font-mono"
              >
                view raw
              </a>
            )}
          </div>

          {/* Player or placeholder */}
          {CAST_URL ? <AsciinemaEmbed src={CAST_URL} /> : <RecordingPlaceholder />}
        </motion.div>

        {/* Recording guide */}
        {!CAST_URL && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-5 font-mono text-xs"
          >
            <p className="text-slate-400 mb-3 font-sans text-sm font-medium">How to record and deploy:</p>
            <div className="space-y-1.5 text-slate-500">
              <p><span className="text-emerald-400">1.</span>  brew install asciinema</p>
              <p><span className="text-emerald-400">2.</span>  asciinema rec public/cytrix-demo.cast</p>
              <p><span className="text-emerald-400">3.</span>  Run your actual cytrix commands during recording</p>
              <p><span className="text-emerald-400">4.</span>  <span className="text-cyan-400">CAST_URL = &quot;/cytrix-demo.cast&quot;</span>  in TerminalDemo.tsx</p>
              <p><span className="text-emerald-400">5.</span>  Push - Vercel auto-deploys</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
