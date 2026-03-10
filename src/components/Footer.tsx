"use client";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold gradient-text">cytrix</span>
          <span className="text-slate-500 text-sm">
            Cloud Security Intelligence Platform
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/ninemaxpro/cytrix-engine"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/sidak9/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://forms.gle/PLACEHOLDER"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Feedback
          </a>
        </div>

        <p className="text-xs text-slate-600">
          Built by Siddharth Mehta
        </p>
      </div>
    </footer>
  );
}
