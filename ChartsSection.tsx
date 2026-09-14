import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Fuel, TrendingUp, DollarSign, Calendar, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Historical data sets for different periodic filters
const spendDataDaily = [
  { label: "Mon", spend: 450, liters: 195, costPerKm: 0.15 },
  { label: "Tue", spend: 520, liters: 226, costPerKm: 0.16 },
  { label: "Wed", spend: 380, liters: 165, costPerKm: 0.14 },
  { label: "Thu", spend: 610, liters: 265, costPerKm: 0.18 },
  { label: "Fri", spend: 720, liters: 313, costPerKm: 0.17 },
  { label: "Sat", spend: 290, liters: 126, costPerKm: 0.15 },
  { label: "Sun", spend: 210, liters: 91, costPerKm: 0.13 }
];

const spendDataWeekly = [
  { label: "Week 1", spend: 3200, liters: 1391, costPerKm: 0.16 },
  { label: "Week 2", spend: 4100, liters: 1782, costPerKm: 0.15 },
  { label: "Week 3", spend: 3800, liters: 1652, costPerKm: 0.17 },
  { label: "Week 4", spend: 4500, liters: 1956, costPerKm: 0.15 }
];

const spendDataMonthly = [
  { label: "Jan", spend: 14200, liters: 6173, costPerKm: 0.16 },
  { label: "Feb", spend: 16800, liters: 7304, costPerKm: 0.15 },
  { label: "Mar", spend: 15100, liters: 6565, costPerKm: 0.16 },
  { label: "Apr", spend: 18400, liters: 8000, costPerKm: 0.14 },
  { label: "May", spend: 19500, liters: 8478, costPerKm: 0.15 },
  { label: "Jun", spend: 21000, liters: 9130, costPerKm: 0.16 }
];

export default function ChartsSection() {
  const { list: vehicles } = useSelector((state: RootState) => state.vehicles);
  const { lang, theme, currency, corridorFilter } = useSelector((state: RootState) => state.config);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const isDark = theme === "dark";

  // Select corresponding dataset
  const currentSpendData = period === "daily" 
    ? spendDataDaily 
    : period === "weekly" 
      ? spendDataWeekly 
      : spendDataMonthly;

  // Convert spend if SDG
  const formatValue = (val: number) => {
    if (currency === "SDG") {
      // 1 SAR/USD = approx 160 SDG in bankak exchange rate
      return val * 160;
    }
    return val;
  };

  const getCurrencyLabel = () => {
    return currency;
  };

  // Vehicle fuel efficiency dataset mapping
  const efficiencyData = vehicles
    .filter(v => {
      if (corridorFilter === "ksa" && !v.plateNumber.includes("KSA")) return false;
      if (corridorFilter === "sudan" && !v.plateNumber.includes("SUD")) return false;
      return true;
    })
    .map(v => ({
      name: v.driverName.split(" ")[0],
      plate: v.plateNumber.split(" ")[v.plateNumber.split(" ").length - 1].replace(/[()]/g, ""),
      efficiency: v.fuelEfficiency,
      costPerKm: v.costPerKm
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Spend & Volume Trends Area Chart */}
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold block">
              {lang === "ar" ? "تحليلات الإنفاق والتوزيع" : "FUEL EXPENDITURE & VOLUME TRENDS"}
            </span>
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>{lang === "ar" ? "منحنى تكلفة واستهلاك الوقود" : "Aggregated Fuel Spend & Volume"}</span>
            </h3>
          </div>

          {/* Period Selector Tabs */}
          <div className={`p-1 rounded-xl flex items-center gap-1 ${
            isDark ? "bg-slate-950" : "bg-slate-50"
          }`}>
            <button
              onClick={() => setPeriod("daily")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                period === "daily"
                  ? "bg-orange-500/10 text-orange-450 border border-orange-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {lang === "ar" ? "يومي" : "DAILY"}
            </button>
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                period === "weekly"
                  ? "bg-orange-500/10 text-orange-450 border border-orange-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {lang === "ar" ? "أسبوعي" : "WEEKLY"}
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                period === "monthly"
                  ? "bg-orange-500/10 text-orange-450 border border-orange-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {lang === "ar" ? "شهري" : "MONTHLY"}
            </button>
          </div>
        </div>

        {/* Live conversion KPI card */}
        <div className={`p-4 rounded-xl mb-4 flex items-center justify-between border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
        }`}>
          <div>
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === "ar" ? "متوسط تكلفة الليتر" : "AVERAGE LITER COST"}</span>
            <span className="text-base font-extrabold font-mono">
              {currency === "SDG" ? "550.00 SDG" : "2.30 SAR"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{lang === "ar" ? "إجمالي المنصرف" : "ACCUMULATED PERIOD SUM"}</span>
            <span className="text-sm font-bold text-orange-500 font-mono">
              +{formatValue(currentSpendData.reduce((acc, curr) => acc + curr.spend, 0)).toLocaleString()} {getCurrencyLabel()}
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentSpendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke={isDark ? "#64748b" : "#94a3b8"} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke={isDark ? "#64748b" : "#94a3b8"} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDark ? "#0f172a" : "#ffffff", 
                  borderRadius: "12px", 
                  border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
                  color: isDark ? "#fff" : "#334155",
                  fontFamily: "monospace",
                  fontSize: "11px"
                }}
                itemStyle={{ color: "#f97316" }}
              />
              <Area 
                type="monotone" 
                dataKey={(item) => formatValue(item.spend)} 
                stroke="#f97316" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#spendGrad)" 
                name={lang === "ar" ? "الإنفاق المالي" : "Spend Sum"}
              />
              <Area 
                type="monotone" 
                dataKey="liters" 
                stroke="#38bdf8" 
                strokeWidth={1.5} 
                fill="none" 
                strokeDasharray="4 4"
                name={lang === "ar" ? "الحجم (لتر)" : "Liters Dispensed"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Fuel Efficiency & Cost Per KM horizontal bar chart */}
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
      }`}>
        <div className="space-y-1 mb-6">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold block">
            {lang === "ar" ? "مقارنات كفاءة الأسطول" : "FLEET FUEL EFFICIENCY COMPARISON"}
          </span>
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>{lang === "ar" ? "معدل كفاءة استهلاك الوقود لكل كيلومتر" : "Fuel Efficiency & Travel Unit Cost"}</span>
          </h3>
        </div>

        {/* Live info note */}
        <div className={`p-4 rounded-xl mb-4 flex items-center justify-between border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-400">{lang === "ar" ? "كم / لتر (أعلى هو أفضل)" : "km / liter (Higher is Better)"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded bg-sky-500"></span>
            <span className="text-slate-400">{lang === "ar" ? "التكلفة لكل كم (أقل هو أفضل)" : "Cost/Km (Lower is Better)"}</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} horizontal={false} />
              <XAxis 
                type="number" 
                stroke={isDark ? "#64748b" : "#94a3b8"} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke={isDark ? "#64748b" : "#94a3b8"} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={70}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDark ? "#0f172a" : "#ffffff", 
                  borderRadius: "12px", 
                  border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
                  color: isDark ? "#fff" : "#334155",
                  fontFamily: "monospace",
                  fontSize: "11px"
                }}
              />
              <Bar 
                dataKey="efficiency" 
                fill="#10b981" 
                radius={[0, 4, 4, 0]} 
                name={lang === "ar" ? "الكفاءة (كم/لتر)" : "Efficiency (km/L)"} 
                barSize={10}
              />
              <Bar 
                dataKey={(item) => formatValue(item.costPerKm * 10)} // amplified scale to fit chart nicely
                fill="#38bdf8" 
                radius={[0, 4, 4, 0]} 
                name={lang === "ar" ? "التكلفة لكل كم (معدل x10)" : "Cost/Km (Scaled x10)"} 
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
