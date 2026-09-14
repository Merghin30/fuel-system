import React, { useState } from "react";
import { Sliders, Eye, RefreshCw, Layers, ShieldCheck, Heart, Battery, Trophy, Award, Star, ShieldAlert } from "lucide-react";

export default function StorybookPlayground() {
  const [selectedComp, setSelectedComp] = useState<"health_card" | "driver_leaderboard" | "fraud_row" | "map_node">("health_card");
  
  // States for interactive prop adjustments
  const [fuelLevel, setFuelLevel] = useState<number>(45);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12.2);
  const [tireFL, setTireFL] = useState<number>(32);
  const [quotaLimit, setQuotaLimit] = useState<number>(200);
  const [quotaUsed, setQuotaUsed] = useState<number>(185);
  
  const [driverEfficiency, setDriverEfficiency] = useState<number>(85);
  const [driverOnTime, setDriverOnTime] = useState<number>(90);
  const [driverFrauds, setDriverFrauds] = useState<number>(0);
  
  const [aiConfidence, setAiConfidence] = useState<number>(94);
  const [alertSeverity, setAlertSeverity] = useState<"critical" | "warning" | "info">("warning");
  const [alertState, setAlertState] = useState<"INVESTIGATING" | "RESOLVED" | "FLAGGED">("INVESTIGATING");

  const [mapMarkerStatus, setMapMarkerStatus] = useState<"moving" | "idle" | "offline" | "locked">("moving");
  const [markerHeading, setMarkerHeading] = useState<number>(45);

  const calculateScore = () => {
    return Math.max(0, Math.min(100, Math.floor((driverEfficiency + driverOnTime) / 2) - driverFrauds * 10));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      
      {/* Selector sidebar (Column 1) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 text-white">
        <div>
          <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">STORYBOOK ISOLATOR</span>
          <h4 className="text-xs font-bold text-slate-350">MOKA Fleet Component Library</h4>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedComp("health_card")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              selectedComp === "health_card" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>Vehicle Health Card</span>
          </button>

          <button
            onClick={() => setSelectedComp("driver_leaderboard")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              selectedComp === "driver_leaderboard" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Driver Standings Card</span>
          </button>

          <button
            onClick={() => setSelectedComp("fraud_row")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              selectedComp === "fraud_row" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Fraud Audit Row</span>
          </button>

          <button
            onClick={() => setSelectedComp("map_node")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              selectedComp === "map_node" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Map Marker Node</span>
          </button>
        </div>
      </div>

      {/* Live rendering sandbox & Controls (Columns 2, 3 & 4) */}
      <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Render card */}
        <div className="bg-slate-905 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between items-center min-h-[360px] relative">
          <span className="absolute top-3 left-3 bg-slate-800/80 border border-slate-700 text-slate-400 font-mono text-[8px] font-bold px-2 py-0.5 rounded uppercase">
            SANDBOX RENDER PREVIEW
          </span>

          <div className="w-full flex-1 flex items-center justify-center pt-6">
            {selectedComp === "health_card" && (
              <div className="w-full max-w-sm p-5 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">KSA FLEET NODE</span>
                    <h5 className="text-xs font-bold font-mono text-slate-300">أ د ح ٩٥١٢ (KSA-4912)</h5>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    quotaUsed >= quotaLimit ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {quotaUsed >= quotaLimit ? "LOCKED (168h)" : "OPERATIONAL"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">PREDICTIVE ESTIMATE</span>
                    <span className="font-mono text-emerald-400 font-bold">94%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[8px] text-slate-500 block">BATTERY</span>
                      <span className="font-bold text-slate-200">{batteryVoltage} V</span>
                    </div>
                    <Battery className={`w-4.5 h-4.5 ${batteryVoltage < 11.5 ? "text-rose-500 animate-bounce" : "text-emerald-500"}`} />
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[8px] text-slate-500 block">FRONT LEFT TIRE</span>
                      <span className="font-bold text-slate-200">{tireFL} PSI</span>
                    </div>
                    <Sliders className={`w-4.5 h-4.5 ${tireFL < 30 ? "text-amber-500 animate-pulse" : "text-emerald-500"}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[9px] text-slate-400 font-mono">FUEL COMPLIANCE</span>
                    <span className="text-[10px] text-slate-300 font-semibold">{quotaUsed} / {quotaLimit} L</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${quotaUsed >= quotaLimit ? "bg-red-500" : "bg-sky-500"}`} style={{ width: `${Math.min(100, (quotaUsed / quotaLimit) * 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            {selectedComp === "driver_leaderboard" && (
              <div className="w-full max-w-sm p-5 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800 mb-3"
                />
                <h5 className="text-xs font-bold">Mohammed Al-Otaibi</h5>
                <span className="mt-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[8px] font-mono font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  ELITE ELITE
                </span>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-800/60 pt-3.5 mt-4 text-center">
                  <div>
                    <span className="text-[8px] text-slate-500 block font-mono">EFFICIENCY</span>
                    <span className="text-xs font-bold text-emerald-400">{driverEfficiency}%</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block font-mono">ON-TIME RATE</span>
                    <span className="text-xs font-bold text-sky-400">{driverOnTime}%</span>
                  </div>
                </div>

                <div className="w-full border-t border-slate-800/40 pt-3 mt-3.5 flex items-center justify-between text-xs">
                  <span className="text-[8px] text-slate-500 font-mono">COMPOSITE SCORE</span>
                  <span className="font-mono font-bold text-orange-500 text-sm">{calculateScore()} / 100</span>
                </div>
              </div>
            )}

            {selectedComp === "fraud_row" && (
              <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 text-white p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${alertSeverity === "critical" ? "bg-red-500 animate-ping" : alertSeverity === "warning" ? "bg-amber-500" : "bg-sky-500"}`} />
                    <span className="font-bold">Siphoning Detected</span>
                  </div>
                  <span className="text-[10px] text-slate-400">08:45 AM</span>
                </div>
                
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-slate-300">
                  Fuel drop event detected outside sasco Riyadh coordinates.
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[9px]">
                  <span>AI CONFIDENCE: <b className="text-red-400">{aiConfidence}%</b></span>
                  <span className="px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase font-bold">{alertState}</span>
                </div>
              </div>
            )}

            {selectedComp === "map_node" && (
              <div className="p-8 rounded-xl bg-slate-950 border border-slate-850 flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {mapMarkerStatus === "moving" && (
                    <div className="absolute w-16 h-16 border border-emerald-500/30 rounded-full animate-ping" />
                  )}
                  {mapMarkerStatus === "locked" && (
                    <div className="absolute w-16 h-16 border border-dashed border-red-500/40 rounded-full animate-spin" style={{ animationDuration: "5s" }} />
                  )}
                  
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white transition-all`}
                    style={{ 
                      backgroundColor: mapMarkerStatus === "moving" ? "#10b981" : mapMarkerStatus === "idle" ? "#f59e0b" : mapMarkerStatus === "offline" ? "#ef4444" : "#000000",
                      transform: `rotate(${markerHeading}deg)`
                    }}
                  >
                    <div className="w-0 h-0 border-left-[4px] border-left-transparent border-right-[4px] border-right-transparent border-bottom-[7px] border-bottom-white mb-0.5" />
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">NODE: ROTATING {markerHeading}°</span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">STATUS: {mapMarkerStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Side Panel */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Sliders className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">PROPS CONTROLLERS</h4>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {selectedComp === "health_card" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">BATTERY VOLTAGE ({batteryVoltage} V)</label>
                  <input
                    type="range"
                    min="10.5"
                    max="14.2"
                    step="0.1"
                    value={batteryVoltage}
                    onChange={(e) => setBatteryVoltage(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">TIRE PRESSURE FL ({tireFL} PSI)</label>
                  <input
                    type="range"
                    min="24"
                    max="45"
                    step="1"
                    value={tireFL}
                    onChange={(e) => setTireFL(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">QUOTA LIMIT ({quotaLimit} L)</label>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={quotaLimit}
                    onChange={(e) => setQuotaLimit(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">QUOTA USED ({quotaUsed} L)</label>
                  <input
                    type="range"
                    min="0"
                    max="550"
                    step="10"
                    value={quotaUsed}
                    onChange={(e) => setQuotaUsed(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            {selectedComp === "driver_leaderboard" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">FUEL ECONOMY ({driverEfficiency}%)</label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="1"
                    value={driverEfficiency}
                    onChange={(e) => setDriverEfficiency(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">ON-TIME DELIVERY ({driverOnTime}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={driverOnTime}
                    onChange={(e) => setDriverOnTime(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">FRAUD INCIDENTS ({driverFrauds})</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={driverFrauds}
                    onChange={(e) => setDriverFrauds(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            {selectedComp === "fraud_row" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">AI CONFIDENCE SCORE ({aiConfidence}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={aiConfidence}
                    onChange={(e) => setAiConfidence(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">SEVERITY LEVEL</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                  >
                    <option value="critical">CRITICAL (RED)</option>
                    <option value="warning">WARNING (AMBER)</option>
                    <option value="info">INFO (BLUE)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">AUDIT STATE</label>
                  <select
                    value={alertState}
                    onChange={(e) => setAlertState(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                  >
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FLAGGED">FLAGGED</option>
                  </select>
                </div>
              </>
            )}

            {selectedComp === "map_node" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">MAP STATUS COLORING</label>
                  <select
                    value={mapMarkerStatus}
                    onChange={(e) => setMapMarkerStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                  >
                    <option value="moving">MOVING (GREEN)</option>
                    <option value="idle">IDLE (YELLOW)</option>
                    <option value="offline">OFFLINE (RED)</option>
                    <option value="locked">LOCKED-168h (BLACK)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono font-bold block uppercase">HEADING DIRECTION ({markerHeading}°)</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={markerHeading}
                    onChange={(e) => setMarkerHeading(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
