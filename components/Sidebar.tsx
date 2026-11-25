"use client";

import { useState, useMemo } from "react";
import { BUILDINGS, CLASS_COLORS_HEX, type Building, type BuildingClass } from "@/lib/buildingData";

interface SidebarProps {
  buildings: Building[];
  filteredCount: number;
  activeClasses: Set<BuildingClass>;
  selectedBuilding: Building | null;
  onSelectBuilding: (b: Building | null) => void;
  onToggleClass: (cls: BuildingClass) => void;
  stats: Record<string, unknown>;
}

const ALL_CLASSES: BuildingClass[] = ["Commercial", "Residential", "Industrial", "Mixed-Use", "Infrastructure"];

export default function Sidebar({
  buildings,
  filteredCount,
  activeClasses,
  selectedBuilding,
  onSelectBuilding,
  onToggleClass,
  stats,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "height" | "confidence" | "area">("height");

  const filtered = useMemo(() => {
    return buildings
      .filter(
        (b) =>
          activeClasses.has(b.buildingClass) &&
          (b.id.toLowerCase().includes(search.toLowerCase()) ||
            b.buildingClass.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === "id") return a.id.localeCompare(b.id);
        if (sortBy === "height") return b.height - a.height;
        if (sortBy === "confidence") return b.confidence - a.confidence;
        if (sortBy === "area") return b.area - a.area;
        return 0;
      });
  }, [buildings, activeClasses, search, sortBy]);

  const classCounts = useMemo(() => {
    const counts: Partial<Record<BuildingClass, number>> = {};
    buildings.forEach((b) => {
      counts[b.buildingClass] = (counts[b.buildingClass] || 0) + 1;
    });
    return counts;
  }, [buildings]);

  return (
    <aside className="absolute left-0 top-0 bottom-0 z-10 w-72 flex flex-col pt-16 pb-16">
      <div className="mx-3 flex flex-col gap-3 h-full overflow-hidden">
        {/* Dataset info card */}
        <div className="glow-border rounded-xl p-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 dot-pulse" />
            <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
              Live Dataset
            </span>
          </div>
          <p className="text-white/80 text-xs leading-relaxed">
            <span className="text-cyan-400 font-semibold">Microsoft Global ML Footprints</span> (ODbL)
            <br />
            Model: <span className="text-indigo-300">SegFormer-B5</span> + INRIA fine-tune
            <br />
            Region: <span className="text-white/60">Seattle Downtown, WA</span>
            <br />
            Resolution: <span className="text-white/60">30 cm GSD</span>
          </p>
        </div>

        {/* Class filters */}
        <div className="glow-border rounded-xl p-3 flex-shrink-0">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Class Filter</p>
          <div className="flex flex-col gap-1.5">
            {ALL_CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => onToggleClass(cls)}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                  activeClasses.has(cls)
                    ? "border-white/10 bg-white/5"
                    : "border-transparent bg-transparent opacity-40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: CLASS_COLORS_HEX[cls] }}
                  />
                  <span className="text-white/80">{cls}</span>
                </div>
                <span className="text-white/40 font-mono text-[10px]">
                  {classCounts[cls] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Building list */}
        <div className="glow-border rounded-xl p-3 flex flex-col min-h-0 flex-1">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              Buildings ({filteredCount})
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-[10px] bg-white/5 border border-white/10 rounded px-1 py-0.5 text-white/60 outline-none cursor-pointer"
            >
              <option value="height">Height</option>
              <option value="confidence">Confidence</option>
              <option value="area">Area</option>
              <option value="id">ID</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID or class…"
            className="w-full mb-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 placeholder-white/20 outline-none focus:border-cyan-400/50 transition-colors flex-shrink-0"
          />

          {/* List */}
          <div className="overflow-y-auto flex-1 -mr-1 pr-1 space-y-1">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBuilding(selectedBuilding?.id === b.id ? null : b)}
                className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition-all border ${
                  selectedBuilding?.id === b.id
                    ? "bg-indigo-500/20 border-indigo-400/50 text-white"
                    : "bg-white/[0.03] border-transparent hover:bg-white/[0.07] text-white/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: CLASS_COLORS_HEX[b.buildingClass] }}
                    />
                    <span className="font-mono font-semibold">{b.id}</span>
                  </div>
                  <span className="text-[10px] text-white/40">{b.height}m</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-white/40">{b.buildingClass}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${b.confidence * 100}%`,
                          backgroundColor: b.confidence > 0.95 ? "#22d3ee" : b.confidence > 0.9 ? "#818cf8" : "#fb923c",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-white/30">
                      {(b.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
