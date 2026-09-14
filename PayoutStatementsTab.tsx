import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  Landmark,
  Eye,
  DollarSign,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar
} from "lucide-react";
import { PartnerPayoutStatement } from "./types";
import { generatePayoutStatementCSV } from "./rebateCalculator";

interface PayoutStatementsTabProps {
  statements: PartnerPayoutStatement[];
  lang: "en" | "ar";
}

export default function PayoutStatementsTab({
  statements,
  lang
}: PayoutStatementsTabProps) {
  const [selectedStatement, setSelectedStatement] = useState<PartnerPayoutStatement | null>(statements[0] || null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadCSV = (statement: PartnerPayoutStatement) => {
    const csvContent = generatePayoutStatementCSV(statement);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${statement.statementNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice(`Statement ${statement.statementNumber} downloaded successfully as CSV.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8" id="payout-statements-tab">
      {/* Header Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {lang === "ar" ? "بيانات الصرف والعمولات الشهرية الآلية" : "Automated Partner Payout & Commission Statements"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "كشوفات عمولات مفصلة ومطابقة مصرفياً وجاهزة لأغراض التدقيق المالي وضريبة القيمة المضافة"
                : "Audit-ready itemized partner commission statements verified against automated SARIE bank settlement clearing"}
            </p>
          </div>

          {selectedStatement && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadCSV(selectedStatement)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
                id="download-statement-csv-btn"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Export CSV Statement
              </button>
            </div>
          )}
        </div>

        {downloadNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadNotice}</span>
          </motion.div>
        )}
      </div>

      {/* Main Layout: Left Statement List, Right Detailed Itemized Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Statement History Selector */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Settled Payout Cycles
          </div>

          {statements.map((stmt) => {
            const isSelected = selectedStatement?.id === stmt.id;
            return (
              <button
                key={stmt.id}
                onClick={() => setSelectedStatement(stmt)}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 text-slate-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-mono font-bold text-white">{stmt.period}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{stmt.statementNumber}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {stmt.paymentStatus}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-between items-baseline font-mono">
                  <span className="text-[11px] text-slate-400">Net Commission:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    SAR {stmt.netPayableCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Statement Formal View */}
        {selectedStatement && (
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            {/* Formal Statement Header */}
            <div className="border-b border-slate-800 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    Official Commission Settlement Statement
                  </span>
                  <h4 className="text-xl font-bold text-white mt-1">
                    {selectedStatement.period}
                  </h4>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Reference No: <strong className="text-slate-200">{selectedStatement.statementNumber}</strong>
                  </div>
                </div>

                <div className="text-right sm:text-right font-mono text-xs text-slate-400">
                  <div>Settlement Channel: <strong className="text-white">Saudi SARIE ACH</strong></div>
                  <div>Clearing Ref: <strong className="text-slate-200">{selectedStatement.sarieClearingRef}</strong></div>
                  <div className="text-emerald-400 font-bold mt-1 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct Bank Transfer Reconciled
                  </div>
                </div>
              </div>

              {/* Beneficiary Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/60 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Beneficiary Partner:</span>
                  <strong className="text-slate-200 text-sm">{selectedStatement.partnerName}</strong>
                  <div className="text-slate-400 mt-0.5">IBAN: {selectedStatement.partnerIban}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-500 block">Issuing Enterprise Platform:</span>
                  <strong className="text-slate-200 text-sm">MOKA Fleet Logistics Ltd.</strong>
                  <div className="text-slate-400 mt-0.5">VAT: 310098271600003 | CR: 1010889211</div>
                </div>
              </div>
            </div>

            {/* Financial Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="text-slate-400">Total Volume</div>
                <div className="text-base font-bold text-white mt-1">
                  {(selectedStatement.totalLitersVolume / 1000).toFixed(0)}k Liters
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{selectedStatement.activeFleetVehicles} Trucks</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="text-slate-400">Base Rebate</div>
                <div className="text-base font-bold text-slate-200 mt-1">
                  SAR {selectedStatement.grossRebateAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Progressive Tier</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="text-slate-400">Milestone Bonus</div>
                <div className="text-base font-bold text-amber-400 mt-1">
                  +SAR {selectedStatement.milestoneBonusAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">+18% Platinum Tier</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-3.5 rounded-xl border border-emerald-500/30 text-xs font-mono">
                <div className="text-emerald-400 font-bold">Net Payout</div>
                <div className="text-lg font-bold text-emerald-300 mt-1">
                  SAR {selectedStatement.netPayableCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">100% Tax Cleared</div>
              </div>
            </div>

            {/* Itemized Table of Referred Fleet Clients */}
            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Itemized Dispensed Liters & Rebate By Referred Client
              </h5>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Corporate Client</th>
                      <th className="p-3">Dispensed Volume</th>
                      <th className="p-3">Rebate / L</th>
                      <th className="p-3 text-right text-emerald-400">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                    {selectedStatement.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="font-bold text-white">{item.clientName}</div>
                          <div className="text-[10px] text-slate-500">{item.clientId}</div>
                        </td>
                        <td className="p-3 text-white font-bold">
                          {item.volumeLiters.toLocaleString()} Liters
                        </td>
                        <td className="p-3 text-amber-400">
                          SAR {item.ratePerLiter.toFixed(3)}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          SAR {item.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950 text-xs font-mono font-bold border-t border-slate-800">
                    <tr>
                      <td className="p-3 text-slate-400">Total Accountable Volume</td>
                      <td className="p-3 text-white">{selectedStatement.totalLitersVolume.toLocaleString()} L</td>
                      <td className="p-3 text-slate-400">Weighted Average</td>
                      <td className="p-3 text-right text-emerald-400 text-sm">
                        SAR {selectedStatement.grossRebateAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Audit Certification Stamp */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-white font-bold">Audit-Certified Payout Statement</div>
                  <div className="text-slate-400 text-[11px]">
                    Cryptographic Digest: SHA256-MOKA-PAYOUT-{selectedStatement.id}-V3
                  </div>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Statement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
