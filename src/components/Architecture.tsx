"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  trigger: { bg: "#422006", border: "#d97706", text: "#fbbf24" },
  lambda: { bg: "#042f2e", border: "#0d9488", text: "#2dd4bf" },
  storage: { bg: "#0c1a3d", border: "#3b82f6", text: "#60a5fa" },
  output: { bg: "#1a0525", border: "#a855f7", text: "#c084fc" },
};

function CustomNode({ data }: { data: { label: string; sublabel: string; category: string; detail: string } }) {
  const c = nodeColors[data.category] || nodeColors.lambda;
  return (
    <div
      className="px-4 py-3 rounded-lg border text-center min-w-[160px] backdrop-blur-sm"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-600 !w-2 !h-2" />
      <div className="font-bold text-sm" style={{ color: c.text }}>
        {data.label}
      </div>
      <div className="text-xs mt-1 opacity-70" style={{ color: c.text }}>
        {data.sublabel}
      </div>
      <div className="text-[10px] mt-1.5 opacity-50 font-mono" style={{ color: c.text }}>
        {data.detail}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-600 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

const nodes: Node[] = [
  {
    id: "eb",
    type: "custom",
    position: { x: 0, y: 180 },
    data: { label: "EventBridge", sublabel: "rate(15 min)", category: "trigger", detail: "Schedule trigger" },
  },
  {
    id: "collector",
    type: "custom",
    position: { x: 250, y: 100 },
    data: { label: "Collector", sublabel: "Lambda / 256 MB", category: "lambda", detail: "Prowler + Trivy adapters" },
  },
  {
    id: "s3-raw",
    type: "custom",
    position: { x: 250, y: 270 },
    data: { label: "S3 raw/", sublabel: "Per-tool batches", category: "storage", detail: "s3://cytrix-.../raw/" },
  },
  {
    id: "enrichment",
    type: "custom",
    position: { x: 500, y: 100 },
    data: { label: "Enrichment", sublabel: "Lambda / 512 MB", category: "lambda", detail: "KEV + OSV + 6 passes" },
  },
  {
    id: "s3-enriched",
    type: "custom",
    position: { x: 500, y: 270 },
    data: { label: "S3 enriched/", sublabel: "With context", category: "storage", detail: "s3://cytrix-.../enriched/" },
  },
  {
    id: "scorer",
    type: "custom",
    position: { x: 750, y: 100 },
    data: { label: "Scorer", sublabel: "Lambda / 256 MB", category: "lambda", detail: "Weighted formula → P1-P4" },
  },
  {
    id: "s3-scored",
    type: "custom",
    position: { x: 750, y: 270 },
    data: { label: "S3 scored/", sublabel: "With tiers", category: "storage", detail: "s3://cytrix-.../scored/" },
  },
  {
    id: "correlator",
    type: "custom",
    position: { x: 1000, y: 100 },
    data: { label: "Correlator", sublabel: "Lambda / 512 MB", category: "lambda", detail: "CloudTrail investigation" },
  },
  {
    id: "s3-correlated",
    type: "custom",
    position: { x: 1000, y: 270 },
    data: { label: "S3 correlated/", sublabel: "Attack stories", category: "storage", detail: "s3://cytrix-.../correlated/" },
  },
  {
    id: "cli",
    type: "custom",
    position: { x: 1250, y: 180 },
    data: { label: "Cytrix CLI", sublabel: "Dashboard + Menu", category: "output", detail: "Findings + Guardrails + IR" },
  },
  {
    id: "grafana",
    type: "custom",
    position: { x: 1250, y: 330 },
    data: { label: "Grafana", sublabel: "Dashboards", category: "output", detail: "Security + Pipeline" },
  },
];

const edges: Edge[] = [
  { id: "e1", source: "eb", target: "collector", animated: true, style: { stroke: "#d97706" } },
  { id: "e2", source: "collector", target: "s3-raw", animated: true, style: { stroke: "#0d9488" } },
  { id: "e3", source: "s3-raw", target: "enrichment", animated: true, style: { stroke: "#3b82f6" } },
  { id: "e4", source: "enrichment", target: "s3-enriched", animated: true, style: { stroke: "#0d9488" } },
  { id: "e5", source: "s3-enriched", target: "scorer", animated: true, style: { stroke: "#3b82f6" } },
  { id: "e6", source: "scorer", target: "s3-scored", animated: true, style: { stroke: "#0d9488" } },
  { id: "e7", source: "s3-scored", target: "correlator", animated: true, style: { stroke: "#3b82f6" } },
  { id: "e8", source: "correlator", target: "s3-correlated", animated: true, style: { stroke: "#0d9488" } },
  { id: "e9", source: "s3-correlated", target: "cli", animated: true, style: { stroke: "#a855f7" } },
  { id: "e10", source: "s3-scored", target: "cli", animated: true, style: { stroke: "#a855f7" } },
  { id: "e11", source: "s3-scored", target: "grafana", animated: true, style: { stroke: "#a855f7" } },
];

export default function Architecture() {
  const onInit = useCallback(() => {}, []);

  return (
    <section id="architecture" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Interactive <span className="gradient-text">Architecture</span>
          </h2>
          <p className="text-slate-400">
            Drag, zoom, and explore the full pipeline. Click any node for details.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="h-[500px] rounded-xl border border-slate-800 overflow-hidden bg-slate-950"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={onInit}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
            attributionPosition="bottom-left"
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-slate-900 !border-slate-700 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700"
            />
          </ReactFlow>
        </motion.div>

        <div className="flex justify-center gap-6 mt-6 text-xs">
          {[
            { label: "Trigger", color: "#d97706" },
            { label: "Lambda", color: "#0d9488" },
            { label: "Storage", color: "#3b82f6" },
            { label: "Output", color: "#a855f7" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
