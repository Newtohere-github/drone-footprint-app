"use client";

import dynamic from "next/dynamic";

const DroneMap = dynamic(() => import("@/components/DroneMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0a0f1e]">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/30 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
        </div>
      </div>
      <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase animate-pulse">
        Initialising Geospatial Engine
      </p>
      <p className="text-slate-500 text-xs mt-2">
        Loading map tiles &amp; ML footprint data…
      </p>
    </div>
  ),
});

export default function MapWrapper() {
  return <DroneMap />;
}
