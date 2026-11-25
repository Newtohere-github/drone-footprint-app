"use client";

import { type BuildingClass } from "@/lib/buildingData";

interface LegendProps {
  activeClasses: Set<BuildingClass>;
  classColors: Record<BuildingClass, string>;
  onToggle: (cls: BuildingClass) => void;
}

const CLASS_ICONS: Record<BuildingClass, string> = {
  Commercial: "🏢",
  Residential: "🏠",
  Industrial: "🏭",
  "Mixed-Use": "🏪",
  Infrastructure: "🏗️",
};

export default function Legend({ activeClasses, classColors, onToggle }: LegendProps) {
  const classes = Object.keys(classColors) as BuildingClass[];

  return (
    <div className="absolute right-4 bottom-16 z-10">
      <div className="glow-border rounded-xl px-3 py-2.5 shadow-xl">
        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">
          Segmentation Classes
        </p>
        <div className="space-y-1.5">
          {classes.map((cls) => (
            <button
              key={cls}
              onClick={() => onToggle(cls)}
              className={`flex items-center gap-2 w-full text-left transition-all ${
                activeClasses.has(cls) ? "opacity-100" : "opacity-30"
              }`}
            >
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0 transition-all"
                style={{ backgroundColor: classColors[cls] }}
              />
              <span className="text-xs text-white/70 leading-none">
                {CLASS_ICONS[cls]} {cls}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-[9px] text-white/20 leading-relaxed">
            Click polygon to inspect · Scroll to zoom
            <br />
            Right-drag to rotate · Data: ODbL
          </p>
        </div>
      </div>
    </div>
  );
}
