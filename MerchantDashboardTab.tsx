import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Fuel,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Gauge,
  Droplets,
  Thermometer,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Landmark,
  Layers,
  ChevronRight,
  Send,
  Sparkles
} from "lucide-react";
import {
  FuelMerchant,
  FuelGradePricing,
  StationTankMetric,
  DailySettlementBatch,
  FuelGradeCode
} from "./types";
import { calculateDynamicPrice, broadcastPriceToNetwork } from "./pricingEngine";

interface MerchantDashboardTabProps {
  currentMerchant: FuelMerchant;
  merchants: FuelMerchant[];
  onSelectMerchant: (merchant: FuelMerchant) => void;
  fuelPrices: FuelGradePricing[];
  onUpdatePrice: (grade: FuelGradeCode, newSpotPrice: number, newMargin: number) => void;
  tankMetrics: StationTankMetric[];
  settlementBatches: DailySettlementBatch[];
  onTriggerInstantSettlement: (batchId: string) => void;
  lang: "en" | "ar";
}

export default function MerchantDashboardTab({
  currentMerchant,
  merchants,
  onSelectMerchant,
  fuelPrices,
  onUpdatePrice,
  tankMetrics,
  settlementBatches,
  onTriggerInstantSettlement,
  lang
}: MerchantDashboardTabProps) {
  const [selectedGrade, setSelectedGrade] = useState<FuelGradeCode>("DIESEL_EURO5");
  const [editingMargin, setEditingMargin] = useState<number>(0.14);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [activeTankFilter, setActiveTankFilter] = useState<string>("ALL");

  const activePricing = fuelPrices.find(p => p.grade === selectedGrade) || fuelPrices[0];

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const margin = parseFloat(e.target.value);
    setEditingMargin(margin);
    const { spotPrice } = calculateDynamicPrice(activePricing.baseCost, margin, activePricing.regulatoryCap);
    onUpdatePrice(activePricing.grade, spotPrice, margin);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setBroadcastStatus(null);
    setTimeout(() => {
      const res = broadcastPriceToNetwork(activePricing.nameEn, activePricing.spotPrice, currentMerchant.activeStationsCount);
      setIsBroadcasting(false);
      setBroadcastStatus(`Broadcast ID ${res.broadcastId}: Pushed to ${res.affectedPumpsCount} forecourt nozzles & ${res.driverAppPushCount.toLocaleString()} fleet drivers.`);
      setTimeout(() => setBroadcastStatus(null), 8000);
    }, 900);
  };

  const filteredTanks = activeTankFilter === "ALL" 
    ? tankMetrics 
    : tankMetrics.filter(t => t.fuelType === activeTankFilter);

  const totalCapacity = tankMetrics.reduce((acc, t) => acc + t.capacityLiters, 0);
  const totalCurrent = tankMetrics.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const overallFillPct = Math.round((totalCurrent / totalCapacity) * 100);

  return (
    <div className="space-y-8" id="merchant-dashboard-tab">
      {/* Top Merchant Profile & Escrow Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Merchant Switcher */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {lang === "ar" ? currentMerchant.nameAr : currentMerchant.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentMerchant.tier} TIER
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {currentMerchant.type === "STATION_OWNER" ? "Station Operator" : currentMerchant.type === "INDEPENDENT_WHOLESALER" ? "Bulk Wholesaler" : "Fleet Distributor"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                <span>CR: <strong className="text-slate-200">{currentMerchant.tradeLicense}</strong></span>
                <span>VAT: <strong className="text-slate-200">{currentMerchant.vatNumber}</strong></span>
                <span>Bank: <strong className="text-slate-200">{currentMerchant.bankName}</strong></span>
                <span>IBAN: <strong className="text-slate-300">{currentMerchant.bankIban.slice(0, 8)}••••{currentMerchant.bankIban.slice(-4)}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Select Different Merchant */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <label className="text-xs text-slate-400 whitespace-nowrap">
              {lang === "ar" ? "تبديل المنشأة:" : "Select Entity:"}
            </label>
            <select
              value={currentMerchant.id}
              onChange={(e) => {
                const found = merchants.find(m => m.id === e.target.value);
                if (found) onSelectMerchant(found);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {merchants.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.tier})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operational Telemetry Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">{lang === "ar" ? "المحطات النشطة" : "Active Stations"}</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{currentMerchant.activeStationsCount}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Online Forecourts
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">{lang === "ar" ? "متوسط الضخ اليومي" : "Daily Liters Dispensed"}</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
              {(currentMerchant.dailyLitersAvg / 1000).toFixed(0)}k <span className="text-sm text-slate-400">L/day</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Telemetry Certified</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">{lang === "ar" ? "رصيد الضمان / المعلق" : "Clearing Escrow Balance"}</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              SAR {currentMerchant.escrowBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3" /> Auto-SARIE T+1
            </div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">{lang === "ar" ? "سعة التخزين الإجمالية" : "Network Tank Fill"}</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{overallFillPct}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${overallFillPct > 40 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${overallFillPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Dynamic Fuel Price Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {lang === "ar" ? "إدارة أسعار الوقود الديناميكية وهوامش الربح" : "Dynamic Fuel Price & Margin Management"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "تعديل هوامش الربح فورياً مع الامتثال الصارم لسقف الأسعار الحكومي المعتمد من وزارة الطاقة"
                : "Adjust merchant spot margins in real time while respecting Ministry of Energy regulatory caps"}
            </p>
          </div>

          {/* Real-time Broadcast Button */}
          <button
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            id="broadcast-price-btn"
          >
            <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-spin' : ''}`} />
            {isBroadcasting
              ? (lang === "ar" ? "جارٍ بث الأسعار..." : "Broadcasting...")
              : (lang === "ar" ? "بث الأسعار للشبكة والسائقين" : "Broadcast Price to Fleet Network")}
          </button>
        </div>

        {broadcastStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{broadcastStatus}</span>
          </motion.div>
        )}

        {/* Grade Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {fuelPrices.map((fp) => {
            const isSelected = fp.grade === selectedGrade;
            return (
              <button
                key={fp.grade}
                onClick={() => {
                  setSelectedGrade(fp.grade);
                  setEditingMargin(fp.merchantMargin);
                }}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/60 text-white shadow-md shadow-amber-500/10"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="text-[11px] font-mono text-amber-400 font-bold">
                  {fp.grade.replace("_", " ")}
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  SAR {fp.spotPrice.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Cap: {fp.regulatoryCap.toFixed(4)}</span>
                  <span className={fp.spotPrice >= fp.regulatoryCap ? "text-amber-400" : "text-emerald-400"}>
                    {fp.spotPrice >= fp.regulatoryCap ? "AT CAP" : "ACTIVE"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Fuel Grade Detail & Dynamic Pricing Panel */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Price Breakdown Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {lang === "ar" ? activePricing.nameAr : activePricing.nameEn}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Regulatory Code: <span className="font-mono text-slate-300">{activePricing.grade}</span> | Validity Lock: <span className="font-mono text-slate-300">{activePricing.priceLockExpiry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Auto-Algorithm:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${activePricing.autoDynamicPricing ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {activePricing.autoDynamicPricing ? "ENABLED" : "MANUAL"}
                  </span>
                </div>
              </div>

              {/* Dynamic Interactive Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Wholesale Base Cost */}
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Wholesale Refinery Cost</div>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                    SAR {activePricing.baseCost.toFixed(4)} <span className="text-xs text-slate-500">/L</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Refinery Terminal Floor</div>
                </div>

                {/* Spot Margin Slider */}
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Merchant Margin</span>
                    <span className="font-mono text-amber-400 font-bold">
                      +SAR {editingMargin.toFixed(4)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.45"
                    step="0.005"
                    value={editingMargin}
                    onChange={handleMarginChange}
                    className="w-full mt-3 accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>Min: 0.01</span>
                    <span>Max: 0.45</span>
                  </div>
                </div>

                {/* Final Net Spot Retail Price */}
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-400 font-medium">Spot Retail Price</div>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                    SAR {activePricing.spotPrice.toFixed(4)} <span className="text-xs text-amber-400/70">/L</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Max Cap: SAR {activePricing.regulatoryCap.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Bulk Volume Discount Tiers for Fleet Clients */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  {lang === "ar" ? "خصومات الشراء بالجملة للأساطيل التجارية" : "Fleet Bulk Volume Rebate Schedule"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activePricing.bulkDiscountTiers.map((tier, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                      <div className="text-slate-400">Orders &ge; {tier.minLiters.toLocaleString()} L</div>
                      <div className="text-emerald-400 font-bold mt-1">
                        -SAR {tier.discountPerLiter.toFixed(4)} /L
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Net: SAR {(activePricing.spotPrice - tier.discountPerLiter).toFixed(4)} /L
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Regulatory Compliance Status Box */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Saudi Ministry of Energy Compliance</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Spot prices are cryptographically locked against national price decree ceilings. All price updates are automatically transmitted to ZATCA FATOORA Phase 2 registers.
                </p>

                <div className="space-y-2 mt-4 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Official Gov Ceiling:</span>
                    <span className="text-white">SAR {activePricing.regulatoryCap.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Current Margin:</span>
                    <span className="text-amber-400">+SAR {activePricing.merchantMargin.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">ZATCA Tax Base (15%):</span>
                    <span className="text-white">SAR {(activePricing.spotPrice * 0.15).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">COMPLIANT (ACTIVE)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                <span className="font-bold">Notice:</span> Price changes propagate to active forecourt POS terminals within 30 seconds.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Live Station Capacity & Tank Telemetry Metrics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {lang === "ar" ? "قياسات سعة الخزانات والمضخات الحية" : "Live Station Tank Telemetry & Forecourt Capacity"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "مراقبة مستويات خزانات الوقود الأرضية، أجهزة استشعار المياه، ومعدلات تدفق المضخات الحية"
                : "Real-time ATG underground fuel levels, water detection, temperature & nozzle flow rate monitoring"}
            </p>
          </div>

          {/* Filter by Fuel Grade */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{lang === "ar" ? "نوع الوقود:" : "Grade:"}</span>
            <select
              value={activeTankFilter}
              onChange={(e) => setActiveTankFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono cursor-pointer"
            >
              <option value="ALL">All Storage Tanks</option>
              <option value="DIESEL_EURO5">Diesel Euro 5</option>
              <option value="GASOLINE_91">Gasoline 91</option>
              <option value="HFO">Heavy Fuel Oil (HFO)</option>
            </select>
          </div>
        </div>

        {/* Tank Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTanks.map((tank) => {
            const fillPct = Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100);
            const isLow = tank.status === "LOW_REORDER";

            return (
              <div
                key={tank.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
              >
                {/* Station & Tank Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{tank.stationCode}</span>
                      <span className="text-xs text-slate-400">• {tank.city}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{tank.stationName}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">{tank.tankName}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                      isLow
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    }`}
                  >
                    {tank.status}
                  </span>
                </div>

                {/* Tank Level Gauge */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Fuel Level:</span>
                    <div className="font-mono">
                      <strong className="text-white text-base">{tank.currentLevelLiters.toLocaleString()}</strong>
                      <span className="text-slate-500"> / {tank.capacityLiters.toLocaleString()} L ({fillPct}%)</span>
                    </div>
                  </div>
                  {/* Visual Level Bar */}
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Safe Fill Limit: {tank.safeFillLiters.toLocaleString()} L</span>
                    <span>Ullage Space: {tank.ullageLiters.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Telemetry Sensor Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg text-center border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>Water Sensor</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-1">
                      {tank.waterDetectionMm} mm
                    </div>
                    <div className="text-[9px] text-emerald-400">Safe (&lt;2mm)</div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg text-center border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Thermometer className="w-3 h-3 text-orange-400" />
                      <span>Temp</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-1">
                      {tank.temperatureC}°C
                    </div>
                    <div className="text-[9px] text-slate-400">Comp. Density</div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg text-center border border-slate-800/60">
                    <div className="text-[10px] text-slate-400">Forecourt Queue</div>
                    <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                      {tank.forecourtQueueCount} Trucks
                    </div>
                    <div className="text-[9px] text-slate-400">~{tank.avgWaitTimeMins} min wait</div>
                  </div>
                </div>

                {/* Active Nozzles Telemetry */}
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>Dispenser Nozzles</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tank.activeNozzles.filter(n => n.status === "DISPENSING").length} / {tank.activeNozzles.length} Dispensing
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tank.activeNozzles.map((nz) => (
                      <div
                        key={nz.id}
                        className={`p-2 rounded-lg border text-[11px] font-mono ${
                          nz.status === "DISPENSING"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-slate-900/60 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Pump #{nz.pumpNumber}</span>
                          <span className="text-[9px]">{nz.status}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-300">
                          {nz.status === "DISPENSING" ? `${nz.flowRateLpm} L/min` : "Idle"}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {(nz.todayDispensedLiters / 1000).toFixed(1)}k L today
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Automated Daily Settlement Payouts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {lang === "ar" ? "التسويات اليومية الآلية والتحويل المصرفي السريع" : "Automated Daily Settlement & Bank Payouts"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "تتبع دورات المقاصة اليومية عبر سريع (SARIE ACH) مع تسوية الضريبة واقتطاع رسوم المنصة"
                : "Automated daily T+1 clearing batches via Saudi SARIE ACH with net payout, platform fee and VAT reconciliation"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Interchange Fee: <strong className="text-amber-400">0.85%</strong>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              VAT Withholding: <strong className="text-white">15.0%</strong>
            </span>
          </div>
        </div>

        {/* Settlements Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Batch / Date</th>
                <th className="p-3.5">Gross Sales</th>
                <th className="p-3.5">Fee (0.85%)</th>
                <th className="p-3.5">VAT Withheld</th>
                <th className="p-3.5 text-emerald-400">Net Payout</th>
                <th className="p-3.5">Bank Reference</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
              {settlementBatches.map((batch) => {
                const isCleared = batch.status === "SETTLED_SARIE";
                return (
                  <tr key={batch.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{batch.date}</div>
                      <div className="text-[10px] text-slate-500">{batch.batchNumber}</div>
                    </td>
                    <td className="p-3.5 text-white font-bold">
                      SAR {batch.grossFuelSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      SAR {batch.platformFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      SAR {batch.vatAmountWithheld.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400 text-sm">
                      SAR {batch.netPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      <div>{batch.bankReference}</div>
                      <div className="text-[10px] text-slate-500">{batch.settlementChannel}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                          isCleared
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {isCleared ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isCleared ? "SARIE Settled" : "Clearing Escrow"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {!isCleared ? (
                        <button
                          onClick={() => onTriggerInstantSettlement(batch.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Trigger Instant SARIE
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 flex items-center justify-end gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Reconciled
                        </span>
                      )}
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
