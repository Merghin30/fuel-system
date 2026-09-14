import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, unlockComplianceVehicle, adjustQuota } from "./store";
import { Vehicle } from "./types";
import { AlertOctagon, Heart, Radio, Battery, Sliders, ShieldAlert, Key, Unlock, AlertTriangle, Settings, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function VehicleHealth() {
  const dispatch = useDispatch();
  const { list: vehicles } = useSelector((state: RootState) => state.vehicles);
  const { lang, theme, corridorFilter } = useSelector((state: RootState) => state.config);
  
  const [editingQuotaId, setEditingQuotaId] = useState<string | null>(null);
  const [quotaInputValue, setQuotaInputValue] = useState<string>("");

  const isDark = theme === "dark";

  const filteredVehicles = vehicles.filter(v => {
    if (corridorFilter === "ksa" && !v.plateNumber.includes("KSA")) return false;
    if (corridorFilter === "sudan" && !v.plateNumber.includes("SUD")) return false;
    return true;
  });

  // Calculate generic health score from components
  const getHealthScore = (v: Vehicle) => {
    let score = 100;
    // Lower score for low battery
    if (v.batteryStatus < 12.0) score -= 15;
    // Lower score for low tire pressure
    v.tirePressure.forEach(p => {
      if (p < 30 || p > 38) score -= 5;
    });
    // Lower score if fuel is critical
    if (v.fuelLevel < 15) score -= 10;
    // Lower score if quota exceeded
    if (v.complianceUsed > v.complianceQuota) score -= 20;
    return Math.max(20, score);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((v) => {
          const healthScore = getHealthScore(v);
          const isLocked = v.status === "locked";
          const isOffline = v.status === "offline";

          return (
            <div
              key={v.id}
              className={`p-5 rounded-2xl border transition-all ${
                isLocked 
                  ? "bg-slate-950 border-red-500/40 shadow-lg shadow-red-500/5 text-white" 
                  : isDark 
                    ? "bg-slate-900 border-slate-800 text-white" 
                    : "bg-white border-slate-100 text-slate-850"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-3 mb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {v.plateNumber.includes("KSA") ? "KSA FLEET NODE" : "SUDAN CORRIDOR NODE"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-slate-300">
                    {v.plateNumber}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">{v.driverName}</p>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                    isLocked ? "bg-red-500 text-white animate-pulse" :
                    isOffline ? "bg-rose-500/10 text-rose-450" :
                    v.status === "moving" ? "bg-emerald-500/10 text-emerald-450" :
                    "bg-amber-500/10 text-amber-450"
                  }`}>
                    {isLocked ? "LOCKED (168h)" : v.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1">{v.lastUpdate}</span>
                </div>
              </div>

              {/* Predictive Core Integrity Gauge */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px]">
                    <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    PREDICTIVE HEALTH ESTIMATE
                  </span>
                  <span className={`font-mono font-extrabold ${
                    healthScore >= 90 ? "text-emerald-400" : healthScore >= 75 ? "text-amber-400" : "text-rose-450 animate-pulse"
                  }`}>{healthScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      healthScore >= 90 ? "bg-emerald-500" : healthScore >= 75 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>

              {/* IoT Telemetry Metrics Grid (Battery, Tires, Quotas) */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* 1. Battery Voltage */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLocked ? "bg-slate-900 border-slate-800" : isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">BATTERY CELL</span>
                    <span className="text-xs font-bold font-mono text-slate-100">{v.batteryStatus} V</span>
                  </div>
                  <Battery className={`w-5 h-5 ${v.batteryStatus < 11.5 ? "text-rose-500 animate-bounce" : "text-emerald-500"}`} />
                </div>

                {/* 2. Low Tire Check */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLocked ? "bg-slate-900 border-slate-800" : isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">TIRES (PSI)</span>
                    <span className="text-xs font-bold font-mono text-slate-100">
                      [{v.tirePressure.join(", ")}]
                    </span>
                  </div>
                  <AlertOctagon className={`w-5 h-5 ${
                    v.tirePressure.some(p => p < 30 || p > 36) ? "text-amber-500 animate-pulse" : "text-emerald-500"
                  }`} />
                </div>
              </div>

              {/* Weekly Fuel Quota progress bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">GOVERNMENT QUOTA USAGE</span>
                  <span className="font-mono text-slate-300 font-semibold">{v.complianceUsed} / {v.complianceQuota} L</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      v.complianceUsed >= v.complianceQuota ? "bg-red-500 animate-pulse" : "bg-sky-500"
                    }`}
                    style={{ width: `${Math.min(100, (v.complianceUsed / v.complianceQuota) * 100)}%` }}
                  />
                </div>
                {v.complianceUsed >= v.complianceQuota && (
                  <span className="text-[9px] text-red-400 font-mono font-bold flex items-center gap-1 animate-pulse pt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    QUOTA BREACH: VEHICLE AUTO-LOCKED
                  </span>
                )}
              </div>

              {/* Action overriding options */}
              <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between gap-2">
                
                {/* 1. Admin overriding adjustment */}
                {editingQuotaId === v.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="number"
                      value={quotaInputValue}
                      onChange={(e) => setQuotaInputValue(e.target.value)}
                      className="bg-slate-900 border border-slate-750 text-xs font-mono font-bold text-white px-2 py-1 rounded w-full focus:outline-none"
                      placeholder="New Quota"
                    />
                    <button
                      onClick={() => {
                        const val = parseInt(quotaInputValue);
                        if (!isNaN(val) && val > 0) {
                          dispatch(adjustQuota({ id: v.id, quota: val }));
                        }
                        setEditingQuotaId(null);
                      }}
                      className="px-2.5 py-1 bg-emerald-500 text-white font-mono text-[9px] font-bold rounded hover:bg-emerald-600 transition-all"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => setEditingQuotaId(null)}
                      className="px-2 py-1 bg-slate-800 text-slate-300 font-mono text-[9px] font-bold rounded hover:bg-slate-700 transition-all"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingQuotaId(v.id);
                      setQuotaInputValue(v.complianceQuota.toString());
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-mono font-bold border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3 text-slate-400" />
                    ADJUST LIMIT
                  </button>
                )}

                {/* 2. Lock status override (Unlock 168h mechanism) */}
                {isLocked && (
                  <button
                    onClick={() => dispatch(unlockComplianceVehicle(v.id))}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[9px] font-mono font-extrabold transition-all flex items-center gap-1.5 animate-pulse shadow-lg shadow-red-500/20 active:scale-95"
                  >
                    <Unlock className="w-3 h-3" />
                    UNLOCK 168h
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
