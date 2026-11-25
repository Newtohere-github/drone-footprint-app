"use client";

interface StatsBarProps {
  stats: {
    totalBuildings: number;
    avgConfidence: number;
    totalArea: number;
    avgHeight: number;
    dataset: string;
    model: string;
    region: string;
    resolution: string;
  };
  visibleCount: number;
}

function Stat({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col items-center px-4 border-r border-white/10 last:border-0">
      <div className="text-white font-bold text-sm tabular-nums">
        {value}
        {unit && <span className="text-white/40 text-[10px] ml-0.5">{unit}</span>}
      </div>
      <div className="text-white/35 text-[9px] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

export default function StatsBar({ stats, visibleCount }: StatsBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pb-2 px-3">
      <div className="glow-border rounded-xl px-4 py-2.5 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center flex-shrink-0">
          <Stat label="Visible" value={visibleCount} />
          <Stat label="Total" value={stats.totalBuildings} />
          <Stat label="Avg Confidence" value={`${(stats.avgConfidence * 100).toFixed(1)}`} unit="%" />
          <Stat label="Avg Height" value={Math.round(stats.avgHeight)} unit="m" />
          <Stat label="Total Area" value={`${(stats.totalArea / 1000).toFixed(1)}`} unit="k m²" />
        </div>
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10 flex-shrink-0">
          <div className="text-right">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Dataset</div>
            <div className="text-[11px] text-white/60 font-medium">MS Global ML (ODbL)</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Model</div>
            <div className="text-[11px] text-cyan-400 font-medium">SegFormer-B5</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Resolution</div>
            <div className="text-[11px] text-white/60 font-medium">{stats.resolution}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
