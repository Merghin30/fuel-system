import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { 
  store, 
  RootState, 
  triggerRadarPulse, 
  toggleTheme, 
  setLang, 
  setCurrency, 
  setSubTab, 
  setCorridorFilter, 
  initialFuelTransactions 
} from "./store";
import MapComponent from "./MapComponent";
import ChartsSection from "./ChartsSection";
import FraudPanel from "./FraudPanel";
import VehicleHealth from "./VehicleHealth";
import DriverPerformance from "./DriverPerformance";
import StorybookPlayground from "./StorybookPlayground";
import OperationsRoomDashboard from "../OperationsRoomDashboard";
import AIFraudDetectionHub from "../AIFraudDetectionHub";
import OfflineFuelingSyncEngine from "../OfflineFuelingSyncEngine";
import { 
  Building2, Users, Truck, Database, Activity, ShieldAlert,
  Sun, Moon, Globe, RefreshCw, Layers, Sliders, MapIcon, Compass, Award, Heart, HelpCircle
} from "lucide-react";

// Translations mapping
const translations = {
  en: {
    ops_room: "MOKA Operations Control Room",
    subtitle: "Real-Time Fleet Intelligence & Fraud Shield Gateway",
    all_corridors: "All Corridors",
    ksa_corridor: "KSA Corridor Only",
    sudan_corridor: "Sudan Corridor Only",
    tab_dashboard: "Live Operations Deck",
    tab_storybook: "Interactive Storybook Components",
    theme_light: "Light Mode",
    theme_dark: "Dark Mode",
    metrics_active: "Active Transponders",
    metrics_critical: "Critical Threats",
    metrics_volume: "Total Volume managed",
    metrics_efficiency: "Fleet Avg Efficiency",
    currency_sar: "SAR Mode",
    currency_sdg: "SDG Mode",
    toggle_lang: "عربي"
  },
  ar: {
    ops_room: "غرفة عمليات الأسطول المركزية موكا",
    subtitle: "بوابة ذكاء الأسطول الفوري ورادار درع الاحتيال الذكي",
    all_corridors: "كافة المسارات الإقليمية",
    ksa_corridor: "المسار السعودي فقط",
    sudan_corridor: "المسار السوداني فقط",
    tab_dashboard: "لوحة العمليات المباشرة",
    tab_storybook: "مكتبة المكونات التفاعلية (Storybook)",
    theme_light: "الوضع المضيء",
    theme_dark: "الوضع الداكن",
    metrics_active: "الأجهزة النشطة بالرادار",
    metrics_critical: "الانتهاكات والتهديدات الحرجة",
    metrics_volume: "إجمالي الوقود المدار",
    metrics_efficiency: "متوسط الكفاءة العام للأسطول",
    currency_sar: "عرض بالريال السعودي",
    currency_sdg: "عرض بالجنيه السوداني",
    toggle_lang: "English"
  }
};

function OperationsRoomContent() {
  const dispatch = useDispatch();
  
  // Redux selects
  const { list: vehicles } = useSelector((state: RootState) => state.vehicles);
  const { list: alerts } = useSelector((state: RootState) => state.alerts);
  const { theme, lang, currency, activeSubTab, corridorFilter } = useSelector((state: RootState) => state.config);

  const [simSeconds, setSimSeconds] = useState(5);
  const [isSimulating, setIsSimulating] = useState(true);

  const t = translations[lang];
  const isRTL = lang === "ar";
  const isDark = theme === "dark";

  // Real-time automatic GPS telemetry simulation ticker (Mocking WebSockets)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimSeconds((prev) => {
        if (prev <= 1) {
          return 5; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Dispatch radar sweep when simSeconds resets to 5
  useEffect(() => {
    if (simSeconds === 5 && isSimulating) {
      dispatch(triggerRadarPulse());
    }
  }, [simSeconds, isSimulating, dispatch]);

  // Derived dashboard metrics
  const activeCount = vehicles.filter(v => v.status === "moving" || v.status === "idle").length;
  const criticalCount = alerts.filter(a => a.severity === "critical" && a.status === "INVESTIGATING").length;
  const totalVolume = vehicles.reduce((sum, v) => sum + v.complianceUsed, 0) + 12450;
  const avgEfficiency = (vehicles.reduce((sum, v) => sum + v.fuelEfficiency, 0) / vehicles.length).toFixed(1);

  return (
    <div 
      className={`min-h-screen font-sans antialiased pb-20 transition-all duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      
      {/* 1. Header Control panel */}
      <div className={`border-b px-6 py-5 sticky top-0 z-30 backdrop-blur-md shadow-sm transition-colors ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <span>{t.ops_room}</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">{t.subtitle}</p>
          </div>

          {/* Controls button deck */}
          <div className="flex flex-wrap items-center gap-2 md:self-center">
            {/* Simulation heartbeat controller */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${
                isSimulating 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title="Click to toggle automatic mock WebSocket transponder simulation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }} />
              <span>{isSimulating ? `LIVE SWEEP T-MINUS ${simSeconds}s` : "SIMULATOR HOLD"}</span>
            </button>

            {/* Language Selector */}
            <button
              onClick={() => dispatch(setLang(lang === "en" ? "ar" : "en"))}
              className={`p-2 rounded-xl border transition-all hover:bg-slate-850 flex items-center gap-1.5 text-xs font-mono font-semibold ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              <Globe className="w-4 h-4 text-orange-500" />
              <span>{t.toggle_lang}</span>
            </button>

            {/* Currency toggler */}
            <button
              onClick={() => dispatch(setCurrency(currency === "SAR" ? "SDG" : "SAR"))}
              className={`p-2 rounded-xl border transition-all text-xs font-mono font-semibold ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              {currency === "SAR" ? t.currency_sdg : t.currency_sar}
            </button>

            {/* Theme switcher */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
              title={isDark ? t.theme_light : t.theme_dark}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top-level KPI overview grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Active GPS connections */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">{t.metrics_active}</span>
              <h3 className="text-2xl font-black font-mono tracking-tight text-orange-500">{activeCount} / {vehicles.length}</h3>
              <span className="text-[9px] text-slate-400 block font-mono">100% telemetry stream</span>
            </div>
            <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Compass className="w-5.5 h-5.5 animate-spin-slow" />
            </div>
          </div>

          {/* Active threats */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            criticalCount > 0 ? "bg-red-500/5 border-red-500/20" : isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">{t.metrics_critical}</span>
              <h3 className={`text-2xl font-black font-mono tracking-tight ${criticalCount > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                {criticalCount}
              </h3>
              <span className="text-[9px] text-slate-400 block font-mono">AI Anomaly validation</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              criticalCount > 0 ? "bg-red-500/20 text-red-400 animate-bounce" : "bg-emerald-500/10 text-emerald-500"
            }`}>
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Managed Vol */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">{t.metrics_volume}</span>
              <h3 className="text-2xl font-black font-mono tracking-tight text-slate-100">{totalVolume.toLocaleString()} <span className="text-xs text-slate-500">L</span></h3>
              <span className="text-[9px] text-slate-400 block font-mono">Real-time tank sync</span>
            </div>
            <div className="w-10 h-10 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center shrink-0">
              <Database className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Avg Eff */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">{t.metrics_efficiency}</span>
              <h3 className="text-2xl font-black font-mono tracking-tight text-emerald-400">{avgEfficiency} <span className="text-xs text-slate-500">km/L</span></h3>
              <span className="text-[9px] text-slate-400 block font-mono">Target benchmark: 11.0</span>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* 3. Sub-Tab Controller */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-px mb-6">
          <button
            onClick={() => dispatch(setSubTab("dashboard"))}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === "dashboard"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <MapIcon className="w-4 h-4 text-orange-500" />
            <span>{t.tab_dashboard}</span>
          </button>
          
          <button
            onClick={() => dispatch(setSubTab("storybook"))}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === "storybook"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>{t.tab_storybook}</span>
          </button>
        </div>

        {/* 4. Display active module */}
        {activeSubTab === "storybook" ? (
          <StorybookPlayground />
        ) : (
          <div className="space-y-8">
            {/* Dedicated Offline Fueling & Local Sync Engine */}
            <OfflineFuelingSyncEngine lang={lang === "ar" ? "ar" : "en"} />

            {/* Real-Time Operations Room Dashboard ($50M Startup Experience) */}
            <OperationsRoomDashboard lang={lang === "ar" ? "ar" : "en"} />

            {/* Corridor Filters bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => dispatch(setCorridorFilter("all"))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  corridorFilter === "all" 
                    ? "bg-slate-800 border-slate-750 text-white shadow" 
                    : "bg-transparent border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {t.all_corridors}
              </button>
              <button
                onClick={() => dispatch(setCorridorFilter("ksa"))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
                  corridorFilter === "ksa" 
                    ? "bg-slate-800 border-slate-750 text-white shadow" 
                    : "bg-transparent border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t.ksa_corridor}
              </button>
              <button
                onClick={() => dispatch(setCorridorFilter("sudan"))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
                  corridorFilter === "sudan" 
                    ? "bg-slate-800 border-slate-750 text-white shadow" 
                    : "bg-transparent border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-450" />
                {t.sudan_corridor}
              </button>
            </div>

            {/* Live GPS Map section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-orange-500 animate-spin-slow" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">{isRTL ? "رادار الأسطول الإقليمي" : "FLEET TRANSLATIONAL RADAR MAP"}</h3>
              </div>
              <MapComponent />
            </div>

            {/* Vehicle health grid section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4.5 h-4.5 text-rose-500" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">{isRTL ? "مؤشرات السلامة وصيانة الأجهزة" : "VEHICLE COMPLIANCE & IOT SENSOR STATUS"}</h3>
              </div>
              <VehicleHealth />
            </div>

            {/* Spend trend charts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-orange-500" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">{isRTL ? "منحنيات وتحليلات الوقود" : "FUEL EXPENDITURES & CORRELATIONS"}</h3>
              </div>
              <ChartsSection />
            </div>

            {/* Real-time Fraud Panel & auditing table */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">{isRTL ? "بوابة الكشف الجنائي لدرع الاحتيال" : "AI ANOMALY SCANNER & CORRIDOR SHIELD"}</h3>
              </div>
              <AIFraudDetectionHub />
              <FraudPanel />
            </div>

            {/* Driver Performance Standings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">{isRTL ? "ترتيب أداء السائقين" : "DRIVER PERFORMANCE Standing s"}</h3>
              </div>
              <DriverPerformance />
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}

export default function OperationsRoom() {
  return (
    <Provider store={store}>
      <OperationsRoomContent />
    </Provider>
  );
}
