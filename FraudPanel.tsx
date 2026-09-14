import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, addAlert, updateAlertStatus, clearToast } from "./store";
import { FraudAlert } from "./types";
import { ShieldAlert, AlertTriangle, CheckCircle, Search, HelpCircle, ArrowRight, ShieldCheck, Play, Bell, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FraudPanel() {
  const dispatch = useDispatch();
  const { list: alerts, toasts } = useSelector((state: RootState) => state.alerts);
  const { lang, theme } = useSelector((state: RootState) => state.config);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const isDark = theme === "dark";
  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  // Helper colors for severity
  const getSeverityBadge = (severity: FraudAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "info":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    }
  };

  // Status colors
  const getStatusBadge = (status: FraudAlert["status"]) => {
    switch (status) {
      case "INVESTIGATING":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "FLAGGED":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "DISMISSED":
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  // Mock simulator triggers
  const triggerMockAlert = (type: FraudAlert["type"]) => {
    const randomVehicleId = `v-${Math.floor(Math.random() * 6) + 1}`;
    
    // Anomaly definitions
    let details = "";
    let severity: "critical" | "warning" | "info" = "warning";
    let score = 85;

    switch (type) {
      case "Siphoning Detected":
        details = "Sudden drop of 38 liters detected within 3 minutes in Omdurman corridor.";
        severity = "critical";
        score = 96;
        break;
      case "Card Spoofing":
        details = "Unusual transaction attempt with cloned NFC sequence at Sasco Riyadh.";
        severity = "critical";
        score = 92;
        break;
      case "Double Fueling":
        details = "Same fleet vehicle registered filling up at Sasco and Aldrees within 4 minutes.";
        severity = "warning";
        score = 79;
        break;
      case "Geofence Violation":
        details = "GPS transponder logs vehicle entering restricted conflict border coordinates.";
        severity = "critical";
        score = 98;
        break;
      case "Quota Bypass Attempt":
        details = "User attempted to bypass 168-hour administrative quota lock using override card.";
        severity = "warning";
        score = 83;
        break;
    }

    dispatch(addAlert({
      vehicleId: randomVehicleId,
      plateNumber: `أ د ح ${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: "System Generated Mock",
      type,
      severity,
      confidenceScore: score,
      details,
      pumpNumber: Math.floor(Math.random() * 8) + 1
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Interactive Simulation Header Box */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <Play className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{lang === "ar" ? "محاكي تنبيهات الاحتيال" : "Real-Time AI Anomaly Injector"}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === "ar" ? "قم باختبار درع الأمان بإرسال حركات احتيال مشبوهة فورية لمشاهدة رد فعل الخوارزميات." : "Inject mock telemetry scenarios to test AI validation rules, trigger alerts, and audit investigations."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerMockAlert("Siphoning Detected")}
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 text-[10px] font-mono font-bold rounded-xl border border-rose-500/20 transition-all active:scale-95"
            >
              + SIPHONING
            </button>
            <button
              onClick={() => triggerMockAlert("Card Spoofing")}
              className="px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-450 text-[10px] font-mono font-bold rounded-xl border border-yellow-500/20 transition-all active:scale-95"
            >
              + CARD SPOOF
            </button>
            <button
              onClick={() => triggerMockAlert("Geofence Violation")}
              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-450 text-[10px] font-mono font-bold rounded-xl border border-red-500/20 transition-all active:scale-95"
            >
              + GEOFENCE BREACH
            </button>
          </div>
        </div>
      </div>

      {/* 2. Fraud Real-Time Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ transform: "translateY(50px) scale(0.9)", opacity: 0 }}
              animate={{ transform: "translateY(0) scale(1)", opacity: 1 }}
              exit={{ transform: "scale(0.85)", opacity: 0 }}
              className="p-4 bg-slate-950 border border-red-500/40 text-white rounded-xl shadow-2xl flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 animate-pulse mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 font-extrabold uppercase">CRITICAL FRAUD INTRUSION</span>
                  <button onClick={() => dispatch(clearToast(toast.id))} className="text-slate-500 hover:text-white p-0.5 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-xs font-bold">{toast.type}</h4>
                <p className="text-[10px] text-slate-400 leading-normal">{toast.details}</p>
                <div className="pt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>CONFIDENCE: <b className="text-red-400">{toast.confidenceScore}%</b></span>
                  <span>{toast.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. Investigation Table */}
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
      }`}>
        <div className="space-y-1 mb-6">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold block">
            {lang === "ar" ? "درع الحماية والتدقيق" : "AI INVESTIGATION & FORENSIC LEDGER"}
          </span>
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{lang === "ar" ? "قائمة تدقيق الاحتيال والجرائم المالية" : "System Anomalies & Audit Ledger"}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">{lang === "ar" ? "التنبيه" : "ANOMALY TYPE"}</th>
                <th className="pb-3 font-semibold">{lang === "ar" ? "المركبة والملف" : "VEHICLE & OPERATOR"}</th>
                <th className="pb-3 font-semibold text-center">{lang === "ar" ? "نسبة التأكيد" : "AI SCORE"}</th>
                <th className="pb-3 font-semibold text-center">{lang === "ar" ? "الحالة" : "AUDIT STATE"}</th>
                <th className="pb-3 font-semibold text-right">{lang === "ar" ? "خيارات" : "OPTIONS"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {alerts.map((alert) => (
                <tr key={alert.id} className={`hover:bg-slate-800/20 transition-all ${selectedAlertId === alert.id ? "bg-slate-800/30" : ""}`}>
                  <td className="py-3.5 pr-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === "critical" ? "bg-rose-500 animate-ping" : alert.severity === "warning" ? "bg-amber-500" : "bg-sky-500"
                      }`} />
                      <div>
                        <h4 className="font-bold text-slate-200">{alert.type}</h4>
                        <span className="text-[9px] text-slate-500 font-mono block">{alert.timestamp}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <h5 className="font-medium text-slate-300">{alert.driverName}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.plateNumber}</span>
                  </td>
                  <td className="py-3.5 text-center font-mono font-bold">
                    <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                      {alert.confidenceScore}%
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setSelectedAlertId(selectedAlertId === alert.id ? null : alert.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono font-semibold border border-slate-700 hover:border-slate-600 transition-all"
                    >
                      {selectedAlertId === alert.id ? (lang === "ar" ? "إخفاء" : "COLLAPSE") : (lang === "ar" ? "معاينة" : "AUDIT")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Action/Audit Details Drawer (Inline) */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`p-5 rounded-2xl border overflow-hidden ${
              isDark ? "bg-slate-950 border-red-500/20 text-white" : "bg-slate-50 border-red-500/10 text-slate-800"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-mono text-red-400">
                    {lang === "ar" ? "تفاصيل ملف القضية والتأكيد الجنائي" : "CASE FILE OVERVIEW & AUDIT TRAILS"}
                  </h4>
                </div>
                <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <p className="leading-relaxed"><b className="text-white">Telemetry Description:</b> {selectedAlert.details}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Incident ID: {selectedAlert.id} • Pump No: {selectedAlert.pumpNumber || "N/A"}</p>
                </div>
              </div>

              {/* Forensic Action Options */}
              <div className="space-y-3 shrink-0 w-full md:w-64">
                <h5 className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{lang === "ar" ? "اتخاذ قرار التدقيق" : "AUDIT DECISION ACTIONS"}</h5>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      dispatch(updateAlertStatus({ id: selectedAlert.id, status: "RESOLVED" }));
                      setSelectedAlertId(null);
                    }}
                    className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold rounded-xl transition-all"
                  >
                    RESOLVE
                  </button>
                  <button
                    onClick={() => {
                      dispatch(updateAlertStatus({ id: selectedAlert.id, status: "FLAGGED" }));
                      setSelectedAlertId(null);
                    }}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold rounded-xl transition-all"
                  >
                    FLAG RED
                  </button>
                  <button
                    onClick={() => {
                      dispatch(updateAlertStatus({ id: selectedAlert.id, status: "DISMISSED" }));
                      setSelectedAlertId(null);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold rounded-xl transition-all"
                  >
                    DISMISS
                  </button>
                  <button
                    onClick={() => setSelectedAlertId(null)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold rounded-xl transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
