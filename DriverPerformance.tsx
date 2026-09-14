import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, updateDriverPerformance } from "./store";
import { Trophy, Award, AlertOctagon, TrendingUp, Sparkles, Star, Zap, User } from "lucide-react";

export default function DriverPerformance() {
  const dispatch = useDispatch();
  const { list: drivers } = useSelector((state: RootState) => state.driverScores);
  const { lang, theme } = useSelector((state: RootState) => state.config);

  const isDark = theme === "dark";

  // Badge decoration mappings
  const getBadgeIconAndColors = (badge: string) => {
    switch (badge) {
      case "Elite Elite":
        return {
          icon: <Trophy className="w-4.5 h-4.5 text-amber-400" />,
          style: "bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm shadow-amber-500/5",
          label: lang === "ar" ? "نخبة النخبة" : "Elite Elite"
        };
      case "Master Eco":
        return {
          icon: <Award className="w-4.5 h-4.5 text-emerald-400" />,
          style: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
          label: lang === "ar" ? "خبير بيئي" : "Master Eco"
        };
      case "Safe Specialist":
        return {
          icon: <Sparkles className="w-4.5 h-4.5 text-sky-400" />,
          style: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
          label: lang === "ar" ? "أخصائي أمان" : "Safe Specialist"
        };
      default:
        return {
          icon: <Zap className="w-4.5 h-4.5 text-slate-400" />,
          style: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
          label: lang === "ar" ? "قياسي محترف" : "Standard Pro"
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Podium/Highlight Section for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drivers.slice(0, 3).map((d, index) => {
          const badgeDetails = getBadgeIconAndColors(d.badge);
          const podiumColors = index === 0 
            ? "border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent shadow-lg shadow-amber-500/5" 
            : index === 1 
              ? "border-slate-400/30 bg-gradient-to-b from-slate-400/5 via-transparent to-transparent"
              : "border-orange-500/20 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent";

          return (
            <div
              key={d.id}
              className={`p-6 rounded-2xl border flex flex-col items-center justify-between text-center relative transition-all hover:scale-[1.02] ${podiumColors} ${
                isDark ? "bg-slate-900 text-white" : "bg-white text-slate-800"
              }`}
            >
              {/* Podium Rank Badge */}
              <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold shadow-lg ${
                index === 0 ? "bg-amber-500 border-amber-300 text-slate-950 text-base" :
                index === 1 ? "bg-slate-400 border-slate-200 text-slate-900 text-sm" :
                "bg-orange-500 border-orange-300 text-slate-900 text-sm"
              }`}>
                {index + 1}
              </span>

              <div className="space-y-3 mt-1.5 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={d.avatar}
                    alt={d.driverName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800/80 shadow-inner"
                  />
                  {index === 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 p-1 rounded-lg text-slate-950 shadow">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </span>
                  )}
                </div>

                {/* Driver Identity */}
                <div className="space-y-0.5">
                  <h4 className="text-sm font-extrabold">{d.driverName}</h4>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase ${badgeDetails.style}`}>
                    {badgeDetails.icon}
                    <span>{badgeDetails.label}</span>
                  </span>
                </div>
              </div>

              {/* Performance Scores row */}
              <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-800/50 pt-4 mt-5">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">{lang === "ar" ? "الكفاءة" : "EFFICIENCY"}</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-400">{d.fuelEfficiencyScore}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">{lang === "ar" ? "التسليم" : "ON-TIME RATE"}</span>
                  <span className="text-sm font-extrabold font-mono text-sky-400">{d.onTimeDeliveryScore}%</span>
                </div>
              </div>

              {/* Big composite score representation */}
              <div className="mt-4 pt-3 border-t border-slate-800/20 w-full flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-400">{d.totalDeliveries} DELIVERIES</span>
                <span className="text-lg font-mono font-black text-orange-500">{d.overallScore} <span className="text-[10px] font-normal text-slate-500">/ 100</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Ledger */}
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
      }`}>
        <div className="space-y-1 mb-6">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold block">
            {lang === "ar" ? "الترتيب العام للقيادة والامتثال" : "PERFORMANCE STANDINGS & LEADERBOARD"}
          </span>
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{lang === "ar" ? "جدول ترتيب السائقين وجوائز كفاءة الوقود" : "Gamified Operator Compliance Leaderboard"}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 text-center w-12">#</th>
                <th className="pb-3">{lang === "ar" ? "السائق" : "DRIVER"}</th>
                <th className="pb-3 text-center">{lang === "ar" ? "كفاءة الوقود" : "FUEL EFF"}</th>
                <th className="pb-3 text-center">{lang === "ar" ? "التوصيل" : "ON-TIME"}</th>
                <th className="pb-3 text-center">{lang === "ar" ? "مخالفات الاحتيال" : "FRAUDS"}</th>
                <th className="pb-3 text-right">{lang === "ar" ? "التقييم الإجمالي" : "SCORE"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {drivers.map((drv) => {
                const badgeDetails = getBadgeIconAndColors(drv.badge);
                const hasFrauds = drv.fraudIncidentsCount > 0;

                return (
                  <tr key={drv.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 text-center font-mono font-bold text-slate-450">{drv.rank}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={drv.avatar}
                          alt={drv.driverName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-200">{drv.driverName}</h4>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-semibold uppercase mt-0.5 ${badgeDetails.style}`}>
                            {badgeDetails.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono font-semibold text-slate-300">{drv.fuelEfficiencyScore}%</td>
                    <td className="py-3 text-center font-mono font-semibold text-slate-300">{drv.onTimeDeliveryScore}%</td>
                    <td className={`py-3 text-center font-mono font-bold ${hasFrauds ? "text-rose-450 animate-pulse" : "text-emerald-400"}`}>
                      {drv.fraudIncidentsCount}
                    </td>
                    <td className="py-3 text-right font-mono font-black text-orange-500 text-sm">
                      {drv.overallScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
