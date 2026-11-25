"use client";

import { type Building, CLASS_COLORS_HEX } from "@/lib/buildingData";

interface InfoPanelProps {
  building: Building;
  onClose: () => void;
}

function ConfidenceGauge({ value }: { value: number }) {
  const pct = value * 100;
  const color =
    value > 0.95 ? "#22d3ee" : value > 0.9 ? "#818cf8" : value > 0.85 ? "#fb923c" : "#f87171";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">AI Confidence</span>
        <span className="text-sm font-bold" style={{ color }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-white/20">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

function MetaRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className={`text-xs font-medium ${accent ? "text-cyan-400" : "text-white/80"}`}>
        {value}
      </span>
    </div>
  );
}

export default function InfoPanel({ building, onClose }: InfoPanelProps) {
  const color = CLASS_COLORS_HEX[building.buildingClass];

  return (
    <div className="absolute right-4 top-16 z-20 w-72 fade-up">
      <div className="glow-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${color}22, transparent)` }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-white font-bold text-sm font-mono">{building.id}</span>
            </div>
            <span
              className="text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium"
              style={{ borderColor: `${color}60`, color }}
            >
              {building.buildingClass}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 pt-2 space-y-4">
          <ConfidenceGauge value={building.confidence} />

          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
              Physical Properties
            </p>
            <MetaRow label="Height" value={`${building.height} m`} accent />
            <MetaRow label="Floors (est.)" value={building.floors} />
            <MetaRow label="Footprint Area" value={`${building.area.toLocaleString()} m²`} />
          </div>

          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
              ML Metadata
            </p>
            <MetaRow label="Dataset Source" value={building.source} />
            <MetaRow label="Inference Year" value={building.year} />
            <MetaRow label="Coordinates" value={`${building.coordinates[0][1].toFixed(4)}°N`} />
          </div>

          {/* Coordinates display */}
          <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Polygon Vertices</p>
            <div className="space-y-0.5 max-h-20 overflow-y-auto">
              {building.coordinates.slice(0, -1).map((coord, i) => (
                <div key={i} className="font-mono text-[10px] text-white/40">
                  [{coord[0].toFixed(4)}, {coord[1].toFixed(4)}]
                </div>
              ))}
            </div>
          </div>

          {/* Attribution */}
          <div className="text-[9px] text-white/20 leading-relaxed border-t border-white/5 pt-2">
            Data: Microsoft Global ML Building Footprints (ODbL) · ML: SegFormer-B5 fine-tuned on INRIA Aerial Dataset
          </div>
        </div>
      </div>
    </div>
  );
}
