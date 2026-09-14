import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sun, CloudRain, Shield, AlertTriangle, Play, ChevronRight, 
  Settings, Truck, HelpCircle, Bell, RefreshCw, AlertCircle, Info, Sparkles 
} from "lucide-react";

interface HomeTabProps {
  lang: "en" | "ar" | "sd";
  isOnline: boolean;
  onNavigate: (tab: "HOME" | "FUEL" | "SERVICES" | "WALLET" | "PROFILE") => void;
  speakText: (text: string) => void;
  localQueueLength: number;
  triggerAutoSync: () => void;
  syncing: boolean;
  onReportIssue: () => void;
}

const localizations = {
  en: {
    greeting: "Good morning, Ahmed",
    weather: "Jeddah • 32°C Sunny",
    activeTruck: "ACTIVE VEHICLE",
    fuelLevel: "Fuel Tank Status",
    lowFuel: "Refuel Required Soon!",
    quickActions: "QUICK ACTIONS",
    actionFuel: "Fuel Now",
    actionService: "Request Service",
    actionIssue: "Report Issue",
    todaySchedule: "TODAY'S SCHEDULE",
    statusBadge: "Active Shift",
    verifiedText: "Telemetry Guard Verified",
    routeStart: "08:00 AM - Departs Port Sudan Depot",
    routeCustoms: "11:30 AM - Customs Gate 4 Clearance",
    routeBarge: "04:00 PM - Red Sea Ro-Ro Transit",
    routeEnd: "09:00 PM - Arrival at Jeddah Yard",
  },
  ar: {
    greeting: "صباح الخير، يا كابتن أحمد",
    weather: "جدة • ٣٢°م مشمس",
    activeTruck: "المركبة النشطة",
    fuelLevel: "حالة خزان الوقود",
    lowFuel: "مطلوب التزود بالوقود فوراً!",
    quickActions: "إجراءات سريعة",
    actionFuel: "تعبئة الآن",
    actionService: "طلب صيانة",
    actionIssue: "إبلاغ عن مشكلة",
    todaySchedule: "جدول رحلات اليوم",
    statusBadge: "وردية نشطة",
    verifiedText: "مؤمن بمطابقة التليميتري",
    routeStart: "٠٨:٠٠ ص - المغادرة من مستودع بورتسودان",
    routeCustoms: "١١:٣٠ ص - جمارك بوابة ٤ والمطابقة",
    routeBarge: "٠٤:٠٠ م - عبور العبارة البحرية البحر الأحمر",
    routeEnd: "٠٩:٠٠ م - الوصول لساحة حاويات جدة",
  },
  sd: {
    greeting: "حبابك عشرة، يا أحمد يا كابتن",
    weather: "سواكن • ٣٥°م غبار خفيف",
    activeTruck: "اللوري الشغال الليلة",
    fuelLevel: "مستوى الجاز في الموتور",
    lowFuel: "الجاز قارب يخلص! عبي طوالي",
    quickActions: "حاجات سريعة",
    actionFuel: "عبي جاز",
    actionService: "طلب تصليح دوري",
    actionIssue: "شيل بلاغ عطل",
    todaySchedule: "سفرية اليوم المسجلة",
    statusBadge: "سفرية شغالة",
    verifiedText: "الربط الأمني شغال تمام",
    routeStart: "٠٨:٠٠ ص - شحن اللوري من بورتسودان",
    routeCustoms: "١١:٣٠ ص - تخليص جمارك ميناء سواكن",
    routeBarge: "٠٤:٠٠ م - ركوب العبارة للبحر الأحمر",
    routeEnd: "٠٩:٠٠ م - وصول مستودعات جدة بالسلامة",
  }
};

export default function HomeTab({
  lang,
  isOnline,
  onNavigate,
  speakText,
  localQueueLength,
  triggerAutoSync,
  syncing,
  onReportIssue
}: HomeTabProps) {
  const t = localizations[lang] || localizations.en;
  const isRTL = lang === "ar" || lang === "sd";

  const [notifCount, setNotifCount] = useState(3);

  const handleActionClick = (actionName: string, callback: () => void) => {
    speakText(`${actionName} triggered.`);
    callback();
  };

  return (
    <div className="space-y-4 font-sans text-white text-left" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* 1. GREETING & WEATHER WIDGET */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <span>{t.greeting}</span>
            <motion.span 
              animate={{ rotate: [0, 15, -10, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}
              className="inline-block"
            >
              👋
            </motion.span>
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{t.weather}</span>
          </div>
        </div>

        {/* Dynamic Alerts Indicator Badge */}
        <div className="relative">
          <button 
            onClick={() => handleActionClick("Notifications center", () => setNotifCount(0))}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-orange-500/40 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {notifCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. VEHICLE CARD */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3.5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none rounded-full" />
        
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold font-mono text-orange-400 tracking-wider uppercase bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/15">
              {t.activeTruck}
            </span>
            <h4 className="text-sm font-bold text-slate-100 mt-1 font-mono">Mercedes Actros 1845</h4>
            <span className="text-[10px] text-slate-400 font-mono">أ ب ج ١٨٩٢ • KSA-1892</span>
          </div>
          <div className="w-14 h-10 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center p-1">
            <Truck className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        {/* Fuel level progress bar */}
        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-900">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-400 font-sans">{t.fuelLevel}</span>
            <span className="text-orange-400 font-bold">22%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "22%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 h-2 rounded-full"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-orange-400 font-bold bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>{t.lowFuel}</span>
          </div>
        </div>

        {/* Verification check footer */}
        <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3 h-3 text-emerald-500" />
            {t.verifiedText}
          </span>
          <span>142,850 km</span>
        </div>
      </div>

      {/* 3. QUICK ACTIONS ROW */}
      <div className="space-y-1.5">
        <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">{t.quickActions}</h5>
        <div className="grid grid-cols-3 gap-2">
          
          <button 
            onClick={() => handleActionClick(t.actionFuel, () => onNavigate("FUEL"))}
            className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-orange-500/30 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4.5 h-4.5 text-orange-400" />
            </div>
            <span className="text-[9px] font-bold text-slate-200 line-clamp-1">{t.actionFuel}</span>
          </button>

          <button 
            onClick={() => handleActionClick(t.actionService, () => onNavigate("SERVICES"))}
            className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-orange-500/30 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Settings className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <span className="text-[9px] font-bold text-slate-200 line-clamp-1">{t.actionService}</span>
          </button>

          <button 
            onClick={() => handleActionClick(t.actionIssue, onReportIssue)}
            className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-orange-500/30 p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <span className="text-[9px] font-bold text-slate-200 line-clamp-1">{t.actionIssue}</span>
          </button>

        </div>
      </div>

      {/* 4. TODAY'S SCHEDULE */}
      <div className="space-y-2">
        <div className="flex justify-between items-center pl-1">
          <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest">{t.todaySchedule}</h5>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-500/15">
            {t.statusBadge}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3 space-y-3 shadow-md font-mono text-[10px]">
          
          <div className="flex gap-2.5 items-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950 animate-pulse" />
              <div className="w-0.5 h-5 bg-slate-800" />
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-200 font-bold font-sans">{t.routeStart}</p>
              <span className="text-[9px] text-slate-500">Departure Cargo Logged</span>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-0.5 h-5 bg-slate-800" />
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-300 font-bold font-sans">{t.routeCustoms}</p>
              <span className="text-[9px] text-slate-500">Customs Clearance Enclave</span>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-0.5 h-5 bg-slate-800" />
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-300 font-bold font-sans">{t.routeBarge}</p>
              <span className="text-[9px] text-slate-500">Scheduled Port Transit Gap</span>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-450 font-bold font-sans">{t.routeEnd}</p>
              <span className="text-[9px] text-slate-600">Final Consignment Drop</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
