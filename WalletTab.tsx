import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownLeft, X, 
  Check, Percent, HelpCircle, FileText, Smartphone, DollarSign 
} from "lucide-react";

interface WalletTabProps {
  lang: "en" | "ar" | "sd";
  isOnline: boolean;
  speakText: (text: string) => void;
  transactions: Array<{ id: string; type: "fuel" | "expense" | "deposit"; details: string; amount: number; timestamp: string }>;
  onDeposit: (amount: number) => void;
}

const localization = {
  en: {
    cardTitle: "MOKA DIGITAL LOGISTICS WALLET",
    balanceSAR: "Saudi Arabian Riyal",
    balanceSDG: "Sudanese Pound Equivalent",
    quickActions: "TRANSIT PRE-PAYMENTS",
    addMoney: "SADAD / Mada Portal",
    recentTx: "TRANSACTION REGISTRY",
    typeFuel: "Fuel Auth",
    typeExpense: "Customs/Gate Fee",
    typeDeposit: "Bank Refill",
    addFundsTitle: "Secure SADAD Reload",
    addAmount: "Select Reload Amount",
    btnSubmit: "Authorize SADAD Transfer",
    successMsg: "Funds Transferred Successfully!",
    spendingTitle: "WEEKLY CORRIDOR EXPENSES",
    bClose: "Dismiss",
  },
  ar: {
    cardTitle: "محفظة موكا الرقمية اللوجستية",
    balanceSAR: "ريال سعودي",
    balanceSDG: "الجنيه السوداني (الافتراضي)",
    quickActions: "المدفوعات المسبقة للممر",
    addMoney: "بوابة سداد / مدى الآمنة",
    recentTx: "سجل حركات الحساب",
    typeFuel: "سحب وقود",
    typeExpense: "جمارك / بوابة الممر",
    typeDeposit: "إيداع بنكي",
    addFundsTitle: "شحن رصيد سداد الآمن",
    addAmount: "حدد المبلغ المطلوب شحنه",
    btnSubmit: "اعتماد وطلب الدفع عبر سداد",
    successMsg: "تم تعبئة المحفظة بنجاح!",
    spendingTitle: "مخطط النفقات الأسبوعية بالممر",
    bClose: "إغلاق النافذة",
  },
  sd: {
    cardTitle: "محفظة مُؤْكَا الرقمية للواري",
    balanceSAR: "ريال سعودي",
    balanceSDG: "الجنيه السوداني للجاز والرسوم",
    quickActions: "مدفوعات السفر السريعة",
    addMoney: "شحن المحفظة (سداد / مدى)",
    recentTx: "حركات الحساب والتحاويل",
    typeFuel: "تعبئة جاز",
    typeExpense: "رسوم عبور / تخليص",
    typeDeposit: "شحن رصيد محفظة",
    addFundsTitle: "تعبئة المحفظة عبر سداد",
    addAmount: "دخل القروش البتدور تشحنها",
    btnSubmit: "أبصم وأشحن طوالي",
    successMsg: "القروش نزلت في المحفظة تمام!",
    spendingTitle: "مخطط الصرفيات الأسبوعي",
    bClose: "إغلاق النافذة",
  }
};

const spendingStats = [
  { label: "Mon", sar: 420 },
  { label: "Tue", sar: 1150 },
  { label: "Wed", sar: 150 },
  { label: "Thu", sar: 890 },
  { label: "Fri", sar: 300 }
];

export default function WalletTab({
  lang,
  isOnline,
  speakText,
  transactions,
  onDeposit
}: WalletTabProps) {
  const t = localization[lang] || localization.en;
  const isRTL = lang === "ar" || lang === "sd";

  // Balance values in state, loaded from props dynamically
  const totalDepositSAR = transactions
    .filter(tx => tx.type === "deposit")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalSpentSAR = transactions
    .filter(tx => tx.type !== "deposit")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const baseSAR = 12500;
  const currentSAR = baseSAR + totalDepositSAR - totalSpentSAR;
  const currentSDG = currentSAR * 150; // Dynamic cross-border exchange rate

  const [reloadModal, setReloadModal] = useState(false);
  const [reloadAmount, setReloadAmount] = useState("500");
  const [reloadSuccess, setReloadSuccess] = useState(false);

  const handleOpenReload = () => {
    setReloadModal(true);
    setReloadSuccess(false);
    speakText("Opening secure SADAD payment loader. Choose reload denominations.");
  };

  const handleConfirmReload = () => {
    const amt = parseFloat(reloadAmount);
    if (isNaN(amt)) return;

    speakText(`Initiating SADAD transaction for ${amt} SAR. Securing Mada network node.`);
    setTimeout(() => {
      onDeposit(amt);
      setReloadSuccess(true);
      speakText(`SADAD transaction authorized. ${amt} SAR successfully added to your MOKA Wallet.`);
    }, 1500);
  };

  return (
    <div className="space-y-4 font-sans text-white text-left" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* 1. DUAL BALANCE CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        
        {/* Visa / Card holographic logo design */}
        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 pointer-events-none">
          <div className="w-5 h-5 rounded-full bg-orange-500" />
          <div className="w-5 h-5 rounded-full bg-amber-500 -ml-2.5" />
        </div>

        <div className="space-y-4">
          <div className="space-y-0.5">
            <span className="text-[7px] font-bold font-mono text-slate-500 tracking-widest uppercase">
              {t.cardTitle}
            </span>
            <div className="flex items-baseline gap-1 pt-1.5">
              <span className="text-xl font-extrabold text-white font-mono">{currentSAR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-orange-400 font-bold uppercase font-mono">SAR</span>
            </div>
            <span className="text-[9px] text-slate-500 font-sans block">{t.balanceSAR}</span>
          </div>

          <div className="border-t border-slate-900 pt-3 flex justify-between items-end">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold font-mono text-slate-300">{currentSDG.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-[8px] text-slate-400 font-mono">SDG</span>
              </div>
              <span className="text-[8px] text-slate-500 font-sans block">{t.balanceSDG}</span>
            </div>
            
            {/* Quick action add button */}
            <button
              onClick={handleOpenReload}
              className="px-2.5 py-1.5 bg-orange-500 text-slate-950 rounded-xl text-[9px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer hover:bg-orange-400 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>REFILL</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. SPENDING BAR CHART (CUSTOM DESIGN FOR 375PX VIEWPORT) */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2.5 shadow-md">
        <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
          {t.spendingTitle}
        </h5>

        <div className="flex justify-between items-end h-20 pt-2 px-1">
          {spendingStats.map((stat, idx) => {
            const heightPercentage = Math.min(100, Math.max(10, (stat.sar / 1200) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[7px] font-mono text-slate-500">{stat.sar} SAR</span>
                <div className="w-5 bg-slate-900 rounded-md h-12 relative overflow-hidden border border-slate-850">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-orange-600 to-orange-400 rounded-md"
                  />
                </div>
                <span className="text-[8px] font-mono text-slate-400 font-bold">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RECENT TRANSACTION HISTORY */}
      <div className="space-y-2">
        <h5 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">
          {t.recentTx}
        </h5>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {transactions.map((tx) => {
            const isDeposit = tx.type === "deposit";
            const iconColor = isDeposit ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10";
            return (
              <div 
                key={tx.id}
                className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 flex items-center justify-between font-mono text-[9px] hover:border-slate-850 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border border-slate-850 shrink-0 ${iconColor}`}>
                    {isDeposit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h6 className="text-slate-200 font-sans font-bold text-[10px] line-clamp-1">{tx.details}</h6>
                    <span className="text-[8px] text-slate-500">{tx.timestamp} • ID: {tx.id}</span>
                  </div>
                </div>

                <span className={`font-bold shrink-0 text-right ${isDeposit ? "text-emerald-400" : "text-slate-300"}`}>
                  {isDeposit ? "+" : "-"}{tx.amount.toFixed(2)} SAR
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. REFILL PORTAL MODAL */}
      <AnimatePresence>
        {reloadModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[30px] p-5 w-full max-w-[340px] shadow-2xl relative space-y-4 text-left text-white"
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              {/* Close button */}
              <button 
                onClick={() => {
                  setReloadModal(false);
                  speakText("Reload menu dismissed.");
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {!reloadSuccess ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold font-mono text-orange-400 uppercase tracking-widest">{t.addMoney}</span>
                    <h4 className="text-xs font-bold text-slate-100 font-sans">{t.addFundsTitle}</h4>
                  </div>

                  {/* Preloaded Choice Descriptors */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400">{t.addAmount}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["200", "500", "1000"].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            setReloadAmount(amt);
                            speakText(`Reload value set to ${amt} SAR.`);
                          }}
                          className={`py-2 px-1 border rounded-xl text-center font-mono text-xs font-bold transition-all cursor-pointer ${
                            reloadAmount === amt 
                              ? "bg-orange-500 text-slate-950 border-orange-500 shadow-md" 
                              : "bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800"
                          }`}
                        >
                          {amt} SAR
                        </button>
                      ))}
                    </div>

                    <div className="relative pt-1">
                      <input
                        type="number"
                        value={reloadAmount}
                        onChange={(e) => setReloadAmount(e.target.value)}
                        placeholder="Custom SAR Amount"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Trigger */}
                  <button
                    onClick={handleConfirmReload}
                    disabled={!reloadAmount}
                    className="w-full py-2.5 bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{t.btnSubmit}</span>
                  </button>
                </>
              ) : (
                /* SUCCESS SCREEN */
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{t.successMsg}</h4>
                    <p className="text-[10px] text-orange-400 font-mono font-bold">+{reloadAmount} SAR Added</p>
                  </div>

                  <button
                    onClick={() => {
                      setReloadModal(false);
                      speakText("Transaction finalized.");
                    }}
                    className="w-full py-2.5 bg-slate-950 border border-slate-800 text-white font-mono font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    {t.bClose}
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
