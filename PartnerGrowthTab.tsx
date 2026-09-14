import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Award,
  TrendingUp,
  Plus,
  Building2,
  CheckCircle2,
  Sparkles,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Fuel,
  Truck,
  ArrowUpRight,
  Calculator,
  Briefcase
} from "lucide-react";
import {
  CorporateClientReferral,
  DistributorVolumeRebateTier,
  FuelMerchant
} from "./types";
import { rebateTiers } from "./mockData";
import { calculateTierProgress, estimateCorporateRebate } from "./rebateCalculator";

interface PartnerGrowthTabProps {
  currentMerchant: FuelMerchant;
  referrals: CorporateClientReferral[];
  onAddReferral: (newReferral: CorporateClientReferral) => void;
  lang: "en" | "ar";
}

export default function PartnerGrowthTab({
  currentMerchant,
  referrals,
  onAddReferral,
  lang
}: PartnerGrowthTabProps) {
  // Modal for referring new corporate fleet
  const [showReferModal, setShowReferModal] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>("");
  const [newCommercialReg, setNewCommercialReg] = useState<string>("");
  const [newIndustry, setNewIndustry] = useState<string>("Heavy Logistics & Intercity Freight");
  const [newFleetSize, setNewFleetSize] = useState<number>(250);
  const [newAvgLiters, setNewAvgLiters] = useState<number>(1200);

  // Interactive Simulator States
  const [simFleetSize, setSimFleetSize] = useState<number>(600);
  const [simAvgLiters, setSimAvgLiters] = useState<number>(1400);

  // Calculate current monthly volume from referrals
  const totalMonthlyLiters = referrals.reduce((acc, r) => acc + r.monthlyVolumeLiters, 0);
  const totalFleetVehicles = referrals.reduce((acc, r) => acc + r.fleetSize, 0);
  const totalRebatesEarned = referrals.reduce((acc, r) => acc + r.monthlyRebateEarned, 0);

  const tierProgress = calculateTierProgress(totalMonthlyLiters);
  const currentTier = tierProgress.currentTier;
  const nextTier = tierProgress.nextTier;

  // Simulator calculations
  const simResult = estimateCorporateRebate(
    simFleetSize,
    simAvgLiters,
    currentTier.rebatePerLiter,
    currentTier.bonusPercentage
  );

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const monthlyLiters = newFleetSize * newAvgLiters;
    const rebate = Number((monthlyLiters * currentTier.rebatePerLiter).toFixed(2));

    const newRef: CorporateClientReferral = {
      id: `ref-client-${Date.now()}`,
      clientName: newClientName.trim(),
      commercialReg: newCommercialReg.trim() || `CR-1010${Math.floor(100000 + Math.random() * 900000)}`,
      industry: newIndustry,
      fleetSize: newFleetSize,
      acquiredDate: new Date().toISOString().split("T")[0],
      referrerPartnerId: currentMerchant.id,
      referrerTier: currentTier.tierId.replace("tier-", "").toUpperCase() as any,
      monthlyVolumeLiters: monthlyLiters,
      cumulativeLiters: monthlyLiters,
      status: "ACTIVE_DISPENSING",
      monthlyRebateEarned: rebate,
      contractTermMonths: 24,
      accountManager: "MOKA Senior Enterprise Partner"
    };

    onAddReferral(newRef);
    setShowReferModal(false);
    setNewClientName("");
    setNewCommercialReg("");
  };

  return (
    <div className="space-y-8" id="partner-growth-tab">
      {/* Top Banner: Multi-Tier Partner Commission Engine */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {lang === "ar" ? currentTier.tierNameAr : currentTier.tierName}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Current Rebate Rate: <strong className="text-amber-400 font-mono">SAR {currentTier.rebatePerLiter.toFixed(4)} / Liter</strong></span>
                  {currentTier.bonusPercentage > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                      +{currentTier.bonusPercentage}% Milestone Bonus
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-3 max-w-2xl leading-relaxed">
              {lang === "ar"
                ? "برنامج نمو الشركاء والموزعين الاستراتيجي: احصل على مكافآت خصم حجمي تراكمي على كل لتر وقود تستهلكه الأساطيل والشركات المحالة عبر شبكة موكا الموحدة."
                : "MOKA B2B Strategic Distributor Growth Program: Earn automated volume-based rebates on every liter dispensed to corporate fleet clients you onboard."}
            </p>
          </div>

          {/* Action to Onboard Corporate Client */}
          <button
            onClick={() => setShowReferModal(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            id="onboard-corporate-client-btn"
          >
            <Plus className="w-4 h-4" />
            {lang === "ar" ? "تسجيل أسطول تجاري جديد" : "Onboard Corporate Fleet"}
          </button>
        </div>

        {/* Multi-Tier Progress Track */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-3 gap-2">
            <span className="text-slate-400">
              Monthly Active Dispensed Volume: <strong className="text-white font-mono text-sm">{totalMonthlyLiters.toLocaleString()} L</strong>
            </span>
            {nextTier ? (
              <span className="text-amber-400 font-mono">
                {tierProgress.litersNeededForNextTier.toLocaleString()} Liters needed to unlock <strong>{nextTier.tierName} (SAR {nextTier.rebatePerLiter.toFixed(3)}/L)</strong>
              </span>
            ) : (
              <span className="text-emerald-400 font-mono font-bold">
                Max Tier Achieved: Platinum Strategic Distributor (5.0%)
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${tierProgress.progressPercentage}%` }}
            />
          </div>

          {/* Tiers Visual Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {rebateTiers.map((tier) => {
              const isCurrent = tier.tierId === currentTier.tierId;
              const isUnlocked = totalMonthlyLiters >= tier.minMonthlyLiters;

              return (
                <div
                  key={tier.tierId}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    isCurrent
                      ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10"
                      : isUnlocked
                      ? "bg-slate-900/60 border-slate-800 text-slate-300"
                      : "bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-[11px]">{tier.tierName}</span>
                    {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-amber-400 font-bold mt-1 text-sm">
                    SAR {tier.rebatePerLiter.toFixed(3)} <span className="text-[10px] text-slate-400">/L</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {tier.minMonthlyLiters.toLocaleString()} - {tier.maxMonthlyLiters > 5000000 ? "Max" : tier.maxMonthlyLiters.toLocaleString()} L
                  </div>
                  {tier.bonusPercentage > 0 && (
                    <div className="text-[9px] text-emerald-400 font-bold mt-0.5">
                      +{tier.bonusPercentage}% Milestone Bonus
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Acquired Enterprise Clients</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {referrals.length} <span className="text-xs text-slate-400 font-normal">Companies</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <Truck className="w-3.5 h-3.5" /> {totalFleetVehicles.toLocaleString()} Active Trucks
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Monthly Rebate Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            SAR {totalRebatesEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Direct SARIE Bank Settlement T+1
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cumulative Volume Handled</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {(referrals.reduce((acc, r) => acc + r.cumulativeLiters, 0) / 1000000).toFixed(2)}M <span className="text-xs text-slate-400 font-normal">Liters</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Across {currentMerchant.activeStationsCount} Forecourt Terminals
          </div>
        </div>
      </div>

      {/* SECTION: Corporate Client Acquisition Tracking Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {lang === "ar" ? "سجل الشركات والأساطيل المحالة والمكافآت" : "Corporate Client Acquisition & Dispensing Roster"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "تتبع استهلاك الأساطيل المحالة، أرقام السجلات التجارية، وحجم العمولات المستحقة شهرياً"
                : "Real-time consumption telemetry and monthly volume rebate generation per referred enterprise account"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Corporate Client</th>
                <th className="p-3.5">Industry / Fleet</th>
                <th className="p-3.5">Monthly Liters</th>
                <th className="p-3.5">Rebate Rate</th>
                <th className="p-3.5 text-emerald-400">Monthly Commission</th>
                <th className="p-3.5">Contract</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
              {referrals.map((client) => {
                const isActive = client.status === "ACTIVE_DISPENSING";
                return (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{client.clientName}</div>
                      <div className="text-[10px] text-slate-400">{client.commercialReg}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-300">{client.industry}</div>
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3" /> {client.fleetSize} Heavy Trucks
                      </div>
                    </td>
                    <td className="p-3.5 text-white font-bold">
                      {client.monthlyVolumeLiters.toLocaleString()} L
                      <div className="text-[10px] text-slate-500">
                        {(client.cumulativeLiters / 1000000).toFixed(2)}M cumulative
                      </div>
                    </td>
                    <td className="p-3.5 text-amber-400">
                      SAR {currentTier.rebatePerLiter.toFixed(3)} /L
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400 text-sm">
                      SAR {client.monthlyRebateEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      <div>{client.contractTermMonths} Months</div>
                      <div className="text-[10px] text-slate-500">Since {client.acquiredDate}</div>
                    </td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {isActive ? "Active Dispensing" : "Pilot Test"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: Volume-Based Rebate Simulator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">
            {lang === "ar" ? "حاسبة أرباح الخصم الحجمي للأساطيل المتوقعة" : "Fleet Distributor Volume Rebate & Commission Simulator"}
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          {lang === "ar"
            ? "محاكاة العوائد التقديرية عند إحالة أساطيل نقل جديدة وحساب المكافآت التراكمية السنوية"
            : "Estimate projected earnings when onboarding new logistics fleets based on vehicle count and consumption"}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Fleet Size (Vehicles):</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{simFleetSize} Vehicles</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={simFleetSize}
                onChange={(e) => setSimFleetSize(parseInt(e.target.value))}
                className="w-full mt-2 accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>50</span>
                <span>1,250</span>
                <span>2,500</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Monthly Fuel Consumption per Truck (Liters):</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{simAvgLiters} Liters</span>
              </div>
              <input
                type="range"
                min="400"
                max="3000"
                step="100"
                value={simAvgLiters}
                onChange={(e) => setSimAvgLiters(parseInt(e.target.value))}
                className="w-full mt-2 accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>400 L (Local Last-Mile)</span>
                <span>1,500 L (Intercity)</span>
                <span>3,000 L (Heavy Haulage)</span>
              </div>
            </div>
          </div>

          {/* Result Projection Box */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Projected Monthly Volume:</span>
                <span className="text-white font-bold">{simResult.monthlyVolume.toLocaleString()} Liters</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Base Rebate Rate:</span>
                <span className="text-amber-400 font-bold">SAR {currentTier.rebatePerLiter.toFixed(3)} /L</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Base Monthly Commission:</span>
                <span className="text-white font-bold">SAR {simResult.baseRebate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {simResult.bonusAmount > 0 && (
                <div className="flex justify-between pb-2 border-b border-slate-800 text-emerald-400">
                  <span>+{currentTier.bonusPercentage}% Milestone Incentive:</span>
                  <span className="font-bold">+SAR {simResult.bonusAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-slate-300">Total Monthly Earnings:</span>
                <span className="text-emerald-400">SAR {simResult.totalEstimatedRebate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Projected Annual Return:</span>
                <span className="text-amber-300 font-bold">SAR {(simResult.totalEstimatedRebate * 12).toLocaleString('en-US', { minimumFractionDigits: 2 })} / yr</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Earnings automatically reconciled and cleared via Saudi SARIE ACH network every month.</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Onboard Corporate Client */}
      <AnimatePresence>
        {showReferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <h4 className="text-base font-bold text-white">
                    {lang === "ar" ? "تسجيل أسطول تجاري تحت مظلة الشريك" : "Onboard Corporate Fleet Client"}
                  </h4>
                </div>
                <button
                  onClick={() => setShowReferModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateReferral} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-300 block mb-1">Corporate Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Fahad Intercity Transport Group"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Commercial Reg (CR)</label>
                    <input
                      type="text"
                      placeholder="e.g. CR-1010992812"
                      value={newCommercialReg}
                      onChange={(e) => setNewCommercialReg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Industry Sector</label>
                    <select
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Heavy Logistics & Intercity Freight">Heavy Logistics & Intercity Freight</option>
                      <option value="Food & Cold Chain Distribution">Food & Cold Chain Distribution</option>
                      <option value="Construction & Ready-Mix Concrete">Construction & Ready-Mix Concrete</option>
                      <option value="E-Commerce Express Courier">E-Commerce Express Courier</option>
                      <option value="Cross-Border Transit Overland">Cross-Border Transit Overland</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Fleet Vehicle Count</label>
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      value={newFleetSize}
                      onChange={(e) => setNewFleetSize(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Est. Liters / Truck / Mo</label>
                    <input
                      type="number"
                      min="100"
                      max="5000"
                      value={newAvgLiters}
                      onChange={(e) => setNewAvgLiters(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Instant Projected Rebate Preview */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Est. Monthly Fuel Volume:</span>
                    <strong className="text-white">{(newFleetSize * newAvgLiters).toLocaleString()} Liters</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable Partner Rebate:</span>
                    <strong className="text-amber-400">SAR {currentTier.rebatePerLiter.toFixed(3)} / L</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 text-sm font-bold">
                    <span>Projected Monthly Commission:</span>
                    <span className="text-emerald-400">SAR {(newFleetSize * newAvgLiters * currentTier.rebatePerLiter).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReferModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Register & Activate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
