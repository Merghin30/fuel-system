import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, selectVehicle } from "./store";
import { Vehicle } from "./types";
import { Compass, Maximize2, Minimize2, MapPin, AlertTriangle, ShieldCheck, ShieldAlert, Crosshair, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Geofence conflict zones (KSA & Sudan border and Port Sudan corridor)
const conflictZones = [
  {
    name: "Darfur Restricted Region",
    lat: 13.5,
    lng: 24.5,
    radius: 120000, // meters for leaflet, SVG coordinate projection for fallback
    severity: "critical",
    description: "Active military corridor. Unauthorized entry triggers engine block."
  },
  {
    name: "Red Sea Maritime Zone",
    lat: 19.8,
    lng: 38.5,
    radius: 90000,
    severity: "warning",
    description: "Customs checkpoints corridor. High risk of signal jam."
  }
];

export default function MapComponent() {
  const dispatch = useDispatch();
  const { list: vehicles, selectedId } = useSelector((state: RootState) => state.vehicles);
  const { lang, theme, corridorFilter } = useSelector((state: RootState) => state.config);

  const selectedVehicle = vehicles.find(v => v.id === selectedId);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [viewCenter, setViewCenter] = useState<[number, number]>([21.5, 43.5]); // Red Sea centering both countries

  // Dynamically load Leaflet library and its stylesheet
  useEffect(() => {
    let active = true;

    // Load Leaflet stylesheet if not present
    if (!document.getElementById("leaflet-css-link")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-link";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initLeaflet = async () => {
      try {
        // Import leaflet dynamically to prevent SSR/Node compilation issues
        const L = (await import("leaflet")).default;
        LRef.current = L;
        
        if (!active || !mapContainerRef.current) return;

        // Clean up previous map instance if any
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Initialize map
        const map = L.map(mapContainerRef.current, {
          center: viewCenter,
          zoom: zoomLevel,
          zoomControl: false,
          attributionControl: false
        });

        // Set tile layer based on theme
        const tileUrl = theme === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          maxZoom: 18
        }).addTo(map);

        // Render conflict zones
        conflictZones.forEach(zone => {
          L.circle([zone.lat, zone.lng], {
            radius: zone.radius,
            color: zone.severity === "critical" ? "#ef4444" : "#f59e0b",
            fillColor: zone.severity === "critical" ? "#ef4444" : "#f59e0b",
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: "5, 5"
          })
          .addTo(map)
          .bindPopup(`<b>${zone.name}</b><br/>${zone.description}`);
        });

        // Create marker layers group and add to map
        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;

        mapRef.current = map;
        setMapReady(true);
        setUseFallback(false);
      } catch (err) {
        console.warn("Leaflet loading failed or blocked. Activating ultra-polished SVG fallback system...", err);
        setUseFallback(true);
      }
    };

    initLeaflet();

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [theme]);

  // Update markers and paths dynamically when vehicles/filters change
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current || !markersGroupRef.current) return;

    const L = LRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous markers & paths from the group
    markersGroup.clearLayers();

    // Helper for status colors
    const getStatusColorHex = (status: Vehicle["status"]) => {
      switch (status) {
        case "moving": return "#10b981"; // green
        case "idle": return "#f59e0b"; // yellow
        case "offline": return "#ef4444"; // red
        case "locked": return "#000000"; // black
      }
    };

    // Render vehicle markers
    vehicles.forEach(vehicle => {
      // Filter out if corridor doesn't match
      if (corridorFilter === "ksa" && !vehicle.plateNumber.includes("KSA")) return;
      if (corridorFilter === "sudan" && !vehicle.plateNumber.includes("SUD")) return;

      const color = getStatusColorHex(vehicle.status);
      const shadowColor = vehicle.status === "locked" ? "rgba(0,0,0,0.6)" : `${color}88`;

      // Custom DivIcon representing futuristic vehicle node
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            ${vehicle.status === "moving" ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${color}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.5;"></div>` : ""}
            ${vehicle.status === "locked" ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px dashed #ef4444; animation: spin 4s linear infinite; opacity: 0.7;"></div>` : ""}
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; border: 2px solid #fff; box-shadow: 0 0 10px ${shadowColor}; display: flex; align-items: center; justify-content: center; transform: rotate(${vehicle.heading}deg); transition: all 0.3s ease;">
              <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-bottom: 5px solid #fff; margin-bottom: 1px;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: customIcon })
        .addTo(markersGroup)
        .on("click", () => {
          dispatch(selectVehicle(vehicle.id));
        });

      marker.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 4px; border-radius: 4px;">
          <b>${vehicle.driverName}</b><br/>
          <span>${vehicle.plateNumber}</span><br/>
          <span style="font-weight: bold; color: ${color};">${vehicle.status.toUpperCase()} (${vehicle.speed} km/h)</span>
        </div>
      `, { direction: "top", offset: [0, -10] });

      // Add path lines/breadcrumbs
      if (vehicle.routeHistory.length > 1) {
        L.polyline(vehicle.routeHistory, {
          color: color,
          weight: 2,
          opacity: 0.5,
          dashArray: "3, 5"
        }).addTo(markersGroup);
      }
    });
  }, [vehicles, corridorFilter, mapReady, dispatch]);

  // Center on selected vehicle
  useEffect(() => {
    if (mapReady && mapRef.current && selectedVehicle) {
      mapRef.current.setView([selectedVehicle.latitude, selectedVehicle.longitude], 8, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedId, mapReady, selectedVehicle]);

  // SVG Fallback Projection Helpers
  // Map lat/long of Saudi/Sudan region to beautiful 2D plane coordinates
  // Lat range: 12 to 32, Long range: 21 to 55
  const projectCoords = (lat: number, lng: number) => {
    const minLat = 12;
    const maxLat = 32;
    const minLng = 21;
    const maxLng = 55;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100; // percent width
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100; // percent height
    return { x, y };
  };

  const filteredVehicles = vehicles.filter(v => {
    if (corridorFilter === "ksa" && !v.plateNumber.includes("KSA")) return false;
    if (corridorFilter === "sudan" && !v.plateNumber.includes("SUD")) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[450px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[10px] font-mono font-bold text-orange-450 rounded-xl shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {useFallback ? "TACTICAL VECTOR RADAR" : "LEAFLET REAL-TIME RADAR"}
          </span>
          <span className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono font-semibold text-slate-300 rounded-xl shadow-lg">
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            <span>{lang === "ar" ? "قمر صناعي مشفر" : "ENCRYPTED TRANS-BORDER UP"}</span>
          </span>
        </div>

        <div className="flex gap-1.5 pointer-events-auto">
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([21.5, 43.5], 5);
              }
            }}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md rounded-xl shadow-lg transition-all active:scale-95"
            title="Recenter Radar"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Leaflet Container if not fallback */}
      {!useFallback ? (
        <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />
      ) : (
        /* Polish Fallback Vector SVG Map representation */
        <div className="relative w-full h-full flex-1 bg-[#0b1329] bg-[radial-gradient(ellipse_at_center,rgba(17,24,39,1)_0%,rgba(11,19,41,1)_100%)] flex items-center justify-center overflow-hidden">
          {/* Futuristic HUD crosshair grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none"></div>
          
          {/* Animated tactical circles */}
          <div className="absolute w-[600px] h-[600px] border border-sky-500/10 rounded-full animate-pulse pointer-events-none"></div>
          <div className="absolute w-[400px] h-[400px] border border-sky-500/5 rounded-full pointer-events-none"></div>

          {/* SVG Map Content */}
          <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw Red Sea Corridor Outline path */}
            <path
              d="M 68 15 Q 60 40, 48 70 T 36 95"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              className="opacity-40 animate-pulse"
            />
            
            {/* Draw Saudi Arabia Core Area (Riyadh/Jeddah region background representation) */}
            <circle cx="70" cy="40" r="18" fill="#10b981" className="opacity-5 blur-xl" />
            
            {/* Draw Sudan Core Area (Khartoum region background representation) */}
            <circle cx="35" cy="75" r="16" fill="#38bdf8" className="opacity-5 blur-xl" />

            {/* Geofence Circles */}
            {conflictZones.map((zone, idx) => {
              const pos = projectCoords(zone.lat, zone.lng);
              const color = zone.severity === "critical" ? "#ef4444" : "#f59e0b";
              return (
                <g key={idx}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={zone.radius / 18000} // scale representation
                    fill={color}
                    fillOpacity="0.08"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeDasharray="1 2"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="1"
                    fill={color}
                    className="animate-ping"
                  />
                </g>
              );
            })}

            {/* Breadcrumb route trails for moving/history */}
            {filteredVehicles.map(v => {
              if (v.routeHistory.length < 2) return null;
              const points = v.routeHistory.map(coord => {
                const pos = projectCoords(coord[0], coord[1]);
                return `${pos.x},${pos.y}`;
              }).join(" ");

              const statusColor = v.status === "locked" ? "#000000" : v.status === "moving" ? "#10b981" : v.status === "idle" ? "#f59e0b" : "#ef4444";

              return (
                <polyline
                  key={`trail-${v.id}`}
                  points={points}
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="0.5"
                  opacity="0.3"
                  strokeDasharray="1 1"
                />
              );
            })}

            {/* Vehicle nodes */}
            {filteredVehicles.map(v => {
              const pos = projectCoords(v.latitude, v.longitude);
              const isSelected = v.id === selectedId;
              const statusColor = v.status === "locked" ? "#000000" : v.status === "moving" ? "#10b981" : v.status === "idle" ? "#f59e0b" : "#ef4444";

              return (
                <g
                  key={v.id}
                  className="cursor-pointer"
                  onClick={() => dispatch(selectVehicle(v.id))}
                >
                  {/* Outer Pulsing Aura */}
                  {v.status === "moving" && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill="none"
                      stroke={statusColor}
                      strokeWidth="0.3"
                      className="origin-center animate-ping"
                    />
                  )}
                  {/* Selected Highlight Box */}
                  {isSelected && (
                    <rect
                      x={pos.x - 3}
                      y={pos.y - 3}
                      width="6"
                      height="6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="0.5"
                      className="animate-spin"
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px`, animationDuration: "8s" }}
                    />
                  )}
                  {/* Main Node Point */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 1.8 : 1.2}
                    fill={statusColor}
                    stroke={isSelected ? "#fff" : "rgba(255,255,255,0.7)"}
                    strokeWidth="0.3"
                  />
                  {/* Simple text label */}
                  <text
                    x={pos.x}
                    y={pos.y - 2.5}
                    fill="#94a3b8"
                    fontSize="1.8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-bold drop-shadow"
                  >
                    {v.plateNumber.split(" ")[v.plateNumber.split(" ").length - 1].replace(/[()]/g, "")}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Compass Rose Accent */}
          <div className="absolute bottom-5 right-5 w-16 h-16 opacity-30 flex items-center justify-center select-none pointer-events-none">
            <Compass className="w-12 h-12 text-slate-500 animate-spin-slow" />
            <span className="absolute text-[8px] font-mono text-slate-400 font-bold tracking-widest mt-10">N</span>
          </div>
        </div>
      )}

      {/* Slide-out Panel Overlay: Selected Vehicle telemetry summary card */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedVehicle.status === "moving" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                selectedVehicle.status === "idle" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                selectedVehicle.status === "offline" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                "bg-slate-950 text-red-500 border border-red-500/40"
              }`}>
                {selectedVehicle.status === "locked" ? (
                  <ShieldAlert className="w-5.5 h-5.5 animate-pulse" />
                ) : (
                  <MapPin className="w-5.5 h-5.5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">{selectedVehicle.driverName}</h4>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    selectedVehicle.status === "moving" ? "bg-emerald-500/20 text-emerald-300" :
                    selectedVehicle.status === "idle" ? "bg-amber-500/20 text-amber-300" :
                    selectedVehicle.status === "offline" ? "bg-rose-500/20 text-rose-300" :
                    "bg-red-500 text-white animate-pulse"
                  }`}>
                    {selectedVehicle.status === "locked" ? (lang === "ar" ? "مقفل بروتوكول ١٦٨ساعة" : "168H LOCKED") : selectedVehicle.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {lang === "ar" ? "لوحة ترخيص" : "License"}: <span className="text-slate-300 font-semibold">{selectedVehicle.plateNumber}</span> • {selectedVehicle.lastUpdate}
                </p>
              </div>
            </div>

            {/* Horizontal Stats */}
            <div className="grid grid-cols-3 gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === "ar" ? "السرعة" : "SPEED"}</span>
                <span className="text-xs font-bold font-mono text-slate-100">{selectedVehicle.speed} km/h</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === "ar" ? "مستوى الوقود" : "FUEL LEVEL"}</span>
                <span className={`text-xs font-bold font-mono ${selectedVehicle.fuelLevel <= 20 ? "text-rose-450 animate-pulse" : "text-slate-100"}`}>{selectedVehicle.fuelLevel}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === "ar" ? "الاستهلاك" : "QUOTA USED"}</span>
                <span className="text-xs font-bold font-mono text-slate-100">{selectedVehicle.complianceUsed} / {selectedVehicle.complianceQuota} L</span>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => dispatch(selectVehicle(null))}
                className="w-full md:w-auto px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all border border-slate-700 hover:border-slate-600"
              >
                {lang === "ar" ? "إغلاق" : "CLOSE"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
