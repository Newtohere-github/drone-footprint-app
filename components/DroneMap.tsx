"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import { MapLibreOverlay } from "@deck.gl/maplibre";
import { PolygonLayer } from "@deck.gl/layers";
import { BUILDINGS, CLASS_COLORS, CLASS_COLORS_HEX, STATS, type Building, type BuildingClass } from "@/lib/buildingData";
import Sidebar from "./Sidebar";
import InfoPanel from "./InfoPanel";
import StatsBar from "./StatsBar";
import Legend from "./Legend";

const MAP_CENTER: [number, number] = [-122.3355, 47.6082];
const MAP_ZOOM = 15.5;
const MAP_PITCH = 55;
const MAP_BEARING = -20;

// Free open-source map styles
const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite: "https://api.maptiler.com/maps/satellite/style.json?key=get_your_own_key",
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
};

export type MapStyle = keyof typeof MAP_STYLES;

export default function DroneMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapLibreOverlay | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [activeClasses, setActiveClasses] = useState<Set<BuildingClass>>(
    new Set(["Commercial", "Residential", "Industrial", "Mixed-Use", "Infrastructure"])
  );
  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [is3D, setIs3D] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; building: Building } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const getFilteredBuildings = useCallback(() => {
    return BUILDINGS.filter((b) => activeClasses.has(b.buildingClass));
  }, [activeClasses]);

  const buildLayers = useCallback(() => {
    return [
      new PolygonLayer({
        id: "building-footprints",
        data: getFilteredBuildings(),
        pickable: true,
        stroked: true,
        filled: true,
        extruded: is3D,
        wireframe: false,
        getPolygon: (d: Building) => d.coordinates,
        getElevation: (d: Building) => (is3D ? d.height : 0),
        getFillColor: (d: Building) => {
          const color = CLASS_COLORS[d.buildingClass];
          const isSelected = selectedBuilding?.id === d.id;
          const isHovered = hoveredBuilding?.id === d.id;
          if (isSelected) return [255, 255, 255, 220];
          if (isHovered) return [color[0], color[1], color[2], 240];
          return color;
        },
        getLineColor: (d: Building) => {
          const isSelected = selectedBuilding?.id === d.id;
          if (isSelected) return [255, 255, 255, 255];
          return [255, 255, 255, 60];
        },
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 2,
        elevationScale: 1,
        transitions: {
          getFillColor: 200,
          getElevation: 400,
        },
        onHover: (info) => {
          if (info.object) {
            setHoveredBuilding(info.object as Building);
            setTooltip({ x: info.x, y: info.y, building: info.object as Building });
          } else {
            setHoveredBuilding(null);
            setTooltip(null);
          }
        },
        onClick: (info) => {
          if (info.object) {
            setSelectedBuilding((prev) =>
              prev?.id === (info.object as Building).id ? null : (info.object as Building)
            );
          } else {
            setSelectedBuilding(null);
          }
        },
        updateTriggers: {
          getFillColor: [selectedBuilding?.id, hoveredBuilding?.id],
          getLineColor: [selectedBuilding?.id],
          getElevation: [is3D],
          extruded: [is3D],
        },
      }),
    ];
  }, [getFilteredBuildings, is3D, selectedBuilding, hoveredBuilding]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[mapStyle],
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: MAP_PITCH,
      bearing: MAP_BEARING,
      // antialias: true,  // Not in MapOptions type for this maplibre-gl version
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    const overlay = new MapLibreOverlay({
      interleaved: true,
      layers: buildLayers(),
    });

    overlayRef.current = overlay;
    map.addControl(overlay as unknown as maplibregl.IControl);

    map.on("load", () => setIsLoaded(true));

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update overlay layers when filters/selection change
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({ layers: buildLayers() });
  }, [buildLayers]);

  // Update map style
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    if (mapStyle === "satellite") {
      // Satellite needs a token — fall back to hybrid CartoVoyager
      mapRef.current.setStyle(MAP_STYLES.voyager);
    } else {
      mapRef.current.setStyle(MAP_STYLES[mapStyle]);
    }
  }, [mapStyle, isLoaded]);

  // Fly to selected building
  useEffect(() => {
    if (!selectedBuilding || !mapRef.current) return;
    const coords = selectedBuilding.coordinates;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    mapRef.current.flyTo({
      center: [centerLng, centerLat],
      zoom: 17,
      pitch: 60,
      bearing: MAP_BEARING + 10,
      duration: 1200,
      essential: true,
    });
  }, [selectedBuilding]);

  const toggleClass = (cls: BuildingClass) => {
    setActiveClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(cls);
      } else {
        next.add(cls);
      }
      return next;
    });
  };

  const resetView = () => {
    mapRef.current?.flyTo({
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: MAP_PITCH,
      bearing: MAP_BEARING,
      duration: 1000,
    });
    setSelectedBuilding(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0f1e] overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Top header bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#0a0f1e]/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
            title="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-white/80">
              <rect x="1" y="3" width="14" height="1.5" rx="0.75" />
              <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" />
              <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight tracking-tight">
                DroneFootprint<span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-white/40 text-[10px] leading-none">Building Segmentation · Seattle</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Style switcher */}
          <div className="flex rounded-lg overflow-hidden border border-white/10 bg-black/40 backdrop-blur">
            {(["dark", "voyager"] as MapStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setMapStyle(s)}
                className={`px-3 py-1.5 text-xs font-medium transition-all capitalize ${
                  mapStyle === s
                    ? "bg-indigo-500 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {s === "dark" ? "Dark" : "Light"}
              </button>
            ))}
          </div>

          {/* 3D toggle */}
          <button
            onClick={() => setIs3D((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              is3D
                ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-400"
                : "bg-white/5 border-white/10 text-white/50"
            }`}
          >
            {is3D ? "3D" : "2D"}
          </button>

          {/* Reset */}
          <button
            onClick={resetView}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          buildings={BUILDINGS}
          filteredCount={getFilteredBuildings().length}
          activeClasses={activeClasses}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={setSelectedBuilding}
          onToggleClass={toggleClass}
          stats={STATS}
        />
      )}

      {/* Info panel for selected building */}
      {selectedBuilding && (
        <InfoPanel
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}

      {/* Stats bar */}
      <StatsBar
        stats={STATS}
        visibleCount={getFilteredBuildings().length}
      />

      {/* Legend */}
      <Legend
        activeClasses={activeClasses}
        classColors={CLASS_COLORS_HEX}
        onToggle={toggleClass}
      />

      {/* Hover tooltip */}
      {tooltip && !selectedBuilding && (
        <div
          className="absolute z-30 pointer-events-none fade-up"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className="glow-border rounded-lg px-3 py-2 text-xs shadow-xl">
            <div className="font-bold text-white">{tooltip.building.id}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: CLASS_COLORS_HEX[tooltip.building.buildingClass] }}
              />
              <span className="text-white/70">{tooltip.building.buildingClass}</span>
            </div>
            <div className="text-white/50 mt-0.5">
              {tooltip.building.height}m · {(tooltip.building.confidence * 100).toFixed(0)}% conf.
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 bg-[#0a0f1e] flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase animate-pulse">
            Loading Map
          </p>
        </div>
      )}
    </div>
  );
}
