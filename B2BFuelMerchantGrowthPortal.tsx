import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  TrendingUp,
  Fuel,
  Users,
  FileSpreadsheet,
  PenTool,
  ArrowLeft,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  Sparkles,
  Globe2
} from "lucide-react";
import {
  FuelMerchant,
  FuelGradePricing,
  StationTankMetric,
  DailySettlementBatch,
  CorporateClientReferral,
  PartnerPayoutStatement,
  DigitalB2BContract,
  FuelGradeCode
} from "./types";
import {
  mockMerchants,
  initialFuelPrices,
  mockStationTankMetrics,
  initialSettlementBatches,
  initialCorporateReferrals,
  initialPayoutStatements,
  initialContracts
} from "./mockData";
import MerchantDashboardTab from "./MerchantDashboardTab";
import PartnerGrowthTab from "./PartnerGrowthTab";
import PayoutStatementsTab from "./PayoutStatementsTab";
import DigitalContractSigningTab from "./DigitalContractSigningTab";

interface B2BFuelMerchantGrowthPortalProps {
  lang?: "en" | "ar";
  onBackToMain?: () => void;
}

export default function B2BFuelMerchantGrowthPortal({
  lang: initialLang = "en",
  onBackToMain
}: B2BFuelMerchantGrowthPortalProps) {
  const [lang, setLang] = useState<"en" | "ar">(initialLang);
  const [activeTab, setActiveTab] = useState<
    "merchant_dashboard" | "partner_growth" | "payout_statements" | "digital_contracts"
  >("merchant_dashboard");

  // Multi-vendor entities
  const [merchants] = useState<FuelMerchant[]>(mockMerchants);
  const [currentMerchant, setCurrentMerchant] = useState<FuelMerchant>(mockMerchants[0]);

  // Dynamic Fuel Pricing State
  const [fuelPrices, setFuelPrices] = useState<FuelGradePricing[]>(initialFuelPrices);

  // Station Capacity & Tank Telemetry State
  const [tankMetrics] = useState<StationTankMetric[]>(mockStationTankMetrics);

  // Daily Settlement Batches State
  const [settlementBatches, setSettlementBatches] = useState<DailySettlementBatch[]>(initialSettlementBatches);

  // Corporate Referrals State
  const [referrals, setReferrals] = useState<CorporateClientReferral[]>(initialCorporateReferrals);

  // Payout Statements State
  const [statements] = useState<PartnerPayoutStatement[]>(initialPayoutStatements);

  // Digital Contracts State
  const [contracts, setContracts] = useState<DigitalB2BContract[]>(initialContracts);

  // Handler for dynamic price modification
  const handleUpdatePrice = (grade: FuelGradeCode, newSpotPrice: number, newMargin: number) => {
    setFuelPrices(prev =>
      prev.map(p => {
        if (p.grade === grade) {
          return {
            ...p,
            spotPrice: newSpotPrice,
            merchantMargin: newMargin,
            lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 19)
          };
        }
        return p;
      })
    );
  };

  // Handler for instant SARIE bank settlement clearing
  const handleTriggerInstantSettlement = (batchId: string) => {
    setSettlementBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            status: "SETTLED_SARIE",
            bankReference: `SARIE-INSTANT-${Date.now().toString(36).toUpperCase()}`,
            completedAt: new Date().toISOString().replace("T", " ").slice(0, 19)
          };
        }
        return b;
      })
    );
  };

  // Handler for adding a new referred corporate fleet
  const handleAddReferral = (newReferral: CorporateClientReferral) => {
    setReferrals(prev => [newReferral, ...prev]);
  };

  // Handler for signing contracts cryptographically
  const handleSignContract = (
    contractId: string,
    signerName: string,
    signerRole: string,
    signatureData: string,
    hash: string
  ) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id === contractId) {
          return {
            ...c,
            signedByMerchant: true,
            merchantSignerName: signerName,
            merchantSignerRole: signerRole,
            merchantSignedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
            merchantSignatureData: signatureData,
            merchantSigningIp: "195.229.241.80 (Riyadh Corporate Gateway)",
            verificationHash: hash,
            contractStatus: "SIGNED_ACTIVE"
          };
        }
        return c;
      })
    );
  };

  const navTabs = [
    {
      id: "merchant_dashboard",
      labelEn: "Merchant Operations & Pricing",
      labelAr: "عمليات المحطات والتسعير",
      icon: Fuel,
      badge: `${tankMetrics.length} Tanks`
    },
    {
      id: "partner_growth",
      labelEn: "B2B Partner Growth & Referrals",
      labelAr: "نمو الشركاء وإحالة الشركات",
      icon: Users,
      badge: `${referrals.length} Clients`
    },
    {
      id: "payout_statements",
      labelEn: "Automated Payout Statements",
      labelAr: "كشوفات الصرف والعمولات",
      icon: FileSpreadsheet,
      badge: "SARIE T+1"
    },
    {
      id: "digital_contracts",
      labelEn: "Digital Contract Signing",
      labelAr: "توقيع العقود الرقمية",
      icon: PenTool,
      badge: contracts.some(c => c.contractStatus !== "SIGNED_ACTIVE") ? "Pending Action" : "All Signed"
    }
  ];

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 font-sans ${
        lang === "ar" ? "rtl text-right" : "ltr text-left"
      }`}
      id="b2b-fuel-merchant-growth-portal"
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                title={lang === "ar" ? "العودة للرئيسية" : "Back to Main Dashboard"}
                id="back-to-dashboard-btn"
              >
                <ArrowLeft className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-sm">
                  M
                </div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>MOKA Enterprise</span>
                  <span className="text-slate-500 font-normal">|</span>
                  <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                    {lang === "ar"
                      ? "بوابة التجار والنمو التجاري B2B"
                      : "B2B Fuel Merchant & Partner Growth Portal"}
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Multi-Vendor Fuel Ecosystem • Dynamic Spot Pricing • Automated SARIE Settlement • Volume Rebates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(l => (l === "en" ? "ar" : "en"))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
            >
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>

            {/* Live Telemetry Status Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SARIE ACH Cleared T+1</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Bar */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-2 py-3">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                <span>{lang === "ar" ? tab.labelAr : tab.labelEn}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "merchant_dashboard" && (
            <motion.div
              key="merchant_dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MerchantDashboardTab
                currentMerchant={currentMerchant}
                merchants={merchants}
                onSelectMerchant={setCurrentMerchant}
                fuelPrices={fuelPrices}
                onUpdatePrice={handleUpdatePrice}
                tankMetrics={tankMetrics}
                settlementBatches={settlementBatches}
                onTriggerInstantSettlement={handleTriggerInstantSettlement}
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === "partner_growth" && (
            <motion.div
              key="partner_growth"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PartnerGrowthTab
                currentMerchant={currentMerchant}
                referrals={referrals}
                onAddReferral={handleAddReferral}
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === "payout_statements" && (
            <motion.div
              key="payout_statements"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PayoutStatementsTab statements={statements} lang={lang} />
            </motion.div>
          )}

          {activeTab === "digital_contracts" && (
            <motion.div
              key="digital_contracts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DigitalContractSigningTab
                contracts={contracts}
                onSignContract={handleSignContract}
                lang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
